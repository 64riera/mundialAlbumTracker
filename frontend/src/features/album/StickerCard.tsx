import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import type { StickerSummary } from "@/types";
import { Star, User, Shield, Landmark, Users, Sparkles, BookOpen, Pin, Plus } from "lucide-react";

interface StickerCardProps {
  sticker: StickerSummary;
  onToggle: (sticker: StickerSummary) => void;
  onIncrement?: (sticker: StickerSummary) => void;
}

const TYPE_ICONS: Record<string, typeof User> = {
  PLAYER: User, BADGE: Shield, STADIUM: Landmark, SPECIAL: Sparkles, INTRO: BookOpen, GROUP: Users,
};

export function StickerCard({ sticker, onToggle, onIncrement }: StickerCardProps) {
  const t = useT();
  const isOwned = sticker.quantity >= 1;
  const isDuplicate = sticker.quantity >= 2;
  const Icon = TYPE_ICONS[sticker.type] ?? Pin;

  return (
    <motion.div
      className={cn(
        "relative rounded-xl border-2 p-2.5 sm:p-3 cursor-pointer select-none transition-colors duration-200",
        isDuplicate ? "bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600"
          : isOwned ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600"
          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-80"
      )}
      whileTap={{ scale: 0.93 }}
      onClick={() => onToggle(sticker)}
      title={sticker.name}
    >
      {isDuplicate && (
        <span className="absolute -top-2 -right-2 bg-amber-400 dark:bg-amber-500 text-amber-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
          x{sticker.quantity}
        </span>
      )}
      {sticker.isShiny && <Star size={10} className="absolute top-1 left-1 text-gold-500 fill-gold-400" />}
      <div className="text-center">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{sticker.code}</p>
        <div className="my-1 flex justify-center">
          <Icon size={24} className={cn(
            isDuplicate ? "text-amber-500 dark:text-amber-400" : isOwned ? "text-emerald-500 dark:text-emerald-400" : "text-slate-300 dark:text-slate-600"
          )} strokeWidth={1.5} />
        </div>
        <p className="text-[11px] font-medium text-slate-700 dark:text-slate-200 leading-tight line-clamp-2">{sticker.name}</p>
      </div>
      <div className="mt-1.5 sm:mt-2 flex items-center justify-between">
        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
          isDuplicate ? "bg-amber-200 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200"
            : isOwned ? "bg-emerald-200 dark:bg-emerald-800/50 text-emerald-800 dark:text-emerald-200"
            : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
        )}>
          {isDuplicate ? t.album.duplicate : isOwned ? t.album.have : t.album.need}
        </span>
        {isOwned && onIncrement && (
          <button onClick={(e) => { e.stopPropagation(); onIncrement(sticker); }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={t.album.addDuplicate}>
            <Plus size={14} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
