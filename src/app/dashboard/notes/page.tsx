'use client';

import { useState, useEffect } from 'react';
import { getNotes, createNote, deleteNote } from '@/lib/actions/communications';
import { getClasses, getSubjects } from '@/lib/actions/academic';

interface Note {
  id: string;
  title: string;
  content: string;
  note_type: string;
  created_at: string;
  classes?: { name: string };
  subjects?: { name: string; code: string };
  staff?: { full_name: string };
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [noteType, setNoteType] = useState('lesson');

  useEffect(() => {
    loadNotes();
    getClasses().then(res => { if (res.data) setClasses(res.data); });
    getSubjects().then(res => { if (res.data) setSubjects(res.data); });
  }, []);

  async function loadNotes() {
    setLoading(true);
    const res = await getNotes();
    if (res.data) setNotes(res.data);
    setLoading(false);
  }

  function resetForm() {
    setTitle(''); setContent(''); setClassId(''); setSubjectId(''); setNoteType('lesson');
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const result = await createNote({
      title, content, class_id: classId, subject_id: subjectId,
      staff_id: '00000000-0000-0000-0000-000000000000',
      note_type: noteType,
    });
    if (result.error) setError(result.error);
    else { await loadNotes(); resetForm(); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this note?')) return;
    const result = await deleteNote(id);
    if (result.error) setError(result.error);
    else setNotes(notes.filter(n => n.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lesson Notes</h1>
          <p className="text-gray-600 mt-1">Create and manage lesson notes for classes</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
          + New Note
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
          {error}<button onClick={() => setError('')} className="ml-2 font-bold">&times;</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select value={noteType} onChange={e => setNoteType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="lesson">Lesson Note</option>
                <option value="scheme">Scheme of Work</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Content *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} required rows={8}
              placeholder="Write the lesson note content here..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">Create</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {notes.map(note => (
          <div key={note.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">{note.note_type}</span>
                </div>
                <div className="flex gap-3 mt-1 text-sm text-gray-500">
                  <span>{note.classes?.name}</span>
                  <span>{note.subjects?.name}</span>
                  <span>By: {note.staff?.full_name}</span>
                  <span>{new Date(note.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(note.id)} className="text-red-600 hover:text-red-900 text-sm">Delete</button>
            </div>
            <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded p-3 max-h-48 overflow-y-auto">
              {note.content}
            </div>
          </div>
        ))}
        {notes.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">No notes yet.</div>
        )}
      </div>
    </div>
  );
}
