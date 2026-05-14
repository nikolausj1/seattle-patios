"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  score: number;
  scoreColor?: string;
  subBadge?: string;
}

export default function ImageCarousel({
  images,
  alt,
  score,
  scoreColor,
  subBadge,
}: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasMultiple = images.length > 1;

  // Track active slide via IntersectionObserver
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !hasMultiple) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(
              (entry.target as HTMLElement).dataset.slideIndex
            );
            if (!isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { root: container, threshold: 0.5 }
    );

    const slides = container.querySelectorAll("[data-slide-index]");
    slides.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [images, hasMultiple]);

  // Reset to first slide when images change
  useEffect(() => {
    setActiveIndex(0);
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [images]);

  const scrollToSlide = (i: number) => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTo({
        left: container.offsetWidth * i,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative h-80 overflow-hidden bg-patio-sand">
      {/* Scrollable image container */}
      <div
        ref={scrollRef}
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {images.map((src, i) => (
          <div
            key={src}
            data-slide-index={i}
            className="relative h-full w-full flex-shrink-0 snap-start"
          >
            <Image
              src={src}
              alt={`${alt} - photo ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 560px"
            />
          </div>
        ))}
      </div>

      {/* Score badge — overall score, color tiered, white ring like the map markers, optional sub-tag below */}
      <div className="absolute top-3 left-3 z-10 flex flex-col items-center gap-1">
        <div
          className="text-white min-w-[56px] h-14 px-3 rounded-full flex items-center justify-center text-xl font-bold ring-[3px] ring-white shadow-md"
          style={scoreColor ? { backgroundColor: scoreColor } : undefined}
        >
          {score}
        </div>
        {subBadge && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/70 text-white">
            {subBadge}
          </span>
        )}
      </div>

      {/* Arrow buttons */}
      {hasMultiple && (
        <>
          {activeIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                scrollToSlide(activeIndex - 1);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/35 flex items-center justify-center transition-colors"
              aria-label="Previous photo"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          {activeIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                scrollToSlide(activeIndex + 1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/20 hover:bg-black/35 flex items-center justify-center transition-colors"
              aria-label="Next photo"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </>
      )}

      {/* Dot indicators */}
      {hasMultiple && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                scrollToSlide(i);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                i === activeIndex ? "bg-white w-2.5" : "bg-white/50"
              }`}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
