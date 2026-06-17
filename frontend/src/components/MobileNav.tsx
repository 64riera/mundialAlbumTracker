import { NavLink } from "react-router-dom";
import { BookOpen, BarChart3, Copy, ArrowLeftRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const t = useT();

  const NAV_ITEMS = [
    { to: "/stats", label: t.nav.home, Icon: BarChart3, match: "/stats" },
    { to: "/album/FWC", label: t.nav.album, Icon: BookOpen, match: "/album" },
    { to: "/compare", label: t.nav.compare, Icon: ArrowLeftRight, match: "/compare" },
    { to: "/duplicates", label: t.nav.duplicates, Icon: Copy, match: "/duplicates" },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 px-3 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
      <div className="liquid-glass rounded-2xl mx-auto max-w-sm">
        <div className="flex items-center justify-around px-1 py-1">
          {NAV_ITEMS.map(({ to, label, Icon, match }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => {
                const active = isActive || (match && location.pathname.startsWith(match));
                return cn(
                  "flex flex-col items-center py-1 px-3 rounded-xl transition-all duration-200",
                  active
                    ? "text-brand-700 dark:text-brand-300"
                    : "text-slate-500 dark:text-slate-400 active:scale-90"
                );
              }}
            >
              {({ isActive }) => {
                const active = isActive || (match && location.pathname.startsWith(match));
                return (
                  <>
                    <div className={cn(
                      "flex items-center justify-center w-8 h-6 rounded-full transition-all duration-200",
                      active && "liquid-glass-pill"
                    )}>
                      <Icon size={16} strokeWidth={active ? 2.2 : 1.5} />
                    </div>
                    <span className={cn(
                      "text-[9px] leading-none mt-px",
                      active ? "font-bold" : "font-medium opacity-60"
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
