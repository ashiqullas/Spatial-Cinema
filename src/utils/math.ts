/**
 * Utility functions for 3D math and interpolation
 */

// Linearly interpolate between two values
export const lerp = (start: number, end: number, t: number): number => {
  return start * (1 - t) + end * t;
};

// Clamp a value between a minimum and maximum
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

// Map a value from one range to another
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};
