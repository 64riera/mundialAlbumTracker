import { describe, it, expect, beforeEach } from "vitest";
import { useLangStore } from "../lib/i18n";
import { es } from "../lib/i18n/es";
import { en } from "../lib/i18n/en";

function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, val]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof val === "object" && val !== null
      ? getKeys(val as Record<string, unknown>, path)
      : [path];
  });
}

describe("i18n", () => {
  describe("langStore", () => {
    beforeEach(() => {
      useLangStore.setState({ lang: "es" });
    });

    it("defaults to Spanish", () => {
      expect(useLangStore.getState().lang).toBe("es");
    });

    it("switches to English", () => {
      useLangStore.getState().setLang("en");
      expect(useLangStore.getState().lang).toBe("en");
    });

    it("switches back to Spanish", () => {
      useLangStore.getState().setLang("en");
      useLangStore.getState().setLang("es");
      expect(useLangStore.getState().lang).toBe("es");
    });
  });

  describe("translation parity", () => {
    const esKeys = getKeys(es as unknown as Record<string, unknown>);
    const enKeys = getKeys(en as unknown as Record<string, unknown>);

    it("EN has all keys that ES has", () => {
      const missing = esKeys.filter((k) => !enKeys.includes(k));
      expect(missing).toEqual([]);
    });

    it("ES has all keys that EN has", () => {
      const missing = enKeys.filter((k) => !esKeys.includes(k));
      expect(missing).toEqual([]);
    });

    it("no empty string values in ES", () => {
      const empty = esKeys.filter((k) => {
        const val = k.split(".").reduce((o: unknown, p) => (o as Record<string, unknown>)?.[p], es);
        return val === "";
      });
      expect(empty).toEqual([]);
    });

    it("no empty string values in EN", () => {
      const empty = enKeys.filter((k) => {
        const val = k.split(".").reduce((o: unknown, p) => (o as Record<string, unknown>)?.[p], en);
        return val === "";
      });
      expect(empty).toEqual([]);
    });
  });
});
