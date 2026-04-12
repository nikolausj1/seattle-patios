"use client";

import { useState, useCallback, useRef } from "react";
import type { Patio } from "@/types";
import { UserLocationProvider } from "@/context/UserLocationContext";
import SplitView from "./SplitView";

interface InteractiveGuideProps {
  patios: Patio[];
}

export default function InteractiveGuide({ patios }: InteractiveGuideProps) {
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);

  // Track whether the last activation was from a click (to scroll list into view)
  const activatedByClick = useRef(false);

  // Click on a card or map pin — activate + scroll list to that card
  const handleSelectPlace = useCallback((id: string) => {
    activatedByClick.current = true;
    setActivePlaceId(id);
  }, []);

  // Scroll observer detects a new top card — activate it
  const handleTopVisibleChange = useCallback((id: string | null) => {
    activatedByClick.current = false;
    setActivePlaceId(id);
  }, []);

  return (
    <UserLocationProvider>
      <div data-guide-anchor>
        <SplitView
          patios={patios}
          activePlaceId={activePlaceId}
          hoveredPlaceId={hoveredPlaceId}
          activatedByClick={activatedByClick.current}
          onSelectPlace={handleSelectPlace}
          onHoverPlace={setHoveredPlaceId}
          onTopVisibleChange={handleTopVisibleChange}
        />
      </div>
    </UserLocationProvider>
  );
}
