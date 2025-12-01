import { faker } from '@faker-js/faker/locale/de';
import {
  schools,
  cities,
  streetNames,
  companies,
  germanFirstNames,
  germanLastNames,
  classes,
} from './frieslandData';

// Helper: Zufälliges Element aus Array
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper: Zufällige Auswahl mehrerer Elemente
function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Helper: Datum generieren
function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

// Generiere einen Schüler
export function generateStudent(index: number) {
  const isMale = Math.random() > 0.5;
  const firstName = isMale
    ? randomElement(germanFirstNames.male)
    : randomElement(germanFirstNames.female);
  const lastName = randomElement(germanLastNames);

  const school = randomElement(schools);
  const city = cities.find(c => c.name === school.city) || randomElement(cities);
  const district = randomElement(city.districts);

  // 7,4% der Schüler benötigen Freistellungsverkehr (703 von 9487)
  const needsFreistellung = Math.random() < 0.074;

  // Barrierefreiheit: 2% Rollstuhl, 1% Begleitperson
  const accessibility = [];
  if (Math.random() < 0.02) {
    accessibility.push({
      type: 'rollstuhl' as const,
      description: randomElement([
        'Elektrischer Rollstuhl',
        'Manueller Rollstuhl',
        'Rollstuhl - Rampe erforderlich',
      ]),
    });
  }
  if (Math.random() < 0.01) {
    accessibility.push({
      type: 'begleitperson' as const,
      description: randomElement([
        'Schulbegleitung erforderlich',
        'Betreuung während der Fahrt notwendig',
        'Medizinische Begleitung',
      ]),
    });
  }

  // Dokumente: 60% haben Dokumente
  const documents = [];
  if (Math.random() < 0.6) {
    documents.push({
      id: `DOC-${String(index).padStart(5, '0')}-01`,
      type: 'antrag' as const,
      name: 'Beförderungsantrag_2024.pdf',
      uploadDate: randomDate(new Date('2024-08-01'), new Date('2024-09-15')),
      fileSize: Math.floor(Math.random() * 300000) + 100000,
      url: '/documents/beforderungsantrag_2024.pdf',
    });
  }
  if (Math.random() < 0.3 && accessibility.length > 0) {
    documents.push({
      id: `DOC-${String(index).padStart(5, '0')}-02`,
      type: 'attest' as const,
      name: 'Ärztliches_Attest.pdf',
      uploadDate: randomDate(new Date('2024-07-01'), new Date('2024-08-31')),
      fileSize: Math.floor(Math.random() * 500000) + 200000,
      url: '#',
    });
  }

  const dateOfBirth = randomDate(new Date('2008-01-01'), new Date('2018-12-31'));
  const createdAt = randomDate(new Date('2024-08-01'), new Date('2024-09-01'));

  return {
    id: `ST-${String(index + 1).padStart(5, '0')}`,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    dateOfBirth,
    address: {
      street: `${randomElement(streetNames)} ${Math.floor(Math.random() * 150) + 1}`,
      postalCode: randomElement(city.postalCodes),
      city: city.name,
    },
    school: school.name,
    class: randomElement(classes),
    schoolYear: '2024/2025',
    accessibility,
    transport: {
      type: needsFreistellung ? ('freistellung' as const) : ('oepnv' as const),
      route: needsFreistellung ? `Route ${Math.floor(Math.random() * 45) + 1}` : `Linie ${Math.floor(Math.random() * 500) + 100}`,
      pickupTime: needsFreistellung ? `0${Math.floor(Math.random() * 2) + 6}:${Math.floor(Math.random() * 6) * 10}` : undefined,
    },
    documents,
    legalGuardian: {
      name: `${randomElement([...germanFirstNames.male, ...germanFirstNames.female])} ${lastName}`,
      phone: `0${Math.floor(Math.random() * 5) + 4}${Math.floor(Math.random() * 5) + 4}${Math.floor(Math.random() * 5) + 1}${Math.floor(Math.random() * 10)}${' '}${Math.floor(Math.random() * 900000) + 100000}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.de`,
    },
    notes: Math.random() < 0.1 ? randomElement([
      'Allergien beachten',
      'Rücksprache mit Eltern vor Änderungen',
      'Besondere Betreuung erforderlich',
      'Geschwisterkind auf gleicher Route',
    ]) : undefined,
    createdAt,
    updatedAt: Math.random() < 0.2 ? randomDate(new Date(createdAt), new Date('2024-11-29')) : createdAt,
  };
}

// Generiere alle Schüler
export function generateAllStudents(count: number = 9487) {
  const students = [];
  for (let i = 0; i < count; i++) {
    students.push(generateStudent(i));
  }
  return students;
}

// Generiere Statistiken basierend auf generierten Schülern
export function calculateStatistics(students: ReturnType<typeof generateStudent>[]) {
  const total = students.length;
  const freistellung = students.filter(s => s.transport.type === 'freistellung').length;
  const oepnv = students.filter(s => s.transport.type === 'oepnv').length;
  const withAccessibility = students.filter(s => s.accessibility.length > 0).length;
  const withRollstuhl = students.filter(s => s.accessibility.some(a => a.type === 'rollstuhl')).length;

  // Schüler pro Schule
  const bySchool: { [key: string]: number } = {};
  students.forEach(s => {
    bySchool[s.school] = (bySchool[s.school] || 0) + 1;
  });

  // Schüler pro Stadt
  const byCity: { [key: string]: number } = {};
  students.forEach(s => {
    byCity[s.address.city] = (byCity[s.address.city] || 0) + 1;
  });

  return {
    total,
    freistellung,
    oepnv,
    freistellungPercentage: ((freistellung / total) * 100).toFixed(1),
    oepnvPercentage: ((oepnv / total) * 100).toFixed(1),
    withAccessibility,
    withRollstuhl,
    bySchool,
    byCity,
  };
}

// Generiere Anträge
export function generateApplications(count: number = 100) {
  const applications = [];
  const statuses: Array<'eingang' | 'pruefung-schulamt' | 'pruefung-befoerderung' | 'genehmigt' | 'abgelehnt'> = [
    'eingang', 'pruefung-schulamt', 'pruefung-befoerderung', 'genehmigt', 'abgelehnt'
  ];

  for (let i = 0; i < count; i++) {
    const student = generateStudent(i);
    const status = randomElement(statuses);
    const submittedDate = randomDate(new Date('2024-08-01'), new Date('2024-11-29'));

    applications.push({
      id: `ANT-${String(i + 1).padStart(5, '0')}`,
      studentName: student.name,
      school: student.school,
      address: `${student.address.street}, ${student.address.postalCode} ${student.address.city}`,
      distance: Math.round(Math.random() * 15 * 10) / 10 + 3, // 3-18 km
      status,
      submittedDate,
      autoChecked: Math.random() > 0.3,
      eligible: status !== 'abgelehnt',
      documents: student.documents.map(d => d.name),
      notes: Math.random() < 0.2 ? 'Prüfung Abstand zur Schule erforderlich' : undefined,
    });
  }

  return applications;
}

// Generiere Routen
export function generateRoutes(count: number = 45) {
  const routes = [];

  for (let i = 0; i < count; i++) {
    const company = randomElement(companies);
    const isOepnv = Math.random() > 0.3; // 30% Freistellung, 70% ÖPNV

    routes.push({
      id: `ROUTE-${String(i + 1).padStart(3, '0')}`,
      name: isOepnv ? `Linie ${100 + i}` : `Route ${i + 1}`,
      type: isOepnv ? ('oepnv' as const) : ('freistellung' as const),
      students: [], // Wird später befüllt
      totalKm: Math.floor(Math.random() * 50) + 10,
      costPerDay: Math.floor(Math.random() * 200) + 50,
      startTime: `0${Math.floor(Math.random() * 2) + 6}:${Math.floor(Math.random() * 6) * 10}`,
      arrivalTime: `0${Math.floor(Math.random() * 2) + 7}:${Math.floor(Math.random() * 6) * 10}`,
      company: company.name,
    });
  }

  return routes;
}

// Generiere kompakte Demo-Daten für schnelleres Laden
export function generateCompactDemoData() {
  // Nur 100 Schüler für die UI-Demo (vollständige 9487 würden die UI verlangsamen)
  const demoStudents = [];
  for (let i = 0; i < 100; i++) {
    demoStudents.push(generateStudent(i));
  }

  return {
    students: demoStudents,
    statistics: {
      total: 9487,
      freistellung: 703,
      oepnv: 8784,
      freistellungPercentage: '7.4',
      oepnvPercentage: '92.6',
      withAccessibility: 284,
      withRollstuhl: 189,
    },
  };
}
