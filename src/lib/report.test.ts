import { describe, expect, it } from 'vitest';
import { buildReport } from './report';
import { emptyMetrics } from './analysis';
import type { GlobalMetrics, StudioEvent, VisionSource } from './types';

const summary: GlobalMetrics = {
  sources: 1,
  active: 1,
  people: 1,
  attention: 70,
  interaction: 30,
  policyHits: [],
  emailScore: 25,
  events: 1,
};

const stream = { getTracks: () => [] } as unknown as MediaStream;

const source: VisionSource = {
  id: 's1',
  kind: 'camera',
  label: 'Camera 1',
  status: 'running',
  stream,
  metrics: emptyMetrics(),
  detections: [],
  events: [],
};

const event: StudioEvent = {
  id: 'e1',
  sourceId: 's1',
  sourceLabel: 'Camera 1',
  timestamp: '10:00:00',
  type: 'system',
  label: 'Camera connected',
  confidence: 100,
};

describe('buildReport', () => {
  it('strips non-serializable MediaStream from sources', () => {
    const report = buildReport(summary, [source], [event], new Date('2024-01-01T00:00:00Z'));
    expect(report.sources[0]).not.toHaveProperty('stream');
  });

  it('uses an injected date for deterministic output', () => {
    const report = buildReport(summary, [source], [event], new Date('2024-01-01T00:00:00Z'));
    expect(report.generatedAt).toBe('2024-01-01T00:00:00.000Z');
  });

  it('includes the summary and events verbatim', () => {
    const report = buildReport(summary, [source], [event], new Date());
    expect(report.summary).toEqual(summary);
    expect(report.events).toEqual([event]);
  });

  it('produces JSON-serializable output', () => {
    const report = buildReport(summary, [source], [event], new Date());
    expect(() => JSON.stringify(report)).not.toThrow();
  });
});
