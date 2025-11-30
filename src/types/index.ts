// View Types
export type ViewType = 'dashboard' | 'routes' | 'applications' | 'billing' | 'students' | 'contracts' | 'reports' | 'settings' | 'notifications';

// Application Status
export type ApplicationStatus = 'eingang' | 'pruefung-schulamt' | 'pruefung-befoerderung' | 'genehmigt' | 'abgelehnt';

// Billing Status
export type BillingStatus = 'bezahlt' | 'offen' | 'abweichung' | 'pruefung';

// Contract Status
export type ContractStatus = 'aktiv' | 'auslaufend' | 'beendet';

// Procurement Status
export type ProcurementStatus = 'vorbereitung' | 'ausschreibung' | 'pruefung' | 'vergeben' | 'abgeschlossen';

// Student Interface (Extended)
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Full name for backward compatibility
  dateOfBirth: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  school: string;
  class: string;
  schoolYear: string;
  accessibility: AccessibilityNeed[];
  transport: {
    type: 'oepnv' | 'freistellung';
    route?: string;
    stop?: string;
    pickupTime?: string;
  };
  documents: DocumentFile[];
  legalGuardian: {
    name: string;
    phone: string;
    email: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Accessibility Need Interface
export interface AccessibilityNeed {
  type: 'rollstuhl' | 'begleitperson' | 'sonstige';
  description?: string;
  medicalCertificate?: string;
}

// Document Interface
export interface DocumentFile {
  id: string;
  type: 'antrag' | 'genehmigung' | 'attest' | 'sonstige';
  name: string;
  uploadDate: string;
  fileSize: number;
  url: string;
}

// Application Interface
export interface Application {
  id: string;
  studentName: string;
  school: string;
  address: string;
  distance: number;
  status: ApplicationStatus;
  submittedDate: string;
  autoChecked: boolean;
  eligible: boolean;
  documents?: string[];
  notes?: string;
}

// Route Interface
export interface Route {
  id: string;
  name: string;
  type: 'freistellung' | 'oepnv';
  students: Student[];
  totalKm: number;
  costPerDay: number;
  startTime: string;
  arrivalTime: string;
  company: string;
}

// Billing Entry Interface
export interface BillingEntry {
  id: string;
  company: string;
  month: string;
  service: string;
  amount: number;
  status: BillingStatus;
  invoiceNumber?: string;
  plannedTrips?: number;
  actualTrips?: number;
}

// Warning Interface
export interface Warning {
  id: string | number;
  type: 'warning' | 'alert' | 'info';
  title: string;
  company: string;
  time: string;
  description: string;
}

// Metric Interface
export interface Metric {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'warning' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  showProgress?: boolean;
  progress?: number;
}

// Menu Item Interface
export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

// User Interface
export interface User {
  name: string;
  role: string;
  initials: string;
  avatar?: string;
}

// Company Interface
export interface Company {
  id: string;
  name: string;
  address: string;
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  qualifications: {
    iso27001: boolean;
    isoDate?: string;
    tariftreue: boolean;
    dsgvoAVV: boolean;
  };
  fleet: {
    buses: number;
    taxisStandard: number;
    taxisAccessible: number;
  };
  rating: number; // 1-5
  activeContracts: number;
  totalContractValue: number;
}

// Contract Interface
export interface Contract {
  id: string;
  company: string;
  type: 'rahmenvertrag' | 'einzelauftrag';
  routes: string[];
  startDate: string;
  endDate: string;
  cancellationPeriod: number; // Monate
  monthlyValue: number;
  annualKm: number;
  status: ContractStatus;
  documents: DocumentFile[];
  notes?: string;
}

// Procurement Process Interface
export interface ProcurementProcess {
  id: string;
  title: string;
  type: 'offen' | 'beschraenkt';
  status: ProcurementStatus;
  publishDate?: string;
  submissionDeadline?: string;
  estimatedValue: number;
  routes: string[];
  documents: DocumentFile[];
  bids: Bid[];
  createdAt: string;
}

// Bid Interface
export interface Bid {
  id: string;
  company: string;
  submittedDate: string;
  priceScore: number;
  qualityScore: number;
  presentationScore: number;
  totalScore: number;
  pricePerKm: number;
  annualCost: number;
  notes?: string;
}

// Report Interface
export interface Report {
  id: string;
  name: string;
  description: string;
  type: 'predefined' | 'custom';
  category: 'kosten' | 'schueler' | 'routen' | 'compliance';
  format: 'pdf' | 'excel' | 'csv';
  icon: React.ComponentType<{ className?: string }>;
  lastGenerated?: string;
}

// Chart Data Interface
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

// KPI Interface
export interface KPI {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon: React.ComponentType<{ className?: string }>;
}
