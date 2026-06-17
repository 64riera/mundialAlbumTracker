import { useState } from "react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  Gift,
  HandHeart,
  Handshake,
  CheckCheck,
  HelpCircle,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import type { CompareResult, CompareSticker } from "@/types";

type TabKey = "perfectTrades" | "theyCanGive" | "iCanGive" | "bothHave" | "bothNeed";

const TAB_CONFIG: { key: TabKey; icon: typeof Gift; activeColor: string; bgColor: string }[] = [
  { key: "perfectTrades", icon: Handshake, activeColor: "text-emerald-600 border-emerald-500", bgColor: "bg-emerald-50 dark:bg-emerald-900/20" },
  { key: "theyCanGive", icon: Gift, activeColor: "text-blue-600 border-blue-500", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
  { key: "iCanGive", icon: HandHeart, activeColor: "text-amber-600 border-amber-500", bgColor: "bg-amber-50 dark:bg-amber-900/20" },
  { key: "bothHave", icon: CheckCheck, activeColor: "text-slate-600 border-slate-400", bgColor: "bg-slate-50 dark:bg-slate-800" },
  { key: "bothNeed", icon: HelpCircle, activeColor: "text-red-500 border-red-400", bgColor: "bg-red-50 dark:bg-red-900/20" },
];

interface Props {
  result: CompareResult;
  onReset: () => void;
}

export function CompareResults({ result, onReset }: Props) {
  const t = useT();
  const [activeTab, setActiveTab] = useState<TabKey>("perfectTrades");

  const tabLabels: Record<TabKey, string> = {
    perfectTrades: t.compare.perfectTrades,
    theyCanGive: t.compare.theyCanGive,
    iCanGive: t.compare.iCanGive,
    bothHave: t.compare.bothHave,
    bothNeed: t.compare.bothNeed,
  };

  const tabCounts: Record<TabKey, number> = {
    perfectTrades: result.summary.perfectTrades,
    theyCanGive: result.summary.theyCanGive,
    iCanGive: result.summary.iCanGive,
    bothHave: result.summary.bothHave,
    bothNeed: result.summary.bothNeed,
  };

  const currentConfig = TAB_CONFIG.find((c) => c.key === activeTab)!;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ArrowLeftRight size={22} className="text-brand-600" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.compare.summaryTitle}</h1>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 transition-colors"
        >
          <RotateCcw size={14} />
          {t.compare.reset}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <SummaryCard
          icon={Handshake}
          label={t.compare.perfectTrades}
          count={result.summary.perfectTrades}
          accent="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
        />
        <SummaryCard
          icon={Gift}
          label={t.compare.theyCanGive}
          count={result.summary.theyCanGive}
          accent="text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
        />
        <SummaryCard
          icon={HandHeart}
          label={t.compare.iCanGive}
          count={result.summary.iCanGive}
          accent="text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {TAB_CONFIG.map(({ key, icon: Icon, activeColor }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
              activeTab === key
                ? `${activeColor} border-current bg-white dark:bg-slate-800`
                : "text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            <Icon size={13} />
            {tabLabels[key]}
            <span className={cn(
              "text-[10px] rounded-full px-1.5 py-0.5",
              activeTab === key ? "bg-current/10" : "bg-slate-100 dark:bg-slate-700"
            )}>
              {tabCounts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={cn("rounded-2xl border p-4", currentConfig.bgColor, "border-slate-200 dark:border-slate-700")}>
        {activeTab === "perfectTrades" ? (
          <PerfectTradesList trades={result.perfectTrades} />
        ) : (
          <StickerList stickers={result[activeTab]} />
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, count, accent }: {
  icon: typeof Gift;
  label: string;
  count: number;
  accent: string;
}) {
  return (
    <div className={cn("rounded-xl border p-3 text-center", accent)}>
      <Icon size={20} className="mx-auto mb-1.5" strokeWidth={1.5} />
      <p className="text-2xl font-bold tabular-nums">{count}</p>
      <p className="text-[10px] font-medium opacity-70 mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

function PerfectTradesList({ trades }: { trades: CompareResult["perfectTrades"] }) {
  const t = useT();

  if (trades.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-2">
      {trades.map((trade, i) => (
        <div key={i} className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl p-2.5 border border-slate-100 dark:border-slate-700">
          <StickerChip sticker={trade.mine} variant="give" />
          <ArrowRight size={14} className="text-slate-400 shrink-0" />
          <StickerChip sticker={trade.theirs} variant="get" />
        </div>
      ))}
      {trades.length >= 50 && (
        <p className="text-xs text-center text-slate-400 pt-1">
          {t.compare.perfectTradesDesc}...
        </p>
      )}
    </div>
  );
}

function StickerList({ stickers }: { stickers: CompareSticker[] }) {
  if (stickers.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
      {stickers.map((s) => (
        <div key={s.code} className="flex items-center gap-2.5 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-700">
          <span className="text-base">{s.section.flagEmoji ?? ""}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold font-mono text-brand-600">{s.code}</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">{s.name}</p>
          </div>
          {s.myQty >= 2 && (
            <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-full font-medium">
              x{s.myQty}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function StickerChip({ sticker, variant }: { sticker: CompareSticker; variant: "give" | "get" }) {
  const t = useT();
  return (
    <div className={cn(
      "flex-1 min-w-0 flex items-center gap-2 rounded-lg px-2.5 py-1.5",
      variant === "give"
        ? "bg-amber-50 dark:bg-amber-900/20"
        : "bg-blue-50 dark:bg-blue-900/20"
    )}>
      <span className="text-sm">{sticker.section.flagEmoji ?? ""}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-slate-400">{variant === "give" ? t.compare.mySticker : t.compare.theirSticker}</p>
        <p className="text-xs font-bold font-mono truncate text-slate-700 dark:text-slate-200">{sticker.code}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  const t = useT();
  return (
    <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">{t.compare.noResults}</p>
  );
}
