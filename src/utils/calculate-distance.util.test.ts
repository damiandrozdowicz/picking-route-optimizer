import { describe, expect, it } from "vitest";
import { Position } from "../types";
import { calculateDistance } from "./calculate-distance.util";

describe("calculateDistance", () => {
  it("calculates the correct distance between two points in 3D space", () => {
    const pointA: Position = { x: 1, y: 2, z: 3 };
    const pointB: Position = { x: 4, y: 6, z: 8 };

    const distance = calculateDistance(pointA, pointB);
    const expectedDistance = Math.sqrt(
      (4 - 1) ** 2 + (6 - 2) ** 2 + (8 - 3) ** 2,
    );
    expect(distance).toBeCloseTo(expectedDistance);
  });

  it("returns 0 when both points are the same", () => {
    const pointA: Position = { x: 1, y: 2, z: 3 };
    const pointB: Position = { x: 1, y: 2, z: 3 };

    const distance = calculateDistance(pointA, pointB);

    expect(distance).toBe(0);
  });

  it("handles negative coordinates correctly", () => {
    const pointA: Position = { x: -1, y: -2, z: -3 };
    const pointB: Position = { x: -4, y: -6, z: -8 };

    const distance = calculateDistance(pointA, pointB);

    const expectedDistance = Math.sqrt(
      (-4 + 1) ** 2 + (-6 + 2) ** 2 + (-8 + 3) ** 2,
    );
    expect(distance).toBeCloseTo(expectedDistance);
  });

  it("handles points with zero coordinates", () => {
    const pointA: Position = { x: 0, y: 0, z: 0 };
    const pointB: Position = { x: 3, y: 4, z: 0 };

    const distance = calculateDistance(pointA, pointB);

    const expectedDistance = Math.sqrt(3 ** 2 + 4 ** 2 + 0 ** 2);
    expect(distance).toBeCloseTo(expectedDistance);
  });
});
