import { describe, expect, it } from 'vitest';
import {
  emptyMetrics,
  eventLabelFromDetections,
  metricsFromDetections,
  normalizeClassName,
} from './analysis';
import type { Detection, SourceMetrics } from './types';

function detection(className: string, score = 0.9): Detection {
  return { className, score, bbox: [0, 0, 10, 10] };
}

function previousMetrics(): SourceMetrics {
  return emptyMetrics();
}

describe('normalizeClassName', () => {
  it('maps COCO cell phone to phone', () => {
    expect(normalizeClassName('cell phone')).toBe('phone');
  });

  it('maps COCO cup to mug/cup', () => {
    expect(normalizeClassName('cup')).toBe('mug/cup');
  });

  it('passes through unrelated classes unchanged', () => {
    expect(normalizeClassName('laptop')).toBe('laptop');
  });
});

describe('metricsFromDetections', () => {
  it('counts people separately from objects', () => {
    const metrics = metricsFromDetections(
      [detection('person'), detection('person'), detection('laptop')],
      previousMetrics(),
      [],
      40,
    );
    expect(metrics.people).toBe(2);
    expect(metrics.objects).toEqual(['laptop']);
  });

  it('records the real inference latency', () => {
    const metrics = metricsFromDetections([detection('person')], previousMetrics(), [], 137);
    expect(metrics.latencyMs).toBe(137);
  });

  it('deduplicates repeated objects', () => {
    const metrics = metricsFromDetections(
      [detection('cup'), detection('cup'), detection('cell phone')],
      previousMetrics(),
      [],
      30,
    );
    expect(metrics.objects.sort()).toEqual(['mug/cup', 'phone']);
  });

  it('flags policy hits only for configured policy objects', () => {
    const metrics = metricsFromDetections(
      [detection('cell phone'), detection('laptop')],
      previousMetrics(),
      ['phone'],
      30,
    );
    expect(metrics.policyHits).toEqual(['phone']);
  });

  it('keeps attention within the documented 16..98 band', () => {
    const heavy = metricsFromDetections(
      [
        detection('person'),
        detection('cell phone'),
        detection('cup'),
        detection('laptop'),
        detection('book'),
      ],
      previousMetrics(),
      ['phone'],
      30,
    );
    expect(heavy.attention).toBeGreaterThanOrEqual(16);
    expect(heavy.attention).toBeLessThanOrEqual(98);
  });

  it('does not fabricate fps when there is no prior sample', () => {
    const metrics = metricsFromDetections([detection('person')], previousMetrics(), [], 30);
    expect(metrics.fps).toBe(0);
  });

  it('computes a positive fps once a prior timestamp exists', () => {
    const previous = { ...previousMetrics(), fps: 0, lastAnalyzedAt: performance.now() - 200 };
    const metrics = metricsFromDetections([detection('person')], previous, [], 30);
    expect(metrics.fps).toBeGreaterThan(0);
  });
});

describe('eventLabelFromDetections', () => {
  it('reports an exam-mode policy hit with the exam wording', () => {
    const result = eventLabelFromDetections([detection('cell phone', 0.77)], 'exam', ['phone']);
    expect(result.type).toBe('object');
    expect(result.label).toBe('phone detected during exam mode');
    expect(result.confidence).toBe(77);
  });

  it('reports a lab safety policy hit with lab wording', () => {
    const result = eventLabelFromDetections([detection('cup', 0.8)], 'lab', ['mug/cup']);
    expect(result.label).toBe('mug/cup requires safety review');
  });

  it('is deterministic: identical frames produce identical events', () => {
    const frame = [detection('person'), detection('person'), detection('laptop')];
    const a = eventLabelFromDetections(frame, 'meeting', ['phone']);
    const b = eventLabelFromDetections(frame, 'meeting', ['phone']);
    expect(a).toEqual(b);
  });

  it('detects multiple people as a group attention cluster', () => {
    const result = eventLabelFromDetections(
      [detection('person'), detection('person'), detection('person')],
      'meeting',
      ['phone'],
    );
    expect(result.type).toBe('attention');
    expect(result.label).toBe('Group attention cluster detected');
  });

  it('stays quiet on an empty frame instead of inventing humor', () => {
    const result = eventLabelFromDetections([], 'meeting', ['phone']);
    expect(result.label).toBe('Frame clear');
  });

  it('derives confidence from the strongest matching detection', () => {
    const result = eventLabelFromDetections(
      [detection('cell phone', 0.61), detection('person', 0.99)],
      'meeting',
      ['phone'],
    );
    expect(result.confidence).toBe(61);
  });
});
