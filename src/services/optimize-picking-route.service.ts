import { WarehousePosition, Position, OptimizationResponse, OptimizationStrategy } from "../types";
import { config } from "../config";

/** Thrown when a product has no in-stock shelf positions after quantity filtering. */
export class NoStockError extends Error {
  constructor(public readonly productId: string) {
    super(`No warehouse positions found for product "${productId}".`);
    this.name = "NoStockError";
  }
}

/**
 * Fetches warehouse positions for the requested products, filters out
 * zero-quantity shelves, validates every product has at least one pickable
 * location, then runs the configured optimization strategy.
 */
async function optimizePickingRoute(
  products: string[],
  startingPosition: Position,
  strategy: OptimizationStrategy = config.optimizationStrategy,
): Promise<OptimizationResponse> {
  const rawLocations = await config.provider.getProductsPositions(products);
  const inStockLocations = filterOutOfStock(rawLocations);
  validateStock(products, inStockLocations);
  return strategy(startingPosition, inStockLocations);
}

/** Removes shelves with quantity ≤ 0 from every product's location list. */
function filterOutOfStock(
  productLocations: WarehousePosition[][],
): WarehousePosition[][] {
  return productLocations.map((locs) => locs.filter((loc) => loc.quantity > 0));
}

/**
 * Throws {@link NoStockError} if any product has no pickable shelf after
 * filtering, identifying the first offending product by name.
 */
function validateStock(
  products: string[],
  inStockLocations: WarehousePosition[][],
): void {
  const emptyIndex = inStockLocations.findIndex((locs) => locs.length === 0);
  if (emptyIndex !== -1) {
    throw new NoStockError(products[emptyIndex]);
  }
}

export const optimizePickingRouteService = {
  optimizePickingRoute,
};
