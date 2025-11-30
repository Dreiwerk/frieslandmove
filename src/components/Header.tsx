'use client';

import React, { useState } from 'react';
import { Bell, Search, X, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { currentUser, warnings } from '@/lib/data';
import { ViewType } from '@/types';

interface HeaderProps {
  setCurrentView: (view: ViewType) => void;
}

export default function Header({ setCurrentView }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Suchen nach Schüler, Route, Unternehmen..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
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
