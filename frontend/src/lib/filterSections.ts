import type { SectionSummary } from "@/types";

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function filterSections(
  sections: SectionSummary[],
  query: string
): SectionSummary[] {
  const q = normalize(query.trim());
  if (!q) return sections;
  return sections.filter(
    (s) =>
      normalize(s.name).includes(q) ||
      s.code.toLowerCase().includes(q) ||
      normalize(s.confederation ?? "").includes(q)
  );
}
