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

export function getFilledBlocks(score: number, max: number, total = 10): number {
  return Math.max(0, Math.min(total, Math.round((score / max) * total)));
}

export function getBlockColor(category: "sun" | "foodDrink" | "theSpace"): string {
  switch (category) {
    case "sun": return "#F4A66C";
    case "foodDrink": return "#1EB99D";
    case "theSpace": return "#F4726C";
  }
}

export function sortByScore(patios: Patio[]): Patio[] {
  return [...patios].sort((a, b) => b.scores.total - a.scores.total);
}
