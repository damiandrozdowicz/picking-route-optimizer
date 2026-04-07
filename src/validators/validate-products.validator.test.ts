import { describe, it, expect } from "vitest";
import { validateProducts } from "./validate-products.validator";
import { config } from "../config";

describe("validateProducts", () => {
  it("returns null for a valid non-empty array", () => {
    expect(validateProducts({ products: ["product-1"] })).toBeNull();
  });

  it("returns an error when products is missing", () => {
    expect(validateProducts({})).toBe("products must be a non-empty array.");
  });

  it("returns an error when products is not an array", () => {
    expect(validateProducts({ products: "product-1" })).toBe(
      "products must be a non-empty array.",
    );
  });

  it("returns an error when products is an empty array", () => {
    expect(validateProducts({ products: [] })).toBe(
      "products must be a non-empty array.",
    );
  });

  it("returns an error when an element is a number", () => {
    expect(validateProducts({ products: [1, "product-2"] })).toBe(
      "Each product must be a non-empty string.",
    );
  });

  it("returns an error when an element is null", () => {
    expect(validateProducts({ products: [null, "product-2"] })).toBe(
      "Each product must be a non-empty string.",
    );
  });

  it("returns an error when an element is an empty string", () => {
    expect(validateProducts({ products: [""] })).toBe(
      "Each product must be a non-empty string.",
    );
  });

  it("returns an error when an element is a whitespace string", () => {
    expect(validateProducts({ products: ["   "] })).toBe(
      "Each product must be a non-empty string.",
    );
  });

  it(`returns an error when products exceeds the maximum of ${config.maxProducts}`, () => {
    const tooMany = Array.from(
      { length: config.maxProducts + 1 },
      (_, i) => `product-${i}`,
    );
    expect(validateProducts({ products: tooMany })).toBe(
      `Too many products: maximum allowed is ${config.maxProducts}.`,
    );
  });

  it(`returns null when products is exactly at the maximum of ${config.maxProducts}`, () => {
    const atLimit = Array.from(
      { length: config.maxProducts },
      (_, i) => `product-${i}`,
    );
    expect(validateProducts({ products: atLimit })).toBeNull();
  });
});
