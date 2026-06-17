import { useState, useMemo } from "react";
import { useAllMatches, useTodayMatches } from "@/hooks/useMatches";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Calendar, Trophy, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { MatchCard } from "./MatchCard";
import { GroupStandingsView } from "./GroupStandings";
import { NotificationSettings } from "./NotificationSettings";
import type { Match } from "@/types";

type Tab = "today" | "calendar" | "groups";

function groupMatchesByDate(matches: Match[]): Map<string, Match[]> {
  const groups = new Map<string, Match[]>();
  for (const match of matches) {
    const date = match.utcDate.slice(0, 10);
    const existing = groups.get(date);
    if (existing) {
      existing.push(match);
    } else {
      groups.set(date, [match]);
    }
  }
  return groups;
}

function formatDateHeading(dateStr: string, isSpanish: boolean): string {
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (dateStr === todayStr) return isSpanish ? "Hoy" : "Today";
  if (dateStr === tomorrowStr) return isSpanish ? "Manana" : "Tomorrow";
  if (dateStr === yesterdayStr) return isSpanish ? "Ayer" : "Yesterday";

  return date.toLocaleDateString(isSpanish ? "es" : "en", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function SkeletonCards() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"
        />
      ))}
    </div>
  );
}

function TodayView() {
  const { data, isLoading } = useTodayMatches();
  const t = useT();
  const isSpanish = t.nav.home === "Inicio";

  if (isLoading) return <SkeletonCards />;

  if (!data?.matches.length) {
    return (
      <div className="text-center py-12">
        <Calendar size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm text-slate-400 dark:text-slate-500">
          {isSpanish
            ? "No hay partidos programados para hoy"
            : "No matches scheduled for today"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}

function CalendarView() {
  const { data, isLoading } = useAllMatches();
  const t = useT();
  const isSpanish = t.nav.home === "Inicio";

  const allDates = useMemo(() => {
    if (!data?.matches.length) return [];
    return [...groupMatchesByDate(data.matches).keys()].sort();
  }, [data]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const initialPage = useMemo(() => {
    const idx = allDates.findIndex((d) => d >= todayStr);
    return idx >= 0 ? idx : 0;
  }, [allDates, todayStr]);

  const [currentDateIdx, setCurrentDateIdx] = useState<number | null>(null);
  const activeIdx = currentDateIdx ?? initialPage;

  const matchesByDate = useMemo(() => {
    if (!data?.matches.length) return new Map<string, Match[]>();
    return groupMatchesByDate(data.matches);
  }, [data]);

  if (isLoading) return <SkeletonCards />;

  if (!allDates.length) {
    return (
      <div className="text-center py-12">
        <Calendar size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-sm text-slate-400 dark:text-slate-500">
          {isSpanish
            ? "No hay partidos disponibles"
            : "No matches available"}
        </p>
      </div>
    );
  }

  const currentDate = allDates[activeIdx];
  const currentMatches = matchesByDate.get(currentDate) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
        <button
          onClick={() => setCurrentDateIdx(Math.max(0, activeIdx - 1))}
          disabled={activeIdx === 0}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={18} className="text-slate-600 dark:text-slate-300" />
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize">
            {formatDateHeading(currentDate, isSpanish)}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {currentMatches.length}{" "}
            {currentMatches.length === 1
              ? isSpanish
                ? "partido"
                : "match"
              : isSpanish
                ? "partidos"
                : "matches"}
          </p>
        </div>

        <button
          onClick={() =>
            setCurrentDateIdx(Math.min(allDates.length - 1, activeIdx + 1))
          }
          disabled={activeIdx === allDates.length - 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={18} className="text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      <div className="space-y-3">
        {currentMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}

export function MatchesPage() {
  const [tab, setTab] = useState<Tab>("today");
  const t = useT();
  const isSpanish = t.nav.home === "Inicio";

  const TABS: { key: Tab; label: string; Icon: typeof Calendar }[] = [
    {
      key: "today",
      label: isSpanish ? "Hoy" : "Today",
      Icon: Trophy,
    },
    {
      key: "calendar",
      label: isSpanish ? "Calendario" : "Calendar",
      Icon: Calendar,
    },
    {
      key: "groups",
      label: isSpanish ? "Grupos" : "Groups",
      Icon: Users,
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
          {isSpanish ? "Partidos" : "Matches"}
        </h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
          {isSpanish
            ? "Resultados y calendario del Mundial 2026"
            : "World Cup 2026 results & schedule"}
        </p>
      </div>

      <NotificationSettings />

      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5 mt-4">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
              tab === key
                ? "bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === "today" && <TodayView />}
      {tab === "calendar" && <CalendarView />}
      {tab === "groups" && <GroupStandingsView />}
    </div>
  );
}
