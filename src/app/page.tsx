'use client';

import React, { useEffect, useState } from 'react';
import { ViewType } from '@/types';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import DashboardView from '@/components/DashboardView';
import RoutePlannerView from '@/components/RoutePlannerView';
import ApplicationsView from '@/components/ApplicationsView';
import BillingView from '@/components/BillingView';
import StudentsView from '@/components/StudentsView';
import ContractsView from '@/components/ContractsView';
import ReportsView from '@/components/ReportsView';
import SettingsView from '@/components/SettingsView';
import NotificationsView from '@/components/NotificationsView';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openNewApplicationModal, setOpenNewApplicationModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authTransitioning, setAuthTransitioning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shellVisible, setShellVisible] = useState(false);
  const [email, setEmail] = useState('stefanie.pflug@friesland.de');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('frieslandmove-auth');
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
    setAuthReady(true);
  }, []);

  // Soft fade/slide-in when the main app becomes visible
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => setShellVisible(true), 40);
      return () => clearTimeout(timer);
    }
    setShellVisible(false);
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    // Phase 1: form loading, then launch immersive transition
    setTimeout(() => {
      setAuthLoading(false);
      setAuthTransitioning(true);
      setShowSuccess(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('frieslandmove-auth', 'true');
      }
      // Phase 2: complete transition into app
      setTimeout(() => {
        setIsAuthenticated(true);
        setAuthTransitioning(false);
        setTimeout(() => setShowSuccess(false), 1200);
      }, 900);
    }, 700);
  };

  const handleLogout = () => {
    setShowSuccess(false);
    setIsAuthenticated(false);
    setCurrentView('dashboard');
    setOpenNewApplicationModal(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('frieslandmove-auth');
    }
  };

  const handleNavigateToApplications = () => {
    setCurrentView('applications');
    setOpenNewApplicationModal(true);
  };

  const handleNavigateToApplicationsOnly = () => {
    setCurrentView('applications');
    setOpenNewApplicationModal(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView
          onNavigateToApplications={handleNavigateToApplications}
          onNavigateToApplicationsOnly={handleNavigateToApplicationsOnly}
          setCurrentView={setCurrentView}
        />;
      case 'routes':
        return <RoutePlannerView />;
      case 'applications':
        return <ApplicationsView openNewModal={openNewApplicationModal} onModalClose={() => setOpenNewApplicationModal(false)} />;
      case 'billing':
        return <BillingView />;
      case 'students':
        return <StudentsView />;
      case 'contracts':
        return <ContractsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      case 'notifications':
        return <NotificationsView />;
      default:
        return <DashboardView
          onNavigateToApplications={handleNavigateToApplications}
          onNavigateToApplicationsOnly={handleNavigateToApplicationsOnly}
          setCurrentView={setCurrentView}
        />;
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-pulse text-sm text-gray-500 bg-white/70 px-4 py-3 rounded-lg shadow">
          Oberfläche wird geladen...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center px-6 overflow-hidden">
        {authTransitioning && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 opacity-50 blur-xl animate-pulse" />
              <div className="absolute inset-4 border-[6px] border-white/70 rounded-full shadow-lg animate-[spin_1.4s_linear_infinite]" />
              <div className="absolute inset-7 rounded-full bg-white flex items-center justify-center text-cyan-600 font-semibold animate-[pulse_1.6s_ease-in-out_infinite]">
                FM
              </div>
            </div>
          </div>
        )}
        <div
          className={`max-w-4xl w-full bg-white shadow-2xl rounded-2xl border border-gray-100 grid grid-cols-2 overflow-hidden transition-all duration-700 ease-in-out ${
            authTransitioning ? '-translate-y-24 scale-95 rotate-1 opacity-0 blur-sm' : 'opacity-100'
          }`}
        >
          <div className="p-8 bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 text-white relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_35%)]" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/20 rounded-full backdrop-blur">
                <span className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center font-semibold">FM</span>
                <div>
                  <p className="text-sm font-semibold">FrieslandMove</p>
                  <p className="text-xs text-white/80">Prototyp – Behördencockpit</p>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Sicherer Zugang</h2>
                <p className="text-white/80 text-sm">
                  Authentifizierungsvorschau mit Zwei-Faktor-Platzhalter. Alle Daten bleiben in der Demo lokal.
                </p>
              </div>
              <ul className="space-y-3 text-sm text-white/90">
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">✓</span>
                  Eindeutige Nutzerkennung (E-Mail)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">✓</span>
                  Platzhalter für 2FA-TAN
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">✓</span>
                  Demo: Login bleibt lokal gespeichert
                </li>
              </ul>
            </div>
          </div>
          <div className="p-8 bg-white">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Anmeldung</h1>
            <p className="text-sm text-gray-500 mb-2">Bitte mit Behörden-Account anmelden.</p>
            <div className="mb-4 p-2 bg-cyan-50 border border-cyan-100 rounded-lg">
              <p className="text-xs text-cyan-700 font-medium">
                ℹ️ Demo-Modus: Beliebige Zugangsdaten eingeben
              </p>
            </div>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                  placeholder="Beliebige E-Mail eingeben"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                  placeholder="Beliebiges Passwort eingeben"
                />
                <p className="text-xs text-cyan-600 mt-1 font-medium">Demo: Beliebige Daten können eingegeben werden</p>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" defaultChecked />
                  Angemeldet bleiben (Demo)
                </label>
                <span className="text-cyan-600 font-medium cursor-pointer">Passwort vergessen?</span>
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className={`w-full py-3 rounded-lg text-white font-semibold shadow-lg shadow-cyan-500/30 transition-transform ${
                  authLoading ? 'bg-cyan-300 cursor-wait' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:-translate-y-0.5'
                }`}
              >
                {authLoading ? 'Wird geprüft...' : 'Anmelden'}
              </button>
              <p className="text-xs text-gray-400 text-center">Zugangsdaten werden nicht übertragen – reine UI-Simulation.</p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen bg-gray-50 transition-all duration-500 ease-out ${shellVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      {/* Browser Chrome Frame */}
      <div className="bg-gray-200 px-4 py-2 flex items-center gap-2 border-b border-gray-300">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-pointer"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors cursor-pointer"></div>
          <div className="w-3 h-3 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-pointer"></div>
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-white rounded-lg px-4 py-1.5 text-sm text-gray-600 flex items-center gap-2 max-w-2xl mx-auto shadow-sm">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-800">frieslandmove.landkreis-friesland.de</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <button className="p-1.5 hover:bg-gray-300 rounded transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button className="p-1.5 hover:bg-gray-300 rounded transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-44px)]">
        <Sidebar 
          currentView={currentView}
          setCurrentView={setCurrentView}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          <Header setCurrentView={setCurrentView} onLogout={handleLogout} />
          <div className="flex-1 overflow-auto bg-gray-50">
            {renderView()}
          </div>
        </main>
      </div>

      {showSuccess && (
        <div className="pointer-events-none fixed inset-0 flex items-end justify-center pb-10 z-50">
          <div className="relative">
            <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 opacity-50 animate-pulse" />
            <div className="relative bg-white border border-cyan-100 shadow-2xl rounded-xl px-5 py-4 flex items-center gap-3 animate-bounce">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Erfolgreich angemeldet</p>
                <p className="text-xs text-gray-500">Du wirst weitergeleitet…</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
