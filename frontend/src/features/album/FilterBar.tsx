import { cn } from "@/lib/utils";
import { LayoutGrid, CheckCircle, XCircle, Copy } from "lucide-react";
import type { StickerSummary } from "@/types";

type Filter = "all" | "owned" | "missing" | "duplicate";

interface FilterBarProps {
  stickers: StickerSummary[];
  active: Filter;
  onChange: (f: Filter) => void;
}

const FILTERS: { key: Filter; label: string; Icon: typeof LayoutGrid }[] = [
  { key: "all", label: "Todas", Icon: LayoutGrid },
  { key: "owned", label: "Tengo", Icon: CheckCircle },
  { key: "missing", label: "Faltan", Icon: XCircle },
  { key: "duplicate", label: "Duplicadas", Icon: Copy },
];

export function FilterBar({ stickers, active, onChange }: FilterBarProps) {
  const counts: Record<Filter, number> = {
    all: stickers.length,
    owned: stickers.filter((s) => s.quantity === 1).length,
    missing: stickers.filter((s) => s.quantity === 0).length,
    duplicate: stickers.filter((s) => s.quantity >= 2).length,
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      {FILTERS.map(({ key, label, Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
            active === key
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-300 hover:text-brand-700 dark:hover:text-brand-400"
          )}
        >
          <Icon size={14} />
          <span>{label}</span>
          <span
            className={cn(
              "text-xs rounded-full px-1.5 py-0.5",
              active === key ? "bg-brand-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
            )}
          >
            {counts[key]}
          </span>
        </button>
      ))}
    </div>
  );
}
