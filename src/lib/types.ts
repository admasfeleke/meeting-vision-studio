export type SourceKind = 'camera' | 'upload';
export type SourceStatus = 'idle' | 'starting' | 'running' | 'paused' | 'ended' | 'error';
export type LayerKey = 'people' | 'objects' | 'attention' | 'humor';
export type ScenarioKey = 'classroom' | 'exam' | 'lab' | 'presentation' | 'meeting';

export type Detection = {
  className: string;
  score: number;
  bbox: [number, number, number, number];
};

/** Minimal shape of the COCO-SSD model we depend on. */
export type CocoModel = {
  detect: (
    video: HTMLVideoElement,
  ) => Promise<Array<{ bbox: number[]; class: string; score: number }>>;
};

export type StudioEventType = 'attention' | 'object' | 'gesture' | 'system' | 'humor';

export type StudioEvent = {
  id: string;
  sourceId: string;
  sourceLabel: string;
  timestamp: string;
  type: StudioEventType;
  label: string;
  confidence: number;
  snapshot?: string;
};

export type SourceMetrics = {
  people: number;
  attention: number;
  interaction: number;
  policyHits: string[];
  objects: string[];
  emailScore: number;
  /** Smoothed detection throughput (detections per second), measured, not assumed. */
  fps: number;
  /** Real per-frame inference latency in milliseconds. */
  latencyMs: number;
  lastAnalyzedAt?: number;
};

export type VisionSource = {
  id: string;
  kind: SourceKind;
  label: string;
  status: SourceStatus;
  stream?: MediaStream;
  url?: string;
  fileName?: string;
  metrics: SourceMetrics;
  detections: Detection[];
  events: StudioEvent[];
  error?: string;
};

export type ScenarioConfig = {
  label: string;
  description: string;
  attentionLabel: string;
  policyLabel: string;
  defaultPolicyObjects: string[];
};

export type GlobalMetrics = {
  sources: number;
  active: number;
  people: number;
  attention: number;
  interaction: number;
  policyHits: string[];
  emailScore: number;
  events: number;
};
