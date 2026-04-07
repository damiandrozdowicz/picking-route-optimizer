import { describe, expect, it } from "vitest";
import { dynamicProgrammingStrategy } from "./dynamic-programming.strategy";
import { Position, WarehousePosition } from "../../types";

const origin: Position = { x: 0, y: 0, z: 0 };

function makeLocation(
  productId: string,
  positionId: string,
  x: number,
  y: number,
  z: number,
  quantity = 1,
): WarehousePosition {
  return { productId, positionId, quantity, x, y, z };
}

describe("dynamicProgrammingStrategy", () => {
  it("returns empty pickingOrder and zero distance for no products", () => {
    const result = dynamicProgrammingStrategy(origin, []);

    expect(result).toEqual({ distance: 0, pickingOrder: [] });
  });

  it("finds the globally optimal route across both order and shelf choice", () => {
    const locations = [
      [
        makeLocation("p-A", "A1", 0, 7, 0),
        makeLocation("p-A", "A2", 3, 9, 0),
      ],
      [
        makeLocation("p-B", "B1", 8, 7, 0),
        makeLocation("p-B", "B2", 8, 0, 0),
      ],
      [
        makeLocation("p-C", "C1", 2, 4, 0),
        makeLocation("p-C", "C2", 9, 4, 0),
      ],
    ];

    const result = dynamicProgrammingStrategy(origin, locations);

    expect(result.distance).toBeCloseTo(14.96, 2);
    expect(result.pickingOrder.map((step) => step.positionId)).toEqual([
      "C1",
      "A2",
      "B1",
    ]);
  });

  it("prefers in-stock positions when a closer shelf is empty", () => {
    const result = dynamicProgrammingStrategy(origin, [
      [
        makeLocation("p-1", "empty", 1, 0, 0, 0),
        makeLocation("p-1", "stocked", 10, 0, 0, 5),
      ],
    ]);

    expect(result.pickingOrder[0].positionId).toBe("stocked");
    expect(result.distance).toBe(10);
  });

  it("assigns sequential step numbers after reconstruction", () => {
    const result = dynamicProgrammingStrategy(origin, [
      [makeLocation("p-1", "pos-1", 1, 0, 0)],
      [makeLocation("p-2", "pos-2", 2, 0, 0)],
      [makeLocation("p-3", "pos-3", 3, 0, 0)],
    ]);

    expect(result.pickingOrder.map((step) => step.step)).toEqual([1, 2, 3]);
  });

  it("rounds distance to 2 decimal places", () => {
    const result = dynamicProgrammingStrategy(origin, [
      [makeLocation("p-1", "pos-1", 1, 1, 1)],
    ]);

    const decimalPlaces = result.distance.toString().split(".")[1]?.length ?? 0;
    expect(decimalPlaces).toBeLessThanOrEqual(2);
  });
});
