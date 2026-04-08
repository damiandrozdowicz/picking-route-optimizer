import { describe, it, expect } from "vitest";
import { bruteForcePStrategy } from "./brute-force.strategy";
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

describe("bruteForcePStrategy", () => {
  it("returns empty pickingOrder and zero distance for no products", () => {
    const result = bruteForcePStrategy(origin, []);

    expect(result.pickingOrder).toEqual([]);
    expect(result.distance).toBe(0);
  });

  it("picks a single product and returns correct distance", () => {
    const location = makeLocation("p-1", "pos-1", 3, 4, 0);
    const result = bruteForcePStrategy(origin, [[location]]);

    expect(result.pickingOrder).toHaveLength(1);
    expect(result.pickingOrder[0].productId).toBe("p-1");
    // distance from (0,0,0) to (3,4,0) = 5 (3-4-5 triangle)
    expect(result.distance).toBeCloseTo(5);
  });

  it("assigns sequential step numbers starting from 1", () => {
    const locations = [
      [makeLocation("p-1", "pos-1", 1, 0, 0)],
      [makeLocation("p-2", "pos-2", 2, 0, 0)],
      [makeLocation("p-3", "pos-3", 3, 0, 0)],
    ];

    const result = bruteForcePStrategy(origin, locations);

    expect(result.pickingOrder.map((s) => s.step)).toEqual([1, 2, 3]);
  });

  it("finds the globally optimal route, not just the greedy one", () => {
    const pA = makeLocation("p-A", "pos-A", 10, 0, 0);
    const pB = makeLocation("p-B", "pos-B", 10, 8, 0);
    const pC = makeLocation("p-C", "pos-C", 5, 8, 0);

    const result = bruteForcePStrategy(origin, [[pA], [pB], [pC]]);

    expect(result.distance).toBeCloseTo(22.43, 1);
  });

  it("picks the optimal shelf when a product has multiple positions", () => {
    const nearShelf = makeLocation("p-1", "shelf-near", 0, 1, 0); // d=1 from origin
    const farShelf = makeLocation("p-1", "shelf-far", 3, 0, 0); // d=3 from origin
    const p2 = makeLocation("p-2", "pos-p2", 4, 0, 0);

    const result = bruteForcePStrategy(origin, [[nearShelf, farShelf], [p2]]);

    expect(result.distance).toBeCloseTo(4, 1);
    expect(result.pickingOrder[0].positionId).toBe("shelf-far");
  });

  it("rounds distance to 2 decimal places", () => {
    const location = makeLocation("p-1", "pos-1", 1, 1, 1);
    const result = bruteForcePStrategy(origin, [[location]]);

    const decimalPlaces = result.distance.toString().split(".")[1]?.length ?? 0;
    expect(decimalPlaces).toBeLessThanOrEqual(2);
  });
});
