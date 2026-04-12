"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type UserLocation = [number, number] | null;

const UserLocationContext = createContext<UserLocation>(null);

export function UserLocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<UserLocation>(null);

  useEffect(() => {
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
