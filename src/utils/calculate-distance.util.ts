import { Position } from "../types";

/**
 * Calculates the Euclidean distance between two points in 3D space.
 * Formula: d = √((x₂-x₁)² + (y₂-y₁)² + (z₂-z₁)²)
 */
export function calculateDistance(a: Position, b: Position): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2);
}
