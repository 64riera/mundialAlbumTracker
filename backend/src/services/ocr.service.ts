import sharp from "sharp";
import { execFile } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { randomBytes } from "crypto";
import { db } from "../lib/db";

const OCR_SCRIPT = join(__dirname, "../../scripts/ocr_recognize.py");

// --- String Matching ---

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function matchCodes(rawText: string, validCodes: string[]): string[] {
  const validPrefixes = new Set(validCodes.map((c) => c.split("-")[0]));

  const pattern = /([A-Z]{2,4})\s*[-–—.:;,]?\s*(\d{1,2})/gi;
  const candidates: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(rawText)) !== null) {
    candidates.push(`${m[1].toUpperCase()}-${m[2]}`);
  }

  const words = rawText.toUpperCase().replace(/[^A-Z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  for (let i = 0; i < words.length - 1; i++) {
    if (/^[A-Z]{2,4}$/.test(words[i]) && /^\d{1,2}$/.test(words[i + 1])) {
      candidates.push(`${words[i]}-${words[i + 1]}`);
    }
  }

  // Single token like "IRN18" → "IRN-18"
  for (const w of words) {
    const single = w.match(/^([A-Z]{2,4})(\d{1,2})$/);
    if (single) candidates.push(`${single[1]}-${single[2]}`);
  }

  const matched: { code: string; dist: number }[] = [];
  for (const c of [...new Set(candidates)]) {
    const [prefix] = c.split("-");

    let prefixOk = validPrefixes.has(prefix);
    if (!prefixOk) {
      for (const vp of validPrefixes) {
        if (levenshtein(prefix, vp) <= 1) { prefixOk = true; break; }
      }
    }
    if (!prefixOk) continue;

    if (validCodes.includes(c)) {
      matched.push({ code: c, dist: 0 });
      continue;
    }
    let best = "", bestDist = 2;
    for (const v of validCodes) {
      const d = levenshtein(c, v);
      if (d < bestDist) { bestDist = d; best = v; }
      if (d === 0) break;
    }
    if (bestDist <= 1) matched.push({ code: best, dist: bestDist });
  }

  const unique = new Map<string, number>();
  for (const { code, dist } of matched) {
    const existing = unique.get(code);
    if (existing === undefined || dist < existing) unique.set(code, dist);
  }

  return [...unique.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([code]) => code)
    .slice(0, 3);
}

// --- OCR Engines ---

function runRapidOcr(imagePath: string): Promise<string[]> {
  return new Promise((resolve) => {
    execFile("python3", [OCR_SCRIPT, imagePath], { timeout: 15000 }, (err, stdout) => {
      if (err) return resolve([]);
      try {
        const detections: { text: string; confidence: number }[] = JSON.parse(stdout.trim());
        return resolve(detections.map((d) => d.text));
      } catch {
        return resolve([]);
      }
    });
  });
}

function runTesseract(imagePath: string, psm: string): Promise<string> {
  return new Promise((resolve) => {
    execFile(
      "tesseract",
      [imagePath, "stdout", "--oem", "1", "--psm", psm,
       "-c", "tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 "],
      { timeout: 8000 },
      (err, stdout) => resolve(err ? "" : stdout.trim())
    );
  });
}

// --- Main Entry Point ---

export async function recognizeSticker(base64: string): Promise<{ rawText: string; codes: string[] }> {
  const raw = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), "base64");
  const allCodes = await db.sticker.findMany({ select: { code: true } });
  const validCodes = allCodes.map((s) => s.code);

  const id = randomBytes(6).toString("hex");
  const imgPath = join(tmpdir(), `ocr-${id}.jpg`);
  writeFileSync(imgPath, raw);

  try {
    // Phase 1: RapidOCR — scene-text optimized, detects + recognizes in one pass
    const texts = await runRapidOcr(imgPath);
    if (texts.length > 0) {
      const combined = texts.join(" ");
      const codes = matchCodes(combined, validCodes);
      if (codes.length > 0) {
        return { rawText: `[rapid] ${combined}`, codes };
      }
    }

    // Phase 2: Tesseract with CLAHE contrast enhancement (tessdata_best model)
    const enhanced = await sharp(raw)
      .resize({ width: 1500 })
      .grayscale()
      .clahe({ width: 150, height: 150 })
      .sharpen({ sigma: 1 })
      .png()
      .toBuffer();
    const tessPath = join(tmpdir(), `ocr-${id}-tess.png`);
    writeFileSync(tessPath, enhanced);

    for (const psm of ["11", "6"]) {
      const text = await runTesseract(tessPath, psm);
      if (text) {
        const codes = matchCodes(text, validCodes);
        if (codes.length > 0) {
          try { unlinkSync(tessPath); } catch {}
          return { rawText: `[tess-psm${psm}] ${text}`, codes };
        }
      }
    }
    try { unlinkSync(tessPath); } catch {}

    // Phase 3: Tesseract inverted (for white text on dark badge)
    const inverted = await sharp(raw)
      .resize({ width: 1500 })
      .grayscale()
      .negate({ alpha: false })
      .clahe({ width: 150, height: 150 })
      .sharpen({ sigma: 1 })
      .png()
      .toBuffer();
    const invPath = join(tmpdir(), `ocr-${id}-inv.png`);
    writeFileSync(invPath, inverted);

    for (const psm of ["11", "6", "7"]) {
      const text = await runTesseract(invPath, psm);
      if (text) {
        const codes = matchCodes(text, validCodes);
        if (codes.length > 0) {
          try { unlinkSync(invPath); } catch {}
          return { rawText: `[tess-inv-psm${psm}] ${text}`, codes };
        }
      }
    }
    try { unlinkSync(invPath); } catch {}

    const debugInfo = texts.length > 0 ? `[rapid-nomatch] ${texts.join(" ")}` : "No codes detected";
    return { rawText: debugInfo, codes: [] };
  } finally {
    try { unlinkSync(imgPath); } catch {}
  }
}
