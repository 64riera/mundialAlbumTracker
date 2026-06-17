import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useT } from "@/lib/i18n";
import { WifiOff, RefreshCw, CloudOff, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function OfflineBanner() {
  const t = useT();
  const { isOnline, pendingCount, isSyncing, manualSync } = useOfflineSync();
  const [showSynced, setShowSynced] = useState(false);
  const [prevSyncing, setPrevSyncing] = useState(false);

  useEffect(() => {
    if (prevSyncing && !isSyncing && isOnline) {
      setShowSynced(true);
      const timer = setTimeout(() => setShowSynced(false), 3000);
      return () => clearTimeout(timer);
    }
    setPrevSyncing(isSyncing);
  }, [isSyncing, isOnline, prevSyncing]);

  if (isOnline && !isSyncing && !showSynced && pendingCount === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors",
        !isOnline
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
          : isSyncing
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
            : showSynced
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
      )}
    >
      {!isOnline && (
        <>
          <WifiOff size={14} />
          <span>{t.pwa.offline}</span>
          {pendingCount > 0 && (
            <span className="opacity-70">
              · {pendingCount} {t.pwa.pendingChanges}
            </span>
          )}
        </>
      )}

      {isOnline && isSyncing && (
        <>
          <RefreshCw size={14} className="animate-spin" />
          <span>{t.pwa.syncing}</span>
        </>
      )}

      {isOnline && !isSyncing && showSynced && (
        <>
          <Check size={14} />
          <span>{t.pwa.synced}</span>
        </>
      )}

      {isOnline && !isSyncing && !showSynced && pendingCount > 0 && (
        <>
          <CloudOff size={14} />
          <span>
            {pendingCount} {t.pwa.pendingChanges}
          </span>
          <button
            onClick={manualSync}
            className="underline hover:no-underline ml-1"
          >
            {t.pwa.syncNow}
          </button>
        </>
      )}
    </div>
  );
}
