import { useState, useRef } from "react";
import { useBulkCollect } from "@/hooks/useStickers";
import { useUIStore } from "@/store/uiStore";
import { showToast } from "@/components/ui/Toast";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function QuickAddDrawer() {
  const { quickAddOpen, setQuickAddOpen } = useUIStore();
  const [input, setInput] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const bulkCollect = useBulkCollect();

  const parseNumbers = (raw: string): number[] => {
    return raw
      .split(/[\s,;]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0 && n <= 1500);
  };

  const handleAdd = () => {
    const numbers = parseNumbers(input);
    if (numbers.length === 0) return;

    bulkCollect.mutate(numbers, {
      onSuccess: (data) => {
        setRecent((prev) => [
          ...numbers.map((n) => `#${n}`).join(", "),
          ...prev,
        ].slice(0, 5));
        setInput("");
        showToast(`✓ ${data.updated} figurita${data.updated !== 1 ? "s" : ""} agregada${data.updated !== 1 ? "s" : ""}`);
        inputRef.current?.focus();
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") setQuickAddOpen(false);
  };

  return (
    <AnimatePresence>
      {quickAddOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setQuickAddOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">➕ Agregar figuritas</h2>
              <button
                onClick={() => setQuickAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Número(s) de figurita
                </label>
                <p className="text-xs text-slate-400 mb-2">
                  Escribe uno o varios separados por comas o espacios
                </p>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ej: 42, 87, 123"
                  className={cn(
                    "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  )}
                  autoFocus
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={!input.trim() || bulkCollect.isPending}
                className={cn(
                  "w-full py-2.5 rounded-lg font-medium text-sm transition-all",
                  "bg-brand-600 text-white hover:bg-brand-700",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {bulkCollect.isPending ? "Agregando..." : "Agregar"}
              </button>

              {recent.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">Últimas agregadas</p>
                  <div className="space-y-1">
                    {recent.map((entry, i) => (
                      <div key={i} className="text-xs text-slate-600 bg-slate-50 rounded px-2 py-1.5">
                        ✓ {entry}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function QuickAddFAB() {
  const { setQuickAddOpen } = useUIStore();
  return (
    <button
      onClick={() => setQuickAddOpen(true)}
      className={cn(
        "fixed bottom-6 right-6 z-30",
        "bg-brand-600 hover:bg-brand-700 text-white",
        "w-14 h-14 rounded-full shadow-lg",
        "flex items-center justify-center",
        "transition-all hover:scale-105 active:scale-95"
      )}
      title="Agregar figuritas"
    >
      <Plus size={24} />
    </button>
  );
}
