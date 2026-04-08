/** What the warehouse API returns — a product's physical location */
export interface WarehousePosition extends Position {
  positionId: string;
  productId: string;
  quantity: number;
}

/** What the algorithm outputs — one step in the picking route */
export interface PickingStep {
  step: number;
  productId: string;
  positionId: string;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface OptimizationRequest {
  products: string[];
  startingPosition: Position;
}

export interface ProductPositionProvider {
  getProductsPositions(productIds: string[]): Promise<WarehousePosition[][]>;
}

export interface OptimizationResponse {
  distance: number;
  pickingOrder: PickingStep[];
}

/**
 * RFC 7807 Problem Details
 * @see https://datatracker.ietf.org/doc/html/rfc7807
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
}

/**
 * Contract that every optimization strategy must satisfy.
 * Receives the picker's starting position and the pre-filtered (in-stock only)
 * shelf locations grouped by product, and returns the optimal route.
 */
export type OptimizationStrategy = (
  startingPosition: Position,
  productLocations: WarehousePosition[][],
) => OptimizationResponse;
