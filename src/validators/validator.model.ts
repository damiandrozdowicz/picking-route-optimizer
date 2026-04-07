/**
 * A validator is a pure function that checks one rule.
 * Returns an error message string if invalid, or null if valid.
 */
export type Validator = (body: unknown) => string | null;
