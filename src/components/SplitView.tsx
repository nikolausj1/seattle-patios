"use client";

import { useState, useCallback, type ReactNode } from "react";
import type { Patio } from "@/types";
import type { PatioTier } from "@/utils/filters";
import PatioList from "./PatioList";
import MapView from "./MapView";

interface SplitViewProps {
  patios: Patio[];
  tiers: PatioTier[];
  totalCount: number;
  activePlaceId: string | null;
  hoveredPlaceId: string | null;
  activatedByClick: boolean;
  onSelectPlace: (id: string) => void;
  onHoverPlace: (id: string | null) => void;
  onTopVisibleChange: (id: string | null) => void;
  controls?: ReactNode;
}

export default function SplitView({
  patios,
  tiers,
  totalCount,
  activePlaceId,
  hoveredPlaceId,
  activatedByClick,
  onSelectPlace,
  onHoverPlace,
  onTopVisibleChange,
  controls,
}: SplitViewProps) {
  const [, setListScrolled] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const handleMapTapped = useCallback(() => {
    setIsMapExpanded(true);
  }, []);

  const handleListInteracted = useCallback(() => {
    if (isMapExpanded) setIsMapExpanded(false);
  }, [isMapExpanded]);

  const mobileMapHeight = isMapExpanded ? "h-[55vh]" : "h-[25vh]";

  return (
    <div className="max-w-7xl mx-auto px-4 pb-8">
      <div className="flex flex-col md:flex-row gap-4 h-[calc(100dvh-80px)] md:h-[calc(100dvh-120px)] overflow-hidden">
        {/* Map - top on mobile, right on desktop */}
        <div
          className={`shrink-0 ${mobileMapHeight} md:h-full md:flex-1 order-1 md:order-2 relative z-10 transition-[height] duration-300 ease-in-out patio-card overflow-hidden`}
        >
          <MapView
            patios={patios}
            activePlaceId={activePlaceId}
            hoveredPlaceId={hoveredPlaceId}
            onSelectPlace={onSelectPlace}
            onMapTapped={handleMapTapped}
          />
        </div>

        {/* List - bottom on mobile, left on desktop */}
        <div className="min-h-0 flex-1 md:w-[560px] md:flex-none order-2 md:order-1 patio-card overflow-hidden">
          <PatioList
            tiers={tiers}
            totalCount={totalCount}
            patios={patios}
            activePlaceId={activePlaceId}
            hoveredPlaceId={hoveredPlaceId}
            activatedByClick={activatedByClick}
            onSelectPlace={onSelectPlace}
            onHoverPlace={onHoverPlace}
            onTopVisibleChange={onTopVisibleChange}
            onScrolled={setListScrolled}
            onListInteracted={handleListInteracted}
            controls={controls}
          />
        </div>
      </div>
    </div>
  );
}
