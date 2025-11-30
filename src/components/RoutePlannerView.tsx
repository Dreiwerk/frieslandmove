'use client';

import React, { useState } from 'react';
import {
  Bus,
  Filter,
  Sparkles,
  Accessibility,
  UserPlus,
  Navigation,
  Plus,
  GripVertical,
} from 'lucide-react';
import { routeStudents } from '@/lib/data';
import { Student } from '@/types';
import Toast from '@/components/ui/Toast';

export default function RoutePlannerView() {
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'freistellung' | 'oepnv'>('freistellung');
  const [students, setStudents] = useState<Student[]>(routeStudents);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleAiOptimize = () => {
    setAiOptimizing(true);
    // Simulate AI optimization
    setTimeout(() => {
      // Reorder students as if optimized
      const optimizedStudents = [...students].sort((a, b) => a.name.localeCompare(b.name));
      setStudents(optimizedStudents);
      setAiOptimizing(false);
      setToast({ message: 'Route erfolgreich optimiert!', type: 'success' });
    }, 3000);
  };

  const handleEditRoute = () => {
    setToast({ message: 'Bearbeitungsmodus wird geöffnet...', type: 'info' });
    // In einer echten App würde hier der Bearbeitungsmodus aktiviert werden
  };

  const handleSaveRoute = () => {
    setToast({ message: 'Route wird gespeichert...', type: 'info' });
    setTimeout(() => {
      setToast({ message: 'Route erfolgreich gespeichert!', type: 'success' });
    }, 1500);
  };

  return (
    <div className="h-full flex">
      {/* Left Panel - Route Details */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Routenplanung</h2>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('freistellung')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'freistellung' 
                  ? 'bg-cyan-50 text-cyan-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Freistellung
            </button>
            <button 
              onClick={() => setActiveTab('oepnv')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'oepnv' 
                  ? 'bg-cyan-50 text-cyan-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              ÖPNV
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Route Header */}
          <div className="p-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Route 12 - Jever Nord</h3>
                <p className="text-sm text-cyan-100">Spezialverkehr</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-cyan-100">Schüler</p>
                <p className="text-xl font-bold">{students.length}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-cyan-100">Kilometer</p>
                <p className="text-xl font-bold">23,4</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-xs text-cyan-100">Kosten/Tag</p>
                <p className="text-xl font-bold">€142</p>
              </div>
            </div>
          </div>

          {/* AI Optimization Button */}
          <div className="p-4">
            <button 
              onClick={handleAiOptimize}
              disabled={aiOptimizing}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                aiOptimizing 
                  ? 'bg-purple-100 text-purple-700 cursor-wait' 
                  : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5'
              }`}
            >
              <Sparkles className={`w-5 h-5 ${aiOptimizing ? 'animate-spin' : ''}`} />
              {aiOptimizing ? 'KI optimiert Route...' : 'KI-Routenoptimierung starten'}
            </button>
            {aiOptimizing && (
              <div className="mt-3 bg-purple-50 rounded-lg p-3 text-sm text-purple-700 animate-pulse">
                <p className="font-medium">Analyse läuft...</p>
                <p className="text-xs mt-1">Überprüfe Verkehrsdaten und Schülerwohnorte</p>
                <div className="mt-2 h-1 bg-purple-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full animate-[loading_2s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Students List */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Schüler auf dieser Route</h4>
              <span className="text-xs text-gray-500">Reihenfolge: Abholzeit</span>
            </div>
            <div className="space-y-2">
              {students.map((student, index) => (
                <div 
                  key={student.id}
                  className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.school} • Klasse {student.class}</p>
                      {student.accessibility && student.accessibility.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          {student.accessibility.map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                tag === 'Rollstuhl' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {tag === 'Rollstuhl' ? <Accessibility className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Route Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <button
              onClick={handleEditRoute}
              className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Route bearbeiten
            </button>
            <button
              onClick={handleSaveRoute}
              className="flex-1 px-4 py-2.5 bg-cyan-600 rounded-lg text-sm font-medium text-white hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-600/20"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Map */}
      <div className="flex-1 relative bg-gray-100">
        {/* Map Container */}
        <div className="absolute inset-0">
          {/* Stylized Map Background */}
          <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E7EB" strokeWidth="0.5"/>
              </pattern>
              <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DBEAFE" />
                <stop offset="100%" stopColor="#BFDBFE" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Background */}
            <rect width="100%" height="100%" fill="#F9FAFB"/>
            <rect width="100%" height="100%" fill="url(#grid)"/>
            
            {/* Water Areas (North Sea representation) */}
            <path d="M 0 0 L 0 200 Q 100 180, 150 220 Q 200 260, 180 300 Q 160 350, 0 400 L 0 0" fill="url(#waterGradient)" opacity="0.6"/>
            
            {/* Main Roads */}
            <path d="M 200 50 L 200 550" stroke="#D1D5DB" strokeWidth="8" strokeLinecap="round"/>
            <path d="M 50 300 L 750 300" stroke="#D1D5DB" strokeWidth="8" strokeLinecap="round"/>
            <path d="M 350 100 L 350 500" stroke="#D1D5DB" strokeWidth="6" strokeLinecap="round"/>
            <path d="M 150 200 L 550 200" stroke="#D1D5DB" strokeWidth="6" strokeLinecap="round"/>
            <path d="M 200 400 L 600 400" stroke="#D1D5DB" strokeWidth="6" strokeLinecap="round"/>
            
            {/* Secondary Roads */}
            <path d="M 250 150 L 400 250" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round"/>
            <path d="M 450 180 L 550 350" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round"/>
            <path d="M 300 350 L 500 450" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round"/>
            
            {/* Route Path with animation */}
            <path 
              d="M 280 120 Q 320 180, 300 250 Q 280 320, 350 360 Q 420 400, 480 380 Q 540 360, 520 420 L 550 480" 
              stroke="#009EE0" 
              strokeWidth="4" 
              fill="none" 
              strokeDasharray="10 5"
              strokeLinecap="round"
              className="animate-[dash_20s_linear_infinite]"
            />
            <path 
              d="M 280 120 Q 320 180, 300 250 Q 280 320, 350 360 Q 420 400, 480 380 Q 540 360, 520 420 L 550 480" 
              stroke="#0891B2" 
              strokeWidth="4" 
              fill="none"
              strokeLinecap="round"
              opacity="0.3"
            />
            
            {/* City Labels */}
            <text x="360" y="290" fill="#6B7280" fontSize="14" fontWeight="600" suppressHydrationWarning>Jever</text>
            <text x="250" y="420" fill="#9CA3AF" fontSize="12" suppressHydrationWarning>Schortens</text>
            <text x="480" y="220" fill="#9CA3AF" fontSize="12" suppressHydrationWarning>Wittmund</text>
            <text x="180" y="180" fill="#9CA3AF" fontSize="12" suppressHydrationWarning>Wilhelmshaven</text>
            
            {/* Student Home Markers (Blue) with pulse effect */}
            {[
              { x: 280, y: 120 },
              { x: 300, y: 250 },
              { x: 350, y: 360 },
              { x: 480, y: 380 },
              { x: 520, y: 420 },
              { x: 340, y: 200 },
            ].map((pos, i) => (
              <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle r="16" fill="#009EE0" opacity="0.2" className={`animate-ping`} style={{ animationDelay: `${i * 0.2}s` }}/>
                <circle r="12" fill="#009EE0" filter="url(#glow)"/>
                <circle r="6" fill="white"/>
                <text x="16" y="4" fill="#1F2937" fontSize="10" fontWeight="600" suppressHydrationWarning>{i + 1}</text>
              </g>
            ))}
            
            {/* School Marker (Red) */}
            <g transform="translate(550, 480)">
              <circle r="20" fill="#DC2626" opacity="0.2" className="animate-ping"/>
              <circle r="16" fill="#DC2626" filter="url(#glow)"/>
              <circle r="8" fill="white"/>
              <path d="M 546 476 L 550 472 L 554 476 L 554 484 L 546 484 Z" fill="#DC2626"/>
            </g>
          </svg>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-1 flex flex-col">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
          <div className="h-px bg-gray-200 my-1"></div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span className="text-gray-600 font-medium text-lg leading-none">−</span>
          </button>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Legende</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-cyan-500 rounded-full shadow"></div>
              <span className="text-sm text-gray-600">Schülerwohnung</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full shadow"></div>
              <span className="text-sm text-gray-600">Schule</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-cyan-500 rounded"></div>
              <span className="text-sm text-gray-600">Route</span>
            </div>
          </div>
        </div>

        {/* Route Info Card */}
        <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-64">
          <div className="flex items-center gap-2 mb-3">
            <Navigation className="w-5 h-5 text-cyan-600" />
            <h4 className="font-semibold text-gray-900">Routenübersicht</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Start</span>
              <span className="font-medium text-gray-900">07:15 Uhr</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Ankunft Schule</span>
              <span className="font-medium text-gray-900">07:52 Uhr</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Fahrzeit</span>
              <span className="font-medium text-gray-900">37 Min.</span>
            </div>
            <div className="pt-2 border-t border-gray-100 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Unternehmen</span>
                <span className="font-medium text-gray-900">Taxi Müller</span>
              </div>
            </div>
          </div>
        </div>
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
