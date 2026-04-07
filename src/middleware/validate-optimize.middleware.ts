import { Request, Response, NextFunction } from "express";
import { sendErrorResponse } from "../utils/handle-error-response.util";
import { HttpStatusCode } from "axios";
import {
  Validator,
  validateProducts,
  validateStartingPosition,
  validateNoDuplicates,
} from "../validators";

const validators: Validator[] = [
  validateProducts,
  validateStartingPosition,
  validateNoDuplicates,
];

export function validateOptimize(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  for (const validate of validators) {
    const error = validate(req.body);
    if (error) {
      return sendErrorResponse(res, HttpStatusCode.BadRequest, error);
    }
  }

  next();
}
