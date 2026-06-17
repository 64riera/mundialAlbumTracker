import { create } from "zustand";

interface UIStore {
  sidebarOpen: boolean;
  quickAddOpen: boolean;
  searchOpen: boolean;
  stickerFilter: "all" | "owned" | "missing" | "duplicate";
  setSidebarOpen: (open: boolean) => void;
  setQuickAddOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setStickerFilter: (filter: "all" | "owned" | "missing" | "duplicate") => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  quickAddOpen: false,
  searchOpen: false,
  stickerFilter: "all",
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setQuickAddOpen: (open) => set({ quickAddOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setStickerFilter: (filter) => set({ stickerFilter: filter }),
}));
