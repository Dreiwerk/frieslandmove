'use client';

import React, { useState } from 'react';
import {
  Filter,
  Plus,
  Sparkles,
  Check,
  X,
  CheckCircle2,
  XCircle,
  FileQuestion,
  Settings,
  Eye,
  EyeOff,
} from 'lucide-react';
import { applications, applicationColumns } from '@/lib/data';
import { Application, ApplicationStatus } from '@/types';
import Toast from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';

interface ApplicationsViewProps {
  openNewModal?: boolean;
  onModalClose?: () => void;
}

export default function ApplicationsView({ openNewModal = false, onModalClose }: ApplicationsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>('app-3');
  const [appData, setAppData] = useState<Application[]>(applications);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isNewApplicationModalOpen, setIsNewApplicationModalOpen] = useState(openNewModal);
  const [showFilter, setShowFilter] = useState(false);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    applicant: true,
    school: true,
    distance: true,
    status: true,
    submittedDate: true,
  });

  // Filter states
  const [selectedStatuses, setSelectedStatuses] = useState<ApplicationStatus[]>([
    'eingang',
    'pruefung-schulamt',
    'pruefung-befoerderung',
    'genehmigt',
    'abgelehnt',
  ]);
  const [timeFilter, setTimeFilter] = useState<'alle' | 'heute' | 'woche' | 'monat'>('alle');

  // Filter applications based on selected filters
  const filteredAppData = React.useMemo(() => {
    let filtered = appData;

    // Filter by status
    filtered = filtered.filter(app => selectedStatuses.includes(app.status));

    // Filter by time
    if (timeFilter !== 'alle') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(app => {
        const appDate = new Date(app.submittedDate.split('.').reverse().join('-'));

        switch (timeFilter) {
          case 'heute':
            return appDate >= today;
          case 'woche':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return appDate >= weekAgo;
          case 'monat':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return appDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [appData, selectedStatuses, timeFilter]);

  const selectedApp = filteredAppData.find(a => a.id === selectedId);

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    setProcessingAction(appId);
    setTimeout(() => {
      setAppData(prev => prev.map(app =>
        app.id === appId ? { ...app, status: newStatus } : app
      ));
      setProcessingAction(null);
      if (newStatus === 'genehmigt' || newStatus === 'abgelehnt') {
        setSelectedId(null);
      }
      // Show toast notification
      if (newStatus === 'genehmigt') {
        setToast({ message: 'Antrag erfolgreich genehmigt!', type: 'success' });
      } else if (newStatus === 'abgelehnt') {
        setToast({ message: 'Antrag abgelehnt', type: 'info' });
      } else {
        setToast({ message: 'Status aktualisiert', type: 'success' });
      }
    }, 500);
  };

  // Sync external modal state with internal state
  React.useEffect(() => {
    if (openNewModal) {
      setIsNewApplicationModalOpen(true);
    }
  }, [openNewModal]);

  const handleFilter = () => {
    setShowFilter(!showFilter);
  };

  const handleNewApplication = () => {
    setIsNewApplicationModalOpen(true);
  };

  const handleCloseNewApplicationModal = () => {
    setIsNewApplicationModalOpen(false);
    if (onModalClose) {
      onModalClose();
    }
  };

  const handleSaveNewApplication = () => {
    setToast({ message: 'Neuer Antrag wird gespeichert...', type: 'info' });
    setTimeout(() => {
      setIsNewApplicationModalOpen(false);
      if (onModalClose) {
        onModalClose();
      }
      setToast({ message: 'Antrag erfolgreich erstellt!', type: 'success' });
    }, 1000);
  };

  const handleToggleStatus = (status: ApplicationStatus) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        // Don't allow deselecting the last status
        if (prev.length === 1) return prev;
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const handleResetFilters = () => {
    setSelectedStatuses(['eingang', 'pruefung-schulamt', 'pruefung-befoerderung', 'genehmigt', 'abgelehnt']);
    setTimeFilter('alle');
    setToast({ message: 'Filter zurückgesetzt', type: 'info' });
  };

  const handleApplyFilters = () => {
    setShowFilter(false);
    setToast({ message: 'Filter angewendet', type: 'success' });
  };

  // Calculate active filter count
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    // Count number of deselected statuses
    const deselectedCount = 5 - selectedStatuses.length;
    count += deselectedCount;
    // Add 1 if time filter is active
    if (timeFilter !== 'alle') count++;
    return count;
  }, [selectedStatuses, timeFilter]);

  // Drag and drop handlers
  const [draggedItem, setDraggedItem] = useState<Application | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ApplicationStatus | null>(null);

  const handleDragStart = (app: Application) => {
    setDraggedItem(app);
  };

  const handleDragOver = (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: ApplicationStatus) => {
    e.preventDefault();
    if (draggedItem && draggedItem.status !== newStatus) {
      handleStatusChange(draggedItem.id, newStatus);
      setToast({ message: `Antrag nach "${applicationColumns.find(c => c.id === newStatus)?.title}" verschoben`, type: 'success' });
    }
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Kanban Board */}
      <div className="flex-1 p-3 md:p-6 overflow-x-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0 mb-4 md:mb-6">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Antragsverwaltung</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              <span className="block md:inline">Digitaler Antragsworkflow für Schülerbeförderung</span>
              <span className="mx-2 hidden md:inline">•</span>
              <span className="text-cyan-600 font-medium hidden lg:inline">Tipp: Karten per Drag & Drop verschieben</span>
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <button
              onClick={handleFilter}
              className="px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 relative"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cyan-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={handleNewApplication}
              className="px-3 md:px-4 py-2 bg-cyan-600 rounded-lg text-sm font-medium text-white hover:bg-cyan-700 transition-colors flex items-center gap-2 shadow-lg shadow-cyan-600/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Neuer Antrag</span>
              <span className="sm:hidden">Antrag</span>
            </button>
            <div className="relative hidden lg:block">
              <button
                onClick={() => setShowColumnConfig(!showColumnConfig)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden xl:inline">Ansicht anpassen</span>
              </button>
              {showColumnConfig && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-3 space-y-2">
                  <p className="text-sm font-semibold text-gray-900">Spalten</p>
                  {[
                    { key: 'applicant', label: 'Antragsteller' },
                    { key: 'school', label: 'Schule' },
                    { key: 'distance', label: 'Entfernung' },
                    { key: 'status', label: 'Status' },
                    { key: 'submittedDate', label: 'Eingang' },
                  ].map((col) => (
                    <label key={col.key} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={visibleColumns[col.key as keyof typeof visibleColumns]}
                        onChange={(e) =>
                          setVisibleColumns((prev) => ({ ...prev, [col.key]: e.target.checked }))
                        }
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span>{col.label}</span>
                    </label>
                  ))}
                  <button
                    onClick={() => {
                      setShowColumnConfig(false);
                      setToast({ message: 'Ansicht gespeichert (simuliert)', type: 'success' });
                    }}
                    className="w-full mt-2 px-3 py-2 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    Ansicht speichern
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 md:gap-4 min-w-max pb-4">
          {applicationColumns.map(column => {
            const columnApps = filteredAppData.filter(a => a.status === column.id);
            return (
              <div key={column.id} className="w-64 md:w-72 flex-shrink-0">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={`w-2 h-2 rounded-full ${
                    column.color === 'blue' ? 'bg-blue-500' :
                    column.color === 'amber' ? 'bg-amber-500' :
                    column.color === 'emerald' ? 'bg-emerald-500' :
                    'bg-red-500'
                  }`}></div>
                  <h3 className="font-semibold text-gray-700 text-sm">{column.title}</h3>
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                    {columnApps.length}
                  </span>
                </div>
                <div
                  className={`space-y-3 min-h-[200px] rounded-xl p-2 transition-all ${
                    dragOverColumn === column.id && draggedItem?.status !== column.id
                      ? 'bg-cyan-50 border-2 border-dashed border-cyan-300'
                      : 'border-2 border-transparent'
                  }`}
                  onDragOver={(e) => handleDragOver(e, column.id as ApplicationStatus)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id as ApplicationStatus)}
                >
                  {columnApps.map(app => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={() => handleDragStart(app)}
                      onDragEnd={() => setDraggedItem(null)}
                      onClick={() => setSelectedId(app.id)}
                      className={`bg-white rounded-xl border p-4 cursor-grab active:cursor-grabbing transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                        selectedId === app.id
                          ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg'
                          : 'border-gray-200 hover:border-cyan-300'
                      } ${processingAction === app.id ? 'opacity-50 scale-95' : ''} ${
                        draggedItem?.id === app.id ? 'opacity-50 scale-95' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        {visibleColumns.applicant && (
                          <p className="font-medium text-gray-900">{app.studentName}</p>
                        )}
                        {app.autoChecked && (
                          <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Auto
                          </span>
                        )}
                      </div>
                      {visibleColumns.school && <p className="text-sm text-gray-500 mb-3">{app.school}</p>}
                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        {visibleColumns.distance && (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                            app.eligible 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {app.eligible ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            {app.distance} km
                          </span>
                        )}
                        {visibleColumns.status && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium whitespace-nowrap">
                            {column.title}
                          </span>
                        )}
                        {visibleColumns.submittedDate && <span className="text-gray-400 whitespace-nowrap">{app.submittedDate}</span>}
                      </div>
                    </div>
                  ))}
                  {columnApps.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-sm text-gray-400 p-4 text-center">
                      {filteredAppData.length === 0 ? (
                        <>
                          <Filter className="w-8 h-8 text-gray-300 mb-2" />
                          <p className="font-medium text-gray-600">Keine Anträge gefunden</p>
                          <button
                            onClick={handleResetFilters}
                            className="mt-2 text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                          >
                            Filter zurücksetzen
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                            <Check className="w-4 h-4 text-gray-400" />
                          </div>
                          <p>Keine Anträge</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedApp && (
        <>
          {/* Mobile Overlay Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSelectedId(null)}
          />

          {/* Detail Panel - Full screen on mobile, side panel on desktop */}
          <div className="fixed md:relative inset-0 md:inset-auto md:w-96 bg-white md:border-l border-gray-200 flex flex-col overflow-hidden animate-slide-in z-50">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Antragsdetails</h3>
            <button 
              onClick={() => setSelectedId(null)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Student Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/20">
                  {selectedApp.studentName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selectedApp.studentName}</p>
                  <p className="text-sm text-gray-500">{selectedApp.school}</p>
                </div>
              </div>
            </div>

            {/* Auto-Check Badge */}
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-900">Automatisch vorgeprüft</span>
              </div>
              <p className="text-sm text-purple-700">
                Dieser Antrag wurde automatisch auf Vollständigkeit und Berechtigung geprüft.
              </p>
            </div>

            {/* Verification Checks */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Prüfungsergebnisse</h4>
              
              <div className="bg-emerald-50 rounded-lg p-3 flex items-start gap-3 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-emerald-900">Adresse verifiziert</p>
                  <p className="text-sm text-emerald-700">{selectedApp.address}</p>
                </div>
              </div>

              <div className={`rounded-lg p-3 flex items-start gap-3 border ${
                selectedApp.eligible 
                  ? 'bg-emerald-50 border-emerald-100' 
                  : 'bg-red-50 border-red-100'
              }`}>
                {selectedApp.eligible 
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  : <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                }
                <div>
                  <p className={`font-medium ${selectedApp.eligible ? 'text-emerald-900' : 'text-red-900'}`}>
                    Entfernung zur Schule: {selectedApp.distance} km
                  </p>
                  <p className={`text-sm ${selectedApp.eligible ? 'text-emerald-700' : 'text-red-700'}`}>
                    {selectedApp.eligible 
                      ? '→ Anspruchsberechtigt (> 2 km)' 
                      : '→ Nicht anspruchsberechtigt (< 2 km)'
                    }
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-lg p-3 flex items-start gap-3 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-emerald-900">Dokumente vollständig</p>
                  <p className="text-sm text-emerald-700">Alle erforderlichen Nachweise eingereicht</p>
                </div>
              </div>
            </div>

            {/* Meta Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Eingangsdatum</span>
                <span className="font-medium text-gray-900">{selectedApp.submittedDate}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Antrags-ID</span>
                <span className="font-mono text-gray-900">{selectedApp.id.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-500">Bearbeitungszeit</span>
                <span className="font-medium text-gray-900">2 Tage</span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span>Eingang</span>
              </div>
              <span>→</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                <span>Prüfung</span>
              </div>
              <span>→</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span>Genehmigt</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatusChange(selectedApp.id, 'genehmigt')}
                  disabled={processingAction !== null}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                  title="Antrag direkt genehmigen"
                >
                  <Check className="w-4 h-4" />
                  Genehmigen
                </button>
                <button
                  onClick={() => handleStatusChange(selectedApp.id, 'abgelehnt')}
                  disabled={processingAction !== null}
                  className="px-4 py-2.5 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  title="Antrag ablehnen"
                >
                  <X className="w-4 h-4" />
                  Ablehnen
                </button>
              </div>
              <button
                onClick={() => {
                  const nextStatus = selectedApp.status === 'eingang' ? 'pruefung-schulamt' :
                                    selectedApp.status === 'pruefung-schulamt' ? 'pruefung-befoerderung' :
                                    selectedApp.status;
                  if (nextStatus !== selectedApp.status) {
                    handleStatusChange(selectedApp.id, nextStatus as ApplicationStatus);
                  }
                }}
                disabled={processingAction !== null || selectedApp.status === 'pruefung-befoerderung'}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                title="Antrag in nächste Prüfungsstufe verschieben"
              >
                <FileQuestion className="w-4 h-4" />
                {selectedApp.status === 'eingang' ? 'An Schulamt senden' :
                 selectedApp.status === 'pruefung-schulamt' ? 'An Beförderung senden' :
                 'Weiterleiten'}
              </button>
            </div>
          </div>
        </div>
        </>
      )}

      {/* New Application Modal */}
      <Modal
        isOpen={isNewApplicationModalOpen}
        onClose={handleCloseNewApplicationModal}
        title="Neuen Antrag erstellen"
        size="lg"
        footer={
          <>
            <button
              onClick={handleCloseNewApplicationModal}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSaveNewApplication}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-600/20"
            >
              Antrag erstellen
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Max"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Mustermann"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schule</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="">Schule auswählen...</option>
              <option>Mariengymnasium Jever</option>
              <option>IGS Friesland Nord</option>
              <option>Oberschule Varel</option>
              <option>Grundschule Schortens</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Straße & Hausnummer</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Musterstraße 123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ort</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Jever"
              />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">Automatische Prüfung</p>
              <p className="text-xs mt-1">Der Antrag wird automatisch auf Anspruchsberechtigung und Vollständigkeit geprüft.</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Filter Panel */}
      {showFilter && (
        <>
          {/* Mobile backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowFilter(false)}
          />
          <div className="fixed top-20 right-3 md:right-6 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 md:p-5 w-[calc(100vw-24px)] max-w-sm md:w-80 z-50 animate-slide-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filter</h3>
            <button onClick={() => setShowFilter(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="space-y-2">
                {applicationColumns.map(col => (
                  <label key={col.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      checked={selectedStatuses.includes(col.id as ApplicationStatus)}
                      onChange={() => handleToggleStatus(col.id as ApplicationStatus)}
                    />
                    <span className="text-sm text-gray-700">{col.title}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zeitraum</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as 'alle' | 'heute' | 'woche' | 'monat')}
              >
                <option value="alle">Alle</option>
                <option value="heute">Heute</option>
                <option value="woche">Diese Woche</option>
                <option value="monat">Dieser Monat</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={handleResetFilters}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Zurücksetzen
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium"
              >
                Anwenden
              </button>
            </div>
          </div>
        </div>
        </>
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
