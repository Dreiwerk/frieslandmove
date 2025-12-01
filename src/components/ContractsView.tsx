'use client';

import React, { useState } from 'react';
import {
  FileSignature,
  Building2,
  Calendar,
  Euro,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  Download,
  Search,
  Filter,
  Star,
  TrendingUp,
  FileText,
  Shield,
  Truck,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import Toast from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';

// Types
type ProcurementStatus = 'vorbereitung' | 'ausschreibung' | 'pruefung' | 'vergeben';
type ProcurementType = 'offen' | 'beschraenkt';

interface Bid {
  id: string;
  company: string;
  submittedDate: string;
  priceScore: number;
  qualityScore: number;
  presentationScore: number;
  totalScore: number;
  pricePerKm: number;
  annualCost: number;
}

interface Procurement {
  id: string;
  title: string;
  type: ProcurementType;
  status: ProcurementStatus;
  estimatedValue: number;
  routes: string[];
  documents: string[];
  bids: Bid[];
  createdAt: string;
  publishDate?: string;
  submissionDeadline?: string;
}

// Mock data
const mockCompanies = [
  {
    id: 'C001',
    name: 'Taxi-Unternehmen Müller GmbH',
    address: 'Hauptstraße 42, 26441 Jever',
    contact: { name: 'Hans Müller', phone: '04461 987654', email: 'info@taxi-mueller.de' },
    qualifications: { iso27001: true, isoDate: '2023-06-15', tariftreue: true, dsgvoAVV: true },
    fleet: { buses: 0, taxisStandard: 8, taxisAccessible: 2 },
    rating: 4.5,
    activeContracts: 3,
    totalContractValue: 145000,
  },
  {
    id: 'C002',
    name: 'Busverkehr Friesland AG',
    address: 'Industrieweg 15, 26419 Schortens',
    contact: { name: 'Petra Schmidt', phone: '04421 556677', email: 'kontakt@busverkehr-friesland.de' },
    qualifications: { iso27001: true, isoDate: '2022-11-20', tariftreue: true, dsgvoAVV: true },
    fleet: { buses: 12, taxisStandard: 0, taxisAccessible: 0 },
    rating: 4.8,
    activeContracts: 5,
    totalContractValue: 320000,
  },
  {
    id: 'C003',
    name: 'Schülertransport Schmidt',
    address: 'Dorfstraße 8, 26316 Varel',
    contact: { name: 'Thomas Schmidt', phone: '04451 123789', email: 'info@schmidt-transport.de' },
    qualifications: { iso27001: false, tariftreue: true, dsgvoAVV: true },
    fleet: { buses: 3, taxisStandard: 5, taxisAccessible: 1 },
    rating: 4.2,
    activeContracts: 2,
    totalContractValue: 98000,
  },
];

const mockContracts = [
  {
    id: 'VTR-2024-001',
    company: 'Taxi-Unternehmen Müller GmbH',
    type: 'rahmenvertrag' as const,
    routes: ['Route 12', 'Route 7b', 'Route 18'],
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    cancellationPeriod: 6,
    monthlyValue: 4200,
    annualKm: 12500,
    status: 'aktiv' as const,
    documents: [],
  },
  {
    id: 'VTR-2024-002',
    company: 'Busverkehr Friesland AG',
    type: 'rahmenvertrag' as const,
    routes: ['Route 1', 'Route 2', 'Route 3', 'Route 4', 'Route 5'],
    startDate: '2023-08-01',
    endDate: '2024-07-31',
    cancellationPeriod: 12,
    monthlyValue: 12800,
    annualKm: 48000,
    status: 'auslaufend' as const,
    documents: [],
  },
  {
    id: 'VTR-2023-015',
    company: 'Schülertransport Schmidt',
    type: 'einzelauftrag' as const,
    routes: ['Route 9', 'Route 14'],
    startDate: '2023-09-01',
    endDate: '2024-07-31',
    cancellationPeriod: 3,
    monthlyValue: 2800,
    annualKm: 8200,
    status: 'auslaufend' as const,
    documents: [],
  },
];

const mockProcurements: Procurement[] = [
  {
    id: 'VERG-2025-001',
    title: 'Schülerbeförderung Schuljahr 2025/2026 - Freistellungsverkehr Nord',
    type: 'offen',
    status: 'vorbereitung',
    estimatedValue: 185000,
    routes: ['Route 1-15'],
    documents: [],
    bids: [],
    createdAt: '2024-11-01',
  },
  {
    id: 'VERG-2024-003',
    title: 'Barrierefreie Beförderung - Sonderfahrten',
    type: 'beschraenkt',
    status: 'ausschreibung',
    publishDate: '2024-11-15',
    submissionDeadline: '2024-12-15',
    estimatedValue: 95000,
    routes: ['Sonderrouten'],
    documents: [],
    bids: [
      {
        id: 'BID-001',
        company: 'Taxi-Unternehmen Müller GmbH',
        submittedDate: '2024-12-01',
        priceScore: 85,
        qualityScore: 90,
        presentationScore: 88,
        totalScore: 87.5,
        pricePerKm: 2.45,
        annualCost: 92000,
      },
    ],
    createdAt: '2024-10-20',
  },
];

export default function ContractsView() {
  const [activeTab, setActiveTab] = useState<'contracts' | 'procurement' | 'companies'>('contracts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContract, setSelectedContract] = useState<typeof mockContracts[0] | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isNewProcurementModalOpen, setIsNewProcurementModalOpen] = useState(false);

  const expiringContracts = mockContracts.filter(c => c.status === 'auslaufend');

  const handleNewProcurement = () => {
    setIsNewProcurementModalOpen(true);
  };

  const handleCheckExpiringContracts = () => {
    setActiveTab('contracts');
    setToast({ message: 'Auslaufende Verträge werden angezeigt...', type: 'info' });
  };

  const handleCreateProcurementDocs = () => {
    setToast({ message: 'Vergabeunterlagen werden erstellt...', type: 'info' });
    setTimeout(() => {
      setToast({ message: 'Vergabeunterlagen erfolgreich erstellt!', type: 'success' });
    }, 2000);
  };

  const handleSaveNewProcurement = () => {
    setToast({ message: 'Vergabeverfahren wird gespeichert...', type: 'info' });
    setTimeout(() => {
      setIsNewProcurementModalOpen(false);
      setToast({ message: 'Vergabeverfahren erfolgreich erstellt!', type: 'success' });
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Vergabe & Verträge</h2>
            <p className="text-sm text-gray-500 mt-1">Verwaltung von Verträgen, Vergabeverfahren und Unternehmen</p>
          </div>
          <button
            onClick={handleNewProcurement}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-600/20"
          >
            <Plus className="w-4 h-4" />
            Neues Vergabeverfahren
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('contracts');
              setSelectedContract(null);
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'contracts'
                ? 'bg-cyan-50 text-cyan-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Verträge
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('procurement');
              setSelectedContract(null);
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'procurement'
                ? 'bg-cyan-50 text-cyan-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Vergabeverfahren
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('companies');
              setSelectedContract(null);
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'companies'
                ? 'bg-cyan-50 text-cyan-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Unternehmen
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      {expiringContracts.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                {expiringContracts.length} Vertrag{expiringContracts.length > 1 ? 'e' : ''} laufen in den nächsten 6 Monaten aus
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Bitte rechtzeitig Neuausschreibung vorbereiten
              </p>
            </div>
            <button
              onClick={handleCheckExpiringContracts}
              className="text-sm font-medium text-amber-700 hover:text-amber-900 underline"
            >
              Jetzt prüfen
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-5">
        {/* Contracts Tab */}
        {activeTab === 'contracts' && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Aktive Verträge</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {mockContracts.filter(c => c.status === 'aktiv').length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Auslaufend</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{expiringContracts.length}</p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Gesamtwert/Monat</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {(mockContracts.reduce((sum, c) => sum + c.monthlyValue, 0) / 1000).toFixed(1)}k€
                    </p>
                  </div>
                  <div className="p-3 bg-cyan-100 rounded-lg">
                    <Euro className="w-6 h-6 text-cyan-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Partner</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{mockCompanies.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Contracts List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Suche nach Vertrag, Unternehmen oder Route..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-sm"
                />
                <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vertragsnummer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Unternehmen</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Typ</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Laufzeit</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Wert/Monat</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockContracts.map((contract) => (
                      <tr
                        key={contract.id}
                        onClick={() => setSelectedContract(contract)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{contract.id}</div>
                          <div className="text-xs text-gray-500">{contract.routes.length} Route(n)</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{contract.company}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {contract.type === 'rahmenvertrag' ? 'Rahmenvertrag' : 'Einzelauftrag'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900">
                            {new Date(contract.startDate).toLocaleDateString('de-DE')} - {new Date(contract.endDate).toLocaleDateString('de-DE')}
                          </div>
                          <div className="text-xs text-gray-500">Kündigungsfrist: {contract.cancellationPeriod} Monate</div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {contract.monthlyValue.toLocaleString('de-DE')} €
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            contract.status === 'aktiv'
                              ? 'bg-green-100 text-green-700'
                              : contract.status === 'auslaufend'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {contract.status === 'aktiv' && <CheckCircle className="w-3 h-3" />}
                            {contract.status === 'auslaufend' && <AlertCircle className="w-3 h-3" />}
                            {contract.status === 'aktiv' ? 'Aktiv' : contract.status === 'auslaufend' ? 'Auslaufend' : 'Beendet'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Procurement Tab */}
        {activeTab === 'procurement' && (
          <div className="space-y-4">
            {mockProcurements.map((proc) => (
              <div key={proc.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{proc.title}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        proc.status === 'vorbereitung'
                          ? 'bg-gray-100 text-gray-700'
                          : proc.status === 'ausschreibung'
                          ? 'bg-blue-100 text-blue-700'
                          : proc.status === 'pruefung'
                          ? 'bg-amber-100 text-amber-700'
                          : proc.status === 'vergeben'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {proc.status === 'vorbereitung' && <Clock className="w-3 h-3 mr-1" />}
                        {proc.status.charAt(0).toUpperCase() + proc.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{proc.id} • {proc.type === 'offen' ? 'Offenes Verfahren' : 'Beschränktes Verfahren'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Geschätzter Wert</p>
                    <p className="text-xl font-bold text-gray-900">{(proc.estimatedValue / 1000).toFixed(0)}k €</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Veröffentlichung</p>
                    <p className="text-sm font-medium text-gray-900">
                      {proc.publishDate ? new Date(proc.publishDate).toLocaleDateString('de-DE') : 'In Vorbereitung'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Angebotsfrist</p>
                    <p className="text-sm font-medium text-gray-900">
                      {proc.submissionDeadline ? new Date(proc.submissionDeadline).toLocaleDateString('de-DE') : '-'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Eingegangene Angebote</p>
                    <p className="text-sm font-medium text-gray-900">{proc.bids.length} Angebot(e)</p>
                  </div>
                </div>

                {proc.bids.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Angebotsbewertung</h4>
                    <div className="space-y-2">
                      {proc.bids.map((bid) => (
                        <div key={bid.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{bid.company}</span>
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              <span className="text-sm font-bold text-gray-900">{bid.totalScore} Punkte</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-3 text-xs">
                            <div>
                              <span className="text-gray-500">Preis (30%):</span>
                              <span className="ml-1 font-medium text-gray-900">{bid.priceScore}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Qualität (50%):</span>
                              <span className="ml-1 font-medium text-gray-900">{bid.qualityScore}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Präsentation (20%):</span>
                              <span className="ml-1 font-medium text-gray-900">{bid.presentationScore}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Jahreskosten:</span>
                              <span className="ml-1 font-medium text-gray-900">{(bid.annualCost / 1000).toFixed(0)}k €</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={handleCreateProcurementDocs}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    Vergabeunterlagen erstellen
                  </button>
                  <button
                    onClick={() => setToast({ message: 'Details werden geladen...', type: 'info' })}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                  >
                    Details anzeigen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockCompanies.map((company) => (
              <div key={company.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-cyan-100 rounded-lg">
                      <Building2 className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{company.name}</h3>
                      <p className="text-sm text-gray-500">{company.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium text-gray-900">{company.rating}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{company.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{company.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{company.contact.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-500">Fuhrpark</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {company.fleet.buses > 0 && `${company.fleet.buses} Busse`}
                      {company.fleet.buses > 0 && company.fleet.taxisStandard > 0 && ', '}
                      {company.fleet.taxisStandard > 0 && `${company.fleet.taxisStandard} Taxis`}
                    </div>
                    {company.fleet.taxisAccessible > 0 && (
                      <div className="text-xs text-gray-500">+ {company.fleet.taxisAccessible} barrierefrei</div>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-500">Verträge</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{company.activeContracts} aktiv</div>
                    <div className="text-xs text-gray-500">{(company.totalContractValue / 1000).toFixed(0)}k € Volumen</div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {company.qualifications.iso27001 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <Shield className="w-3 h-3" />
                        ISO 27001
                      </span>
                    )}
                    {company.qualifications.tariftreue && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Tariftreue
                      </span>
                    )}
                    {company.qualifications.dsgvoAVV && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        <Shield className="w-3 h-3" />
                        DSGVO-AVV
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Procurement Modal */}
      <Modal
        isOpen={isNewProcurementModalOpen}
        onClose={() => setIsNewProcurementModalOpen(false)}
        title="Neues Vergabeverfahren erstellen"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setIsNewProcurementModalOpen(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSaveNewProcurement}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-600/20"
            >
              Vergabeverfahren erstellen
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bezeichnung *</label>
            <input
              type="text"
              placeholder="z.B. Schülerbeförderung Jever-Nord"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vergabeart *</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="">Bitte wählen...</option>
                <option>Öffentliche Ausschreibung</option>
                <option>Beschränkte Ausschreibung</option>
                <option>Verhandlungsvergabe</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Geschätzter Wert *</label>
              <input
                type="number"
                placeholder="0,00"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vertragsbeginn</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vertragslaufzeit</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option>1 Jahr</option>
                <option>2 Jahre</option>
                <option>3 Jahre</option>
                <option>4 Jahre</option>
                <option>5 Jahre</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
            <textarea
              rows={3}
              placeholder="Beschreiben Sie das Vergabeverfahren..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            ></textarea>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Hinweis zur Vergabe</p>
              <p className="text-xs mt-1">Nach Anlage werden automatisch die erforderlichen Vergabeunterlagen erstellt und Fristen berechnet.</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
