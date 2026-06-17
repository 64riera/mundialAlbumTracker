import { useState, useRef, useCallback, useEffect } from "react";
import { createWorker, Worker } from "tesseract.js";
import { matchRawTextToValidCodes, extractStickerCodes } from "@/lib/ocrMatcher";

interface OcrScannerState {
  isReady: boolean;
  isScanning: boolean;
  scannedCodes: string[];
  lastDetected: string | null;
  debugText: string;
  debugImage: string;
}

function processCodeRegion(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  rect: { x: number; y: number; w: number; h: number }
) {
  const SCALE = 4;
  const { x, y, w, h } = rect;

  canvas.width = w * SCALE;
  canvas.height = h * SCALE;

  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(video, x, y, w, h, 0, 0, canvas.width, canvas.height);

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;

  // Grayscale
  for (let i = 0; i < d.length; i += 4) {
    const g = Math.round(d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114);
    d[i] = g; d[i + 1] = g; d[i + 2] = g;
  }

  // Find mean to decide if text is light-on-dark (needs inversion)
  let sum = 0;
  for (let i = 0; i < d.length; i += 4) sum += d[i];
  const mean = sum / (canvas.width * canvas.height);
  const needsInvert = mean < 140;

  // Invert if dark background + contrast stretch
  let min = 255, max = 0;
  for (let i = 0; i < d.length; i += 4) {
    const v = needsInvert ? 255 - d[i] : d[i];
    d[i] = v; d[i + 1] = v; d[i + 2] = v;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = max - min || 1;
  for (let i = 0; i < d.length; i += 4) {
    const stretched = Math.min(255, Math.max(0, Math.round(((d[i] - min) / range) * 255)));
    d[i] = stretched; d[i + 1] = stretched; d[i + 2] = stretched;
  }

  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}

export function useOcrScanner(validCodes: string[]) {
  const [state, setState] = useState<OcrScannerState>({
    isReady: false,
    isScanning: false,
    scannedCodes: [],
    lastDetected: null,
    debugText: "",
    debugImage: "",
  });

  const workerRef = useRef<Worker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const scannedSetRef = useRef(new Set<string>());
  const busyRef = useRef(false);

  const getOffscreen = useCallback(() => {
    if (!offscreenRef.current) offscreenRef.current = document.createElement("canvas");
    return offscreenRef.current;
  }, []);

  const initWorker = useCallback(async () => {
    const worker = await createWorker("eng", 1, { logger: () => {} });
    await worker.setParameters({
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ",
      tessedit_pageseg_mode: "7" as unknown as undefined, // single line
    });
    workerRef.current = worker;
    setState((s) => ({ ...s, isReady: true }));
  }, []);

  const startCamera = useCallback(async (video: HTMLVideoElement) => {
    videoRef.current = video;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
    });
    video.srcObject = stream;
    await video.play();
  }, []);

  const captureAndRecognize = useCallback(async () => {
    if (busyRef.current) return;
    const video = videoRef.current;
    const worker = workerRef.current;
    if (!video || !worker || video.readyState < 2) return;

    busyRef.current = true;
    try {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (vw === 0 || vh === 0) return;

      // Target rectangle: center of the frame, sized for the code badge
      const rect = {
        x: Math.round(vw * 0.2),
        y: Math.round(vh * 0.3),
        w: Math.round(vw * 0.6),
        h: Math.round(vh * 0.4),
      };

      const dataUrl = processCodeRegion(video, getOffscreen(), rect);
      const { data } = await worker.recognize(dataUrl);
      const rawText = data.text.trim();

      setState((s) => ({ ...s, debugText: rawText, debugImage: dataUrl }));

      const codes = validCodes.length > 0
        ? matchRawTextToValidCodes(rawText, validCodes)
        : extractStickerCodes(rawText);
      if (codes.length === 0) return;

      const newCodes = codes.filter((c) => !scannedSetRef.current.has(c));
      if (newCodes.length === 0) return;

      newCodes.forEach((c) => scannedSetRef.current.add(c));
      setState((s) => ({
        ...s,
        scannedCodes: [...s.scannedCodes, ...newCodes],
        lastDetected: newCodes[newCodes.length - 1],
      }));
    } finally {
      busyRef.current = false;
    }
  }, [getOffscreen, validCodes]);

  const startScanning = useCallback(() => {
    if (intervalRef.current) return;
    setState((s) => ({ ...s, isScanning: true }));
    intervalRef.current = window.setInterval(captureAndRecognize, 1000);
  }, [captureAndRecognize]);

  const stopScanning = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setState((s) => ({ ...s, isScanning: false }));
  }, []);

  const removeCode = useCallback((code: string) => {
    scannedSetRef.current.delete(code);
    setState((s) => ({ ...s, scannedCodes: s.scannedCodes.filter((c) => c !== code) }));
  }, []);

  const clearAll = useCallback(() => {
    scannedSetRef.current.clear();
    setState((s) => ({ ...s, scannedCodes: [], lastDetected: null, debugText: "", debugImage: "" }));
  }, []);

  const cleanup = useCallback(() => {
    stopScanning();
    const video = videoRef.current;
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
    workerRef.current?.terminate();
    workerRef.current = null;
  }, [stopScanning]);

  useEffect(() => { return cleanup; }, [cleanup]);

  return { ...state, initWorker, startCamera, startScanning, stopScanning, removeCode, clearAll, cleanup };
}
