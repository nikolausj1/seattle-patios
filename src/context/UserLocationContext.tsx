"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type UserLocation = [number, number] | null;

const UserLocationContext = createContext<UserLocation>(null);

export function UserLocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<UserLocation>(null);

  useEffect(() => {
    // Allow `?nogeo=1` to skip the prompt — useful when verifying layout in
    // the iOS Simulator, where Safari otherwise pops a modal that blocks
    // automated screenshotting.
    if (typeof window !== "undefined" && /[?&]nogeo=1/.test(window.location.search)) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {} // silently ignore denial/error
    );
  }, []);

  return (
    <UserLocationContext.Provider value={location}>
      {children}
    </UserLocationContext.Provider>
  );
}

export function useUserLocation(): UserLocation {
  return useContext(UserLocationContext);
}
