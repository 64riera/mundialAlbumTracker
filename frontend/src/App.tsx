import { Routes, Route, Navigate } from "react-router-dom";
import { Header } from "@/features/album/Header";
import { Sidebar } from "@/features/album/Sidebar";
import { AlbumView } from "@/features/album/AlbumView";
import { StatsView } from "@/features/stats/StatsView";
import { DuplicatesView } from "@/features/duplicates/DuplicatesView";
import { QuickAddDrawer, QuickAddFAB } from "@/features/quickadd/QuickAddDrawer";
import { ToastContainer } from "@/components/ui/Toast";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

export default function App() {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-white border-r border-slate-200 transition-all duration-300 flex-shrink-0",
            "hidden md:block",
            sidebarOpen ? "w-64" : "w-0"
          )}
        >
          <Sidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/album/INTRO" replace />} />
            <Route path="/album/:sectionCode" element={<AlbumView />} />
            <Route path="/stats" element={<StatsView />} />
            <Route path="/duplicates" element={<DuplicatesView />} />
            <Route path="*" element={<Navigate to="/album/INTRO" replace />} />
          </Routes>
        </main>
      </div>

      <QuickAddDrawer />
      <QuickAddFAB />
      <ToastContainer />
    </div>
  );
}
