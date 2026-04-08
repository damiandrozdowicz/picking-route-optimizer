import { PickingStep, Position, WarehousePosition } from "../../types";
import { toPickingStep } from "../../utils/to-picking-step.util";
import { findClosestLocation } from "./nearest-neighbour.strategy.util";

/**
 * Maximum products this strategy can handle.
 * O(n² × m) scales well — no hard ceiling, but accuracy degrades vs exact solvers.
 */
export const maxProducts = Infinity;

/**
 * Greedy nearest-neighbor heuristic.
 * At each step picks the closest unvisited product, and for that product picks
 * the shelf nearest to the current position.
 *
 * Both decisions are locally greedy: neither visit order nor shelf selection is
 * globally optimal. Swap in dynamicProgrammingStrategy (the default) for exact results.
 *
 * O(n² × m) where n = products, m = positions per product.
 * Swap this in via config.optimizationStrategy for large orders where
 * speed matters more than optimality.
 */
export const nearestNeighborStrategy = (
  startingPosition: Position,
  productLocations: WarehousePosition[][],
) => {
  let currentPosition: Position = startingPosition;
  let totalDistance = 0;
  const pickingOrder: PickingStep[] = [];
  const remaining = [...productLocations];

  while (remaining.length > 0) {
    const closest = findClosestLocation(currentPosition, remaining);
    if (closest === null) break;

    pickingOrder.push(toPickingStep(closest.location, pickingOrder.length + 1));
    currentPosition = closest.location;
    totalDistance += closest.distance;
    remaining.splice(closest.productIndex, 1);
  }

  return {
    distance: Math.round(totalDistance * 100) / 100,
    pickingOrder,
  };
};
