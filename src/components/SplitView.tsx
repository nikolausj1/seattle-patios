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
  activeFilterLabels: string[];
  activePlaceId: string | null;
  hoveredPlaceId: string | null;
  activatedByClick: boolean;
  heroOffScreen: boolean;
  onSelectPlace: (id: string) => void;
  onHoverPlace: (id: string | null) => void;
  onTopVisibleChange: (id: string | null) => void;
  controls?: ReactNode;
  mobileFilterBar?: ReactNode;
}

export default function SplitView({
  patios,
  tiers,
  totalCount,
  activeFilterLabels,
  activePlaceId,
  hoveredPlaceId,
  activatedByClick,
  heroOffScreen,
  onSelectPlace,
  onHoverPlace,
  onTopVisibleChange,
  controls,
  mobileFilterBar,
}: SplitViewProps) {
  const [, setListScrolled] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const handleMapTapped = useCallback(() => {
    setIsMapExpanded(true);
  }, []);

  const handleListInteracted = useCallback(() => {
    if (isMapExpanded) setIsMapExpanded(false);
  }, [isMapExpanded]);

  // Mobile collapsed/expanded map heights.
  const mobileMapHeight = isMapExpanded ? "h-[55vh]" : "h-[17vh]";

  return (
    <div className="md:max-w-7xl md:mx-auto md:px-4 md:mt-2">
      <div className="relative flex flex-col md:flex-row md:gap-4 h-[100dvh] md:h-[calc(100dvh-52px)]">
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
            activeFilterLabels={activeFilterLabels}
            heroOffScreen={heroOffScreen}
            mobileFilterBar={mobileFilterBar}
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
