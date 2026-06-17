import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOcrScanner } from "./useOcrScanner";
import { useBulkCollectByCodes } from "@/hooks/useStickers";
import { useT } from "@/lib/i18n";
import { confettiBulk } from "@/lib/confetti";
import { showToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import {
  ScanLine, X, Check, Trash2, Loader2, Camera, ArrowLeft, Eye, EyeOff, Aperture,
} from "lucide-react";

export function ScannerPage() {
  const t = useT();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const bulkCollect = useBulkCollectByCodes();
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const {
    isCameraReady, isProcessing, scannedCodes, lastDetected, debugText,
    startCamera, capture, removeCode, clearAll, cleanup,
  } = useOcrScanner();

  const isSpanish = t.nav.home === "Inicio";

  const initCamera = () => {
    setCameraError(null);
    if (!videoRef.current) return;
    startCamera(videoRef.current).catch((err) => {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setCameraError(isSpanish
          ? "Permiso de camara denegado. Activa el permiso en los ajustes de tu navegador e intenta de nuevo."
          : "Camera permission denied. Enable it in your browser settings and try again.");
      } else {
        setCameraError(isSpanish
          ? "No se pudo acceder a la camara. Verifica que tu dispositivo tiene camara y que ningun otra app la esta usando."
          : "Could not access camera. Check that your device has a camera and no other app is using it.");
      }
    });
  };

  useEffect(() => {
    let cancelled = false;
    if (videoRef.current) {
      startCamera(videoRef.current).catch((err) => {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          setCameraError(isSpanish
            ? "Permiso de camara denegado. Activa el permiso en los ajustes de tu navegador e intenta de nuevo."
            : "Camera permission denied. Enable it in your browser settings and try again.");
        } else {
          setCameraError(isSpanish
            ? "No se pudo acceder a la camara. Verifica que tu dispositivo tiene camara y que ninguna otra app la esta usando."
            : "Could not access camera. Check that your device has a camera and no other app is using it.");
        }
      });
    }
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  const handleConfirm = () => {
    if (scannedCodes.length === 0) return;
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

      {/* Camera + capture button */}
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
        <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

        {/* Crosshair overlay */}
        {isCameraReady && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[70%] h-[50%] border-2 border-white/30 rounded-xl">
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-brand-400 rounded-tl" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-brand-400 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-brand-400 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-brand-400 rounded-br" />
            </div>
          </div>
        )}

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={32} className="text-white animate-spin" />
              <p className="text-white text-sm font-medium">{t.scanner.processing}</p>
            </div>
          </div>
        )}

        {/* Last detected badge */}
        {lastDetected && !isProcessing && (
          <div className="absolute top-3 right-3 bg-brand-600 text-white text-sm font-bold font-mono px-3 py-1 rounded-lg shadow-lg z-10 animate-pulse">
            {lastDetected}
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white px-6 text-center">
            <Camera size={32} className="opacity-40 mb-3" />
            <p className="text-sm leading-relaxed mb-4">{cameraError}</p>
            <button
              onClick={initCamera}
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-sm font-medium transition-colors"
            >
              {isSpanish ? "Reintentar" : "Retry"}
            </button>
          </div>
        )}
      </div>

      {/* Capture button */}
      {isCameraReady && !cameraError && (
        <button
          onClick={capture}
          disabled={isProcessing}
          className={cn(
            "w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-semibold text-sm transition-all",
            "bg-gradient-to-r from-brand-600 to-brand-500 text-white",
            "hover:from-brand-700 hover:to-brand-600 hover:shadow-lg hover:shadow-brand-600/25",
            "active:scale-[0.98]",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Aperture size={20} />
          {t.scanner.captureBtn}
        </button>
      )}

      {/* Debug */}
      {showDebug && debugText && (
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2">
          <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 break-all whitespace-pre-wrap">
            OCR: {debugText}
          </p>
        </div>
      )}

      {/* Not found feedback */}
      {debugText && !isProcessing && scannedCodes.length === 0 && !lastDetected && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-center">
          <p className="text-sm text-amber-700 dark:text-amber-300">{t.scanner.notFound}</p>
        </div>
      )}

      {/* Scanned codes list */}
      {scannedCodes.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.scanner.detected} ({scannedCodes.length})</p>
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
