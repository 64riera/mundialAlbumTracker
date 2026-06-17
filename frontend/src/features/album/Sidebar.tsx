import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSections } from "@/hooks/useSections";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { SectionSummary } from "@/types";

const CONFEDERATION_ORDER = ["CONMEBOL", "UEFA", "CONCACAF", "CAF", "AFC", "OFC", "PLAYOFF"];
const CONFEDERATION_LABELS: Record<string, string> = {
  CONMEBOL: "CONMEBOL",
  UEFA: "UEFA",
  CONCACAF: "CONCACAF",
  CAF: "CAF",
  AFC: "AFC",
  OFC: "OFC",
  PLAYOFF: "Playoffs",
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

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-wider transition-colors"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span className="flex-1 text-left">{CONFEDERATION_LABELS[confederation] ?? confederation}</span>
        <span className="font-normal normal-case">{owned}/{total}</span>
      </button>

      {open && (
        <div className="space-y-0.5">
          {sections.map((section) => (
            <NavLink
              key={section.code}
              to={`/album/${section.code}`}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg mx-1 transition-colors text-sm",
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className="text-base w-6 text-center">{section.flagEmoji ?? "📋"}</span>
                  <span className="flex-1 truncate">{section.name}</span>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={cn("text-[10px]", isActive ? "text-brand-200" : "text-slate-400 dark:text-slate-500")}>
                      {section.percentage}%
                    </span>
                    <div className="w-12">
                      <ProgressBar
                        value={section.owned}
                        max={section.total}
                        size="sm"
                        className={isActive ? "opacity-70" : ""}
                      />
                    </div>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { data: sections = [] } = useSections();

  const specialSections = sections.filter(
    (s) => s.type === "INTRO" || s.type === "SPECIAL"
  );
  const teamSections = sections.filter((s) => s.type === "TEAM");

  const groupedTeams = CONFEDERATION_ORDER.reduce(
    (acc, conf) => {
      const confTeams = teamSections.filter((s) => s.confederation === conf);
      if (confTeams.length > 0) acc[conf] = confTeams;
      return acc;
    },
    {} as Record<string, SectionSummary[]>
  );

  return (
    <nav className="h-full overflow-y-auto py-3 space-y-1">
      <div className="px-3 pb-1">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-0 mb-2">
          Álbum
        </p>
        {specialSections.map((section) => (
          <NavLink
            key={section.code}
            to={`/album/${section.code}`}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-sm",
                isActive
                  ? "bg-brand-600 text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="text-base w-6 text-center">{section.flagEmoji ?? (section.code === "INTRO" ? "📖" : "🏟️")}</span>
                <span className="flex-1">{section.name}</span>
                <span className={cn("text-[10px]", isActive ? "text-brand-200" : "text-slate-400 dark:text-slate-500")}>
                  {section.percentage}%
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="border-t border-slate-100 dark:border-slate-700 pt-2">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-4 mb-2">
          Equipos
        </p>
        {CONFEDERATION_ORDER.map((conf) =>
          groupedTeams[conf] ? (
            <ConfederationGroup
              key={conf}
              confederation={conf}
              sections={groupedTeams[conf]}
              onNavigate={onNavigate}
            />
          ) : null
        )}
      </div>
    </nav>
  );
}
