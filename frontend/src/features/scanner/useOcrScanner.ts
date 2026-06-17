import { useState, useRef, useCallback, useEffect } from "react";
import { createWorker, Worker } from "tesseract.js";
import { extractStickerCodes } from "@/lib/ocrMatcher";

interface OcrScannerState {
  isReady: boolean;
  isScanning: boolean;
  scannedCodes: string[];
  lastDetected: string | null;
}

export function useOcrScanner() {
  const [state, setState] = useState<OcrScannerState>({
    isReady: false,
    isScanning: false,
    scannedCodes: [],
    lastDetected: null,
  });

  const workerRef = useRef<Worker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const scannedSetRef = useRef(new Set<string>());

  const initWorker = useCallback(async () => {
    const worker = await createWorker("eng", 1, {
      logger: () => {},
    });

    await worker.setParameters({
      tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-",
      tessedit_pageseg_mode: "7" as unknown as undefined,
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

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }, []);

  const captureAndRecognize = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const worker = workerRef.current;
    if (!video || !canvas || !worker || video.readyState < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cropH = Math.round(canvas.height * 0.3);
    const cropY = Math.round((canvas.height - cropH) / 2);
    ctx.drawImage(video, 0, cropY, canvas.width, cropH, 0, 0, canvas.width, cropH);

    const { data } = await worker.recognize(canvas, {
      rectangle: { top: 0, left: 0, width: canvas.width, height: cropH },
    });

    const codes = extractStickerCodes(data.text);
    if (codes.length === 0) return;

    const newCodes = codes.filter((c) => !scannedSetRef.current.has(c));
    if (newCodes.length === 0) return;

    newCodes.forEach((c) => scannedSetRef.current.add(c));
    setState((s) => ({
      ...s,
      scannedCodes: [...s.scannedCodes, ...newCodes],
      lastDetected: newCodes[newCodes.length - 1],
    }));
  }, []);

  const startScanning = useCallback(() => {
    if (intervalRef.current) return;
    setState((s) => ({ ...s, isScanning: true }));
    intervalRef.current = window.setInterval(captureAndRecognize, 1500);
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
    setState((s) => ({ ...s, scannedCodes: [], lastDetected: null }));
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
