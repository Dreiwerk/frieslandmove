'use client';

import React, { useState } from 'react';
import Toast from '@/components/ui/Toast';
import {
  BarChart3,
  TrendingUp,
  Download,
  FileText,
  Users,
  Euro,
  MapPin,
  Calendar,
  Filter,
  PieChart,
  LineChart,
  Activity,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';

// Mock KPI Data
const kpiData = [
  {
    label: 'Gesamtschüler',
    value: '9.487',
    unit: '',
    trend: 'up' as const,
    trendValue: '+2,3%',
    icon: Users,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    label: 'Durchschnittsk. pro Schüler',
    value: '42,50',
    unit: '€/Monat',
    trend: 'down' as const,
    trendValue: '-1,8%',
    icon: Euro,
    color: 'bg-green-100 text-green-600',
  },
  {
    label: 'Freistellungsverkehr',
    value: '703',
    unit: 'Schüler',
    trend: 'stable' as const,
    trendValue: '±0%',
    icon: MapPin,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    label: 'Aktive Routen',
    value: '45',
    unit: '',
    trend: 'up' as const,
    trendValue: '+3',
    icon: Activity,
    color: 'bg-amber-100 text-amber-600',
  },
];

// Predefined Reports
const predefinedReports = [
  {
    id: 'R001',
    name: 'Monatsbericht Schülerbeförderung',
    description: 'Vollständiger Überblick über alle Beförderungsaktivitäten des Monats',
    category: 'schueler' as const,
    format: 'pdf' as const,
    icon: FileText,
    lastGenerated: '2024-11-15',
  },
  {
    id: 'R002',
    name: 'Kostenbericht nach Schule',
    description: 'Aufschlüsselung der Beförderungskosten pro Bildungseinrichtung',
    category: 'kosten' as const,
    format: 'excel' as const,
    icon: FileSpreadsheet,
    lastGenerated: '2024-11-10',
  },
  {
    id: 'R003',
    name: 'Auslastungsbericht Routen',
    description: 'Analyse der Routenauslastung und Optimierungspotenziale',
    category: 'routen' as const,
    format: 'pdf' as const,
    icon: FileText,
    lastGenerated: '2024-11-12',
  },
  {
    id: 'R004',
    name: 'Barrierefreiheits-Statistik',
    description: 'Übersicht über Schüler mit besonderen Beförderungsbedürfnissen',
    category: 'compliance' as const,
    format: 'csv' as const,
    icon: FileSpreadsheet,
    lastGenerated: '2024-11-08',
  },
  {
    id: 'R005',
    name: 'Jahresabschluss Beförderungskosten',
    description: 'Gesamtübersicht aller Kosten für das Schuljahr',
    category: 'kosten' as const,
    format: 'pdf' as const,
    icon: FileText,
    lastGenerated: '2024-10-30',
  },
  {
    id: 'R006',
    name: 'DSGVO-Verarbeitungsverzeichnis',
    description: 'Dokumentation aller Datenverarbeitungsvorgänge gemäß DSGVO',
    category: 'compliance' as const,
    format: 'pdf' as const,
    icon: FileText,
    lastGenerated: '2024-11-01',
  },
];

// Mock Chart Data
const monthlyTrendData = {
  labels: ['Aug', 'Sep', 'Okt', 'Nov', 'Dez', 'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Schülerzahl',
      data: [9245, 9487, 9482, 9490, 9465, 9510, 9498, 9475, 9460, 9440, 9320, 9180],
      color: '#0891B2',
    },
  ],
};

const schoolDistributionData = [
  { name: 'Mariengymnasium Jever', students: 1243, percentage: 13.1 },
  { name: 'IGS Friesland Nord', students: 1520, percentage: 16.0 },
  { name: 'Oberschule Varel', students: 842, percentage: 8.9 },
  { name: 'Grundschule Schortens', students: 685, percentage: 7.2 },
  { name: 'Realschule Jever', students: 756, percentage: 8.0 },
  { name: 'Sonstige Schulen', students: 4441, percentage: 46.8 },
];

const transportTypeData = [
  { type: 'ÖPNV', count: 8784, percentage: 92.6, color: '#0891B2' },
  { type: 'Freistellung', count: 703, percentage: 7.4, color: '#7C3AED' },
];

export default function ReportsView() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'reports'>('analytics');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [exportLoading, setExportLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'alle' | 'kosten' | 'schueler' | 'routen' | 'compliance'>('alle');
  const [formatFilter, setFormatFilter] = useState<'alle' | 'pdf' | 'excel' | 'csv'>('alle');
  const [generatingReportId, setGeneratingReportId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const periodLabel =
    selectedPeriod === 'last7'
      ? 'Letzte 7 Tage'
      : selectedPeriod === 'last30'
      ? 'Letzte 30 Tage'
      : selectedPeriod === 'week'
      ? 'Diese Woche'
      : selectedPeriod === 'month'
      ? 'Dieser Monat'
      : selectedPeriod === 'quarter'
      ? 'Dieses Quartal'
      : selectedPeriod === 'year'
      ? 'Dieses Jahr'
      : 'Schuljahr 2024/2025';

  const handleExport = () => {
    setExportLoading(true);
    setToast({ message: 'Daten werden exportiert...', type: 'info' });
    try {
      const summaryLines = [
        `Berichte & Statistik – Export`,
        `Zeitraum: ${periodLabel}`,
        `Tab: ${activeTab === 'analytics' ? 'Analytics' : 'Vordefinierte Berichte'}`,
      ];
      if (activeTab === 'reports') {
        summaryLines.push(`Filter: Kategorie=${categoryFilter}, Format=${formatFilter}`);
        filteredReports.forEach((r) => summaryLines.push(`- ${r.name} (${r.format.toUpperCase()})`));
      } else {
        summaryLines.push('Analytics-Daten (Demo-Export)');
        kpiData.forEach((kpi) => summaryLines.push(`- ${kpi.label}: ${kpi.value} ${kpi.unit}`));
      }
      const csv = summaryLines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `berichte_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setToast({ message: 'Export erfolgreich! Datei heruntergeladen.', type: 'success' });
    } finally {
      setExportLoading(false);
    }
  };

  const handleDownloadReport = (reportName: string, format: string) => {
    // Simulierter Export mit echtem Dateiinhalt je nach Format
    let blob: Blob;
    if (format === 'pdf') {
      // Minimal gültiges PDF-Dokument
      const title = reportName;
      const date = new Date().toLocaleDateString('de-DE');
      const subtitle = `Generiert am ${date}`;
      const pdfContent = `%PDF-1.3
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 120 >> stream
BT
/F1 20 Tf
70 740 Td (${title}) Tj
0 -28 Td (${subtitle}) Tj
0 -28 Td (Hinweis: Demo-PDF ohne echte Inhalte) Tj
ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000113 00000 n 
0000000284 00000 n 
0000000394 00000 n 
trailer << /Root 1 0 R /Size 6 >>
startxref
490
%%EOF`;
      blob = new Blob([pdfContent], { type: 'application/pdf' });
    } else if (format === 'excel') {
      const csv = `Report;${reportName}\nDatum;${new Date().toLocaleDateString('de-DE')}\nHinweis;Demodatei (Excel-kompatibel)`;
      blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    } else {
      const csv = `Report;${reportName}\nDatum;${new Date().toLocaleDateString('de-DE')}\nHinweis;Demodatei`;
      blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportName.replace(/\s+/g, '_').toLowerCase()}.${format === 'excel' ? 'xlsx' : format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setToast({ message: `${reportName} erfolgreich heruntergeladen!`, type: 'success' });
  };

  const handleGenerateReport = (reportId: string, reportName: string) => {
    setGeneratingReportId(reportId);
    setToast({ message: `${reportName} wird neu generiert...`, type: 'info' });
    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      // Update lastGenerated for the mocked list
      predefinedReports.forEach((r) => {
        if (r.id === reportId) {
          r.lastGenerated = today;
        }
      });
      setGeneratingReportId(null);
      setToast({ message: 'Bericht erfolgreich generiert!', type: 'success' });
    }, 2000);
  };

  const filteredReports = predefinedReports.filter((report) => {
    const categoryOk = categoryFilter === 'alle' || report.category === categoryFilter;
    const formatOk = formatFilter === 'alle' || report.format === formatFilter;
    return categoryOk && formatOk;
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Berichte & Statistik</h2>
            <p className="text-sm text-gray-500 mt-1">Auswertungen und Analysen zur Schülerbeförderung</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="week">Diese Woche</option>
              <option value="last7">Letzte 7 Tage</option>
              <option value="month">Dieser Monat</option>
              <option value="last30">Letzte 30 Tage</option>
              <option value="quarter">Dieses Quartal</option>
              <option value="year">Dieses Jahr</option>
              <option value="schoolyear">Schuljahr 2024/2025</option>
            </select>
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-cyan-600/20 ${
                exportLoading ? 'bg-cyan-300 text-white cursor-wait' : 'bg-cyan-600 text-white hover:bg-cyan-700'
              }`}
            >
              <Download className="w-4 h-4" />
              {exportLoading ? 'Exportiert...' : 'Exportieren'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-cyan-50 text-cyan-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'reports'
                ? 'bg-cyan-50 text-cyan-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Vordefinierte Berichte
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-5">
        {/* Active filter tags */}
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
            Zeitraum: {selectedPeriod === 'last7' ? 'Letzte 7 Tage' : selectedPeriod === 'last30' ? 'Letzte 30 Tage' :
              selectedPeriod === 'week' ? 'Diese Woche' :
              selectedPeriod === 'month' ? 'Dieser Monat' :
              selectedPeriod === 'quarter' ? 'Dieses Quartal' :
              selectedPeriod === 'year' ? 'Dieses Jahr' : 'Schuljahr 2024/2025'}
          </span>
          {categoryFilter !== 'alle' && (
            <span className="px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold">
              Kategorie: {categoryFilter}
            </span>
          )}
          {formatFilter !== 'alle' && (
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
              Format: {formatFilter.toUpperCase()}
            </span>
          )}
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-5">
            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
              {kpiData.map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                  <div key={index} className="bg-white rounded-xl p-5 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-lg ${kpi.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      {kpi.trend && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          kpi.trend === 'up'
                            ? 'bg-green-100 text-green-700'
                            : kpi.trend === 'down'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {kpi.trendValue}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{kpi.label}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {kpi.value}
                        {kpi.unit && <span className="text-sm text-gray-500 font-normal ml-1">{kpi.unit}</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-2 gap-5">
              {/* Trend Chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Schülerzahl-Entwicklung</h3>
                    <p className="text-sm text-gray-500">Schuljahr 2024/2025</p>
                  </div>
                  <LineChart className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="h-64 flex items-end justify-between gap-2">
                  {monthlyTrendData.datasets[0].data.map((value, index) => {
                    const maxValue = Math.max(...monthlyTrendData.datasets[0].data);
                    const height = (value / maxValue) * 100;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="relative group w-full">
                          <div
                            className="w-full bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-lg transition-all hover:from-cyan-600 hover:to-cyan-500 cursor-pointer"
                            style={{ height: `${height * 2}px` }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity">
                              {value.toLocaleString('de-DE')}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 mt-2">{monthlyTrendData.labels[index]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transport Type Distribution */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Beförderungsarten</h3>
                    <p className="text-sm text-gray-500">Aktuelle Verteilung</p>
                  </div>
                  <PieChart className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex items-center justify-center h-64">
                  <div className="relative w-48 h-48">
                    {/* Simple donut chart representation */}
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="20"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#0891B2"
                        strokeWidth="20"
                        strokeDasharray={`${transportTypeData[0].percentage * 2.51} 251`}
                        className="transition-all"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#7C3AED"
                        strokeWidth="20"
                        strokeDasharray={`${transportTypeData[1].percentage * 2.51} 251`}
                        strokeDashoffset={`-${transportTypeData[0].percentage * 2.51}`}
                        className="transition-all"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900">9.487</span>
                      <span className="text-sm text-gray-500">Schüler</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {transportTypeData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-700">{item.type}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">{item.count.toLocaleString('de-DE')}</span>
                        <span className="text-xs text-gray-500 ml-1">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* School Distribution */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Schülerverteilung nach Schulen</h3>
                  <p className="text-sm text-gray-500">Top 5 Schulen + Sonstige</p>
                </div>
                <BarChart3 className="w-5 h-5 text-cyan-600" />
              </div>
              <div className="space-y-3">
                {schoolDistributionData.map((school, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">{school.name}</span>
                      <span className="text-gray-600">{school.students.toLocaleString('de-DE')} ({school.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${school.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="grid grid-cols-3 gap-5">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Euro className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Gesamtkosten</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">403.247 €</p>
                <p className="text-sm text-gray-500">Monat November 2024</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">ÖPNV:</span>
                    <span className="font-medium text-gray-900">198.450 €</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-500">Freistellung:</span>
                    <span className="font-medium text-gray-900">204.797 €</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Kilometer gesamt</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">164.580 km</p>
                <p className="text-sm text-gray-500">Monat November 2024</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Ø pro Route:</span>
                    <span className="font-medium text-gray-900">3.657 km</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-500">Ø Kosten/km:</span>
                    <span className="font-medium text-gray-900">2,45 €</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Effizienz</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">87,3%</p>
                <p className="text-sm text-gray-500">Durchschnittliche Auslastung</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-medium">+2,1% vs. Vormonat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-5">
            {/* Filter */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="alle">Alle Kategorien</option>
                  <option value="kosten">Kosten</option>
                  <option value="schueler">Schüler</option>
                  <option value="routen">Routen</option>
                  <option value="compliance">Compliance</option>
                </select>
                <select
                  value={formatFilter}
                  onChange={(e) => setFormatFilter(e.target.value as typeof formatFilter)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="alle">Alle Formate</option>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-2 gap-4">
              {filteredReports.map((report) => {
                const Icon = report.icon;
                return (
                  <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-cyan-300 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-cyan-100 rounded-lg flex-shrink-0">
                        <Icon className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{report.name}</h3>
                        <p className="text-sm text-gray-500 mb-3">{report.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(report.lastGenerated).toLocaleDateString('de-DE')}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full font-medium ${
                            report.format === 'pdf'
                              ? 'bg-red-100 text-red-700'
                              : report.format === 'excel'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {report.format.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleDownloadReport(report.name, report.format)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Herunterladen
                      </button>
                      <button
                        onClick={() => handleGenerateReport(report.id, report.name)}
                        className={`flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg transition-colors text-sm font-medium ${
                          generatingReportId === report.id
                            ? 'text-gray-400 bg-gray-50 cursor-wait'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        disabled={generatingReportId === report.id}
                      >
                        {generatingReportId === report.id ? 'Wird generiert...' : 'Neu generieren'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Report Builder Teaser */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-2">Individueller Bericht</h3>
                  <p className="text-cyan-100 text-sm">Erstelle einen maßgeschneiderten Bericht mit den Daten, die du benötigst</p>
                </div>
                <button className="px-6 py-3 bg-white text-cyan-700 rounded-lg hover:bg-cyan-50 transition-colors font-medium shadow-lg">
                  Bericht erstellen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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
