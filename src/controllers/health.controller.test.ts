import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../server";
import { HttpStatusCode } from "axios";

describe("GET /health", () => {
  it("returns 200 (OK) status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(HttpStatusCode.Ok);
  });

  it("returns status: ok", async () => {
    const res = await request(app).get("/health");
    expect(res.body.status).toBe("ok");
  });

  it("returns a valid ISO timestamp", async () => {
    const res = await request(app).get("/health");
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });
});
