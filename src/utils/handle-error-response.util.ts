import { Response } from "express";
import { ProblemDetails } from "../types";

/**
 * Sends an RFC 7807 Problem Details error response.
 * Centralises error formatting so every error in the API looks the same.
 *
 * @param res    - Express response object
 * @param status - HTTP status code (e.g. 400, 500)
 * @param detail - Human-readable explanation of the problem
 * @param type   - Optional URI identifying the error category
 */
export function sendErrorResponse(
  res: Response,
  status: number,
  detail: string,
  type?: string,
): void {
  const titles: Partial<Record<number, string>> = {
    400: "Validation Error",
    404: "Not Found",
    422: "Unprocessable Entity",
    500: "Internal Server Error",
    502: "Bad Gateway",
  };

  const problemDetails: ProblemDetails = {
    type: type ?? "about:blank",
    title: titles[status] ?? "Error",
    status,
    detail,
  };

  res.status(status).json(problemDetails);
}
