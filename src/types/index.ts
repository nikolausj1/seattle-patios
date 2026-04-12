export interface PatioScores {
  sun: number;        // out of 33
  foodDrink: number;  // out of 33
  theSpace: number;   // out of 34
  total: number;      // out of 100 (sum of above)
}

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
  yelpUrl?: string;
  websiteUrl?: string;
  googleMapsUrl: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}
