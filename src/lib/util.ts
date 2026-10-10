/** Clamp a number into an inclusive [min, max] range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Round a 0..1 score into a 0..100 percentage integer. */
export function toPercent(score: number): number {
  return Math.round(clamp(score, 0, 1) * 100);
}
