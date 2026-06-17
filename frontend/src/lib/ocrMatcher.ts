const CODE_PATTERN = /(?<![A-Z])([A-Z]{2,4})\s*[-–—.]?\s*(\d{1,2})(?!\d)/gi;

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

export function matchToValidCodes(
  candidates: string[],
  validCodes: string[],
  maxDistance = 2
): string[] {
  const matched: string[] = [];

  for (const candidate of candidates) {
    const upper = candidate.toUpperCase();

    if (validCodes.includes(upper)) {
      matched.push(upper);
      continue;
    }

    let bestCode = "";
    let bestDist = maxDistance + 1;
    for (const valid of validCodes) {
      const dist = levenshtein(upper, valid);
      if (dist < bestDist) {
        bestDist = dist;
        bestCode = valid;
      }
      if (dist === 0) break;
    }

    if (bestDist <= maxDistance) {
      matched.push(bestCode);
    }
  }

  return [...new Set(matched)];
}
