'use client';

import React, { useState } from 'react';
import {
  Users,
  FileText,
  MapPin,
  Euro,
  Download,
  Plus,
  TrendingUp,
  AlertTriangle,
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { warnings, recentApplications } from '@/lib/data';
import Toast from '@/components/ui/Toast';
import { ViewType } from '@/types';

interface DashboardViewProps {
  onNavigateToApplications?: () => void;
  onNavigateToApplicationsOnly?: () => void;
  setCurrentView?: (view: ViewType) => void;
}

export default function DashboardView({ onNavigateToApplications, onNavigateToApplicationsOnly, setCurrentView }: DashboardViewProps) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleExport = () => {
    setToast({ message: 'Bericht wird erstellt...', type: 'info' });

    // Simulate export delay
    setTimeout(() => {
      // Create a simple CSV export
      const currentDate = new Date().toLocaleDateString('de-DE');
      const csvContent = `Bericht vom ${currentDate}\n\nMetrik,Wert\nGesamtschüler,9.487\nOffene Anträge,34\nAktive Routen,45\nBudgetstatus,84%\n\nErstellt: ${new Date().toLocaleString('de-DE')}`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `frieslandmove_bericht_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToast({ message: 'Bericht erfolgreich exportiert!', type: 'success' });
    }, 1500);
  };

  const handleNewApplication = () => {
    if (onNavigateToApplications) {
      onNavigateToApplications();
    }
  };

  const handleViewAllWarnings = () => {
    if (setCurrentView) {
      setCurrentView('notifications');
    }
  };

  const handleGoToApplications = () => {
    if (onNavigateToApplicationsOnly) {
      onNavigateToApplicationsOnly();
    }
  };
  const metrics = [
    {
      label: 'Gesamtschüler',
      value: '9.487',
      change: '+23 diese Woche',
      changeType: 'positive' as const,
      icon: Users,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Offene Anträge',
      value: '34',
      change: 'Handlung erforderlich',
      changeType: 'warning' as const,
      icon: FileText,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    {
      label: 'Aktive Routen',
      value: '45',
      change: '703 Freistellung, 8.784 ÖPNV',
      changeType: 'neutral' as const,
      icon: MapPin,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      label: 'Budgetstatus',
      value: '84%',
      change: '€4.03M von €4.8M',
      changeType: 'neutral' as const,
      icon: Euro,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      showProgress: true,
      progress: 84
    },
  ];

  const currentDate = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Willkommen zurück, Stefanie Pflug</h2>
          <p className="text-gray-500 mt-1">Hier ist Ihre Übersicht für heute, {currentDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Bericht exportieren
          </button>
          <button
            onClick={handleNewApplication}
            className="px-4 py-2 bg-cyan-600 rounded-lg text-sm font-medium text-white hover:bg-cyan-700 transition-colors flex items-center gap-2 shadow-lg shadow-cyan-600/20"
          >
            <Plus className="w-4 h-4" />
            Neuer Antrag
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:shadow-gray-100 transition-all cursor-pointer">
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${metric.iconBg}`}>
                  <Icon className={`w-5 h-5 ${metric.iconColor}`} />
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-gray-500 mt-1">{metric.label}</p>
              </div>
              {metric.showProgress ? (
                <div className="mt-3">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${metric.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{metric.change}</p>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-1.5">
                  {metric.changeType === 'positive' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                  {metric.changeType === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  <span className={`text-xs font-medium ${
                    metric.changeType === 'positive' ? 'text-emerald-600' :
                    metric.changeType === 'warning' ? 'text-amber-600' :
                    'text-gray-500'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Warnings Widget */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-gray-900">Dringende Warnungen</h3>
              <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">3</span>
            </div>
            <button
              onClick={handleViewAllWarnings}
              className="text-sm text-cyan-600 font-medium hover:text-cyan-700 transition-colors"
            >
              Alle anzeigen
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {warnings.map((warning) => (
              <div key={warning.id} className="px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    warning.type === 'warning' ? 'bg-amber-50' :
                    warning.type === 'alert' ? 'bg-red-50' :
                    'bg-blue-50'
                  }`}>
                    {warning.type === 'warning' && <Clock className="w-4 h-4 text-amber-600" />}
                    {warning.type === 'alert' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                    {warning.type === 'info' && <FileText className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-900">{warning.title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{warning.company}</p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{warning.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{warning.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Verteilung Beförderungsart</h3>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  strokeDasharray={`${92 * 2.51} ${100 * 2.51}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">92%</span>
                <span className="text-xs text-gray-500">ÖPNV</span>
              </div>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                <span className="text-sm text-gray-600">ÖPNV</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">8.751 Schüler</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span className="text-sm text-gray-600">Freistellungsverkehr</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">761 Schüler</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Neueste Anträge</h3>
          <button
            onClick={handleGoToApplications}
            className="text-sm text-cyan-600 font-medium hover:text-cyan-700 transition-colors flex items-center gap-1"
          >
            Zur Antragsverwaltung
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Schüler</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Schule</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Eingangsdatum</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentApplications.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <span className="font-medium text-gray-900">{item.name}</span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{item.school}</td>
                <td className="px-5 py-4 text-sm text-gray-600">{item.date}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    item.status === 'genehmigt' ? 'bg-emerald-50 text-emerald-700' :
                    item.status === 'pruefung' ? 'bg-amber-50 text-amber-700' :
                    item.status === 'eingang' ? 'bg-blue-50 text-blue-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {item.status === 'genehmigt' && <CheckCircle2 className="w-3 h-3" />}
                    {item.status === 'pruefung' && <Clock className="w-3 h-3" />}
                    {item.status === 'eingang' && <FileText className="w-3 h-3" />}
                    {item.status === 'abgelehnt' && <XCircle className="w-3 h-3" />}
                    {item.status === 'genehmigt' ? 'Genehmigt' :
                     item.status === 'pruefung' ? 'In Prüfung' :
                     item.status === 'eingang' ? 'Eingang' : 'Abgelehnt'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
