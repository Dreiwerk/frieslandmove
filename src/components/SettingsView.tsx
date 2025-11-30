'use client';

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Users,
  Globe,
  Calendar,
  Mail,
  Download,
  CheckCircle,
  Key,
  Clock,
} from 'lucide-react';
import { currentUser } from '@/lib/data';
import Toast from '@/components/ui/Toast';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'users'>('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    expiringContracts: true,
    newApplications: true,
    systemUpdates: false,
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleSaveProfile = () => {
    setToast({ message: 'Profil wird gespeichert...', type: 'info' });
    setTimeout(() => {
      setToast({ message: 'Profil erfolgreich aktualisiert!', type: 'success' });
    }, 1500);
  };

  const handleChangePassword = () => {
    setToast({ message: 'Passwort-Änderung wird geöffnet...', type: 'info' });
    // In einer echten App würde hier ein Modal geöffnet werden
  };

  const handleExportData = () => {
    setToast({ message: 'Datenexport wird erstellt...', type: 'info' });
    setTimeout(() => {
      setToast({ message: 'Daten erfolgreich exportiert!', type: 'success' });
    }, 2000);
  };

  const handleBackup = () => {
    setToast({ message: 'Backup wird erstellt...', type: 'info' });
    setTimeout(() => {
      setToast({ message: 'Backup erfolgreich erstellt!', type: 'success' });
    }, 2500);
  };

  const handleAddUser = () => {
    setToast({ message: 'Benutzer-Formular wird geöffnet...', type: 'info' });
    // In einer echten App würde hier ein Modal geöffnet werden
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Einstellungen</h2>
            <p className="text-sm text-gray-500 mt-1">Verwalte deine Präferenzen und Systemeinstellungen</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-cyan-50 text-cyan-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="w-5 h-5" />
              Profil & Konto
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'system'
                  ? 'bg-cyan-50 text-cyan-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SettingsIcon className="w-5 h-5" />
              System
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-cyan-50 text-cyan-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              Benutzerverwaltung
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-3xl space-y-5">
              {/* Profile Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Persönliche Informationen</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {currentUser.initials}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{currentUser.name}</h4>
                    <p className="text-sm text-gray-500">{currentUser.role}</p>
                    <button className="text-sm text-cyan-600 hover:text-cyan-700 font-medium mt-1">
                      Profilbild ändern
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      defaultValue={currentUser.name}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                    <input
                      type="email"
                      defaultValue="s.pflug@friesland.de"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
                    <input
                      type="text"
                      value={currentUser.role}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                  >
                    Änderungen speichern
                  </button>
                  <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                    Abbrechen
                  </button>
                </div>
              </div>

              {/* Security */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-600" />
                  Sicherheit
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={handleChangePassword}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-gray-400" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Passwort ändern</p>
                        <p className="text-sm text-gray-500">Zuletzt geändert vor 42 Tagen</p>
                      </div>
                    </div>
                    <span className="text-cyan-600 font-medium">Ändern</span>
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-cyan-600" />
                  Benachrichtigungen
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'email', label: 'E-Mail-Benachrichtigungen', desc: 'Erhalte wichtige Updates per E-Mail' },
                    { key: 'expiringContracts', label: 'Auslaufende Verträge', desc: 'Warnungen 6 Monate vor Vertragsende' },
                    { key: 'newApplications', label: 'Neue Anträge', desc: 'Benachrichtigung bei neuen Beförderungsanträgen' },
                    { key: 'systemUpdates', label: 'System-Updates', desc: 'Informationen über neue Funktionen' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="max-w-3xl space-y-5">
              {/* School Year */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-600" />
                  Schuljahr-Konfiguration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aktuelles Schuljahr</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                      <option>2024/2025</option>
                      <option>2025/2026</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Beginn</label>
                      <input
                        type="date"
                        defaultValue="2024-08-01"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ende</label>
                      <input
                        type="date"
                        defaultValue="2025-07-31"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Default Values */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-cyan-600" />
                  Standardwerte
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kilometer-Pauschale</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue="2.45"
                        step="0.01"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <span className="text-gray-500">€/km</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mindestabstand zur Schule</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue="3"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <span className="text-gray-500">km</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-600" />
                  Datenverwaltung
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={handleExportData}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-5 h-5 text-gray-400" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Daten exportieren</p>
                        <p className="text-sm text-gray-500">Kompletten Datenexport als CSV</p>
                      </div>
                    </div>
                    <span className="text-cyan-600 font-medium">Exportieren</span>
                  </button>
                  <button
                    onClick={handleBackup}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-gray-400" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Backup erstellen</p>
                        <p className="text-sm text-gray-500">Letzte Sicherung: 28.11.2024 03:00</p>
                      </div>
                    </div>
                    <span className="text-cyan-600 font-medium">Jetzt sichern</span>
                  </button>
                </div>
              </div>

              {/* Language */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-600" />
                  Sprache & Region
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sprache</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                      <option>Deutsch</option>
                      <option>English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zeitzone</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                      <option>Europe/Berlin (GMT+1)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="max-w-4xl space-y-5">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Benutzer ({4})</h3>
                  <button
                    onClick={handleAddUser}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium"
                  >
                    Benutzer hinzufügen
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">E-Mail</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rolle</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Letzte Anmeldung</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { name: 'Stefanie Pflug', email: 's.pflug@friesland.de', role: 'Sachbearbeiterin', active: true, lastLogin: '2024-11-29 09:15' },
                        { name: 'Thomas Meyer', email: 't.meyer@friesland.de', role: 'Administrator', active: true, lastLogin: '2024-11-28 14:30' },
                        { name: 'Julia Schmidt', email: 'j.schmidt@friesland.de', role: 'Sachbearbeiterin', active: true, lastLogin: '2024-11-27 11:20' },
                        { name: 'Michael Weber', email: 'm.weber@friesland.de', role: 'Lesezugriff', active: false, lastLogin: '2024-11-15 08:45' },
                      ].map((user, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="font-medium text-gray-900">{user.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              user.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {user.active && <CheckCircle className="w-3 h-3" />}
                              {user.active ? 'Aktiv' : 'Inaktiv'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {user.lastLogin}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">
                              Bearbeiten
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Roles Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rollenübersicht</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Administrator</h4>
                    <p className="text-sm text-blue-700">Voller Zugriff auf alle Funktionen und Einstellungen</p>
                  </div>
                  <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                    <h4 className="font-semibold text-cyan-900 mb-2">Sachbearbeiterin</h4>
                    <p className="text-sm text-cyan-700">Bearbeitung von Anträgen, Routen und Abrechnungen</p>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Lesezugriff</h4>
                    <p className="text-sm text-gray-700">Nur lesender Zugriff auf Berichte und Statistiken</p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
