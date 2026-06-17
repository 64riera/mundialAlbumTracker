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
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-700/60 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-around px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
          {NAV_ITEMS.map(({ to, label, Icon, match }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => {
                const active = isActive || (match && location.pathname.startsWith(match));
                return cn(
                  "relative flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all duration-200 min-w-[64px]",
                  active
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-slate-400 dark:text-slate-500 active:scale-95"
                );
              }}
            >
              {({ isActive }) => {
                const active = isActive || (match && location.pathname.startsWith(match));
                return (
                  <>
                    {active && (
                      <span className="absolute inset-x-2 top-0 h-[3px] rounded-b-full bg-brand-500" />
                    )}
                    <div className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-xl transition-colors duration-200",
                      active && "bg-brand-50 dark:bg-brand-900/30"
                    )}>
                      <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                    </div>
                    <span className={cn(
                      "text-[10px] leading-none transition-colors duration-200",
                      active ? "font-semibold" : "font-medium"
                    )}>
                      {label}
                    </span>
                  </>
                );
              }}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
