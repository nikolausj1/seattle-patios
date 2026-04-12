"use client";

import { useRef, useEffect, useCallback } from "react";
import type { Patio } from "@/types";
import PatioCard from "./PatioCard";

interface PatioListProps {
  patios: Patio[];
  activePlaceId: string | null;
  hoveredPlaceId: string | null;
  activatedByClick: boolean;
  onSelectPlace: (id: string) => void;
  onHoverPlace: (id: string | null) => void;
  onTopVisibleChange: (id: string | null) => void;
  onScrolled?: (isScrolled: boolean) => void;
  onListInteracted?: () => void;
}

export default function PatioList({
  patios,
  activePlaceId,
  hoveredPlaceId,
  activatedByClick,
  onSelectPlace,
  onHoverPlace,
  onTopVisibleChange,
  onScrolled,
  onListInteracted,
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

  // Desktop: forward wheel scroll to page when hero visible
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleWheel(e: WheelEvent) {
      const guide = document.querySelector("[data-guide-anchor]");
      if (!guide) return;
      const heroVisible = guide.getBoundingClientRect().top > 1;
      const atListTop = container!.scrollTop <= 0;
      const scrollingUp = e.deltaY < 0;

      if (heroVisible) {
        e.preventDefault();
        window.scrollBy({ top: e.deltaY });
      } else if (scrollingUp && atListTop) {
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
        // On first scroll, force the card observer to fire
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
      {/* Section header */}
      <div className="text-center pt-8 pb-2">
        <p className="text-[11px] text-[#b8a080] uppercase tracking-[2px] font-semibold mb-2">
          Seattle Patios
        </p>
        <div className="text-3xl mb-3">☀️</div>
        <h2 className="font-serif text-[26px] md:text-[28px] text-patio-bark font-bold leading-tight">
          The Best Patios in Seattle
        </h2>
      </div>

      {/* Editorial intro */}
      <div className="px-1 mb-20">
        <p className="text-[15px] text-patio-slate/80 leading-[1.75]">
          <span className="font-serif text-[36px] text-patio-bark float-left leading-[1] mr-1.5 mt-0.5">
            E
          </span>
          very patio is scored on three things: how much sun it gets, how
          good the food and drinks are, and how great the space itself feels.
          Sorted by total score, highest first.
        </p>
      </div>

      {/* Count */}
      <p className="text-sm text-patio-slate mb-4">
        {patios.length} patios
      </p>

      {/* Patio cards */}
      <div className="space-y-4">
        {patios.map((patio) => (
          <PatioCard
            key={patio.id}
            ref={setCardRef(patio.id)}
            patio={patio}
            isSelected={activePlaceId === patio.id}
            isHovered={hoveredPlaceId === patio.id}
            onSelect={onSelectPlace}
            onHover={onHoverPlace}
          />
        ))}
      </div>

      {/* Bottom padding */}
      <div className="pb-10" />
    </div>
  );
}
