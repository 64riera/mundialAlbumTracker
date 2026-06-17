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

const isDesktop = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(min-width: 768px)").matches
    : false;

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: isDesktop(),
  quickAddOpen: false,
  searchOpen: false,
  stickerFilter: "all",
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setQuickAddOpen: (open) => set({ quickAddOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setStickerFilter: (filter) => set({ stickerFilter: filter }),
}));
