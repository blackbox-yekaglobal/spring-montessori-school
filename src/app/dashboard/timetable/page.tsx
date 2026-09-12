'use client';

import { useState, useEffect } from 'react';
import { getTimetable, createTimetableEntry, deleteTimetableEntry } from '@/lib/actions/attendance';
import { getClasses } from '@/lib/actions/academic';
import { getSubjects } from '@/lib/actions/academic';
import { getStaffList } from '@/lib/actions/academic';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface TimetableEntry {
  id: string;
  class_id: string;
  subject_id: string;
  staff_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  subjects?: { name: string; code: string };
  staff?: { full_name: string } | null;
}

export default function TimetablePage() {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string }[]>([]);
  const [staff, setStaff] = useState<{ id: string; full_name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [subjectId, setSubjectId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [day, setDay] = useState(1);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [room, setRoom] = useState('');

  useEffect(() => {
    getClasses().then(res => { if (res.data) setClasses(res.data); });
    getSubjects().then(res => { if (res.data) setSubjects(res.data); });
    getStaffList().then(res => { if (res.data) setStaff(res.data.map((s: { id: string; full_name: string }) => ({ id: s.id, full_name: s.full_name }))); });
  }, []);

  useEffect(() => {
    if (selectedClass) loadTimetable();
  }, [selectedClass]);

  async function loadTimetable() {
    setLoading(true);
    const res = await getTimetable(selectedClass);
    if (res.data) setEntries(res.data);
    setLoading(false);
  }

  function resetForm() {
    setSubjectId('');
    setStaffId('');
    setDay(1);
    setStartTime('08:00');
    setEndTime('09:00');
    setRoom('');
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const result = await createTimetableEntry({
      class_id: selectedClass,
      subject_id: subjectId,
      staff_id: staffId || undefined,
      day_of_week: day,
      start_time: startTime,
      end_time: endTime,
      room: room || undefined,
    });
    if (result.error) {
      setError(result.error);
    } else {
      await loadTimetable();
      resetForm();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this timetable entry?')) return;
    const result = await deleteTimetableEntry(id);
    if (result.error) {
      setError(result.error);
    } else {
      setEntries(entries.filter(e => e.id !== id));
    }
  }

  // Group entries by day
  const entriesByDay: Record<number, TimetableEntry[]> = {};
  entries.forEach(e => {
    if (!entriesByDay[e.day_of_week]) entriesByDay[e.day_of_week] = [];
    entriesByDay[e.day_of_week].push(e);
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable Management</h1>
          <p className="text-gray-600 mt-1">Create and manage class timetables</p>
        </div>
      </div>

      {/* Class selector */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Select Class:</label>
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
          <option value="">Choose a class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {selectedClass && (
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
            + Add Entry
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-bold">&times;</button>
        </div>
      )}

      {/* Add entry form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">Select</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teacher</label>
              <select value={staffId} onChange={e => setStaffId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">Optional</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Day</label>
              <select value={day} onChange={e => setDay(Number(e.target.value))} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                {days.map((d, i) => <option key={i} value={i + 1}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Room</label>
              <input type="text" value={room} onChange={e => setRoom(e.target.value)} placeholder="e.g. Room 101"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">Save</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300">Cancel</button>
          </div>
        </form>
      )}

      {/* Timetable Grid */}
      {!selectedClass ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">Select a class to view the timetable.</div>
      ) : loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Time</th>
                {days.map(d => (
                  <th key={d} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(() => {
                // Collect all time slots
                const timeSlots = new Set<string>();
                entries.forEach(e => timeSlots.add(e.start_time));
                const sortedSlots = Array.from(timeSlots).sort();

                return sortedSlots.map(slot => (
                  <tr key={slot}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{slot}</td>
                    {days.map((_, dayIdx) => {
                      const dayEntries = (entriesByDay[dayIdx + 1] || []).filter(e => e.start_time === slot);
                      return (
                        <td key={dayIdx} className="px-4 py-3 align-top">
                          {dayEntries.map(entry => (
                            <div key={entry.id} className="bg-blue-50 rounded p-2 mb-1 text-sm group relative">
                              <div className="font-medium text-blue-900">{entry.subjects?.name || '—'}</div>
                              <div className="text-xs text-blue-600">{entry.start_time} - {entry.end_time}</div>
                              {entry.staff?.full_name && <div className="text-xs text-gray-500">{entry.staff.full_name}</div>}
                              {entry.room && <div className="text-xs text-gray-400">{entry.room}</div>}
                              <button onClick={() => handleDelete(entry.id)}
                                className="absolute top-1 right-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 text-xs">&times;</button>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })()}
              {entries.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">No timetable entries for this class.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
