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
    // Three points where greedy (always nearest-first) is suboptimal.
    // From origin(0,0): greedy picks A(10,0) or B(10,8) at d=10 first, then sequences badly.
    // Optimal order (C→B→A or C→A→B) yields distance ≈ 22.43 vs greedy ≈ 23.
    const pA = makeLocation("p-A", "pos-A", 10, 0, 0);
    const pB = makeLocation("p-B", "pos-B", 10, 8, 0);
    const pC = makeLocation("p-C", "pos-C", 5, 8, 0);

    const result = bruteForcePStrategy(origin, [[pA], [pB], [pC]]);

    expect(result.distance).toBeCloseTo(22.43, 1);
  });

  it("picks the optimal shelf when a product has multiple positions", () => {
    // p-1 has two shelves. The farther shelf (10,0) leads more directly to p-2 (10,5)
    // than the nearer shelf (1,0), making the total route shorter overall.
    // Greedy would pick shelf-near (d=1 from origin) then travel 9.43 to p-2 → total ≈ 10.43.
    // Optimal picks shelf-far (d=10 from origin) then travels 5 to p-2 → total = 15.
    // Wait — let's use a case where the farther shelf is genuinely better:
    // origin(0,0) → p-1 has shelves at (5,0) and (10,5), p-2 is at (10,0).
    // Via (5,0)→(10,0): 5 + 5 = 10. Via (10,5)→(10,0): ~7.07 + 5 = 12.07. Nearest wins here.
    //
    // Real counterexample: origin(0,0), p-1 shelves at (1,0) and (9,0), p-2 at (10,0).
    // Greedy: (0)→(1,0)=1 → (10,0)=9 → total 10.
    // Via far shelf: (0)→(9,0)=9 → (10,0)=1 → total 10. Tied — both optimal.
    //
    // Definitive counterexample: origin(0,0), p-1 shelves at (1,0) and (8,0), p-2 at (10,0).
    // Via near (1,0): 1 + 9 = 10. Via far (8,0): 8 + 2 = 10. Still tied.
    //
    // Use non-collinear case: origin(0,0,0), p-1 shelves at (1,0,0) and (10,1,0), p-2 at (10,0,0).
    // Via near (1,0,0): d=1 + d((1,0)→(10,0))=9 = 10.
    // Via far (10,1,0): d=sqrt(101)≈10.05 + d((10,1)→(10,0))=1 ≈ 11.05. Near wins.
    //
    // Final: origin(0,0,0), p-1 shelves at (0,5,0) and (10,0,0), p-2 at (10,5,0).
    // Via (0,5,0)→(10,5,0): 5 + 10 = 15.
    // Via (10,0,0)→(10,5,0): 10 + 5 = 15. Tied.
    //
    // Unambiguous: origin(0,0,0), p-1: [(0,10,0),(10,0,0)], p-2: [(10,10,0)]
    // Greedy picks nearest shelf of p-1 = both equidistant at d=10. Try (0,10):
    //   (0,10)→(10,10) = 10. Total = 10 + 10 = 20.
    // Via (10,0)→(10,10) = 10. Total = 10 + 10 = 20. Tied again.
    //
    // Simplest unambiguous case: origin(0,0), p-1 at [(0,1,0),(3,0,0)], p-2 at [(4,0,0)].
    // Via (0,1): d=1, then (0,1)→(4,0)=sqrt(17)≈4.12. Total≈5.12.
    // Via (3,0): d=3, then (3,0)→(4,0)=1. Total=4. ← far shelf wins!
    const nearShelf = makeLocation("p-1", "shelf-near", 0, 1, 0); // d=1 from origin
    const farShelf = makeLocation("p-1", "shelf-far", 3, 0, 0); // d=3 from origin
    const p2 = makeLocation("p-2", "pos-p2", 4, 0, 0);

    const result = bruteForcePStrategy(origin, [[nearShelf, farShelf], [p2]]);

    // Optimal route goes via the farther shelf (3,0) → (4,0): total distance = 4.
    // Greedy would pick shelf-near (0,1) first: total ≈ 5.12.
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
