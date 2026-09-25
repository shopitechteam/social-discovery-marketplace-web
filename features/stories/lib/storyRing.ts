/** A watched story's arc — quiet, but still counts. */
export const SEEN_RING_COLOR = "rgb(var(--color-text-muted) / 0.4)";
export const UNSEEN_RING_COLOR = "rgb(var(--brand-primary))";

/**
 * Where each story's arc sits on a WhatsApp-style ring: one per story,
 * clockwise from 12 o'clock in play order, a gap between each. A single story
 * is one unbroken ring. Lengths are along the ring, in the SVG's own units.
 */
export function ringSegments(
  count: number,
  circumference: number,
  maxGap: number,
): { arc: number; rotation: number }[] {
  if (count <= 1) return [{ arc: circumference, rotation: -90 }];
  const gap = Math.min(maxGap, (circumference / count) * 0.3);
  const arc = circumference / count - gap;
  return Array.from({ length: count }, (_, i) => ({
    arc,
    rotation: -90 + (360 / count) * i + (gap / 2 / circumference) * 360,
  }));
}
