"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import type { Patio } from "@/types";
import type { FilterKey } from "@/utils/filters";
import { FILTERS, FILTER_BY_KEY, getFilterOrder, groupIntoTiers } from "@/utils/filters";
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

  // Hero gate (mobile). The patio list / map should NOT scroll internally
  // until the hero has been scrolled off the viewport — the first touch
  // gestures must move the hero off the page, then the list becomes
  // interactive. `heroOffScreen` drives the list's overflow in PatioList.
  //
  // Hysteresis avoids the flip-flop that broke an earlier version of this
  // gate: flip to `true` only when the hero is ≤2% visible (fully gone),
  // back to `false` only when it is ≥98% visible (scrolled back to top).
  // In between, the value is held — so iOS URL-bar jitter while the user
  // is in the list can't spuriously re-lock it.
  const [heroOffScreen, setHeroOffScreen] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("[data-hero]");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const r = entry.intersectionRatio;
        if (r <= 0.02) setHeroOffScreen(true);
        else if (r >= 0.98) setHeroOffScreen(false);
        // else: hold current value (hysteresis band)
      },
      { threshold: [0, 0.02, 0.98, 1] }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // Current weather flags (current hour + next 2). Drives the filter chip
  // ordering: rainy → Covered to the front, cold → Heated to the front.
  const [weatherState, setWeatherState] = useState<{
    cold: boolean;
    rainy: boolean;
  }>({ cold: false, rainy: false });

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

  // Active filter labels in the order they appear in FILTERS (stable, predictable).
  const activeFilterLabels = useMemo(
    () =>
      FILTERS
        .filter((f) => activeFilters.has(f.key))
        .map((f) => FILTER_BY_KEY[f.key].label),
    [activeFilters]
  );

  // Filter chip order, weather-dependent.
  const orderedFilterKeys = useMemo(
    () => getFilterOrder(weatherState),
    [weatherState]
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
      onWeatherChange={setWeatherState}
    />
  );

  // FilterPills props are reused for the desktop sticky bar and the mobile
  // in-list bar; rendered twice so each can have its own positioning.
  const filterPillsEl = (
    <FilterPills
      orderedKeys={orderedFilterKeys}
      active={activeFilters}
      counts={counts}
      totalCount={patios.length}
      onToggle={toggleFilter}
      onClear={clearFilters}
    />
  );

  // Mobile-only filter bar — rendered as the sticky first child of the list
  // panel so it pins right under the map when the user scrolls the cards.
  // No padding/bg on the wrapper so cards scroll cleanly under the white
  // FilterPills bar with no blue strip in between.
  const mobileFilterBar = (
    <div className="md:hidden sticky top-0 z-30 -mx-4">
      {filterPillsEl}
    </div>
  );

  return (
    <UserLocationProvider>
      <div data-guide-anchor>
        {/* Desktop-only sticky filter bar — pins at the top of the viewport
            once the hero scrolls off. The wrapper has a tiny vertical breathing
            margin (initial only — sticky behavior makes it collapse to top:0
            when stuck), and no background so cards behind don't show through a
            blue strip — the FilterPills capsule itself has a white bg.
            On mobile the filters live inside the list panel (see
            `mobileFilterBar` below). */}
        <div className="hidden md:block sticky top-0 z-40 mt-3">
          {filterPillsEl}
        </div>

        <SplitView
          patios={patios}
          tiers={tiers}
          totalCount={patios.length}
          activeFilterLabels={activeFilterLabels}
          activePlaceId={activePlaceId}
          hoveredPlaceId={hoveredPlaceId}
          activatedByClick={activatedByClick.current}
          heroOffScreen={heroOffScreen}
          mobileFilterBar={mobileFilterBar}
          onSelectPlace={handleSelectPlace}
          onHoverPlace={setHoveredPlaceId}
          onTopVisibleChange={handleTopVisibleChange}
          controls={listControls}
        />
      </div>
    </UserLocationProvider>
  );
}
