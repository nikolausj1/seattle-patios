"use client";

import { forwardRef, useMemo } from "react";
import type { Patio, ScorePillar } from "@/types";
import { overallScore } from "@/types";
import { useUserLocation } from "@/context/UserLocationContext";
import { distanceMiles } from "@/utils/distance";
import {
  PILLAR_COLOR,
  PILLAR_LABEL,
  getTierHex,
} from "@/utils/scoring";
import { FILTERS } from "@/utils/filters";
import ImageCarousel from "./ImageCarousel";

interface PatioCardProps {
  patio: Patio;
  isSelected: boolean;
  isHovered: boolean;
  isTopRated?: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

const PatioCard = forwardRef<HTMLDivElement, PatioCardProps>(
  function PatioCard({ patio, isSelected, isHovered, isTopRated = false, onSelect, onHover }, ref) {
    const userLocation = useUserLocation();
    const distance = useMemo(() => {
      if (!userLocation) return null;
      const d = distanceMiles(
        userLocation[0], userLocation[1],
        patio.coordinates.lat, patio.coordinates.lng
      );
      return d < 10 ? d.toFixed(1) : Math.round(d).toString();
    }, [userLocation, patio.coordinates.lat, patio.coordinates.lng]);

    const overall = overallScore(patio.scores);

    const scorePillars: { key: ScorePillar; icon: string; score: number }[] = [
      { key: "sun",   icon: "☀️", score: patio.scores.sun },
      { key: "food",  icon: "🍽️", score: patio.scores.food },
      { key: "drink", icon: "🍷", score: patio.scores.drink },
      { key: "vibe",  icon: "🤙", score: patio.scores.vibe },
    ];

    // Filter labels this patio matches (used for the tag pill row beneath the name).
    const matchedFilterLabels = useMemo(() => {
      return FILTERS
        .filter((f) => f.predicate(patio))
        .map((f) => f.label);
    }, [patio]);

    return (
      <div
        ref={ref}
        data-place-id={patio.id}
        onClick={() => onSelect(patio.id)}
        onMouseEnter={() => onHover(patio.id)}
        onMouseLeave={() => onHover(null)}
        className={`cursor-pointer rounded-2xl overflow-hidden bg-white transition-all duration-200 ${
          isSelected
            ? "ring-2 ring-patio-accent shadow-lg"
            : isHovered
            ? "shadow-md"
            : "shadow-sm hover:shadow-md"
        }`}
      >
        {/* Image carousel with overall-score badge (tier-colored) */}
        <ImageCarousel
          images={patio.images}
          alt={patio.name}
          score={overall}
          scoreColor={getTierHex(overall)}
          subBadge={isTopRated ? "Top Rated" : undefined}
        />

        {/* Per-pillar score row */}
        <div className="px-4 pt-3 pb-2 flex gap-3">
          {scorePillars.map((p) => {
            const color = PILLAR_COLOR[p.key];
            return (
              <div key={p.key} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xl font-bold text-patio-navy tabular-nums leading-none">
                  {p.score}
                </span>
                <div
                  className="w-full h-[3px] rounded-full"
                  style={{ background: color }}
                />
                <div className="flex items-center gap-1">
                  <span className="text-[11px] leading-none" aria-hidden>
                    {p.icon}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide leading-none"
                    style={{ color }}
                  >
                    {PILLAR_LABEL[p.key]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="px-4 pt-3 pb-4">
          {/* Name */}
          <h3 className="text-lg font-bold text-patio-navy leading-snug">
            {patio.name}
          </h3>
          {/* Neighborhood · type, with distance on the right */}
          <div className="flex items-center justify-between gap-2 mt-0.5">
            <span className="text-xs text-patio-navy/55 truncate">
              {patio.neighborhood}
              {patio.patioType === "waterfront" && " · Waterfront"}
              {patio.patioType === "rooftop" && " · Rooftop"}
            </span>
            {distance && (
              <span className="text-xs text-patio-navy/55 whitespace-nowrap shrink-0">
                {distance} miles away
              </span>
            )}
          </div>

          {/* Matched filter pills row */}
          {matchedFilterLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {matchedFilterLabels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-patio-pill-bg text-patio-navy/75"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Come here for */}
          {patio.comeHereFor && (
            <div className="text-xs text-patio-navy/80 mt-2.5">
              <span className="font-semibold">Come here for:</span>{" "}
              <span>{patio.comeHereFor}</span>
            </div>
          )}

          <p className="text-sm text-patio-navy/75 leading-relaxed mt-2">
            {patio.description}
          </p>

          {/* Action links */}
          <div className="flex items-center gap-4 text-xs mt-3">
            {patio.yelpUrl && (
              <a
                href={patio.yelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-patio-navy/65 hover:text-patio-accent transition-colors"
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
                className="text-patio-navy/65 hover:text-patio-accent transition-colors"
              >
                Website
              </a>
            )}
            <a
              href={patio.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-patio-navy/65 hover:text-patio-accent transition-colors"
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
