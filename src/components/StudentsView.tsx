'use client';

import React, { useMemo, useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Users,
  GraduationCap,
  MapPin,
  Accessibility,
  FileText,
  ChevronRight,
  X,
  Calendar,
  Phone,
  Mail,
  Home,
  Loader2,
} from 'lucide-react';
import { calculateStatistics, generateAllStudents, generateCompactDemoData } from '@/lib/dataGenerator';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';

// Generiere realistische Demo-Daten (100 Schüler für schnelle UI, aber Statistik zeigt 9.487)
const { students: generatedStudents, statistics } = generateCompactDemoData();
const fullTotalStudents = statistics.total;

export default function StudentsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<typeof generatedStudents[0] | null>(null);
  const [editableStudent, setEditableStudent] = useState<typeof generatedStudents[0] | null>(null);
  const [filterSchool, setFilterSchool] = useState('alle');
  const [filterTransport, setFilterTransport] = useState('alle');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [studentsData, setStudentsData] = useState(generatedStudents);
  const [stats, setStats] = useState(statistics);
  const [loadSize, setLoadSize] = useState(generatedStudents.length);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const loadSizeOptions = [100, 250, 500, 1000, fullTotalStudents];

  const handleAddStudent = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = () => {
    setIsAddModalOpen(false);
    setToast({ message: 'Schüler erfolgreich gespeichert!', type: 'success' });
  };

  const handleEditStudent = () => {
    if (!selectedStudent) return;
    setEditableStudent(selectedStudent);
    setIsEditMode(true);
    setToast({ message: 'Bearbeitungsmodus aktiviert', type: 'info' });
  };

  const handleSaveEdit = () => {
    if (!editableStudent) return;
    setStudentsData((prev) => prev.map((s) => (s.id === editableStudent.id ? editableStudent : s)));
    setSelectedStudent(editableStudent);
    setIsEditMode(false);
    setToast({ message: 'Änderungen gespeichert!', type: 'success' });
  };

  const handleExport = () => {
    // Simple CSV export
    const headers = ['ID', 'Name', 'Schule', 'Klasse', 'Beförderung', 'Adresse'];
    const rows = filteredStudents.map((s) => [
      s.id,
      `"${s.name}"`,
      `"${s.school}"`,
      s.class,
      s.transport.type === 'oepnv' ? 'ÖPNV' : 'Freistellung',
      `"${s.address.street}, ${s.address.postalCode} ${s.address.city}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `schuelerdaten_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast({ message: 'Export erfolgreich! CSV-Datei heruntergeladen.', type: 'success' });
  };

  // Sync editable state when selection changes
  React.useEffect(() => {
    if (selectedStudent) {
      setEditableStudent(selectedStudent);
    } else {
      setEditableStudent(null);
    }
    setIsEditMode(false);
  }, [selectedStudent]);

  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSchool = filterSchool === 'alle' || student.school === filterSchool;
    const matchesTransport = filterTransport === 'alle' || student.transport.type === filterTransport;

    return matchesSearch && matchesSchool && matchesTransport;
  });

  const schools = ['alle', ...Array.from(new Set(studentsData.map(s => s.school)))];

  // Zeige Gesamtzahl (9.487), aber kommuniziere geladene Teilmenge
  const totalStudentsDisplay = fullTotalStudents;
  const loadedStudentsDisplay = studentsData.length;

  const handleLoadStudents = (count: number) => {
    if (isLoadingAll || count === loadSize) return;
    setIsLoadingAll(true);
    setTimeout(() => {
      const loadedStudents = generateAllStudents(count);
      const loadedStats = calculateStatistics(loadedStudents);
      setStudentsData(loadedStudents);
      setStats(loadedStats);
      setLoadSize(count);
      setIsLoadingAll(false);
      setSelectedStudent(null);
      setToast({ message: count >= fullTotalStudents ? `Alle ${fullTotalStudents.toLocaleString('de-DE')} Schüler geladen` : `${count.toLocaleString('de-DE')} Schüler geladen`, type: 'info' });
    }, 20);
  };

  const allStudentsLoaded = loadSize >= fullTotalStudents;

  return (
    <div className="h-full flex">
      {/* Left Panel - Students List */}
      <div className="flex-1 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Schülerdaten</h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredStudents.length.toLocaleString('de-DE')} von {loadedStudentsDisplay.toLocaleString('de-DE')} geladenen Schülern angezeigt
                <span className="text-gray-400"> (Gesamt {totalStudentsDisplay.toLocaleString('de-DE')})</span>
              </p>
            </div>
            <button
              onClick={handleAddStudent}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-600/20"
            >
              <Plus className="w-4 h-4" />
              Schüler anlegen
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Suche nach Name oder ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {schools.map(school => (
                <option key={school} value={school}>{school === 'alle' ? 'Alle Schulen' : school}</option>
              ))}
            </select>
            <select
              value={filterTransport}
              onChange={(e) => setFilterTransport(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="alle">Alle Beförderungsarten</option>
              <option value="oepnv">ÖPNV</option>
              <option value="freistellung">Freistellung</option>
            </select>
            <button
              onClick={handleExport}
              className="ml-auto flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="flex items-center gap-2 ml-2">
              <label className="text-xs text-gray-500">Anzahl laden</label>
              <select
                value={loadSize}
                onChange={(e) => handleLoadStudents(Number(e.target.value))}
                disabled={isLoadingAll}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {loadSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === fullTotalStudents ? `Alle ${option.toLocaleString('de-DE')}` : option.toLocaleString('de-DE')}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleLoadStudents(fullTotalStudents)}
                disabled={allStudentsLoaded || isLoadingAll}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border ${
                  allStudentsLoaded
                    ? 'text-gray-400 bg-gray-50 border-gray-100 cursor-default'
                    : 'text-cyan-700 border-cyan-100 bg-cyan-50 hover:bg-cyan-100'
                }`}
              >
                {isLoadingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                {allStudentsLoaded ? 'Alle geladen' : 'Alle laden'}
              </button>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Schule</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Klasse</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Beförderung</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Barrierefreiheit</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedStudent?.id === student.id ? 'bg-cyan-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.id}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    <div className="text-xs text-gray-500">{student.address.city}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.school}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.class}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      student.transport.type === 'oepnv'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {student.transport.type === 'oepnv' ? 'ÖPNV' : 'Freistellung'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {student.accessibility.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <Accessibility className="w-4 h-4 text-amber-600" />
                        <span className="text-xs text-amber-600 font-medium">{student.accessibility.length}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Zeige {filteredStudents.length} Einträge</span>
            <div className="flex items-center gap-2">
              <span className="text-xs">Seite 1 von 1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Student Details */}
      {selectedStudent ? (
        <div className="w-96 bg-white flex flex-col overflow-hidden">
          {(() => {
            // choose current student view
            const student = isEditMode && editableStudent ? editableStudent : selectedStudent;
            if (!student) return null;
            return (
              <>
          {/* Detail Header */}
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{student.name}</h3>
                  <p className="text-sm text-cyan-100">{student.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-cyan-100">
              <Calendar className="w-4 h-4" />
              <span>Geboren: {new Date(student.dateOfBirth).toLocaleDateString('de-DE')}</span>
            </div>
          </div>

          {/* Detail Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Schulinformationen */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-600" />
                Schulinformationen
              </h4>
              <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Schule:</span>
                  {isEditMode ? (
                    <input
                      value={student.school}
                      onChange={(e) =>
                        setEditableStudent((prev) => prev ? { ...prev, school: e.target.value } : prev)
                      }
                      className="w-40 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    <span className="font-medium text-gray-900">{student.school}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Klasse:</span>
                  {isEditMode ? (
                    <input
                      value={student.class}
                      onChange={(e) =>
                        setEditableStudent((prev) => prev ? { ...prev, class: e.target.value } : prev)
                      }
                      className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    <span className="font-medium text-gray-900">{student.class}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Schuljahr:</span>
                  <span className="font-medium text-gray-900">{student.schoolYear}</span>
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-600" />
              Wohnadresse
            </h4>
            <div className="bg-gray-50 rounded-lg p-3">
                {isEditMode ? (
                  <div className="space-y-2">
                    <input
                      value={student.address.street}
                      onChange={(e) =>
                        setEditableStudent((prev) => prev ? { ...prev, address: { ...prev.address, street: e.target.value } } : prev)
                      }
                      className="w-full px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <div className="flex gap-2">
                      <input
                        value={student.address.postalCode}
                        onChange={(e) =>
                          setEditableStudent((prev) => prev ? { ...prev, address: { ...prev.address, postalCode: e.target.value } } : prev)
                        }
                        className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <input
                        value={student.address.city}
                        onChange={(e) =>
                          setEditableStudent((prev) => prev ? { ...prev, address: { ...prev.address, city: e.target.value } } : prev)
                        }
                        className="flex-1 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-900 font-medium">{student.address.street}</p>
                    <p className="text-sm text-gray-600">{student.address.postalCode} {student.address.city}</p>
                  </>
                )}
            </div>
          </div>

            {/* Beförderung */}
            <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Home className="w-4 h-4 text-cyan-600" />
              Beförderung
            </h4>
            <div className="space-y-2 bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Art:</span>
                {isEditMode ? (
                  <select
                    value={student.transport.type}
                    onChange={(e) =>
                      setEditableStudent((prev) => prev ? { ...prev, transport: { ...prev.transport, type: e.target.value as 'oepnv' | 'freistellung' } } : prev)
                    }
                    className="px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="oepnv">ÖPNV</option>
                    <option value="freistellung">Freistellung</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    student.transport.type === 'oepnv'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {student.transport.type === 'oepnv' ? 'ÖPNV' : 'Freistellung'}
                  </span>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Route:</span>
                {isEditMode ? (
                  <input
                    value={student.transport.route || ''}
                    onChange={(e) =>
                      setEditableStudent((prev) => prev ? { ...prev, transport: { ...prev.transport, route: e.target.value } } : prev)
                    }
                    className="w-32 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                ) : (
                  <span className="font-medium text-gray-900">{student.transport.route}</span>
                )}
              </div>
              {student.transport.pickupTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Abholzeit:</span>
                  {isEditMode ? (
                    <input
                      value={student.transport.pickupTime}
                      onChange={(e) =>
                        setEditableStudent((prev) => prev ? { ...prev, transport: { ...prev.transport, pickupTime: e.target.value } } : prev)
                      }
                      className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    <span className="font-medium text-gray-900">{student.transport.pickupTime} Uhr</span>
                  )}
                </div>
              )}
              </div>
            </div>

            {/* Barrierefreiheit */}
            {student.accessibility.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Accessibility className="w-4 h-4 text-cyan-600" />
                  Barrierefreiheit
                </h4>
                <div className="space-y-2">
                  {student.accessibility.map((need, index) => (
                    <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          {need.type === 'rollstuhl' ? 'Rollstuhl' : need.type === 'begleitperson' ? 'Begleitperson' : 'Sonstige'}
                        </span>
                      </div>
                      {need.description && (
                        <p className="text-sm text-gray-600">{need.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Erziehungsberechtigte */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-600" />
                Erziehungsberechtigte
              </h4>
              <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Name:</span>
                  {isEditMode ? (
                    <input
                      value={student.legalGuardian.name}
                      onChange={(e) =>
                        setEditableStudent((prev) => prev ? { ...prev, legalGuardian: { ...prev.legalGuardian, name: e.target.value } } : prev)
                      }
                      className="w-40 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    <span className="font-medium text-gray-900">{student.legalGuardian.name}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Telefon:</span>
                  {isEditMode ? (
                    <input
                      value={student.legalGuardian.phone}
                      onChange={(e) =>
                        setEditableStudent((prev) => prev ? { ...prev, legalGuardian: { ...prev.legalGuardian, phone: e.target.value } } : prev)
                      }
                      className="w-40 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    <a href={`tel:${student.legalGuardian.phone}`} className="font-medium text-cyan-600 hover:text-cyan-700">
                      {student.legalGuardian.phone}
                    </a>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">E-Mail:</span>
                  {isEditMode ? (
                    <input
                      value={student.legalGuardian.email}
                      onChange={(e) =>
                        setEditableStudent((prev) => prev ? { ...prev, legalGuardian: { ...prev.legalGuardian, email: e.target.value } } : prev)
                      }
                      className="w-48 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    <a href={`mailto:${student.legalGuardian.email}`} className="font-medium text-cyan-600 hover:text-cyan-700">
                      {student.legalGuardian.email}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Dokumente */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-600" />
                Dokumente ({student.documents.length})
              </h4>
              {student.documents.length > 0 ? (
                <div className="space-y-2">
                  {student.documents.map((doc) => (
                    <div key={doc.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                          <FileText className="w-4 h-4 text-cyan-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(doc.uploadDate).toLocaleDateString('de-DE')} • {(doc.fileSize / 1000).toFixed(0)} KB
                          </p>
                        </div>
                        <Download className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">Keine Dokumente vorhanden</p>
              )}
            </div>
          </div>

          {/* Detail Actions */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <button
                onClick={isEditMode ? handleSaveEdit : handleEditStudent}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isEditMode
                    ? 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-lg shadow-cyan-600/20'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isEditMode ? 'Speichern' : 'Bearbeiten'}
              </button>
              {isEditMode && (
                <button
                  onClick={() => {
                    setEditableStudent(selectedStudent);
                    setIsEditMode(false);
                  }}
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
              )}
            </div>
          </div>
              </>
            );
          })()}
        </div>
      ) : (
        <div className="w-96 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Wähle einen Schüler aus,</p>
            <p className="text-gray-500 text-sm">um Details anzuzeigen</p>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Neuen Schüler anlegen"
        size="lg"
        footer={
          <>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSaveStudent}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-600/20"
            >
              Speichern
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vorname *</label>
              <input
                type="text"
                placeholder="z.B. Emma"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nachname *</label>
              <input
                type="text"
                placeholder="z.B. Schmidt"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Geburtsdatum *</label>
            <div className="relative">
              <input
                type="date"
                className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                placeholder="TT.MM.JJJJ"
              />
              <Calendar className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schule *</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option>Mariengymnasium Jever</option>
              <option>IGS Friesland Nord</option>
              <option>Oberschule Varel</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Klasse *</label>
              <input
                type="text"
                placeholder="z.B. 7a"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beförderungsart *</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option>ÖPNV</option>
                <option>Freistellung</option>
              </select>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Hinweis:</strong> Nach dem Speichern können Sie weitere Details wie Adresse und Barrierefreiheitsbedarf ergänzen.
            </p>
          </div>
        </div>
      </Modal>

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
