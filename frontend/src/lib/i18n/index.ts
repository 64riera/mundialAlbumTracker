import { create } from "zustand";
import { persist } from "zustand/middleware";
import { es } from "./es";
import { en } from "./en";

export type Lang = "es" | "en";

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends object ? DeepStringify<T[K]> : string;
};

export type Translations = DeepStringify<typeof es>;

const dictionaries: Record<Lang, Translations> = { es, en };

interface LangStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangStore>()(
  persist(
    (set) => ({
      lang: "es",
      setLang: (lang) => set({ lang }),
    }),
    { name: "lang" }
  )
);

export function useT(): Translations {
  const lang = useLangStore((s) => s.lang);
  return dictionaries[lang];
}
