import { describe, it, expect } from "vitest";
import { findClosestLocation } from "./nearest-neighbour.strategy.util";
import { Position, WarehousePosition } from "../../types";

const origin: Position = { x: 0, y: 0, z: 0 };

function makeLocation(
  productId: string,
  positionId: string,
  x: number,
  y: number,
  z: number,
): WarehousePosition {
  return { productId, positionId, quantity: 1, x, y, z };
}

describe("findClosestLocation", () => {
  it("returns null when remaining is empty", () => {
    expect(findClosestLocation(origin, [])).toBeNull();
  });

  it("returns the only location when there is one product with one position", () => {
    const location = makeLocation("p-1", "pos-1", 1, 0, 0);
    const result = findClosestLocation(origin, [[location]]);

    expect(result).not.toBeNull();
    expect(result!.location).toEqual(location);
    expect(result!.productIndex).toBe(0);
  });

  it("picks the closest location across multiple products", () => {
    const far = makeLocation("p-1", "pos-far", 10, 0, 0);
    const close = makeLocation("p-2", "pos-close", 1, 0, 0);

    const result = findClosestLocation(origin, [[far], [close]]);

    expect(result!.location).toEqual(close);
    expect(result!.productIndex).toBe(1);
  });

  it("picks the closest position when one product has multiple positions", () => {
    const nearPosition = makeLocation("p-1", "pos-near", 2, 0, 0);
    const farPosition = makeLocation("p-1", "pos-far", 10, 0, 0);

    const result = findClosestLocation(origin, [[farPosition, nearPosition]]);

    expect(result!.location).toEqual(nearPosition);
  });

  it("returns the correct distance to the closest location", () => {
    const location = makeLocation("p-1", "pos-1", 3, 4, 0);
    const result = findClosestLocation(origin, [[location]]);

    // distance from (0,0,0) to (3,4,0) = sqrt(9+16+0) = 5
    expect(result!.distance).toBeCloseTo(5);
  });
});
