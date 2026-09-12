'use client';

import { useState } from 'react';
import { createClass, updateClass, deleteClass } from '@/lib/actions/academic';

interface ClassItem {
  id: string;
  name: string;
  class_level: string;
  arm: string | null;
  session_id: string;
  class_teacher_id: string | null;
  capacity: number | null;
  description: string | null;
  is_active: boolean;
  academic_sessions?: { name: string };
  staff?: { full_name: string } | null;
}

interface Session {
  id: string;
  name: string;
}

interface StaffMember {
  id: string;
  staff_id: string;
  full_name: string;
  role: string;
}

const classLevels = [
  { value: 'primary_1', label: 'Primary 1' },
  { value: 'primary_2', label: 'Primary 2' },
  { value: 'primary_3', label: 'Primary 3' },
  { value: 'primary_4', label: 'Primary 4' },
  { value: 'primary_5', label: 'Primary 5' },
  { value: 'primary_6', label: 'Primary 6' },
  { value: 'jss_1', label: 'JSS 1' },
  { value: 'jss_2', label: 'JSS 2' },
  { value: 'jss_3', label: 'JSS 3' },
  { value: 'ss_1', label: 'SS 1' },
  { value: 'ss_2', label: 'SS 2' },
  { value: 'ss_3', label: 'SS 3' },
];

export default function ClassesManager({
  classes: initialClasses,
  sessions,
  staff,
}: {
  classes: ClassItem[];
  sessions: Session[];
  staff: StaffMember[];
}) {
  const [classes, setClasses] = useState(initialClasses);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [classLevel, setClassLevel] = useState('jss_1');
  const [arm, setArm] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');

  function resetForm() {
    setName('');
    setClassLevel('jss_1');
    setArm('');
    setSessionId('');
    setTeacherId('');
    setCapacity('');
    setDescription('');
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(cls: ClassItem) {
    setEditing(cls);
    setName(cls.name);
    setClassLevel(cls.class_level);
    setArm(cls.arm || '');
    setSessionId(cls.session_id);
    setTeacherId(cls.class_teacher_id || '');
    setCapacity(cls.capacity?.toString() || '');
    setDescription(cls.description || '');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload: Record<string, unknown> = {
      name,
      class_level: classLevel,
      arm: arm || null,
      session_id: sessionId,
      class_teacher_id: teacherId || null,
      capacity: capacity ? Number(capacity) : null,
      description: description || null,
    };

    let result;
    if (editing) {
      result = await updateClass(editing.id, payload);
    } else {
      result = await createClass(payload as Parameters<typeof createClass>[0]);
    }

    if (result.error) {
      setError(result.error);
    } else {
      const { getClasses } = await import('@/lib/actions/academic');
      const res = await getClasses();
      if (res.data) setClasses(res.data);
      resetForm();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this class?')) return;
    const result = await deleteClass(id);
    if (result.error) {
      setError(result.error);
    } else {
      setClasses(classes.filter(c => c.id !== id));
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Classes</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
          + New Class
        </button>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-bold">&times;</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="px-6 py-4 bg-blue-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Class Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. JSS1 A"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Class Level</label>
              <select value={classLevel} onChange={e => setClassLevel(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                {classLevels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Arm</label>
              <select value={arm} onChange={e => setArm(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">None</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Session</label>
              <select value={sessionId} onChange={e => setSessionId(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">Select session</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Class Teacher</label>
              <select value={teacherId} onChange={e => setTeacherId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">None</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity</label>
              <input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="e.g. 40"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={loading}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50">
                {loading ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes.map(cls => (
              <tr key={cls.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cls.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {classLevels.find(l => l.value === cls.class_level)?.label || cls.class_level}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.academic_sessions?.name || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.staff?.full_name || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cls.capacity || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {cls.is_active ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => startEdit(cls)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button onClick={() => handleDelete(cls.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
            {classes.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No classes yet. Create your first class.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
