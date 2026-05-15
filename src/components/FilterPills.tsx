"use client";

import type { FilterKey } from "@/utils/filters";
import { FILTERS } from "@/utils/filters";

interface FilterPillsProps {
  active: ReadonlySet<FilterKey>;
  counts: Record<FilterKey, number>;
  totalCount: number;
  onToggle: (key: FilterKey) => void;
  onClear: () => void;
}

// Monochrome line icons for each filter chip — color is inherited via currentColor.
function FilterIcon({ name }: { name: FilterKey }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "waterfront":
      return (
        <svg {...common}>
          <path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
          <path d="M2 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
          <path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
        </svg>
      );
    case "rooftop":
      return (
        <svg {...common}>
          <path d="M3 21V8l5-4 5 4v13" />
          <path d="M13 21V12h7v9" />
          <path d="M3 21h18" />
          <path d="M16 16h0.01" />
          <path d="M16 19h0.01" />
        </svg>
      );
    case "dogFriendly":
      return (
        <svg {...common}>
          <circle cx="7"  cy="9"  r="1.5" />
          <circle cx="17" cy="9"  r="1.5" />
          <circle cx="5"  cy="14" r="1.5" />
          <circle cx="19" cy="14" r="1.5" />
          <path d="M9 18c0-2 1-3 3-3s3 1 3 3-1 3-3 3-3-1-3-3z" />
        </svg>
      );
    case "heated":
      return (
        <svg {...common}>
          <path d="M12 3s4 4 4 8a4 4 0 1 1-8 0c0-2 1-3 2-4 .5 1 1 1.5 2 1 0-2 0-3 0-5z" />
        </svg>
      );
    case "covered":
      return (
        <svg {...common}>
          <path d="M12 3v2" />
          <path d="M3 12a9 9 0 0 1 18 0H3z" />
          <path d="M12 12v7a2 2 0 0 0 4 0" />
        </svg>
      );
    case "dinnerDrinks":
      return (
        <svg {...common}>
          <path d="M8 3v8a2 2 0 1 1-4 0V3" />
          <path d="M6 11v10" />
          <path d="M17 3c-1 4-1 6 0 8v10" />
          <path d="M17 3c1 4 1 6 0 8" />
        </svg>
      );
    case "greatViews":
      return (
        <svg {...common}>
          <path d="M3 19l5-8 4 6 3-4 6 6H3z" />
          <circle cx="17" cy="6" r="1.5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function FilterPills({
  active,
  counts,
  totalCount,
  onToggle,
  onClear,
}: FilterPillsProps) {
  const anyActive = active.size > 0;

  return (
    <div className="w-full md:max-w-7xl md:mx-auto md:px-4">
      <div
        className="flex items-center overflow-x-auto scrollbar-hide bg-white md:rounded-full px-2 py-1.5 shadow-[0_8px_16px_-4px_rgba(28,35,52,0.18),0_2px_4px_-1px_rgba(28,35,52,0.08)]"
      >
        {/* All Patios button — left-most, selected styling when no filters active */}
        <button
          type="button"
          onClick={onClear}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            !anyActive
              ? "bg-emerald-600 text-white"
              : "bg-transparent text-patio-navy hover:bg-patio-pill-bg"
          }`}
        >
          All Patios
          <span
            className={`text-[11px] tabular-nums px-1.5 py-0.5 rounded-full ${
              !anyActive
                ? "bg-white/25 text-white"
                : "bg-patio-pill-bg text-patio-navy/70"
            }`}
          >
            {totalCount}
          </span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-patio-sky shrink-0 mx-1.5" />

        {FILTERS.map((f, idx) => {
          const isOn = active.has(f.key);
          return (
            <span key={f.key} className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => onToggle(f.key)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isOn
                    ? "bg-patio-accent text-white"
                    : "text-patio-navy/85 hover:bg-patio-pill-bg"
                }`}
                aria-pressed={isOn}
              >
                <FilterIcon name={f.key} />
                {f.label}
                <span
                  className={`text-[11px] tabular-nums px-1.5 py-0.5 rounded-full ${
                    isOn
                      ? "bg-white/25 text-white"
                      : "bg-patio-pill-bg text-patio-navy/60"
                  }`}
                >
                  {counts[f.key]}
                </span>
              </button>
              {idx < FILTERS.length - 1 && (
                <div className="h-6 w-px bg-patio-sky shrink-0" />
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
