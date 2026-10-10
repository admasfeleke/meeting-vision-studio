import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { emptyMetrics, eventLabelFromDetections, metricsFromDetections } from '../lib/analysis';
import { captureSnapshot, createEvent } from '../lib/events';
import { aggregateGlobalMetrics } from '../lib/aggregate';
import { buildReport, downloadReport } from '../lib/report';
import { scenarios } from '../lib/scenarios';
import type {
  CocoModel,
  Detection,
  GlobalMetrics,
  LayerKey,
  ScenarioKey,
  VisionSource,
} from '../lib/types';

const initialLayers: Record<LayerKey, boolean> = {
  people: true,
  objects: true,
  attention: true,
  humor: true,
};

const MIN_FRAME_GAP_MS = 250;

export type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Owns all studio state and the real detection loop, exposing a small action
 * API to the presentational layer. Keeps App.tsx free of business logic.
 */
export function useVisionStudio() {
  const [sources, setSources] = useState<VisionSource[]>([]);
  const [events, setEvents] = useState<VisionSource['events']>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [layers, setLayers] = useState(initialLayers);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scenario, setScenario] = useState<ScenarioKey>('classroom');
  const [policyObjects, setPolicyObjects] = useState<string[]>(
    scenarios.classroom.defaultPolicyObjects,
  );
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [modelStatus, setModelStatus] = useState<ModelStatus>('idle');

  const sourceVideosRef = useRef(new Map<string, HTMLVideoElement>());
  const sourcesRef = useRef<VisionSource[]>([]);
  const modelRef = useRef<CocoModel | null>(null);

  const activeSources = useMemo(
    () => sources.filter((source) => source.status === 'running'),
    [sources],
  );
  const selectedSource = sources.find((source) => source.id === selectedSourceId) ?? sources[0];
  const activeScenario = scenarios[scenario];
  const globalMetrics: GlobalMetrics = useMemo(
    () => aggregateGlobalMetrics(sources, events.length),
    [sources, events.length],
  );

  useEffect(() => {
    sourcesRef.current = sources;
  }, [sources]);

  useEffect(() => {
    navigator.mediaDevices
      ?.enumerateDevices()
      .then((devices) => setCameraDevices(devices.filter((device) => device.kind === 'videoinput')))
      .catch(() => setCameraDevices([]));
  }, []);

  // Stop all camera tracks and release object URLs on unmount.
  useEffect(() => {
    return () => {
      sourcesRef.current.forEach((source) => {
        source.stream?.getTracks().forEach((track) => track.stop());
        if (source.url) {
          URL.revokeObjectURL(source.url);
        }
      });
    };
  }, []);

  const toggleLayer = useCallback((key: LayerKey) => {
    setLayers((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const changeScenario = useCallback((nextScenario: ScenarioKey) => {
    setScenario(nextScenario);
    setPolicyObjects(scenarios[nextScenario].defaultPolicyObjects);
  }, []);

  const togglePolicyObject = useCallback((object: string) => {
    setPolicyObjects((current) =>
      current.includes(object)
        ? current.filter((currentObject) => currentObject !== object)
        : [...current, object],
    );
  }, []);

  const registerVideo = useCallback((sourceId: string, video: HTMLVideoElement | null) => {
    if (video) {
      sourceVideosRef.current.set(sourceId, video);
      return;
    }
    sourceVideosRef.current.delete(sourceId);
  }, []);

  const renameSource = useCallback((sourceId: string, label: string) => {
    setSources((current) =>
      current.map((source) => (source.id === sourceId ? { ...source, label } : source)),
    );
  }, []);

  // Real detection loop: lazily loads the model once, then samples every active
  // source on a self-scheduling cadence. FPS and latency are measured, never
  // hardcoded. The loop re-subscribes when the set of active sources changes.
  useEffect(() => {
    if (!isAnalyzing || activeSources.length === 0) {
      return;
    }

    let cancelled = false;

    async function ensureModel(): Promise<CocoModel | null> {
      if (modelRef.current) {
        return modelRef.current;
      }

      setModelStatus('loading');
      const [tf, cocoSsd] = await Promise.all([
        import('@tensorflow/tfjs'),
        import('@tensorflow-models/coco-ssd'),
      ]);
      await tf.ready;
      const model = (await cocoSsd.load()) as unknown as CocoModel;
      modelRef.current = model;
      setModelStatus('ready');
      return model;
    }

    async function analyzeSource(model: CocoModel, source: VisionSource) {
      const video = sourceVideosRef.current.get(source.id);
      if (
        !video ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        video.videoWidth === 0
      ) {
        return;
      }

      const startedAt = performance.now();
      const predictions = await model.detect(video);
      const latencyMs = performance.now() - startedAt;

      const detections: Detection[] = predictions
        .filter((prediction) => prediction.score >= 0.48)
        .slice(0, 8)
        .map((prediction) => ({
          className: prediction.class,
          score: prediction.score,
          bbox: prediction.bbox as [number, number, number, number],
        }));

      const { label, type, confidence } = eventLabelFromDetections(
        detections,
        scenario,
        policyObjects,
      );
      const snapshot = detections.length > 0 ? captureSnapshot(video) : undefined;
      const event =
        detections.length > 0 ? createEvent(source, type, label, confidence, snapshot) : undefined;

      setSources((current) =>
        current.map((currentSource) =>
          currentSource.id === source.id
            ? {
                ...currentSource,
                detections,
                metrics: metricsFromDetections(
                  detections,
                  currentSource.metrics,
                  policyObjects,
                  latencyMs,
                ),
                events: event
                  ? [event, ...currentSource.events].slice(0, 12)
                  : currentSource.events,
              }
            : currentSource,
        ),
      );

      if (event) {
        setEvents((current) => [event, ...current].slice(0, 36));
      }
    }

    async function loop() {
      try {
        const model = await ensureModel();
        if (!model || cancelled) {
          return;
        }

        while (!cancelled) {
          const runningSources = sourcesRef.current.filter((source) => source.status === 'running');

          if (runningSources.length === 0) {
            break;
          }

          await Promise.all(runningSources.map((source) => analyzeSource(model, source)));
          await new Promise((resolve) => setTimeout(resolve, MIN_FRAME_GAP_MS));
        }
      } catch {
        setModelStatus('error');
      }
    }

    void loop();

    return () => {
      cancelled = true;
    };
  }, [isAnalyzing, activeSources.length, policyObjects, scenario]);

  async function addCamera() {
    const id = `camera-${Date.now()}`;
    const sourceNumber = sources.filter((source) => source.kind === 'camera').length + 1;
    const pendingSource: VisionSource = {
      id,
      kind: 'camera',
      label: sourceNumber === 1 ? 'Presenter Camera' : `Camera ${sourceNumber}`,
      status: 'starting',
      metrics: emptyMetrics(),
      detections: [],
      events: [],
    };

    setSources((current) => [...current, pendingSource]);
    setSelectedSourceId(id);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          ...(selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : {}),
        },
        audio: false,
      });
      const event = createEvent(pendingSource, 'system', 'Camera connected', 100);
      const devices = await navigator.mediaDevices.enumerateDevices();

      setSources((current) =>
        current.map((source) =>
          source.id === id ? { ...source, stream, status: 'running', events: [event] } : source,
        ),
      );
      setCameraDevices(devices.filter((device) => device.kind === 'videoinput'));
      setEvents((current) => [event, ...current]);
      setIsAnalyzing(true);
    } catch (error) {
      setSources((current) =>
        current.map((source) =>
          source.id === id
            ? {
                ...source,
                status: 'error',
                error: error instanceof Error ? error.message : 'Camera permission was denied.',
              }
            : source,
        ),
      );
    }
  }

  function addUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const id = `upload-${Date.now()}`;
    const url = URL.createObjectURL(file);
    const uploadSource: VisionSource = {
      id,
      kind: 'upload',
      label: 'Uploaded Clip',
      status: 'running',
      url,
      fileName: file.name,
      metrics: emptyMetrics(),
      detections: [],
      events: [],
    };
    const systemEvent = createEvent(uploadSource, 'system', 'Uploaded video ready', 100);

    setSources((current) => [...current, { ...uploadSource, events: [systemEvent] }]);
    setEvents((current) => [systemEvent, ...current]);
    setSelectedSourceId(id);
    setIsAnalyzing(true);
    event.target.value = '';
  }

  function stopSource(sourceId: string) {
    setSources((current) =>
      current.map((source) => {
        if (source.id !== sourceId) {
          return source;
        }

        source.stream?.getTracks().forEach((track) => track.stop());
        return { ...source, status: 'ended' };
      }),
    );
  }

  function resetSession() {
    sources.forEach((source) => source.stream?.getTracks().forEach((track) => track.stop()));
    sources.forEach((source) => {
      if (source.url) {
        URL.revokeObjectURL(source.url);
      }
    });
    setSources([]);
    setEvents([]);
    setSelectedSourceId(null);
    setIsAnalyzing(false);
  }

  function exportReport() {
    downloadReport(buildReport(globalMetrics, sources, events));
  }

  return {
    sources,
    events,
    layers,
    scenario,
    activeScenario,
    policyObjects,
    cameraDevices,
    selectedDeviceId,
    modelStatus,
    isAnalyzing,
    activeSources,
    selectedSource,
    globalMetrics,
    setSelectedDeviceId,
    setIsAnalyzing,
    toggleLayer,
    changeScenario,
    togglePolicyObject,
    registerVideo,
    renameSource,
    addCamera,
    addUpload,
    stopSource,
    resetSession,
    exportReport,
    setSelectedSourceId,
  };
}
