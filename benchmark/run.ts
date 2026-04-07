import * as fs from "fs";
import * as path from "path";
import { bruteForcePStrategy } from "../src/optimization-strategy/brute-force/brute-force.strategy";
import { nearestNeighborStrategy } from "../src/optimization-strategy/nearest-neighbour/nearest-neighbour.strategy";
import { dynamicProgrammingStrategy } from "../src/optimization-strategy/dynamic-programming/dynamic-programming.strategy";
import {
  OptimizationResponse,
  Position,
  WarehousePosition,
} from "../src/types";
import { calculateDistance } from "../src/utils/calculate-distance.util";
import { scenarios } from "./scenarios";

// ---------------------------------------------------------------------------
// Reference verifier
// ---------------------------------------------------------------------------

/**
 * Independently computes the true minimum distance via recursive DFS over
 * every product ordering × every shelf assignment.
 *
 * Intentionally written from scratch — no shared code with bruteForcePStrategy —
 * so that agreement between the two constitutes meaningful cross-validation.
 *
 * Uses branch-and-bound pruning (skip branches already worse than best known)
 * to keep it fast enough for benchmark scenarios.
 */
function referenceMinDistance(
  startingPosition: Position,
  productLocations: WarehousePosition[][],
): number {
  const n = productLocations.length;
  let best = Infinity;
  const visited = new Array<boolean>(n).fill(false);

  // DFS: at each step choose any unvisited product, then any of its shelves.
  function dfs(current: Position, depth: number, distanceSoFar: number): void {
    if (distanceSoFar >= best) return; // prune

    if (depth === n) {
      best = distanceSoFar;
      return;
    }

    for (let i = 0; i < n; i++) {
      if (visited[i]) continue;
      visited[i] = true;
      for (const shelf of productLocations[i]) {
        dfs(
          shelf,
          depth + 1,
          distanceSoFar + calculateDistance(current, shelf),
        );
      }
      visited[i] = false;
    }
  }

  dfs(startingPosition, 0, 0);
  return Math.round(best * 100) / 100;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StrategyResult {
  distance: number;
  durationMs: number;
  pickingOrder: OptimizationResponse["pickingOrder"];
}

interface ScenarioResult {
  scenarioName: string;
  description: string;
  productCount: number;
  totalShelfCount: number;
  bruteForce: StrategyResult;
  dynamicProgramming: StrategyResult;
  nearestNeighbor: StrategyResult;
  distanceDelta: number; // nearestNeighbor.distance - bruteForce.distance (positive = BF wins)
  speedupFactor: number; // bruteForce.durationMs / nearestNeighbor.durationMs
  /** Distance verified by the independent reference DFS. */
  verifiedOptimalDistance: number;
  /** True when brute-force matches the reference verifier. */
  isOptimal: boolean;
  /** True when DP matches the reference verifier. */
  dpIsOptimal: boolean;
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

/**
 * Runs a single strategy and returns distance + wall-clock time.
 * Each strategy is run RUNS times and the median duration is reported
 * to smooth out JIT / GC noise.
 */
const RUNS = 5;

function runStrategy(
  strategy: typeof bruteForcePStrategy,
  startingPosition: Parameters<typeof bruteForcePStrategy>[0],
  productLocations: Parameters<typeof bruteForcePStrategy>[1],
): StrategyResult {
  const durations: number[] = [];
  let result!: OptimizationResponse;

  for (let i = 0; i < RUNS; i++) {
    const start = process.hrtime.bigint();
    result = strategy(startingPosition, productLocations);
    const end = process.hrtime.bigint();
    // Convert nanoseconds → milliseconds
    durations.push(Number(end - start) / 1_000_000);
  }

  durations.sort((a, b) => a - b);
  const medianMs = durations[Math.floor(RUNS / 2)];

  return {
    distance: result.distance,
    durationMs: Math.round(medianMs * 1000) / 1000,
    pickingOrder: result.pickingOrder,
  };
}

// ---------------------------------------------------------------------------
// Markdown rendering
// ---------------------------------------------------------------------------

function formatMs(ms: number): string {
  if (ms < 1) return `${ms.toFixed(3)} ms`;
  if (ms < 1000) return `${ms.toFixed(1)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function formatDelta(delta: number): string {
  if (Math.abs(delta) < 0.01) return "—";
  return `+${delta.toFixed(2)} (NN longer)`;
}

function formatSpeedup(factor: number): string {
  if (factor <= 1) return `NN ${(1 / factor).toFixed(1)}× slower`;
  return `BF ${factor.toFixed(1)}× slower`;
}

function pickingOrderToTable(result: StrategyResult): string {
  const rows = result.pickingOrder
    .map((s) => `| ${s.step} | \`${s.productId}\` | \`${s.positionId}\` |`)
    .join("\n");
  return `| Step | Product | Position |\n|------|---------|----------|\n${rows}`;
}

function renderScenario(r: ScenarioResult, index: number): string {
  const sections: string[] = [];

  sections.push(`## ${index + 1}. ${r.scenarioName}`);
  sections.push(`> ${r.description}`);
  sections.push(
    `**Products:** ${r.productCount} &nbsp;|&nbsp; **Total shelf positions:** ${r.totalShelfCount}`,
  );

  sections.push("### Summary");
  const optimalLabel = r.isOptimal
    ? "✅ yes"
    : `❌ no — reference verifier found ${r.verifiedOptimalDistance}`;
  const dpOptimalLabel = r.dpIsOptimal
    ? "✅ yes"
    : `❌ no — reference verifier found ${r.verifiedOptimalDistance}`;
  sections.push(
    `| Metric | Brute-force | DP (Held-Karp) | Nearest-neighbor |`,
    `|--------|-------------|----------------|-----------------|`,
    `| Distance | **${r.bruteForce.distance}** | **${r.dynamicProgramming.distance}** | ${r.nearestNeighbor.distance} |`,
    `| Verified optimal? | ${optimalLabel} | ${dpOptimalLabel} | |`,
    `| Time (median of ${RUNS} runs) | ${formatMs(r.bruteForce.durationMs)} | ${formatMs(r.dynamicProgramming.durationMs)} | ${formatMs(r.nearestNeighbor.durationMs)} |`,
    `| Distance gap vs BF | — | ${Math.abs(r.dynamicProgramming.distance - r.bruteForce.distance) < 0.01 ? "—" : (r.dynamicProgramming.distance - r.bruteForce.distance).toFixed(2)} | ${formatDelta(r.distanceDelta)} |`,
  );

  sections.push("### Picking order — Brute-force");
  sections.push(pickingOrderToTable(r.bruteForce));

  sections.push("### Picking order — DP (Held-Karp)");
  sections.push(pickingOrderToTable(r.dynamicProgramming));

  sections.push("### Picking order — Nearest-neighbor");
  sections.push(pickingOrderToTable(r.nearestNeighbor));

  return sections.join("\n\n");
}

function renderReport(results: ScenarioResult[]): string {
  const timestamp = new Date().toISOString();
  const lines: string[] = [];

  lines.push("# Strategy Benchmark Report");
  lines.push(`_Generated: ${timestamp}_`);
  lines.push("");
  lines.push(
    "Compares **brute-force** (exact: permutations × shelf Cartesian product), " +
      "**DP / Held-Karp** (exact: bitmask dynamic programming, O(2ⁿ × n × m²)), " +
      "and **nearest-neighbor** (greedy) on the same scenarios.",
  );
  lines.push("");
  lines.push("---");

  // Overall summary table
  lines.push("## Overall summary");
  lines.push(
    "| # | Scenario | BF dist | DP dist | NN dist | BF optimal? | DP optimal? | BF time | DP time | NN time |",
  );
  lines.push(
    "|---|----------|---------|---------|---------|-------------|-------------|---------|---------|---------|",
  );
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const bfOptimal = r.isOptimal
      ? "✅"
      : `❌ (ref: ${r.verifiedOptimalDistance})`;
    const dpOptimal = r.dpIsOptimal
      ? "✅"
      : `❌ (ref: ${r.verifiedOptimalDistance})`;
    lines.push(
      `| ${i + 1} | ${r.scenarioName} | **${r.bruteForce.distance}** | **${r.dynamicProgramming.distance}** | ${r.nearestNeighbor.distance} | ${bfOptimal} | ${dpOptimal} | ${formatMs(r.bruteForce.durationMs)} | ${formatMs(r.dynamicProgramming.durationMs)} | ${formatMs(r.nearestNeighbor.durationMs)} |`,
    );
  }

  lines.push("");
  lines.push("---");
  lines.push("");

  // Per-scenario detail
  for (let i = 0; i < results.length; i++) {
    lines.push(renderScenario(results[i], i));
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  console.log("Running benchmark...\n");

  const results: ScenarioResult[] = scenarios.map((scenario) => {
    process.stdout.write(`  ${scenario.name} ... `);

    const bf = runStrategy(
      bruteForcePStrategy,
      scenario.startingPosition,
      scenario.productLocations,
    );
    const dp = runStrategy(
      dynamicProgrammingStrategy,
      scenario.startingPosition,
      scenario.productLocations,
    );
    const nn = runStrategy(
      nearestNeighborStrategy,
      scenario.startingPosition,
      scenario.productLocations,
    );

    const totalShelves = scenario.productLocations.reduce(
      (sum, locs) => sum + locs.length,
      0,
    );

    const verifiedOptimalDistance = referenceMinDistance(
      scenario.startingPosition,
      scenario.productLocations,
    );
    const isOptimal = bf.distance === verifiedOptimalDistance;
    const dpIsOptimal = dp.distance === verifiedOptimalDistance;

    const result: ScenarioResult = {
      scenarioName: scenario.name,
      description: scenario.description,
      productCount: scenario.productLocations.length,
      totalShelfCount: totalShelves,
      bruteForce: bf,
      dynamicProgramming: dp,
      nearestNeighbor: nn,
      distanceDelta: Math.round((nn.distance - bf.distance) * 100) / 100,
      speedupFactor:
        Math.round((bf.durationMs / Math.max(nn.durationMs, 0.001)) * 10) / 10,
      verifiedOptimalDistance,
      isOptimal,
      dpIsOptimal,
    };

    console.log(
      `BF ${bf.distance} (${formatMs(bf.durationMs)}) | DP ${dp.distance} (${formatMs(dp.durationMs)}) | NN ${nn.distance} (${formatMs(nn.durationMs)}) | BF: ${isOptimal ? "✅" : "❌"} DP: ${dpIsOptimal ? "✅" : "❌"}`,
    );
    return result;
  });

  const report = renderReport(results);

  const outputPath = path.resolve(process.cwd(), "benchmark", "results.md");
  fs.writeFileSync(outputPath, report, "utf8");

  console.log(`\nReport written to: ${outputPath}`);
}

main();
