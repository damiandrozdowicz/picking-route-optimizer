import { describe, it, expect } from "vitest";
import { validateNoDuplicates } from "./validate-no-duplicates.validator";

describe("validateNoDuplicates", () => {
  it("returns null when all products are unique", () => {
    expect(validateNoDuplicates({ products: ["a", "b", "c"] })).toBeNull();
  });

  it("returns null for a single product", () => {
    expect(validateNoDuplicates({ products: ["a"] })).toBeNull();
  });

  it("returns an error when products contains duplicates", () => {
    expect(validateNoDuplicates({ products: ["a", "b", "a"] })).toBe(
      "Duplicate product IDs are not allowed.",
    );
  });

  it("returns an error when all products are the same", () => {
    expect(validateNoDuplicates({ products: ["a", "a", "a"] })).toBe(
      "Duplicate product IDs are not allowed.",
    );
  });
});
