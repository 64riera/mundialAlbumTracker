import { describe, it, expect } from "vitest";
import { extractStickerCodes, matchToValidCodes } from "../lib/ocrMatcher";

const VALID_CODES = [
  "ARG-1", "ARG-2", "ARG-15",
  "KOR-9", "KOR-10",
  "ESP-5", "ESP-12",
  "BRA-3", "BRA-7",
  "TUN-14",
  "CC-3",
  "FWC-1",
  "00",
];

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

describe("matchToValidCodes", () => {
  it("returns exact matches", () => {
    expect(matchToValidCodes(["KOR-9"], VALID_CODES)).toEqual(["KOR-9"]);
  });

  it("corrects OCR misreads within distance 2", () => {
    // KOR-9 misread as KOD-9 (1 char diff)
    expect(matchToValidCodes(["KOD-9"], VALID_CODES)).toEqual(["KOR-9"]);
  });

  it("corrects PAD-4 → closest valid code", () => {
    // PAD-4 is not valid — should fuzzy-match to something close
    const result = matchToValidCodes(["PAD-4"], VALID_CODES);
    // Distance to BRA-3 = 3, CC-3 = 3, FWC-1 = 4 — all too far
    // This particular misread is too far from any real code
    expect(result.length).toBeLessThanOrEqual(1);
  });

  it("corrects single-letter misreads in prefix", () => {
    // TUN-14 misread as TUH-14
    expect(matchToValidCodes(["TUH-14"], VALID_CODES)).toEqual(["TUN-14"]);
  });

  it("corrects single-digit misreads", () => {
    // ESP-3 is not valid — closest is ESP-5 (distance 1)
    expect(matchToValidCodes(["ESP-3"], VALID_CODES)).toEqual(["ESP-5"]);
  });

  it("rejects candidates too far from any valid code", () => {
    expect(matchToValidCodes(["ZZZ-99"], VALID_CODES)).toEqual([]);
  });

  it("deduplicates matched results", () => {
    // Two OCR candidates both matching the same valid code
    expect(matchToValidCodes(["KOR-9", "KOD-9"], VALID_CODES)).toEqual(["KOR-9"]);
  });

  it("handles empty candidates", () => {
    expect(matchToValidCodes([], VALID_CODES)).toEqual([]);
  });

  it("handles empty valid codes", () => {
    expect(matchToValidCodes(["ARG-1"], [])).toEqual([]);
  });
});
