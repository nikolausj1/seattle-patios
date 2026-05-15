import type { Patio } from "@/types";
import { overallScore } from "@/types";

export type FilterKey =
  | "waterfront"
  | "rooftop"
  | "dogFriendly"
  | "heated"
  | "covered"
  | "dinnerDrinks"
  | "greatViews";

export interface FilterDef {
  key: FilterKey;
  label: string;
  icon?: string;
  predicate: (p: Patio) => boolean;
}

// Heuristic helpers for fields not yet present on every patio record.
// TODO: backfill `dogFriendly` / `greatViews` booleans into patios.json and
// drop the description scan once data is populated.
function descMatches(p: Patio, re: RegExp): boolean {
  return re.test(p.description) || (p.comeHereFor ? re.test(p.comeHereFor) : false);
}

function isDogFriendly(p: Patio): boolean {
  if (typeof p.dogFriendly === "boolean") return p.dogFriendly;
  return descMatches(p, /\bdog(s|-friendly)?\b/i);
}

function hasGreatViews(p: Patio): boolean {
  if (typeof p.greatViews === "boolean") return p.greatViews;
  if (p.patioType === "waterfront" || p.patioType === "rooftop") return true;
  return descMatches(p, /\b(view|skyline|sunset|mountain|lake|sound)s?\b/i);
}

export const FILTERS: FilterDef[] = [
  { key: "waterfront",  label: "Waterfront",     icon: "🌊", predicate: (p) => p.patioType === "waterfront" },
  { key: "rooftop",     label: "Rooftop",        icon: "🏙️", predicate: (p) => p.patioType === "rooftop" },
  { key: "dogFriendly", label: "Dog Friendly",   icon: "🐶", predicate: isDogFriendly },
  { key: "heated",      label: "Heated",         icon: "🔥", predicate: (p) => p.heated === true },
  { key: "covered",     label: "Covered",        icon: "☂️", predicate: (p) => p.covered === true },
  { key: "dinnerDrinks",label: "Dinner & Drinks",icon: "🍽️", predicate: (p) => p.mealType === "both" },
  { key: "greatViews",  label: "Great Views",    icon: "🌅", predicate: hasGreatViews },
];

export const FILTER_BY_KEY: Record<FilterKey, FilterDef> = Object.fromEntries(
  FILTERS.map((f) => [f.key, f])
) as Record<FilterKey, FilterDef>;

export function countMatches(p: Patio, active: ReadonlySet<FilterKey>): number {
  let n = 0;
  for (const key of active) {
    if (FILTER_BY_KEY[key].predicate(p)) n++;
  }
  return n;
}

export interface PatioTier {
  matchCount: number;
  total: number; // number of active filters (so UI can render "n of total")
  patios: Patio[];
}

/**
 * Group patios into tiered sections by how many of the active filters they
 * match. Within each tier, patios are sorted by overall score (high → low).
 *
 * - No active filters: single tier containing all patios (matchCount = 0, total = 0).
 * - With N active filters: tiers from N down to 0 in descending order. Empty
 *   tiers are omitted.
 */
export function groupIntoTiers(
  patios: Patio[],
  active: ReadonlySet<FilterKey>
): PatioTier[] {
  const total = active.size;
  const byScore = [...patios].sort(
    (a, b) => overallScore(b.scores) - overallScore(a.scores)
  );

  if (total === 0) {
    return [{ matchCount: 0, total: 0, patios: byScore }];
  }

  const buckets: Patio[][] = Array.from({ length: total + 1 }, () => []);
  for (const p of byScore) {
    buckets[countMatches(p, active)].push(p);
  }

  const tiers: PatioTier[] = [];
  for (let k = total; k >= 0; k--) {
    if (buckets[k].length > 0) {
      tiers.push({ matchCount: k, total, patios: buckets[k] });
    }
  }
  return tiers;
}

export function tierLabel(tier: PatioTier): string {
  const { matchCount, total, patios } = tier;
  if (total === 0) return "";
  const n = patios.length;
  const noun = n === 1 ? "patio" : "patios";
  const verb = n === 1 ? "matches" : "match";
  if (matchCount === total) {
    return total === 1
      ? `${n} ${noun} ${verb} your filter`
      : `${n} ${noun} ${verb} all ${total} selected filters`;
  }
  if (matchCount === 0) {
    return `${n} ${noun} ${verb} none of the ${total} selected filters`;
  }
  return `${n} ${noun} ${verb} ${matchCount} of ${total} selected filters`;
}
