'use client';

import { useState, useEffect } from 'react';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '@/lib/actions/academic';

interface Subject {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    const res = await getSubjects();
    if (res.data) setSubjects(res.data);
  }

  function resetForm() {
    setName('');
    setCode('');
    setDescription('');
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(subject: Subject) {
    setEditing(subject);
    setName(subject.name);
    setCode(subject.code);
    setDescription(subject.description || '');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = { name, code, description: description || undefined };

    let result;
    if (editing) {
      result = await updateSubject(editing.id, payload);
    } else {
      result = await createSubject(payload);
    }

    if (result.error) {
      setError(result.error);
    } else {
      await loadSubjects();
      resetForm();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this subject?')) return;
    const result = await deleteSubject(id);
    if (result.error) {
      setError(result.error);
    } else {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subject Management</h1>
        <p className="text-gray-600 mt-1">Create and manage school subjects</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Subjects</h2>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
            + New Subject
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Mathematics"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject Code</label>
                <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required placeholder="e.g. MATH"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
              </div>
              <div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subjects.map(subject => (
                <tr key={subject.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{subject.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{subject.description || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {subject.is_active ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => startEdit(subject)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button onClick={() => handleDelete(subject.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No subjects yet. Create your first subject.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
