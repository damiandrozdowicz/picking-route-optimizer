import { Router } from "express";
import { handleOptimize } from "../controllers";
import { validateOptimize } from "../middleware/validate-optimize.middleware";

export const optimizeRouter = Router();

optimizeRouter.post("/", validateOptimize, handleOptimize);
