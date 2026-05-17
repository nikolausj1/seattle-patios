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

  // Programmatic scroll-end snap. Mobile-only. iOS Safari's natural finger
  // swipes often leave the page at scrollY < hero height, so the bottom of
  // the hero peeks above the map even after the user has clearly committed
  // to the list view. After 220ms of no window-scroll, if the user is in the
  // "in between" zone (well past 0, but not yet at hero end), snap them to
  // whichever end they're closer to (with a bias toward snapping forward
  // into the map/list view).
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only on mobile — desktop layout has no hero-vs-split scroll issue.
    if (window.matchMedia("(min-width: 768px)").matches) return;

    let snapping = false;
    let pendingSnap: ReturnType<typeof setTimeout> | undefined;
    let scrollDebounce: ReturnType<typeof setTimeout> | undefined;

    const trySnap = () => {
      if (snapping) return;
      const hero = document.querySelector("section");
      if (!hero) return;
      const heroH = hero.offsetHeight;
      const y = window.scrollY;
      // Dead zones: <40px = let user stay on hero,
      // >heroH-10px = already past hero (don't disturb).
      if (y < 40 || y > heroH - 10) return;
      // Forward bias: past 30% of hero, commit to SplitView view.
      const target = y > heroH * 0.3 ? heroH : 0;
      snapping = true;
      window.scrollTo({ top: target, behavior: "smooth" });
      setTimeout(() => {
        snapping = false;
      }, 600);
    };

    // Poll until scrollY is stable for 2 consecutive 120ms ticks, then snap.
    // Triggered both by touchend (iOS, after momentum settles) and a generic
    // scroll-debounce fallback (desktop/programmatic scrolls).
    const waitForStillThenSnap = () => {
      if (pendingSnap) clearTimeout(pendingSnap);
      let lastY = window.scrollY;
      let stableTicks = 0;
      const tick = () => {
        const y = window.scrollY;
        if (y === lastY) {
          stableTicks++;
          if (stableTicks >= 2) {
            trySnap();
            return;
          }
        } else {
          stableTicks = 0;
          lastY = y;
        }
        pendingSnap = setTimeout(tick, 120);
      };
      pendingSnap = setTimeout(tick, 120);
    };

    const onTouchEnd = () => waitForStillThenSnap();
    const onScroll = () => {
      if (scrollDebounce) clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(waitForStillThenSnap, 240);
    };

    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("scroll", onScroll);
      if (pendingSnap) clearTimeout(pendingSnap);
      if (scrollDebounce) clearTimeout(scrollDebounce);
    };
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
