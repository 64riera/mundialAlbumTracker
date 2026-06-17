import { useDuplicates } from "@/hooks/useStats";
import { useCollectSticker } from "@/hooks/useStickers";
import { showToast } from "@/components/ui/Toast";
import { Minus, Copy } from "lucide-react";

export function DuplicatesView() {
  const { data: duplicates, isLoading } = useDuplicates();
  const collectSticker = useCollectSticker();

  const handleDecrement = (number: number, name: string, quantity: number) => {
    if (quantity <= 1) {
      if (!confirm(`¿Quitar la figurita #${number} ${name} de tu colección?`)) return;
    }
    collectSticker.mutate(
      { number, quantity: quantity - 1 },
      {
        onSuccess: () => showToast(`-1: #${number} ${name}`),
      }
    );
  };

  const handleCopyList = () => {
    if (!duplicates?.length) return;
    const text = [
      "🏆 Mis duplicadas del Mundial 2026",
      "",
      ...duplicates.map(
        (s) => `#${s.number} ${s.name}${s.section?.flagEmoji ? ` ${s.section.flagEmoji}` : ""} ×${s.quantity}`
      ),
    ].join("\n");
    navigator.clipboard.writeText(text);
    showToast("✓ Lista copiada al portapapeles");
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          🔄 Duplicadas{" "}
          <span className="text-lg text-slate-400 dark:text-slate-500 font-normal">({duplicates?.length ?? 0})</span>
        </h1>
        {(duplicates?.length ?? 0) > 0 && (
          <button
            onClick={handleCopyList}
            className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-700 hover:border-brand-300 rounded-lg px-3 py-2 transition-colors"
          >
            <Copy size={14} />
            Copiar lista
          </button>
        )}
      </div>

      {!duplicates?.length ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-sm">Sin figuritas duplicadas todavía</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
          {duplicates.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-lg w-7">{s.section?.flagEmoji ?? "📌"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                  #{s.number} {s.name}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{s.section?.name}</p>
              </div>
              <span className="text-amber-600 font-bold text-sm">×{s.quantity}</span>
              <button
                onClick={() => handleDecrement(s.number, s.name, s.quantity)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30"
                title="Quitar una"
              >
                <Minus size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
