import { describe, it, expect, vi } from "vitest";
import { AppError, errorHandler } from "../middleware/errorHandler";
import { ZodError } from "zod";
import type { Request, Response, NextFunction } from "express";

function createMockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

const mockReq = {} as Request;
const mockNext = vi.fn() as NextFunction;

describe("errorHandler", () => {
  it("handles ZodError as 400 with validation details", () => {
    const res = createMockRes();
    const zodError = new ZodError([
      { code: "invalid_type", expected: "string", received: "number", path: ["email"], message: "Expected string" },
    ]);

    errorHandler(zodError, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Validation error" })
    );
  });

  it("handles AppError with correct status code", () => {
    const res = createMockRes();
    const appError = new AppError(409, "Ya existe una cuenta con este email");

    errorHandler(appError, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Ya existe una cuenta con este email" });
  });

  it("handles unknown errors as 500", () => {
    const res = createMockRes();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(new Error("unexpected"), mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
    consoleError.mockRestore();
  });
});

describe("AppError", () => {
  it("creates error with statusCode and message", () => {
    const error = new AppError(404, "Not found");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Not found");
    expect(error).toBeInstanceOf(Error);
  });
});
