"use client";

import dynamic from "next/dynamic";
import type { Patio } from "@/types";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-patio-sand/50 flex items-center justify-center">
      <div className="text-patio-slate text-sm">Loading map...</div>
    </div>
  ),
});

interface MapViewProps {
  patios: Patio[];
  activePlaceId: string | null;
  hoveredPlaceId: string | null;
  onSelectPlace: (id: string) => void;
  onMapTapped?: () => void;
}

export default function MapView(props: MapViewProps) {
  return (
    <div className="h-full w-full rounded-b-lg md:rounded-lg overflow-hidden">
      <MapClient {...props} />
    </div>
  );
}
