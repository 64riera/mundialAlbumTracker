import { describe, it, expect } from "vitest";
import { generalLimiter, authLimiter } from "../middleware/rateLimiter";

describe("rateLimiter configuration", () => {
  it("generalLimiter is a middleware function", () => {
    expect(typeof generalLimiter).toBe("function");
  });

  it("authLimiter is a middleware function", () => {
    expect(typeof authLimiter).toBe("function");
  });
});
