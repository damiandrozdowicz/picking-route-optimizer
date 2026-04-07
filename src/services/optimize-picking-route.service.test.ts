import { describe, it, expect, vi } from "vitest";
import { optimizePickingRouteService } from "./optimize-picking-route.service";
import { Position, WarehousePosition, OptimizationResponse } from "../types";

const startingPosition: Position = { x: 0, y: 0, z: 0 };

const productLocations: WarehousePosition[][] = [
  [
    {
      positionId: "pos-1",
      productId: "product-1",
      quantity: 1,
      x: 1,
      y: 0,
      z: 0,
    },
  ],
  [
    {
      positionId: "pos-2",
      productId: "product-2",
      quantity: 1,
      x: 2,
      y: 0,
      z: 0,
    },
  ],
];

const stubResult: OptimizationResponse = {
  distance: 3,
  pickingOrder: [
    { step: 1, productId: "product-1", positionId: "pos-1" },
    { step: 2, productId: "product-2", positionId: "pos-2" },
  ],
};

describe("optimizePickingRouteService", () => {
  it("returns the result from the strategy", () => {
    const strategy = vi.fn().mockReturnValue(stubResult);

    const result = optimizePickingRouteService.optimizePickingRoute(
      startingPosition,
      productLocations,
      strategy,
    );

    expect(result).toEqual(stubResult);
  });

  it("calls the strategy with startingPosition and productLocations", () => {
    const strategy = vi.fn().mockReturnValue(stubResult);

    optimizePickingRouteService.optimizePickingRoute(
      startingPosition,
      productLocations,
      strategy,
    );

    expect(strategy).toHaveBeenCalledWith(startingPosition, productLocations);
  });

  it("uses config.optimizationStrategy when no strategy is provided", () => {
    const result = optimizePickingRouteService.optimizePickingRoute(
      startingPosition,
      productLocations,
    );

    expect(result).toHaveProperty("distance");
    expect(result).toHaveProperty("pickingOrder");
    expect(Array.isArray(result.pickingOrder)).toBe(true);
  });
});
