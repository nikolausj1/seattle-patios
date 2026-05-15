"use client";

import { useEffect, useMemo, useState } from "react";
import type { FilterKey } from "@/utils/filters";
import { FILTER_BY_KEY } from "@/utils/filters";

interface WeatherWidgetProps {
  active: ReadonlySet<FilterKey>;
  onApplyChips: (chips: FilterKey[]) => void;
  onClearChips: (chips: FilterKey[]) => void;
  /** Reports the current/next-2-hours weather condition flags so the parent
   * can re-order the filter chips (cold → Heated front, rainy → Covered
   * front). */
  onWeatherChange?: (state: { cold: boolean; rainy: boolean }) => void;
}

interface HourPoint {
  time: Date;
  temp: number;
  weatherCode: number;
  wind: number;
  precip: number;
}

interface Forecast {
  current: HourPoint;
  next4h: HourPoint[];
}

const SEATTLE = { lat: 47.6062, lng: -122.3321 };

// WMO weather interpretation codes — see https://open-meteo.com/en/docs
function isSunnyCode(c: number): boolean {
  return c <= 1; // clear or mainly clear
}
function isPrecipCode(c: number): boolean {
  return (
    (c >= 51 && c <= 67) ||
    (c >= 71 && c <= 77) ||
    (c >= 80 && c <= 86) ||
    c >= 95
  );
}

function weatherEmoji(c: number): string {
  if (c <= 1) return "☀️";
  if (c <= 3) return "⛅";
  if (c <= 48) return "🌫️";
  if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return "🌧️";
  if ((c >= 71 && c <= 77) || (c >= 85 && c <= 86)) return "❄️";
  if (c >= 95) return "⛈️";
  return "🌥️";
}

function recommendedChips(f: Forecast): FilterKey[] {
  const all = [f.current, ...f.next4h];
  const chips = new Set<FilterKey>();
  if (all.some((h) => h.precip > 0 || isPrecipCode(h.weatherCode))) {
    chips.add("covered");
  }
  if (all.some((h) => h.temp < 55)) {
    chips.add("heated");
  }
  if (all.some((h) => h.wind > 15)) {
    chips.add("covered"); // wind → seek shelter
  }
  const sunnyAndWarm = all.every(
    (h) => h.temp >= 65 && isSunnyCode(h.weatherCode)
  );
  if (sunnyAndWarm) {
    chips.add("rooftop");
    chips.add("greatViews");
  }
  return [...chips];
}

function patioWeatherSentence(f: Forecast): string {
  const c = f.current;
  if (isSunnyCode(c.weatherCode) && c.temp >= 70) {
    return "Perfect patio weather — go outside!";
  }
  if (isPrecipCode(c.weatherCode) || c.precip > 0) {
    return "Wet out — covered patios are your friend.";
  }
  if (c.temp < 55) {
    return "Chilly — find a heated spot.";
  }
  if (c.wind > 15) {
    return "Breezy — sheltered patios will be comfier.";
  }
  if (isSunnyCode(c.weatherCode)) {
    return "Mostly sunny — patio season is on.";
  }
  return "Mixed conditions — check the next few hours below.";
}

async function fetchForecast(): Promise<Forecast | null> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${SEATTLE.lat}&longitude=${SEATTLE.lng}` +
      `&current=temperature_2m,precipitation,weather_code,wind_speed_10m` +
      `&hourly=temperature_2m,precipitation,weather_code,wind_speed_10m` +
      `&temperature_unit=fahrenheit&wind_speed_unit=mph` +
      `&forecast_days=2&timezone=America/Los_Angeles`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      current: {
        temperature_2m: number;
        precipitation: number;
        weather_code: number;
        wind_speed_10m: number;
      };
      hourly: {
        time: string[];
        temperature_2m: number[];
        precipitation: number[];
        weather_code: number[];
        wind_speed_10m: number[];
      };
    };

    const now = Date.now();
    const startIdx = data.hourly.time.findIndex(
      (t) => new Date(t).getTime() > now
    );
    const idx = startIdx >= 0 ? startIdx : 0;
    const next4h: HourPoint[] = [];
    for (let i = 0; i < 4 && idx + i < data.hourly.time.length; i++) {
      next4h.push({
        time: new Date(data.hourly.time[idx + i]),
        temp: Math.round(data.hourly.temperature_2m[idx + i]),
        weatherCode: data.hourly.weather_code[idx + i],
        wind: Math.round(data.hourly.wind_speed_10m[idx + i]),
        precip: data.hourly.precipitation[idx + i],
      });
    }
    return {
      current: {
        time: new Date(),
        temp: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
        wind: Math.round(data.current.wind_speed_10m),
        precip: data.current.precipitation,
      },
      next4h,
    };
  } catch {
    return null;
  }
}

export default function WeatherWidget({
  active,
  onApplyChips,
  onClearChips,
  onWeatherChange,
}: WeatherWidgetProps) {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchForecast().then((f) => {
      if (!cancelled) {
        setForecast(f);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Report cold/rainy flags for the current hour + next 2 hours so the
  // parent can re-shuffle the filter chip order accordingly.
  useEffect(() => {
    if (!forecast || !onWeatherChange) return;
    const next2h = forecast.next4h.slice(0, 2);
    const window = [forecast.current, ...next2h];
    const cold = window.some((h) => h.temp < 55);
    const rainy = window.some(
      (h) => h.precip > 0 || isPrecipCode(h.weatherCode)
    );
    onWeatherChange({ cold, rainy });
  }, [forecast, onWeatherChange]);

  const chips = useMemo(
    () => (forecast ? recommendedChips(forecast) : []),
    [forecast]
  );
  const allOn = chips.length > 0 && chips.every((c) => active.has(c));

  if (loading) {
    return (
      <div className="rounded-xl bg-patio-pill-bg px-4 py-2.5 text-sm text-patio-navy/60">
        Loading weather…
      </div>
    );
  }
  if (!forecast) return null;

  const fmtHour = (d: Date) =>
    d
      .toLocaleTimeString("en-US", { hour: "numeric", hour12: true })
      .replace(":00 ", " ")
      .replace(" ", "");

  return (
    <div className="rounded-xl bg-white ring-1 ring-patio-sand/50 px-4 py-2.5">
      {/* Compact inline strip — sun dot, sentence, temp, forecast toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-patio-sun shrink-0" />
        <span className="text-sm font-semibold text-patio-navy">
          {patioWeatherSentence(forecast)}
        </span>
        <span className="text-xs text-patio-navy/65 tabular-nums">
          {forecast.current.temp}°F · {forecast.current.wind} mph wind
        </span>
        {chips.length > 0 && (
          <button
            type="button"
            onClick={() => (allOn ? onClearChips(chips) : onApplyChips(chips))}
            className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
              allOn
                ? "bg-patio-accent text-white"
                : "text-patio-accent hover:bg-patio-accent/10"
            }`}
          >
            {allOn ? "Weather filters on" : "Match today's weather"}
            <span className="text-[10px] opacity-90">
              {chips.map((k) => FILTER_BY_KEY[k].icon).join("")}
            </span>
          </button>
        )}
      </div>

      {/* Compact 4-hour forecast strip */}
      <div className="flex gap-2 mt-2.5">
        {forecast.next4h.map((h, i) => (
          <div
            key={i}
            className="flex-1 flex items-center gap-1.5 rounded-md bg-patio-sky/40 px-2 py-1"
          >
            <span className="text-[10px] text-patio-navy/55 uppercase tracking-wide tabular-nums">
              {fmtHour(h.time)}
            </span>
            <span className="text-sm leading-none">
              {weatherEmoji(h.weatherCode)}
            </span>
            <span className="text-xs font-semibold text-patio-navy tabular-nums ml-auto">
              {h.temp}°
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
