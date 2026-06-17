import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOcrScanner } from "./useOcrScanner";
import { useBulkCollectByCodes } from "@/hooks/useStickers";
import { useT } from "@/lib/i18n";
import { confettiBulk } from "@/lib/confetti";
import { showToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import {
  ScanLine,
  X,
  Check,
  Trash2,
  Loader2,
  Camera,
  ArrowLeft,
} from "lucide-react";

export function ScannerPage() {
  const t = useT();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bulkCollect = useBulkCollectByCodes();
  const [cameraError, setCameraError] = useState(false);

  const {
    isReady,
    isScanning,
    scannedCodes,
    lastDetected,
    initWorker,
    startCamera,
    startScanning,
    stopScanning,
    removeCode,
    clearAll,
    cleanup,
  } = useOcrScanner();

  useEffect(() => {
    initWorker();
  }, [initWorker]);

  const handleStartCamera = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    try {
      await startCamera(videoRef.current, canvasRef.current);
      startScanning();
    } catch {
      setCameraError(true);
    }
  };

  useEffect(() => {
    if (isReady && videoRef.current && canvasRef.current) {
      handleStartCamera();
    }
    return cleanup;
  }, [isReady]);

  const handleConfirm = () => {
    if (scannedCodes.length === 0) return;
    stopScanning();
    bulkCollect.mutate(scannedCodes, {
      onSuccess: (data) => {
        confettiBulk(data.updated);
        showToast(`${data.updated} ${data.updated !== 1 ? t.quickadd.stickersAdded : t.quickadd.stickerAdded}`);
        navigate("/stats");
      },
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { cleanup(); navigate(-1); }}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2.5">
          <ScanLine size={22} className="text-brand-600" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.scanner.title}</h1>
        </div>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">{t.scanner.description}</p>

      {/* Camera viewport */}
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scan region overlay */}
        {isScanning && (
          <>
            <div className="absolute inset-0 border-[3px] border-white/20 rounded-2xl pointer-events-none" />
            <div className="absolute left-4 right-4 top-[35%] bottom-[35%] border-2 border-brand-400/70 rounded-xl pointer-events-none">
              <div className="absolute inset-0 bg-brand-400/5" />
              <div className="absolute -top-px left-0 right-0 h-0.5 bg-brand-400 animate-pulse" />
            </div>
          </>
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {!isReady ? (
            <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
              <Loader2 size={12} className="animate-spin" />
              {t.scanner.loading}
            </span>
          ) : isScanning ? (
            <span className="flex items-center gap-1.5 bg-brand-600/80 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {t.scanner.scanning}
            </span>
          ) : null}
        </div>

        {/* Last detected flash */}
        {lastDetected && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-brand-600/90 backdrop-blur-sm text-white text-sm font-bold font-mono px-4 py-1.5 rounded-full animate-bounce">
            {lastDetected}
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white">
            <Camera size={32} className="opacity-40 mb-2" />
            <p className="text-sm">{t.import.cameraError}</p>
          </div>
        )}
      </div>

      {/* Scan / Pause toggle */}
      {isReady && !cameraError && (
        <button
          onClick={isScanning ? stopScanning : startScanning}
          className={cn(
            "w-full py-2.5 rounded-xl text-sm font-medium transition-all",
            isScanning
              ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
              : "bg-brand-600 text-white hover:bg-brand-700"
          )}
        >
          {isScanning ? t.scanner.pause : t.scanner.resume}
        </button>
      )}

      {/* Scanned codes list */}
      {scannedCodes.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t.scanner.detected} ({scannedCodes.length})
            </p>
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={12} />
              {t.scanner.clearAll}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {scannedCodes.map((code) => (
              <span
                key={code}
                className="inline-flex items-center gap-1 bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-700 text-brand-700 dark:text-brand-300 text-xs font-bold font-mono px-2 py-1 rounded-lg"
              >
                {code}
                <button
                  onClick={() => removeCode(code)}
                  className="text-brand-400 hover:text-brand-700 transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>

          <button
            onClick={handleConfirm}
            disabled={bulkCollect.isPending}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all",
              "bg-gradient-to-r from-brand-600 to-brand-500 text-white",
              "hover:from-brand-700 hover:to-brand-600 hover:shadow-lg hover:shadow-brand-600/25",
              "active:scale-[0.98]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {bulkCollect.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            {bulkCollect.isPending
              ? t.quickadd.adding
              : `${t.scanner.confirm} (${scannedCodes.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
