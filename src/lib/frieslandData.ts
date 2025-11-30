// Friesland-spezifische Stammdaten für realistische Demo-Daten

export const schools = [
  { name: 'Mariengymnasium Jever', type: 'gymnasium', city: 'Jever', students: 1243 },
  { name: 'IGS Friesland Nord', type: 'gesamtschule', city: 'Schortens', students: 1520 },
  { name: 'Oberschule Varel', type: 'oberschule', city: 'Varel', students: 842 },
  { name: 'Grundschule Schortens', type: 'grundschule', city: 'Schortens', students: 685 },
  { name: 'Realschule Jever', type: 'realschule', city: 'Jever', students: 756 },
  { name: 'Lothar-Meyer-Gymnasium Varel', type: 'gymnasium', city: 'Varel', students: 894 },
  { name: 'Oberschule Hohenkirchen', type: 'oberschule', city: 'Wangerland', students: 423 },
  { name: 'Grundschule Wangerland', type: 'grundschule', city: 'Wangerland', students: 312 },
  { name: 'Förderschule Jever', type: 'foerderschule', city: 'Jever', students: 156 },
  { name: 'Grundschule Jever', type: 'grundschule', city: 'Jever', students: 478 },
  { name: 'BBS Varel', type: 'berufsschule', city: 'Varel', students: 654 },
  { name: 'Oberschule Zetel', type: 'oberschule', city: 'Zetel', students: 387 },
  { name: 'Grundschule Zetel', type: 'grundschule', city: 'Zetel', students: 245 },
  { name: 'Grundschule Sande', type: 'grundschule', city: 'Sande', students: 398 },
  { name: 'Oberschule Sande', type: 'oberschule', city: 'Sande', students: 512 },
  { name: 'Paul-Sillus-Gymnasium Schortens', type: 'gymnasium', city: 'Schortens', students: 982 },
];

export const cities = [
  {
    name: 'Jever',
    postalCodes: ['26441', '26442'],
    population: 14000,
    districts: ['Altstadt', 'Rahrdum', 'Moorwarfen', 'Cleverns']
  },
  {
    name: 'Schortens',
    postalCodes: ['26419'],
    population: 21000,
    districts: ['Schortens', 'Heidmühle', 'Grafschaft', 'Accum']
  },
  {
    name: 'Varel',
    postalCodes: ['26316'],
    population: 24000,
    districts: ['Varel', 'Büppel', 'Dangast', 'Altjührden']
  },
  {
    name: 'Wangerland',
    postalCodes: ['26434', '26409'],
    population: 9500,
    districts: ['Hohenkirchen', 'Hooksiel', 'Horumersiel', 'Minsen']
  },
  {
    name: 'Zetel',
    postalCodes: ['26340'],
    population: 12000,
    districts: ['Zetel', 'Neuenburg', 'Bohlenbergerfeld', 'Astederfeld']
  },
  {
    name: 'Sande',
    postalCodes: ['26452'],
    population: 8000,
    districts: ['Sande', 'Neustadtgödens', 'Cäciliengroden', 'Dykhausen']
  },
  {
    name: 'Bockhorn',
    postalCodes: ['26345'],
    population: 9000,
    districts: ['Bockhorn', 'Steinhausen', 'Grabstede', 'Bredehorn']
  },
];

export const streetNames = [
  // Jever
  'Mühlenstraße', 'Schulstraße', 'Kirchstraße', 'Bahnhofstraße', 'Lindenallee',
  'Am Markt', 'Wittmunder Straße', 'Cleverner Straße', 'Moorwarfer Kirchweg',
  // Schortens
  'Menkestraße', 'Schortenserstraße', 'Accumer Straße', 'Plaggestraße',
  // Varel
  'Oldenburger Straße', 'Hafenstraße', 'Drostenweg', 'Bürgermeister-Heidenreich-Straße',
  // Allgemein
  'Hauptstraße', 'Dorfstraße', 'Birkenweg', 'Eichenweg', 'Buchenweg', 'Tannenweg',
  'Rosenstraße', 'Tulpenweg', 'Nelkenweg', 'Am Sportplatz', 'Am Wald',
  'Gartenstraße', 'Feldweg', 'Wiesenweg', 'Zum Moor', 'Deichweg',
];

export const companies = [
  {
    name: 'Taxi-Unternehmen Müller GmbH',
    city: 'Jever',
    fleet: { buses: 0, taxisStandard: 8, taxisAccessible: 2 },
  },
  {
    name: 'Busverkehr Friesland AG',
    city: 'Schortens',
    fleet: { buses: 12, taxisStandard: 0, taxisAccessible: 0 },
  },
  {
    name: 'Schülertransport Schmidt',
    city: 'Varel',
    fleet: { buses: 3, taxisStandard: 5, taxisAccessible: 1 },
  },
  {
    name: 'Fahrdienst Weber & Sohn',
    city: 'Zetel',
    fleet: { buses: 2, taxisStandard: 4, taxisAccessible: 1 },
  },
  {
    name: 'VBN Verkehrsbetriebe',
    city: 'Schortens',
    fleet: { buses: 15, taxisStandard: 0, taxisAccessible: 0 },
  },
  {
    name: 'Taxi Friesland Express',
    city: 'Jever',
    fleet: { buses: 0, taxisStandard: 6, taxisAccessible: 1 },
  },
  {
    name: 'Küstenbus GmbH',
    city: 'Wangerland',
    fleet: { buses: 8, taxisStandard: 0, taxisAccessible: 0 },
  },
  {
    name: 'Schulbus Meyer',
    city: 'Sande',
    fleet: { buses: 4, taxisStandard: 3, taxisAccessible: 1 },
  },
  {
    name: 'Beförderung Janssen',
    city: 'Bockhorn',
    fleet: { buses: 2, taxisStandard: 4, taxisAccessible: 0 },
  },
  {
    name: 'Taxi Nordsee',
    city: 'Varel',
    fleet: { buses: 0, taxisStandard: 7, taxisAccessible: 2 },
  },
  {
    name: 'Regionalverkehr Friesland',
    city: 'Jever',
    fleet: { buses: 10, taxisStandard: 0, taxisAccessible: 0 },
  },
  {
    name: 'Fahrdienst Petersen',
    city: 'Wangerland',
    fleet: { buses: 1, taxisStandard: 5, taxisAccessible: 1 },
  },
];

export const germanFirstNames = {
  male: [
    'Leon', 'Lukas', 'Ben', 'Jonas', 'Noah', 'Finn', 'Elias', 'Luis', 'Paul', 'Felix',
    'Max', 'Luca', 'Tim', 'Jan', 'Tom', 'Niklas', 'Erik', 'Moritz', 'David', 'Alexander',
    'Simon', 'Maximilian', 'Julian', 'Philipp', 'Fabian', 'Tobias', 'Daniel', 'Marcel',
  ],
  female: [
    'Emma', 'Mia', 'Hannah', 'Sophia', 'Anna', 'Lena', 'Leonie', 'Lea', 'Marie', 'Emily',
    'Lara', 'Sophie', 'Clara', 'Johanna', 'Laura', 'Charlotte', 'Sarah', 'Julia', 'Lisa',
    'Amelie', 'Nele', 'Ida', 'Maja', 'Frieda', 'Paula', 'Greta', 'Luisa', 'Mathilda',
  ],
};

export const germanLastNames = [
  'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker',
  'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf',
  'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krüger', 'Hofmann',
  'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier', 'Lehmann',
  'Köhler', 'Herrmann', 'König', 'Walter', 'Mayer', 'Huber', 'Kaiser', 'Fuchs',
  'Peters', 'Lang', 'Scholz', 'Möller', 'Weiß', 'Jung', 'Hahn', 'Vogel', 'Friedrich',
  'Keller', 'Günther', 'Frank', 'Berger', 'Winkler', 'Roth', 'Beck', 'Baumann',
  'Kraus', 'Böhm', 'Simon', 'Franke', 'Albrecht', 'Schuster', 'Ludwig', 'Böhme',
  // Norddeutsche Namen
  'Hansen', 'Jensen', 'Petersen', 'Nielsen', 'Claussen', 'Janssen', 'Lüdemann',
  'Bruns', 'Gerdes', 'Oltmann', 'Dirks', 'Ennen', 'Freese', 'Greve', 'Harms',
];

export const classes = [
  '1a', '1b', '1c', '2a', '2b', '2c', '3a', '3b', '3c', '4a', '4b', '4c',
  '5a', '5b', '5c', '6a', '6b', '6c', '7a', '7b', '7c', '8a', '8b', '8c',
  '9a', '9b', '9c', '10a', '10b', '10c', '11a', '11b', '12a', '12b', '13a', '13b',
];
