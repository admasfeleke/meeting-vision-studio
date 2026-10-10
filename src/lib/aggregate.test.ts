import { describe, expect, it } from 'vitest';
import { aggregateGlobalMetrics } from './aggregate';
import { emptyMetrics } from './analysis';
import type { VisionSource } from './types';

function source(overrides: Partial<VisionSource> = {}): VisionSource {
  return {
    id: 's1',
    kind: 'camera',
    label: 'Camera 1',
    status: 'running',
    metrics: { ...emptyMetrics(), attention: 80, interaction: 40, emailScore: 20 },
    detections: [],
    events: [],
    ...overrides,
  };
}

describe('aggregateGlobalMetrics', () => {
  it('returns zeroed averages when nothing has been measured', () => {
    const metrics = aggregateGlobalMetrics([source()], 0);
    expect(metrics.attention).toBe(0);
    expect(metrics.people).toBe(0);
    expect(metrics.active).toBe(1);
  });

  it('averages only sources that have been analyzed', () => {
    const analyzed = source({
      id: 'a',
      metrics: { ...emptyMetrics(), attention: 60, people: 2, lastAnalyzedAt: 1 },
    });
    const idle = source({ id: 'b', metrics: { ...emptyMetrics(), attention: 100 } });
    const metrics = aggregateGlobalMetrics([analyzed, idle], 0);
    expect(metrics.attention).toBe(60);
    expect(metrics.people).toBe(2);
  });

  it('unions policy hits across sources', () => {
    const a = source({
      id: 'a',
      metrics: { ...emptyMetrics(), policyHits: ['phone'], lastAnalyzedAt: 1 },
    });
    const b = source({
      id: 'b',
      metrics: { ...emptyMetrics(), policyHits: ['phone', 'book'], lastAnalyzedAt: 1 },
    });
    const metrics = aggregateGlobalMetrics([a, b], 0);
    expect(metrics.policyHits.sort()).toEqual(['book', 'phone']);
  });

  it('counts active running sources', () => {
    const metrics = aggregateGlobalMetrics(
      [source({ status: 'running' }), source({ id: 's2', status: 'ended' })],
      0,
    );
    expect(metrics.active).toBe(1);
    expect(metrics.sources).toBe(2);
  });
});
