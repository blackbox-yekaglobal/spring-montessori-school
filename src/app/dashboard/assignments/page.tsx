'use client';

import { useState, useEffect } from 'react';
import { getAssignments, createAssignment, deleteAssignment } from '@/lib/actions/communications';
import { getClasses, getSubjects } from '@/lib/actions/academic';
import { getCurrentProfile } from '@/lib/auth/utils';

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  max_score: number | null;
  is_published: boolean;
  classes?: { name: string };
  subjects?: { name: string; code: string };
  staff?: { full_name: string };
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    loadAssignments();
    getClasses().then(res => { if (res.data) setClasses(res.data); });
    getSubjects().then(res => { if (res.data) setSubjects(res.data); });
  }, []);

  async function loadAssignments() {
    setLoading(true);
    const res = await getAssignments();
    if (res.data) setAssignments(res.data);
    setLoading(false);
  }

  function resetForm() {
    setTitle(''); setDescription(''); setClassId(''); setSubjectId('');
    setDueDate(''); setMaxScore(''); setInstructions('');
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    // Staff ID would come from current user's staff record
    const result = await createAssignment({
      title,
      description: description || undefined,
      class_id: classId,
      subject_id: subjectId,
      staff_id: '00000000-0000-0000-0000-000000000000', // Placeholder - should be from profile
      due_date: dueDate,
      max_score: maxScore ? Number(maxScore) : undefined,
      instructions: instructions || undefined,
    });
    if (result.error) {
      setError(result.error);
    } else {
      await loadAssignments();
      resetForm();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this assignment?')) return;
    const result = await deleteAssignment(id);
    if (result.error) setError(result.error);
    else setAssignments(assignments.filter(a => a.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600 mt-1">Create and manage class assignments</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
          + New Assignment
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
          {error}<button onClick={() => setError('')} className="ml-2 font-bold">&times;</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Class *</label>
              <select value={classId} onChange={e => setClassId(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">Select</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject *</label>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">Select</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date *</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Score</label>
              <input type="number" value={maxScore} onChange={e => setMaxScore(e.target.value)} placeholder="e.g. 100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Instructions</label>
            <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">Create</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {assignments.map(a => (
          <div key={a.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{a.title}</h3>
                <div className="flex gap-3 mt-1 text-sm text-gray-500">
                  <span className="font-medium">{a.classes?.name}</span>
                  <span>{a.subjects?.name} ({a.subjects?.code})</span>
                  <span>By: {a.staff?.full_name}</span>
                </div>
                {a.description && <p className="mt-2 text-sm text-gray-600">{a.description}</p>}
              </div>
              <div className="text-right">
                <div className={`px-2 py-1 text-xs rounded-full font-medium ${a.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {a.is_published ? 'Published' : 'Draft'}
                </div>
                <div className="text-sm text-gray-500 mt-1">Due: {new Date(a.due_date).toLocaleDateString()}</div>
                {a.max_score && <div className="text-xs text-gray-400">Max: {a.max_score}</div>}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-900 text-sm">Delete</button>
            </div>
          </div>
        ))}
        {assignments.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">No assignments yet.</div>
        )}
      </div>
    </div>
  );
}
