import { useOverviewStats, useSectionStats } from "@/hooks/useStats";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BarChart3, Package, CheckCircle, XCircle, Copy, Trophy, Target } from "lucide-react";
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

  if (loadingOverview || loadingSections) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!overview || !sections) return null;

  const pieData = [
    { name: "Tengo", value: overview.owned, color: "#22c55e" },
    { name: "Duplicadas", value: overview.duplicate, color: "#facc15" },
    { name: "Faltan", value: overview.missing, color: "#e2e8f0" },
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

  const OVERVIEW_CARDS = [
    { label: "Total", value: overview.total, Icon: Package, color: "text-slate-700 dark:text-slate-200" },
    { label: "Tengo", value: overview.owned, Icon: CheckCircle, color: "text-brand-600" },
    { label: "Faltan", value: overview.missing, Icon: XCircle, color: "text-red-500" },
    { label: "Duplicadas", value: overview.duplicate, Icon: Copy, color: "text-amber-500" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-2.5">
        <BarChart3 size={24} className="text-brand-600" />
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Estadisticas</h1>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {OVERVIEW_CARDS.map(({ label, value, Icon, color }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
            <Icon size={20} className={`mx-auto mb-2 ${color}`} strokeWidth={1.5} />
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-slate-700 dark:text-slate-200">Progreso global</p>
          <span className="text-brand-600 font-bold text-lg">{overview.percentage}%</span>
        </div>
        <ProgressBar value={overview.owned + overview.duplicate} max={overview.total} size="lg" />
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Distribucion</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [v, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-slate-600 dark:text-slate-300">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <p className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Por confederacion</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={confData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v}%`, "Completado"]} />
              <Bar dataKey="pct" radius={4}>
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
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={18} className="text-gold-500" />
            <p className="font-semibold text-slate-700 dark:text-slate-200">Equipos completos ({complete.length})</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {complete.map((s) => (
              <div key={s.code} className="flex items-center gap-1.5 bg-gold-50 dark:bg-gold-900/30 border border-gold-300 dark:border-gold-600 rounded-full px-3 py-1">
                <span>{s.flagEmoji}</span>
                <span className="text-sm font-medium text-gold-700 dark:text-gold-300">{s.name}</span>
                <CheckCircle size={12} className="text-gold-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Almost complete */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target size={18} className="text-brand-600" />
          <p className="font-semibold text-slate-700 dark:text-slate-200">Casi completos</p>
        </div>
        <div className="space-y-3">
          {almostComplete.map((s) => (
            <div key={s.code} className="flex items-center gap-3">
              <span className="text-xl w-7">{s.flagEmoji}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{s.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">{s.owned}/{s.total}</span>
                </div>
                <ProgressBar value={s.owned} max={s.total} size="sm" />
              </div>
              <span className="text-sm font-semibold text-brand-600 w-10 text-right">
                {s.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* All teams heatmap */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <p className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Todos los equipos</p>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {teamsSorted.map((s) => (
            <div
              key={s.code}
              title={`${s.name}: ${s.percentage}%`}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-100 dark:border-slate-700"
              style={{
                backgroundColor: `rgba(34,197,94,${s.percentage / 100 * 0.5 + (s.percentage === 100 ? 0.5 : 0)})`,
              }}
            >
              <span className="text-lg">{s.flagEmoji}</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">{s.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
