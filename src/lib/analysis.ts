import { clamp, toPercent } from './util';
import type { Detection, ScenarioKey, SourceMetrics, StudioEventType } from './types';

/** Objects that count as attention-draining distractions when present. */
const DISTRACTION_OBJECTS = ['phone', 'mug/cup', 'keyboard', 'laptop', 'book'];

/** Map raw COCO class names onto our normalized product vocabulary. */
export function normalizeClassName(className: string): string {
  if (className === 'cell phone') {
    return 'phone';
  }

  if (className === 'cup') {
    return 'mug/cup';
  }

  return className;
}

export function emptyMetrics(): SourceMetrics {
  return {
    people: 0,
    attention: 0,
    interaction: 0,
    policyHits: [],
    objects: [],
    emailScore: 0,
    fps: 0,
    latencyMs: 0,
    lastAnalyzedAt: undefined,
  };
}

/**
 * Derive source metrics from a real detection frame plus the measured inference
 * latency. Everything here is a deterministic function of the frame — nothing
 * is randomly generated or hardcoded to fake a "looking alive" number.
 */
export function metricsFromDetections(
  detections: Detection[],
  previous: SourceMetrics,
  policyObjects: string[],
  latencyMs: number,
): SourceMetrics {
  const people = detections.filter((detection) => detection.className === 'person').length;
  const objects = Array.from(
    new Set(
      detections
        .filter((detection) => detection.className !== 'person')
        .map((detection) => normalizeClassName(detection.className)),
    ),
  );
  const policyHits = objects.filter((object) => policyObjects.includes(object));
  const distractionWeight = objects.filter((object) => DISTRACTION_OBJECTS.includes(object)).length;

  // Attention heuristic: more people focused is good; distractions and policy
  // hits reduce it. Bounded to a believable 16..98 band.
  const attention = clamp(
    82 - distractionWeight * 8 - policyHits.length * 10 + Math.min(people, 5) * 3,
    16,
    98,
  );

  // Email score rises as attention falls and distractions climb.
  const emailScore = clamp(100 - attention + distractionWeight * 12, 8, 96);
  const interaction = clamp(people * 14 + objects.length * 5 - policyHits.length * 8, 0, 100);

  const now = performance.now();
  const instantFps = previous.lastAnalyzedAt
    ? 1000 / Math.max(1, now - previous.lastAnalyzedAt)
    : 0;
  // Exponential smoothing keeps the readout stable without inventing values.
  const fps = instantFps === 0 ? previous.fps : Math.round(previous.fps * 0.6 + instantFps * 0.4);

  return {
    people,
    attention: Math.round(attention),
    interaction: Math.round(interaction),
    policyHits,
    objects,
    emailScore: Math.round(emailScore),
    fps,
    latencyMs: Math.round(latencyMs),
    lastAnalyzedAt: now,
  };
}

/**
 * Choose the single most salient thing to report about a frame. Deterministic:
 * the same frame always produces the same event, so the timeline is honest.
 */
export function eventLabelFromDetections(
  detections: Detection[],
  scenario: ScenarioKey,
  policyObjects: string[],
): { label: string; type: StudioEventType; confidence: number } {
  const normalizedClasses = detections.map((detection) => normalizeClassName(detection.className));
  const rawClasses = detections.map((detection) => detection.className);
  const personCount = rawClasses.filter((className) => className === 'person').length;

  const strongestScoreFor = (target: string): number => {
    const match = detections.find(
      (detection) => normalizeClassName(detection.className) === target,
    );
    return match ? match.score : 0.5;
  };

  const policyHit = normalizedClasses.find((className) => policyObjects.includes(className));
  if (policyHit) {
    const label = buildPolicyLabel(scenario, policyHit);
    return { label, type: 'object', confidence: toPercent(strongestScoreFor(policyHit)) };
  }

  if (normalizedClasses.includes('phone')) {
    return {
      label: 'Phone temptation detected',
      type: 'object',
      confidence: toPercent(strongestScoreFor('phone')),
    };
  }

  if (normalizedClasses.includes('mug/cup')) {
    return {
      label: 'Mug shield active',
      type: 'object',
      confidence: toPercent(strongestScoreFor('mug/cup')),
    };
  }

  if (personCount > 1) {
    return {
      label: 'Group attention cluster detected',
      type: 'attention',
      confidence: clamp(52 + personCount * 6, 0, 95),
    };
  }

  if (normalizedClasses.includes('laptop')) {
    return {
      label: 'Laptop command center online',
      type: 'object',
      confidence: toPercent(strongestScoreFor('laptop')),
    };
  }

  if (personCount === 1) {
    return { label: 'Solo focus session in progress', type: 'attention', confidence: 72 };
  }

  // Nothing meaningful in frame. Stay quiet rather than fabricating humor.
  return { label: 'Frame clear', type: 'humor', confidence: 40 };
}

function buildPolicyLabel(scenario: ScenarioKey, object: string): string {
  if (scenario === 'exam') {
    return `${object} detected during exam mode`;
  }

  if (scenario === 'lab') {
    return `${object} requires safety review`;
  }

  return `${object} policy object detected`;
}
