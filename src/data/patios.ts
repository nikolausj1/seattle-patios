import patioData from "./patios.json";
import type { Patio } from "@/types";

// Patios hidden from the guide (unscored / TBD)
const HIDDEN_PATIO_IDS = [
  "aqua-verde",
  "fish-ladder",
  "next-level-lounge",
];

export function getPatios(): Patio[] {
  return (patioData as Patio[]).filter(
    (p) => !HIDDEN_PATIO_IDS.includes(p.id)
  );
}

export function getPatiosSortedByScore(): Patio[] {
  return getPatios().sort((a, b) => b.scores.total - a.scores.total);
}

export function getPatioById(id: string): Patio | undefined {
  return getPatios().find((p) => p.id === id);
}
