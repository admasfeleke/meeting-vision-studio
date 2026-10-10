import type { GlobalMetrics, VisionSource } from './types';

/**
 * Aggregate per-source metrics into a session-level summary. Only sources that
 * have actually been analyzed at least once contribute to averaged values, so
 * we never divide by idle/starting sources.
 */
export function aggregateGlobalMetrics(
  sources: VisionSource[],
  eventsCount: number,
): GlobalMetrics {
  const measured = sources.filter((source) => source.metrics.lastAnalyzedAt !== undefined);
  const active = sources.filter((source) => source.status === 'running').length;
  const people = measured.reduce((sum, source) => sum + source.metrics.people, 0);

  const average = (pick: (source: VisionSource) => number): number =>
    measured.length === 0
      ? 0
      : Math.round(measured.reduce((sum, source) => sum + pick(source), 0) / measured.length);

  const policyHits = Array.from(new Set(measured.flatMap((source) => source.metrics.policyHits)));

  return {
    sources: sources.length,
    active,
    people,
    attention: average((source) => source.metrics.attention),
    interaction: average((source) => source.metrics.interaction),
    policyHits,
    emailScore: average((source) => source.metrics.emailScore),
    events: eventsCount,
  };
}
