'use client';

import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Info,
  Clock,
  Check,
  Trash2,
  Filter,
  Search,
  X,
  CheckCircle2,
} from 'lucide-react';
import { warnings } from '@/lib/data';
import { Warning } from '@/types';
import Toast from '@/components/ui/Toast';

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<(Warning & { read?: boolean })[]>(
    warnings.map(w => ({ ...w, read: false }))
  );
  const [filterType, setFilterType] = useState<'all' | 'alert' | 'warning' | 'info'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleMarkAsRead = (id: string | number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    setToast({ message: 'Benachrichtigung als gelesen markiert', type: 'success' });
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setToast({ message: 'Alle Benachrichtigungen als gelesen markiert', type: 'success' });
  };

  const handleDelete = (id: string | number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setToast({ message: 'Benachrichtigung gelöscht', type: 'success' });
  };

  const handleClearAll = () => {
    if (window.confirm('Möchten Sie wirklich alle Benachrichtigungen löschen?')) {
      setNotifications([]);
      setToast({ message: 'Alle Benachrichtigungen gelöscht', type: 'success' });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Benachrichtigungen</h2>
          <p className="text-gray-500 mt-1">
            {unreadCount} ungelesen von {notifications.length} Benachrichtigungen
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            Alle als gelesen markieren
          </button>
          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Alle löschen
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Benachrichtigungen durchsuchen..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
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

          {/* Filter Buttons */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => setFilterType('alert')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'alert'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Wichtig
            </button>
            <button
              onClick={() => setFilterType('warning')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'warning'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Warnung
            </button>
            <button
              onClick={() => setFilterType('info')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'info'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              Info
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Benachrichtigungen</h3>
            <p className="text-gray-500">
              {searchQuery
                ? 'Keine Benachrichtigungen gefunden für Ihre Suche'
                : 'Sie haben keine Benachrichtigungen'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl border transition-all hover:shadow-md ${
                notification.read
                  ? 'border-gray-200 opacity-75'
                  : 'border-gray-300 shadow-sm'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`p-3 rounded-xl flex-shrink-0 ${
                      notification.type === 'alert'
                        ? 'bg-red-50'
                        : notification.type === 'warning'
                        ? 'bg-amber-50'
                        : 'bg-blue-50'
                    }`}
                  >
                    {notification.type === 'alert' && (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                    {notification.type === 'warning' && (
                      <Clock className="w-5 h-5 text-amber-600" />
                    )}
                    {notification.type === 'info' && (
                      <Info className="w-5 h-5 text-blue-600" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <p className="text-sm text-gray-600 mt-0.5">{notification.company}</p>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{notification.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                        title="Als gelesen markieren"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Read Badge */}
                {notification.read && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Gelesen
                  </div>
                )}
              </div>
            </div>
          ))
        )}
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
