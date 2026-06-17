import { useState, useRef, useCallback, useEffect } from "react";
import { api } from "@/lib/api";

interface OcrScannerState {
  isCameraReady: boolean;
  isProcessing: boolean;
  scannedCodes: string[];
  lastDetected: string | null;
  debugText: string;
}

export function useOcrScanner() {
  const [state, setState] = useState<OcrScannerState>({
    isCameraReady: false,
    isProcessing: false,
    scannedCodes: [],
    lastDetected: null,
    debugText: "",
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scannedSetRef = useRef(new Set<string>());

  const startCamera = useCallback(async (video: HTMLVideoElement) => {
    if (video.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }

    videoRef.current = video;
    if (!canvasRef.current) canvasRef.current = document.createElement("canvas");

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera API not available. Requires HTTPS.");
    }

    const constraintFallbacks: MediaStreamConstraints[] = [
      { video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } } },
      { video: { facingMode: "environment" } },
      { video: true },
    ];

    let stream: MediaStream | null = null;
    for (const constraints of constraintFallbacks) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        break;
      } catch (err) {
        if (err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "SecurityError")) {
          throw err;
        }
      }
    }

    if (!stream) {
      throw new Error("No compatible camera found");
    }

    video.srcObject = stream;
    await video.play();
    setState((s) => ({ ...s, isCameraReady: true }));
  }, []);

  const capture = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    setState((s) => ({ ...s, isProcessing: true, debugText: "" }));

    try {
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      canvas.width = vw;
      canvas.height = vh;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0, vw, vh);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

      const { data } = await api.post<{ rawText: string; codes: string[] }>("/api/ocr/recognize", { image: dataUrl });

      setState((s) => ({ ...s, debugText: data.rawText }));

      if (data.codes.length === 0) return;

      const newCodes = data.codes.filter((c) => !scannedSetRef.current.has(c));
      if (newCodes.length === 0) return;

      newCodes.forEach((c) => scannedSetRef.current.add(c));
      setState((s) => ({
        ...s,
        scannedCodes: [...s.scannedCodes, ...newCodes],
        lastDetected: newCodes[newCodes.length - 1],
      }));
    } finally {
      setState((s) => ({ ...s, isProcessing: false }));
    }
  }, []);

  const removeCode = useCallback((code: string) => {
    scannedSetRef.current.delete(code);
    setState((s) => ({ ...s, scannedCodes: s.scannedCodes.filter((c) => c !== code) }));
  }, []);

  const clearAll = useCallback(() => {
    scannedSetRef.current.clear();
    setState((s) => ({ ...s, scannedCodes: [], lastDetected: null, debugText: "" }));
  }, []);

  const cleanup = useCallback(() => {
    const video = videoRef.current;
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
  }, []);

  useEffect(() => { return cleanup; }, [cleanup]);

  return { ...state, startCamera, capture, removeCode, clearAll, cleanup };
}
