const CODE_PATTERN = /(?<![A-Z])([A-Z]{2,4})\s*[-–—.:;,]?\s*(\d{1,2})(?!\d)/gi;

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function extractStickerCodes(rawText: string): string[] {
  const codes: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = CODE_PATTERN.exec(rawText)) !== null) {
    const prefix = match[1].toUpperCase();
    const num = match[2];
    codes.push(`${prefix}-${num}`);
  }
  CODE_PATTERN.lastIndex = 0;

  if (/\b00\b/.test(rawText)) {
    codes.push("00");
  }

  return [...new Set(codes)];
}

function fuzzyFind(candidate: string, validCodes: string[], maxDistance: number): string | null {
  const upper = candidate.toUpperCase();
  if (validCodes.includes(upper)) return upper;

  let bestCode = "";
  let bestDist = maxDistance + 1;
  for (const valid of validCodes) {
    const dist = levenshtein(upper, valid);
    if (dist < bestDist) {
      bestDist = dist;
      bestCode = valid;
    }
    if (dist === 0) return valid;
  }
  return bestDist <= maxDistance ? bestCode : null;
}

export function matchToValidCodes(
  candidates: string[],
  validCodes: string[],
  maxDistance = 2
): string[] {
  const matched: string[] = [];

  for (const candidate of candidates) {
    const found = fuzzyFind(candidate, validCodes, maxDistance);
    if (found) matched.push(found);
  }

  return [...new Set(matched)];
}

export function matchRawTextToValidCodes(
  rawText: string,
  validCodes: string[],
  maxDistance = 2
): string[] {
  const candidates = extractStickerCodes(rawText);
  const fromRegex = matchToValidCodes(candidates, validCodes, maxDistance);
  if (fromRegex.length > 0) return fromRegex;

  // Fallback: split raw text into words and try fuzzy matching chunks
  const words = rawText.toUpperCase().replace(/[^A-Z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const fallback: string[] = [];

  for (let i = 0; i < words.length - 1; i++) {
    const combo = `${words[i]}-${words[i + 1]}`;
    const found = fuzzyFind(combo, validCodes, maxDistance);
    if (found) fallback.push(found);
  }

  return [...new Set(fallback)];
}
