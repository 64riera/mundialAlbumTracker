import { useState, useRef, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useCompareAlbum } from "@/hooks/useCompare";
import { parseImportData } from "@/lib/importParser";
import { useT } from "@/lib/i18n";
import { showToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { CompareResults } from "./CompareResults";
import {
  ArrowLeftRight,
  Camera,
  FileText,
  Search,
  AlertTriangle,
} from "lucide-react";
import type { CompareResult } from "@/types";

type Tab = "scan" | "paste";

export function ComparePage() {
  const t = useT();
  const compare = useCompareAlbum();
  const [tab, setTab] = useState<Tab>("paste");
  const [pasteText, setPasteText] = useState("");
  const [result, setResult] = useState<CompareResult | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  const stopScanner = useCallback(() => {
    if (scannerRef.current?.isScanning) scannerRef.current.stop().catch(() => {});
    setScannerActive(false);
  }, []);

  const handleCompare = useCallback((raw: string) => {
    const codes = parseImportData(raw);
    if (codes.length === 0) return;
    compare.mutate(codes, { onSuccess: (data) => setResult(data) });
  }, [compare]);

  const startScanner = useCallback(async () => {
    if (!scannerContainerRef.current) return;
    stopScanner();
    const scanner = new Html5Qrcode("qr-compare-reader");
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => {
          scanner.stop().catch(() => {});
          setScannerActive(false);
          handleCompare(text);
        },
        () => {}
      );
      setScannerActive(true);
    } catch {
      showToast(t.import.cameraError);
      setTab("paste");
    }
  }, [stopScanner, handleCompare, t]);

  useEffect(() => {
    return () => { if (scannerRef.current?.isScanning) scannerRef.current.stop().catch(() => {}); };
  }, []);

  useEffect(() => {
    if (tab === "scan" && !result && !compare.isPending) {
      const timer = setTimeout(startScanner, 300);
      return () => clearTimeout(timer);
    }
    if (tab !== "scan") stopScanner();
  }, [tab, result, compare.isPending, startScanner, stopScanner]);

  const handleReset = () => {
    setResult(null);
    setPasteText("");
    compare.reset();
  };

  if (result) {
    return <CompareResults result={result} onReset={handleReset} />;
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-lg mx-auto">
      <div className="flex items-center gap-2.5">
        <ArrowLeftRight size={22} className="text-brand-600" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.compare.title}</h1>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">{t.compare.description}</p>

      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        {([["scan", Camera, t.import.scanQR], ["paste", FileText, t.import.pasteText]] as const).map(([key, Icon, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn("flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors",
              tab === key ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-500 dark:text-slate-400")}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {tab === "scan" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div id="qr-compare-reader" ref={scannerContainerRef} className="w-full aspect-square max-h-80" />
          {!scannerActive && (
            <div className="p-4 text-center">
              <button onClick={startScanner} className="text-sm text-brand-600 hover:text-brand-700 font-medium">{t.import.startCamera}</button>
            </div>
          )}
        </div>
      )}

      {tab === "paste" && (
        <div className="space-y-3">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={t.import.pastePlaceholder}
            rows={8}
            className={cn(
              "w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm font-mono",
              "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100",
              "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent",
              "placeholder:text-slate-400 resize-none"
            )}
          />
          <button
            onClick={() => handleCompare(pasteText)}
            disabled={!pasteText.trim() || compare.isPending}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all",
              "bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {compare.isPending ? (
              <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <Search size={16} />
            )}
            {compare.isPending ? t.compare.comparing : t.compare.compare}
          </button>
        </div>
      )}

      {compare.error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400">{t.import.importError}</p>
          </div>
        </div>
      )}
    </div>
  );
}
