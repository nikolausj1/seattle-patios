import type { Patio, ScorePillar } from "@/types";
import { overallScore } from "@/types";

export type ScoreTier = "top" | "great" | "good" | "fair";

export function getScoreTier(overall: number): ScoreTier {
  if (overall >= 90) return "top";
  if (overall >= 80) return "great";
  if (overall >= 70) return "good";
  return "fair";
}

// Tier color tokens — shared between the score circle on the card and the map pin.
// Hex values so they can be used by Leaflet (which doesn't read Tailwind classes).
export const TIER_HEX: Record<ScoreTier, string> = {
  top:   "#F2742A", // orange
  great: "#1EB99D", // teal-green
  good:  "#F4A66C", // soft amber
  fair:  "#9CA3AF", // gray
};

export function getTierHex(overall: number): string {
  return TIER_HEX[getScoreTier(overall)];
}

// Tailwind class helpers (kept for components that already use them)
export function getScoreColor(overall: number): string {
  if (overall >= 80) return "text-emerald-600";
  if (overall >= 60) return "text-amber-600";
  return "text-gray-500";
}

export function getScoreBgColor(overall: number): string {
  if (overall >= 80) return "bg-emerald-50 border-emerald-200";
  if (overall >= 60) return "bg-amber-50 border-amber-200";
  return "bg-gray-50 border-gray-200";
}

export function getFilledBlocks(score: number, max: number, total = 10): number {
  return Math.max(0, Math.min(total, Math.round((score / max) * total)));
}

export const PILLAR_COLOR: Record<ScorePillar, string> = {
  sun:   "#F2742A", // orange
  food:  "#2EB572", // green
  drink: "#E54B4B", // red
  vibe:  "#C13E8C", // magenta/pink
};

export const PILLAR_LABEL: Record<ScorePillar, string> = {
  sun:   "Sun",
  food:  "Food",
  drink: "Drink",
  vibe:  "Vibe",
};

export function getBlockColor(pillar: ScorePillar): string {
  return PILLAR_COLOR[pillar];
}

export function sortByScore(patios: Patio[]): Patio[] {
  return [...patios].sort(
    (a, b) => overallScore(b.scores) - overallScore(a.scores)
  );
}
