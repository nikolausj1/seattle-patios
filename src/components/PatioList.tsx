"use client";

import { useRef, useEffect, useCallback, type ReactNode } from "react";
import type { Patio } from "@/types";
import type { PatioTier } from "@/utils/filters";
import { tierLabel } from "@/utils/filters";
import PatioCard from "./PatioCard";

interface PatioListProps {
  tiers: PatioTier[];
  totalCount: number;
  patios: Patio[]; // flat list, used to register card refs in stable order
  activeFilterLabels: string[];
  heroOffScreen: boolean;
  activePlaceId: string | null;
  hoveredPlaceId: string | null;
  activatedByClick: boolean;
  onSelectPlace: (id: string) => void;
  onHoverPlace: (id: string | null) => void;
  onTopVisibleChange: (id: string | null) => void;
  onScrolled?: (isScrolled: boolean) => void;
  onListInteracted?: () => void;
  controls?: ReactNode;
  mobileFilterBar?: ReactNode;
}

function joinNatural(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return items.slice(0, -1).join(", ") + ", and " + items[items.length - 1];
}

export default function PatioList({
  tiers,
  totalCount,
  patios,
  activeFilterLabels,
  heroOffScreen,
  activePlaceId,
  hoveredPlaceId,
  activatedByClick,
  onSelectPlace,
  onHoverPlace,
  onTopVisibleChange,
  onScrolled,
  onListInteracted,
  controls,
  mobileFilterBar,
}: PatioListProps) {
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingProgrammatically = useRef(false);
  const hasUserScrolled = useRef(false);

  const setCardRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) cardRefs.current.set(id, el);
      else cardRefs.current.delete(id);
    },
    []
  );

  // Mobile: collapse the expanded map back to its baseline when the user
  // starts interacting with the list. Scroll-chaining handles hero exit
  // natively now (the list's overflow is gated by `heroOffScreen`).
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onListInteracted) return;

    function handleTouchStart() {
      onListInteracted!();
    }

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    return () => container.removeEventListener("touchstart", handleTouchStart);
  }, [onListInteracted]);

  // When the active filter set changes, jump the list scroll back to the top
  // so the user sees the first matching patio rather than mid-list cards from
  // the previous filter.
  const filterStateKey = activeFilterLabels.join("|");
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    isScrollingProgrammatically.current = true;
    container.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 600);
  }, [filterStateKey]);

  // Scroll list to card on click activation
  useEffect(() => {
    if (activePlaceId && activatedByClick) {
      const el = cardRefs.current.get(activePlaceId);
      if (el) {
        isScrollingProgrammatically.current = true;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => {
          isScrollingProgrammatically.current = false;
        }, 800);
      }
    }
  }, [activePlaceId, activatedByClick]);

  // Observer: Cards → update active place for map
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingProgrammatically.current) return;
        if (!hasUserScrolled.current) return;

        let topEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!topEntry || entry.boundingClientRect.top < topEntry.boundingClientRect.top) {
              topEntry = entry;
            }
          }
        }
        if (topEntry) {
          const id = (topEntry.target as HTMLElement).dataset.placeId;
          if (id) onTopVisibleChange(id);
        }
      },
      {
        root: container,
        rootMargin: "0px 0px -80% 0px",
        threshold: 0,
      }
    );

    for (const [, el] of cardRefs.current) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [patios, onTopVisibleChange]);

  const filtersActive = tiers.length > 0 && tiers[0].total > 0;
  const matchedCount = filtersActive
    ? tiers
        .filter((t) => t.matchCount === t.total)
        .reduce((sum, t) => sum + t.patios.length, 0)
    : totalCount;

  return (
    <div
      ref={containerRef}
      className={`h-full px-4 md:pt-4 space-y-4 overflow-x-hidden ${
        heroOffScreen
          ? "overflow-y-auto"
          : "overflow-y-hidden touch-pan-y"
      }`}
      onScroll={(e) => {
        const wasFirstScroll = !hasUserScrolled.current;
        hasUserScrolled.current = true;
        if (onScrolled) {
          onScrolled((e.target as HTMLElement).scrollTop > 0);
        }
        if (onListInteracted) onListInteracted();
        if (wasFirstScroll) {
          const container = containerRef.current;
          if (container) {
            let topCard: { id: string; top: number } | null = null;
            for (const [id, el] of cardRefs.current) {
              const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top;
              if (top >= 0 && (!topCard || top < topCard.top)) {
                topCard = { id, top };
              }
            }
            if (topCard) onTopVisibleChange(topCard.id);
          }
        }
      }}
    >
      {/* Mobile filter pill bar — sticky just below the map. Hidden on desktop;
          desktop's filter bar lives at the top of the viewport instead. */}
      {mobileFilterBar}

      {/* Mobile-only spacer that creates the blue gap between the sticky filter
          bar and the white list container below. Sticky filter (z-30) covers
          this spacer once the user starts scrolling, so the gap only shows at
          the very top of the list. Desktop has its own panel chrome — the
          spacer collapses there. */}
      <div className="h-1.5 md:hidden" />

      {/* White wrapper around the rest of the list content. On mobile this
          gives us a single white "sheet" that scrolls up under the sticky
          filter bar. On desktop the wrapper dissolves visually (no bg, no
          rounded corners, no negative margin) since the list panel itself is
          already a white card. */}
      <div className="bg-white rounded-t-2xl -mx-4 px-4 pt-4 min-h-full md:bg-transparent md:rounded-none md:mx-0 md:px-0 md:pt-0 md:min-h-0">
        {/* Weather widget (passed in by parent) */}
        {controls && <div className="mb-4 space-y-3">{controls}</div>}

        {/* Count */}
        {filtersActive && matchedCount === 0 ? (
          <div className="my-6 rounded-xl bg-patio-pill-bg/60 border border-dashed border-patio-sand/80 px-5 py-8 text-center">
            <div className="text-3xl mb-2" aria-hidden>
              🪑
            </div>
            <p className="text-base font-semibold text-patio-navy">
              No patios match all of those filters.
            </p>
            <p className="text-sm text-patio-navy/65 mt-1">
              Nothing is both{" "}
              <span className="font-medium">
                {joinNatural(activeFilterLabels.map((l) => l.toLowerCase()))}
              </span>
              . Try removing one to see closer matches below.
            </p>
          </div>
        ) : (
          <p className="text-sm text-patio-slate mb-4">
            {filtersActive
              ? `${matchedCount} ${matchedCount === 1 ? "patio that is" : "patios that are"} ${joinNatural(activeFilterLabels.map((l) => l.toLowerCase()))}`
              : `${totalCount} patios`}
          </p>
        )}

        {/* Tiered patio cards */}
        <div className="space-y-4">
          {tiers.map((tier, tierIdx) => (
            <div key={`tier-${tier.matchCount}-${tier.total}`} className="space-y-4">
              {/* Tier divider — only when filters are active and this isn't the first all-match tier */}
              {tier.total > 0 && !(tierIdx === 0 && tier.matchCount === tier.total) && (
                <div className="flex items-center gap-3 pt-2 pb-1">
                  <div className="h-px flex-1 bg-patio-sand/60" />
                  <span
                    className={`text-[11px] uppercase tracking-wider font-semibold ${
                      tier.matchCount === 0
                        ? "text-patio-slate/50"
                        : "text-patio-bark/70"
                    }`}
                  >
                    {tierLabel(tier)}
                  </span>
                  <div className="h-px flex-1 bg-patio-sand/60" />
                </div>
              )}

              {tier.patios.map((patio, patioIdx) => (
                <PatioCard
                  key={patio.id}
                  ref={setCardRef(patio.id)}
                  patio={patio}
                  isTopRated={tierIdx === 0 && patioIdx === 0}
                  isSelected={activePlaceId === patio.id}
                  isHovered={hoveredPlaceId === patio.id}
                  onSelect={onSelectPlace}
                  onHover={onHoverPlace}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Add a Patio CTA — moved here from the header */}
        <div className="pt-8 pb-4 text-center">
          <p className="text-sm text-patio-slate/80 mb-2">
            Don&rsquo;t see your favorite patio?
          </p>
          <a
            href="mailto:hello@seattlepatiovibes.com?subject=Add%20a%20patio"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-patio-accent border border-patio-accent/40 hover:bg-patio-accent hover:text-white transition-colors"
          >
            Add a patio →
          </a>
        </div>

        {/* Bottom padding — extends behind the iOS Safari URL bar / home
            indicator via safe-area-inset-bottom so the white sheet bleeds
            cleanly to the very edge of the screen. */}
        <div style={{ height: "calc(env(safe-area-inset-bottom, 0px) + 40px)" }} />
      </div>
    </div>
  );
}
