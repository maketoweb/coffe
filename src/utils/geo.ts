import { Sede } from '../types/store';

export const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const findNearestSede = (
  sedes: Sede[],
  { lat, lng }: { lat: number; lng: number }
): Sede | undefined => {
  if (!sedes || sedes.length === 0) return undefined;
  let nearest = sedes[0];
  let minDist = Infinity;
  for (const sede of sedes) {
    if (!sede.coordenadas) continue;
    const dist = haversineKm(lat, lng, sede.coordenadas.lat, sede.coordenadas.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = sede;
    }
  }
  return nearest;
};