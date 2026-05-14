export interface PatioScores {
  sun: number;   // out of 100
  food: number;  // out of 100
  drink: number; // out of 100
  vibe: number;  // out of 100
}

export function overallScore(scores: PatioScores): number {
  return Math.round((scores.sun + scores.food + scores.drink + scores.vibe) / 4);
}

export type ScorePillar = "sun" | "food" | "drink" | "vibe";

export type PatioType =
  | "streetside"
  | "rooftop"
  | "waterfront"
  | "courtyard"
  | "deck"
  | "garden"
  | "beer-garden";

export type MealType = "dinner" | "drinks" | "both";

export interface Patio {
  id: string;
  name: string;
  neighborhood: string;
  description: string;
  comeHereFor?: string;
  images: string[];
  scores: PatioScores;
  patioType: PatioType;
  sunDetails: string;
  mealType: MealType;
  heated: boolean;
  covered: boolean;
  sheltered?: boolean;
  dogFriendly?: boolean;
  greatViews?: boolean;
  yelpUrl?: string;
  websiteUrl?: string;
  googleMapsUrl: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}
