const DB_NAME = "mundial-offline";
const DB_VERSION = 1;
const STORE_NAME = "pendingActions";

export type ActionType = "collect" | "bulkCollect" | "bulkCollectByCodes";

export interface CollectPayload {
  number: number;
  quantity: number;
}

export interface BulkCollectPayload {
  numbers: number[];
}

export interface BulkCollectByCodesPayload {
  codes: string[];
}

type PayloadMap = {
  collect: CollectPayload;
  bulkCollect: BulkCollectPayload;
  bulkCollectByCodes: BulkCollectByCodesPayload;
};

export interface PendingAction<T extends ActionType = ActionType> {
  id?: number;
  type: T;
  payload: PayloadMap[T];
  createdAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const request = operation(tx.objectStore(STORE_NAME));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
  );
}

export function enqueueAction<T extends ActionType>(
  type: T,
  payload: PayloadMap[T]
): Promise<number> {
  return withStore("readwrite", (store) =>
    store.add({ type, payload, createdAt: Date.now() })
  ) as Promise<number>;
}

export function getAllPending(): Promise<PendingAction[]> {
  return withStore("readonly", (store) => store.getAll());
}

export function removeAction(id: number): Promise<void> {
  return withStore("readwrite", (store) => store.delete(id)) as Promise<void>;
}

export function countPending(): Promise<number> {
  return withStore("readonly", (store) => store.count());
}
