import { StickerCard } from "./StickerCard";
import type { StickerSummary } from "@/types";

interface StickerGridProps {
  stickers: StickerSummary[];
  filter: "all" | "owned" | "missing" | "duplicate";
  onToggle: (sticker: StickerSummary) => void;
  onIncrement: (sticker: StickerSummary) => void;
}

export function StickerGrid({ stickers, filter, onToggle, onIncrement }: StickerGridProps) {
  const filtered = stickers.filter((s) => {
    if (filter === "owned") return s.quantity === 1;
    if (filter === "missing") return s.quantity === 0;
    if (filter === "duplicate") return s.quantity >= 2;
    return true;
  });

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-4xl mb-2">🔍</div>
        <p className="text-sm">Sin figuritas en esta categoría</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
      {filtered.map((sticker) => (
        <StickerCard
          key={sticker.id}
          sticker={sticker}
          onToggle={onToggle}
          onIncrement={onIncrement}
        />
      ))}
    </div>
  );
}
