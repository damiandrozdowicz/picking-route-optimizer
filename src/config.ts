import {
  dynamicProgrammingStrategy,
  maxProducts as dpMaxProducts,
} from "./optimization-strategy/dynamic-programming/dynamic-programming.strategy";
import { WarehouseProvider } from "./providers";

/**
 * Single substitution point for runtime dependencies.
 * Swap `provider` to change the data source, `optimizationStrategy` to change the algorithm.
 *
 * `maxProducts` is derived from the active strategy so the validator and the
 * algorithm always agree on the ceiling — change the strategy and the limit
 * updates automatically.
 */
export const config = {
  provider: WarehouseProvider,
  optimizationStrategy: dynamicProgrammingStrategy,
  /** Derived from the active strategy's own limit — do not set manually. */
  maxProducts: dpMaxProducts,
  apiBaseUrl: process.env.API_BASE_URL ?? "/api",
  apiTimeout: 5000,
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
};
