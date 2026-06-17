import { Routes, Route, Navigate } from "react-router-dom";
import { Header } from "@/features/album/Header";
import { Sidebar } from "@/features/album/Sidebar";
import { AlbumView } from "@/features/album/AlbumView";
import { StatsView } from "@/features/stats/StatsView";
import { DuplicatesView } from "@/features/duplicates/DuplicatesView";
import { ImportPage } from "@/features/import/ImportPage";
import { ComparePage } from "@/features/compare/ComparePage";
import { ScannerPage } from "@/features/scanner/ScannerPage";
import { MatchesPage } from "@/features/matches/MatchesPage";
import { QuickAddDrawer, QuickAddFAB } from "@/features/quickadd/QuickAddDrawer";
import { ToastContainer } from "@/components/ui/Toast";
import { MobileNav } from "@/components/MobileNav";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { useUIStore } from "@/store/uiStore";
import { useThemeEffect } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

function AppShell() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Header />
      <OfflineBanner />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — overlay on mobile, inline on desktop */}
        <aside
          className={cn(
            "bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex-shrink-0 z-40",
            "fixed inset-y-0 left-0 w-72 pt-[52px] transition-transform duration-300 md:relative md:pt-0 md:transition-none",
            sidebarOpen
              ? "translate-x-0 md:w-64"
              : "-translate-x-full md:translate-x-0 md:w-0 md:border-r-0"
          )}
        >
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </aside>

        <main className="flex-1 overflow-y-auto pb-16 sm:pb-0">
          <Routes>
            <Route path="/" element={<Navigate to="/stats" replace />} />
            <Route path="/album/:sectionCode" element={<AlbumView />} />
            <Route path="/stats" element={<StatsView />} />
            <Route path="/duplicates" element={<DuplicatesView />} />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/scanner" element={<ScannerPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="*" element={<Navigate to="/stats" replace />} />
          </Routes>
        </main>
      </div>

      <MobileNav />
      <QuickAddDrawer />
      <QuickAddFAB />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  useThemeEffect();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
