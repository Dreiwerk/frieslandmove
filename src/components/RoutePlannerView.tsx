'use client';

import React, { useMemo } from 'react';
import {
  Bus,
  Navigation,
  MapPin,
  Building2,
  Accessibility,
  UserPlus,
  Brain,
} from 'lucide-react';
import { routeStudents } from '@/lib/data';

type SimpleStudent = {
  id: string;
  name: string;
  address: string;
  accessibility?: 'wheelchair' | 'assistant';
};

const activeStudents: SimpleStudent[] = routeStudents.map((s, idx) => ({
  id: s.id,
  name: s.name,
  address: `${s.school} • Klasse ${s.class}`,
  accessibility: s.accessibility.includes('Rollstuhl')
    ? 'wheelchair'
    : s.accessibility.includes('Begleitperson')
      ? 'assistant'
      : undefined,
})) as SimpleStudent[];

const studentPool: SimpleStudent[] = [
  { id: 'p-1', name: 'Nora Peters', address: 'Sande • 26452' },
  { id: 'p-2', name: 'Kai Jensen', address: 'Wittmund • 26409', accessibility: 'assistant' },
  { id: 'p-3', name: 'Lina Frerichs', address: 'Schortens • 26419' },
  { id: 'p-4', name: 'Tjark Müller', address: 'Varel • 26316', accessibility: 'wheelchair' },
];

export default function RoutePlannerView() {
  const mapPoints = useMemo(() => {
    const basePoints = [
      { x: 180, y: 160 },
      { x: 260, y: 220 },
      { x: 320, y: 260 },
      { x: 380, y: 320 },
      { x: 450, y: 360 },
      { x: 510, y: 400 },
    ];
    return activeStudents.map((student, idx) => ({
      ...student,
      coord: basePoints[idx % basePoints.length],
    }));
  }, []);

  const routePath = useMemo(() => {
    if (mapPoints.length === 0) return '';
    const segments = mapPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.coord.x} ${p.coord.y}`);
    segments.push('L 640 460');
    return segments.join(' ');
  }, [mapPoints]);

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900">
      {/* Left Panel */}
      <aside className="w-[350px] bg-white border-r border-slate-200 flex flex-col">
        <header className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500 tracking-wide">Routenplanung</p>
              <p className="text-lg font-bold text-slate-900">Jever Route 12</p>
              <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-100">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                Kleinbus (8 Sitze)
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">Aktive Route</h3>
              <span className="text-xs text-slate-500">Abholreihenfolge</span>
            </div>
            <div className="space-y-2">
              {mapPoints.map((student, idx) => (
                <div
                  key={student.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-white font-semibold flex items-center justify-center shadow">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                    <p className="text-xs text-slate-500 truncate">{student.address}</p>
                  </div>
                  {student.accessibility && (
                    <div className="px-2 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] font-semibold inline-flex items-center gap-1">
                      {student.accessibility === 'wheelchair' ? (
                        <Accessibility className="w-3 h-3" />
                      ) : (
                        <UserPlus className="w-3 h-3" />
                      )}
                      {student.accessibility === 'wheelchair' ? 'Rollstuhl' : 'Begleitperson'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">Student Pool</h3>
              <span className="text-xs text-slate-500">Unzugeordnet</span>
            </div>
            <div className="space-y-2">
              {studentPool.map((student) => (
                <div
                  key={student.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-white text-slate-500 font-semibold flex items-center justify-center border border-slate-200">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                    <p className="text-xs text-slate-500 truncate">{student.address}</p>
                  </div>
                  {student.accessibility && (
                    <div className="px-2 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] font-semibold inline-flex items-center gap-1">
                      {student.accessibility === 'wheelchair' ? (
                        <Accessibility className="w-3 h-3" />
                      ) : (
                        <UserPlus className="w-3 h-3" />
                      )}
                      {student.accessibility === 'wheelchair' ? 'Rollstuhl' : 'Begleitperson'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-slate-200 bg-white sticky bottom-0">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-transform hover:-translate-y-0.5">
            <Brain className="w-5 h-5" />
            KI-Optimierung starten
          </button>
        </div>
      </aside>

      {/* Right Panel */}
      <main className="flex-1 relative bg-slate-100 overflow-hidden">
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 900 640" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="dotGrid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="#E2E8F0" />
              </pattern>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#009EE0" floodOpacity="0.25" />
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="#EDF2F7" />
            <rect width="100%" height="100%" fill="url(#dotGrid)" opacity="0.6" />
            <path d="M 80 140 L 820 140" stroke="#E2E8F0" strokeWidth="1" />
            <path d="M 80 260 L 820 260" stroke="#E2E8F0" strokeWidth="1" />
            <path d="M 80 380 L 820 380" stroke="#E2E8F0" strokeWidth="1" />
            <path d="M 80 500 L 820 500" stroke="#E2E8F0" strokeWidth="1" />
            <path d="M 200 80 L 200 560" stroke="#E2E8F0" strokeWidth="1" />
            <path d="M 400 80 L 400 560" stroke="#E2E8F0" strokeWidth="1" />
            <path d="M 600 80 L 600 560" stroke="#E2E8F0" strokeWidth="1" />
            <path d="M 800 80 L 800 560" stroke="#E2E8F0" strokeWidth="1" />

            {/* Route Path */}
            <path
              d={routePath}
              stroke="#009EE0"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#shadow)"
            />

            {/* Student Markers */}
            {mapPoints.map((point, idx) => (
              <g key={point.id} transform={`translate(${point.coord.x}, ${point.coord.y})`}>
                <circle r="12" fill="#009EE0" />
                <circle r="6" fill="white" />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#0F172A"
                  fontWeight="700"
                  suppressHydrationWarning
                >
                  {idx + 1}
                </text>
              </g>
            ))}

            {/* School Marker */}
            <g transform="translate(640, 460)">
              <rect x="-14" y="-18" width="28" height="36" rx="6" fill="#DC2626" />
              <g transform="translate(-8, -8)">
                <Building2 className="w-4 h-4" stroke="white" strokeWidth="2" />
              </g>
              <text
                x="0"
                y="32"
                textAnchor="middle"
                fontSize="11"
                fill="#475569"
                fontWeight="700"
                suppressHydrationWarning
              >
                Schule
              </text>
            </g>
          </svg>
        </div>

        {/* HUD */}
        <div className="absolute top-6 right-6 backdrop-blur bg-white/70 border border-white/60 rounded-2xl shadow-lg shadow-slate-300/40 p-4 w-72">
          <div className="flex items-center gap-2 mb-3">
            <Navigation className="w-5 h-5 text-sky-600" />
            <p className="text-sm font-semibold text-slate-900">Live-Metriken</p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Distanz</span>
              <span className="font-semibold text-slate-900">24,5 km</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Kosten / Tag</span>
              <span className="font-semibold text-slate-900">142,50 €</span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-500">Buskapazität</span>
                <span className="text-xs text-slate-500">6/8</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full w-[75%] bg-gradient-to-r from-cyan-500 to-blue-600"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
