import { Position, WarehousePosition } from "../src/types";

export interface Scenario {
  name: string;
  description: string;
  startingPosition: Position;
  /** One inner array per product — multiple entries = multiple shelf positions. */
  productLocations: WarehousePosition[][];
}

function shelf(
  productId: string,
  positionId: string,
  x: number,
  y: number,
  z: number,
): WarehousePosition {
  return { productId, positionId, quantity: 1, x, y, z };
}

/**
 * Real-life-flavoured benchmark scenarios.
 * Each scenario is run against both strategies so results are directly comparable.
 */
export const scenarios: Scenario[] = [
  {
    name: "Tiny order — 2 products, 1 shelf each",
    description: "Baseline: trivial case, both strategies should agree.",
    startingPosition: { x: 0, y: 0, z: 0 },
    productLocations: [
      [shelf("milk", "A-01", 10, 0, 0)],
      [shelf("bread", "B-03", 10, 5, 0)],
    ],
  },
  {
    name: "Small order — 4 products, 1 shelf each",
    description:
      "Nearest-neighbor may deviate from optimal on non-linear layouts.",
    startingPosition: { x: 0, y: 0, z: 0 },
    productLocations: [
      [shelf("apples", "A-10", 5, 0, 0)],
      [shelf("butter", "B-07", 5, 10, 0)],
      [shelf("cheese", "C-02", 0, 10, 0)],
      [shelf("eggs", "D-15", 10, 10, 0)],
    ],
  },
  {
    name: "Medium order — 6 products, 1 shelf each",
    description:
      "Spread across the warehouse floor, tests visit-order optimality.",
    startingPosition: { x: 0, y: 0, z: 0 },
    productLocations: [
      [shelf("p1", "S-01", 3, 1, 0)],
      [shelf("p2", "S-02", 7, 2, 0)],
      [shelf("p3", "S-03", 8, 8, 0)],
      [shelf("p4", "S-04", 2, 9, 0)],
      [shelf("p5", "S-05", 5, 5, 0)],
      [shelf("p6", "S-06", 1, 4, 0)],
    ],
  },
  {
    name: "Multi-shelf — 3 products, 2–3 shelves each",
    description:
      "Core scenario: each product stocked at multiple locations. " +
      "Greedy shelf-selection can miss the globally shorter route.",
    startingPosition: { x: 0, y: 0, z: 0 },
    productLocations: [
      [shelf("milk", "milk-near", 1, 0, 0), shelf("milk", "milk-far", 9, 0, 0)],
      [shelf("juice", "juice-A", 10, 0, 0), shelf("juice", "juice-B", 0, 8, 0)],
      [
        shelf("cereal", "cereal-A", 10, 5, 0),
        shelf("cereal", "cereal-B", 2, 5, 0),
        shelf("cereal", "cereal-C", 5, 10, 0),
      ],
    ],
  },
  {
    name: "Multi-shelf — 5 products, 2 shelves each",
    description:
      "Larger multi-shelf case — exposes compound shelf-selection errors.",
    startingPosition: { x: 0, y: 0, z: 0 },
    productLocations: [
      [shelf("p1", "p1-a", 2, 0, 0), shelf("p1", "p1-b", 8, 0, 0)],
      [shelf("p2", "p2-a", 8, 4, 0), shelf("p2", "p2-b", 2, 4, 0)],
      [shelf("p3", "p3-a", 5, 8, 0), shelf("p3", "p3-b", 5, 2, 0)],
      [shelf("p4", "p4-a", 0, 6, 0), shelf("p4", "p4-b", 10, 6, 0)],
      [shelf("p5", "p5-a", 3, 10, 0), shelf("p5", "p5-b", 7, 10, 0)],
    ],
  },
  {
    name: "3D warehouse — 4 products across multiple floors",
    description:
      "Z-axis matters: products on different floors (z = floor level).",
    startingPosition: { x: 0, y: 0, z: 0 },
    productLocations: [
      [shelf("item-A", "F1-A", 5, 5, 1)],
      [shelf("item-B", "F2-B", 5, 5, 2), shelf("item-B", "F1-B", 5, 0, 1)],
      [shelf("item-C", "F2-C", 0, 5, 2)],
      [shelf("item-D", "F3-D", 5, 0, 3), shelf("item-D", "F1-D", 5, 0, 1)],
    ],
  },
  {
    name: "Large order — 8 products, 1 shelf each (brute-force limit)",
    description:
      "At n=8 brute-force evaluates 40 320 permutations. " +
      "Shows timing cost at the configured maximum.",
    startingPosition: { x: 0, y: 0, z: 0 },
    productLocations: [
      [shelf("q1", "R1", 2, 3, 0)],
      [shelf("q2", "R2", 7, 1, 0)],
      [shelf("q3", "R3", 9, 6, 0)],
      [shelf("q4", "R4", 4, 9, 0)],
      [shelf("q5", "R5", 1, 7, 0)],
      [shelf("q6", "R6", 6, 4, 0)],
      [shelf("q7", "R7", 3, 8, 0)],
      [shelf("q8", "R8", 8, 2, 0)],
    ],
  },
];
