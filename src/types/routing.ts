// types/routing.ts

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Stop {
  id: string;
  name: string;
  student: string;
  time: string;
  coords: Coordinates;
  address?: string;
  specialNeeds?: {
    wheelchair?: boolean;
    companion?: boolean;
  };
}

export interface School {
  id: string;
  name: string;
  coords: Coordinates;
  type: 'Gymnasium' | 'Gesamtschule' | 'Oberschule' | 'Grundschule' | 'Förderschule' | 'BBS';
  address?: string;
}

export interface TransportRoute {
  id: string;
  name: string;
  color: string;
  vehicle: VehicleType;
  operator: string;
  distance: number; // km
  duration: number; // minutes
  cost: number; // €/Tag
  departureTime: string;
  arrivalTime: string;
  school: School;
  stops: Stop[];
  isOptimized?: boolean;
  routeGeometry?: [number, number][]; // For real street routing
}

export type VehicleType =
  | 'Kleinbus (8 Sitze)'
  | 'Großraumtaxi (6 Sitze)'
  | 'Schulbus (40 Sitze)'
  | 'ÖPNV-Kombination'
  | 'PKW (4 Sitze)';

export interface UnassignedStudent {
  id: string;
  name: string;
  address: string;
  coords: Coordinates;
  school?: School;
  specialNeeds?: {
    wheelchair?: boolean;
    companion?: boolean;
  };
  grade?: string;
}

export interface RouteStatistics {
  totalRoutes: number;
  totalStudents: number;
  totalDistance: number;
  totalCost: number;
  unassignedCount: number;
}

export type MapMode = 'view' | 'edit' | 'add';

export interface RoutingResult {
  coordinates: [number, number][]; // [lat, lng] for Leaflet
  distance: number; // meters
  duration: number; // seconds
}

export interface OptimizationResult {
  optimizedStops: Stop[];
  savedDistance: number; // km
  savedTime: number; // minutes
  savedCost: number; // €
}
