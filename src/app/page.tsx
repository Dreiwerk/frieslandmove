'use client';

import React, { useState } from 'react';
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
        return <SettingsView onNavigateToSettings={(tab) => setCurrentView('settings')} />;
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

  return (
    <div className="min-h-screen bg-gray-50">
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
          <Header setCurrentView={setCurrentView} />
          <div className="flex-1 overflow-auto bg-gray-50">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
