const CODE_PATTERN = /\b([A-Z]{2,4})\s*[-–—]?\s*(\d{1,2})\b/gi;

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
