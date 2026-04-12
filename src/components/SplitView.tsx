"use client";

import { useState, useCallback } from "react";
import type { Patio } from "@/types";
import PatioList from "./PatioList";
import MapView from "./MapView";

interface SplitViewProps {
  patios: Patio[];
  activePlaceId: string | null;
  hoveredPlaceId: string | null;
  activatedByClick: boolean;
  onSelectPlace: (id: string) => void;
  onHoverPlace: (id: string | null) => void;
  onTopVisibleChange: (id: string | null) => void;
}

export default function SplitView({
  patios,
  activePlaceId,
  hoveredPlaceId,
  activatedByClick,
  onSelectPlace,
  onHoverPlace,
  onTopVisibleChange,
}: SplitViewProps) {
  const [listScrolled, setListScrolled] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const handleMapTapped = useCallback(() => {
    setIsMapExpanded(true);
  }, []);

  const handleListInteracted = useCallback(() => {
    if (isMapExpanded) setIsMapExpanded(false);
  }, [isMapExpanded]);

  // Mobile map height: 25vh collapsed, 55vh expanded. Desktop ignores this via md:h-full.
  const mobileMapHeight = isMapExpanded ? "h-[55vh]" : "h-[25vh]";

  return (
    <div className="flex flex-col md:flex-row h-[calc(100dvh-52px)] overflow-hidden">
      {/* Map - top on mobile, right on desktop */}
      <div
        className={`shrink-0 ${mobileMapHeight} md:h-full md:flex-1 order-1 md:order-2 relative z-10 transition-[height] duration-300 ease-in-out ${
          listScrolled ? "shadow-[0_1px_0_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.1)] md:shadow-none" : ""
        }`}
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
      <div className="min-h-0 flex-1 md:w-[560px] md:flex-none order-2 md:order-1 md:pl-6 border-r border-patio-sand/50 overflow-hidden">
        <PatioList
          patios={patios}
          activePlaceId={activePlaceId}
          hoveredPlaceId={hoveredPlaceId}
          activatedByClick={activatedByClick}
          onSelectPlace={onSelectPlace}
          onHoverPlace={onHoverPlace}
          onTopVisibleChange={onTopVisibleChange}
          onScrolled={setListScrolled}
          onListInteracted={handleListInteracted}
        />
      </div>
    </div>
  );
}
