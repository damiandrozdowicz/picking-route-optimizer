import { Router } from "express";
import { handleHealth } from "../controllers";

export const healthRouter = Router();

healthRouter.get("/", handleHealth);
