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
import Modal from '@/components/ui/Modal';

export default function BillingView() {
  const [filter, setFilter] = useState<'all' | 'offen' | 'abweichung'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<BillingEntry[]>(billingData);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [detailEntry, setDetailEntry] = useState<BillingEntry | null>(null);
  const [discrepancyEntry, setDiscrepancyEntry] = useState<BillingEntry | null>(null);
  const [creditForm, setCreditForm] = useState({
    company: billingData[0]?.company || '',
    month: billingData[0]?.month || '',
    amount: '',
    reason: '',
  });
  const [discrepancyForm, setDiscrepancyForm] = useState({
    note: '',
    correctedAmount: '',
    reason: 'Mehrfahrten',
  });

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
    const headers = ['Unternehmen', 'Monat', 'Leistung', 'Betrag', 'Status'];
    const rows = data.map((entry) => [
      `"${entry.company}"`,
      `"${entry.month}"`,
      `"${entry.service}"`,
      entry.amount.toFixed(2).replace('.', ','),
      entry.status,
    ]);
    const csv = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `abrechnung_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast({ message: 'Export erstellt (CSV für FiBu)', type: 'success' });
  };

  const handleCreateCredit = () => {
    setShowCreditModal(true);
  };

  const handleViewDetails = (entry: BillingEntry) => {
    setDetailEntry(entry);
  };

  const handleCheckDiscrepancy = (company: string) => {
    const entry = data.find((e) => e.company === company && e.status === 'abweichung');
    if (entry) {
      setDiscrepancyEntry(entry);
      setDiscrepancyForm({ note: '', correctedAmount: '', reason: 'Mehrfahrten' });
    } else {
      setToast({ message: 'Keine Abweichung zu diesem Unternehmen gefunden.', type: 'info' });
    }
  };

  const handleContactCompany = () => {
    setToast({ message: 'E-Mail-Formular wird geöffnet...', type: 'info' });
    // In einer echten App würde hier ein E-Mail-Dialog geöffnet werden
  };

  const handleSaveCredit = () => {
    if (!creditForm.company || !creditForm.amount) {
      setToast({ message: 'Bitte Unternehmen und Betrag ausfüllen', type: 'error' });
      return;
    }
    const parsedAmount = parseFloat(creditForm.amount.replace(',', '.'));
    if (Number.isNaN(parsedAmount)) {
      setToast({ message: 'Betrag ist ungültig', type: 'error' });
      return;
    }

    const newCredit: BillingEntry = {
      id: `CR-${Date.now()}`,
      company: creditForm.company,
      month: creditForm.month || 'Aktueller Monat',
      service: creditForm.reason ? `Gutschrift – ${creditForm.reason}` : 'Gutschrift',
      amount: -Math.abs(parsedAmount),
      status: 'bezahlt',
    };

    setData((prev) => [newCredit, ...prev]);
    setToast({ message: `Gutschrift über ${parsedAmount.toFixed(2)} € erfasst`, type: 'success' });
    setShowCreditModal(false);
    setCreditForm({
      company: billingData[0]?.company || '',
      month: billingData[0]?.month || '',
      amount: '',
      reason: '',
    });
  };

  const handleSaveDiscrepancy = () => {
    if (!discrepancyEntry) return;
    const corrected = discrepancyForm.correctedAmount
      ? parseFloat(discrepancyForm.correctedAmount.replace(',', '.'))
      : null;
    if (discrepancyForm.correctedAmount && Number.isNaN(corrected)) {
      setToast({ message: 'Korrekturbetrag ist ungültig', type: 'error' });
      return;
    }
    setData((prev) =>
      prev.map((e) =>
        e.id === discrepancyEntry.id
          ? {
              ...e,
              amount: corrected !== null ? corrected : e.amount,
              status: 'pruefung',
              service: discrepancyForm.reason ? `${e.service} (${discrepancyForm.reason})` : e.service,
            }
          : e
      )
    );
    setToast({ message: 'Abweichung in Prüfung übernommen', type: 'success' });
    setDiscrepancyEntry(null);
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
    <div className="p-3 md:p-6 space-y-6">
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
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        onClick={() => handleViewDetails(entry)}
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

      {/* Credit Modal */}
      <Modal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        title="Gutschrift erstellen"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setShowCreditModal(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSaveCredit}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-600/20"
            >
              Speichern
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unternehmen</label>
            <input
              value={creditForm.company}
              onChange={(e) => setCreditForm({ ...creditForm, company: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monat</label>
            <input
              value={creditForm.month}
              onChange={(e) => setCreditForm({ ...creditForm, month: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Betrag (€)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={creditForm.amount}
              onChange={(e) => setCreditForm({ ...creditForm, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grund</label>
            <textarea
              value={creditForm.reason}
              onChange={(e) => setCreditForm({ ...creditForm, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              rows={3}
              placeholder="z.B. Abweichung korrigieren"
            />
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

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailEntry}
        onClose={() => setDetailEntry(null)}
        title="Abrechnungsdetails"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setDetailEntry(null)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Schließen
            </button>
          </div>
        }
      >
        {detailEntry && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{detailEntry.month}</p>
                <p className="text-lg font-semibold text-gray-900">{detailEntry.company}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Leistung</p>
                <p className="font-medium text-gray-900">{detailEntry.service}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 mb-1">Betrag</p>
                <p className="font-semibold text-gray-900">€{detailEntry.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Status:</span>
              {getStatusBadge(detailEntry.status)}
            </div>
          </div>
        )}
      </Modal>

      {/* Discrepancy Modal */}
      <Modal
        isOpen={!!discrepancyEntry}
        onClose={() => setDiscrepancyEntry(null)}
        title="Abweichung prüfen"
        size="md"
        footer={
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">Schritt 1: prüfen</span>
              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">Schritt 2: korrigieren</span>
              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">Schritt 3: übernehmen</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDiscrepancyEntry(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveDiscrepancy}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-600/20"
              >
                In Prüfung übernehmen
              </button>
            </div>
          </div>
        }
      >
        {discrepancyEntry && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{discrepancyEntry.month}</p>
                <p className="text-lg font-semibold text-gray-900">{discrepancyEntry.company}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Leistung</p>
                <p className="font-medium text-gray-900">{discrepancyEntry.service}</p>
              </div>
              <div className="md:text-right">
                <p className="text-gray-500 mb-1">Gemeldeter Betrag</p>
                <p className="font-semibold text-gray-900">€{discrepancyEntry.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Abweichungsgrund</label>
                <select
                  value={discrepancyForm.reason}
                  onChange={(e) => setDiscrepancyForm({ ...discrepancyForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Mehrfahrten">Mehrfahrten</option>
                  <option value="Wenigerfahrten">Wenigerfahrten</option>
                  <option value="Preisabweichung">Preisabweichung</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Korrekturbetrag (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={discrepancyForm.correctedAmount}
                  onChange={(e) => setDiscrepancyForm({ ...discrepancyForm, correctedAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="z.B. 12450,00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notiz zur Abweichung</label>
              <textarea
                value={discrepancyForm.note}
                onChange={(e) => setDiscrepancyForm({ ...discrepancyForm, note: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                rows={3}
                placeholder="Abweichung dokumentieren..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
