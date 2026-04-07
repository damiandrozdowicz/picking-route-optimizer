import { describe, it, expect, vi, beforeEach } from "vitest";
import { WarehousePosition } from "../types";

vi.mock("axios", () => {
  const mockGet = vi.fn();
  const mockAxiosInstance = { get: mockGet };

  return {
    default: {
      create: vi.fn().mockReturnValue(mockAxiosInstance),
    },
  };
});

import { WarehouseProvider } from "./test-warehouse.provider";
import axios from "axios";

function mockGetResolvedWith(data: WarehousePosition[]) {
  const mockInstance = axios.create() as unknown as {
    get: ReturnType<typeof vi.fn>;
  };
  mockInstance.get.mockResolvedValue({ data });
}

function mockGetRejectedWith(error: Error) {
  const mockInstance = axios.create() as unknown as {
    get: ReturnType<typeof vi.fn>;
  };
  mockInstance.get.mockRejectedValue(error);
}

const samplePositions: WarehousePosition[] = [
  {
    positionId: "pos-1",
    productId: "product-1",
    quantity: 2,
    x: 1,
    y: 2,
    z: 3,
  },
];

describe("WarehouseProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns positions for each requested product", async () => {
    mockGetResolvedWith(samplePositions);

    const result = await WarehouseProvider.getProductsPositions(["product-1"]);

    expect(result).toEqual([samplePositions]);
  });

  it("fetches positions for multiple products in parallel", async () => {
    mockGetResolvedWith(samplePositions);

    const result = await WarehouseProvider.getProductsPositions([
      "product-1",
      "product-2",
    ]);

    expect(result).toHaveLength(2);

    const mockInstance = axios.create() as unknown as {
      get: ReturnType<typeof vi.fn>;
    };
    expect(mockInstance.get).toHaveBeenCalledTimes(2);
  });

  it("calls the correct endpoint for each product", async () => {
    mockGetResolvedWith(samplePositions);

    await WarehouseProvider.getProductsPositions(["product-42"]);

    const mockInstance = axios.create() as unknown as {
      get: ReturnType<typeof vi.fn>;
    };
    expect(mockInstance.get).toHaveBeenCalledWith(
      "/products/product-42/positions",
    );
  });

  it("propagates errors from the warehouse API", async () => {
    mockGetRejectedWith(new Error("Network error"));

    await expect(
      WarehouseProvider.getProductsPositions(["product-1"]),
    ).rejects.toThrow("Network error");
  });
});
