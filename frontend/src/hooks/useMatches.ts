import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MatchesResponse, StandingsResponse } from "@/types";

const LIVE_INTERVAL = 60_000;
const IDLE_INTERVAL = 5 * 60_000;

export function useAllMatches() {
  return useQuery<MatchesResponse>({
    queryKey: ["matches"],
    queryFn: () => api.get("/api/matches").then((r) => r.data),
    refetchInterval: (query) => {
      const hasLive = query.state.data?.hasLive;
      return hasLive ? LIVE_INTERVAL : IDLE_INTERVAL;
    },
  });
}

export function useTodayMatches() {
  return useQuery<MatchesResponse>({
    queryKey: ["matches", "today"],
    queryFn: () => api.get("/api/matches/today").then((r) => r.data),
    refetchInterval: (query) => {
      const hasLive = query.state.data?.hasLive;
      return hasLive ? LIVE_INTERVAL : IDLE_INTERVAL;
    },
  });
}

export function useStandings() {
  return useQuery<StandingsResponse>({
    queryKey: ["matches", "standings"],
    queryFn: () => api.get("/api/matches/standings").then((r) => r.data),
    refetchInterval: IDLE_INTERVAL,
  });
}
