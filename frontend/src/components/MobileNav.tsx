import { NavLink } from "react-router-dom";
import { BookOpen, BarChart3, Copy, QrCode } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const t = useT();

  const NAV_ITEMS = [
    { to: "/stats", label: t.nav.home, Icon: BarChart3, match: "/stats" },
    { to: "/album/FWC", label: t.nav.album, Icon: BookOpen, match: "/album" },
    { to: "/import", label: t.nav.import, Icon: QrCode, match: "/import" },
    { to: "/duplicates", label: t.nav.duplicates, Icon: Copy, match: "/duplicates" },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map(({ to, label, Icon, match }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => {
              const active = isActive || (match && location.pathname.startsWith(match));
              return cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[60px]",
                active
                  ? "text-brand-600"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              );
            }}
          >
            <Icon size={20} strokeWidth={1.5} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
