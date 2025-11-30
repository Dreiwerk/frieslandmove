'use client';

import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  MapPin,
  FileSignature,
  Receipt,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bus,
} from 'lucide-react';
import { ViewType, MenuItem } from '@/types';

interface SidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'applications', label: 'Antragsverwaltung', icon: FileText, badge: 34 },
  { id: 'students', label: 'Schülerdaten', icon: Users },
  { id: 'routes', label: 'Routenplanung', icon: MapPin },
  { id: 'contracts', label: 'Vergabe & Verträge', icon: FileSignature },
  { id: 'billing', label: 'Abrechnung', icon: Receipt },
  { id: 'reports', label: 'Berichte/Statistik', icon: BarChart3 },
  { id: 'settings', label: 'Einstellungen', icon: Settings },
];

export default function Sidebar({ currentView, setCurrentView, collapsed, setCollapsed }: SidebarProps) {
  return (
    <aside 
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Bus className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-gray-900 text-lg tracking-tight">FrieslandMove</h1>
              <p className="text-xs text-gray-500">Schülerbeförderung</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const isClickable = ['dashboard', 'routes', 'applications', 'billing', 'students', 'contracts', 'reports', 'settings'].includes(item.id);
          
          return (
            <button
              key={item.id}
              onClick={() => {
                if (isClickable) {
                  setCurrentView(item.id as ViewType);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-cyan-50 text-cyan-700 shadow-sm'
                  : isClickable
                    ? 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    : 'text-gray-400 cursor-not-allowed'
              }`}
              disabled={!isClickable}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-cyan-600' : ''}`} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span className="text-sm">Einklappen</span>}
        </button>
      </div>
    </aside>
  );
}
