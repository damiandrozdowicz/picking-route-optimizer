import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { HttpStatusCode } from "axios";

vi.mock("../validators", () => ({
  validateProducts: vi.fn().mockReturnValue(null),
  validateStartingPosition: vi.fn().mockReturnValue(null),
  validateNoDuplicates: vi.fn().mockReturnValue(null),
}));

import { validateOptimize } from "./validate-optimize.middleware";
import * as validators from "../validators";

const testApp = express();
testApp.use(express.json());
testApp.post("/", validateOptimize, (_req, res) => {
  res.status(HttpStatusCode.Ok).json({ ok: true });
});

function send(body: object): Promise<request.Response> {
  return request(testApp).post("/").send(body);
}

const anyBody = {
  products: ["product-1"],
  startingPosition: { x: 0, y: 0, z: 0 },
};

describe("validateOptimize middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(validators.validateProducts).mockReturnValue(null);
    vi.mocked(validators.validateStartingPosition).mockReturnValue(null);
    vi.mocked(validators.validateNoDuplicates).mockReturnValue(null);
  });

  it("calls next() and returns 200 when all validators pass", async () => {
    const res = await send(anyBody);
    expect(res.status).toBe(HttpStatusCode.Ok);
  });

  it("returns 400 with the error message when a validator fails", async () => {
    vi.mocked(validators.validateProducts).mockReturnValue("products error");

    const res = await send(anyBody);

    expect(res.status).toBe(HttpStatusCode.BadRequest);
    expect(res.body.detail).toBe("products error");
  });

  it("stops at the first failing validator (does not run subsequent ones)", async () => {
    vi.mocked(validators.validateProducts).mockReturnValue("products error");

    await send(anyBody);

    expect(validators.validateStartingPosition).not.toHaveBeenCalled();
    expect(validators.validateNoDuplicates).not.toHaveBeenCalled();
  });
});
