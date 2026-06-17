import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSections } from "@/hooks/useSections";
import { filterSections } from "@/lib/filterSections";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SectionPickerProps {
  currentCode: string;
}

export function SectionPicker({ currentCode }: SectionPickerProps) {
  const t = useT();
  const navigate = useNavigate();
  const { data: sections = [] } = useSections();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const teamSections = useMemo(
    () => sections.filter((s) => s.type === "TEAM"),
    [sections]
  );

  const filtered = useMemo(
    () => filterSections(teamSections, query),
    [teamSections, query]
  );

  const handleSelect = (code: string) => {
    setQuery("");
    setOpen(false);
    if (code !== currentCode) navigate(`/album/${code}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setQuery("");
      setOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === "Enter" && filtered.length > 0) {
      handleSelect(filtered[0].code);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t.album.searchSection}
          className={cn(
            "w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-7 py-2",
            "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100",
            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
            "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          )}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
            className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden"
          >
            {filtered.length > 0 ? (
              <ul className="max-h-64 overflow-y-auto">
                {filtered.map((s) => (
                  <li key={s.code}>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(s.code)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                        s.code === currentCode
                          ? "bg-brand-50 dark:bg-brand-900/30"
                          : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      )}
                    >
                      <span className="text-base w-6 text-center shrink-0">
                        {s.flagEmoji ?? ""}
                      </span>
                      <span className="flex-1 truncate text-slate-700 dark:text-slate-200 font-medium">
                        {s.name}
                      </span>
                      <span
                        className={cn(
                          "text-xs tabular-nums shrink-0",
                          s.percentage === 100
                            ? "text-gold-600 dark:text-gold-400 font-bold"
                            : "text-slate-400 dark:text-slate-500"
                        )}
                      >
                        {s.percentage}%
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500 text-center">
                {t.sidebar.noResults}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
