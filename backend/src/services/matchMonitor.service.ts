import { getMatches, type Match } from "./matches.service";
import {
  broadcastMatchStart,
  broadcastGoal,
  isWebPushConfigured,
} from "./notification.service";
import { env } from "../lib/env";

interface MatchSnapshot {
  status: string;
  homeScore: number | null;
  awayScore: number | null;
}

const previousStates = new Map<number, MatchSnapshot>();
let intervalId: NodeJS.Timeout | null = null;

const POLL_INTERVAL = 60_000;

function snapshot(match: Match): MatchSnapshot {
  return {
    status: match.status,
    homeScore: match.score.fullTime.home,
    awayScore: match.score.fullTime.away,
  };
}

function isScheduled(status: string): boolean {
  return status === "SCHEDULED" || status === "TIMED";
}

async function checkForEvents(): Promise<void> {
  if (!isWebPushConfigured() || !env.FOOTBALL_API_KEY) return;

  try {
    const matches = await getMatches();

    for (const match of matches) {
      const prev = previousStates.get(match.id);
      const curr = snapshot(match);

      if (prev) {
        if (isScheduled(prev.status) && curr.status === "IN_PLAY") {
          broadcastMatchStart(match).catch(console.error);
        }

        const prevTotal = (prev.homeScore ?? 0) + (prev.awayScore ?? 0);
        const currTotal = (curr.homeScore ?? 0) + (curr.awayScore ?? 0);
        if (currTotal > prevTotal && !isScheduled(curr.status)) {
          broadcastGoal(match).catch(console.error);
        }
      }

      previousStates.set(match.id, curr);
    }
  } catch (err) {
    console.error("Match monitor poll error:", err);
  }
}

export function startMatchMonitor(): void {
  if (intervalId) return;
  if (!env.FOOTBALL_API_KEY) {
    console.warn("FOOTBALL_API_KEY not set — match monitor disabled");
    return;
  }

  getMatches()
    .then((matches) => {
      for (const m of matches) previousStates.set(m.id, snapshot(m));
      console.log(`Match monitor seeded with ${matches.length} matches`);
    })
    .catch((err) => console.error("Match monitor seed error:", err));

  intervalId = setInterval(checkForEvents, POLL_INTERVAL);
  console.log("Match monitor started (60s interval)");
}

export function stopMatchMonitor(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
