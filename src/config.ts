import { bruteForcePStrategy } from "./optimization-strategy/brute-force/brute-force.strategy";
import { WarehouseProvider } from "./providers";

/**
 * Single substitution point for runtime dependencies.
 * Swap `provider` to change the data source, `optimizationStrategy` to change the algorithm.
 */
export const config = {
  provider: WarehouseProvider,
  optimizationStrategy: bruteForcePStrategy,
  /**
   * Maximum number of products accepted per request.
   * Brute-force runs in O(n! × m^n) time (n = products, m = positions per product),
   * so this must stay small. Raise only if you swap to a polynomial-time strategy.
   */
  maxProducts: 8,
  apiBaseUrl: process.env.API_BASE_URL ?? "/api",
  apiTimeout: 5000,
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
};
