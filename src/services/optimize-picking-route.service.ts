import { WarehousePosition, Position, OptimizationResponse } from "../types";
import { config } from "../config";

function optimizePickingRoute(
  startingPosition: Position,
  productLocations: WarehousePosition[][],
  strategy: (
    startingPosition: Position,
    productLocations: WarehousePosition[][],
  ) => OptimizationResponse = config.optimizationStrategy,
): OptimizationResponse {
  return strategy(startingPosition, productLocations);
}

export const optimizePickingRouteService = {
  optimizePickingRoute,
};
