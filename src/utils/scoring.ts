import type { Patio } from "@/types";

export function getScoreColor(total: number): string {
  if (total >= 80) return "text-emerald-600";
  if (total >= 60) return "text-amber-600";
  return "text-gray-500";
}

export function getScoreBgColor(total: number): string {
  if (total >= 80) return "bg-emerald-50 border-emerald-200";
  if (total >= 60) return "bg-amber-50 border-amber-200";
  return "bg-gray-50 border-gray-200";
}

export function getScoreBadgeBg(total: number): string {
  if (total >= 80) return "bg-emerald-600";
  if (total >= 60) return "bg-amber-500";
  return "bg-gray-500";
}

export function getBarColor(category: "sun" | "foodDrink" | "theSpace"): string {
  switch (category) {
    case "sun": return "bg-amber-400";
    case "foodDrink": return "bg-rose-700";
    case "theSpace": return "bg-teal-600";
  }
}

export function getBarPercent(score: number, max: number): number {
  return Math.round((score / max) * 100);
}

export function sortByScore(patios: Patio[]): Patio[] {
  return [...patios].sort((a, b) => b.scores.total - a.scores.total);
}
