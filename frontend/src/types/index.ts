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
