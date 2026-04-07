import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { globalErrorHandler } from "./global-error-handler.middleware";
import { HttpStatusCode } from "axios";

function appMock(error: Error) {
  const testApp = express();

  testApp.get("/boom", () => {
    throw error;
  });

  testApp.use(globalErrorHandler);

  return testApp;
}

describe("globalErrorHandler middleware", () => {
  it("returns 500 status", async () => {
    const testApp = appMock(new Error("something broke"));
    const res = await request(testApp).get("/boom");

    expect(res.status).toBe(HttpStatusCode.InternalServerError);
  });

  it("returns RFC 7807 Problem Details shape", async () => {
    const testApp = appMock(new Error("something broke"));
    const res = await request(testApp).get("/boom");

    expect(res.body).toHaveProperty("type");
    expect(res.body).toHaveProperty("title");
    expect(res.body).toHaveProperty(
      "status",
      HttpStatusCode.InternalServerError,
    );
    expect(res.body).toHaveProperty("detail");
  });

  it("always returns the same generic detail message (does not leak error internals)", async () => {
    const testApp = appMock(new Error("secret db password in here"));
    const res = await request(testApp).get("/boom");

    expect(res.body.detail).toBe("An unexpected error occurred.");
    expect(res.body.detail).not.toContain("secret");
  });
});
