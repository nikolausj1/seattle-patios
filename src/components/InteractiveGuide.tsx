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

  // Scroll-end snap (mobile only). iOS Safari finger swipes routinely stop
  // a little short of fully scrolling the hero off, leaving a sliver of the
  // hero peeking behind the translucent status bar above the map.
  //
  // Trigger: the native `scrollend` event, which fires exactly once when iOS
  // has finished ALL scrolling — momentum AND the URL-bar collapse animation.
  // (The previous implementation polled for scroll-stability, but the URL-bar
  // animation keeps emitting `scroll` events, so the poll never settled and
  // the snap never ran.) `touchend` + a short settle-poll is kept as a
  // fallback for engines without `scrollend`.
  //
  // Target: measured live from the SplitView's getBoundingClientRect — no
  // dependence on a computed hero height that can drift as dvh changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 768px)").matches) return;

    let snapping = false;
    let snapCooldown: ReturnType<typeof setTimeout> | undefined;

    const snapDecision = () => {
      if (snapping) return;
      const split = document.querySelector("[data-splitview]");
      const hero = document.querySelector("[data-hero]");
      if (!split || !hero) return;
      const heroH = (hero as HTMLElement).offsetHeight;
      // splitTop = distance from the viewport top to the SplitView's top edge.
      //   > 0  → SplitView is below the fold; the hero occupies the top
      //          `splitTop` px of the viewport (this is the peek).
      //   <= 0 → SplitView already owns the viewport top — no peek.
      const splitTop = split.getBoundingClientRect().top;
      if (splitTop <= 0 || splitTop >= heroH) return; // already a clean state

      // In between: snap to the nearer end. Forward bias — once the user is
      // more than ~45% into the hero, commit them to the map/list view.
      const forward = splitTop < heroH * 0.55;
      const delta = forward ? splitTop : splitTop - heroH; // px to scroll by
      if (Math.abs(delta) < 2) return;

      snapping = true;
      window.scrollBy({ top: delta, behavior: "smooth" });
      if (snapCooldown) clearTimeout(snapCooldown);
      snapCooldown = setTimeout(() => {
        snapping = false;
      }, 700);
    };

    const supportsScrollEnd = "onscrollend" in window;
    if (supportsScrollEnd) {
      window.addEventListener("scrollend", snapDecision, { passive: true });
    }

    // touchend fallback: after the finger lifts, momentum may continue, so
    // poll until scrollY has been still for two 130ms ticks, then decide.
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    const onTouchEnd = () => {
      if (settleTimer) clearTimeout(settleTimer);
      let lastY = window.scrollY;
      let still = 0;
      const poll = () => {
        const y = window.scrollY;
        if (y === lastY) {
          if (++still >= 2) {
            snapDecision();
            return;
          }
        } else {
          still = 0;
          lastY = y;
        }
        settleTimer = setTimeout(poll, 130);
      };
      settleTimer = setTimeout(poll, 130);
    };
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      if (supportsScrollEnd) {
        window.removeEventListener("scrollend", snapDecision);
      }
      window.removeEventListener("touchend", onTouchEnd);
      if (settleTimer) clearTimeout(settleTimer);
      if (snapCooldown) clearTimeout(snapCooldown);
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
