import { Validator } from "./validator.model";

/**
 * Validates that there are no duplicate product IDs in the array.
 * Assumes `products` has already been validated as a non-empty array.
 */
export const validateNoDuplicates: Validator = (body: unknown) => {
  const { products } = body as { products: string[] };

  const uniqueProducts = new Set(products);
  if (uniqueProducts.size !== products.length) {
    return "Duplicate product IDs are not allowed.";
  }

  return null;
};
