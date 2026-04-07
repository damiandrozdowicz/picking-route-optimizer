import { describe, it, expect } from "vitest";
import { validateStartingPosition } from "./validate-starting-position.validator";

const validPosition = { x: 0, y: 0, z: 0 };

describe("validateStartingPosition", () => {
  it("returns null for a valid startingPosition", () => {
    expect(
      validateStartingPosition({ startingPosition: validPosition }),
    ).toBeNull();
  });

  it("returns an error when startingPosition is missing", () => {
    expect(validateStartingPosition({})).toBe(
      "startingPosition must have numeric x, y, z.",
    );
  });

  it("returns an error when x is not a number", () => {
    expect(
      validateStartingPosition({ startingPosition: { x: "0", y: 0, z: 0 } }),
    ).toBe("startingPosition must have numeric x, y, z.");
  });

  it("returns an error when y is not a number", () => {
    expect(
      validateStartingPosition({ startingPosition: { x: 0, y: null, z: 0 } }),
    ).toBe("startingPosition must have numeric x, y, z.");
  });

  it("returns an error when z is not a number", () => {
    expect(
      validateStartingPosition({
        startingPosition: { x: 0, y: 0, z: undefined },
      }),
    ).toBe("startingPosition must have numeric x, y, z.");
  });
});
