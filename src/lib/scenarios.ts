import type { ScenarioConfig, ScenarioKey } from './types';

export const scenarios: Record<ScenarioKey, ScenarioConfig> = {
  classroom: {
    label: 'Classroom',
    description: 'Teacher-student interaction and attention rating.',
    attentionLabel: 'Class attention',
    policyLabel: 'Policy objects',
    defaultPolicyObjects: ['phone', 'headphones'],
  },
  exam: {
    label: 'Exam',
    description: 'Local-first policy object and desk monitoring.',
    attentionLabel: 'Integrity signal',
    policyLabel: 'Forbidden objects',
    defaultPolicyObjects: ['phone', 'book', 'laptop', 'headphones'],
  },
  lab: {
    label: 'Lab Safety',
    description: 'Workshop safety and workstation awareness.',
    attentionLabel: 'Safety focus',
    policyLabel: 'Unsafe objects',
    defaultPolicyObjects: ['mug/cup', 'knife', 'scissors'],
  },
  presentation: {
    label: 'Presentation Coach',
    description: 'Presenter focus, pacing, and audience signal.',
    attentionLabel: 'Audience focus',
    policyLabel: 'Distractors',
    defaultPolicyObjects: ['phone', 'mug/cup'],
  },
  meeting: {
    label: 'Meeting',
    description: 'Multi-camera meeting engagement with playful labels.',
    attentionLabel: 'Engagement',
    policyLabel: 'Distractors',
    defaultPolicyObjects: ['phone', 'mug/cup'],
  },
};

export const scenarioOrder: ScenarioKey[] = ['classroom', 'exam', 'lab', 'presentation', 'meeting'];

/**
 * Normalized object names a user can flag as policy objects. Names are matched
 * against `normalizeClassName` output (see metrics.ts), not raw COCO classes.
 */
export const policyObjectOptions: string[] = [
  'phone',
  'headphones',
  'mug/cup',
  'book',
  'laptop',
  'keyboard',
  'mouse',
  'knife',
  'scissors',
  'bottle',
];
