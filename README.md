# Picking Optimization Service

HTTP server that optimizes warehouse order picking by calculating the shortest path to collect products.

## Setup

```bash
npm install
cp .env.example .env   # then fill in your API key
```

## Run

```bash
npm run dev       # development (auto-reload)
npm run build     # compile TypeScript
npm start         # production (runs compiled JS)
```

## Environment Variables

| Variable                 | Required | Description                    |
| ------------------------ | -------- | ------------------------------ |
| `WAREHOUSE_API_BASE_URL` | ✅ yes   | Warehouse API base URL         |
| `WAREHOUSE_API_KEY`      | ✅ yes   | API key for `x-api-key` header |
| `API_BASE_URL`           | no       | Route prefix (default `/api`)  |
| `PORT`                   | no       | Server port (default `3000`)   |

> The server will refuse to start if `WAREHOUSE_API_BASE_URL` or `WAREHOUSE_API_KEY` are missing.

## Endpoint

### `POST /api/optimize`

Calculates the shortest picking path for a list of products.

**Request:**

```json
{
  "products": ["product-1", "product-2"],
  "startingPosition": { "x": 0, "y": 0, "z": 0 }
}
```

**Response:**

```json
{
  "distance": 14.16,
  "pickingOrder": [
    { "step": 1, "productId": "product-2", "positionId": "position-123" },
    { "step": 2, "productId": "product-1", "positionId": "position-55" }
  ]
}
```

**Error response (RFC 7807 Problem Details):**

```json
{
  "type": "about:blank",
  "title": "Not Found",
  "status": 404,
  "detail": "One or more requested products were not found in the warehouse."
}
```

### `GET /health`

Returns `{ "status": "ok", "timestamp": "..." }`

## Testing

```bash
npm test          # run all tests
npm run test:watch  # watch mode
```

## Manual Testing (curl)

Start the server first: `npm run dev`

**Valid request:**

```bash
curl -s -X POST http://localhost:3000/api/optimize -H "Content-Type: application/json" -d '{"products": ["product-1", "product-2"], "startingPosition": {"x": 0, "y": 0, "z": 0}}'
```

**Validation error — missing products:**

```bash
curl -s -X POST http://localhost:3000/api/optimize -H "Content-Type: application/json" -d '{"startingPosition": {"x": 0, "y": 0, "z": 0}}'
```

**Validation error — duplicate products:**

```bash
curl -s -X POST http://localhost:3000/api/optimize -H "Content-Type: application/json" -d '{"products": ["product-1", "product-1"], "startingPosition": {"x": 0, "y": 0, "z": 0}}'
```

**Validation error — bad startingPosition:**

```bash
curl -s -X POST http://localhost:3000/api/optimize -H "Content-Type: application/json" -d '{"products": ["product-1"], "startingPosition": {"x": "bad", "y": 0, "z": 0}}'
```

**Health check:**

```bash
curl -s http://localhost:3000/health
```

## Architecture

### Swapping implementations

All runtime dependencies are wired in a single file: **`src/config.ts`**. Neither the controller nor the service imports a concrete implementation directly — they both depend on interfaces, so any compatible implementation can be plugged in without touching the rest of the codebase.

```typescript
// src/config.ts
export const config = {
  provider: WarehouseProvider,               // ← swap to change the data source
  optimizationStrategy: dynamicProgrammingStrategy, // ← swap to change the algorithm
  ...
};
```

**Changing the warehouse data source**

Create a class or object that satisfies the `ProductPositionProvider` interface:

```typescript
interface ProductPositionProvider {
  getProductsPositions(productIds: string[]): Promise<WarehousePosition[][]>;
}
```

Then assign it to `config.provider` in `src/config.ts`. No other file needs to change.

**Changing the picking algorithm**

Create a function with this signature:

```typescript
type OptimizationStrategy = (
  startingPosition: Position,
  productLocations: WarehousePosition[][],
) => OptimizationResponse;
```

Then assign it to `config.optimizationStrategy` in `src/config.ts`.

### Available algorithms

Three strategies ship with the service, representing a deliberate progression from simple to optimal. All are exact drop-ins via `config.optimizationStrategy` — no other file changes.

| Strategy                       | Function                     | Optimality                         | Complexity     | Max practical n |
| ------------------------------ | ---------------------------- | ---------------------------------- | -------------- | --------------- |
| **Nearest-neighbor**           | `nearestNeighborStrategy`    | ⚠️ Heuristic                       | O(n² × m)      | unlimited       |
| **Brute-force**                | `bruteForcePStrategy`        | ✅ Optimal order / ⚠️ greedy shelf | O(n! × m^n)    | ~8              |
| **DP / Held-Karp** _(default)_ | `dynamicProgrammingStrategy` | ✅ Globally optimal                | O(2ⁿ × n × m²) | ~20             |

#### Step 1 — Nearest-neighbor (greedy baseline)

The simplest approach: at each step, pick the closest unvisited product and take its nearest shelf. O(n² × m), works at any scale. Two greedy decisions (visit order + shelf) mean it can miss the global optimum — but it makes the trade-off explicit and gives a fast fallback for large orders.

#### Step 2 — Brute-force (exact visit order, greedy shelf)

Tries every permutation of product visit order (Heap's algorithm) and returns the shortest. Shelf selection within each permutation is still greedy (nearest-first). This is optimal over _visit order_ but not over _shelf assignment_ — a distinction that matters because a product can be stored at multiple locations simultaneously. Runtime is O(n! × m^n), practical only up to ~8 products.

#### Step 3 — Dynamic programming / Held-Karp (globally exact)

Bitmask DP over `(set of visited products, last picked shelf)`. Explores both visit order and shelf assignment exhaustively, so it finds the true shortest route regardless of how many shelf positions a product has. O(2ⁿ × n × m²) — the standard Held-Karp complexity. At n=8 it is ~73× faster than brute-force and stays tractable up to ~20 products. This is the default.

#### Benchmark results (representative)

| Scenario              | DP distance | BF distance | NN distance | DP time  | BF time  |
| --------------------- | ----------- | ----------- | ----------- | -------- | -------- |
| 4 products, 1 shelf   | 26.18       | 26.18       | 30.00       | 0.017 ms | 0.036 ms |
| 5 products, 2 shelves | 16.66       | 16.66       | 17.04       | 0.031 ms | 0.49 ms  |
| 8 products, 1 shelf   | 25.06       | 25.06       | 26.39       | 0.19 ms  | 13.5 ms  |

Run `npm run benchmark` to regenerate with full per-scenario picking orders and verification against an independent reference solver.

#### Swapping strategies

Change one line in `src/config.ts`:

```typescript
import { nearestNeighborStrategy } from "./optimization-strategy/nearest-neighbour/nearest-neighbour.strategy";

export const config = {
  optimizationStrategy: nearestNeighborStrategy, // ← swap here
  ...
};
```
