'use client';

import { useState, useEffect } from 'react';
import { getAttendanceByClass, markAttendance } from '@/lib/actions/attendance';
import { getClasses } from '@/lib/actions/academic';
import { getStudentList } from '@/lib/actions/students';

interface ClassItem { id: string; name: string; }
interface Student { id: string; full_name: string; admission_number: string; }
interface AttendanceRecord { id: string; student_id: string; status: string; notes: string | null; }

export default function AttendancePage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, { status: string; notes: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getClasses().then(res => {
      if (res.data) setClasses(res.data);
    });
  }, []);

  useEffect(() => {
    if (selectedClass) {
      getStudentList({ class_id: selectedClass }).then(res => {
        if (res.data) setStudents(res.data as Student[]);
      });
      loadAttendance(selectedClass, selectedDate);
    }
  }, [selectedClass]);

  async function loadAttendance(classId: string, date: string) {
    setLoading(true);
    const res = await getAttendanceByClass(classId, date);
    const att: Record<string, { status: string; notes: string }> = {};
    if (res.data) {
      for (const r of res.data as AttendanceRecord[]) {
        att[r.student_id] = { status: r.status, notes: r.notes || '' };
      }
    }
    setAttendance(att);
    setLoading(false);
  }

  function setStatus(studentId: string, status: string) {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId] || { notes: '' }, status },
    }));
  }

  function setNotes(studentId: string, notes: string) {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId] || { status: 'present' }, notes },
    }));
  }

  async function handleLoadClass() {
    if (selectedClass) await loadAttendance(selectedClass, selectedDate);
  }

  async function handleSave() {
    if (!selectedClass || students.length === 0) return;
    setSaving(true);
    setError('');
    setMessage('');

    const records = students.map(s => ({
      student_id: s.id,
      class_id: selectedClass,
      attendance_date: selectedDate,
      status: attendance[s.id]?.status || 'present',
      notes: attendance[s.id]?.notes || undefined,
    }));

    const result = await markAttendance(records);
    if (result.error) {
      setError(result.error);
    } else {
      setMessage('Attendance saved successfully!');
    }
    setSaving(false);
  }

  function markAllPresent() {
    const att: Record<string, { status: string; notes: string }> = {};
    students.forEach(s => { att[s.id] = { status: 'present', notes: '' }; });
    setAttendance(att);
  }

  const statusColors: Record<string, string> = {
    present: 'bg-green-100 text-green-800 border-green-300',
    absent: 'bg-red-100 text-red-800 border-red-300',
    late: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    excused: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const presentCount = Object.values(attendance).filter(a => a.status === 'present').length;
  const absentCount = Object.values(attendance).filter(a => a.status === 'absent').length;
  const lateCount = Object.values(attendance).filter(a => a.status === 'late').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
        <p className="text-gray-600 mt-1">Mark and view daily attendance</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">Class</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
              <option value="">Select class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
          </div>
          <button onClick={handleLoadClass} disabled={!selectedClass}
            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50">
            Load
          </button>
          <button onClick={markAllPresent} disabled={students.length === 0}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50">
            Mark All Present
          </button>
          <button onClick={handleSave} disabled={!selectedClass || students.length === 0 || saving}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-4">{message}</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">{error}</div>
      )}

      {/* Summary */}
      {students.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{presentCount}</div>
            <div className="text-sm text-green-600">Present</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{absentCount}</div>
            <div className="text-sm text-red-600">Absent</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-700">{lateCount}</div>
            <div className="text-sm text-yellow-600">Late</div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">Loading...</div>
      ) : students.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adm No</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map(student => {
                const currentStatus = attendance[student.id]?.status || '';
                return (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{student.admission_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex gap-1 justify-center">
                        {['present', 'absent', 'late', 'excused'].map(status => (
                          <button key={status} onClick={() => setStatus(student.id, status)}
                            className={`px-2 py-1 text-xs rounded border capitalize ${
                              currentStatus === status ? statusColors[status] : 'bg-gray-50 text-gray-400 border-gray-200'
                            }`}>
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input type="text" value={attendance[student.id]?.notes || ''} onChange={e => setNotes(student.id, e.target.value)}
                        placeholder="Optional note"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-2 py-1" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : selectedClass ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">No students in this class.</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">Select a class to manage attendance.</div>
      )}
    </div>
  );
}
