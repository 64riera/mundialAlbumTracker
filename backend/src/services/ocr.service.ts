import sharp from "sharp";
import { execFile } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
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

  const words = rawText.toUpperCase().replace(/[^A-Z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  for (let i = 0; i < words.length - 1; i++) {
    if (/^[A-Z]{2,4}$/.test(words[i]) && /^\d{1,2}$/.test(words[i + 1])) {
      candidates.push(`${words[i]}-${words[i + 1]}`);
    }
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

// --- Integral Image ---

function buildIntegralImage(data: Buffer, w: number, h: number): { integral: Float64Array; stride: number } {
  const stride = w + 1;
  const integral = new Float64Array(stride * (h + 1));
  for (let y = 0; y < h; y++) {
    let rowSum = 0;
    for (let x = 0; x < w; x++) {
      rowSum += data[y * w + x];
      integral[(y + 1) * stride + (x + 1)] = rowSum + integral[y * stride + (x + 1)];
    }
  }
  return { integral, stride };
}

function rectSum(integral: Float64Array, stride: number, x1: number, y1: number, x2: number, y2: number): number {
  return integral[y2 * stride + x2] - integral[y1 * stride + x2] - integral[y2 * stride + x1] + integral[y1 * stride + x1];
}

// --- Image Preprocessing ---

async function adaptiveThreshold(input: Buffer, scale: number, kernelR: number): Promise<Buffer> {
  const resized = await sharp(input).resize({ width: scale }).grayscale().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = resized.info;
  const { integral, stride } = buildIntegralImage(resized.data, w, h);

  const out = Buffer.alloc(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ky1 = Math.max(0, y - kernelR), ky2 = Math.min(h, y + kernelR + 1);
      const kx1 = Math.max(0, x - kernelR), kx2 = Math.min(w, x + kernelR + 1);
      const area = (ky2 - ky1) * (kx2 - kx1);
      const localMean = rectSum(integral, stride, kx1, ky1, kx2, ky2) / area;
      out[y * w + x] = resized.data[y * w + x] > localMean + 8 ? 255 : 0;
    }
  }
  return sharp(out, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();
}

// --- Region Detection ---

async function extractBadge(raw: Buffer): Promise<Buffer | null> {
  const targetW = 600;
  const resized = await sharp(raw).resize({ width: targetW }).grayscale().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = resized.info;
  const { integral, stride } = buildIntegralImage(resized.data, w, h);

  const scanH = Math.round(h * 0.5);
  const sizes = [
    { bw: Math.round(w * 0.10), bh: Math.round(h * 0.04) },
    { bw: Math.round(w * 0.13), bh: Math.round(h * 0.05) },
    { bw: Math.round(w * 0.16), bh: Math.round(h * 0.06) },
    { bw: Math.round(w * 0.20), bh: Math.round(h * 0.07) },
    { bw: Math.round(w * 0.24), bh: Math.round(h * 0.08) },
    { bw: Math.round(w * 0.28), bh: Math.round(h * 0.09) },
    { bw: Math.round(w * 0.33), bh: Math.round(h * 0.10) },
  ];

  let darkest = 255;
  let best = { x: 0, y: 0, w: 0, h: 0 };

  for (const { bw, bh } of sizes) {
    for (let y = 0; y <= scanH - bh; y += 4) {
      for (let x = 0; x <= w - bw; x += 4) {
        const mean = rectSum(integral, stride, x, y, x + bw, y + bh) / (bw * bh);
        if (mean < darkest) {
          darkest = mean;
          best = { x, y, w: bw, h: bh };
        }
      }
    }
  }

  if (darkest > 90) return null;

  // Badge must have lighter surroundings (contrast check)
  const borderPad = 15;
  const ox1 = Math.max(0, best.x - borderPad), oy1 = Math.max(0, best.y - borderPad);
  const ox2 = Math.min(w, best.x + best.w + borderPad), oy2 = Math.min(h, best.y + best.h + borderPad);
  const outerArea = (ox2 - ox1) * (oy2 - oy1) - best.w * best.h;
  if (outerArea > 0) {
    const outerSum = rectSum(integral, stride, ox1, oy1, ox2, oy2);
    const innerSum = rectSum(integral, stride, best.x, best.y, best.x + best.w, best.y + best.h);
    const borderMean = (outerSum - innerSum) / outerArea;
    if (borderMean < 130) return null;
  }

  const meta = await sharp(raw).metadata();
  const scale = meta.width! / targetW;
  const extractPad = Math.round(8 * scale);

  const left = Math.max(0, Math.round(best.x * scale) - extractPad);
  const top = Math.max(0, Math.round(best.y * scale) - extractPad);
  const right = Math.min(meta.width!, Math.round((best.x + best.w) * scale) + extractPad);
  const bottom = Math.min(meta.height!, Math.round((best.y + best.h) * scale) + extractPad);

  return sharp(raw).extract({ left, top, width: right - left, height: bottom - top }).toBuffer();
}

async function extractStickerTop(raw: Buffer): Promise<Buffer | null> {
  const targetW = 600;
  const resized = await sharp(raw).resize({ width: targetW }).grayscale().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = resized.info;
  const d = resized.data;

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

  if (maxMean < 160) return null;

  const meta = await sharp(raw).metadata();
  const origW = meta.width!, origH = meta.height!;
  const scale = origW / targetW;

  const sx = Math.max(0, Math.round(bestX * scale));
  const sy = Math.max(0, Math.round(bestY * scale));
  const sw = Math.min(origW - sx, Math.round(blockW * scale));
  const sh = Math.min(origH - sy, Math.round(blockH * 0.3 * scale));

  return sharp(raw).extract({ left: sx, top: sy, width: sw, height: sh }).toBuffer();
}

// --- Pipelines ---

interface Pipeline {
  name: string;
  process: () => Promise<Buffer>;
  psm: string;
}

function buildBadgePipelines(raw: Buffer): Pipeline[] {
  return [
    {
      name: "neg-psm7",
      process: () =>
        sharp(raw).resize({ width: 800, fit: "inside" }).grayscale()
          .negate({ alpha: false }).normalize().sharpen({ sigma: 2 }).png().toBuffer(),
      psm: "7",
    },
    {
      name: "neg-psm6",
      process: () =>
        sharp(raw).resize({ width: 800, fit: "inside" }).grayscale()
          .negate({ alpha: false }).normalize().sharpen({ sigma: 1.5 }).png().toBuffer(),
      psm: "6",
    },
    {
      name: "neg-psm11",
      process: () =>
        sharp(raw).resize({ width: 800, fit: "inside" }).grayscale()
          .negate({ alpha: false }).normalize().png().toBuffer(),
      psm: "11",
    },
  ];
}

function buildGeneralPipelines(raw: Buffer): Pipeline[] {
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

// --- Pipeline Runner ---

async function runPipelines(pipelines: Pipeline[], validCodes: string[], label: string): Promise<{ rawText: string; codes: string[] } | null> {
  const id = randomBytes(6).toString("hex");

  for (const pipeline of pipelines) {
    const processed = await pipeline.process();
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

// --- Main Entry Point ---

export async function recognizeSticker(base64: string): Promise<{ rawText: string; codes: string[] }> {
  const raw = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), "base64");
  const allCodes = await db.sticker.findMany({ select: { code: true } });
  const validCodes = allCodes.map((s) => s.code);

  // Phase 1: Dark badge detection (white text on dark pill)
  const badge = await extractBadge(raw);
  if (badge) {
    const result = await runPipelines(buildBadgePipelines(badge), validCodes, "badge");
    if (result) return result;
  }

  // Phase 2: Sticker top strip
  const stickerTop = await extractStickerTop(raw);
  if (stickerTop) {
    const result = await runPipelines(buildGeneralPipelines(stickerTop), validCodes, "crop");
    if (result) return result;
  }

  // Phase 3: Full image
  const result = await runPipelines(buildGeneralPipelines(raw), validCodes, "full");
  if (result) return result;

  return { rawText: "No codes detected", codes: [] };
}
