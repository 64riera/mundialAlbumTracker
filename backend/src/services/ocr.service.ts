import sharp from "sharp";
import { execFile } from "child_process";
import { writeFileSync, readFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { randomBytes } from "crypto";
import { db } from "../lib/db";

function tesseract(imagePath: string, psm: string): Promise<string> {
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

  // Word-pair fallback: "TUN 14" as separate words
  const words = rawText.toUpperCase().replace(/[^A-Z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  for (let i = 0; i < words.length - 1; i++) {
    if (/^[A-Z]{2,4}$/.test(words[i]) && /^\d{1,2}$/.test(words[i + 1])) {
      candidates.push(`${words[i]}-${words[i + 1]}`);
    }
  }

  const matched: { code: string; dist: number }[] = [];
  for (const c of [...new Set(candidates)]) {
    const [prefix] = c.split("-");

    // Strict: prefix must exist or be 1 edit away from a valid prefix
    let prefixOk = validPrefixes.has(prefix);
    if (!prefixOk) {
      for (const vp of validPrefixes) {
        if (levenshtein(prefix, vp) <= 1) { prefixOk = true; break; }
      }
    }
    if (!prefixOk) continue;

    // Full code: exact or distance 1
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

  // Deduplicate and sort by distance (exact first)
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

async function adaptiveThreshold(input: Buffer, scale: number, kernelR: number): Promise<Buffer> {
  const resized = await sharp(input).resize({ width: scale }).grayscale().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = resized.info;
  const src = resized.data;

  const integral = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let rowSum = 0;
    for (let x = 0; x < w; x++) {
      rowSum += src[y * w + x];
      integral[(y + 1) * (w + 1) + (x + 1)] = rowSum + integral[y * (w + 1) + (x + 1)];
    }
  }

  const out = Buffer.alloc(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const y1 = Math.max(0, y - kernelR), y2 = Math.min(h - 1, y + kernelR);
      const x1 = Math.max(0, x - kernelR), x2 = Math.min(w - 1, x + kernelR);
      const area = (y2 - y1 + 1) * (x2 - x1 + 1);
      const sum = integral[(y2 + 1) * (w + 1) + (x2 + 1)]
                - integral[y1 * (w + 1) + (x2 + 1)]
                - integral[(y2 + 1) * (w + 1) + x1]
                + integral[y1 * (w + 1) + x1];
      const localMean = sum / area;
      out[y * w + x] = src[y * w + x] > localMean + 8 ? 255 : 0;
    }
  }
  return sharp(out, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();
}

async function cropToStickerTop(raw: Buffer): Promise<Buffer | null> {
  const targetW = 600;
  const resized = await sharp(raw).resize({ width: targetW }).grayscale().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = resized.info;
  const d = resized.data;

  // Find brightest 40%-wide, 60%-tall block (the sticker is a white rectangle)
  const blockW = Math.round(w * 0.35);
  const blockH = Math.round(h * 0.5);
  let maxMean = 0, bestX = 0, bestY = 0;
  for (let y = 0; y < h - blockH; y += 8) {
    for (let x = 0; x < w - blockW; x += 8) {
      let sum = 0, count = 0;
      for (let dy = 0; dy < blockH; dy += 4) {
        for (let dx = 0; dx < blockW; dx += 4) {
          sum += d[(y + dy) * w + x + dx];
          count++;
        }
      }
      const mean = sum / count;
      if (mean > maxMean) { maxMean = mean; bestX = x; bestY = y; }
    }
  }

  if (maxMean < 160) return null; // no bright region found

  const meta = await sharp(raw).metadata();
  const origW = meta.width!, origH = meta.height!;
  const scale = origW / targetW;

  // Crop the top 25% of the sticker area (where the code badge lives)
  const sx = Math.max(0, Math.round(bestX * scale));
  const sy = Math.max(0, Math.round(bestY * scale));
  const sw = Math.min(origW - sx, Math.round(blockW * scale));
  const sh = Math.min(origH - sy, Math.round(blockH * 0.3 * scale));

  return sharp(raw).extract({ left: sx, top: sy, width: sw, height: sh }).toBuffer();
}

interface Pipeline {
  name: string;
  process: (raw: Buffer) => Promise<Buffer>;
  psm: string;
}

function buildPipelines(raw: Buffer): Pipeline[] {
  return [
    {
      name: "adaptive",
      process: () => adaptiveThreshold(raw, 1500, 25),
      psm: "11",
    },
    {
      name: "adaptive-inv",
      process: async () => {
        const buf = await adaptiveThreshold(raw, 1500, 25);
        return sharp(buf).negate({ alpha: false }).png().toBuffer();
      },
      psm: "11",
    },
    {
      name: "gray-norm",
      process: () => sharp(raw).resize({ width: 1500 }).grayscale().normalize().sharpen({ sigma: 1.5 }).png().toBuffer(),
      psm: "11",
    },
    {
      name: "neg-norm",
      process: () => sharp(raw).resize({ width: 1500 }).grayscale().negate({ alpha: false }).normalize().sharpen({ sigma: 1.5 }).png().toBuffer(),
      psm: "11",
    },
    {
      name: "gray-psm6",
      process: () => sharp(raw).resize({ width: 1500 }).grayscale().normalize().png().toBuffer(),
      psm: "6",
    },
    {
      name: "neg-psm6",
      process: () => sharp(raw).resize({ width: 1500 }).grayscale().negate({ alpha: false }).normalize().png().toBuffer(),
      psm: "6",
    },
  ];
}

async function tryPipelines(input: Buffer, validCodes: string[], label: string): Promise<{ rawText: string; codes: string[] } | null> {
  const pipelines = buildPipelines(input);
  const id = randomBytes(6).toString("hex");

  for (const pipeline of pipelines) {
    const processed = await pipeline.process(input);
    const tmpPath = join(tmpdir(), `ocr-${id}-${pipeline.name}.png`);
    writeFileSync(tmpPath, processed);

    const text = await tesseract(tmpPath, pipeline.psm);
    try { unlinkSync(tmpPath); } catch {}

    if (!text) continue;
    const codes = matchCodes(text, validCodes);
    if (codes.length > 0) {
      return { rawText: `[${label}/${pipeline.name}] ${text}`, codes };
    }
  }
  return null;
}

export async function recognizeSticker(base64: string): Promise<{ rawText: string; codes: string[] }> {
  const raw = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), "base64");

  const allCodes = await db.sticker.findMany({ select: { code: true } });
  const validCodes = allCodes.map((s) => s.code);

  // Phase 1: auto-crop to the sticker's top strip (where the code badge lives)
  const stickerTop = await cropToStickerTop(raw);
  if (stickerTop) {
    const result = await tryPipelines(stickerTop, validCodes, "crop");
    if (result) return result;
  }

  // Phase 2: full image
  const result = await tryPipelines(raw, validCodes, "full");
  if (result) return result;

  return { rawText: "No codes detected", codes: [] };
}
