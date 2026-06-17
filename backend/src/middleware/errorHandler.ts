import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { env } from "../lib/env";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation error",
      details: err.flatten(),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);

  const message =
    env.NODE_ENV === "production" ? "Internal server error" : err.message;

  return res.status(500).json({ error: message });
}
