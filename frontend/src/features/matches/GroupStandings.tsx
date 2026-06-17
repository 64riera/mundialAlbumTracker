import { useStandings } from "@/hooks/useMatches";
import { useT } from "@/lib/i18n";
import type { GroupStanding } from "@/types";

function GroupTable({ standing }: { standing: GroupStanding }) {
  const t = useT();
  const isSpanish = t.nav.home === "Inicio";
  const groupLabel = standing.group.replace(
    "GROUP_",
    `${isSpanish ? "Grupo" : "Group"} `
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
          {groupLabel}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">
              <th className="text-left pl-4 pr-2 py-2 font-semibold w-8">#</th>
              <th className="text-left px-2 py-2 font-semibold">
                {isSpanish ? "Equipo" : "Team"}
              </th>
              <th className="text-center px-1.5 py-2 font-semibold">PJ</th>
              <th className="text-center px-1.5 py-2 font-semibold">G</th>
              <th className="text-center px-1.5 py-2 font-semibold">E</th>
              <th className="text-center px-1.5 py-2 font-semibold">P</th>
              <th className="text-center px-1.5 py-2 font-semibold">GF</th>
              <th className="text-center px-1.5 py-2 font-semibold">GC</th>
              <th className="text-center px-1.5 py-2 font-semibold">DG</th>
              <th className="text-center pl-1.5 pr-4 py-2 font-semibold">
                {isSpanish ? "Pts" : "Pts"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {standing.table.map((row) => {
              const qualifies = row.position <= 2;
              return (
                <tr
                  key={row.team.id}
                  className={
                    qualifies
                      ? "bg-brand-50/50 dark:bg-brand-950/10"
                      : ""
                  }
                >
                  <td className="pl-4 pr-2 py-2 text-slate-400 dark:text-slate-500 font-medium">
                    {row.position}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={row.team.crest}
                        alt={row.team.tla}
                        className="w-5 h-3.5 object-contain rounded-sm"
                        loading="lazy"
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[100px] sm:max-w-none">
                        {row.team.shortName}
                      </span>
                    </div>
                  </td>
                  <td className="text-center px-1.5 py-2 text-slate-500 dark:text-slate-400">
                    {row.playedGames}
                  </td>
                  <td className="text-center px-1.5 py-2 text-slate-500 dark:text-slate-400">
                    {row.won}
                  </td>
                  <td className="text-center px-1.5 py-2 text-slate-500 dark:text-slate-400">
                    {row.draw}
                  </td>
                  <td className="text-center px-1.5 py-2 text-slate-500 dark:text-slate-400">
                    {row.lost}
                  </td>
                  <td className="text-center px-1.5 py-2 text-slate-500 dark:text-slate-400">
                    {row.goalsFor}
                  </td>
                  <td className="text-center px-1.5 py-2 text-slate-500 dark:text-slate-400">
                    {row.goalsAgainst}
                  </td>
                  <td className="text-center px-1.5 py-2 text-slate-500 dark:text-slate-400">
                    {row.goalDifference > 0
                      ? `+${row.goalDifference}`
                      : row.goalDifference}
                  </td>
                  <td className="text-center pl-1.5 pr-4 py-2 font-bold text-slate-700 dark:text-slate-200">
                    {row.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function GroupStandingsView() {
  const { data, isLoading } = useStandings();
  const t = useT();
  const isSpanish = t.nav.home === "Inicio";

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-52 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!data?.standings.length) {
    return (
      <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
        {isSpanish
          ? "Las tablas de posiciones no estan disponibles aun"
          : "Standings are not available yet"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.standings.map((standing) => (
        <GroupTable key={standing.group} standing={standing} />
      ))}
    </div>
  );
}
