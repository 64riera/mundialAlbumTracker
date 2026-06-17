import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { OverviewStats, SectionStats, StickerSummary } from "@/types";

export function useOverviewStats() {
  return useQuery<OverviewStats>({
    queryKey: ["stats", "overview"],
    queryFn: () => api.get("/api/stats/overview").then((r) => r.data),
    refetchInterval: 30_000,
  });
}

export function useSectionStats() {
  return useQuery<SectionStats[]>({
    queryKey: ["stats", "by-section"],
    queryFn: () => api.get("/api/stats/by-section").then((r) => r.data),
  });
}

export function useDuplicates() {
  return useQuery<StickerSummary[]>({
    queryKey: ["stats", "duplicates"],
    queryFn: () => api.get("/api/stats/duplicates").then((r) => r.data),
  });
}
