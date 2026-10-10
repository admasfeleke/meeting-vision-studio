import type { GlobalMetrics, StudioEvent, VisionSource } from './types';

export type SessionReport = {
  generatedAt: string;
  summary: GlobalMetrics;
  sources: Array<Omit<VisionSource, 'stream'>>;
  events: StudioEvent[];
};

/** Assemble a serializable session report. Pure and side-effect free. */
export function buildReport(
  globalMetrics: GlobalMetrics,
  sources: VisionSource[],
  events: StudioEvent[],
  now: Date = new Date(),
): SessionReport {
  return {
    generatedAt: now.toISOString(),
    summary: globalMetrics,
    sources: sources.map(({ stream: _stream, ...rest }) => rest),
    events,
  };
}

/** Trigger a browser download of the report as JSON. */
export function downloadReport(
  report: SessionReport,
  fileName = 'meeting-vision-report.json',
): void {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
