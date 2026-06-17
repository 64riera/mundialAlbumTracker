import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { useImportAlbum } from "@/hooks/useImport";
import { parseImportData } from "@/lib/importParser";
import { showToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import {
  QrCode,
  Camera,
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  X,
} from "lucide-react";

type Tab = "scan" | "paste";

export function ImportPage() {
  const navigate = useNavigate();
  const importAlbum = useImportAlbum();
  const [tab, setTab] = useState<Tab>("scan");
  const [pasteText, setPasteText] = useState("");
  const [parsedCodes, setParsedCodes] = useState<string[]>([]);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  const stopScanner = useCallback(() => {
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop().catch(() => {});
    }
    setScannerActive(false);
  }, []);

  const startScanner = useCallback(async () => {
    if (!scannerContainerRef.current) return;

    stopScanner();

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          setScanResult(text);
          const codes = parseImportData(text);
          setParsedCodes(codes);
          scanner.stop().catch(() => {});
          setScannerActive(false);
        },
        () => {}
      );
      setScannerActive(true);
    } catch {
      showToast("No se pudo acceder a la camara");
      setTab("paste");
    }
  }, [stopScanner]);

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (tab === "scan" && !scanResult) {
      const timer = setTimeout(startScanner, 300);
      return () => clearTimeout(timer);
    }
    if (tab !== "scan") {
      stopScanner();
    }
  }, [tab, scanResult, startScanner, stopScanner]);

  const handleParsePaste = () => {
    const codes = parseImportData(pasteText);
    setParsedCodes(codes);
  };

  const handleImport = () => {
    if (parsedCodes.length === 0) return;
    importAlbum.mutate(parsedCodes, {
      onSuccess: (data) => {
        showToast(
          `${data.imported} figurita${data.imported !== 1 ? "s" : ""} importada${data.imported !== 1 ? "s" : ""}` +
            (data.notFound.length > 0 ? ` (${data.notFound.length} no encontradas)` : "")
        );
        navigate("/stats");
      },
    });
  };

  const handleReset = () => {
    setParsedCodes([]);
    setScanResult(null);
    setPasteText("");
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2.5">
          <QrCode size={22} className="text-brand-600" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Importar album
          </h1>
        </div>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Escanea el codigo QR de la app Figuritas o pega el texto exportado para importar tu album.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        <button
          onClick={() => setTab("scan")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors",
            tab === "scan"
              ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          )}
        >
          <Camera size={16} />
          Escanear QR
        </button>
        <button
          onClick={() => setTab("paste")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors",
            tab === "paste"
              ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          )}
        >
          <FileText size={16} />
          Pegar texto
        </button>
      </div>

      {/* Scanner */}
      {tab === "scan" && !parsedCodes.length && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div
            id="qr-reader"
            ref={scannerContainerRef}
            className="w-full aspect-square max-h-80"
          />
          {!scannerActive && !scanResult && (
            <div className="p-4 text-center">
              <button
                onClick={startScanner}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Iniciar camara
              </button>
            </div>
          )}
        </div>
      )}

      {/* Paste */}
      {tab === "paste" && !parsedCodes.length && (
        <div className="space-y-3">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={"Pega aqui los codigos exportados.\nEj: ARG-1, ARG-2, ESP-1, BRA-5..."}
            rows={8}
            className={cn(
              "w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm font-mono",
              "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100",
              "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent",
              "placeholder:text-slate-400 resize-none"
            )}
          />
          <button
            onClick={handleParsePaste}
            disabled={!pasteText.trim()}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all",
              "bg-brand-600 text-white hover:bg-brand-700",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Upload size={16} />
            Analizar codigos
          </button>
        </div>
      )}

      {/* Parsed results */}
      {parsedCodes.length > 0 && (
        <div className="space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={18} className="text-emerald-600" />
              <p className="font-medium text-emerald-800 dark:text-emerald-300">
                {parsedCodes.length} figurita{parsedCodes.length !== 1 ? "s" : ""} detectada{parsedCodes.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {parsedCodes.map((code) => (
                <span
                  key={code}
                  className="inline-block bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-mono px-2 py-0.5 rounded"
                >
                  {code}
                </span>
              ))}
            </div>
          </div>

          {scanResult && (
            <details className="text-xs text-slate-400">
              <summary className="cursor-pointer hover:text-slate-600">Ver datos escaneados</summary>
              <pre className="mt-1 bg-slate-100 dark:bg-slate-800 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
                {scanResult}
              </pre>
            </details>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={importAlbum.isPending}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all",
                "bg-brand-600 text-white hover:bg-brand-700",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {importAlbum.isPending ? (
                <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <Upload size={16} />
              )}
              {importAlbum.isPending ? "Importando..." : "Importar"}
            </button>
          </div>

          {importAlbum.error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-500" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  Error al importar. Intenta de nuevo.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
