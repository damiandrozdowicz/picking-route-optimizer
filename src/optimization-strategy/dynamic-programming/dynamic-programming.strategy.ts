import {
  OptimizationResponse,
  PickingStep,
  Position,
  WarehousePosition,
} from "../../types";
import { calculateDistance } from "../../utils/calculate-distance.util";
import { toPickingStep } from "../../utils/to-picking-step.util";

interface CandidatePosition {
  productIndex: number;
  location: WarehousePosition;
}

interface RouteState {
  distance: number;
  previousMask: number | null;
  previousCandidateIndex: number | null;
}

/**
 * Maximum products this strategy can safely handle.
 * Bitmask DP is O(2ⁿ × n × m²) — practical ceiling is 20 products.
 */
export const maxProducts = 20;

/**
 * Exact picking optimizer based on bitmask dynamic programming.
 *
 * State:
 *   dp[mask][candidateIndex] = shortest distance required to pick all products
 *   in `mask` and finish at `candidateIndex`.
 *
 * This explores both visit order and shelf choice, so it stays globally
 * optimal even when each product has multiple candidate positions.
 */
export function dynamicProgrammingStrategy(
  startingPosition: Position,
  productLocations: WarehousePosition[][],
): OptimizationResponse {
  if (productLocations.length === 0) {
    return { distance: 0, pickingOrder: [] };
  }

  const candidates = productLocations.flatMap((locations, productIndex) =>
    locations.map((location) => ({ productIndex, location })),
  );

  const candidateIndicesByProduct = productLocations.map(() => [] as number[]);
  candidates.forEach((candidate, candidateIndex) => {
    candidateIndicesByProduct[candidate.productIndex].push(candidateIndex);
  });

  const startDistances = candidates.map(({ location }) =>
    calculateDistance(startingPosition, location),
  );
  const transitionDistances = buildTransitionDistances(candidates);

  const totalMasks = 1 << productLocations.length;
  const states: Array<Map<number, RouteState>> = Array.from(
    { length: totalMasks },
    () => new Map(),
  );

  for (
    let productIndex = 0;
    productIndex < candidateIndicesByProduct.length;
    productIndex++
  ) {
    const startMask = 1 << productIndex;

    for (const candidateIndex of candidateIndicesByProduct[productIndex]) {
      states[startMask].set(candidateIndex, {
        distance: startDistances[candidateIndex],
        previousMask: null,
        previousCandidateIndex: null,
      });
    }
  }

  for (let mask = 1; mask < totalMasks; mask++) {
    for (const [lastCandidateIndex, state] of states[mask]) {
      for (
        let nextProductIndex = 0;
        nextProductIndex < productLocations.length;
        nextProductIndex++
      ) {
        if ((mask & (1 << nextProductIndex)) !== 0) {
          continue;
        }

        const nextMask = mask | (1 << nextProductIndex);

        for (const nextCandidateIndex of candidateIndicesByProduct[
          nextProductIndex
        ]) {
          const nextDistance =
            state.distance +
            transitionDistances[lastCandidateIndex][nextCandidateIndex];
          const currentBest = states[nextMask].get(nextCandidateIndex);

          if (!currentBest || nextDistance < currentBest.distance) {
            states[nextMask].set(nextCandidateIndex, {
              distance: nextDistance,
              previousMask: mask,
              previousCandidateIndex: lastCandidateIndex,
            });
          }
        }
      }
    }
  }

  const fullMask = totalMasks - 1;
  let bestDistance = Infinity;
  let bestCandidateIndex = -1;

  for (const [candidateIndex, state] of states[fullMask]) {
    if (state.distance < bestDistance) {
      bestDistance = state.distance;
      bestCandidateIndex = candidateIndex;
    }
  }

  if (bestCandidateIndex === -1) {
    return { distance: 0, pickingOrder: [] };
  }

  const pickingOrder = reconstructPickingOrder(
    states,
    candidates,
    fullMask,
    bestCandidateIndex,
  );

  return {
    distance: Math.round(bestDistance * 100) / 100,
    pickingOrder,
  };
}

function buildTransitionDistances(candidates: CandidatePosition[]): number[][] {
  const distances = Array.from({ length: candidates.length }, () =>
    new Array<number>(candidates.length).fill(0),
  );

  for (let fromIndex = 0; fromIndex < candidates.length; fromIndex++) {
    for (let toIndex = fromIndex + 1; toIndex < candidates.length; toIndex++) {
      const distance = calculateDistance(
        candidates[fromIndex].location,
        candidates[toIndex].location,
      );
      distances[fromIndex][toIndex] = distance;
      distances[toIndex][fromIndex] = distance;
    }
  }

  return distances;
}

function reconstructPickingOrder(
  states: Array<Map<number, RouteState>>,
  candidates: CandidatePosition[],
  fullMask: number,
  bestCandidateIndex: number,
): PickingStep[] {
  const reversedOrder: PickingStep[] = [];
  let currentMask = fullMask;
  let currentCandidateIndex: number | null = bestCandidateIndex;

  while (currentCandidateIndex !== null) {
    const state = states[currentMask].get(currentCandidateIndex);
    if (!state) {
      throw new Error("Failed to reconstruct dynamic programming route.");
    }

    reversedOrder.push(
      toPickingStep(candidates[currentCandidateIndex].location, 0),
    );

    currentMask = state.previousMask ?? 0;
    currentCandidateIndex = state.previousCandidateIndex;
  }

  return reversedOrder.reverse().map((step, index) => ({
    ...step,
    step: index + 1,
  }));
}
