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

  const mobileMapHeight = isMapExpanded ? "h-[55vh]" : "h-[17vh]";

  return (
    <div className="md:max-w-7xl md:mx-auto md:px-4 md:mt-2">
      <div className="relative flex flex-col md:flex-row md:gap-4 h-[100lvh] md:h-[calc(100dvh-52px)] overflow-hidden">
        {/* Sky band that sits behind iOS Safari's translucent URL bar so
            the bar's sides read sky color (eBay-style see-through) instead
            of white. The URL bar pill itself sits ~16–24pt above the
            safe-area, so the band has to be tall enough to actually cover
            it — safe-area inset alone is only ~34pt and sits below the pill.
            Gradient fades to transparent at the top so cards scrolling
            past it aren't abruptly clipped. Mobile only. */}
        <div
          className="md:hidden pointer-events-none absolute inset-x-0 bottom-0 z-20"
          style={{
            height: "calc(env(safe-area-inset-bottom, 0px) + 56px)",
            background:
              "linear-gradient(to top, var(--color-patio-sky) 0%, var(--color-patio-sky) 55%, rgba(221,238,245,0) 100%)",
          }}
          aria-hidden
        />

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
