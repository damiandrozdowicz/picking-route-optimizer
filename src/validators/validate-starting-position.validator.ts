import { Validator } from "./validator.model";

/**
 * Validates that `startingPosition` has numeric x, y, z coordinates.
 */
export const validateStartingPosition: Validator = (body) => {
  const { startingPosition } = body as {
    startingPosition: { x: unknown; y: unknown; z: unknown } | undefined;
  };

  if (
    !startingPosition ||
    typeof startingPosition.x !== "number" ||
    typeof startingPosition.y !== "number" ||
    typeof startingPosition.z !== "number"
  ) {
    return "startingPosition must have numeric x, y, z.";
  }

  return null;
};
