import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { countPending } from "@/lib/offlineQueue";
import {
  onSyncStatus,
  processPendingActions,
  registerOnlineListener,
} from "@/lib/syncManager";

const QUERY_KEYS_TO_INVALIDATE = [
  ["section"],
  ["sections"],
  ["stats"],
  ["stickers"],
] as const;

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    registerOnlineListener();
  }, []);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    const refresh = () => countPending().then(setPendingCount);
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    return onSyncStatus((status, syncedCount) => {
      setIsSyncing(status === "syncing");
      countPending().then(setPendingCount);

      if (status === "synced" && syncedCount > 0) {
        QUERY_KEYS_TO_INVALIDATE.forEach((key) =>
          qc.invalidateQueries({ queryKey: [...key] })
        );
      }
    });
  }, [qc]);

  const manualSync = useCallback(() => {
    if (navigator.onLine) processPendingActions();
  }, []);

  return { isOnline, pendingCount, isSyncing, manualSync };
}
