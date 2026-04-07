import { Request, Response } from "express";

export function handleHealth(_req: Request, res: Response) {
  return res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
