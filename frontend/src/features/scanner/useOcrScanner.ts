import { useState, useRef, useCallback, useEffect } from "react";
import { createWorker, Worker } from "tesseract.js";
import { extractStickerCodes } from "@/lib/ocrMatcher";

interface OcrScannerState {
  isReady: boolean;
  isScanning: boolean;
  scannedCodes: string[];
  lastDetected: string | null;
  debugText: string;
}

function preprocessFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    const val = gray > 140 ? 255 : 0;
    d[i] = val;
    d[i + 1] = val;
    d[i + 2] = val;
  }
  ctx.putImageData(imageData, 0, 0);
}

export function useOcrScanner() {
  const [state, setState] = useState<OcrScannerState>({
    isReady: false,
    isScanning: false,
    scannedCodes: [],
    lastDetected: null,
    debugText: "",
  });

  const workerRef = useRef<Worker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const scannedSetRef = useRef(new Set<string>());
  const busyRef = useRef(false);

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

  const startCamera = useCallback(async (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    videoRef.current = video;
    canvasRef.current = canvas;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
    });
    video.srcObject = stream;
    await video.play();
  }, []);

  const captureAndRecognize = useCallback(async () => {
    if (busyRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const worker = workerRef.current;
    if (!video || !canvas || !worker || video.readyState < 2) return;

    busyRef.current = true;

    try {
      const vw = video.videoWidth;
      const vh = video.videoHeight;

      const cropH = Math.round(vh * 0.35);
      const cropY = Math.round((vh - cropH) / 2);
      const cropW = vw;

      canvas.width = cropW;
      canvas.height = cropH;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, cropY, cropW, cropH, 0, 0, cropW, cropH);
      preprocessFrame(ctx, cropW, cropH);

      const { data } = await worker.recognize(canvas);

      const rawText = data.text.trim();
      setState((s) => ({ ...s, debugText: rawText }));

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
  }, []);

  const startScanning = useCallback(() => {
    if (intervalRef.current) return;
    setState((s) => ({ ...s, isScanning: true }));
    intervalRef.current = window.setInterval(captureAndRecognize, 1000);
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
    setState((s) => ({
      ...s,
      scannedCodes: s.scannedCodes.filter((c) => c !== code),
    }));
  }, []);

  const clearAll = useCallback(() => {
    scannedSetRef.current.clear();
    setState((s) => ({ ...s, scannedCodes: [], lastDetected: null, debugText: "" }));
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
