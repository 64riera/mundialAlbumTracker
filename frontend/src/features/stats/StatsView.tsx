import { useOverviewStats, useSectionStats } from "@/hooks/useStats";
import { useAuthStore } from "@/store/authStore";
import { useT } from "@/lib/i18n";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CheckCircle, Trophy, Target, TrendingUp } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CONFEDERATION_ORDER = ["CONMEBOL", "UEFA", "CONCACAF", "CAF", "AFC", "OFC", "PLAYOFF"];
const CONF_COLORS: Record<string, string> = {
  CONMEBOL: "#22c55e",
  UEFA: "#3b82f6",
  CONCACAF: "#f59e0b",
  CAF: "#ef4444",
  AFC: "#8b5cf6",
  OFC: "#06b6d4",
  PLAYOFF: "#6b7280",
};

export function StatsView() {
  const { data: overview, isLoading: loadingOverview } = useOverviewStats();
  const { data: sections, isLoading: loadingSections } = useSectionStats();
  const t = useT();
  const user = useAuthStore((s) => s.user);

  if (loadingOverview || loadingSections) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <div className="h-44 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!overview || !sections) return null;

  const pieData = [
    { name: t.stats.have, value: overview.owned, color: "#22c55e" },
    { name: t.stats.duplicates, value: overview.duplicate, color: "#facc15" },
    { name: t.stats.need, value: overview.missing, color: "#94a3b8" },
  ];

  const confData = CONFEDERATION_ORDER.map((conf) => {
    const confSections = sections.filter((s) => s.confederation === conf && s.type === "TEAM");
    const total = confSections.reduce((a, s) => a + s.total, 0);
    const owned = confSections.reduce((a, s) => a + s.owned, 0);
    return {
      name: conf,
      total,
      owned,
      pct: total > 0 ? Math.round((owned / total) * 100) : 0,
      color: CONF_COLORS[conf] ?? "#6b7280",
    };
  }).filter((d) => d.total > 0);

  const teamsSorted = sections
    .filter((s) => s.type === "TEAM")
    .sort((a, b) => b.percentage - a.percentage);

  const complete = teamsSorted.filter((s) => s.percentage === 100);
  const almostComplete = teamsSorted.filter((s) => s.percentage > 0 && s.percentage < 100).slice(0, 5);

  const STAT_PILLS = [
    { label: t.stats.have, value: overview.owned + overview.duplicate, accent: "text-brand-600 bg-brand-50 dark:bg-brand-900/30 border-brand-200 dark:border-brand-800" },
    { label: t.stats.need, value: overview.missing, accent: "text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" },
    { label: t.stats.duplicates, value: overview.duplicate, accent: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
      {/* Hero progress card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 via-brand-900 to-slate-900 p-5 sm:p-7 text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-600/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-400/5 rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="relative">
          <p className="text-brand-300 text-sm font-medium">
            {t.stats.hello}, {user?.firstName ?? t.stats.collector}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            Mundial 2026
          </h1>

          <div className="mt-5 flex items-end gap-4">
            <div>
              <p className="text-5xl sm:text-6xl font-black tabular-nums leading-none">{overview.percentage}%</p>
              <p className="text-brand-300 text-xs mt-1.5">{t.stats.completed}</p>
            </div>
            <div className="flex-1 mb-2">
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-400 to-emerald-300 transition-all duration-700"
                  style={{ width: `${overview.percentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[11px] text-brand-300/70">
                <span>{overview.owned + overview.duplicate} {t.stats.of} {overview.total}</span>
                <span>{overview.total - overview.owned - overview.duplicate} {t.stats.remaining}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-2.5">
        {STAT_PILLS.map(({ label, value, accent }) => (
          <div key={label} className={`rounded-xl border p-3 sm:p-4 text-center ${accent}`}>
            <p className="text-2xl sm:text-3xl font-bold tabular-nums">{value}</p>
            <p className="text-[11px] font-medium opacity-70 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">{t.stats.distribution}</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,.1)" }}
                formatter={(v: number) => [v, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-5 mt-1">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-slate-400" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.stats.byConfederation}</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={confData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={68} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,.1)" }}
                formatter={(v: number) => [`${v}%`, t.stats.completedLabel]}
              />
              <Bar dataKey="pct" radius={6} barSize={14}>
                {confData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Complete teams */}
      {complete.length > 0 && (
        <div className="bg-gradient-to-r from-gold-50 to-amber-50 dark:from-gold-900/20 dark:to-amber-900/10 rounded-2xl border border-gold-300/50 dark:border-gold-700/30 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={18} className="text-gold-500" />
            <p className="text-sm font-semibold text-gold-700 dark:text-gold-300">{t.stats.completeTeams} ({complete.length})</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {complete.map((s) => (
              <div key={s.code} className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/50 border border-gold-300/50 dark:border-gold-700/40 rounded-full px-3 py-1 shadow-sm">
                <span className="text-sm">{s.flagEmoji}</span>
                <span className="text-xs font-semibold text-gold-700 dark:text-gold-300">{s.name}</span>
                <CheckCircle size={11} className="text-gold-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Almost complete */}
      {almostComplete.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-brand-600" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t.stats.almostComplete}</p>
          </div>
          <div className="space-y-3">
            {almostComplete.map((s) => (
              <div key={s.code} className="flex items-center gap-3">
                <span className="text-xl w-7 text-center">{s.flagEmoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 dark:text-slate-200 font-medium truncate">{s.name}</span>
                    <span className="text-slate-400 text-xs tabular-nums ml-2">{s.owned}/{s.total}</span>
                  </div>
                  <ProgressBar value={s.owned} max={s.total} size="sm" />
                </div>
                <span className="text-sm font-bold text-brand-600 tabular-nums w-10 text-right">{s.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All teams heatmap */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">{t.stats.allTeams}</p>
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-1.5">
          {teamsSorted.map((s) => {
            const intensity = s.percentage / 100;
            return (
              <div
                key={s.code}
                title={`${s.name}: ${s.percentage}%`}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-colors cursor-default"
                style={{
                  backgroundColor: s.percentage === 100
                    ? "rgba(250,204,21,0.15)"
                    : `rgba(34,197,94,${intensity * 0.18})`,
                }}
              >
                <span className="text-base leading-none">{s.flagEmoji}</span>
                <span className="text-[9px] tabular-nums font-medium text-slate-500 dark:text-slate-400">{s.percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
