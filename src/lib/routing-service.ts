// lib/routing-service.ts

import type { Coordinates, RoutingResult, OptimizationResult, Stop } from '@/types/routing';

const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY;
const ORS_BASE_URL = 'https://api.openrouteservice.org';

/**
 * Berechnet eine Route über mehrere Wegpunkte mit echtem Straßen-Routing
 */
export async function calculateStreetRoute(waypoints: Coordinates[]): Promise<RoutingResult> {
  if (!ORS_API_KEY) {
    console.warn('ORS API Key nicht gesetzt - Fallback auf Luftlinie');
    return calculateFallbackRoute(waypoints);
  }

  if (waypoints.length < 2) {
    throw new Error('Mindestens 2 Wegpunkte erforderlich');
  }

  try {
    // ORS erwartet [lng, lat] Format
    const coordinates = waypoints.map(w => [w.lng, w.lat]);

    const response = await fetch(`${ORS_BASE_URL}/v2/directions/driving-car`, {
      method: 'POST',
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinates,
        instructions: false,
        geometry: true,
        elevation: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Routing fehlgeschlagen');
    }

    const data = await response.json();
    const route = data.routes[0];

    // Decode Polyline
    const decodedCoords = decodePolyline(route.geometry);

    // Konvertiere zu [lat, lng] für Leaflet
    const leafletCoords: [number, number][] = decodedCoords.map(
      ([lng, lat]) => [lat, lng]
    );

    return {
      coordinates: leafletCoords,
      distance: route.summary.distance,
      duration: route.summary.duration,
    };
  } catch (error) {
    console.error('ORS Routing Error:', error);
    return calculateFallbackRoute(waypoints);
  }
}

/**
 * Fallback: Berechnet einfache Luftlinien-Route
 */
function calculateFallbackRoute(waypoints: Coordinates[]): RoutingResult {
  const coordinates: [number, number][] = waypoints.map(w => [w.lat, w.lng]);

  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += haversineDistance(waypoints[i], waypoints[i + 1]);
  }

  // Schätzung: 30 km/h Durchschnittsgeschwindigkeit
  const duration = (totalDistance / 30) * 3600;

  return {
    coordinates,
    distance: totalDistance * 1000,
    duration,
  };
}

/**
 * Berechnet Distanzmatrix zwischen allen Punkten
 */
export async function calculateDistanceMatrix(locations: Coordinates[]): Promise<number[][]> {
  if (!ORS_API_KEY) {
    return calculateFallbackMatrix(locations);
  }

  try {
    const coordinates = locations.map(l => [l.lng, l.lat]);

    const response = await fetch(`${ORS_BASE_URL}/v2/matrix/driving-car`, {
      method: 'POST',
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locations: coordinates,
        metrics: ['distance'],
      }),
    });

    if (!response.ok) {
      throw new Error('Matrix-Berechnung fehlgeschlagen');
    }

    const data = await response.json();
    return data.distances;
  } catch (error) {
    console.error('Matrix Error:', error);
    return calculateFallbackMatrix(locations);
  }
}

/**
 * Fallback: Haversine-Distanzmatrix
 */
function calculateFallbackMatrix(locations: Coordinates[]): number[][] {
  return locations.map(from =>
    locations.map(to => haversineDistance(from, to) * 1000)
  );
}

/**
 * Optimiert die Reihenfolge der Haltestellen (Nearest Neighbor TSP)
 */
export async function optimizeStopOrder(
  stops: Stop[],
  startCoords: Coordinates,
  endCoords: Coordinates
): Promise<OptimizationResult> {
  if (stops.length <= 2) {
    return {
      optimizedStops: stops,
      savedDistance: 0,
      savedTime: 0,
      savedCost: 0,
    };
  }

  // Alle Punkte: Start + Stops + Ende
  const allPoints = [
    startCoords,
    ...stops.map(s => s.coords),
    endCoords,
  ];

  // Distanzmatrix berechnen
  const matrix = await calculateDistanceMatrix(allPoints);

  // Original-Distanz berechnen
  let originalDistance = 0;
  for (let i = 0; i < stops.length + 1; i++) {
    originalDistance += matrix[i][i + 1];
  }

  // Nearest Neighbor Algorithmus
  const optimizedOrder = nearestNeighborTSP(matrix, stops.length);

  // Optimierte Stops in neuer Reihenfolge
  const optimizedStops = optimizedOrder.map(idx => stops[idx]);

  // Neue Distanz berechnen
  let optimizedDistance = matrix[0][optimizedOrder[0] + 1]; // Start zum ersten Stop
  for (let i = 0; i < optimizedOrder.length - 1; i++) {
    optimizedDistance += matrix[optimizedOrder[i] + 1][optimizedOrder[i + 1] + 1];
  }
  optimizedDistance += matrix[optimizedOrder[optimizedOrder.length - 1] + 1][allPoints.length - 1]; // Letzter Stop zum Ende

  const savedDistance = (originalDistance - optimizedDistance) / 1000; // km
  const savedTime = savedDistance * 2; // ~2 min pro km
  const savedCost = savedDistance * 1.5; // ~1.50€ pro km

  // Zeiten neu berechnen
  let currentTime = parseTime(stops[0]?.time || '07:00');
  optimizedStops.forEach((stop, idx) => {
    stop.time = formatTime(currentTime);
    currentTime += 5; // 5 Minuten pro Stop
  });

  return {
    optimizedStops,
    savedDistance: Math.max(0, savedDistance),
    savedTime: Math.max(0, savedTime),
    savedCost: Math.max(0, savedCost),
  };
}

/**
 * Nearest Neighbor TSP Algorithmus
 */
function nearestNeighborTSP(matrix: number[][], numStops: number): number[] {
  const visited = new Set<number>();
  const order: number[] = [];
  let current = 0; // Start bei Index 0

  while (order.length < numStops) {
    let nearestIdx = -1;
    let nearestDist = Infinity;

    for (let i = 0; i < numStops; i++) {
      if (!visited.has(i)) {
        const dist = matrix[current][i + 1]; // +1 weil Index 0 der Startpunkt ist
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = i;
        }
      }
    }

    if (nearestIdx !== -1) {
      visited.add(nearestIdx);
      order.push(nearestIdx);
      current = nearestIdx + 1;
    }
  }

  return order;
}

/**
 * Polyline Decoder für ORS Response
 */
function decodePolyline(encoded: string): [number, number][] {
  const coords: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coords.push([lng / 1e5, lat / 1e5]);
  }

  return coords;
}

/**
 * Haversine Formel für Distanzberechnung
 */
export function haversineDistance(from: Coordinates, to: Coordinates): number {
  const R = 6371; // Erdradius in km
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Geocoding: Adresse zu Koordinaten
 */
export async function geocodeAddress(address: string, region = 'Friesland'): Promise<Coordinates | null> {
  if (!ORS_API_KEY) {
    console.warn('ORS API Key nicht gesetzt');
    return null;
  }

  try {
    const query = encodeURIComponent(`${address}, ${region}, Deutschland`);
    const response = await fetch(
      `${ORS_BASE_URL}/geocode/search?api_key=${ORS_API_KEY}&text=${query}&boundary.country=DE&size=1`
    );

    if (!response.ok) {
      throw new Error('Geocoding fehlgeschlagen');
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      return { lat, lng };
    }

    return null;
  } catch (error) {
    console.error('Geocoding Error:', error);
    return null;
  }
}

/**
 * Reverse Geocoding: Koordinaten zu Adresse
 */
export async function reverseGeocode(coords: Coordinates): Promise<string | null> {
  if (!ORS_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `${ORS_BASE_URL}/geocode/reverse?api_key=${ORS_API_KEY}&point.lon=${coords.lng}&point.lat=${coords.lat}&size=1`
    );

    if (!response.ok) {
      throw new Error('Reverse Geocoding fehlgeschlagen');
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features[0].properties.label;
    }

    return null;
  } catch (error) {
    console.error('Reverse Geocoding Error:', error);
    return null;
  }
}
