import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

import confettiMock from "canvas-confetti";
import { confettiCollect, confettiBulk } from "../lib/confetti";

const mockFn = confettiMock as unknown as ReturnType<typeof vi.fn>;

describe("confetti", () => {
  beforeEach(() => {
    mockFn.mockClear();
    vi.useFakeTimers();
  });

  describe("confettiCollect", () => {
    it("fires a single burst", () => {
      confettiCollect();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("uses brand colors", () => {
      confettiCollect();
      const opts = mockFn.mock.calls[0][0];
      expect(opts.colors).toContain("#22c55e");
      expect(opts.colors).toContain("#facc15");
    });

    it("respects reduced motion", () => {
      confettiCollect();
      expect(mockFn.mock.calls[0][0].disableForReducedMotion).toBe(true);
    });
  });

  describe("confettiBulk", () => {
    it("fires two bursts with delay", () => {
      confettiBulk(5);
      expect(mockFn).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(150);
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("scales particle count with input", () => {
      confettiBulk(1);
      const small = mockFn.mock.calls[0][0].particleCount;

      mockFn.mockClear();
      confettiBulk(10);
      const large = mockFn.mock.calls[0][0].particleCount;

      expect(large).toBeGreaterThan(small);
    });

    it("caps intensity at 10", () => {
      confettiBulk(100);
      const capped = mockFn.mock.calls[0][0].particleCount;

      mockFn.mockClear();
      confettiBulk(10);
      const atTen = mockFn.mock.calls[0][0].particleCount;

      expect(capped).toBe(atTen);
    });
  });
});
