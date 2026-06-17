export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export type SectionType = "INTRO" | "TEAM" | "SPECIAL";
export type StickerType = "PLAYER" | "BADGE" | "STADIUM" | "GROUP" | "SPECIAL" | "INTRO";

export interface SectionSummary {
  id: string;
  code: string;
  name: string;
  type: SectionType;
  flagEmoji: string | null;
  confederation: string | null;
  order: number;
  total: number;
  owned: number;
  percentage: number;
}

export interface StickerSummary {
  id: string;
  number: number;
  code: string;
  name: string;
  type: StickerType;
  isShiny: boolean;
  quantity: number;
  section?: {
    code: string;
    name: string;
    flagEmoji: string | null;
  };
}

export interface SectionDetail extends SectionSummary {
  stickers: StickerSummary[];
}

export interface OverviewStats {
  total: number;
  owned: number;
  duplicate: number;
  missing: number;
  percentage: number;
}

export interface CompareSticker {
  code: string;
  name: string;
  number: number;
  myQty: number;
  section: { code: string; name: string; flagEmoji: string | null };
}

export interface CompareResult {
  summary: {
    iCanGive: number;
    theyCanGive: number;
    perfectTrades: number;
    bothHave: number;
    bothNeed: number;
  };
  iCanGive: CompareSticker[];
  theyCanGive: CompareSticker[];
  perfectTrades: { mine: CompareSticker; theirs: CompareSticker }[];
  bothHave: CompareSticker[];
  bothNeed: CompareSticker[];
}

// --- Matches ---

export interface MatchTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "SUSPENDED"
  | "POSTPONED"
  | "CANCELLED"
  | "AWARDED";

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

export interface GroupRow {
  position: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    tla: string;
    crest: string;
  };
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

export interface MatchesResponse {
  matches: Match[];
  hasLive: boolean;
}

export interface StandingsResponse {
  standings: GroupStanding[];
}

// --- Stats ---

export interface SectionStats {
  code: string;
  name: string;
  flagEmoji: string | null;
  confederation: string | null;
  type: SectionType;
  total: number;
  owned: number;
  percentage: number;
}
