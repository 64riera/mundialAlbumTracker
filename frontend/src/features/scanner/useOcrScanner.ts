import { useState, useRef, useCallback, useEffect } from "react";
import { createWorker, Worker } from "tesseract.js";
import { extractStickerCodes } from "@/lib/ocrMatcher";

interface OcrScannerState {
  isReady: boolean;
  isScanning: boolean;
  scannedCodes: string[];
  lastDetected: string | null;
  debugText: string;
  debugImage: string;
}

const SCALE = 2;

function adaptiveThreshold(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;

  let sum = 0;
  for (let i = 0; i < d.length; i += 4) {
    sum += d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
  }
  const mean = sum / (w * h);
  const thresh = mean * 0.85;

  for (let i = 0; i < d.length; i += 4) {
    const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    const val = gray > thresh ? 255 : 0;
    d[i] = val;
    d[i + 1] = val;
    d[i + 2] = val;
  }
  ctx.putImageData(img, 0, 0);
}

export function useOcrScanner() {
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
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement("canvas");
    }
    return offscreenRef.current;
  }, []);

  const initWorker = useCallback(async () => {
    const worker = await createWorker("eng", 1, {
      logger: () => {},
    });
    await worker.setParameters({
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789- ",
    });
    workerRef.current = worker;
    setState((s) => ({ ...s, isReady: true }));
  }, []);

  const startCamera = useCallback(async (video: HTMLVideoElement) => {
    videoRef.current = video;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
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

      const cropH = Math.round(vh * 0.5);
      const cropY = Math.round((vh - cropH) / 2);

      const canvas = getOffscreen();
      canvas.width = vw * SCALE;
      canvas.height = cropH * SCALE;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(video, 0, cropY, vw, cropH, 0, 0, canvas.width, canvas.height);

      adaptiveThreshold(ctx, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/png");
      const { data } = await worker.recognize(dataUrl);
      const rawText = data.text.trim();

      setState((s) => ({ ...s, debugText: rawText, debugImage: dataUrl }));

      const codes = extractStickerCodes(rawText);
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
  }, [getOffscreen]);

  const startScanning = useCallback(() => {
    if (intervalRef.current) return;
    setState((s) => ({ ...s, isScanning: true }));
    intervalRef.current = window.setInterval(captureAndRecognize, 1200);
  }, [captureAndRecognize]);

  const stopScanning = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
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

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    ...state,
    initWorker,
    startCamera,
    startScanning,
    stopScanning,
    removeCode,
    clearAll,
    cleanup,
  };
}
