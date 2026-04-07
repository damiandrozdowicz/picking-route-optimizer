import { Request, Response } from "express";
import { optimizePickingRouteService } from "../services/optimize-picking-route.service";
import { config } from "../config";
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

    const productLocations =
      await config.provider.getProductsPositions(products);

    // Exclude shelves that are out of stock — picking from a zero-quantity
    // position would produce an impossible instruction.
    const inStockLocations = productLocations.map((locs) =>
      locs.filter((loc) => loc.quantity > 0),
    );

    const emptyIndex = inStockLocations.findIndex((locs) => locs.length === 0);
    if (emptyIndex !== -1) {
      return sendErrorResponse(
        res,
        HttpStatusCode.UnprocessableEntity,
        `No warehouse positions found for product "${products[emptyIndex]}".`,
      );
    }

    const optimizationResult = optimizePickingRouteService.optimizePickingRoute(
      startingPosition,
      inStockLocations,
    );

    return res.json(optimizationResult);
  } catch (error) {
    console.error("Optimization failed:", error);

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
