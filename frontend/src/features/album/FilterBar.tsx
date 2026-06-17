import { cn } from "@/lib/utils";
import type { StickerSummary } from "@/types";

type Filter = "all" | "owned" | "missing" | "duplicate";

interface FilterBarProps {
  stickers: StickerSummary[];
  active: Filter;
  onChange: (f: Filter) => void;
}

const FILTERS: { key: Filter; label: string; emoji: string }[] = [
  { key: "all", label: "Todas", emoji: "📋" },
  { key: "owned", label: "Tengo", emoji: "✅" },
  { key: "missing", label: "Faltan", emoji: "❌" },
  { key: "duplicate", label: "Duplicadas", emoji: "🔄" },
];

export function FilterBar({ stickers, active, onChange }: FilterBarProps) {
  const counts: Record<Filter, number> = {
    all: stickers.length,
    owned: stickers.filter((s) => s.quantity === 1).length,
    missing: stickers.filter((s) => s.quantity === 0).length,
    duplicate: stickers.filter((s) => s.quantity >= 2).length,
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {FILTERS.map(({ key, label, emoji }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            active === key
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:border-brand-300 hover:text-brand-700"
          )}
        >
          <span>{emoji}</span>
          <span>{label}</span>
          <span
            className={cn(
              "text-xs rounded-full px-1.5 py-0.5",
              active === key ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-500"
            )}
          >
            {counts[key]}
          </span>
        </button>
      ))}
    </div>
  );
}
