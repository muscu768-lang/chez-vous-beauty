import { useCallback, useEffect, useState } from "react";

export type Coords = { lat: number; lng: number };
const KEY = "edito:coords";

export function distanceKm(a: Coords, b: Coords) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const formatDistance = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`);

export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle");

  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    if (raw) {
      try {
        setCoords(JSON.parse(raw) as Coords);
        setStatus("granted");
      } catch {
        /* ignore */
      }
    }
  }, []);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("denied");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        window.localStorage.setItem(KEY, JSON.stringify(next));
        setCoords(next);
        setStatus("granted");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  const clear = useCallback(() => {
    window.localStorage.removeItem(KEY);
    setCoords(null);
    setStatus("idle");
  }, []);

  return { coords, status, request, clear };
}
