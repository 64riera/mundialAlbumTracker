import { z } from "zod";

const FOOTBALL_API_BASE = "https://api.football-data.org/v4";
const COMPETITION_CODE = "WC";

const CACHE_TTL_LIVE = 60_000;
const CACHE_TTL_IDLE = 5 * 60_000;

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
  hasLive: boolean;
}

let matchesCache: CacheEntry<Match[]> | null = null;
let standingsCache: CacheEntry<GroupStanding[]> | null = null;

// --- Public types ---

export const MatchStatus = z.enum([
  "SCHEDULED",
  "TIMED",
  "IN_PLAY",
  "PAUSED",
  "FINISHED",
  "SUSPENDED",
  "POSTPONED",
  "CANCELLED",
  "AWARDED",
]);
export type MatchStatus = z.infer<typeof MatchStatus>;

export interface MatchTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface Match {
  id: number;
  utcDate: string;
  status: MatchStatus;
  matchday: number;
  stage: string;
  group: string | null;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  score: {
    winner: string | null;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
}

export interface GroupTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface GroupRow {
  position: number;
  team: GroupTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface GroupStanding {
  group: string;
  table: GroupRow[];
}

// --- Helpers ---

function getApiKey(): string {
  const key = process.env.FOOTBALL_API_KEY;
  if (!key) throw new Error("FOOTBALL_API_KEY not configured");
  return key;
}

function isCacheValid<T>(cache: CacheEntry<T> | null): cache is CacheEntry<T> {
  if (!cache) return false;
  const ttl = cache.hasLive ? CACHE_TTL_LIVE : CACHE_TTL_IDLE;
  return Date.now() - cache.fetchedAt < ttl;
}

function isLiveStatus(status: string): boolean {
  return status === "IN_PLAY" || status === "PAUSED";
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${FOOTBALL_API_BASE}${path}`, {
    headers: { "X-Auth-Token": getApiKey() },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Football API ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// --- Public API ---

export async function getMatches(): Promise<Match[]> {
  if (isCacheValid(matchesCache)) return matchesCache.data;

  const raw = await apiFetch<{ matches: Match[] }>(
    `/competitions/${COMPETITION_CODE}/matches`
  );

  const matches = raw.matches;
  const hasLive = matches.some((m) => isLiveStatus(m.status));

  matchesCache = { data: matches, fetchedAt: Date.now(), hasLive };
  return matches;
}

export async function getMatchesByDate(date: string): Promise<Match[]> {
  const all = await getMatches();
  return all.filter((m) => m.utcDate.startsWith(date));
}

export async function getTodayMatches(): Promise<Match[]> {
  const today = new Date().toISOString().slice(0, 10);
  return getMatchesByDate(today);
}

export async function getStandings(): Promise<GroupStanding[]> {
  if (isCacheValid(standingsCache)) return standingsCache.data;

  const raw = await apiFetch<{
    standings: Array<{ stage: string; type: string; group: string; table: GroupRow[] }>;
  }>(`/competitions/${COMPETITION_CODE}/standings`);

  const groupStandings = raw.standings
    .filter((s) => s.type === "TOTAL")
    .map(({ group, table }) => ({ group, table }));

  standingsCache = { data: groupStandings, fetchedAt: Date.now(), hasLive: false };
  return groupStandings;
}

export function hasLiveMatches(): boolean {
  return matchesCache?.hasLive ?? false;
}
