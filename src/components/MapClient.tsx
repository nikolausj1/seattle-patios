"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Patio } from "@/types";
import { useUserLocation } from "@/context/UserLocationContext";

interface MapClientProps {
  patios: Patio[];
  activePlaceId: string | null;
  hoveredPlaceId: string | null;
  onSelectPlace: (id: string) => void;
  onMapTapped?: () => void;
}

const SEATTLE_CENTER: [number, number] = [47.645, -122.335];
const DEFAULT_ZOOM = 12;

function getScorePinColor(total: number): string {
  if (total >= 80) return "#059669"; // emerald-600
  if (total >= 60) return "#d97706"; // amber-600
  return "#6b7280"; // gray-500
}

function createMarkerIcon(
  isActive: boolean,
  isHovered: boolean,
  score: number,
  name?: string,
  neighborhood?: string,
) {
  if (isActive && name) {
    const color = getScorePinColor(score);
    const html = `<div style="display:flex;flex-direction:column;align-items:center;font-family:system-ui,sans-serif;">
      <div style="
        background:white;border-radius:12px;padding:10px 16px;
        box-shadow:0 4px 20px rgba(0,0,0,0.16);text-align:left;
        min-width:160px;max-width:220px;border:1px solid rgba(0,0,0,0.04);
        white-space:nowrap;
      ">
        <div style="font-size:14px;font-weight:700;color:#7c2d12;overflow:hidden;text-overflow:ellipsis;">${name}</div>
        <div style="font-size:11px;color:#999;margin-top:2px;">${neighborhood} · ${score}/100</div>
      </div>
      <div style="width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid white;filter:drop-shadow(0 2px 2px rgba(0,0,0,0.06));"></div>
      <div style="
        width:34px;height:34px;background:${color};border-radius:50%;
        border:3px solid white;color:white;font-size:12px;font-weight:700;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 0 0 3px ${color}40,0 2px 8px rgba(0,0,0,0.3);
        margin-top:4px;
      ">${score}</div>
    </div>`;

    return L.divIcon({
      className: "",
      html,
      iconSize: [220, 120],
      iconAnchor: [110, 120],
    });
  }

  const size = isHovered ? 28 : 24;
  const color = isHovered ? getScorePinColor(score) : "#4A5568";
  const border = isHovered
    ? "2px solid white"
    : "2px solid rgba(255,255,255,0.8)";
  const shadow = "0 2px 6px rgba(0,0,0,0.3)";
  const fontSize = 10;

  return L.divIcon({
    className: "",
    html: `<div class="patio-marker" style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      border: ${border};
      box-shadow: ${shadow};
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: ${fontSize}px;
      font-weight: 700;
      font-family: system-ui, sans-serif;
    ">${score}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function UserLocationMarker() {
  const userLocation = useUserLocation();

  if (!userLocation) return null;

  const icon = L.divIcon({
    className: "",
    html: `<div style="
      width:14px;height:14px;background:#4285F4;border-radius:50%;
      border:3px solid white;
      box-shadow:0 0 0 2px rgba(66,133,244,0.3),0 0 8px rgba(66,133,244,0.4);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

  return <Marker position={userLocation} icon={icon} interactive={false} zIndexOffset={-100} />;
}

function MapController({
  activePlace,
  patios,
  onMapTapped,
}: {
  activePlace: Patio | null;
  patios: Patio[];
  onMapTapped?: () => void;
}) {
  const map = useMap();
  const isInitialMount = useRef(true);

  // Fit to all patio bounds on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (patios.length > 0) {
        const bounds = L.latLngBounds(
          patios.map((p) => [p.coordinates.lat, p.coordinates.lng])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [patios, map]);

  // Fly to active place
  useEffect(() => {
    if (activePlace) {
      const targetZoom = 14;
      const targetPoint = map.project(
        [activePlace.coordinates.lat, activePlace.coordinates.lng],
        targetZoom
      );
      targetPoint.y -= 70;
      const offsetLatLng = map.unproject(targetPoint, targetZoom);
      map.flyTo(offsetLatLng, targetZoom, { duration: 0.8 });
    }
  }, [activePlace, map]);

  // Handle taps on empty map area (for mobile expand)
  useEffect(() => {
    if (!onMapTapped) return;
    const handler = () => onMapTapped();
    map.on("click", handler);
    return () => { map.off("click", handler); };
  }, [map, onMapTapped]);

  // Invalidate size when map container resizes
  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}

export default function MapClient({
  patios,
  activePlaceId,
  hoveredPlaceId,
  onSelectPlace,
  onMapTapped,
}: MapClientProps) {
  const activePlace = useMemo(
    () => patios.find((p) => p.id === activePlaceId) || null,
    [patios, activePlaceId]
  );

  return (
    <MapContainer
      center={SEATTLE_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <MapController activePlace={activePlace} patios={patios} onMapTapped={onMapTapped} />
      <UserLocationMarker />

      {patios.map((patio) => {
        const isActive = patio.id === activePlaceId;
        const isHovered = patio.id === hoveredPlaceId;

        return (
          <Marker
            key={patio.id}
            position={[patio.coordinates.lat, patio.coordinates.lng]}
            icon={createMarkerIcon(isActive, isHovered, patio.scores.total, patio.name, patio.neighborhood)}
            eventHandlers={{
              click: () => onSelectPlace(patio.id),
            }}
            zIndexOffset={isActive ? 1000 : isHovered ? 500 : 0}
          />
        );
      })}
    </MapContainer>
  );
}
