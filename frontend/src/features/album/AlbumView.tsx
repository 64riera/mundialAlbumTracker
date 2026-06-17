import { useParams, Navigate } from "react-router-dom";
import { useSectionDetail } from "@/hooks/useSections";
import { useCollectSticker } from "@/hooks/useStickers";
import { useUIStore } from "@/store/uiStore";
import { useT } from "@/lib/i18n";
import { StickerGrid } from "./StickerGrid";
import { FilterBar } from "./FilterBar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { showToast } from "@/components/ui/Toast";
import type { StickerSummary } from "@/types";

export function AlbumView() {
  const t = useT();
  const { sectionCode } = useParams<{ sectionCode: string }>();
  const { data: section, isLoading, error } = useSectionDetail(sectionCode ?? "");
  const collectSticker = useCollectSticker();
  const { stickerFilter, setStickerFilter } = useUIStore();

  if (!sectionCode) return <Navigate to="/stats" replace />;

  const handleToggle = (sticker: StickerSummary) => {
    const prevQuantity = sticker.quantity;
    const newQuantity = sticker.quantity === 0 ? 1 : 0;

    collectSticker.mutate(
      { number: sticker.number, quantity: newQuantity },
      {
        onSuccess: () => {
          showToast(
            `${newQuantity === 1 ? "+" : "-"} ${sticker.code} ${sticker.name} ${newQuantity === 1 ? t.album.added : t.album.removed}`,
            newQuantity !== prevQuantity
              ? { label: t.album.undo, onClick: () => collectSticker.mutate({ number: sticker.number, quantity: prevQuantity }) }
              : undefined
          );
        },
      }
    );
  };

  const handleIncrement = (sticker: StickerSummary) => {
    collectSticker.mutate(
      { number: sticker.number, quantity: sticker.quantity + 1 },
      {
        onSuccess: () => {
          showToast(`+1 ${t.album.duplicateAdded}: ${sticker.code} ${sticker.name}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-4 w-1/3" />
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !section) {
    return (
      <div className="p-6 text-center text-slate-500 dark:text-slate-400">
        <p>{t.album.sectionNotFound}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
          {section.flagEmoji && <span className="text-4xl">{section.flagEmoji}</span>}
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{section.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {section.owned}/{section.total} {t.album.stickers} ·{" "}
              <span className="font-medium text-brand-600">{section.percentage}%</span>
            </p>
          </div>
        </div>
        <div className="w-full sm:w-48">
          <ProgressBar value={section.owned} max={section.total} size="lg" />
        </div>
      </div>
      <FilterBar stickers={section.stickers} active={stickerFilter} onChange={setStickerFilter} />
      <StickerGrid stickers={section.stickers} filter={stickerFilter} onToggle={handleToggle} onIncrement={handleIncrement} />
    </div>
  );
}
