'use client';

import { useState } from 'react';
import {
  createAcademicSession,
  updateAcademicSession,
  deleteAcademicSession,
  createTerm,
  updateTerm,
  deleteTerm,
} from '@/lib/actions/academic';

interface Session {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface Term {
  id: string;
  session_id: string;
  name: string;
  term_number: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  academic_sessions?: { name: string };
}

export default function SessionsManager({
  sessions: initialSessions,
  terms: initialTerms,
}: {
  sessions: Session[];
  terms: Term[];
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [terms, setTerms] = useState(initialTerms);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showTermForm, setShowTermForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Session form state
  const [sessionName, setSessionName] = useState('');
  const [sessionStart, setSessionStart] = useState('');
  const [sessionEnd, setSessionEnd] = useState('');
  const [sessionActive, setSessionActive] = useState(false);

  // Term form state
  const [termSessionId, setTermSessionId] = useState('');
  const [termName, setTermName] = useState('');
  const [termNumber, setTermNumber] = useState(1);
  const [termStart, setTermStart] = useState('');
  const [termEnd, setTermEnd] = useState('');
  const [termActive, setTermActive] = useState(false);

  function resetSessionForm() {
    setSessionName('');
    setSessionStart('');
    setSessionEnd('');
    setSessionActive(false);
    setEditingSession(null);
    setShowSessionForm(false);
  }

  function resetTermForm() {
    setTermSessionId('');
    setTermName('');
    setTermNumber(1);
    setTermStart('');
    setTermEnd('');
    setTermActive(false);
    setEditingTerm(null);
    setShowTermForm(false);
  }

  async function handleSessionSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      name: sessionName,
      start_date: sessionStart,
      end_date: sessionEnd,
      is_active: sessionActive,
    };

    let result;
    if (editingSession) {
      result = await updateAcademicSession(editingSession.id, payload);
    } else {
      result = await createAcademicSession(payload);
    }

    if (result.error) {
      setError(result.error);
    } else {
      // Refresh data
      const { getAcademicSessions } = await import('@/lib/actions/academic');
      const res = await getAcademicSessions();
      if (res.data) setSessions(res.data);
      resetSessionForm();
    }
    setLoading(false);
  }

  async function handleTermSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      session_id: termSessionId,
      name: termName,
      term_number: termNumber,
      start_date: termStart,
      end_date: termEnd,
      is_active: termActive,
    };

    let result;
    if (editingTerm) {
      result = await updateTerm(editingTerm.id, payload);
    } else {
      result = await createTerm(payload);
    }

    if (result.error) {
      setError(result.error);
    } else {
      const { getTerms } = await import('@/lib/actions/academic');
      const res = await getTerms();
      if (res.data) setTerms(res.data);
      resetTermForm();
    }
    setLoading(false);
  }

  async function handleDeleteSession(id: string) {
    if (!confirm('Delete this session? This cannot be undone.')) return;
    const result = await deleteAcademicSession(id);
    if (result.error) {
      setError(result.error);
    } else {
      setSessions(sessions.filter(s => s.id !== id));
    }
  }

  async function handleDeleteTerm(id: string) {
    if (!confirm('Delete this term? This cannot be undone.')) return;
    const result = await deleteTerm(id);
    if (result.error) {
      setError(result.error);
    } else {
      setTerms(terms.filter(t => t.id !== id));
    }
  }

  function startEditSession(session: Session) {
    setEditingSession(session);
    setSessionName(session.name);
    setSessionStart(session.start_date);
    setSessionEnd(session.end_date);
    setSessionActive(session.is_active);
    setShowSessionForm(true);
  }

  function startEditTerm(term: Term) {
    setEditingTerm(term);
    setTermSessionId(term.session_id);
    setTermName(term.name);
    setTermNumber(term.term_number);
    setTermStart(term.start_date);
    setTermEnd(term.end_date);
    setTermActive(term.is_active);
    setShowTermForm(true);
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-bold">&times;</button>
        </div>
      )}

      {/* Sessions Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Academic Sessions</h2>
          <button
            onClick={() => { resetSessionForm(); setShowSessionForm(true); }}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            + New Session
          </button>
        </div>

        {showSessionForm && (
          <form onSubmit={handleSessionSubmit} className="px-6 py-4 bg-blue-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Session Name</label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={e => setSessionName(e.target.value)}
                  required
                  placeholder="e.g. 2026/2027"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" value={sessionStart} onChange={e => setSessionStart(e.target.value)} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input type="date" value={sessionEnd} onChange={e => setSessionEnd(e.target.value)} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={sessionActive} onChange={e => setSessionActive(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  Active Session
                </label>
              </div>
              <div className="flex items-end gap-2">
                <button type="submit" disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50">
                  {loading ? 'Saving...' : editingSession ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={resetSessionForm}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map(session => (
                <tr key={session.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(session.start_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(session.end_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {session.is_active ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => startEditSession(session)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button onClick={() => handleDeleteSession(session.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No sessions yet. Create your first academic session.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Terms Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Terms</h2>
          <button
            onClick={() => { resetTermForm(); setShowTermForm(true); }}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            + New Term
          </button>
        </div>

        {showTermForm && (
          <form onSubmit={handleTermSubmit} className="px-6 py-4 bg-blue-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Session</label>
                <select value={termSessionId} onChange={e => setTermSessionId(e.target.value)} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                  <option value="">Select session</option>
                  {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Term Name</label>
                <input type="text" value={termName} onChange={e => setTermName(e.target.value)} required placeholder="e.g. First Term"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Term Number</label>
                <select value={termNumber} onChange={e => setTermNumber(Number(e.target.value))} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                  <option value={1}>1 - First Term</option>
                  <option value={2}>2 - Second Term</option>
                  <option value={3}>3 - Third Term</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" value={termStart} onChange={e => setTermStart(e.target.value)} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input type="date" value={termEnd} onChange={e => setTermEnd(e.target.value)} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={termActive} onChange={e => setTermActive(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  Active Term
                </label>
              </div>
              <div className="flex items-end gap-2">
                <button type="submit" disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50">
                  {loading ? 'Saving...' : editingTerm ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={resetTermForm}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {terms.map(term => (
                <tr key={term.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{term.academic_sessions?.name || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{term.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(term.start_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(term.end_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {term.is_active ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => startEditTerm(term)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button onClick={() => handleDeleteTerm(term.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
              {terms.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No terms yet. Create a session first, then add terms.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
