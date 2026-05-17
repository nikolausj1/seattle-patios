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

  // Mobile map heights: the visible map should fill 17vh (collapsed) or 55vh
  // (expanded) of the viewport, PLUS the safe-area-inset-top region behind the
  // iOS status bar — so the map extends edge-to-edge to the very top of the
  // physical screen, with the translucent status bar reading map colors through.
  // The negative top margin (below) pulls the map up by the same inset so it
  // still only consumes 17/55vh of the flex layout — the list sits right under it.
  const mobileMapHeight = isMapExpanded
    ? "h-[calc(55vh+env(safe-area-inset-top))]"
    : "h-[calc(17vh+env(safe-area-inset-top))]";

  return (
    <div className="md:max-w-7xl md:mx-auto md:px-4 md:mt-2">
      <div className="relative flex flex-col md:flex-row md:gap-4 h-[100lvh] md:h-[calc(100dvh-52px)]">
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

        {/* Map - top on mobile, right on desktop. On mobile, the negative
            top margin (= -safe-area-inset-top) pulls the map up so it extends
            edge-to-edge into the safe-area region behind the iOS status bar;
            the matching extra height on `mobileMapHeight` keeps the visible
            map at 17vh / 55vh of the post-status-bar viewport. */}
        <div
          className={`shrink-0 ${mobileMapHeight} md:h-full md:flex-1 md:mt-0 mt-[calc(-1*env(safe-area-inset-top))] order-1 md:order-2 relative z-10 transition-[height] duration-300 ease-in-out patio-card overflow-hidden`}
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
