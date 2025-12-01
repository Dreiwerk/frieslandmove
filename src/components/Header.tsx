'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { 
  Bell, 
  Search, 
  X, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Users,
  MapPin,
  Building2,
  FileText,
} from 'lucide-react';
import { currentUser, warnings, routeStudents, routes, applications, billingData } from '@/lib/data';
import { companies } from '@/lib/frieslandData';
import { ViewType } from '@/types';

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  view: ViewType;
  icon: React.ComponentType<{ className?: string }>;
};

type SearchResultGroup = {
  label: string;
  items: SearchResult[];
  total: number;
};

interface HeaderProps {
  setCurrentView: (view: ViewType) => void;
}

export default function Header({ setCurrentView }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  // Schnelle Direktlinks zu Kernbereichen
  const quickLinks: SearchResult[] = [
    { id: 'quick-applications', title: 'Anträge öffnen', subtitle: 'Alle Anträge filtern/bearbeiten', badge: 'Schnellzugriff', view: 'applications', icon: FileText },
    { id: 'quick-students', title: 'Schülerdaten öffnen', subtitle: 'Suche nach Name/ID', badge: 'Schnellzugriff', view: 'students', icon: Users },
    { id: 'quick-routes', title: 'Routenplanung öffnen', subtitle: 'Linien & Freistellungen', badge: 'Schnellzugriff', view: 'routes', icon: MapPin },
    { id: 'quick-contracts', title: 'Unternehmen & Vergaben', subtitle: 'Verträge und Anbieter', badge: 'Schnellzugriff', view: 'contracts', icon: Building2 },
    { id: 'quick-billing', title: 'Abrechnung öffnen', subtitle: 'Offene/abweichende Rechnungen', badge: 'Schnellzugriff', view: 'billing', icon: Building2 },
  ];

  const groupedResults = useMemo<SearchResultGroup[]>(() => {
    const query = searchQuery.trim().toLowerCase();
    const groups: SearchResultGroup[] = [];

    if (!query) {
      groups.push({ label: 'Schnellzugriff', items: quickLinks, total: quickLinks.length });
      return groups;
    }

    const resultsStudents: SearchResult[] = [];
    const resultsRoutes: SearchResult[] = [];
    const resultsApplications: SearchResult[] = [];
    const resultsCompanies: SearchResult[] = [];
    const resultsBilling: SearchResult[] = [];

    // Schüler (Route-Ansicht)
    routeStudents.forEach((student) => {
      const haystack = `${student.name} ${student.id} ${student.school}`.toLowerCase();
      if (haystack.includes(query)) {
        resultsStudents.push({
          id: `student-${student.id}`,
          title: student.name,
          subtitle: `${student.school} • Klasse ${student.class}`,
          badge: 'Schüler',
          view: 'students',
          icon: Users,
        });
      }
    });

    // Routen
    routes.forEach((route) => {
      const haystack = `${route.name} ${route.id} ${route.company}`.toLowerCase();
      if (haystack.includes(query)) {
        resultsRoutes.push({
          id: `route-${route.id}`,
          title: route.name,
          subtitle: `${route.company} • ${route.type === 'oepnv' ? 'ÖPNV' : 'Freistellung'}`,
          badge: 'Route',
          view: 'routes',
          icon: MapPin,
        });
      }
    });

    // Anträge
    applications.forEach((application) => {
      const haystack = `${application.studentName} ${application.school} ${application.id}`.toLowerCase();
      if (haystack.includes(query)) {
        resultsApplications.push({
          id: `application-${application.id}`,
          title: application.studentName,
          subtitle: `${application.school} • Antrag ${application.id}`,
          badge: 'Antrag',
          view: 'applications',
          icon: FileText,
        });
      }
    });

    // Unternehmen (aus Stammdaten)
    companies.forEach((company, index) => {
      const haystack = `${company.name} ${company.city}`.toLowerCase();
      if (haystack.includes(query)) {
        resultsCompanies.push({
          id: `company-${index}`,
          title: company.name,
          subtitle: `${company.city} • ${company.fleet.buses + company.fleet.taxisStandard + company.fleet.taxisAccessible} Fahrzeuge`,
          badge: 'Unternehmen',
          view: 'contracts',
          icon: Building2,
        });
      }
    });

    // Abrechnungseinträge (Unternehmenssicht)
    billingData.forEach((entry) => {
      const haystack = `${entry.company} ${entry.service} ${entry.month}`.toLowerCase();
      if (haystack.includes(query)) {
        resultsBilling.push({
          id: `billing-${entry.id}`,
          title: entry.company,
          subtitle: `${entry.service} • ${entry.month}`,
          badge: 'Abrechnung',
          view: 'billing',
          icon: Building2,
        });
      }
    });

    const addGroup = (label: string, items: SearchResult[]) => {
      if (items.length === 0) return;
      groups.push({
        label,
        items: items.slice(0, 5),
        total: items.length,
      });
    };

    addGroup('Schüler', resultsStudents);
    addGroup('Routen', resultsRoutes);
    addGroup('Unternehmen', resultsCompanies);
    addGroup('Anträge', resultsApplications);
    addGroup('Abrechnung', resultsBilling);

    return groups;
  }, [searchQuery, quickLinks]);

  const flattenedResults = groupedResults.flatMap((group) => group.items);

  useEffect(() => {
    // Clamp aktiven Index, falls weniger Treffer nach neuer Suche
    setActiveResultIndex((prev) => Math.min(prev, Math.max(flattenedResults.length - 1, 0)));
  }, [flattenedResults.length]);

  const handleSelectResult = (result: SearchResult) => {
    setCurrentView(result.view);
    setSearchQuery('');
    setShowSearchResults(false);
    setShowNotifications(false);
    setShowProfileMenu(false);
    setActiveResultIndex(0);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
                setActiveResultIndex(0);
              }}
              onFocus={() => setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 120)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActiveResultIndex((prev) => Math.min(prev + 1, Math.max(flattenedResults.length - 1, 0)));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActiveResultIndex((prev) => Math.max(prev - 1, 0));
                } else if (e.key === 'Enter' && flattenedResults.length > 0) {
                  e.preventDefault();
                  handleSelectResult(flattenedResults[Math.max(activeResultIndex, 0)]);
                }
              }}
              placeholder="Suchen nach Schüler, Route, Unternehmen..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                  setActiveResultIndex(0);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {showSearchResults && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-auto">
                {searchQuery.trim().length === 0 && groupedResults.length === 1 && groupedResults[0].label === 'Schnellzugriff' ? (
                  <div className="py-2">
                    <div className="px-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Schnellzugriff
                    </div>
                    <div className="px-2 space-y-1">
                      {groupedResults[0].items.map((result, idx) => {
                        const Icon = result.icon;
                        const isActive = idx === activeResultIndex;
                        return (
                          <button
                            key={result.id}
                            className={`w-full px-3 py-2.5 rounded-xl flex items-start gap-3 transition-colors text-left border ${
                              isActive ? 'bg-cyan-50 border-cyan-100' : 'bg-gray-50/50 border-gray-100 hover:bg-white'
                            }`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectResult(result);
                            }}
                            onMouseEnter={() => setActiveResultIndex(idx)}
                          >
                            <div className={`p-2 rounded-lg ${isActive ? 'bg-cyan-100 text-cyan-700' : 'bg-white text-gray-600'} shadow-sm`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{result.title}</p>
                              <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                            </div>
                            <span className={`text-[11px] px-2 py-1 rounded-full font-semibold uppercase tracking-wide ${
                              isActive ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {result.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : flattenedResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">Keine Treffer gefunden</div>
                ) : (
                  <div className="py-1 space-y-2">
                    {groupedResults.map((group, groupIndex) => (
                      <div key={group.label}>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between">
                          <span>{group.label}</span>
                          {group.total > group.items.length && (
                            <span className="text-[11px] text-gray-400">Top {group.items.length} von {group.total}</span>
                          )}
                        </div>
                        {group.items.map((result, idx) => {
                          const globalIndex = groupedResults
                            .slice(0, groupIndex)
                            .reduce((acc, g) => acc + g.items.length, 0) + idx;
                          const Icon = result.icon;
                          const isActive = globalIndex === activeResultIndex;
                          return (
                            <button
                              key={result.id}
                              className={`w-full px-4 py-2.5 flex items-start gap-3 transition-colors text-left ${
                                isActive ? 'bg-cyan-50' : 'hover:bg-gray-50'
                              }`}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectResult(result);
                              }}
                              onMouseEnter={() => setActiveResultIndex(globalIndex)}
                            >
                              <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{result.title}</p>
                                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-semibold uppercase tracking-wide">
                                    {result.badge}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-fade-in">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Benachrichtigungen</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {warnings.map((warning) => (
                    <div key={warning.id} className="p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                          warning.type === 'alert' ? 'bg-red-500' :
                          warning.type === 'warning' ? 'bg-amber-500' :
                          'bg-blue-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{warning.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{warning.company}</p>
                          <p className="text-xs text-gray-400 mt-1">{warning.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setCurrentView('notifications');
                    }}
                    className="w-full text-center text-sm text-cyan-600 font-medium hover:text-cyan-700 transition-colors"
                  >
                    Alle Benachrichtigungen anzeigen
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="h-8 w-px bg-gray-200"></div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-cyan-500/20">
                {currentUser.initials}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.role}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-fade-in">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setCurrentView('settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                  >
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Mein Profil</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setCurrentView('settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Einstellungen</span>
                  </button>
                </div>
                <div className="py-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      alert('Abmelden...');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">Abmelden</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowProfileMenu(false);
          }}
        ></div>
      )}
    </header>
  );
}
