import { clamp } from './util';
import type { StudioEvent, StudioEventType, VisionSource } from './types';

/** Build a fully-formed studio event for a source. */
export function createEvent(
  source: Pick<VisionSource, 'id' | 'label'>,
  type: StudioEventType,
  label: string,
  confidence: number,
  snapshot?: string,
): StudioEvent {
  return {
    id: `${source.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sourceId: source.id,
    sourceLabel: source.label,
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    type,
    label,
    confidence: Math.round(clamp(confidence, 0, 100)),
    snapshot,
  };
}

/** Grab a downscaled JPEG data URL of the current video frame, if ready. */
export function captureSnapshot(video: HTMLVideoElement): string | undefined {
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    return undefined;
  }

  const width = 360;
  const height = Math.round((video.videoHeight / video.videoWidth) * width);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    return undefined;
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(video, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', 0.72);
}
