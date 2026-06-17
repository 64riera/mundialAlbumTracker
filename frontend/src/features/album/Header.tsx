import { NavLink } from "react-router-dom";
import { useOverviewStats } from "@/hooks/useStats";
import { useLogout } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Menu, BarChart3, Copy, LogOut, X, QrCode } from "lucide-react";

export function Header() {
  const { data: stats } = useOverviewStats();
  const { setSidebarOpen, sidebarOpen } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="bg-brand-900 text-white px-3 sm:px-4 py-3 flex items-center gap-3 sm:gap-4 shadow-md z-50 relative">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="text-white/70 hover:text-white transition-colors p-1 -ml-1"
        aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {sidebarOpen ? <X size={22} className="md:hidden" /> : null}
        <Menu size={22} className={sidebarOpen ? "hidden md:block" : ""} />
      </button>

      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-2xl shrink-0">⚽</span>
        <div className="min-w-0">
          <h1 className="font-bold text-lg leading-none">Mundial 2026</h1>
          <p className="text-brand-300 text-xs truncate">
            <span className="hidden sm:inline">Álbum Panini</span>
            <span className="sm:hidden">{user?.firstName ?? "Álbum"}</span>
          </p>
        </div>
      </div>

      {stats && (
        <div className="flex-1 max-w-xs hidden sm:block">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-brand-300">
              {stats.owned + stats.duplicate}/{stats.total} figuritas
            </span>
            <span className="text-white font-semibold">{stats.percentage}%</span>
          </div>
          <ProgressBar
            value={stats.owned + stats.duplicate}
            max={stats.total}
            size="sm"
            className="opacity-80"
          />
        </div>
      )}

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <ThemeToggle />

        <NavLink
          to="/stats"
          className={({ isActive }) =>
            `flex items-center gap-1.5 text-sm px-2 sm:px-3 py-1.5 rounded-lg transition-colors ${
              isActive
                ? "bg-brand-700 text-white"
                : "text-brand-300 hover:text-white hover:bg-brand-800"
            }`
          }
        >
          <BarChart3 size={16} />
          <span className="hidden sm:block">Estadísticas</span>
        </NavLink>

        <NavLink
          to="/import"
          className={({ isActive }) =>
            `flex items-center gap-1.5 text-sm px-2 sm:px-3 py-1.5 rounded-lg transition-colors ${
              isActive
                ? "bg-brand-700 text-white"
                : "text-brand-300 hover:text-white hover:bg-brand-800"
            }`
          }
        >
          <QrCode size={16} />
          <span className="hidden sm:block">Importar</span>
        </NavLink>

        <NavLink
          to="/duplicates"
          className={({ isActive }) =>
            `flex items-center gap-1.5 text-sm px-2 sm:px-3 py-1.5 rounded-lg transition-colors ${
              isActive
                ? "bg-brand-700 text-white"
                : "text-brand-300 hover:text-white hover:bg-brand-800"
            }`
          }
        >
          <Copy size={16} />
          <span className="hidden sm:block">
            Duplicadas {stats?.duplicate ? `(${stats.duplicate})` : ""}
          </span>
        </NavLink>

        <button
          onClick={() => logout.mutate()}
          className="text-brand-300 hover:text-white hover:bg-brand-800 p-1.5 rounded-lg transition-colors"
          title="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
