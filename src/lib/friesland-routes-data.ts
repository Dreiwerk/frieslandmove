// lib/friesland-routes-data.ts

import type { TransportRoute, School, UnassignedStudent } from '@/types/routing';

// =============================================
// SCHULEN im Landkreis Friesland
// =============================================

export const frieslandSchools: School[] = [
  {
    id: 'school-1',
    name: 'Mariengymnasium Jever',
    coords: { lat: 53.5746, lng: 7.9003 },
    type: 'Gymnasium',
    address: 'Am Gymnasium 1, 26441 Jever',
  },
  {
    id: 'school-2',
    name: 'IGS Friesland Nord',
    coords: { lat: 53.5333, lng: 7.9500 },
    type: 'Gesamtschule',
    address: 'Schulstraße 12, 26419 Schortens',
  },
  {
    id: 'school-3',
    name: 'Oberschule Varel',
    coords: { lat: 53.3967, lng: 8.1367 },
    type: 'Oberschule',
    address: 'Arngaster Str. 9, 26316 Varel',
  },
  {
    id: 'school-4',
    name: 'Grundschule Schortens',
    coords: { lat: 53.5280, lng: 7.9450 },
    type: 'Grundschule',
    address: 'Plaggestraße 17, 26419 Schortens',
  },
  {
    id: 'school-5',
    name: 'Förderschule Jever',
    coords: { lat: 53.5700, lng: 7.8950 },
    type: 'Förderschule',
    address: 'Mühlenstraße 158, 26441 Jever',
  },
  {
    id: 'school-6',
    name: 'BBS Varel',
    coords: { lat: 53.3900, lng: 8.1300 },
    type: 'BBS',
    address: 'Stettiner Str. 3, 26316 Varel',
  },
];

// =============================================
// DEMO-ROUTEN
// =============================================

export const demoRoutes: TransportRoute[] = [
  {
    id: 'route-12',
    name: 'Route 12 - Jever Nord',
    color: '#3498db',
    vehicle: 'Kleinbus (8 Sitze)',
    operator: 'Taxi Müller GmbH',
    distance: 24.5,
    duration: 37,
    cost: 142.50,
    departureTime: '07:15',
    arrivalTime: '07:52',
    school: frieslandSchools[0],
    stops: [
      {
        id: 'stop-12-1',
        name: 'Mühlenweg 12',
        student: 'Max Janssen',
        time: '07:15',
        coords: { lat: 53.5950, lng: 7.8800 },
        address: 'Mühlenweg 12, 26441 Jever',
      },
      {
        id: 'stop-12-2',
        name: 'Kirchstraße 45',
        student: 'Lisa Peters',
        time: '07:19',
        coords: { lat: 53.5880, lng: 7.8850 },
        address: 'Kirchstraße 45, 26441 Jever',
      },
      {
        id: 'stop-12-3',
        name: 'Am Deich 8',
        student: 'Tim Bruns',
        time: '07:24',
        coords: { lat: 53.5820, lng: 7.8900 },
        address: 'Am Deich 8, 26441 Jever',
      },
      {
        id: 'stop-12-4',
        name: 'Bahnhofstraße 23',
        student: 'Anna Meyer',
        time: '07:30',
        coords: { lat: 53.5780, lng: 7.8920 },
        address: 'Bahnhofstraße 23, 26441 Jever',
      },
      {
        id: 'stop-12-5',
        name: 'Schlossplatz 5',
        student: 'Jonas Schmidt',
        time: '07:38',
        coords: { lat: 53.5760, lng: 7.8980 },
        address: 'Schlossplatz 5, 26441 Jever',
      },
      {
        id: 'stop-12-6',
        name: 'Schulweg 1',
        student: 'Marie Müller',
        time: '07:45',
        coords: { lat: 53.5750, lng: 7.9000 },
        address: 'Schulweg 1, 26441 Jever',
      },
    ],
  },
  {
    id: 'route-4a',
    name: 'Route 4a - Schortens Mitte',
    color: '#27ae60',
    vehicle: 'Großraumtaxi (6 Sitze)',
    operator: 'Busverkehr Friesland AG',
    distance: 18.3,
    duration: 28,
    cost: 98.00,
    departureTime: '07:20',
    arrivalTime: '07:48',
    school: frieslandSchools[1],
    stops: [
      {
        id: 'stop-4a-1',
        name: 'Oldenburger Str. 78',
        student: 'Finn Gerdes',
        time: '07:20',
        coords: { lat: 53.5450, lng: 7.9200 },
        address: 'Oldenburger Str. 78, 26419 Schortens',
      },
      {
        id: 'stop-4a-2',
        name: 'Heidmühler Weg 15',
        student: 'Emma Hinrichs',
        time: '07:25',
        coords: { lat: 53.5400, lng: 7.9300 },
        address: 'Heidmühler Weg 15, 26419 Schortens',
      },
      {
        id: 'stop-4a-3',
        name: 'Menkestraße 42',
        student: 'Paul Janßen',
        time: '07:31',
        coords: { lat: 53.5370, lng: 7.9400 },
        address: 'Menkestraße 42, 26419 Schortens',
      },
      {
        id: 'stop-4a-4',
        name: 'Am Markt 3',
        student: 'Lena Tjarks',
        time: '07:38',
        coords: { lat: 53.5340, lng: 7.9480 },
        address: 'Am Markt 3, 26419 Schortens',
      },
    ],
  },
  {
    id: 'route-7b',
    name: 'Route 7b - Varel Süd',
    color: '#9b59b6',
    vehicle: 'ÖPNV-Kombination',
    operator: 'Weser-Ems-Bus',
    distance: 24.4,
    duration: 42,
    cost: 145.00,
    departureTime: '07:00',
    arrivalTime: '07:42',
    school: frieslandSchools[2],
    stops: [
      {
        id: 'stop-7b-1',
        name: 'Bürgermeister-Heidenreich-Str. 5',
        student: 'Mia Oltmanns',
        time: '07:00',
        coords: { lat: 53.4200, lng: 8.1000 },
        address: 'Bürgermeister-Heidenreich-Str. 5, 26316 Varel',
      },
      {
        id: 'stop-7b-2',
        name: 'Neue Str. 89',
        student: 'Ben Kramer',
        time: '07:08',
        coords: { lat: 53.4150, lng: 8.1100 },
        address: 'Neue Str. 89, 26316 Varel',
      },
      {
        id: 'stop-7b-3',
        name: 'Hafenstraße 12',
        student: 'Sophie Freese',
        time: '07:15',
        coords: { lat: 53.4050, lng: 8.1200 },
        address: 'Hafenstraße 12, 26316 Varel',
      },
      {
        id: 'stop-7b-4',
        name: 'Windallee 34',
        student: 'Luis Renken',
        time: '07:22',
        coords: { lat: 53.4000, lng: 8.1300 },
        address: 'Windallee 34, 26316 Varel',
      },
      {
        id: 'stop-7b-5',
        name: 'Dangaster Str. 56',
        student: 'Clara Behrens',
        time: '07:30',
        coords: { lat: 53.3980, lng: 8.1350 },
        address: 'Dangaster Str. 56, 26316 Varel',
        specialNeeds: { wheelchair: true },
      },
    ],
  },
];

// =============================================
// NICHT ZUGEORDNETE SCHÜLER
// =============================================

export const unassignedStudents: UnassignedStudent[] = [
  {
    id: 'student-101',
    name: 'Tom Willms',
    address: 'Feldweg 23, 26340 Zetel',
    coords: { lat: 53.4200, lng: 7.9800 },
    school: frieslandSchools[1],
    grade: '7a',
  },
  {
    id: 'student-102',
    name: 'Lea Tammena',
    address: 'Mühlenstr. 8, 26452 Sande',
    coords: { lat: 53.5050, lng: 8.0200 },
    school: frieslandSchools[0],
    grade: '9b',
  },
  {
    id: 'student-103',
    name: 'Niklas Böhm',
    address: 'Dorfstr. 45, 26345 Bockhorn',
    coords: { lat: 53.4050, lng: 7.9700 },
    school: frieslandSchools[2],
    grade: '8c',
  },
  {
    id: 'student-104',
    name: 'Hannah Kreye',
    address: 'Am Park 12, 26434 Wangerland',
    coords: { lat: 53.6500, lng: 7.9000 },
    school: frieslandSchools[0],
    grade: '6a',
    specialNeeds: { companion: true },
  },
  {
    id: 'student-105',
    name: 'Felix Janssen',
    address: 'Hauptstr. 67, 26441 Jever',
    coords: { lat: 53.5800, lng: 7.9100 },
    school: frieslandSchools[0],
    grade: '10a',
  },
  {
    id: 'student-106',
    name: 'Amelie Freese',
    address: 'Bahnhofstr. 12, 26340 Zetel',
    coords: { lat: 53.4150, lng: 7.9750 },
    school: frieslandSchools[2],
    grade: '5b',
  },
  {
    id: 'student-107',
    name: 'Lukas Onken',
    address: 'Kirchweg 34, 26452 Sande',
    coords: { lat: 53.5100, lng: 8.0100 },
    school: frieslandSchools[4],
    grade: '4',
    specialNeeds: { wheelchair: true },
  },
];

// =============================================
// GEMEINDEN Koordinaten
// =============================================

export const frieslandMunicipalities = {
  Jever: { lat: 53.5746, lng: 7.9003 },
  Schortens: { lat: 53.5333, lng: 7.9500 },
  Varel: { lat: 53.3967, lng: 8.1367 },
  Wangerland: { lat: 53.6667, lng: 7.9167 },
  Zetel: { lat: 53.4167, lng: 7.9833 },
  Sande: { lat: 53.5000, lng: 8.0167 },
  Bockhorn: { lat: 53.4000, lng: 7.9667 },
};

// Landkreis Friesland Zentrum
export const FRIESLAND_CENTER = { lat: 53.50, lng: 7.98 };
export const FRIESLAND_BOUNDS = {
  north: 53.75,
  south: 53.35,
  east: 8.25,
  west: 7.75,
};

// =============================================
// ROUTE FARBEN
// =============================================

export const routeColors = [
  '#3498db', // Blau
  '#27ae60', // Grün
  '#9b59b6', // Lila
  '#e74c3c', // Rot
  '#f39c12', // Orange
  '#1abc9c', // Türkis
  '#e91e63', // Pink
  '#00bcd4', // Cyan
  '#8bc34a', // Hellgrün
  '#ff5722', // Deep Orange
];

export function getNextRouteColor(existingRoutes: TransportRoute[]): string {
  const usedColors = new Set(existingRoutes.map(r => r.color));
  return routeColors.find(c => !usedColors.has(c)) || routeColors[0];
}
