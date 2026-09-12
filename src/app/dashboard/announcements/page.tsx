'use client';

import { useState, useEffect } from 'react';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '@/lib/actions/communications';

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_role: string | null;
  is_pinned: boolean;
  created_at: string;
  expires_at: string | null;
  profiles?: { full_name: string };
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => { loadAnnouncements(); }, []);

  async function loadAnnouncements() {
    setLoading(true);
    const res = await getAnnouncements();
    if (res.data) setAnnouncements(res.data);
    setLoading(false);
  }

  function resetForm() {
    setTitle(''); setContent(''); setTargetRole(''); setIsPinned(false); setExpiresAt('');
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const result = await createAnnouncement({
      title, content,
      target_role: targetRole || undefined,
      is_pinned: isPinned,
      expires_at: expiresAt || undefined,
    });
    if (result.error) setError(result.error);
    else { await loadAnnouncements(); resetForm(); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this announcement?')) return;
    const result = await deleteAnnouncement(id);
    if (result.error) setError(result.error);
    else setAnnouncements(announcements.filter(a => a.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Broadcast announcements to staff, students, and parents</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
          + New Announcement
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
          {error}<button onClick={() => setError('')} className="ml-2 font-bold">&times;</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Target Audience</label>
              <select value={targetRole} onChange={e => setTargetRole(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">Everyone</option>
                <option value="teacher">Teachers</option>
                <option value="student_parent">Students / Parents</option>
                <option value="school_admin">School Admins</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Expires At</label>
              <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Content *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} required rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={isPinned} onChange={e => setIsPinned(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Pin this announcement
          </label>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">Publish</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {announcements.map(a => (
          <div key={a.id} className={`bg-white rounded-lg shadow p-6 ${a.is_pinned ? 'border-l-4 border-blue-500' : ''}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  {a.is_pinned && <span className="text-blue-500 text-sm">📌</span>}
                  <h3 className="text-lg font-semibold text-gray-900">{a.title}</h3>
                </div>
                <div className="flex gap-3 mt-1 text-sm text-gray-500">
                  <span>By: {a.profiles?.full_name || 'Admin'}</span>
                  <span>{new Date(a.created_at).toLocaleDateString()}</span>
                  {a.target_role && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 capitalize">
                      {a.target_role.replace('_', ' ')}
                    </span>
                  )}
                  {a.expires_at && <span className="text-xs text-gray-400">Expires: {new Date(a.expires_at).toLocaleDateString()}</span>}
                </div>
              </div>
              <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-900 text-sm">Delete</button>
            </div>
            <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{a.content}</p>
          </div>
        ))}
        {announcements.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">No announcements yet.</div>
        )}
      </div>
    </div>
  );
}
