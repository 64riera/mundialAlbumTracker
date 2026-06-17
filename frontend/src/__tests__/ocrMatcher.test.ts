import { describe, it, expect } from "vitest";
import { extractStickerCodes } from "../lib/ocrMatcher";

describe("extractStickerCodes", () => {
  it("extracts standard codes like ARG-1", () => {
    expect(extractStickerCodes("ARG-1")).toEqual(["ARG-1"]);
  });

  it("extracts multiple codes from text", () => {
    const result = extractStickerCodes("Found ARG-1 and ESP-5 on this page");
    expect(result).toContain("ARG-1");
    expect(result).toContain("ESP-5");
  });

  it("handles codes without dash (ARG1)", () => {
    expect(extractStickerCodes("ARG1")).toEqual(["ARG-1"]);
  });

  it("handles codes with space (ARG 1)", () => {
    expect(extractStickerCodes("ARG 1")).toEqual(["ARG-1"]);
  });

  it("handles two-letter prefixes", () => {
    expect(extractStickerCodes("CC-3")).toEqual(["CC-3"]);
  });

  it("handles four-letter prefixes", () => {
    expect(extractStickerCodes("TEST-12")).toEqual(["TEST-12"]);
  });

  it("handles the special 00 code", () => {
    expect(extractStickerCodes("sticker 00 found")).toEqual(["00"]);
  });

  it("deduplicates results", () => {
    expect(extractStickerCodes("ARG-1 ARG-1 ARG-1")).toEqual(["ARG-1"]);
  });

  it("returns empty array for no matches", () => {
    expect(extractStickerCodes("no codes here")).toEqual([]);
  });

  it("is case-insensitive and normalizes to uppercase", () => {
    expect(extractStickerCodes("arg-1")).toEqual(["ARG-1"]);
  });

  it("handles noisy OCR text", () => {
    const noisy = "...xX ARG-15 !! some noise BRA-3 end";
    const result = extractStickerCodes(noisy);
    expect(result).toContain("ARG-15");
    expect(result).toContain("BRA-3");
  });

  it("handles en-dash and em-dash", () => {
    expect(extractStickerCodes("ESP–5")).toEqual(["ESP-5"]);
    expect(extractStickerCodes("ESP—5")).toEqual(["ESP-5"]);
  });
});
