import { NavLink, Link } from "react-router-dom";
import { useOverviewStats } from "@/hooks/useStats";
import { useLogout } from "@/hooks/useAuth";
import { useUIStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Menu, LogOut, X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/stats", label: "Inicio" },
  { to: "/album/FWC", label: "Album", match: "/album" },
  { to: "/import", label: "Importar" },
  { to: "/duplicates", label: "Duplicadas" },
];

export function Header() {
  const { data: stats } = useOverviewStats();
  const { setSidebarOpen, sidebarOpen } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="bg-brand-900 text-white shadow-md z-50 relative">
      {/* Top row */}
      <div className="px-3 sm:px-5 py-2.5 flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white/70 hover:text-white transition-colors p-1 -ml-1"
          aria-label={sidebarOpen ? "Cerrar menu" : "Abrir menu"}
        >
          {sidebarOpen ? <X size={22} className="md:hidden" /> : null}
          <Menu size={22} className={sidebarOpen ? "hidden md:block" : ""} />
        </button>

        <Link to="/stats" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <Trophy size={18} className="text-gold-400" />
          </div>
          <div className="min-w-0 hidden sm:block">
            <h1 className="font-bold text-base leading-none tracking-tight">Mundial 2026</h1>
            <p className="text-brand-300 text-[11px] mt-0.5">Album Panini Tracker</p>
          </div>
        </Link>

        {stats && (
          <div className="hidden md:flex items-center gap-3 ml-2 bg-white/5 rounded-lg px-3 py-1.5">
            <div className="text-right">
              <p className="text-[11px] text-brand-300 leading-none">Progreso</p>
              <p className="text-sm font-bold leading-none mt-0.5">{stats.percentage}%</p>
            </div>
            <div className="w-24">
              <ProgressBar value={stats.owned + stats.duplicate} max={stats.total} size="sm" className="opacity-80" />
            </div>
            <p className="text-[11px] text-brand-300">{stats.owned + stats.duplicate}/{stats.total}</p>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />

          {user && (
            <div className="hidden sm:flex items-center gap-2 ml-1 pl-2 border-l border-white/10">
              <div className="w-7 h-7 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <span className="text-sm text-brand-200 hidden lg:block">{user.firstName}</span>
            </div>
          )}

          <button
            onClick={() => logout.mutate()}
            className="text-brand-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            title="Cerrar sesion"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Nav row — desktop only */}
      <nav className="hidden sm:flex items-center gap-1 px-5 pb-2">
        {NAV_LINKS.map(({ to, label, match }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => {
              const active = isActive || (match && location.pathname.startsWith(match));
              return cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-white/15 text-white"
                  : "text-brand-300 hover:text-white hover:bg-white/10"
              );
            }}
          >
            {label}
            {label === "Duplicadas" && stats?.duplicate ? (
              <span className="ml-1.5 text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full">
                {stats.duplicate}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
