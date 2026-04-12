"use client";

import { forwardRef, useMemo } from "react";
import type { Patio } from "@/types";
import { useUserLocation } from "@/context/UserLocationContext";
import { distanceMiles } from "@/utils/distance";
import { getBarColor, getBarPercent } from "@/utils/scoring";
import ImageCarousel from "./ImageCarousel";

interface PatioCardProps {
  patio: Patio;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

const patioTypeLabels: Record<string, string> = {
  streetside: "Streetside",
  rooftop: "Rooftop",
  waterfront: "Waterfront",
  courtyard: "Courtyard",
  deck: "Deck",
  garden: "Garden",
  "beer-garden": "Beer Garden",
};

const mealTypeLabels: Record<string, string> = {
  dinner: "Dinner",
  drinks: "Drinks",
  both: "Dinner & Drinks",
};

const PatioCard = forwardRef<HTMLDivElement, PatioCardProps>(
  function PatioCard({ patio, isSelected, isHovered, onSelect, onHover }, ref) {
    const userLocation = useUserLocation();
    const distance = useMemo(() => {
      if (!userLocation) return null;
      const d = distanceMiles(
        userLocation[0], userLocation[1],
        patio.coordinates.lat, patio.coordinates.lng
      );
      return d < 10 ? d.toFixed(1) : Math.round(d).toString();
    }, [userLocation, patio.coordinates.lat, patio.coordinates.lng]);

    const scoreCategories: { key: "sun" | "foodDrink" | "theSpace"; label: string; icon: string; score: number; max: number }[] = [
      { key: "sun", label: "Sun", icon: "☀️", score: patio.scores.sun, max: 33 },
      { key: "foodDrink", label: "Food & Drink", icon: "🍴", score: patio.scores.foodDrink, max: 33 },
      { key: "theSpace", label: "The Space", icon: "🪑", score: patio.scores.theSpace, max: 34 },
    ];

    return (
      <div
        ref={ref}
        data-place-id={patio.id}
        onClick={() => onSelect(patio.id)}
        onMouseEnter={() => onHover(patio.id)}
        onMouseLeave={() => onHover(null)}
        className={`cursor-pointer rounded-lg overflow-hidden bg-white transition-all duration-200 ${
          isSelected
            ? "ring-2 ring-patio-accent shadow-lg"
            : isHovered
            ? "shadow-md"
            : "shadow-sm hover:shadow-md"
        }`}
      >
        {/* Image carousel with score badge */}
        <ImageCarousel
          images={patio.images}
          alt={patio.name}
          score={patio.scores.total}
          isSelected={isSelected}
        />

        {/* Score strip */}
        <div className="px-4 pt-3 pb-2 space-y-1.5 border-b border-gray-100">
          {scoreCategories.map((cat) => (
            <div key={cat.key} className="flex items-center gap-2 text-xs">
              <span className="w-4 text-center flex-shrink-0">{cat.icon}</span>
              <span className="w-[80px] text-patio-slate flex-shrink-0">{cat.label}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getBarColor(cat.key)}`}
                  style={{ width: `${getBarPercent(cat.score, cat.max)}%` }}
                />
              </div>
              <span className="w-[40px] text-right text-patio-slate font-medium flex-shrink-0">
                {cat.score}/{cat.max}
              </span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h3 className="font-serif text-lg font-semibold text-patio-charcoal leading-snug">
              {patio.name}
            </h3>
            {distance && (
              <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0 flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {distance} mi away
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-patio-slate mb-2">
            <span>{patio.neighborhood}</span>
          </div>

          {/* Patio metadata tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-patio-cream text-patio-bark">
              {patioTypeLabels[patio.patioType]}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-patio-cream text-patio-bark">
              {mealTypeLabels[patio.mealType]}
            </span>
            {patio.heated && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700">
                Heated
              </span>
            )}
            {patio.covered && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                Covered
              </span>
            )}
          </div>

          {/* Come here for */}
          {patio.comeHereFor && (
            <div className="text-xs text-patio-bark mb-2">
              <span className="font-semibold">Come here for:</span>{" "}
              <span>{patio.comeHereFor}</span>
            </div>
          )}

          <p className="text-sm text-patio-charcoal/80 leading-relaxed mb-3">
            {patio.description}
          </p>

          {/* Action links */}
          <div className="flex items-center gap-4 text-xs">
            {patio.yelpUrl && (
              <a
                href={patio.yelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-patio-slate hover:text-patio-accent transition-colors"
              >
                Yelp
              </a>
            )}
            {patio.websiteUrl && (
              <a
                href={patio.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-patio-slate hover:text-patio-accent transition-colors"
              >
                Website
              </a>
            )}
            <a
              href={patio.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-patio-slate hover:text-patio-accent transition-colors"
            >
              Directions
            </a>
          </div>
        </div>
      </div>
    );
  }
);

export default PatioCard;
