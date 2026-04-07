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
