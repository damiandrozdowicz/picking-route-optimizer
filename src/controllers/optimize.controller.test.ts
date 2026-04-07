import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../server";
import axios, { AxiosError, HttpStatusCode } from "axios";
import { config } from "../config";
import { WarehousePosition } from "../types/common.model";

const OPTIMIZE_PATH = `${config.apiBaseUrl}/optimize`;

function sendOptimizeRequest(data: object | string): Promise<request.Response> {
  return request(app).post(OPTIMIZE_PATH).send(data);
}

const VALID_BODY = {
  products: ["product1", "product2"],
  startingPosition: { x: 0, y: 0, z: 0 },
};

/**
 * Fake warehouse positions returned by the mocked provider.
 * Keeps integration tests fast and self-contained — no real HTTP calls needed.
 */
const MOCK_POSITIONS: WarehousePosition[][] = [
  [
    {
      positionId: "pos-1",
      productId: "product1",
      quantity: 1,
      x: 1,
      y: 0,
      z: 0,
    },
  ],
  [
    {
      positionId: "pos-2",
      productId: "product2",
      quantity: 1,
      x: 2,
      y: 0,
      z: 0,
    },
  ],
];

describe(`POST ${OPTIMIZE_PATH}`, () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Default: provider returns valid fixture data so happy-path tests stay self-contained.
    // Error-path tests override this with their own mockRejectedValue / mockResolvedValue.
    vi.spyOn(config.provider, "getProductsPositions").mockResolvedValue(
      MOCK_POSITIONS,
    );
  });

  it("returns 200 (OK) status", async () => {
    const res = await sendOptimizeRequest(VALID_BODY);
    expect(res.status).toBe(HttpStatusCode.Ok);
  });

  it("returns distance and pickingOrder", async () => {
    const res = await sendOptimizeRequest(VALID_BODY);
    expect(res.body).toHaveProperty("distance");
    expect(res.body).toHaveProperty("pickingOrder");
    expect(Array.isArray(res.body.pickingOrder)).toBe(true);
  });

  it("returns 400 (Bad Request) when products is not an array", async () => {
    const res = await sendOptimizeRequest({
      products: "not-an-array",
      startingPosition: { x: 0, y: 0, z: 0 },
    });
    expect(res.status).toBe(HttpStatusCode.BadRequest);
    expect(res.body).toHaveProperty("type");
    expect(res.body).toHaveProperty("title");
    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("detail");
  });

  it("returns 422 (Unprocessable Entity) when a product has no warehouse positions", async () => {
    vi.spyOn(config.provider, "getProductsPositions").mockResolvedValue([[]]);

    const res = await sendOptimizeRequest(VALID_BODY);

    expect(res.status).toBe(HttpStatusCode.UnprocessableEntity);
    expect(res.body.status).toBe(HttpStatusCode.UnprocessableEntity);
    expect(res.body).toHaveProperty("detail");
  });

  it("returns 422 (Unprocessable Entity) when all positions for a product have quantity 0", async () => {
    // The provider returns positions, but all are out of stock — after filtering
    // quantity:0 the product has no valid shelf to pick from.
    const outOfStock: WarehousePosition[][] = [
      [
        {
          positionId: "pos-1",
          productId: "product1",
          quantity: 0,
          x: 1,
          y: 0,
          z: 0,
        },
      ],
      [
        {
          positionId: "pos-2",
          productId: "product2",
          quantity: 1,
          x: 2,
          y: 0,
          z: 0,
        },
      ],
    ];
    vi.spyOn(config.provider, "getProductsPositions").mockResolvedValue(
      outOfStock,
    );

    const res = await sendOptimizeRequest(VALID_BODY);

    expect(res.status).toBe(HttpStatusCode.UnprocessableEntity);
    expect(res.body).toHaveProperty("detail");
  });

  it("returns 404 (Not Found) when the warehouse API returns 404", async () => {
    // Simulate the provider throwing an Axios 404 — product does not exist upstream.
    const axiosError = new AxiosError(
      "Not Found",
      "ERR_BAD_REQUEST",
      undefined,
      undefined,
      { status: HttpStatusCode.NotFound } as any,
    );
    vi.spyOn(config.provider, "getProductsPositions").mockRejectedValue(
      axiosError,
    );

    const res = await sendOptimizeRequest(VALID_BODY);

    expect(res.status).toBe(HttpStatusCode.NotFound);
    expect(res.body.status).toBe(HttpStatusCode.NotFound);
    expect(res.body).toHaveProperty("detail");
  });

  it("returns 502 (Bad Gateway) when the warehouse API is unreachable", async () => {
    // Simulate a network-level Axios failure (e.g. timeout or connection refused).
    const axiosError = new AxiosError(
      "Network Error",
      "ECONNREFUSED",
      undefined,
      undefined,
      undefined,
    );
    vi.spyOn(config.provider, "getProductsPositions").mockRejectedValue(
      axiosError,
    );

    const res = await sendOptimizeRequest(VALID_BODY);

    expect(res.status).toBe(HttpStatusCode.BadGateway);
    expect(res.body.status).toBe(HttpStatusCode.BadGateway);
    expect(res.body).toHaveProperty("detail");
  });

  it("returns 500 (Internal Server Error) on unexpected non-Axios errors", async () => {
    // Simulate an unexpected internal failure (e.g. a bug in the optimization algorithm).
    vi.spyOn(config.provider, "getProductsPositions").mockRejectedValue(
      new Error("Unexpected internal error"),
    );

    const res = await sendOptimizeRequest(VALID_BODY);

    expect(res.status).toBe(HttpStatusCode.InternalServerError);
    expect(res.body.status).toBe(HttpStatusCode.InternalServerError);
    expect(res.body).toHaveProperty("detail");
  });
});
