import {
  PickingStep,
  Position,
  WarehousePosition,
  OptimizationResponse,
} from "../../types";
import { calculateDistance } from "../../utils/calculate-distance.util";
import { toPickingStep } from "../../utils/to-picking-step.util";

/**
 * Maximum products this strategy can safely handle.
 * O(n! × m^n) blows up fast — 8 products is the practical ceiling.
 */
export const maxProducts = 8;

/**
 * Computes the globally optimal picking route by evaluating all combinations of:
 *   1. product visit order (Heap's permutation algorithm), and
 *   2. shelf selection per product (Cartesian product of all positions).
 *
 * Because one product can be stored at multiple warehouse positions, both dimensions
 * must be searched exhaustively to guarantee the shortest total distance.
 *
 * Time complexity: O(n! × m^n) where n = number of products, m = positions per product.
 * Keep n small (≤ maxProducts) to avoid combinatorial explosion.
 */
export function bruteForcePStrategy(
  startingPosition: Position,
  productLocations: WarehousePosition[][],
): OptimizationResponse {
  if (productLocations.length === 0) {
    return { distance: 0, pickingOrder: [] };
  }

  const indices = productLocations.map((_, i) => i);
  let bestDistance = Infinity;
  let bestOrder: PickingStep[] = [];

  // Outer loop: every possible product visit order.
  for (const permutation of permutations(indices)) {
    // Inner loop: every possible shelf assignment for this visit order.
    for (const shelfAssignment of cartesianProduct(
      permutation.map((i) => productLocations[i]),
    )) {
      const { distance, order } = evaluateCandidate(
        startingPosition,
        permutation,
        shelfAssignment,
      );

      if (distance < bestDistance) {
        bestDistance = distance;
        bestOrder = order;
      }
    }
  }

  return {
    distance: Math.round(bestDistance * 100) / 100,
    pickingOrder: bestOrder,
  };
}

/**
 * Scores one fully-specified candidate route: a fixed product visit order with
 * a fixed shelf chosen for each product.
 */
function evaluateCandidate(
  startingPosition: Position,
  permutation: number[],
  shelfAssignment: WarehousePosition[],
): { distance: number; order: PickingStep[] } {
  let currentPosition: Position = startingPosition;
  let distance = 0;
  const order: PickingStep[] = [];

  for (let step = 0; step < permutation.length; step++) {
    const shelf = shelfAssignment[step];
    distance += calculateDistance(currentPosition, shelf);
    order.push(toPickingStep(shelf, step + 1));
    currentPosition = shelf;
  }

  return { distance, order };
}

/**
 * Generates all combinations from an array of option-lists (Cartesian product).
 * E.g. cartesianProduct([[A,B],[C]]) → [[A,C],[B,C]]
 */
function* cartesianProduct<T>(optionSets: T[][]): Generator<T[]> {
  // Compute flat indices: track one index per option-set.
  const lengths = optionSets.map((s) => s.length);
  const total = lengths.reduce((acc, l) => acc * l, 1);

  for (let i = 0; i < total; i++) {
    const combination: T[] = [];
    let remainder = i;
    for (let j = optionSets.length - 1; j >= 0; j--) {
      combination[j] = optionSets[j][remainder % lengths[j]];
      remainder = Math.floor(remainder / lengths[j]);
    }
    yield combination;
  }
}

/**
 * Generates all permutations of an array using Heap's algorithm.
 */
function* permutations<T>(items: T[]): Generator<T[]> {
  const arr = [...items];
  const n = arr.length;
  const c = new Array<number>(n).fill(0);

  yield [...arr];

  let i = 0;
  while (i < n) {
    if (c[i] < i) {
      if (i % 2 === 0) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
      } else {
        [arr[c[i]], arr[i]] = [arr[i], arr[c[i]]];
      }
      yield [...arr];
      c[i]++;
      i = 0;
    } else {
      c[i] = 0;
      i++;
    }
  }
}
