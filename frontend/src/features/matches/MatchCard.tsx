import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import type { Match } from "@/types";

const STAGE_LABELS: Record<string, { es: string; en: string }> = {
  GROUP_STAGE: { es: "Fase de grupos", en: "Group Stage" },
  ROUND_OF_16: { es: "Octavos de final", en: "Round of 16" },
  QUARTER_FINALS: { es: "Cuartos de final", en: "Quarter-finals" },
  SEMI_FINALS: { es: "Semifinales", en: "Semi-finals" },
  THIRD_PLACE: { es: "Tercer puesto", en: "Third Place" },
  FINAL: { es: "Final", en: "Final" },
};

function isLive(status: string): boolean {
  return status === "IN_PLAY" || status === "PAUSED";
}

function formatTime(utcDate: string): string {
  return new Date(utcDate).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TeamRow({
  name,
  tla,
  crest,
  score,
  isWinner,
}: {
  name: string;
  tla: string;
  crest: string;
  score: number | null;
  isWinner: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={crest}
        alt={tla}
        className="w-7 h-5 object-contain rounded-sm"
        loading="lazy"
      />
      <span
        className={cn(
          "flex-1 text-sm truncate",
          isWinner
            ? "font-bold text-slate-900 dark:text-white"
            : "font-medium text-slate-600 dark:text-slate-300"
        )}
      >
        {name}
      </span>
      <span
        className={cn(
          "text-lg tabular-nums w-6 text-center",
          isWinner
            ? "font-bold text-slate-900 dark:text-white"
            : "font-semibold text-slate-500 dark:text-slate-400"
        )}
      >
        {score ?? "-"}
      </span>
    </div>
  );
}

export function MatchCard({ match }: { match: Match }) {
  const t = useT();
  const live = isLive(match.status);
  const finished = match.status === "FINISHED";
  const scheduled =
    match.status === "SCHEDULED" || match.status === "TIMED";

  const homeWin = match.score.winner === "HOME_TEAM";
  const awayWin = match.score.winner === "AWAY_TEAM";

  const stageLabel = STAGE_LABELS[match.stage];
  const isSpanish = t.nav.home === "Inicio";
  const stageName = stageLabel
    ? isSpanish
      ? stageLabel.es
      : stageLabel.en
    : match.stage;

  const groupLabel = match.group
    ? match.group.replace("GROUP_", `${isSpanish ? "Grupo" : "Group"} `)
    : null;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all",
        live
          ? "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20 shadow-sm"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {stageName}
          </span>
          {groupLabel && (
            <>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {groupLabel}
              </span>
            </>
          )}
        </div>

        {live && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase">
              {match.status === "PAUSED"
                ? isSpanish
                  ? "Entretiempo"
                  : "Half-time"
                : "EN VIVO"}
            </span>
          </div>
        )}

        {finished && (
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase">
            {isSpanish ? "Final" : "FT"}
          </span>
        )}

        {scheduled && (
          <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">
            {formatTime(match.utcDate)}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <TeamRow
          name={match.homeTeam.name}
          tla={match.homeTeam.tla}
          crest={match.homeTeam.crest}
          score={match.score.fullTime.home}
          isWinner={homeWin}
        />
        <TeamRow
          name={match.awayTeam.name}
          tla={match.awayTeam.tla}
          crest={match.awayTeam.crest}
          score={match.score.fullTime.away}
          isWinner={awayWin}
        />
      </div>
    </div>
  );
}
