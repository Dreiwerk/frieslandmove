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
  EyeOff,
  Layout,
  GripVertical,
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
  const [editMode, setEditMode] = useState(false);
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>([]);
  const allWidgetIds = ['total-students', 'open-applications', 'active-routes', 'budget', 'warnings', 'distribution', 'recent'];
  const [metricOrder, setMetricOrder] = useState<string[]>(['total-students', 'open-applications', 'active-routes', 'budget']);
  const [sectionOrder, setSectionOrder] = useState<string[]>(['warnings', 'distribution', 'recent']);
  const [dragMetricId, setDragMetricId] = useState<string | null>(null);
  const [dragSectionId, setDragSectionId] = useState<string | null>(null);

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

  const toggleWidget = (id: string) => {
    setHiddenWidgets((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const restoreWidget = (id: string) => {
    setHiddenWidgets((prev) => prev.filter((w) => w !== id));
  };

  const restoreAll = () => {
    setHiddenWidgets([]);
  };

  const reorder = (list: string[], draggedId: string, targetId: string) => {
    if (!draggedId || !targetId || draggedId === targetId) return list;
    const withoutDragged = list.filter((id) => id !== draggedId);
    const targetIndex = withoutDragged.indexOf(targetId);
    if (targetIndex === -1) return list;
    const before = withoutDragged.slice(0, targetIndex);
    const after = withoutDragged.slice(targetIndex);
    return [...before, draggedId, ...after];
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
      id: 'total-students',
      label: 'Gesamtschüler',
      value: '9.487',
      change: '+23 diese Woche',
      changeType: 'positive' as const,
      icon: Users,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'open-applications',
      label: 'Offene Anträge',
      value: '34',
      change: 'Handlung erforderlich',
      changeType: 'warning' as const,
      icon: FileText,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    {
      id: 'active-routes',
      label: 'Aktive Routen',
      value: '45',
      change: '703 Freistellung, 8.784 ÖPNV',
      changeType: 'neutral' as const,
      icon: MapPin,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      id: 'budget',
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
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Willkommen zurück, Stefanie Pflug</h2>
          <p className="text-sm md:text-base text-gray-500 mt-1" suppressHydrationWarning>Hier ist Ihre Übersicht für heute, {currentDate}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={() => setEditMode((prev) => !prev)}
            className={`px-3 md:px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border ${
              editMode
                ? 'bg-cyan-50 text-cyan-700 border-cyan-100'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span className="hidden sm:inline">{editMode ? 'Bearbeiten aktiv' : 'Dashboard bearbeiten'}</span>
            <span className="sm:hidden">{editMode ? 'Aktiv' : 'Bearbeiten'}</span>
          </button>
          <button
            onClick={handleExport}
            className="px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Bericht exportieren</span>
            <span className="sm:hidden">Export</span>
          </button>
          <button
            onClick={handleNewApplication}
            className="px-3 md:px-4 py-2 bg-cyan-600 rounded-lg text-sm font-medium text-white hover:bg-cyan-700 transition-colors flex items-center gap-2 shadow-lg shadow-cyan-600/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Neuer Antrag</span>
            <span className="sm:hidden">Antrag</span>
          </button>
        </div>
      </div>

      {editMode && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-cyan-50 border border-cyan-100 rounded-xl">
          <div className="flex items-center gap-2 text-xs md:text-sm text-cyan-800 font-semibold">
            <Eye className="w-4 h-4 flex-shrink-0" />
            <span>Edit-Modus: Klick auf Widgets blendet sie aus. Wiederherstellen über „Verfügbare Widgets" oder „Alle einblenden".</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={restoreAll}
              className="px-3 py-2 text-xs font-semibold text-cyan-700 bg-white border border-cyan-100 rounded-lg hover:bg-cyan-100"
            >
              Alle einblenden
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="px-3 py-2 text-xs font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700"
            >
              Fertig
            </button>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      {editMode && hiddenWidgets.length > 0 && (
        <div className="flex items-center gap-2 mb-3 p-3 bg-white border border-dashed border-cyan-200 rounded-xl">
          <span className="text-sm font-semibold text-gray-700">Verfügbare Widgets:</span>
          {hiddenWidgets.map((id) => {
            const name =
              metrics.find((m) => m.id === id)?.label ||
              (id === 'warnings'
                ? 'Dringende Warnungen'
                : id === 'distribution'
                ? 'Verteilung'
                : id === 'recent'
                ? 'Neueste Anträge'
                : id);
            return (
              <button
                key={id}
                onClick={() => restoreWidget(id)}
                className="px-2 py-1 text-xs rounded-lg bg-cyan-50 text-cyan-700 border border-cyan-100 flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                {name}
              </button>
            );
          })}
          {hiddenWidgets.length < allWidgetIds.length && (
            <button
              onClick={restoreAll}
              className="ml-2 px-2 py-1 text-xs rounded-lg bg-white text-cyan-700 border border-cyan-100 hover:bg-cyan-50"
            >
              Alle einblenden
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {metricOrder
          .filter((id) => !hiddenWidgets.includes(id))
          .map((id) => {
            const metric = metrics.find((m) => m.id === id);
            if (!metric) return null;
            const Icon = metric.icon;
            return (
              <div
                key={metric.id}
                draggable={editMode}
                onDragStart={() => setDragMetricId(metric.id)}
                onDragOver={(e) => {
                  if (!editMode) return;
                  e.preventDefault();
                }}
                onDrop={() => {
                  if (dragMetricId) {
                    setMetricOrder((prev) => reorder(prev, dragMetricId, metric.id));
                    setDragMetricId(null);
                  }
                }}
                className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:shadow-gray-100 transition-all cursor-pointer relative ${
                  editMode ? 'border-dashed border-cyan-200' : ''
                }`}
              >
                {editMode && (
                  <div className="absolute top-2 left-2 text-[11px] text-gray-500 flex items-center gap-1">
                    <GripVertical className="w-4 h-4" />
                  </div>
                )}
                {editMode && (
                  <button
                    onClick={() => toggleWidget(metric.id)}
                    className="absolute top-2 right-2 p-1 rounded-md bg-white/80 border border-gray-200 hover:bg-gray-50 text-gray-500"
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>
                )}
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

      {/* Main Content Grid (draggable in edit mode) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {sectionOrder.filter((id) => !hiddenWidgets.includes(id)).map((id) => (
          <React.Fragment key={id}>
            {id === 'warnings' && (
              <div
                draggable={editMode}
                onDragStart={() => setDragSectionId('warnings')}
                onDragOver={(e) => {
                  if (!editMode) return;
                  e.preventDefault();
                }}
                onDrop={() => {
                  if (dragSectionId) {
                    setSectionOrder((prev) => reorder(prev, dragSectionId, 'warnings'));
                    setDragSectionId(null);
                  }
                }}
                className={`lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden relative ${editMode ? 'border-dashed border-cyan-200' : ''}`}
              >
                {editMode && (
                  <>
                    <button
                      onClick={() => toggleWidget('warnings')}
                      className="absolute top-2 right-2 p-1 rounded-md bg-white/80 border border-gray-200 hover:bg-gray-50 text-gray-500"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                    <div className="absolute top-2 left-2 text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <GripVertical className="w-3 h-3" />
                      Drag/Drop & Klick zum Ausblenden
                    </div>
                  </>
                )}
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
            )}

            {id === 'distribution' && (
              <div
                draggable={editMode}
                onDragStart={() => setDragSectionId('distribution')}
                onDragOver={(e) => {
                  if (!editMode) return;
                  e.preventDefault();
                }}
                onDrop={() => {
                  if (dragSectionId) {
                    setSectionOrder((prev) => reorder(prev, dragSectionId, 'distribution'));
                    setDragSectionId(null);
                  }
                }}
                className={`bg-white rounded-xl border border-gray-200 p-5 relative ${editMode ? 'border-dashed border-cyan-200' : ''}`}
              >
                {editMode && (
                  <>
                    <button
                      onClick={() => toggleWidget('distribution')}
                      className="absolute top-2 right-2 p-1 rounded-md bg-white/80 border border-gray-200 hover:bg-gray-50 text-gray-500"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                    <div className="absolute top-2 left-2 text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <GripVertical className="w-3 h-3" />
                      Drag/Drop & Klick zum Ausblenden
                    </div>
                  </>
                )}
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
            )}

            {id === 'recent' && (
              <div
                draggable={editMode}
                onDragStart={() => setDragSectionId('recent')}
                onDragOver={(e) => {
                  if (!editMode) return;
                  e.preventDefault();
                }}
                onDrop={() => {
                  if (dragSectionId) {
                    setSectionOrder((prev) => reorder(prev, dragSectionId, 'recent'));
                    setDragSectionId(null);
                  }
                }}
                className={`bg-white rounded-xl border border-gray-200 overflow-hidden relative ${editMode ? 'border-dashed border-cyan-200' : ''} lg:col-span-3`}
              >
                {editMode && (
                  <>
                    <button
                      onClick={() => toggleWidget('recent')}
                      className="absolute top-2 right-2 p-1 rounded-md bg-white/80 border border-gray-200 hover:bg-gray-50 text-gray-500 z-10"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                    <div className="absolute top-2 left-2 text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded flex items-center gap-1 z-10">
                      <GripVertical className="w-3 h-3" />
                      <span className="hidden md:inline">Drag/Drop & Klick zum Ausblenden</span>
                    </div>
                  </>
                )}

                <div className="px-3 md:px-5 py-3 md:py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">Neueste Anträge</h3>
                  <button
                    onClick={handleGoToApplications}
                    className="text-sm text-cyan-600 font-medium hover:text-cyan-700 transition-colors flex items-center gap-1"
                  >
                    <span className="hidden sm:inline">Zur Antragsverwaltung</span>
                    <span className="sm:hidden">Alle anzeigen</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-3 md:px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Schüler</th>
                      <th className="px-3 md:px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Schule</th>
                      <th className="px-3 md:px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Eingangsdatum</th>
                      <th className="px-3 md:px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                      <th className="px-3 md:px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Aktion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentApplications.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 md:px-5 py-3 md:py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                        </td>
                        <td className="px-3 md:px-5 py-3 md:py-4 text-sm text-gray-600 whitespace-nowrap">{item.school}</td>
                        <td className="px-3 md:px-5 py-3 md:py-4 text-sm text-gray-600 whitespace-nowrap">{item.date}</td>
                        <td className="px-3 md:px-5 py-3 md:py-4 whitespace-nowrap">
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
                        <td className="px-3 md:px-5 py-3 md:py-4 whitespace-nowrap">
                          <button className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
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
