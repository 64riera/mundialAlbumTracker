import { useState, useRef, useEffect, useCallback } from "react";
import { useBulkCollectByCodes, useSearchStickers } from "@/hooks/useStickers";
import { useUIStore } from "@/store/uiStore";
import { showToast } from "@/components/ui/Toast";
import { X, Plus, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { StickerSummary } from "@/types";

type SelectedSticker = Pick<StickerSummary, "code" | "name" | "section">;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function QuickAddDrawer() {
  const { quickAddOpen, setQuickAddOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SelectedSticker[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 250);
  const bulkCollect = useBulkCollectByCodes();
  const { data: searchResults = [] } = useSearchStickers(debouncedQuery);

  const addSticker = useCallback((sticker: StickerSummary) => {
    if (selected.some((s) => s.code === sticker.code)) return;
    setSelected((prev) => [
      ...prev,
      { code: sticker.code, name: sticker.name, section: sticker.section },
    ]);
    setQuery("");
    setDropdownOpen(false);
    inputRef.current?.focus();
  }, [selected]);

  const removeSticker = (code: string) =>
    setSelected((prev) => prev.filter((s) => s.code !== code));

  const handleAdd = () => {
    if (selected.length === 0) return;
    const codes = selected.map((s) => s.code);
    bulkCollect.mutate(codes, {
      onSuccess: (data) => {
        setRecent((prev) => [codes.join(", "), ...prev].slice(0, 5));
        setSelected([]);
        showToast(
          `✓ ${data.updated} figurita${data.updated !== 1 ? "s" : ""} agregada${data.updated !== 1 ? "s" : ""}`
        );
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchResults.length > 0 && query.trim()) {
        addSticker(searchResults[0]);
      } else if (selected.length > 0 && !query.trim()) {
        handleAdd();
      }
    }
    if (e.key === "Escape") {
      if (query) {
        setQuery("");
        setDropdownOpen(false);
      } else {
        setQuickAddOpen(false);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset state when drawer closes
  useEffect(() => {
    if (!quickAddOpen) {
      setQuery("");
      setDropdownOpen(false);
    }
  }, [quickAddOpen]);

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
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                ➕ Agregar figuritas
              </h2>
              <button
                onClick={() => setQuickAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              {/* Selected chips */}
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selected.map((s) => (
                    <span
                      key={s.code}
                      className="inline-flex items-center gap-1 bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-700 text-brand-700 dark:text-brand-300 text-xs font-medium px-2 py-1 rounded-full"
                    >
                      <span className="font-bold font-mono">{s.code}</span>
                      <span className="text-brand-400 truncate max-w-[80px]">
                        · {s.name}
                      </span>
                      <button
                        onClick={() => removeSticker(s.code)}
                        className="ml-0.5 text-brand-400 hover:text-brand-700 transition-colors"
                        aria-label={`Quitar ${s.code}`}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search input with autocomplete */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                  Buscar por código o nombre
                </label>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                  Ej: <span className="font-mono">ARG15</span>,{" "}
                  <span className="font-mono">ESP</span>, Messi, Mbappé...
                </p>

                <div className="relative">
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setDropdownOpen(true);
                      }}
                      onFocus={() => query.trim() && setDropdownOpen(true)}
                      onKeyDown={handleKeyDown}
                      placeholder="ARG3, Messi, ESP..."
                      className={cn(
                        "w-full border border-slate-300 dark:border-slate-600 rounded-lg pl-8 pr-3 py-2.5 text-sm",
                        "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100",
                        "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                      )}
                      autoFocus
                      autoComplete="off"
                    />
                  </div>

                  {/* Dropdown results */}
                  <AnimatePresence>
                    {dropdownOpen && debouncedQuery.trim() && (
                      <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.1 }}
                        className="absolute z-10 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden"
                      >
                        {searchResults.length > 0 ? (
                          <ul className="max-h-56 overflow-y-auto">
                            {searchResults.map((sticker) => {
                              const isSelected = selected.some(
                                (s) => s.code === sticker.code
                              );
                              return (
                                <li key={sticker.id}>
                                  <button
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => addSticker(sticker)}
                                    disabled={isSelected}
                                    className={cn(
                                      "w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors",
                                      isSelected
                                        ? "bg-slate-50 dark:bg-slate-700 cursor-default"
                                        : "hover:bg-brand-50 dark:hover:bg-brand-900/30"
                                    )}
                                  >
                                    <span className="font-mono font-bold text-brand-600 text-xs w-16 shrink-0">
                                      {sticker.code}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <p
                                        className={cn(
                                          "truncate",
                                          isSelected
                                            ? "text-slate-400 dark:text-slate-500"
                                            : "text-slate-700 dark:text-slate-200"
                                        )}
                                      >
                                        {sticker.name}
                                      </p>
                                      <p className="text-slate-400 text-xs">
                                        {sticker.section?.flagEmoji}{" "}
                                        {sticker.section?.name}
                                      </p>
                                    </div>
                                    {isSelected ? (
                                      <Check
                                        size={13}
                                        className="text-brand-500 shrink-0"
                                      />
                                    ) : sticker.quantity > 0 ? (
                                      <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
                                        {sticker.quantity === 1
                                          ? "tengo"
                                          : `×${sticker.quantity}`}
                                      </span>
                                    ) : null}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500 text-center">
                            Sin resultados para &ldquo;{debouncedQuery}&rdquo;
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Submit button */}
              <button
                onClick={handleAdd}
                disabled={selected.length === 0 || bulkCollect.isPending}
                className={cn(
                  "w-full py-2.5 rounded-lg font-medium text-sm transition-all",
                  "bg-brand-600 text-white hover:bg-brand-700",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {bulkCollect.isPending
                  ? "Agregando..."
                  : selected.length > 0
                    ? `Agregar ${selected.length} figurita${selected.length !== 1 ? "s" : ""}`
                    : "Selecciona figuritas para agregar"}
              </button>

              {/* Recent history */}
              {recent.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Últimas agregadas
                  </p>
                  <div className="space-y-1">
                    {recent.map((entry, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded px-2 py-1.5"
                      >
                        <Check size={10} className="text-emerald-500 shrink-0" />
                        <span className="font-mono">{entry}</span>
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
