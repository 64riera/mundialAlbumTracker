import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CompareResult } from "@/types";

export function useCompareAlbum() {
  return useMutation({
    mutationFn: (codes: string[]) =>
      api.post<CompareResult>("/api/stickers/compare", { codes }).then((r) => r.data),
  });
}
