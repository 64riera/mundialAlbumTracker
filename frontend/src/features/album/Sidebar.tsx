import { useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useSections } from "@/hooks/useSections";
import { useOverviewStats } from "@/hooks/useStats";
import { filterSections } from "@/lib/filterSections";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Sparkles,
  Trophy,
  Calendar,
  Download,
  ArrowLeftRight,
  Copy,
  Search,
  X,
} from "lucide-react";
import type { SectionSummary } from "@/types";

const CONFEDERATION_ORDER = [
  "CONMEBOL",
  "UEFA",
  "CONCACAF",
  "CAF",
  "AFC",
  "OFC",
  "PLAYOFF",
];
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
  forceOpen,
  onNavigate,
}: {
  confederation: string;
  sections: SectionSummary[];
  forceOpen?: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(confederation === "CONMEBOL");
  const isOpen = forceOpen || open;
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
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            meta?.color ?? "bg-slate-400"
          )}
        />
        <span className="flex-1 text-left text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {meta?.label ?? confederation}
        </span>
        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tabular-nums">
          {pct}%
        </span>
        {isOpen ? (
          <ChevronDown size={12} className="text-slate-400" />
        ) : (
          <ChevronRight size={12} className="text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-px ml-2 mr-1">
          {sections.map((section) => (
            <TeamLink
              key={section.code}
              section={section}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TeamLink({
  section,
  onNavigate,
}: {
  section: SectionSummary;
  onNavigate?: () => void;
}) {
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
          <span className="text-base w-6 text-center leading-none">
            {section.flagEmoji ?? ""}
          </span>
          <span className="flex-1 truncate font-medium">{section.name}</span>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isActive
                    ? "bg-white/60"
                    : section.percentage === 100
                      ? "bg-gold-400"
                      : "bg-brand-400"
                )}
                style={{ width: `${section.percentage}%` }}
              />
            </div>
            <span
              className={cn(
                "text-[10px] tabular-nums w-7 text-right",
                isActive
                  ? "text-brand-100"
                  : "text-slate-400 dark:text-slate-500"
              )}
            >
              {section.percentage}%
            </span>
          </div>
        </>
      )}
    </NavLink>
  );
}

function SidebarLink({
  to,
  label,
  Icon,
  onNavigate,
}: {
  to: string;
  label: string;
  Icon: typeof BookOpen;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={to}
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
          <Icon
            size={16}
            className={isActive ? "text-brand-200" : "text-slate-400"}
          />
          <span className="flex-1 font-medium">{label}</span>
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
  const [searchQuery, setSearchQuery] = useState("");

  const isSearching = searchQuery.trim().length > 0;

  const specialSections = sections.filter(
    (s) => s.type === "INTRO" || s.type === "SPECIAL"
  );
  const teamSections = sections.filter((s) => s.type === "TEAM");

  const filteredSpecial = useMemo(
    () => filterSections(specialSections, searchQuery),
    [specialSections, searchQuery]
  );
  const filteredTeams = useMemo(
    () => filterSections(teamSections, searchQuery),
    [teamSections, searchQuery]
  );

  const groupedTeams = useMemo(() => {
    return CONFEDERATION_ORDER.reduce(
      (acc, conf) => {
        const confTeams = filteredTeams.filter(
          (s) => s.confederation === conf
        );
        if (confTeams.length > 0) acc[conf] = confTeams;
        return acc;
      },
      {} as Record<string, SectionSummary[]>
    );
  }, [filteredTeams]);

  const pct = stats?.percentage ?? 0;
  const hasResults = filteredSpecial.length > 0 || filteredTeams.length > 0;

  return (
    <nav className="h-full overflow-y-auto flex flex-col">
      <div className="px-4 pt-4 pb-3">
        <div className="bg-gradient-to-br from-brand-800 to-brand-900 rounded-xl p-3.5 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-brand-200">
              {t.sidebar.myAlbum}
            </span>
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
              <span>
                {stats.owned + stats.duplicate} {t.sidebar.obtained}
              </span>
              <span>
                {stats.missing} {t.sidebar.missing}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Search input */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.sidebar.searchPlaceholder}
            className={cn(
              "w-full text-xs border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-7 py-2",
              "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100",
              "placeholder:text-slate-400 dark:placeholder:text-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            )}
          />
          {isSearching && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* When searching and no results */}
      {isSearching && !hasResults && (
        <div className="px-4 py-6 text-center">
          <Search size={24} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {t.sidebar.noResults}
          </p>
        </div>
      )}

      {/* Nav links — hidden while searching */}
      {!isSearching && (
        <div className="px-3 pb-2 space-y-0.5">
          <SidebarLink
            to="/matches"
            label={t.nav.matches}
            Icon={Calendar}
            onNavigate={onNavigate}
          />
          <SidebarLink
            to="/import"
            label={t.nav.import}
            Icon={Download}
            onNavigate={onNavigate}
          />
          <SidebarLink
            to="/compare"
            label={t.nav.compare}
            Icon={ArrowLeftRight}
            onNavigate={onNavigate}
          />
          <SidebarLink
            to="/duplicates"
            label={t.nav.duplicates}
            Icon={Copy}
            onNavigate={onNavigate}
          />
        </div>
      )}

      {/* Special sections */}
      {filteredSpecial.length > 0 && (
        <div className="px-3 pb-2">
          {!isSearching && (
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 mb-1.5">
              {t.sidebar.sections}
            </p>
          )}
          {filteredSpecial.map((section) => {
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
                    <Icon
                      size={16}
                      className={
                        isActive ? "text-brand-200" : "text-slate-400"
                      }
                    />
                    <span className="flex-1 font-medium">{section.name}</span>
                    <span
                      className={cn(
                        "text-[10px] tabular-nums",
                        isActive
                          ? "text-brand-100"
                          : "text-slate-400 dark:text-slate-500"
                      )}
                    >
                      {section.percentage}%
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      )}

      {/* Team sections */}
      {filteredTeams.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex-1 px-1">
          {!isSearching && (
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 mb-1.5">
              {t.sidebar.teams}
            </p>
          )}
          {CONFEDERATION_ORDER.map((conf) =>
            groupedTeams[conf] ? (
              <ConfederationGroup
                key={conf}
                confederation={conf}
                sections={groupedTeams[conf]}
                forceOpen={isSearching}
                onNavigate={onNavigate}
              />
            ) : null
          )}
        </div>
      )}
    </nav>
  );
}
