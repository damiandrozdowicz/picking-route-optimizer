import { describe, it, expect } from "vitest";
import { nearestNeighborStrategy } from "./nearest-neighbour.strategy";
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

describe("nearestNeighborStrategy", () => {
  it("returns empty pickingOrder and zero distance for no products", () => {
    const result = nearestNeighborStrategy(origin, []);

    expect(result.pickingOrder).toEqual([]);
    expect(result.distance).toBe(0);
  });

  it("picks a single product and returns correct distance", () => {
    const location = makeLocation("p-1", "pos-1", 3, 4, 0);
    const result = nearestNeighborStrategy(origin, [[location]]);

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

    const result = nearestNeighborStrategy(origin, locations);

    expect(result.pickingOrder.map((s) => s.step)).toEqual([1, 2, 3]);
  });

  it("always picks the closest product next (greedy order)", () => {
    // p-far is listed first but p-close is physically nearer
    const pFar = makeLocation("p-far", "pos-far", 100, 0, 0);
    const pClose = makeLocation("p-close", "pos-close", 1, 0, 0);

    const result = nearestNeighborStrategy(origin, [[pFar], [pClose]]);

    expect(result.pickingOrder[0].productId).toBe("p-close");
    expect(result.pickingOrder[1].productId).toBe("p-far");
  });

  it("picks the nearest shelf when a product has multiple locations", () => {
    const nearShelf = makeLocation("p-1", "shelf-near", 1, 0, 0);
    const farShelf = makeLocation("p-1", "shelf-far", 50, 0, 0);

    const result = nearestNeighborStrategy(origin, [[farShelf, nearShelf]]);

    expect(result.pickingOrder[0].positionId).toBe("shelf-near");
  });

  it("accumulates total distance across all steps", () => {
    // Step 1: origin → (1,0,0) = distance 1
    // Step 2: (1,0,0) → (4,0,0) = distance 3
    // Total = 4
    const p1 = makeLocation("p-1", "pos-1", 1, 0, 0);
    const p2 = makeLocation("p-2", "pos-2", 4, 0, 0);

    const result = nearestNeighborStrategy(origin, [[p1], [p2]]);

    expect(result.distance).toBeCloseTo(4);
  });

  it("rounds totalDistance to 2 decimal places", () => {
    const location = makeLocation("p-1", "pos-1", 1, 1, 1);
    const result = nearestNeighborStrategy(origin, [[location]]);

    const decimalPlaces = result.distance.toString().split(".")[1]?.length ?? 0;
    expect(decimalPlaces).toBeLessThanOrEqual(2);
  });
});
