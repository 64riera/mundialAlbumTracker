import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { enqueueAction } from "@/lib/offlineQueue";
import type { StickerSummary } from "@/types";

const STICKER_QUERY_KEYS = [
  ["section"],
  ["sections"],
  ["stats"],
  ["stickers"],
] as const;

function useInvalidateStickers() {
  const qc = useQueryClient();
  return () =>
    STICKER_QUERY_KEYS.forEach((key) =>
      qc.invalidateQueries({ queryKey: [...key] })
    );
}

export function useStickers(
  status?: "all" | "owned" | "missing" | "duplicate"
) {
  return useQuery<StickerSummary[]>({
    queryKey: ["stickers", status ?? "all"],
    queryFn: () =>
      api.get("/api/stickers", { params: { status } }).then((r) => r.data),
    staleTime: 10_000,
  });
}

export function useSearchStickers(query: string) {
  return useQuery<StickerSummary[]>({
    queryKey: ["stickers", "search", query],
    queryFn: () =>
      api
        .get("/api/stickers/search", { params: { q: query } })
        .then((r) => r.data),
    enabled: query.trim().length >= 1,
    staleTime: 30_000,
  });
}

export function useCollectSticker() {
  const invalidate = useInvalidateStickers();
  return useMutation({
    mutationFn: async ({
      number,
      quantity,
    }: {
      number: number;
      quantity: number;
    }) => {
      if (!navigator.onLine) {
        await enqueueAction("collect", { number, quantity });
        return { queued: true } as const;
      }
      const res = await api.patch(`/api/stickers/${number}/collect`, {
        quantity,
      });
      return { queued: false, data: res.data } as const;
    },
    onSuccess: (result) => {
      if (!result.queued) invalidate();
    },
  });
}

export function useBulkCollect() {
  const invalidate = useInvalidateStickers();
  return useMutation({
    mutationFn: async (numbers: number[]) => {
      if (!navigator.onLine) {
        await enqueueAction("bulkCollect", { numbers });
        return { queued: true } as const;
      }
      const res = await api
        .post("/api/stickers/bulk-collect", { numbers })
        .then((r) => r.data);
      return { queued: false, data: res } as const;
    },
    onSuccess: (result) => {
      if (!result.queued) invalidate();
    },
  });
}

export function useBulkCollectByCodes() {
  const invalidate = useInvalidateStickers();
  return useMutation({
    mutationFn: async (codes: string[]) => {
      if (!navigator.onLine) {
        await enqueueAction("bulkCollectByCodes", { codes });
        return { queued: true } as const;
      }
      const res = await api
        .post("/api/stickers/bulk-collect-codes", { codes })
        .then((r) => r.data);
      return { queued: false, data: res } as const;
    },
    onSuccess: (result) => {
      if (!result.queued) invalidate();
    },
  });
}
