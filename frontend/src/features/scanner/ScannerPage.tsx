import { useRef, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useOcrScanner } from "./useOcrScanner";
import { useStickers, useBulkCollectByCodes } from "@/hooks/useStickers";
import { useT } from "@/lib/i18n";
import { confettiBulk } from "@/lib/confetti";
import { showToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import {
  ScanLine, X, Check, Trash2, Loader2, Camera, ArrowLeft, Eye, EyeOff,
} from "lucide-react";

export function ScannerPage() {
  const t = useT();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const bulkCollect = useBulkCollectByCodes();
  const { data: allStickers = [] } = useStickers();
  const validCodes = useMemo(() => allStickers.map((s) => s.code), [allStickers]);
  const [cameraError, setCameraError] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const {
    isReady, isScanning, scannedCodes, lastDetected, debugText, debugImage,
    initWorker, startCamera, startScanning, stopScanning, removeCode, clearAll, cleanup,
  } = useOcrScanner(validCodes);

  useEffect(() => { initWorker(); }, [initWorker]);

  useEffect(() => {
    if (isReady && videoRef.current) {
      startCamera(videoRef.current)
        .then(() => startScanning())
        .catch(() => setCameraError(true));
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
      <div className="flex items-center gap-3">
        <button onClick={() => { cleanup(); navigate(-1); }}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <ScanLine size={22} className="text-brand-600" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.scanner.title}</h1>
        </div>
        <button onClick={() => setShowDebug((v) => !v)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1" title="Debug">
          {showDebug ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">{t.scanner.description}</p>

      {/* Camera with target */}
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
        <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

        {isScanning && (
          <>
            {/* Dim everything outside the target */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-x-0 top-0 h-[30%] bg-black/50" />
              <div className="absolute inset-x-0 bottom-0 h-[30%] bg-black/50" />
              <div className="absolute left-0 top-[30%] bottom-[30%] w-[20%] bg-black/50" />
              <div className="absolute right-0 top-[30%] bottom-[30%] w-[20%] bg-black/50" />
            </div>

            {/* Target rectangle with corners */}
            <div className="absolute left-[20%] right-[20%] top-[30%] bottom-[30%] pointer-events-none">
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-brand-400 rounded-tl" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-brand-400 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-brand-400 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-brand-400 rounded-br" />
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-400/50 animate-[scan_2s_ease-in-out_infinite]" />
            </div>

            {/* Hint */}
            <div className="absolute bottom-[32%] left-0 right-0 text-center pointer-events-none">
              <span className="bg-black/60 backdrop-blur-sm text-white text-[11px] px-3 py-1 rounded-full">
                {t.scanner.targetHint ?? "TUN 14"}
              </span>
            </div>
          </>
        )}

        <div className="absolute top-3 left-3 z-10">
          {!isReady ? (
            <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
              <Loader2 size={12} className="animate-spin" />{t.scanner.loading}
            </span>
          ) : isScanning ? (
            <span className="flex items-center gap-1.5 bg-brand-600/80 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />{t.scanner.scanning}
            </span>
          ) : null}
        </div>

        {lastDetected && (
          <div className="absolute top-3 right-3 bg-brand-600 text-white text-sm font-bold font-mono px-3 py-1 rounded-lg shadow-lg z-10 animate-pulse">
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

      {/* Debug */}
      {showDebug && (
        <div className="space-y-2">
          {debugImage && <img src={debugImage} alt="OCR input" className="w-full rounded-lg border border-slate-200 dark:border-slate-700" />}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2">
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 break-all whitespace-pre-wrap">
              OCR: {debugText || "—"}
            </p>
          </div>
        </div>
      )}

      {isReady && !cameraError && (
        <button onClick={isScanning ? stopScanning : startScanning}
          className={cn("w-full py-2.5 rounded-xl text-sm font-medium transition-all",
            isScanning ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200" : "bg-brand-600 text-white hover:bg-brand-700")}>
          {isScanning ? t.scanner.pause : t.scanner.resume}
        </button>
      )}

      {scannedCodes.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t.scanner.detected} ({scannedCodes.length})
            </p>
            <button onClick={clearAll} className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors">
              <Trash2 size={12} />{t.scanner.clearAll}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {scannedCodes.map((code) => (
              <span key={code} className="inline-flex items-center gap-1 bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-700 text-brand-700 dark:text-brand-300 text-xs font-bold font-mono px-2 py-1 rounded-lg">
                {code}
                <button onClick={() => removeCode(code)} className="text-brand-400 hover:text-brand-700 transition-colors"><X size={10} /></button>
              </span>
            ))}
          </div>
          <button onClick={handleConfirm} disabled={bulkCollect.isPending}
            className={cn("w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all",
              "bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:from-brand-700 hover:to-brand-600 hover:shadow-lg hover:shadow-brand-600/25",
              "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed")}>
            {bulkCollect.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {bulkCollect.isPending ? t.quickadd.adding : `${t.scanner.confirm} (${scannedCodes.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
