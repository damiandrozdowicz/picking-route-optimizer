import { Request, Response } from "express";
import {
  optimizePickingRouteService,
  NoStockError,
} from "../services/optimize-picking-route.service";
import {
  OptimizationRequest,
  OptimizationResponse,
  ProblemDetails,
} from "../types";
import { sendErrorResponse } from "../utils/handle-error-response.util";
import axios, { HttpStatusCode } from "axios";

export async function handleOptimize(
  req: Request<{}, {}, OptimizationRequest>,
  res: Response<OptimizationResponse | ProblemDetails>,
) {
  try {
    const { products, startingPosition } = req.body;
    const result = await optimizePickingRouteService.optimizePickingRoute(
      products,
      startingPosition,
    );
    return res.json(result);
  } catch (error) {
    console.error("Optimization failed:", error);

    if (error instanceof NoStockError) {
      return sendErrorResponse(
        res,
        HttpStatusCode.UnprocessableEntity,
        error.message,
      );
    }

    if (axios.isAxiosError(error)) {
      if (error.response?.status === HttpStatusCode.NotFound) {
        return sendErrorResponse(
          res,
          HttpStatusCode.NotFound,
          "One or more requested products were not found in the warehouse.",
        );
      }

      return sendErrorResponse(
        res,
        HttpStatusCode.BadGateway,
        "The warehouse API is currently unavailable. Please try again later.",
      );
    }

    return sendErrorResponse(
      res,
      HttpStatusCode.InternalServerError,
      "An error occurred during optimization.",
    );
  }
}
