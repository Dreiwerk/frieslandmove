// components/RouteMapPlanner.tsx

'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
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
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Save,
} from 'lucide-react';

import { useLeafletMap } from '@/hooks/useLeafletMap';
import { calculateStreetRoute } from '@/lib/routing-service';
import { demoRoutes, unassignedStudents as initialUnassigned, FRIESLAND_CENTER, frieslandSchools, getNextRouteColor } from '@/lib/friesland-routes-data';
import type { TransportRoute, UnassignedStudent, Stop, Coordinates, MapMode, RouteStatistics, VehicleType, School } from '@/types/routing';

// =============================================
// TOAST COMPONENT
// =============================================

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-[#1e3a5f]',
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Sparkles,
  }[type];

  return (
    <div className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-[2000] ${bgColor} text-white px-5 py-3 rounded-lg font-medium shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4`}>
      <Icon className="w-4 h-4" />
      {message}
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
  onDelete?: () => void;
}

function RouteCard({ route, isActive, onSelect, onDelete }: RouteCardProps) {
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
      </div>

      {/* Expanded Stops */}
      {isActive && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-1">
          {route.stops.map((stop, idx) => (
            <div key={stop.id} className="flex items-center py-2 group">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-3 flex-shrink-0"
                style={{ background: route.color }}
              >
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{stop.student}</div>
                <div className="text-xs text-slate-500 truncate">
                  {stop.time} • {stop.name}
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-400 cursor-grab flex-shrink-0" />
            </div>
          ))}

          {/* School Destination */}
          <div className="flex items-center py-2 pt-3 border-t border-dashed border-slate-200 mt-2">
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
            <button className="flex-1 text-xs text-slate-600 hover:text-[#1e3a5f] py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1">
              <Edit3 className="w-3 h-3" />
              Bearbeiten
            </button>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-xs text-red-500 hover:text-red-600 py-2 px-3 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
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
  onAssign?: () => void;
}

function StudentCard({ student, onAssign }: StudentCardProps) {
  const initials = student.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <div
      className="flex items-center p-3 bg-slate-50 rounded-lg cursor-grab hover:bg-slate-100 transition-colors group"
      draggable
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
          <div className="text-xs text-slate-400 truncate">→ {student.school.name}</div>
        )}
      </div>
      <button
        onClick={onAssign}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-[#1e3a5f] hover:text-white text-slate-400 transition-all"
        title="Zur Route hinzufügen"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

// =============================================
// CREATE ROUTE MODAL COMPONENT
// =============================================

interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoute: (route: Omit<TransportRoute, 'id' | 'color' | 'distance' | 'duration' | 'cost' | 'stops'> & { selectedStudentIds: string[] }) => void;
  availableStudents: UnassignedStudent[];
}

function CreateRouteModal({ isOpen, onClose, onCreateRoute, availableStudents }: CreateRouteModalProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!routeName || !operator || !selectedSchool || selectedStudentIds.length === 0) {
      return;
    }

    onCreateRoute({
      name: routeName,
      vehicle,
      operator,
      school: selectedSchool,
      departureTime,
      arrivalTime: calculateArrivalTime(departureTime, selectedStudentIds.length),
      selectedStudentIds,
    });

    // Reset form
    setRouteName('');
    setOperator('');
    setSelectedSchool(null);
    setDepartureTime('07:00');
    setSelectedStudentIds([]);
    onClose();
  };

  const calculateArrivalTime = (departure: string, numStops: number): string => {
    const [hours, minutes] = departure.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + (numStops * 5) + 15;
    const arrHours = Math.floor(totalMinutes / 60) % 24;
    const arrMinutes = totalMinutes % 60;
    return `${arrHours.toString().padStart(2, '0')}:${arrMinutes.toString().padStart(2, '0')}`;
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8c] text-white">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bus className="w-6 h-6" />
            Neue Route erstellen
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

          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Schüler hinzufügen * ({selectedStudentIds.length} ausgewählt)
            </label>
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
                      </div>
                      <div className="text-xs text-slate-500">{student.address}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
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
              disabled={!routeName || !operator || !selectedSchool || selectedStudentIds.length === 0}
              className="px-6 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#2d5a8c] transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Route erstellen
            </button>
          </div>
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isCreateRouteModalOpen, setIsCreateRouteModalOpen] = useState(false);

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
    onMapClick: (coords) => handleMapClick(coords),
    onStopDragEnd: (routeId, stopId, newCoords) => handleStopDrag(routeId, stopId, newCoords),
  });

  // Statistics
  const stats: RouteStatistics = {
    totalRoutes: routes.length,
    totalStudents: routes.reduce((sum, r) => sum + r.stops.length, 0),
    totalDistance: routes.reduce((sum, r) => sum + r.distance, 0),
    totalCost: routes.reduce((sum, r) => sum + r.cost, 0),
    unassignedCount: unassignedStudents.length,
  };

  // Show toast
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  }, []);

  // Handle map click (add stop mode)
  const handleMapClick = useCallback((coords: Coordinates) => {
    if (mode !== 'add' || !activeRouteId) return;

    const newStop: Stop = {
      id: `stop-${Date.now()}`,
      name: 'Neue Haltestelle',
      student: 'Nicht zugeordnet',
      time: '--:--',
      coords,
    };

    setRoutes((prev) =>
      prev.map((route) =>
        route.id === activeRouteId
          ? { ...route, stops: [...route.stops, newStop] }
          : route
      )
    );

    showToast('Haltestelle hinzugefügt', 'success');
  }, [mode, activeRouteId, showToast]);

  // Handle stop drag
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
    showToast('Haltestelle verschoben', 'info');
  }, [showToast]);

  // Select route
  const handleSelectRoute = useCallback(async (routeId: string) => {
    const newActiveId = routeId === activeRouteId ? null : routeId;
    setActiveRouteId(newActiveId);

    if (newActiveId) {
      const route = routes.find((r) => r.id === newActiveId);
      if (route) {
        focusRoute(route);

        // Load real street routing if not already loaded
        if (!route.routeGeometry) {
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
    setMode(newMode);

    if (newMode === 'add') {
      setCursor('crosshair');
      if (!activeRouteId) {
        showToast('Wähle erst eine Route aus', 'info');
      } else {
        showToast('Klicke auf die Karte für neue Haltestelle', 'info');
      }
    } else {
      setCursor('');
    }
  }, [activeRouteId, setCursor, showToast]);

  // Add student to existing route
  const handleAddStudentToRoute = useCallback((studentId: string, routeId?: string) => {
    const targetRouteId = routeId || activeRouteId;

    if (!targetRouteId) {
      showToast('Bitte wähle zuerst eine Route aus', 'info');
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

    // Calculate time for new stop
    const lastStop = targetRoute.stops[targetRoute.stops.length - 1];
    const [lastHours, lastMinutes] = lastStop ? lastStop.time.split(':').map(Number) : targetRoute.departureTime.split(':').map(Number);
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
        ? { ...route, stops: [...route.stops, newStop] }
        : route
    ));

    // Remove student from unassigned list
    setUnassignedStudents(prev => prev.filter(s => s.id !== studentId));

    showToast(`${student.name} zu ${targetRoute.name} hinzugefügt`, 'success');

    // Recalculate route
    setTimeout(async () => {
      const updatedRoute = routes.find(r => r.id === targetRouteId);
      if (updatedRoute) {
        try {
          const waypoints = [
            ...updatedRoute.stops.map(s => s.coords),
            newStop.coords,
            updatedRoute.school.coords,
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
    }, 500);
  }, [activeRouteId, routes, unassignedStudents, showToast]);

  // Create new route
  const handleCreateRoute = useCallback((routeData: Omit<TransportRoute, 'id' | 'color' | 'distance' | 'duration' | 'cost' | 'stops'> & { selectedStudentIds: string[] }) => {
    // Create stops from selected students
    const selectedStudents = unassignedStudents.filter(s => routeData.selectedStudentIds.includes(s.id));

    const stops: Stop[] = selectedStudents.map((student, index) => {
      const [hours, minutes] = routeData.departureTime.split(':').map(Number);
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

    // Calculate initial route statistics (will be updated with real routing)
    const estimatedDistance = stops.length * 4 + 8;
    const estimatedDuration = stops.length * 5 + 15;
    const estimatedCost = estimatedDistance * 2.5;

    const newRoute: TransportRoute = {
      id: `route-${Date.now()}`,
      name: routeData.name,
      color: getNextRouteColor(routes),
      vehicle: routeData.vehicle,
      operator: routeData.operator,
      distance: estimatedDistance,
      duration: estimatedDuration,
      cost: estimatedCost,
      departureTime: routeData.departureTime,
      arrivalTime: routeData.arrivalTime,
      school: routeData.school,
      stops,
    };

    setRoutes(prev => [...prev, newRoute]);
    setUnassignedStudents(prev => prev.filter(s => !routeData.selectedStudentIds.includes(s.id)));
    setActiveRouteId(newRoute.id);
    showToast(`Route "${newRoute.name}" erstellt mit ${stops.length} Schülern`, 'success');

    // Load street routing for the new route
    setTimeout(async () => {
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
    }, 500);
  }, [routes, unassignedStudents, showToast]);

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
              {routes.length}
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
            {unassignedStudents.length > 0 && (
              <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded text-xs">
                {unassignedStudents.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'routes' && (
            <div className="space-y-3">
              {routes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  isActive={activeRouteId === route.id}
                  onSelect={() => handleSelectRoute(route.id)}
                />
              ))}

              {/* Add Route Button */}
              <button
                onClick={() => setIsCreateRouteModalOpen(true)}
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
                  {unassignedStudents.length}
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
                        Klicke auf + um Schüler hinzuzufügen
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!activeRouteId && unassignedStudents.length > 0 && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">
                    💡 Wähle zuerst eine Route aus, um Schüler hinzuzufügen
                  </p>
                </div>
              )}
              <div className="space-y-2">
                {unassignedStudents.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onAssign={() => handleAddStudentToRoute(student.id)}
                  />
                ))}
              </div>
              {unassignedStudents.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Alle Schüler zugeordnet!</p>
                </div>
              )}
            </div>
          )}
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

        {/* Route Loading Indicator */}
        {isLoadingRoute && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#1e3a5f]" />
            <span className="text-sm text-slate-600">Route wird berechnet...</span>
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
            <div className="text-2xl font-bold text-[#1e3a5f]">{stats.totalCost.toFixed(2)}</div>
            <div className="text-xs text-slate-500">€/Tag</div>
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

      {/* Create Route Modal */}
      <CreateRouteModal
        isOpen={isCreateRouteModalOpen}
        onClose={() => setIsCreateRouteModalOpen(false)}
        onCreateRoute={handleCreateRoute}
        availableStudents={unassignedStudents}
      />
    </div>
  );
}
