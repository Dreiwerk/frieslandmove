'use client';

import React, { useState } from 'react';
import {
  Building2,
  Euro,
  Clock,
  AlertCircle,
  RefreshCw,
  FileDown,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Eye,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { billingData } from '@/lib/data';
import { BillingEntry, BillingStatus } from '@/types';
import Toast from '@/components/ui/Toast';

export default function BillingView() {
  const [filter, setFilter] = useState<'all' | 'offen' | 'abweichung'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<BillingEntry[]>(billingData);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const filteredData = data.filter(entry => {
    const matchesFilter = filter === 'all' || 
      (filter === 'offen' && (entry.status === 'offen' || entry.status === 'pruefung')) ||
      (filter === 'abweichung' && entry.status === 'abweichung');
    const matchesSearch = entry.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: BillingStatus) => {
    const config = {
      bezahlt: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2, label: 'Bezahlt' },
      offen: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Clock, label: 'Offen' },
      abweichung: { bg: 'bg-red-50', text: 'text-red-700', icon: AlertCircle, label: 'Abweichung erkannt' },
      pruefung: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock, label: 'In Prüfung' },
    };
    const { bg, text, icon: Icon, label } = config[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const handleApprove = (id: string) => {
    setData(prev => prev.map(entry =>
      entry.id === id ? { ...entry, status: 'bezahlt' as BillingStatus } : entry
    ));
    setToast({ message: 'Rechnung freigegeben und als bezahlt markiert', type: 'success' });
  };

  const handleRefresh = () => {
    setToast({ message: 'Daten werden aktualisiert...', type: 'info' });
    setTimeout(() => {
      setToast({ message: 'Abrechnungsdaten erfolgreich aktualisiert!', type: 'success' });
    }, 1500);
  };

  const handleExportAccounting = () => {
    setToast({ message: 'Export für Finanzbuchhaltung wird erstellt...', type: 'info' });
    setTimeout(() => {
      setToast({ message: 'DATEV-Export erfolgreich erstellt!', type: 'success' });
    }, 2000);
  };

  const handleCreateCredit = () => {
    setToast({ message: 'Gutschrift-Formular wird geöffnet...', type: 'info' });
    // In einer echten App würde hier ein Modal geöffnet werden
  };

  const handleViewDetails = (company: string) => {
    setToast({ message: `Details für ${company} werden geladen...`, type: 'info' });
    // In einer echten App würde hier ein Modal mit Details geöffnet werden
  };

  const handleCheckDiscrepancy = (company: string) => {
    setToast({ message: `Abweichungsprüfung für ${company} wird geöffnet...`, type: 'info' });
    // In einer echten App würde hier eine detaillierte Prüfansicht geöffnet werden
  };

  const handleContactCompany = () => {
    setToast({ message: 'E-Mail-Formular wird geöffnet...', type: 'info' });
    // In einer echten App würde hier ein E-Mail-Dialog geöffnet werden
  };

  // Calculate summary statistics
  const paidAmount = data
    .filter(e => e.status === 'bezahlt' && e.month === 'November 2024')
    .reduce((sum, e) => sum + e.amount, 0);
  const openAmount = data
    .filter(e => (e.status === 'offen' || e.status === 'pruefung') && e.month === 'November 2024')
    .reduce((sum, e) => sum + e.amount, 0);
  const discrepancyCount = data.filter(e => e.status === 'abweichung').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Abrechnung & Unternehmerportal</h2>
          <p className="text-sm text-gray-500 mt-1">Verwaltung der Beförderungsleistungen und Rechnungsstellung</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Aktualisieren
          </button>
          <button
            onClick={handleExportAccounting}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export für Finanzbuchhaltung
          </button>
          <button
            onClick={handleCreateCredit}
            className="px-4 py-2 bg-cyan-600 rounded-lg text-sm font-medium text-white hover:bg-cyan-700 transition-colors flex items-center gap-2 shadow-lg shadow-cyan-600/20"
          >
            <Plus className="w-4 h-4" />
            Gutschrift erstellen
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:shadow-gray-100 transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Aktive Unternehmen</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">12</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:shadow-gray-100 transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <Euro className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-gray-500">Bezahlt (Nov)</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">€{paidAmount.toLocaleString('de-DE')}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:shadow-gray-100 transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-amber-50 rounded-xl">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">Offene Posten</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">€{openAmount.toLocaleString('de-DE')}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:shadow-gray-100 transition-all cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-red-50 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Abweichungen</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{discrepancyCount}</p>
        </div>
      </div>

      {/* Billing Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Abrechnungsübersicht</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === 'all' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Alle
              </button>
              <button 
                onClick={() => setFilter('offen')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === 'offen' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Offen
              </button>
              <button 
                onClick={() => setFilter('abweichung')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === 'abweichung' ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                Abweichungen
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Unternehmen suchen..."
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unternehmen</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monat</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Leistung</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Betrag</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((entry) => (
                <tr 
                  key={entry.id} 
                  className={`hover:bg-gray-50 transition-colors ${
                    entry.status === 'abweichung' ? 'bg-red-50/50' : ''
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="font-medium text-gray-900">{entry.company}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {entry.month}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{entry.service}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-semibold text-gray-900">
                      €{entry.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {getStatusBadge(entry.status)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewDetails(entry.company)}
                        className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                        title="Details anzeigen"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {entry.status === 'abweichung' && (
                        <button
                          onClick={() => handleCheckDiscrepancy(entry.company)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Abweichung prüfen"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                      )}
                      {(entry.status === 'offen' || entry.status === 'pruefung') && (
                        <button
                          onClick={() => handleApprove(entry.id)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Freigeben"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">Zeige 1-{filteredData.length} von {data.length} Einträgen</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
              Zurück
            </button>
            <button className="px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-lg text-sm font-medium">
              1
            </button>
            <button className="px-3 py-1.5 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
              3
            </button>
            <button className="px-3 py-1.5 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
              Weiter
            </button>
          </div>
        </div>
      </div>

      {/* Discrepancy Alert */}
      {discrepancyCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-900">Abweichung erkannt: Taxi-Unternehmen Müller</h4>
              <p className="text-sm text-red-700 mt-1">
                Die gemeldeten Fahrten (248) weichen von den geplanten Fahrten (235) ab. 
                Differenz: 13 zusätzliche Fahrten (+€650,00). Bitte prüfen Sie die Abweichung.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => handleCheckDiscrepancy('Taxi-Unternehmen Müller')}
                  className="px-4 py-2 bg-red-600 rounded-lg text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  Abweichung prüfen
                </button>
                <button
                  onClick={handleContactCompany}
                  className="px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                >
                  Unternehmen kontaktieren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
