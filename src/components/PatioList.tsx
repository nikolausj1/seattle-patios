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
  activePlaceId: string | null;
  hoveredPlaceId: string | null;
  activatedByClick: boolean;
  onSelectPlace: (id: string) => void;
  onHoverPlace: (id: string | null) => void;
  onTopVisibleChange: (id: string | null) => void;
  onScrolled?: (isScrolled: boolean) => void;
  onListInteracted?: () => void;
  controls?: ReactNode;
}

export default function PatioList({
  tiers,
  totalCount,
  patios,
  activePlaceId,
  hoveredPlaceId,
  activatedByClick,
  onSelectPlace,
  onHoverPlace,
  onTopVisibleChange,
  onScrolled,
  onListInteracted,
  controls,
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

  // Desktop: forward wheel to page scroll when at top of list and hero still visible
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleWheel(e: WheelEvent) {
      const atListTop = container!.scrollTop <= 0;
      const scrollingUp = e.deltaY < 0;

      if (scrollingUp && atListTop) {
        e.preventDefault();
        window.scrollBy({ top: e.deltaY });
      } else {
        hasUserScrolled.current = true;
      }
    }

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // Mobile: auto-snap hero away on touch
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleTouchStart() {
      if (onListInteracted) onListInteracted();
      const guide = document.querySelector("[data-guide-anchor]");
      if (guide) {
        const rect = guide.getBoundingClientRect();
        if (rect.top > 1) {
          guide.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    return () => container.removeEventListener("touchstart", handleTouchStart);
  }, [onListInteracted]);

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
      className="h-full overflow-y-auto p-4 space-y-4"
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
      {/* Filter pills + weather widget (passed in by parent) */}
      {controls && <div className="pt-4 mb-4 space-y-3">{controls}</div>}

      {/* Count */}
      <p className="text-sm text-patio-slate mb-4">
        {filtersActive
          ? `${matchedCount} of ${totalCount} patios match`
          : `${totalCount} patios`}
      </p>

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

      {/* Bottom padding */}
      <div className="pb-10" />
    </div>
  );
}
