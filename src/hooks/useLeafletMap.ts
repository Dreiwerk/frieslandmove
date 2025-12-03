// hooks/useLeafletMap.ts

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Coordinates, TransportRoute, Stop, MapMode } from '@/types/routing';

// Leaflet Typen
declare global {
  interface Window {
    L: typeof import('leaflet');
  }
}

interface UseLeafletMapOptions {
  center: Coordinates;
  zoom: number;
  onMapClick?: (coords: Coordinates) => void;
  onStopDragEnd?: (routeId: string, stopId: string, newCoords: Coordinates) => void;
}

interface MarkerRefs {
  [routeId: string]: L.Marker[];
}

interface PolylineRefs {
  [routeId: string]: L.Polyline;
}

export function useLeafletMap(
  containerRef: React.RefObject<HTMLDivElement>,
  options: UseLeafletMapOptions
) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<MarkerRefs>({});
  const polylinesRef = useRef<PolylineRefs>({});
  const unassignedMarkersRef = useRef<L.Marker[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [mode, setMode] = useState<MapMode>('view');

  // Leaflet dynamisch laden
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      // CSS laden
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // JS laden
      if (!window.L) {
        await new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      setIsLoaded(true);
    };

    loadLeaflet();
  }, []);

  // Map initialisieren
  useEffect(() => {
    if (!isLoaded || !containerRef.current || mapRef.current) return;

    const L = window.L;

    const map = L.map(containerRef.current, {
      center: [options.center.lat, options.center.lng],
      zoom: options.zoom,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Map Click Handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (mode === 'add' && options.onMapClick) {
        options.onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [isLoaded, containerRef, options.center, options.zoom]);

  // Marker-Icon Creators
  const createStopMarker = useCallback((index: number, color: string, isDraggable: boolean) => {
    if (!window.L) return null;

    return window.L.divIcon({
      html: `
        <div style="
          width: 28px;
          height: 28px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          font-family: system-ui, -apple-system, sans-serif;
          cursor: ${isDraggable ? 'grab' : 'pointer'};
        ">${index + 1}</div>
      `,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }, []);

  const createSchoolMarker = useCallback(() => {
    if (!window.L) return null;

    return window.L.divIcon({
      html: `
        <div style="
          width: 36px;
          height: 36px;
          background: #e74c3c;
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">🏫</div>
      `,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
  }, []);

  const createStudentMarker = useCallback((hasSpecialNeeds?: boolean) => {
    if (!window.L) return null;

    const bgColor = hasSpecialNeeds ? '#e74c3c' : '#f39c12';
    const icon = hasSpecialNeeds ? '♿' : '👤';

    return window.L.divIcon({
      html: `
        <div style="
          width: 28px;
          height: 28px;
          background: ${bgColor};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">${icon}</div>
      `,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }, []);

  // Route rendern
  const renderRoute = useCallback((
    route: TransportRoute,
    isActive: boolean,
    currentMode: MapMode
  ) => {
    if (!mapRef.current || !window.L) return;

    const L = window.L;
    const map = mapRef.current;

    // Alte Layer entfernen
    if (polylinesRef.current[route.id]) {
      map.removeLayer(polylinesRef.current[route.id]);
    }
    if (markersRef.current[route.id]) {
      markersRef.current[route.id].forEach(m => map.removeLayer(m));
    }

    const markers: L.Marker[] = [];

    // Koordinaten für Linie
    const lineCoords: [number, number][] = route.routeGeometry
      ? route.routeGeometry
      : [
          ...route.stops.map(s => [s.coords.lat, s.coords.lng] as [number, number]),
          [route.school.coords.lat, route.school.coords.lng],
        ];

    // Polyline zeichnen
    const polyline = L.polyline(lineCoords, {
      color: route.color,
      weight: isActive ? 5 : 3,
      opacity: isActive ? 1 : 0.6,
      dashArray: isActive ? undefined : '5, 10',
    }).addTo(map);

    polylinesRef.current[route.id] = polyline;

    // Stop-Marker
    route.stops.forEach((stop, index) => {
      const isDraggable = currentMode === 'edit' && isActive;
      const icon = createStopMarker(index, route.color, isDraggable);

      if (!icon) return;

      const marker = L.marker([stop.coords.lat, stop.coords.lng], {
        icon,
        draggable: isDraggable,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: system-ui; min-width: 180px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
            ${stop.student}
          </div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 2px;">
            📍 ${stop.name}
          </div>
          <div style="font-size: 12px; color: #64748b;">
            🕐 ${stop.time} Uhr
          </div>
          ${stop.specialNeeds?.wheelchair ? '<div style="font-size: 11px; color: #e74c3c; margin-top: 4px;">♿ Rollstuhl</div>' : ''}
        </div>
      `);

      // Drag Handler
      if (isDraggable) {
        marker.on('dragend', (e: L.DragEndEvent) => {
          const newPos = e.target.getLatLng();
          if (options.onStopDragEnd) {
            options.onStopDragEnd(route.id, stop.id, {
              lat: newPos.lat,
              lng: newPos.lng,
            });
          }
        });
      }

      markers.push(marker);
    });

    // Schul-Marker
    const schoolIcon = createSchoolMarker();
    if (schoolIcon) {
      const schoolMarker = L.marker(
        [route.school.coords.lat, route.school.coords.lng],
        { icon: schoolIcon }
      ).addTo(map);

      schoolMarker.bindPopup(`
        <div style="font-family: system-ui; min-width: 180px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
            ${route.school.name}
          </div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 2px;">
            ${route.school.type}
          </div>
          <div style="font-size: 12px; color: #64748b;">
            🕐 Ankunft ${route.arrivalTime} Uhr
          </div>
        </div>
      `);

      markers.push(schoolMarker);
    }

    markersRef.current[route.id] = markers;
  }, [createStopMarker, createSchoolMarker, options.onStopDragEnd]);

  // Unassigned Students rendern
  const renderUnassignedStudents = useCallback((
    students: Array<{ id: string; name: string; address: string; coords: Coordinates; specialNeeds?: { wheelchair?: boolean } }>
  ) => {
    if (!mapRef.current || !window.L) return;

    const L = window.L;
    const map = mapRef.current;

    // Alte Marker entfernen
    unassignedMarkersRef.current.forEach(m => map.removeLayer(m));
    unassignedMarkersRef.current = [];

    students.forEach(student => {
      const icon = createStudentMarker(student.specialNeeds?.wheelchair);
      if (!icon) return;

      const marker = L.marker([student.coords.lat, student.coords.lng], {
        icon,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: system-ui; min-width: 180px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
            ${student.name}
          </div>
          <div style="font-size: 12px; color: #64748b;">
            📍 ${student.address}
          </div>
          ${student.specialNeeds?.wheelchair ? '<div style="font-size: 11px; color: #e74c3c; margin-top: 4px;">♿ Rollstuhl</div>' : ''}
        </div>
      `);

      unassignedMarkersRef.current.push(marker);
    });
  }, [createStudentMarker]);

  // Zoom Controls
  const zoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const zoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  const fitBounds = useCallback((routes: TransportRoute[]) => {
    if (!mapRef.current || !window.L || routes.length === 0) return;

    const L = window.L;
    const allCoords: [number, number][] = [];

    routes.forEach(route => {
      route.stops.forEach(s => allCoords.push([s.coords.lat, s.coords.lng]));
      allCoords.push([route.school.coords.lat, route.school.coords.lng]);
    });

    if (allCoords.length > 0) {
      mapRef.current.fitBounds(L.latLngBounds(allCoords), { padding: [50, 50] });
    }
  }, []);

  const focusRoute = useCallback((route: TransportRoute) => {
    if (!mapRef.current || !window.L) return;

    const L = window.L;
    const coords: [number, number][] = [
      ...route.stops.map(s => [s.coords.lat, s.coords.lng] as [number, number]),
      [route.school.coords.lat, route.school.coords.lng],
    ];

    mapRef.current.fitBounds(L.latLngBounds(coords), { padding: [50, 50] });
  }, []);

  // Cursor ändern
  const setCursor = useCallback((cursor: string) => {
    if (mapRef.current) {
      mapRef.current.getContainer().style.cursor = cursor;
    }
  }, []);

  return {
    map: mapRef.current,
    isLoaded,
    mode,
    setMode,
    renderRoute,
    renderUnassignedStudents,
    zoomIn,
    zoomOut,
    fitBounds,
    focusRoute,
    setCursor,
  };
}
