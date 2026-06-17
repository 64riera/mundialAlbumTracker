import { describe, it, expect, vi, beforeAll } from "vitest";
import jwt from "jsonwebtoken";

vi.mock("../lib/env", () => ({
  env: {
    JWT_SECRET: "test-secret-for-unit-tests-minimum-32-chars",
    JWT_REFRESH_SECRET: "test-refresh-secret-for-unit-tests-32ch",
  },
}));

import { requireAuth } from "../middleware/auth.middleware";
import type { Request, Response, NextFunction } from "express";

function createMockReqRes(authHeader?: string) {
  const req = { headers: { authorization: authHeader } } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe("requireAuth middleware", () => {
  const SECRET = "test-secret-for-unit-tests-minimum-32-chars";

  it("rejects request without Authorization header", () => {
    const { req, res, next } = createMockReqRes();
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects request with non-Bearer token", () => {
    const { req, res, next } = createMockReqRes("Basic abc123");
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("rejects expired token", () => {
    const token = jwt.sign({ userId: "123" }, SECRET, { expiresIn: "-1s" });
    const { req, res, next } = createMockReqRes(`Bearer ${token}`);
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("rejects token signed with wrong secret", () => {
    const token = jwt.sign({ userId: "123" }, "wrong-secret-wrong-secret-wrong-secret");
    const { req, res, next } = createMockReqRes(`Bearer ${token}`);
    requireAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("sets userId on request for valid token", () => {
    const token = jwt.sign({ userId: "user-123" }, SECRET, { expiresIn: "15m" });
    const { req, res, next } = createMockReqRes(`Bearer ${token}`);
    requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe("user-123");
  });
});
