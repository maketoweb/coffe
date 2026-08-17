import React, { useEffect, useRef, useState } from 'react';
import { MapPin, LocateFixed, Check } from 'lucide-react';
import { Sede } from '../types/store';
import { findNearestSede } from '../utils/geo';
import { useToast } from './Toast';

interface LeafletLatLng {
  lat: number;
  lng: number;
}

interface LeafletMarker {
  addTo(map: LeafletMap): LeafletMarker;
  bindPopup(html: string): LeafletMarker;
  on(event: string, handler: () => void): LeafletMarker;
  openPopup(): void;
  setLatLng(latlng: [number, number]): LeafletMarker;
}

interface LeafletMap {
  remove(): void;
  invalidateSize(): void;
  setView(center: [number, number] | LeafletLatLng, zoom?: number, options?: object): void;
}

interface LeafletNamespace {
  map(container: HTMLDivElement, options?: object): LeafletMap;
  tileLayer(url: string, options?: object): { addTo(map: LeafletMap): void };
  divIcon(options?: object): unknown;
  marker(latlng: [number, number], options?: object): LeafletMarker;
}

interface SedesMapProps {
  sedes: Sede[];
  selectedSedeId?: string;
  onSelect?: (sede: Sede) => void;
  themeColor?: string;
}

export const SedesMap: React.FC<SedesMapProps> = ({ sedes, selectedSedeId, onSelect, themeColor = '#10b981' }) => {
  const { showToast } = useToast();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const userMarkerRef = useRef<LeafletMarker | null>(null);

  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [locating, setLocating] = useState<boolean>(false);
  const [nearestId, setNearestId] = useState<string | undefined>(undefined);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const verifyLeaflet = () => {
      if ((window as unknown as { L?: LeafletNamespace }).L) {
        setMapLoaded(true);
        return true;
      }
      return false;
    };
    if (verifyLeaflet()) return;
    const interval = setInterval(() => { if (verifyLeaflet()) clearInterval(interval); }, 150);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;
    const L = (window as unknown as { L?: LeafletNamespace }).L;
    if (!L) return;

    if (mapInstanceRef.current) {
      try { mapInstanceRef.current.remove(); } catch { /* el mapa ya no existe */ }
      mapInstanceRef.current = null;
    }
    markersRef.current = [];
    userMarkerRef.current = null;

    const primary = sedes.find(s => s.es_principal && s.coordenadas) || sedes.find(s => s.coordenadas);
    if (!primary || !primary.coordenadas) return;

    const center = [primary.coordenadas.lat, primary.coordenadas.lng];
    const map = L.map(mapContainerRef.current, {
      center: center as [number, number],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const buildIcon = (color: string, ping: boolean, icon: string) =>
      L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            ${ping ? `<span class="absolute inline-flex h-8 w-8 rounded-full opacity-30 animate-ping" style="background-color:${color}"></span>` : ''}
            <div class="relative border-2 border-white text-white rounded-full flex items-center justify-center shadow-md" style="background-color:${color};width:30px;height:30px">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">${icon}</svg>
            </div>
          </div>
        `,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

    const shopIconPath = '<path d="M22 22H2"/><path d="M10 22v-5a2 2 0 0 1 4 0v5"/><path d="M21 11v11"/><path d="M3 11v11"/><path d="M12 2 2 11h20L12 2Z"/>';

    sedes.forEach((sede) => {
      if (!sede.coordenadas) return;
      const isSel = selectedSedeId === sede.id || nearestId === sede.id;
      const marker = L.marker([sede.coordenadas.lat, sede.coordenadas.lng], {
        icon: buildIcon(isSel ? '#059669' : themeColor, isSel, shopIconPath)
      }).addTo(map);
      marker.bindPopup(`
        <div class="text-xs p-1 font-sans" style="color:#18181b">
          <h4 class="font-bold" style="color:#059669">${sede.nombre}${sede.es_principal ? ' · Principal' : ''}</h4>
          <p style="margin:2px 0">${sede.direccion || ''}</p>
          ${sede.horario ? `<p style="margin:2px 0;color:#52525b">🕒 ${sede.horario}</p>` : ''}
        </div>
      `);
      marker.on('click', () => { if (onSelect) onSelect(sede); });
      markersRef.current.push(marker);
    });

    const focusId = selectedSedeId || (sedes[0] && sedes[0].id);
    const focusMarker = markersRef.current[markersRef.current.findIndex((_, i) => sedes[i]?.id === focusId)];
    if (focusMarker) focusMarker.openPopup();

    const resizeTimeout = setTimeout(() => { if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize(); }, 250);

    return () => {
      clearTimeout(resizeTimeout);
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch { /* el mapa ya no está */ }
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, sedes, selectedSedeId, nearestId, themeColor]);

  const locateMe = () => {
    if (!navigator.geolocation) {
      showToast('warning', 'Tu navegador no soporta geolocalizacion.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserCoords(coords);
        const nearest = findNearestSede(sedes, coords);
        if (nearest) {
          setNearestId(nearest.id);
          if (onSelect) onSelect(nearest);
        }
        setLocating(false);
      },
      () => { setLocating(false); showToast('error', 'No se pudo obtener tu ubicacion.'); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  useEffect(() => {
    if (!mapLoaded || !userCoords) return;
    const L = (window as unknown as { L?: LeafletNamespace }).L;
    if (!L || !mapInstanceRef.current) return;
    if (!userMarkerRef.current) {
      const userIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-8 w-8 rounded-full bg-sky-500 opacity-25 animate-pulse"></span>
            <div class="relative bg-sky-500 border-2 border-white text-white rounded-full flex items-center justify-center shadow-lg" style="width:30px;height:30px">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>`,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon }).addTo(mapInstanceRef.current);
    } else {
      userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
    }
    mapInstanceRef.current.setView([userCoords.lat, userCoords.lng], 13);
  }, [mapLoaded, userCoords]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded-xl border border-zinc-200 overflow-hidden shadow-sm bg-zinc-50">
        {!mapLoaded && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-900 border-t-transparent"></div>
            <p className="text-xs text-zinc-600 mt-2">Estableciendo mapa...</p>
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-[300px] z-10" />
      </div>

      <button
        onClick={locateMe}
        disabled={locating}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-60"
        style={{ backgroundColor: themeColor }}
      >
        <LocateFixed size={16} />
        {locating ? 'Buscando sucursal más cercana...' : 'Ubicar la sucursal más cercana'}
      </button>

      {nearestId && (() => {
        const nearest = sedes.find(s => s.id === nearestId);
        if (!nearest) return null;
        return (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-600 text-white">
              <MapPin size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-emerald-800">Sucursal más cercana</p>
              <p className="text-sm font-semibold text-zinc-900 truncate">{nearest.nombre}</p>
            </div>
            {selectedSedeId === nearestId && <Check size={18} className="text-emerald-600" />}
          </div>
        );
      })()}
    </div>
  );
};