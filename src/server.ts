import dotenv from "dotenv";
dotenv.config();

import express from "express";
import * as routes from "./routes";
import { globalErrorHandler } from "./middleware/global-error-handler.middleware";
import { config } from "./config";

function registerRoutes(app: express.Express) {
  app.use(`${config.apiBaseUrl}/optimize`, routes.optimizeRouter);
  app.use("/health", routes.healthRouter);
}

const app = express();
app.use(express.json());

registerRoutes(app);

// Must be LAST — catches any unhandled errors from routes above
app.use(globalErrorHandler);

export { app };
