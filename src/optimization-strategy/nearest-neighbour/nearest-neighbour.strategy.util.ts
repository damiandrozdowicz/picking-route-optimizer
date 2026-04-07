import { Position, WarehousePosition } from "../../types";
import { calculateDistance } from "../../utils/calculate-distance.util";
import { ClosestLocationResult } from "./nearest-neighbour.strategy.model";

/**
 * Scans all remaining products and their locations to find the  * single closest one to the current position.
 */
export function findClosestLocation(
  currentPosition: Position,
  remaining: WarehousePosition[][],
): ClosestLocationResult | null {
  let closestDistance = Infinity;
  let closestLocation: WarehousePosition | null = null;
  let closestProductIndex = -1;

  for (let i = 0; i < remaining.length; i++) {
    for (const location of remaining[i]) {
      const distance = calculateDistance(currentPosition, location);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestLocation = location;
        closestProductIndex = i;
      }
    }
  }

  if (closestLocation === null) {
    return null;
  }

  return {
    location: closestLocation,
    distance: closestDistance,
    productIndex: closestProductIndex,
  };
}
