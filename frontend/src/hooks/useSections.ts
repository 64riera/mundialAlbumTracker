import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SectionSummary, SectionDetail } from "@/types";

export function useSections() {
  return useQuery<SectionSummary[]>({
    queryKey: ["sections"],
    queryFn: () => api.get("/api/sections").then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useSectionDetail(code: string) {
  return useQuery<SectionDetail>({
    queryKey: ["section", code],
    queryFn: () => api.get(`/api/sections/${code}`).then((r) => r.data),
    enabled: !!code,
  });
}
