import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ImportResult {
  imported: number;
  notFound: string[];
}

export function useImportAlbum() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (codes: string[]) =>
      api.post<ImportResult>("/api/stickers/import", { codes }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["section"] });
      qc.invalidateQueries({ queryKey: ["sections"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["stickers"] });
    },
  });
}
