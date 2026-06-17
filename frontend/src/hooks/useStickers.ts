import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { StickerSummary } from "@/types";

export function useStickers(status?: "all" | "owned" | "missing" | "duplicate") {
  return useQuery<StickerSummary[]>({
    queryKey: ["stickers", status ?? "all"],
    queryFn: () =>
      api.get("/api/stickers", { params: { status } }).then((r) => r.data),
    staleTime: 10_000,
  });
}

export function useCollectSticker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ number, quantity }: { number: number; quantity: number }) =>
      api.patch(`/api/stickers/${number}/collect`, { quantity }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["section"] });
      qc.invalidateQueries({ queryKey: ["sections"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["stickers"] });
    },
  });
}

export function useBulkCollect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (numbers: number[]) =>
      api.post("/api/stickers/bulk-collect", { numbers }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["section"] });
      qc.invalidateQueries({ queryKey: ["sections"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["stickers"] });
    },
  });
}
