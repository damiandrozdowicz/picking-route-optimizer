import { app } from "./server";
import { config } from "./config";

const REQUIRED_ENV_VARS = ["WAREHOUSE_API_BASE_URL", "WAREHOUSE_API_KEY"];

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    console.error(`[startup] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
