import { Student, Application, Route, BillingEntry, Warning } from '@/types';

// Current User
export const currentUser = {
  name: 'Stefanie Pflug',
  role: 'Sachbearbeiterin',
  initials: 'SP',
};

// Students on Route 12
export const routeStudents: Student[] = [
  { id: '1', name: 'Finn Behrens', school: 'Förderschule Jever', class: '7b', accessibility: ['Rollstuhl'] },
  { id: '2', name: 'Mia Hoffmann', school: 'Förderschule Jever', class: '5a', accessibility: ['Begleitperson'] },
  { id: '3', name: 'Luca Martens', school: 'Förderschule Jever', class: '8c', accessibility: [] },
  { id: '4', name: 'Emma Kruse', school: 'Förderschule Jever', class: '6a', accessibility: ['Rollstuhl', 'Begleitperson'] },
  { id: '5', name: 'Noah Gerdes', school: 'Förderschule Jever', class: '7b', accessibility: [] },
  { id: '6', name: 'Sophie Albers', school: 'Förderschule Jever', class: '9a', accessibility: ['Begleitperson'] },
];

// Applications
export const applications: Application[] = [
  { id: 'app-1', studentName: 'Marie Janssen', school: 'Gymnasium Jever', address: 'Mühlenstraße 12, Jever', distance: 5.8, status: 'eingang', submittedDate: '09.12.2024', autoChecked: true, eligible: true },
  { id: 'app-2', studentName: 'Paul Weber', school: 'IGS Friesland', address: 'Bahnhofstraße 45, Schortens', distance: 3.2, status: 'eingang', submittedDate: '09.12.2024', autoChecked: true, eligible: true },
  { id: 'app-3', studentName: 'Laura Meier', school: 'BBS Jever', address: 'Kirchweg 8, Wittmund', distance: 4.2, status: 'pruefung-schulamt', submittedDate: '08.12.2024', autoChecked: true, eligible: true },
  { id: 'app-4', studentName: 'Jonas Schmidt', school: 'Gymnasium Jever', address: 'Hauptstraße 23, Wilhelmshaven', distance: 12.4, status: 'pruefung-befoerderung', submittedDate: '07.12.2024', autoChecked: true, eligible: true },
  { id: 'app-5', studentName: 'Sarah Müller', school: 'Grundschule Varel', address: 'Am Park 5, Varel', distance: 1.8, status: 'pruefung-befoerderung', submittedDate: '06.12.2024', autoChecked: true, eligible: false },
  { id: 'app-6', studentName: 'Tim Berger', school: 'IGS Friesland', address: 'Lindenallee 17, Jever', distance: 6.1, status: 'genehmigt', submittedDate: '05.12.2024', autoChecked: true, eligible: true },
  { id: 'app-7', studentName: 'Anna Krause', school: 'BBS Jever', address: 'Schulstraße 3, Schortens', distance: 4.5, status: 'genehmigt', submittedDate: '04.12.2024', autoChecked: true, eligible: true },
  { id: 'app-8', studentName: 'Felix Bauer', school: 'Gymnasium Jever', address: 'Gartenweg 9, Jever', distance: 1.2, status: 'abgelehnt', submittedDate: '03.12.2024', autoChecked: true, eligible: false },
];

// Billing Data
export const billingData: BillingEntry[] = [
  { id: '1', company: 'Busunternehmen Janssen GmbH', month: 'November 2024', service: 'Linienverkehr Route 1-8', amount: 45680.00, status: 'bezahlt' },
  { id: '2', company: 'Taxi-Unternehmen Müller', month: 'November 2024', service: 'Spezialverkehr Route 12', amount: 12450.00, status: 'abweichung', plannedTrips: 235, actualTrips: 248 },
  { id: '3', company: 'Schülerbus Nord GmbH', month: 'November 2024', service: 'Freistellungsverkehr', amount: 28900.00, status: 'pruefung' },
  { id: '4', company: 'Reisedienst Friesland', month: 'November 2024', service: 'ÖPNV-Ergänzung', amount: 18750.00, status: 'offen' },
  { id: '5', company: 'Busunternehmen Janssen GmbH', month: 'Oktober 2024', service: 'Linienverkehr Route 1-8', amount: 44200.00, status: 'bezahlt' },
  { id: '6', company: 'Taxi-Unternehmen Müller', month: 'Oktober 2024', service: 'Spezialverkehr Route 12', amount: 11800.00, status: 'bezahlt' },
  { id: '7', company: 'Schülerbus Nord GmbH', month: 'Oktober 2024', service: 'Freistellungsverkehr', amount: 27650.00, status: 'bezahlt' },
];

// Warnings
export const warnings: Warning[] = [
  { 
    id: 1, 
    type: 'warning', 
    title: 'Verspätungsmeldung Route 4a',
    company: 'Taxi-Unternehmen Müller',
    time: 'vor 12 Min.',
    description: 'Geschätzte Ankunft 15 Minuten später als geplant'
  },
  { 
    id: 2, 
    type: 'info', 
    title: 'Vertrag läuft aus',
    company: 'Busunternehmen Janssen GmbH',
    time: 'in 14 Tagen',
    description: 'Vertragsverlängerung erforderlich bis 15.01.2025'
  },
  { 
    id: 3, 
    type: 'alert', 
    title: 'Fahrzeugausfall gemeldet',
    company: 'Schülerbus Nord',
    time: 'vor 45 Min.',
    description: 'Ersatzfahrzeug für Route 7b benötigt'
  },
];

// Recent Applications for Dashboard
export const recentApplications = [
  { name: 'Max Müller', school: 'Gymnasium Jever', date: '09.12.2024', status: 'pruefung' as const },
  { name: 'Lisa Schmidt', school: 'IGS Friesland', date: '09.12.2024', status: 'eingang' as const },
  { name: 'Tim Janssen', school: 'BBS Jever', date: '08.12.2024', status: 'genehmigt' as const },
  { name: 'Anna Peters', school: 'Grundschule Varel', date: '08.12.2024', status: 'abgelehnt' as const },
];

// Routes List
export const routes: Route[] = [
  {
    id: 'route-12',
    name: 'Route 12 - Jever Nord',
    type: 'freistellung',
    students: routeStudents,
    totalKm: 23.4,
    costPerDay: 142,
    startTime: '07:15',
    arrivalTime: '07:52',
    company: 'Taxi Müller'
  },
  {
    id: 'route-4a',
    name: 'Route 4a - Schortens Mitte',
    type: 'freistellung',
    students: [],
    totalKm: 18.2,
    costPerDay: 98,
    startTime: '07:00',
    arrivalTime: '07:35',
    company: 'Schülerbus Nord'
  },
  {
    id: 'route-7b',
    name: 'Route 7b - Varel Süd',
    type: 'oepnv',
    students: [],
    totalKm: 31.5,
    costPerDay: 45,
    startTime: '06:45',
    arrivalTime: '07:40',
    company: 'ÖPNV Weser-Ems'
  },
];

// Application Kanban Columns
export const applicationColumns = [
  { id: 'eingang', title: 'Eingang', color: 'blue' },
  { id: 'pruefung-schulamt', title: 'Prüfung Schulamt', color: 'amber' },
  { id: 'pruefung-befoerderung', title: 'Prüfung Beförderung', color: 'amber' },
  { id: 'genehmigt', title: 'Genehmigt', color: 'emerald' },
  { id: 'abgelehnt', title: 'Abgelehnt', color: 'red' },
];
