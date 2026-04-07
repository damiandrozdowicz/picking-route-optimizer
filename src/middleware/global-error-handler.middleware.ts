import { Request, Response, NextFunction } from "express";
import { sendErrorResponse } from "../utils/handle-error-response.util";
import { HttpStatusCode } from "axios";

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error("Unhandled error:", err);

  sendErrorResponse(
    res,
    HttpStatusCode.InternalServerError,
    "An unexpected error occurred.",
  );
}
