import { useEffect, useRef } from 'react';
import { Sparkles, Square } from 'lucide-react';
import type { LayerKey, VisionSource } from '../lib/types';
import { normalizeClassName } from '../lib/analysis';

export function SourceTile({
  source,
  selected,
  layers,
  onRegisterVideo,
  onSelect,
  onRename,
  onStop,
}: {
  source: VisionSource;
  selected: boolean;
  layers: Record<LayerKey, boolean>;
  onRegisterVideo: (sourceId: string, video: HTMLVideoElement | null) => void;
  onSelect: () => void;
  onRename: (label: string) => void;
  onStop: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && source.stream) {
      videoRef.current.srcObject = source.stream;
    }
    onRegisterVideo(source.id, videoRef.current);

    return () => onRegisterVideo(source.id, null);
  }, [onRegisterVideo, source.id, source.stream]);

  const videoWidth = videoRef.current?.videoWidth || 1;
  const videoHeight = videoRef.current?.videoHeight || 1;

  return (
    <article className={`source-tile ${selected ? 'selected' : ''}`} onClick={onSelect}>
      <div className="video-frame">
        {source.status === 'error' ? (
          <div className="video-message">
            <Square size={34} />
            <p>{source.error}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={source.url}
            autoPlay
            muted
            playsInline
            loop={source.kind === 'upload'}
          />
        )}

        {source.status === 'running'
          ? source.detections.map((detection) => {
              const [x, y, width, height] = detection.bbox;
              const isPerson = detection.className === 'person';
              const showBox = (isPerson && layers.people) || (!isPerson && layers.objects);

              if (!showBox) {
                return null;
              }

              return (
                <div
                  className={`object-box ${isPerson ? 'person-box' : ''}`}
                  key={`${detection.className}-${x}-${y}`}
                  style={{
                    left: `${(x / videoWidth) * 100}%`,
                    top: `${(y / videoHeight) * 100}%`,
                    width: `${(width / videoWidth) * 100}%`,
                    height: `${(height / videoHeight) * 100}%`,
                  }}
                >
                  <span>
                    {normalizeClassName(detection.className)} {Math.round(detection.score * 100)}%
                  </span>
                </div>
              );
            })
          : null}
        {source.status === 'running' && layers.humor ? (
          <div className="humor-chip">
            <Sparkles size={15} />
            {source.metrics.emailScore > 58 ? 'Could be an email' : 'Studio signal clean'}
          </div>
        ) : null}
      </div>

      <div className="tile-footer">
        <div>
          <input
            className="source-name-input"
            value={source.label}
            aria-label={`Rename ${source.label}`}
            onChange={(event) => onRename(event.target.value)}
            onClick={(event) => event.stopPropagation()}
          />
          <p>{source.fileName ?? source.kind}</p>
        </div>
        <span className={`status-dot ${source.status}`}>{source.status}</span>
      </div>

      <div className="tile-metrics">
        <span>{source.metrics.attention}% attention</span>
        <span>{source.metrics.fps} fps</span>
        <span>{source.metrics.latencyMs} ms</span>
        <button
          className="stop-button"
          onClick={(event) => {
            event.stopPropagation();
            onStop();
          }}
        >
          Stop
        </button>
      </div>
    </article>
  );
}
