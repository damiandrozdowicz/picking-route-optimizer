import { Validator } from "./validator.model";
import { config } from "../config";

/**
 * Validates that `products` is a non-empty array of non-empty strings
 * within the limit imposed by the active optimization strategy.
 */
export const validateProducts: Validator = (body) => {
  const { products } = body as { products: unknown };

  if (!products || !Array.isArray(products) || products.length === 0) {
    return "products must be a non-empty array.";
  }

  if (products.length > config.maxProducts) {
    return `Too many products: maximum allowed is ${config.maxProducts}.`;
  }

  const hasInvalidElement = products.some(
    (item) => typeof item !== "string" || item.trim() === "",
  );
  if (hasInvalidElement) {
    return "Each product must be a non-empty string.";
  }

  return null;
};
