import axios, { AxiosInstance } from "axios";
import { WarehousePosition, ProductPositionProvider } from "../types";
import { config } from "../config";

/**
 * Warehouse REST API implementation of ProductPositionProvider.
 * Fetches product positions from the external warehouse API.
 */

let apiClient: AxiosInstance | null = null;

function getApiClient(): AxiosInstance {
  if (!apiClient) {
    apiClient = axios.create({
      baseURL: process.env.WAREHOUSE_API_BASE_URL,
      timeout: config.apiTimeout,
      headers: {
        "X-API-Key": process.env.WAREHOUSE_API_KEY,
      },
    });
  }
  return apiClient;
}

async function getProductPositions(
  productId: string,
): Promise<WarehousePosition[]> {
  const client = getApiClient();
  const response = await client.get<WarehousePosition[]>(
    `/products/${productId}/positions`,
  );
  return response.data;
}

export const WarehouseProvider: ProductPositionProvider = {
  async getProductsPositions(
    productIds: string[],
  ): Promise<WarehousePosition[][]> {
    return Promise.all(productIds.map((id) => getProductPositions(id)));
  },
};
