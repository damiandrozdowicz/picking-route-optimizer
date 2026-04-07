import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpStatusCode } from "axios";
import { sendErrorResponse } from "./handle-error-response.util";
import type { Response } from "express";

function buildMockResponse(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

describe("sendErrorResponse", () => {
  let res: Response;

  beforeEach(() => {
    res = buildMockResponse();
  });

  it("sets the correct HTTP status code", () => {
    sendErrorResponse(res, HttpStatusCode.BadRequest, "something wrong");

    expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
  });

  it("sends a valid RFC 7807 Problem Details body", () => {
    sendErrorResponse(res, HttpStatusCode.BadRequest, "something wrong");

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.any(String),
        title: expect.any(String),
        status: HttpStatusCode.BadRequest,
        detail: "something wrong",
      }),
    );
  });

  it("uses the known title for 400", () => {
    sendErrorResponse(res, HttpStatusCode.BadRequest, "detail");

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Validation Error" }),
    );
  });

  it("uses the known title for 500", () => {
    sendErrorResponse(res, HttpStatusCode.InternalServerError, "detail");

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Internal Server Error" }),
    );
  });

  it("falls back to 'Error' as title for unknown status codes", () => {
    sendErrorResponse(res, HttpStatusCode.ImATeapot, "detail");

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Error" }),
    );
  });

  it("defaults type to 'about:blank' when no type is provided (RFC 7807 §3.1)", () => {
    sendErrorResponse(res, HttpStatusCode.BadRequest, "detail");

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ type: "about:blank" }),
    );
  });

  it("uses the provided type when given", () => {
    sendErrorResponse(
      res,
      HttpStatusCode.BadRequest,
      "detail",
      "https://example.com/errors/validation",
    );

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "https://example.com/errors/validation",
      }),
    );
  });
});
