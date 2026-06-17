import { NavLink } from "react-router-dom";
import { useOverviewStats } from "@/hooks/useStats";
import { useUIStore } from "@/store/uiStore";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Menu, BarChart3, Copy } from "lucide-react";

export function Header() {
  const { data: stats } = useOverviewStats();
  const { setSidebarOpen, sidebarOpen } = useUIStore();

  return (
    <header className="bg-brand-900 text-white px-4 py-3 flex items-center gap-4 shadow-md">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="text-white/70 hover:text-white transition-colors md:hidden"
      >
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-2.5">
        <span className="text-2xl">🏆</span>
        <div>
          <h1 className="font-bold text-lg leading-none">Mundial 2026</h1>
          <p className="text-brand-300 text-xs">Álbum Panini</p>
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

      <div className="ml-auto flex items-center gap-2">
        <NavLink
          to="/stats"
          className={({ isActive }) =>
            `flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
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
          to="/duplicates"
          className={({ isActive }) =>
            `flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
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
      </div>
    </header>
  );
}
