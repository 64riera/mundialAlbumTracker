import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSections } from "@/hooks/useSections";
import { useOverviewStats } from "@/hooks/useStats";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, BookOpen, Sparkles, Trophy, Calendar } from "lucide-react";
import type { SectionSummary } from "@/types";

const CONFEDERATION_ORDER = ["CONMEBOL", "UEFA", "CONCACAF", "CAF", "AFC", "OFC", "PLAYOFF"];
const CONFEDERATION_META: Record<string, { label: string; color: string }> = {
  CONMEBOL: { label: "CONMEBOL", color: "bg-emerald-500" },
  UEFA: { label: "UEFA", color: "bg-blue-500" },
  CONCACAF: { label: "CONCACAF", color: "bg-amber-500" },
  CAF: { label: "CAF", color: "bg-red-500" },
  AFC: { label: "AFC", color: "bg-violet-500" },
  OFC: { label: "OFC", color: "bg-cyan-500" },
  PLAYOFF: { label: "Playoffs", color: "bg-slate-500" },
};

const SPECIAL_ICONS: Record<string, typeof BookOpen> = {
  PANINI: BookOpen,
  FWC: Trophy,
  CC: Sparkles,
};

function ConfederationGroup({
  confederation,
  sections,
  onNavigate,
}: {
  confederation: string;
  sections: SectionSummary[];
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(confederation === "CONMEBOL");
  const owned = sections.reduce((a, s) => a + s.owned, 0);
  const total = sections.reduce((a, s) => a + s.total, 0);
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
  const meta = CONFEDERATION_META[confederation];

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-lg mx-1"
        style={{ width: "calc(100% - 0.5rem)" }}
      >
        <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", meta?.color ?? "bg-slate-400")} />
        <span className="flex-1 text-left text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {meta?.label ?? confederation}
        </span>
        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tabular-nums">{pct}%</span>
        {open ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
      </button>

      {open && (
        <div className="space-y-px ml-2 mr-1">
          {sections.map((section) => (
            <TeamLink key={section.code} section={section} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}

function TeamLink({ section, onNavigate }: { section: SectionSummary; onNavigate?: () => void }) {
  return (
    <NavLink
      to={`/album/${section.code}`}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all text-[13px]",
          isActive
            ? "bg-brand-600 text-white shadow-sm shadow-brand-600/20"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className="text-base w-6 text-center leading-none">{section.flagEmoji ?? ""}</span>
          <span className="flex-1 truncate font-medium">{section.name}</span>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isActive ? "bg-white/60" : section.percentage === 100 ? "bg-gold-400" : "bg-brand-400"
                )}
                style={{ width: `${section.percentage}%` }}
              />
            </div>
            <span className={cn(
              "text-[10px] tabular-nums w-7 text-right",
              isActive ? "text-brand-100" : "text-slate-400 dark:text-slate-500"
            )}>
              {section.percentage}%
            </span>
          </div>
        </>
      )}
    </NavLink>
  );
}

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const t = useT();
  const { data: sections = [] } = useSections();
  const { data: stats } = useOverviewStats();

  const specialSections = sections.filter((s) => s.type === "INTRO" || s.type === "SPECIAL");
  const teamSections = sections.filter((s) => s.type === "TEAM");

  const groupedTeams = CONFEDERATION_ORDER.reduce((acc, conf) => {
    const confTeams = teamSections.filter((s) => s.confederation === conf);
    if (confTeams.length > 0) acc[conf] = confTeams;
    return acc;
  }, {} as Record<string, SectionSummary[]>);

  const pct = stats?.percentage ?? 0;

  return (
    <nav className="h-full overflow-y-auto flex flex-col">
      <div className="px-4 pt-4 pb-3">
        <div className="bg-gradient-to-br from-brand-800 to-brand-900 rounded-xl p-3.5 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-brand-200">{t.sidebar.myAlbum}</span>
            <span className="text-lg font-bold">{pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-300 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          {stats && (
            <div className="flex justify-between mt-2 text-[10px] text-brand-300">
              <span>{stats.owned + stats.duplicate} {t.sidebar.obtained}</span>
              <span>{stats.missing} {t.sidebar.missing}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-3 pb-2">
        <NavLink
          to="/matches"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[13px] mb-2",
              isActive
                ? "bg-brand-600 text-white shadow-sm shadow-brand-600/20"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            )
          }
        >
          {({ isActive }) => (
            <>
              <Calendar size={16} className={isActive ? "text-brand-200" : "text-slate-400"} />
              <span className="flex-1 font-medium">{t.nav.matches}</span>
            </>
          )}
        </NavLink>

        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-1.5">
          {t.sidebar.sections}
        </p>
        {specialSections.map((section) => {
          const Icon = SPECIAL_ICONS[section.code] ?? BookOpen;
          return (
            <NavLink
              key={section.code}
              to={`/album/${section.code}`}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[13px]",
                  isActive
                    ? "bg-brand-600 text-white shadow-sm shadow-brand-600/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? "text-brand-200" : "text-slate-400"} />
                  <span className="flex-1 font-medium">{section.name}</span>
                  <span className={cn("text-[10px] tabular-nums", isActive ? "text-brand-100" : "text-slate-400 dark:text-slate-500")}>
                    {section.percentage}%
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex-1 px-1">
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 mb-1.5">
          {t.sidebar.teams}
        </p>
        {CONFEDERATION_ORDER.map((conf) =>
          groupedTeams[conf] ? (
            <ConfederationGroup key={conf} confederation={conf} sections={groupedTeams[conf]} onNavigate={onNavigate} />
          ) : null
        )}
      </div>
    </nav>
  );
}
