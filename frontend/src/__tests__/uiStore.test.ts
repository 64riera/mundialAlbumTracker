import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "../store/uiStore";

describe("uiStore", () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarOpen: true,
      quickAddOpen: false,
      searchOpen: false,
      stickerFilter: "all",
    });
  });

  it("toggles sidebar", () => {
    useUIStore.getState().setSidebarOpen(false);
    expect(useUIStore.getState().sidebarOpen).toBe(false);

    useUIStore.getState().setSidebarOpen(true);
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it("toggles quick add drawer", () => {
    useUIStore.getState().setQuickAddOpen(true);
    expect(useUIStore.getState().quickAddOpen).toBe(true);
  });

  it("sets sticker filter", () => {
    useUIStore.getState().setStickerFilter("owned");
    expect(useUIStore.getState().stickerFilter).toBe("owned");

    useUIStore.getState().setStickerFilter("duplicate");
    expect(useUIStore.getState().stickerFilter).toBe("duplicate");
  });

  it("toggles search", () => {
    useUIStore.getState().setSearchOpen(true);
    expect(useUIStore.getState().searchOpen).toBe(true);
  });
});
