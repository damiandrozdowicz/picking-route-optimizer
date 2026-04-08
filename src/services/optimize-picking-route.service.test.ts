import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  optimizePickingRouteService,
  NoStockError,
} from "./optimize-picking-route.service";
import { config } from "../config";
import { Position, WarehousePosition, OptimizationResponse } from "../types";

const startingPosition: Position = { x: 0, y: 0, z: 0 };
const products = ["product-1", "product-2"];

const inStockLocations: WarehousePosition[][] = [
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
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(config.provider, "getProductsPositions").mockResolvedValue(
      inStockLocations,
    );
  });

  it("returns the result from the strategy", async () => {
    const strategy = vi.fn().mockReturnValue(stubResult);

    const result = await optimizePickingRouteService.optimizePickingRoute(
      products,
      startingPosition,
      strategy,
    );

    expect(result).toEqual(stubResult);
  });

  it("calls the strategy with startingPosition and in-stock locations", async () => {
    const strategy = vi.fn().mockReturnValue(stubResult);

    await optimizePickingRouteService.optimizePickingRoute(
      products,
      startingPosition,
      strategy,
    );

    expect(strategy).toHaveBeenCalledWith(startingPosition, inStockLocations);
  });

  it("uses config.optimizationStrategy when no strategy is provided", async () => {
    const result = await optimizePickingRouteService.optimizePickingRoute(
      products,
      startingPosition,
    );

    expect(result).toHaveProperty("distance");
    expect(result).toHaveProperty("pickingOrder");
    expect(Array.isArray(result.pickingOrder)).toBe(true);
  });

  it("filters out zero-quantity shelves before calling the strategy", async () => {
    const mixedLocations: WarehousePosition[][] = [
      [
        {
          positionId: "pos-out",
          productId: "product-1",
          quantity: 0,
          x: 0,
          y: 0,
          z: 0,
        },
        {
          positionId: "pos-in",
          productId: "product-1",
          quantity: 2,
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
    vi.spyOn(config.provider, "getProductsPositions").mockResolvedValue(
      mixedLocations,
    );
    const strategy = vi.fn().mockReturnValue(stubResult);

    await optimizePickingRouteService.optimizePickingRoute(
      products,
      startingPosition,
      strategy,
    );

    const passedLocations = strategy.mock.calls[0][1] as WarehousePosition[][];
    expect(passedLocations[0]).toHaveLength(1);
    expect(passedLocations[0][0].positionId).toBe("pos-in");
  });

  it("throws NoStockError when a product has no in-stock positions", async () => {
    vi.spyOn(config.provider, "getProductsPositions").mockResolvedValue([
      [
        {
          positionId: "pos-1",
          productId: "product-1",
          quantity: 0,
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
    ]);

    await expect(
      optimizePickingRouteService.optimizePickingRoute(
        products,
        startingPosition,
      ),
    ).rejects.toBeInstanceOf(NoStockError);
  });

  it("throws NoStockError naming the out-of-stock product", async () => {
    vi.spyOn(config.provider, "getProductsPositions").mockResolvedValue([
      [
        {
          positionId: "pos-1",
          productId: "product-1",
          quantity: 0,
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
    ]);

    await expect(
      optimizePickingRouteService.optimizePickingRoute(
        products,
        startingPosition,
      ),
    ).rejects.toThrow("product-1");
  });
});
