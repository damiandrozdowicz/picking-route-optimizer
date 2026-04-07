import { PickingStep, WarehousePosition } from "../types";

export function toPickingStep(
  location: WarehousePosition,
  step: number,
): PickingStep {
  return {
    step,
    productId: location.productId,
    positionId: location.positionId,
  };
}
