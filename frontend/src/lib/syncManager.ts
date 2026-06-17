import { api } from "./api";
import {
  getAllPending,
  removeAction,
  type PendingAction,
  type CollectPayload,
  type BulkCollectPayload,
  type BulkCollectByCodesPayload,
} from "./offlineQueue";

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

type SyncListener = (status: SyncStatus, syncedCount: number) => void;

const listeners = new Set<SyncListener>();

export function onSyncStatus(listener: SyncListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(status: SyncStatus, syncedCount: number) {
  listeners.forEach((l) => l(status, syncedCount));
}

function executeAction(action: PendingAction): Promise<void> {
  switch (action.type) {
    case "collect": {
      const { number, quantity } = action.payload as CollectPayload;
      return api
        .patch(`/api/stickers/${number}/collect`, { quantity })
        .then(() => undefined);
    }
    case "bulkCollect": {
      const { numbers } = action.payload as BulkCollectPayload;
      return api
        .post("/api/stickers/bulk-collect", { numbers })
        .then(() => undefined);
    }
    case "bulkCollectByCodes": {
      const { codes } = action.payload as BulkCollectByCodesPayload;
      return api
        .post("/api/stickers/bulk-collect-codes", { codes })
        .then(() => undefined);
    }
  }
}

let isSyncing = false;

export async function processPendingActions(): Promise<number> {
  if (isSyncing || !navigator.onLine) return 0;

  isSyncing = true;
  notify("syncing", 0);

  let syncedCount = 0;

  try {
    const pending = await getAllPending();

    for (const action of pending) {
      if (!navigator.onLine) break;

      try {
        await executeAction(action);
        await removeAction(action.id!);
        syncedCount++;
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status && status >= 400 && status < 500) {
          await removeAction(action.id!);
        }
      }
    }

    notify("synced", syncedCount);
    return syncedCount;
  } catch {
    notify("error", 0);
    return 0;
  } finally {
    isSyncing = false;
  }
}

let listenerRegistered = false;

export function registerOnlineListener() {
  if (listenerRegistered) return;
  listenerRegistered = true;
  window.addEventListener("online", () => {
    processPendingActions();
  });
}
