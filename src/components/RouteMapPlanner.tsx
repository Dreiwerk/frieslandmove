// components/RouteMapPlanner.tsx

'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  MapPin,
  Users,
  Navigation,
  Clock,
  Euro,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Maximize2,
  GripVertical,
  School as SchoolIcon,
  Bus,
  Plus,
  Edit3,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Save,
  Search,
  Download,
  AlertTriangle,
  UserMinus,
  RotateCcw,
  ChevronRight,
  Settings,
  FileDown,
  Printer,
  Copy,
  ArrowUpDown,
} from 'lucide-react';

import { useLeafletMap } from '@/hooks/useLeafletMap';
import { calculateStreetRoute, optimizeStopOrder } from '@/lib/routing-service';
import { demoRoutes, unassignedStudents as initialUnassigned, FRIESLAND_CENTER, frieslandSchools, getNextRouteColor } from '@/lib/friesland-routes-data';
import type { TransportRoute, UnassignedStudent, Stop, Coordinates, MapMode, RouteStatistics, VehicleType, School } from '@/types/routing';

// =============================================
// HELPER FUNCTIONS
// =============================================

function getVehicleCapacity(vehicle: VehicleType): number {
  const capacities: Record<VehicleType, number> = {
    'Kleinbus (8 Sitze)': 8,
    'Großraumtaxi (6 Sitze)': 6,
    'Schulbus (40 Sitze)': 40,
    'ÖPNV-Kombination': 50,
    'PKW (4 Sitze)': 4,
  };
  return capacities[vehicle] || 8;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

// =============================================
// TOAST COMPONENT
// =============================================

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { bg: 'bg-green-600', Icon: CheckCircle },
    error: { bg: 'bg-red-600', Icon: AlertCircle },
    info: { bg: 'bg-[#1e3a5f]', Icon: Sparkles },
    warning: { bg: 'bg-amber-500', Icon: AlertTriangle },
  }[type];

  return (
    <div className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-[2000] ${config.bg} text-white px-5 py-3 rounded-lg font-medium shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4`}>
      <config.Icon className="w-4 h-4" />
      {message}
    </div>
  );
}

// =============================================
// CONFIRM DIALOG COMPONENT
// =============================================

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Bestätigen',
  cancelText = 'Abbrechen',
  type = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const colors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-amber-500 hover:bg-amber-600',
    info: 'bg-[#1e3a5f] hover:bg-[#2d5a8c]',
  }[type];

  return (
    <div className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            {type === 'danger' && <AlertTriangle className="w-6 h-6 text-red-500" />}
            {type === 'warning' && <AlertCircle className="w-6 h-6 text-amber-500" />}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-slate-600">{message}</p>
        </div>
        <div className="flex gap-3 p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors font-medium ${colors}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================
// ROUTE CARD COMPONENT
// =============================================

interface RouteCardProps {
  route: TransportRoute;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onOptimize: () => void;
  onRemoveStudent: (stopId: string) => void;
  onReorderStops: (fromIndex: number, toIndex: number) => void;
  onEditStop: (stop: Stop) => void;
}

function RouteCard({
  route,
  isActive,
  onSelect,
  onDelete,
  onEdit,
  onOptimize,
  onRemoveStudent,
  onReorderStops,
  onEditStop,
}: RouteCardProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const capacity = getVehicleCapacity(route.vehicle);
  const isOverCapacity = route.stops.length > capacity;
  const capacityPercentage = Math.min((route.stops.length / capacity) * 100, 100);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDropTargetIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dropTargetIndex !== null && draggedIndex !== dropTargetIndex) {
      onReorderStops(draggedIndex, dropTargetIndex);
    }
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border cursor-pointer transition-all ${
        isActive
          ? 'border-[#1e3a5f] bg-gradient-to-br from-[#1e3a5f]/5 to-transparent shadow-sm'
          : 'border-slate-200 hover:border-[#2d5a8c] hover:shadow-sm bg-white'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ background: route.color }}
        />
        <span className="font-semibold text-[15px] truncate">{route.name}</span>
        <span className="ml-auto text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full whitespace-nowrap">
          {route.vehicle}
        </span>
      </div>

      {/* Capacity Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className={isOverCapacity ? 'text-red-500 font-medium' : 'text-slate-500'}>
            {route.stops.length} / {capacity} Plätze
          </span>
          {isOverCapacity && (
            <span className="text-red-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Überbelegt
            </span>
          )}
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isOverCapacity ? 'bg-red-500' : capacityPercentage > 80 ? 'bg-amber-500' : 'bg-green-500'
            }`}
            style={{ width: `${capacityPercentage}%` }}
          />
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex gap-4 text-sm text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {route.stops.length}
        </span>
        <span className="flex items-center gap-1">
          <Navigation className="w-3.5 h-3.5" />
          {route.distance.toFixed(1)} km
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {route.duration} min
        </span>
        <span className="flex items-center gap-1">
          <Euro className="w-3.5 h-3.5" />
          {route.cost.toFixed(0)}
        </span>
      </div>

      {/* Expanded Stops */}
      {isActive && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-1">
          {route.stops.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              Keine Haltestellen - füge Schüler hinzu
            </p>
          ) : (
            route.stops.map((stop, idx) => (
              <div
                key={stop.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditStop(stop);
                }}
                className={`flex items-center py-2 group rounded-lg px-2 transition-colors cursor-pointer hover:bg-slate-50 ${
                  draggedIndex === idx ? 'opacity-50 bg-slate-100' : ''
                } ${dropTargetIndex === idx ? 'bg-[#1e3a5f]/10 border-l-2 border-[#1e3a5f]' : ''} ${
                  stop.student === 'Nicht zugeordnet' ? 'bg-amber-50 border border-amber-200' : ''
                }`}
              >
                <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-500 cursor-grab mr-2 flex-shrink-0" />
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-3 flex-shrink-0"
                  style={{ background: stop.student === 'Nicht zugeordnet' ? '#f59e0b' : route.color }}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate flex items-center gap-2">
                    {stop.student}
                    {stop.student === 'Nicht zugeordnet' && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Zuordnen</span>
                    )}
                    {stop.specialNeeds?.wheelchair && (
                      <span className="text-red-500 text-xs">♿</span>
                    )}
                    {stop.specialNeeds?.companion && (
                      <span className="text-amber-500 text-xs">👥</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {stop.time} • {stop.name}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditStop(stop);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-[#1e3a5f] transition-all"
                    title="Bearbeiten"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveStudent(stop.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                    title="Entfernen"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* School Destination */}
          <div className="flex items-center py-2 pt-3 border-t border-dashed border-slate-200 mt-2">
            <div className="w-4 mr-2" /> {/* Spacer for grip */}
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center mr-3 flex-shrink-0">
              <SchoolIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{route.school.name}</div>
              <div className="text-xs text-slate-500">{route.arrivalTime} • Ankunft</div>
            </div>
          </div>

          {/* Route Actions */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex-1 text-xs text-slate-600 hover:text-[#1e3a5f] py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              Bearbeiten
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOptimize();
              }}
              className="flex-1 text-xs text-[#1e3a5f] hover:text-[#2d5a8c] py-2 px-3 rounded-lg hover:bg-[#1e3a5f]/5 transition-colors flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Optimieren
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-xs text-red-500 hover:text-red-600 py-2 px-3 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================
// STUDENT CARD COMPONENT
// =============================================

interface StudentCardProps {
  student: UnassignedStudent;
  onAssign: () => void;
  isHighlighted?: boolean;
}

function StudentCard({ student, onAssign, isHighlighted }: StudentCardProps) {
  const initials = student.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <div
      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors group ${
        isHighlighted
          ? 'bg-[#1e3a5f]/10 border-2 border-[#1e3a5f]'
          : 'bg-slate-50 hover:bg-slate-100'
      }`}
      draggable
      onClick={onAssign}
    >
      <div className="w-9 h-9 rounded-full bg-[#2d5a8c] text-white flex items-center justify-center text-xs font-semibold mr-3 flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm flex items-center gap-2">
          {student.name}
          {student.specialNeeds?.wheelchair && (
            <span className="text-red-500 text-xs">♿</span>
          )}
          {student.specialNeeds?.companion && (
            <span className="text-amber-500 text-xs">👥</span>
          )}
        </div>
        <div className="text-xs text-slate-500 truncate">{student.address}</div>
        {student.school && (
          <div className="text-xs text-slate-400 truncate flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />
            {student.school.name}
          </div>
        )}
        {student.grade && (
          <span className="text-xs text-slate-400">Klasse {student.grade}</span>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAssign();
        }}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-[#1e3a5f] hover:text-white text-slate-400 transition-all"
        title="Zur Route hinzufügen"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

// =============================================
// CREATE/EDIT ROUTE MODAL COMPONENT
// =============================================

interface RouteModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData?: TransportRoute;
  onClose: () => void;
  onSave: (data: {
    name: string;
    vehicle: VehicleType;
    operator: string;
    school: School;
    departureTime: string;
    selectedStudentIds?: string[];
  }) => void;
  availableStudents: UnassignedStudent[];
}

function RouteModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSave,
  availableStudents,
}: RouteModalProps) {
  const [routeName, setRouteName] = useState('');
  const [vehicle, setVehicle] = useState<VehicleType>('Kleinbus (8 Sitze)');
  const [operator, setOperator] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [departureTime, setDepartureTime] = useState('07:00');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const vehicleTypes: VehicleType[] = [
    'Kleinbus (8 Sitze)',
    'Großraumtaxi (6 Sitze)',
    'Schulbus (40 Sitze)',
    'ÖPNV-Kombination',
    'PKW (4 Sitze)',
  ];

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setRouteName(initialData.name);
        setVehicle(initialData.vehicle);
        setOperator(initialData.operator);
        setSelectedSchool(initialData.school);
        setDepartureTime(initialData.departureTime);
        setSelectedStudentIds([]);
      } else {
        setRouteName('');
        setVehicle('Kleinbus (8 Sitze)');
        setOperator('');
        setSelectedSchool(null);
        setDepartureTime('07:00');
        setSelectedStudentIds([]);
      }
    }
  }, [isOpen, mode, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!routeName || !operator || !selectedSchool) {
      return;
    }

    // Erlaube auch leere Routen - Schüler können später hinzugefügt werden
    onSave({
      name: routeName,
      vehicle,
      operator,
      school: selectedSchool,
      departureTime,
      selectedStudentIds: mode === 'create' ? selectedStudentIds : undefined,
    });

    onClose();
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectedCapacity = getVehicleCapacity(vehicle);
  const isOverCapacity = selectedStudentIds.length > selectedCapacity;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8c] text-white">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bus className="w-6 h-6" />
            {mode === 'create' ? 'Neue Route erstellen' : 'Route bearbeiten'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Route Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Routenname *
            </label>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              placeholder="z.B. Route 15 - Jever Ost"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Vehicle Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fahrzeugtyp *
              </label>
              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value as VehicleType)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                required
              >
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Departure Time */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Abfahrtszeit *
              </label>
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                required
              />
            </div>
          </div>

          {/* Operator */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Betreiber *
            </label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              placeholder="z.B. Taxi Müller GmbH"
              required
            />
          </div>

          {/* School */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Zielschule *
            </label>
            <select
              value={selectedSchool?.id || ''}
              onChange={(e) => {
                const school = frieslandSchools.find(s => s.id === e.target.value);
                setSelectedSchool(school || null);
              }}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              required
            >
              <option value="">-- Schule auswählen --</option>
              {frieslandSchools.map(school => (
                <option key={school.id} value={school.id}>
                  {school.name} ({school.type})
                </option>
              ))}
            </select>
          </div>

          {/* Student Selection (only for create mode) */}
          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Schüler hinzufügen (optional) ({selectedStudentIds.length} / {selectedCapacity} ausgewählt)
              </label>
              {isOverCapacity && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Kapazität überschritten! Max. {selectedCapacity} Schüler
                </div>
              )}
              <div className="border border-slate-200 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                {availableStudents.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Keine Schüler verfügbar
                  </p>
                ) : (
                  availableStudents.map(student => (
                    <label
                      key={student.id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedStudentIds.includes(student.id)
                          ? 'bg-[#1e3a5f]/10 border-2 border-[#1e3a5f]'
                          : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(student.id)}
                        onChange={() => toggleStudent(student.id)}
                        className="w-4 h-4 text-[#1e3a5f] rounded border-slate-300 focus:ring-[#1e3a5f]"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-sm flex items-center gap-2">
                          {student.name}
                          {student.specialNeeds?.wheelchair && (
                            <span className="text-red-500 text-xs">♿</span>
                          )}
                          {student.specialNeeds?.companion && (
                            <span className="text-amber-500 text-xs">👥</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{student.address}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <p className="text-sm text-slate-500">
            * Pflichtfelder
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-medium"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSubmit}
              disabled={!routeName || !operator || !selectedSchool}
              className="px-6 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d5a8c] transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {mode === 'create' ? 'Route erstellen' : 'Speichern'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// STOP EDIT MODAL COMPONENT
// =============================================

interface StopEditModalProps {
  isOpen: boolean;
  stop: Stop | null;
  routeId: string | null;
  routeColor: string;
  unassignedStudents: UnassignedStudent[];
  onClose: () => void;
  onSave: (routeId: string, stopId: string, updates: Partial<Stop>, assignedStudentId?: string) => void;
}

function StopEditModal({
  isOpen,
  stop,
  routeId,
  routeColor,
  unassignedStudents,
  onClose,
  onSave,
}: StopEditModalProps) {
  const [stopName, setStopName] = useState('');
  const [stopTime, setStopTime] = useState('');
  const [studentName, setStudentName] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && stop) {
      setStopName(stop.name);
      setStopTime(stop.time);
      setStudentName(stop.student);
      setSelectedStudentId(null);
    }
  }, [isOpen, stop]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeId || !stop) return;

    const updates: Partial<Stop> = {
      name: stopName,
      time: stopTime,
    };

    // Wenn ein Schüler aus der Liste ausgewählt wurde
    if (selectedStudentId) {
      const selectedStudent = unassignedStudents.find(s => s.id === selectedStudentId);
      if (selectedStudent) {
        updates.student = selectedStudent.name;
        updates.address = selectedStudent.address;
        updates.specialNeeds = selectedStudent.specialNeeds;
      }
    } else if (studentName !== stop.student) {
      // Manuell eingegebener Name
      updates.student = studentName;
    }

    onSave(routeId, stop.id, updates, selectedStudentId || undefined);
    onClose();
  };

  const handleSelectStudent = (studentId: string) => {
    const student = unassignedStudents.find(s => s.id === studentId);
    if (student) {
      setSelectedStudentId(studentId);
      setStudentName(student.name);
      setStopName(student.address.split(',')[0]);
    }
  };

  if (!isOpen || !stop) return null;

  const isUnassigned = stop.student === 'Nicht zugeordnet';

  return (
    <div className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div
          className="p-5 rounded-t-xl text-white"
          style={{ background: routeColor }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {isUnassigned ? 'Haltestelle zuordnen' : 'Haltestelle bearbeiten'}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Schüler zuordnen (nur wenn nicht zugeordnet) */}
          {isUnassigned && unassignedStudents.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Schüler zuordnen
              </label>
              <div className="border border-slate-200 rounded-lg max-h-40 overflow-y-auto">
                {unassignedStudents.map(student => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => handleSelectStudent(student.id)}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                      selectedStudentId === student.id ? 'bg-[#1e3a5f]/10 border-l-2 border-[#1e3a5f]' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#2d5a8c] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm flex items-center gap-1">
                        {student.name}
                        {student.specialNeeds?.wheelchair && <span className="text-red-500">♿</span>}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{student.address}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Oder manuell eingeben */}
          {isUnassigned && unassignedStudents.length > 0 && (
            <div className="relative flex items-center gap-2 text-xs text-slate-400">
              <div className="flex-1 h-px bg-slate-200" />
              <span>oder manuell eingeben</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          )}

          {/* Schüler Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Schüler Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => {
                setStudentName(e.target.value);
                setSelectedStudentId(null);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              placeholder="Name des Schülers"
            />
          </div>

          {/* Haltestellen Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Haltestellen-Name / Adresse
            </label>
            <input
              type="text"
              value={stopName}
              onChange={(e) => setStopName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              placeholder="z.B. Mühlenweg 12"
            />
          </div>

          {/* Zeit */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Abholzeit
            </label>
            <input
              type="time"
              value={stopTime}
              onChange={(e) => setStopTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-medium"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d5a8c] transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================
// EXPORT MODAL COMPONENT
// =============================================

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  routes: TransportRoute[];
  stats: RouteStatistics;
}

function ExportModal({ isOpen, onClose, routes, stats }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportAsCSV(routes);
    } else if (exportFormat === 'json') {
      exportAsJSON(routes);
    }
    onClose();
  };

  const exportAsCSV = (routes: TransportRoute[]) => {
    const headers = ['Route', 'Fahrzeug', 'Betreiber', 'Schule', 'Abfahrt', 'Ankunft', 'Distanz (km)', 'Kosten (€)', 'Schüler'];
    const rows = routes.map(route => [
      route.name,
      route.vehicle,
      route.operator,
      route.school.name,
      route.departureTime,
      route.arrivalTime,
      route.distance.toFixed(1),
      route.cost.toFixed(2),
      route.stops.map(s => s.student).join('; '),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    downloadFile(csv, 'routen-export.csv', 'text/csv');
  };

  const exportAsJSON = (routes: TransportRoute[]) => {
    const json = JSON.stringify(routes, null, 2);
    downloadFile(json, 'routen-export.json', 'application/json');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Download className="w-5 h-5" />
            Routen exportieren
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {/* Stats Summary */}
          <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500">Routen:</span>
              <span className="ml-2 font-semibold">{stats.totalRoutes}</span>
            </div>
            <div>
              <span className="text-slate-500">Schüler:</span>
              <span className="ml-2 font-semibold">{stats.totalStudents}</span>
            </div>
            <div>
              <span className="text-slate-500">Distanz:</span>
              <span className="ml-2 font-semibold">{stats.totalDistance.toFixed(1)} km</span>
            </div>
            <div>
              <span className="text-slate-500">Kosten:</span>
              <span className="ml-2 font-semibold">{formatCurrency(stats.totalCost)}</span>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Exportformat
            </label>
            <div className="flex gap-2">
              {[
                { value: 'csv', label: 'CSV', icon: FileDown },
                { value: 'json', label: 'JSON', icon: Copy },
                { value: 'pdf', label: 'PDF', icon: Printer, disabled: true },
              ].map(({ value, label, icon: Icon, disabled }) => (
                <button
                  key={value}
                  onClick={() => !disabled && setExportFormat(value as 'csv' | 'json' | 'pdf')}
                  disabled={disabled}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors flex flex-col items-center gap-1 ${
                    exportFormat === value
                      ? 'border-[#1e3a5f] bg-[#1e3a5f]/5'
                      : disabled
                      ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                      : 'border-slate-200 hover:border-[#1e3a5f]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-medium"
          >
            Abbrechen
          </button>
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-2.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d5a8c] transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportieren
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================
// MAIN COMPONENT
// =============================================

export default function RouteMapPlanner() {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [routes, setRoutes] = useState<TransportRoute[]>(demoRoutes);
  const [unassignedStudents, setUnassignedStudents] = useState<UnassignedStudent[]>(initialUnassigned);
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'routes' | 'students'>('routes');
  const [mode, setMode] = useState<MapMode>('view');
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  // Modals
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [routeModalMode, setRouteModalMode] = useState<'create' | 'edit'>('create');
  const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Stop Edit Modal
  const [stopEditModalOpen, setStopEditModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [editingStopRouteId, setEditingStopRouteId] = useState<string | null>(null);

  // Confirm Dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  } | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Refs für Handler (um Closure-Probleme zu vermeiden)
  const modeRef = useRef<MapMode>(mode);
  const activeRouteIdRef = useRef<string | null>(activeRouteId);
  const routesRef = useRef<TransportRoute[]>(routes);

  // Refs synchron halten
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    activeRouteIdRef.current = activeRouteId;
  }, [activeRouteId]);

  useEffect(() => {
    routesRef.current = routes;
  }, [routes]);

  // Show toast (vor dem Hook definiert)
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  }, []);

  // Handle map click (vor dem Hook definiert, verwendet Refs)
  const handleMapClick = useCallback((coords: Coordinates) => {
    if (modeRef.current !== 'add' || !activeRouteIdRef.current) return;

    // Berechne Zeit basierend auf der letzten Haltestelle
    const currentRoute = routesRef.current.find(r => r.id === activeRouteIdRef.current);
    let stopTime = '--:--';
    if (currentRoute) {
      const lastStop = currentRoute.stops[currentRoute.stops.length - 1];
      if (lastStop && lastStop.time !== '--:--') {
        const [h, m] = lastStop.time.split(':').map(Number);
        const newMinutes = h * 60 + m + 5;
        const newH = Math.floor(newMinutes / 60) % 24;
        const newM = newMinutes % 60;
        stopTime = `${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
      } else if (currentRoute.departureTime) {
        stopTime = currentRoute.departureTime;
      }
    }

    const newStop: Stop = {
      id: `stop-${Date.now()}`,
      name: 'Neue Haltestelle',
      student: 'Nicht zugeordnet',
      time: stopTime,
      coords,
    };

    setRoutes((prev) =>
      prev.map((route) =>
        route.id === activeRouteIdRef.current
          ? { ...route, stops: [...route.stops, newStop], routeGeometry: undefined }
          : route
      )
    );

    // Automatisch zurück in View-Modus nach Hinzufügen
    setMode('view');

    // Modal zum Zuordnen öffnen
    setEditingStop(newStop);
    setEditingStopRouteId(activeRouteIdRef.current);
    setStopEditModalOpen(true);
  }, []);

  // Handle stop drag (vor dem Hook definiert)
  const handleStopDrag = useCallback((routeId: string, stopId: string, newCoords: Coordinates) => {
    setRoutes((prev) =>
      prev.map((route) =>
        route.id === routeId
          ? {
              ...route,
              stops: route.stops.map((stop) =>
                stop.id === stopId ? { ...stop, coords: newCoords } : stop
              ),
            }
          : route
      )
    );
    setToast({ message: 'Haltestelle verschoben', type: 'info' });
  }, []);

  // Leaflet Map Hook
  const {
    isLoaded,
    renderRoute,
    renderUnassignedStudents,
    zoomIn,
    zoomOut,
    fitBounds,
    focusRoute,
    setCursor,
  } = useLeafletMap(mapContainerRef, {
    center: FRIESLAND_CENTER,
    zoom: 11,
    mode,
    onMapClick: handleMapClick,
    onStopDragEnd: handleStopDrag,
  });

  // Cursor synchron mit Mode halten
  useEffect(() => {
    if (mode === 'add') {
      setCursor('crosshair');
    } else {
      setCursor('');
    }
  }, [mode, setCursor]);

  // Statistics
  const stats: RouteStatistics = useMemo(() => ({
    totalRoutes: routes.length,
    totalStudents: routes.reduce((sum, r) => sum + r.stops.length, 0),
    totalDistance: routes.reduce((sum, r) => sum + r.distance, 0),
    totalCost: routes.reduce((sum, r) => sum + r.cost, 0),
    unassignedCount: unassignedStudents.length,
  }), [routes, unassignedStudents]);

  // Filtered data
  const filteredRoutes = useMemo(() => {
    if (!searchQuery) return routes;
    const query = searchQuery.toLowerCase();
    return routes.filter(
      r =>
        r.name.toLowerCase().includes(query) ||
        r.operator.toLowerCase().includes(query) ||
        r.school.name.toLowerCase().includes(query) ||
        r.stops.some(s => s.student.toLowerCase().includes(query))
    );
  }, [routes, searchQuery]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return unassignedStudents;
    const query = searchQuery.toLowerCase();
    return unassignedStudents.filter(
      s =>
        s.name.toLowerCase().includes(query) ||
        s.address.toLowerCase().includes(query) ||
        s.school?.name.toLowerCase().includes(query)
    );
  }, [unassignedStudents, searchQuery]);

  // Select route
  const handleSelectRoute = useCallback(async (routeId: string) => {
    const newActiveId = routeId === activeRouteId ? null : routeId;
    setActiveRouteId(newActiveId);

    if (newActiveId) {
      const route = routes.find((r) => r.id === newActiveId);
      if (route) {
        focusRoute(route);

        // Load real street routing if not already loaded
        if (!route.routeGeometry && route.stops.length > 0) {
          setIsLoadingRoute(true);
          try {
            const waypoints = [
              ...route.stops.map((s) => s.coords),
              route.school.coords,
            ];
            const result = await calculateStreetRoute(waypoints);

            setRoutes((prev) =>
              prev.map((r) =>
                r.id === routeId
                  ? {
                      ...r,
                      routeGeometry: result.coordinates,
                      distance: result.distance / 1000,
                      duration: Math.round(result.duration / 60),
                    }
                  : r
              )
            );
          } catch (error) {
            console.error('Route loading failed:', error);
          } finally {
            setIsLoadingRoute(false);
          }
        }
      }
    }
  }, [activeRouteId, routes, focusRoute]);

  // Change mode
  const handleModeChange = useCallback((newMode: MapMode) => {
    // Verhindere Add-Modus ohne ausgewählte Route
    if (newMode === 'add' && !activeRouteId) {
      showToast('Wähle erst eine Route aus', 'warning');
      return;
    }

    setMode(newMode);

    if (newMode === 'add') {
      setCursor('crosshair');
      const routeName = routes.find(r => r.id === activeRouteId)?.name;
      showToast(`Klicke auf die Karte um Haltestelle zu "${routeName}" hinzuzufügen`, 'info');
    } else {
      setCursor('');
    }
  }, [activeRouteId, routes, setCursor, showToast]);

  // Open stop edit modal
  const handleEditStop = useCallback((routeId: string, stop: Stop) => {
    setEditingStop(stop);
    setEditingStopRouteId(routeId);
    setStopEditModalOpen(true);
  }, []);

  // Save stop changes
  const handleSaveStop = useCallback((routeId: string, stopId: string, updates: Partial<Stop>, assignedStudentId?: string) => {
    setRoutes(prev => prev.map(route =>
      route.id === routeId
        ? {
            ...route,
            stops: route.stops.map(stop =>
              stop.id === stopId ? { ...stop, ...updates } : stop
            ),
            routeGeometry: undefined, // Route neu berechnen
          }
        : route
    ));

    // Wenn ein Schüler zugeordnet wurde, aus der unassigned Liste entfernen
    if (assignedStudentId) {
      setUnassignedStudents(prev => prev.filter(s => s.id !== assignedStudentId));
      showToast('Schüler zugeordnet', 'success');
    } else {
      showToast('Haltestelle aktualisiert', 'success');
    }
  }, [showToast]);

  // Add student to existing route
  const handleAddStudentToRoute = useCallback(async (studentId: string, routeId?: string) => {
    const targetRouteId = routeId || activeRouteId;

    if (!targetRouteId) {
      showToast('Bitte wähle zuerst eine Route aus', 'warning');
      return;
    }

    const student = unassignedStudents.find(s => s.id === studentId);
    if (!student) {
      showToast('Schüler nicht gefunden', 'error');
      return;
    }

    const targetRoute = routes.find(r => r.id === targetRouteId);
    if (!targetRoute) {
      showToast('Route nicht gefunden', 'error');
      return;
    }

    // Check capacity
    const capacity = getVehicleCapacity(targetRoute.vehicle);
    if (targetRoute.stops.length >= capacity) {
      showToast(`Kapazität erreicht! Max. ${capacity} Schüler`, 'warning');
    }

    // Calculate time for new stop
    const lastStop = targetRoute.stops[targetRoute.stops.length - 1];
    const [lastHours, lastMinutes] = lastStop
      ? lastStop.time.split(':').map(Number)
      : targetRoute.departureTime.split(':').map(Number);
    const newStopTime = lastHours * 60 + lastMinutes + 5;
    const newStopHours = Math.floor(newStopTime / 60) % 24;
    const newStopMinutes = newStopTime % 60;

    const newStop: Stop = {
      id: `stop-${Date.now()}`,
      name: student.address.split(',')[0],
      student: student.name,
      time: `${newStopHours.toString().padStart(2, '0')}:${newStopMinutes.toString().padStart(2, '0')}`,
      coords: student.coords,
      address: student.address,
      specialNeeds: student.specialNeeds,
    };

    // Add stop to route
    setRoutes(prev => prev.map(route =>
      route.id === targetRouteId
        ? { ...route, stops: [...route.stops, newStop], routeGeometry: undefined }
        : route
    ));

    // Remove student from unassigned list
    setUnassignedStudents(prev => prev.filter(s => s.id !== studentId));

    showToast(`${student.name} zu ${targetRoute.name} hinzugefügt`, 'success');

    // Recalculate route
    const updatedStops = [...targetRoute.stops, newStop];
    if (updatedStops.length > 0) {
      try {
        const waypoints = [
          ...updatedStops.map(s => s.coords),
          targetRoute.school.coords,
        ];
        const result = await calculateStreetRoute(waypoints);

        setRoutes(prev => prev.map(r =>
          r.id === targetRouteId
            ? {
                ...r,
                routeGeometry: result.coordinates,
                distance: result.distance / 1000,
                duration: Math.round(result.duration / 60),
                cost: (result.distance / 1000) * 2.5,
              }
            : r
        ));
      } catch (error) {
        console.error('Route recalculation failed:', error);
      }
    }
  }, [activeRouteId, routes, unassignedStudents, showToast]);

  // Remove student from route
  const handleRemoveStudent = useCallback((routeId: string, stopId: string) => {
    const route = routes.find(r => r.id === routeId);
    const stop = route?.stops.find(s => s.id === stopId);

    if (!route || !stop) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Schüler entfernen',
      message: `Möchtest du "${stop.student}" wirklich aus der Route "${route.name}" entfernen?`,
      type: 'warning',
      onConfirm: () => {
        // Remove stop from route
        setRoutes(prev => prev.map(r =>
          r.id === routeId
            ? { ...r, stops: r.stops.filter(s => s.id !== stopId), routeGeometry: undefined }
            : r
        ));

        // Add back to unassigned if has coords
        if (stop.coords && stop.student !== 'Nicht zugeordnet') {
          const newStudent: UnassignedStudent = {
            id: `student-${Date.now()}`,
            name: stop.student,
            address: stop.address || stop.name,
            coords: stop.coords,
            specialNeeds: stop.specialNeeds,
          };
          setUnassignedStudents(prev => [...prev, newStudent]);
        }

        showToast(`${stop.student} wurde entfernt`, 'success');
        setConfirmDialog(null);
      },
    });
  }, [routes, showToast]);

  // Delete route
  const handleDeleteRoute = useCallback((routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (!route) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Route löschen',
      message: `Möchtest du die Route "${route.name}" mit ${route.stops.length} Haltestellen wirklich löschen? Die Schüler werden wieder als nicht zugeordnet markiert.`,
      type: 'danger',
      onConfirm: () => {
        // Add students back to unassigned
        const studentsToReturn: UnassignedStudent[] = route.stops
          .filter(s => s.student !== 'Nicht zugeordnet')
          .map(s => ({
            id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: s.student,
            address: s.address || s.name,
            coords: s.coords,
            specialNeeds: s.specialNeeds,
          }));

        setUnassignedStudents(prev => [...prev, ...studentsToReturn]);

        // Remove route
        setRoutes(prev => prev.filter(r => r.id !== routeId));

        if (activeRouteId === routeId) {
          setActiveRouteId(null);
        }

        showToast(`Route "${route.name}" wurde gelöscht`, 'success');
        setConfirmDialog(null);
      },
    });
  }, [routes, activeRouteId, showToast]);

  // Edit route
  const handleEditRoute = useCallback((routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (route) {
      setEditingRoute(route);
      setRouteModalMode('edit');
      setRouteModalOpen(true);
    }
  }, [routes]);

  // Save edited route or create new route
  const handleSaveRoute = useCallback(async (data: {
    name: string;
    vehicle: VehicleType;
    operator: string;
    school: School;
    departureTime: string;
    selectedStudentIds?: string[];
  }) => {
    if (routeModalMode === 'edit' && editingRoute) {
      // Update existing route
      setRoutes(prev => prev.map(r =>
        r.id === editingRoute.id
          ? {
              ...r,
              name: data.name,
              vehicle: data.vehicle,
              operator: data.operator,
              school: data.school,
              departureTime: data.departureTime,
            }
          : r
      ));
      showToast(`Route "${data.name}" wurde aktualisiert`, 'success');
    } else {
      // Create new route
      const studentIds = data.selectedStudentIds || [];
      const selectedStudents = unassignedStudents.filter(s => studentIds.includes(s.id));

      const stops: Stop[] = selectedStudents.map((student, index) => {
        const [hours, minutes] = data.departureTime.split(':').map(Number);
        const stopTime = hours * 60 + minutes + (index * 5);
        const stopHours = Math.floor(stopTime / 60) % 24;
        const stopMinutes = stopTime % 60;

        return {
          id: `stop-${Date.now()}-${index}`,
          name: student.address.split(',')[0],
          student: student.name,
          time: `${stopHours.toString().padStart(2, '0')}:${stopMinutes.toString().padStart(2, '0')}`,
          coords: student.coords,
          address: student.address,
          specialNeeds: student.specialNeeds,
        };
      });

      // Calculate arrival time
      const [depHours, depMinutes] = data.departureTime.split(':').map(Number);
      const totalMinutes = depHours * 60 + depMinutes + (stops.length * 5) + 15;
      const arrHours = Math.floor(totalMinutes / 60) % 24;
      const arrMinutes = totalMinutes % 60;
      const arrivalTime = `${arrHours.toString().padStart(2, '0')}:${arrMinutes.toString().padStart(2, '0')}`;

      // Calculate initial route statistics
      const estimatedDistance = stops.length * 4 + 8;
      const estimatedDuration = stops.length * 5 + 15;
      const estimatedCost = estimatedDistance * 2.5;

      const newRoute: TransportRoute = {
        id: `route-${Date.now()}`,
        name: data.name,
        color: getNextRouteColor(routes),
        vehicle: data.vehicle,
        operator: data.operator,
        distance: estimatedDistance,
        duration: estimatedDuration,
        cost: estimatedCost,
        departureTime: data.departureTime,
        arrivalTime,
        school: data.school,
        stops,
      };

      setRoutes(prev => [...prev, newRoute]);
      if (studentIds.length > 0) {
        setUnassignedStudents(prev => prev.filter(s => !studentIds.includes(s.id)));
      }
      setActiveRouteId(newRoute.id);
      showToast(
        stops.length > 0
          ? `Route "${newRoute.name}" erstellt mit ${stops.length} Schülern`
          : `Route "${newRoute.name}" erstellt - füge jetzt Schüler hinzu`,
        'success'
      );

      // Load street routing for the new route (async)
      if (stops.length > 0) {
        try {
          const waypoints = [
            ...stops.map((s) => s.coords),
            newRoute.school.coords,
          ];
          const result = await calculateStreetRoute(waypoints);

          setRoutes((prev) =>
            prev.map((r) =>
              r.id === newRoute.id
                ? {
                    ...r,
                    routeGeometry: result.coordinates,
                    distance: result.distance / 1000,
                    duration: Math.round(result.duration / 60),
                    cost: (result.distance / 1000) * 2.5,
                  }
                : r
            )
          );
        } catch (error) {
          console.error('Route loading failed:', error);
        }
      }
    }

    setEditingRoute(null);
    setRouteModalOpen(false);
  }, [routeModalMode, editingRoute, showToast, routes, unassignedStudents]);

  // Optimize route
  const handleOptimizeRoute = useCallback(async (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (!route || route.stops.length < 3) {
      showToast('Mindestens 3 Haltestellen für Optimierung nötig', 'info');
      return;
    }

    setIsOptimizing(true);
    showToast('Route wird optimiert...', 'info');

    try {
      // Use the first stop's coords as start (could be depot in real scenario)
      const startCoords = route.stops[0].coords;
      const result = await optimizeStopOrder(
        route.stops,
        startCoords,
        route.school.coords
      );

      if (result.savedDistance > 0) {
        // Update route with optimized order
        setRoutes(prev => prev.map(r =>
          r.id === routeId
            ? {
                ...r,
                stops: result.optimizedStops,
                isOptimized: true,
                routeGeometry: undefined, // Force recalculation
              }
            : r
        ));

        showToast(
          `Route optimiert! ${result.savedDistance.toFixed(1)} km gespart`,
          'success'
        );

        // Recalculate street routing
        const waypoints = [
          ...result.optimizedStops.map(s => s.coords),
          route.school.coords,
        ];
        const streetResult = await calculateStreetRoute(waypoints);

        setRoutes(prev => prev.map(r =>
          r.id === routeId
            ? {
                ...r,
                routeGeometry: streetResult.coordinates,
                distance: streetResult.distance / 1000,
                duration: Math.round(streetResult.duration / 60),
                cost: (streetResult.distance / 1000) * 2.5,
              }
            : r
        ));
      } else {
        showToast('Route ist bereits optimal', 'info');
      }
    } catch (error) {
      console.error('Optimization failed:', error);
      showToast('Optimierung fehlgeschlagen', 'error');
    } finally {
      setIsOptimizing(false);
    }
  }, [routes, showToast]);

  // Reorder stops
  const handleReorderStops = useCallback((routeId: string, fromIndex: number, toIndex: number) => {
    setRoutes(prev => prev.map(route => {
      if (route.id !== routeId) return route;

      const newStops = [...route.stops];
      const [movedStop] = newStops.splice(fromIndex, 1);
      newStops.splice(toIndex, 0, movedStop);

      // Recalculate times
      const [startHours, startMinutes] = route.departureTime.split(':').map(Number);
      const updatedStops = newStops.map((stop, idx) => {
        const stopTime = startHours * 60 + startMinutes + (idx * 5);
        const stopHours = Math.floor(stopTime / 60) % 24;
        const stopMinutes = stopTime % 60;
        return {
          ...stop,
          time: `${stopHours.toString().padStart(2, '0')}:${stopMinutes.toString().padStart(2, '0')}`,
        };
      });

      return {
        ...route,
        stops: updatedStops,
        routeGeometry: undefined, // Force recalculation
        isOptimized: false,
      };
    }));

    showToast('Haltestellen-Reihenfolge geändert', 'info');
  }, [showToast]);

  // Render routes on map
  useEffect(() => {
    if (!isLoaded) return;

    routes.forEach((route) => {
      renderRoute(route, route.id === activeRouteId, mode);
    });
  }, [isLoaded, routes, activeRouteId, mode, renderRoute]);

  // Render unassigned students
  useEffect(() => {
    if (!isLoaded) return;
    renderUnassignedStudents(unassignedStudents);
  }, [isLoaded, unassignedStudents, renderUnassignedStudents]);

  // Initial fit bounds
  useEffect(() => {
    if (isLoaded && routes.length > 0) {
      fitBounds(routes);
    }
  }, [isLoaded]);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-96 bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
        {/* Header */}
        <div className="p-5 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8c] text-white">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Bus className="w-5 h-5" />
            Schülerbeförderung
          </h1>
          <p className="text-sm opacity-80 mt-1">Landkreis Friesland - Routenplanung</p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suchen..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('routes')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'routes'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Navigation className="w-4 h-4" />
            Routen
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
              {filteredRoutes.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'students'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Schüler
            {filteredStudents.length > 0 && (
              <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded text-xs">
                {filteredStudents.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'routes' && (
            <div className="space-y-3">
              {filteredRoutes.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Navigation className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery ? 'Keine Routen gefunden' : 'Keine Routen vorhanden'}
                  </p>
                </div>
              ) : (
                filteredRoutes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    isActive={activeRouteId === route.id}
                    onSelect={() => handleSelectRoute(route.id)}
                    onDelete={() => handleDeleteRoute(route.id)}
                    onEdit={() => handleEditRoute(route.id)}
                    onOptimize={() => handleOptimizeRoute(route.id)}
                    onRemoveStudent={(stopId) => handleRemoveStudent(route.id, stopId)}
                    onReorderStops={(from, to) => handleReorderStops(route.id, from, to)}
                    onEditStop={(stop) => handleEditStop(route.id, stop)}
                  />
                ))
              )}

              {/* Add Route Button */}
              <button
                onClick={() => {
                  setRouteModalMode('create');
                  setEditingRoute(null);
                  setRouteModalOpen(true);
                }}
                className="w-full p-4 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-[#1e3a5f] hover:text-[#1e3a5f] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Neue Route erstellen
              </button>
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-slate-700">Nicht zugeordnet</h3>
                <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  {filteredStudents.length}
                </span>
              </div>

              {/* Active Route Indicator */}
              {activeRouteId && (
                <div className="mb-3 p-3 bg-[#1e3a5f]/10 border border-[#1e3a5f] rounded-lg">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: routes.find(r => r.id === activeRouteId)?.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1e3a5f]">
                        Aktive Route: {routes.find(r => r.id === activeRouteId)?.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Klicke auf einen Schüler zum Hinzufügen
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!activeRouteId && filteredStudents.length > 0 && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">
                    Wähle zuerst eine Route aus, um Schüler hinzuzufügen
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {filteredStudents.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onAssign={() => handleAddStudentToRoute(student.id)}
                  />
                ))}
              </div>

              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery ? 'Keine Schüler gefunden' : 'Alle Schüler zugeordnet!'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={() => setExportModalOpen(true)}
            className="w-full py-2.5 px-4 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d5a8c] transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Routen exportieren
          </button>
        </div>
      </aside>

      {/* Map */}
      <main className="flex-1 relative">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Loading Overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-slate-100 flex items-center justify-center z-[1000]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#1e3a5f] animate-spin" />
              <span className="text-sm text-slate-600">Karte wird geladen...</span>
            </div>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="absolute top-5 left-5 z-[1000] bg-white rounded-lg p-1.5 shadow-lg flex gap-1">
          {[
            { mode: 'view' as const, icon: Eye, label: 'Ansicht' },
            { mode: 'edit' as const, icon: Edit3, label: 'Bearbeiten' },
            { mode: 'add' as const, icon: Plus, label: 'Haltestelle' },
          ].map(({ mode: m, icon: Icon, label }) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                mode === m
                  ? 'bg-[#1e3a5f] text-white'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Route Loading/Optimizing Indicator */}
        {(isLoadingRoute || isOptimizing) && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#1e3a5f]" />
            <span className="text-sm text-slate-600">
              {isOptimizing ? 'Route wird optimiert...' : 'Route wird berechnet...'}
            </span>
          </div>
        )}

        {/* Add Mode Banner */}
        {mode === 'add' && activeRouteId && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-[#1e3a5f] text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 animate-pulse" />
              <span className="font-medium">
                Klicke auf die Karte um Haltestelle hinzuzufügen
              </span>
            </div>
            <button
              onClick={() => setMode('view')}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Abbrechen
            </button>
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute top-5 right-5 z-[1000] flex flex-col gap-2">
          <button
            onClick={zoomIn}
            className="w-11 h-11 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-[#1e3a5f] hover:text-white transition-colors"
            title="Vergrößern"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={zoomOut}
            className="w-11 h-11 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-[#1e3a5f] hover:text-white transition-colors"
            title="Verkleinern"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => fitBounds(routes)}
            className="w-11 h-11 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-[#1e3a5f] hover:text-white transition-colors"
            title="Alle Routen anzeigen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Info Panel */}
        <div className="absolute bottom-5 left-5 right-5 z-[1000] bg-white rounded-xl p-4 shadow-lg flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1e3a5f]">{stats.totalRoutes}</div>
            <div className="text-xs text-slate-500">Routen</div>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1e3a5f]">{stats.totalStudents}</div>
            <div className="text-xs text-slate-500">Schüler</div>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1e3a5f]">{stats.totalDistance.toFixed(1)}</div>
            <div className="text-xs text-slate-500">km gesamt</div>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1e3a5f]">{formatCurrency(stats.totalCost)}</div>
            <div className="text-xs text-slate-500">pro Tag</div>
          </div>
          {stats.unassignedCount > 0 && (
            <>
              <div className="w-px h-10 bg-slate-200" />
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-500">{stats.unassignedCount}</div>
                <div className="text-xs text-slate-500">offen</div>
              </div>
            </>
          )}

          {/* Keyboard Hints */}
          <div className="ml-auto flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">Drag</kbd>
              Haltestellen sortieren
            </span>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </main>

      {/* Route Modal (Create/Edit) */}
      <RouteModal
        isOpen={routeModalOpen}
        mode={routeModalMode}
        initialData={editingRoute || undefined}
        onClose={() => {
          setRouteModalOpen(false);
          setEditingRoute(null);
        }}
        onSave={handleSaveRoute}
        availableStudents={unassignedStudents}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        routes={routes}
        stats={stats}
      />

      {/* Stop Edit Modal */}
      <StopEditModal
        isOpen={stopEditModalOpen}
        stop={editingStop}
        routeId={editingStopRouteId}
        routeColor={routes.find(r => r.id === editingStopRouteId)?.color || '#1e3a5f'}
        unassignedStudents={unassignedStudents}
        onClose={() => {
          setStopEditModalOpen(false);
          setEditingStop(null);
          setEditingStopRouteId(null);
        }}
        onSave={handleSaveStop}
      />

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
          confirmText={confirmDialog.type === 'danger' ? 'Löschen' : 'Bestätigen'}
        />
      )}
    </div>
  );
}
