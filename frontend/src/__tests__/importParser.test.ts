import { describe, it, expect } from "vitest";
import { parseImportData } from "../lib/importParser";

describe("parseImportData", () => {
  it("returns empty array for empty input", () => {
    expect(parseImportData("")).toEqual([]);
    expect(parseImportData("   ")).toEqual([]);
  });

  it("parses comma-separated codes", () => {
    const result = parseImportData("ARG-1, ARG-2, ESP-1");
    expect(result).toEqual(["ARG-1", "ARG-2", "ESP-1"]);
  });

  it("parses newline-separated codes", () => {
    const result = parseImportData("ARG-1\nARG-2\nESP-1");
    expect(result).toEqual(["ARG-1", "ARG-2", "ESP-1"]);
  });

  it("parses semicolon-separated codes", () => {
    const result = parseImportData("ARG-1; ARG-2; ESP-1");
    expect(result).toEqual(["ARG-1", "ARG-2", "ESP-1"]);
  });

  it("parses pipe-separated codes", () => {
    const result = parseImportData("ARG-1|ARG-2|ESP-1");
    expect(result).toEqual(["ARG-1", "ARG-2", "ESP-1"]);
  });

  it("normalizes 'ARG 1' to 'ARG-1'", () => {
    const result = parseImportData("ARG 1, ESP 5, BRA 3");
    expect(result).toEqual(["ARG-1", "ESP-5", "BRA-3"]);
  });

  it("normalizes 'ARG1' to 'ARG-1'", () => {
    const result = parseImportData("ARG1, ESP5");
    expect(result).toEqual(["ARG-1", "ESP-5"]);
  });

  it("deduplicates codes", () => {
    const result = parseImportData("ARG-1, ARG-1, ARG-1");
    expect(result).toEqual(["ARG-1"]);
  });

  it("parses JSON array format", () => {
    const result = parseImportData('["ARG-1","ARG-2","ESP-1"]');
    expect(result).toEqual(["ARG-1", "ARG-2", "ESP-1"]);
  });

  it("parses JSON object with stickers key", () => {
    const result = parseImportData('{"stickers":["ARG-1","ESP-1"]}');
    expect(result).toEqual(["ARG-1", "ESP-1"]);
  });

  it("parses JSON object with codes key", () => {
    const result = parseImportData('{"codes":["ARG-1","ESP-1"]}');
    expect(result).toEqual(["ARG-1", "ESP-1"]);
  });

  it("handles mixed delimiters", () => {
    const result = parseImportData("ARG-1, ARG-2\nESP-1; BRA-3");
    expect(result).toEqual(["ARG-1", "ARG-2", "ESP-1", "BRA-3"]);
  });

  it("filters out empty entries", () => {
    const result = parseImportData("ARG-1,,, ESP-1,");
    expect(result).toEqual(["ARG-1", "ESP-1"]);
  });

  it("preserves codes that don't match normalization pattern", () => {
    const result = parseImportData("FWC-1, CC-3, 00");
    expect(result).toEqual(["FWC-1", "CC-3", "00"]);
  });
});
