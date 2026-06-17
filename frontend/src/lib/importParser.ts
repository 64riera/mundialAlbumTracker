export function parseImportData(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  // Try JSON: {"stickers":["ARG-1","ESP-2"]} or ["ARG-1","ESP-2"]
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed.filter((s): s is string => typeof s === "string");
    if (parsed.stickers && Array.isArray(parsed.stickers)) return parsed.stickers;
    if (parsed.codes && Array.isArray(parsed.codes)) return parsed.codes;
  } catch {
    // Not JSON, continue
  }

  // Split by common delimiters: comma, semicolon, newline, pipe
  const codes = trimmed
    .split(/[,;\n|]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    // Normalize: "ARG 1" → "ARG-1", "ARG1" → "ARG-1"
    .map((s) => s.replace(/^([A-Za-z]+)\s*(\d+)$/, "$1-$2"));

  return [...new Set(codes)];
}
