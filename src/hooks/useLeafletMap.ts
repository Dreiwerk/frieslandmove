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
  mode?: MapMode;
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

  // Refs für aktuelle Werte (um Closure-Probleme zu vermeiden)
  const modeRef = useRef<MapMode>(options.mode || 'view');
  const onMapClickRef = useRef(options.onMapClick);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Update refs wenn sich Werte ändern
  useEffect(() => {
    modeRef.current = options.mode || 'view';
  }, [options.mode]);

  useEffect(() => {
    onMapClickRef.current = options.onMapClick;
  }, [options.onMapClick]);

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

    // Map Click Handler - verwendet Refs für aktuelle Werte
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (modeRef.current === 'add' && onMapClickRef.current) {
        onMapClickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    mapRef.current = map;
    setIsMapReady(true);

    return () => {
      setIsMapReady(false);
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
    const map = mapRef.current;
    if (!map || !window.L) return;

    const L = window.L;

    // Alte Layer entfernen
    if (polylinesRef.current[route.id]) {
      try {
        map.removeLayer(polylinesRef.current[route.id]);
      } catch (e) {
        // Layer bereits entfernt
      }
      delete polylinesRef.current[route.id];
    }
    if (markersRef.current[route.id]) {
      markersRef.current[route.id].forEach(m => {
        try {
          map.removeLayer(m);
        } catch (e) {
          // Marker bereits entfernt
        }
      });
      delete markersRef.current[route.id];
    }

    const markers: L.Marker[] = [];

    // Validiere Route-Daten
    if (!route.school?.coords?.lat || !route.school?.coords?.lng) {
      console.warn('Route hat keine gültige Schule:', route.id);
      return;
    }

    // Koordinaten für Linie - nur gültige Koordinaten
    let lineCoords: [number, number][] = [];

    if (route.routeGeometry && route.routeGeometry.length > 0) {
      // Filtere ungültige Koordinaten aus routeGeometry
      lineCoords = route.routeGeometry.filter(
        coord => Array.isArray(coord) &&
                 coord.length === 2 &&
                 typeof coord[0] === 'number' &&
                 typeof coord[1] === 'number' &&
                 !isNaN(coord[0]) &&
                 !isNaN(coord[1])
      );
    }

    // Fallback auf Stop-Koordinaten wenn keine routeGeometry
    if (lineCoords.length === 0) {
      const stopCoords = route.stops
        .filter(s => s.coords?.lat && s.coords?.lng && !isNaN(s.coords.lat) && !isNaN(s.coords.lng))
        .map(s => [s.coords.lat, s.coords.lng] as [number, number]);

      lineCoords = [
        ...stopCoords,
        [route.school.coords.lat, route.school.coords.lng],
      ];
    }

    // Nur zeichnen wenn mindestens 2 gültige Punkte vorhanden
    if (lineCoords.length >= 2 && map) {
      try {
        const polyline = L.polyline(lineCoords, {
          color: route.color,
          weight: isActive ? 5 : 3,
          opacity: isActive ? 1 : 0.6,
          dashArray: isActive ? undefined : '5, 10',
        }).addTo(map);

        polylinesRef.current[route.id] = polyline;
      } catch (e) {
        console.warn('Polyline konnte nicht erstellt werden:', e);
      }
    }

    // Stop-Marker
    route.stops.forEach((stop, index) => {
      // Validiere Stop-Koordinaten
      if (!stop.coords?.lat || !stop.coords?.lng || isNaN(stop.coords.lat) || isNaN(stop.coords.lng)) {
        console.warn('Stop hat keine gültigen Koordinaten:', stop.id);
        return;
      }

      const isDraggable = currentMode === 'edit' && isActive;
      const icon = createStopMarker(index, route.color, isDraggable);

      if (!icon || !map) return;

      let marker: L.Marker;
      try {
        marker = L.marker([stop.coords.lat, stop.coords.lng], {
          icon,
          draggable: isDraggable,
        }).addTo(map);
      } catch (e) {
        console.warn('Marker konnte nicht erstellt werden:', e);
        return;
      }

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
    if (schoolIcon && map) {
      let schoolMarker: L.Marker;
      try {
        schoolMarker = L.marker(
          [route.school.coords.lat, route.school.coords.lng],
          { icon: schoolIcon }
        ).addTo(map);
      } catch (e) {
        console.warn('Schul-Marker konnte nicht erstellt werden:', e);
        markersRef.current[route.id] = markers;
        return;
      }

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
    const map = mapRef.current;
    if (!map || !window.L) return;

    const L = window.L;

    // Alte Marker entfernen
    unassignedMarkersRef.current.forEach(m => {
      try {
        map.removeLayer(m);
      } catch (e) {
        // Marker bereits entfernt
      }
    });
    unassignedMarkersRef.current = [];

    students.forEach(student => {
      // Validiere Koordinaten
      if (!student.coords?.lat || !student.coords?.lng ||
          isNaN(student.coords.lat) || isNaN(student.coords.lng)) {
        return;
      }

      const icon = createStudentMarker(student.specialNeeds?.wheelchair);
      if (!icon || !map) return;

      let marker: L.Marker;
      try {
        marker = L.marker([student.coords.lat, student.coords.lng], {
          icon,
        }).addTo(map);
      } catch (e) {
        console.warn('Student-Marker konnte nicht erstellt werden:', e);
        return;
      }

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
      route.stops.forEach(s => {
        if (s.coords?.lat && s.coords?.lng && !isNaN(s.coords.lat) && !isNaN(s.coords.lng)) {
          allCoords.push([s.coords.lat, s.coords.lng]);
        }
      });
      if (route.school?.coords?.lat && route.school?.coords?.lng &&
          !isNaN(route.school.coords.lat) && !isNaN(route.school.coords.lng)) {
        allCoords.push([route.school.coords.lat, route.school.coords.lng]);
      }
    });

    if (allCoords.length > 0) {
      try {
        mapRef.current.fitBounds(L.latLngBounds(allCoords), { padding: [50, 50] });
      } catch (e) {
        console.warn('fitBounds fehlgeschlagen:', e);
      }
    }
  }, []);

  const focusRoute = useCallback((route: TransportRoute) => {
    if (!mapRef.current || !window.L) return;

    const L = window.L;
    const coords: [number, number][] = [];

    route.stops.forEach(s => {
      if (s.coords?.lat && s.coords?.lng && !isNaN(s.coords.lat) && !isNaN(s.coords.lng)) {
        coords.push([s.coords.lat, s.coords.lng]);
      }
    });

    if (route.school?.coords?.lat && route.school?.coords?.lng &&
        !isNaN(route.school.coords.lat) && !isNaN(route.school.coords.lng)) {
      coords.push([route.school.coords.lat, route.school.coords.lng]);
    }

    if (coords.length > 0) {
      try {
        mapRef.current.fitBounds(L.latLngBounds(coords), { padding: [50, 50] });
      } catch (e) {
        console.warn('focusRoute fehlgeschlagen:', e);
      }
    }
  }, []);

  // Cursor ändern
  const setCursor = useCallback((cursor: string) => {
    if (mapRef.current) {
      mapRef.current.getContainer().style.cursor = cursor;
    }
  }, []);

  return {
    map: mapRef.current,
    isLoaded: isMapReady, // Exportiere isMapReady als isLoaded für Konsistenz
    renderRoute,
    renderUnassignedStudents,
    zoomIn,
    zoomOut,
    fitBounds,
    focusRoute,
    setCursor,
  };
}
