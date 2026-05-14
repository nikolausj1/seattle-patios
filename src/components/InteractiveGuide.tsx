"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import type { Patio } from "@/types";
import type { FilterKey } from "@/utils/filters";
import { FILTERS, groupIntoTiers } from "@/utils/filters";
import { UserLocationProvider } from "@/context/UserLocationContext";
import FilterPills from "./FilterPills";
import WeatherWidget from "./WeatherWidget";
import SplitView from "./SplitView";

interface InteractiveGuideProps {
  patios: Patio[];
}

export default function InteractiveGuide({ patios }: InteractiveGuideProps) {
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(
    () => new Set()
  );

  const activatedByClick = useRef(false);

  const handleSelectPlace = useCallback((id: string) => {
    activatedByClick.current = true;
    setActivePlaceId(id);
  }, []);

  const handleTopVisibleChange = useCallback((id: string | null) => {
    activatedByClick.current = false;
    setActivePlaceId(id);
  }, []);

  const toggleFilter = useCallback((key: FilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters(new Set());
  }, []);

  const applyChips = useCallback((chips: FilterKey[]) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      for (const c of chips) next.add(c);
      return next;
    });
  }, []);

  const removeChips = useCallback((chips: FilterKey[]) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      for (const c of chips) next.delete(c);
      return next;
    });
  }, []);

  const tiers = useMemo(
    () => groupIntoTiers(patios, activeFilters),
    [patios, activeFilters]
  );

  const counts = useMemo(() => {
    const out = {} as Record<FilterKey, number>;
    for (const f of FILTERS) {
      out[f.key] = patios.filter((p) => f.predicate(p)).length;
    }
    return out;
  }, [patios]);

  const listControls = (
    <WeatherWidget
      active={activeFilters}
      onApplyChips={applyChips}
      onClearChips={removeChips}
    />
  );

  return (
    <UserLocationProvider>
      <div data-guide-anchor>
        {/* Full-width filter pill bar (matches refresh01.png) */}
        <div className="-mt-6 mb-3 relative z-20">
          <FilterPills
            active={activeFilters}
            counts={counts}
            totalCount={patios.length}
            onToggle={toggleFilter}
            onClear={clearFilters}
          />
        </div>

        <SplitView
          patios={patios}
          tiers={tiers}
          totalCount={patios.length}
          activePlaceId={activePlaceId}
          hoveredPlaceId={hoveredPlaceId}
          activatedByClick={activatedByClick.current}
          onSelectPlace={handleSelectPlace}
          onHoverPlace={setHoveredPlaceId}
          onTopVisibleChange={handleTopVisibleChange}
          controls={listControls}
        />
      </div>
    </UserLocationProvider>
  );
}
