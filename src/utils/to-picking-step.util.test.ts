import { describe } from "node:test";
import { WarehousePosition } from "../types";
import { expect, it } from "vitest";

import { toPickingStep } from "./to-picking-step.util";

describe("toPickingStep", () => {
  it("converts a WarehousePosition to a PickingStep with the correct step number", () => {
    const location: WarehousePosition = {
      positionId: "pos-123",
      productId: "prod-456",
      quantity: 10,
      x: 1,
      y: 2,
      z: 3,
    };
    const stepNumber = 5;

    const pickingStep = toPickingStep(location, stepNumber);

    expect(pickingStep).toEqual({
      step: stepNumber,
      productId: location.productId,
      positionId: location.positionId,
    });
  });
});
