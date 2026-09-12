'use client';

import { useState, useEffect } from 'react';
import { getResults, createResult, approveResults, publishResults } from '@/lib/actions/results';
import { getClasses, getSubjects, getAcademicSessions, getTerms } from '@/lib/actions/academic';
import { getStudentList } from '@/lib/actions/students';

interface Result {
  id: string;
  student_id: string;
  ca_score: number | null;
  mid_term_score: number | null;
  end_term_score: number | null;
  total_score: number | null;
  grade: string | null;
  remark: string | null;
  is_approved: boolean;
  is_published: boolean;
  students?: { full_name: string; admission_number: string };
  subjects?: { name: string; code: string };
  terms?: { name: string };
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [sessions, setSessions] = useState<{ id: string; name: string }[]>([]);
  const [terms, setTerms] = useState<{ id: string; name: string }[]>([]);
  const [students, setStudents] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  // Form
  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [caScore, setCaScore] = useState('');
  const [midTerm, setMidTerm] = useState('');
  const [endTerm, setEndTerm] = useState('');
  const [grade, setGrade] = useState('');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    getClasses().then(res => { if (res.data) setClasses(res.data); });
    getSubjects().then(res => { if (res.data) setSubjects(res.data); });
    getAcademicSessions().then(res => { if (res.data) setSessions(res.data); });
    getTerms().then(res => { if (res.data) setTerms(res.data); });
    loadResults();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      getStudentList({ class_id: selectedClass }).then(res => {
        if (res.data) setStudents(res.data.map((s: any) => ({ id: s.id, full_name: s.full_name })));
      });
    }
  }, [selectedClass]);

  async function loadResults() {
    setLoading(true);
    const filters: Record<string, string> = {};
    if (selectedSession) filters.session_id = selectedSession;
    if (selectedTerm) filters.term_id = selectedTerm;
    const res = await getResults(filters);
    if (res.data) setResults(res.data);
    setLoading(false);
  }

  function resetForm() {
    setStudentId(''); setSubjectId(''); setCaScore(''); setMidTerm('');
    setEndTerm(''); setGrade(''); setRemark(''); setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const result = await createResult({
      student_id: studentId,
      class_id: selectedClass,
      subject_id: subjectId,
      session_id: selectedSession,
      term_id: selectedTerm,
      ca_score: caScore ? Number(caScore) : undefined,
      mid_term_score: midTerm ? Number(midTerm) : undefined,
      end_term_score: endTerm ? Number(endTerm) : undefined,
      grade: grade || undefined,
      remark: remark || undefined,
    });
    if (result.error) setError(result.error);
    else { await loadResults(); resetForm(); }
  }

  async function handleApprove() {
    const ids = results.filter(r => !r.is_approved).map(r => r.id);
    if (ids.length === 0) return;
    const result = await approveResults(ids);
    if (result.error) setError(result.error);
    else await loadResults();
  }

  async function handlePublish() {
    const ids = results.filter(r => r.is_approved && !r.is_published).map(r => r.id);
    if (ids.length === 0) return;
    const result = await publishResults(ids);
    if (result.error) setError(result.error);
    else await loadResults();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results Management</h1>
          <p className="text-gray-600 mt-1">Manage student results, approval, and publication</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">+ Add Result</button>
          <button onClick={handleApprove} className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">Approve All</button>
          <button onClick={handlePublish} className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700">Publish All</button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
          {error}<button onClick={() => setError('')} className="ml-2 font-bold">&times;</button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-3">
        <select value={selectedSession} onChange={e => setSelectedSession(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
          <option value="">All Sessions</option>
          {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
          <option value="">All Terms</option>
          {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button onClick={loadResults} className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700">Filter</button>
      </div>

      {/* Add Result Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Class</label>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">Select</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Student</label>
              <select value={studentId} onChange={e => setStudentId(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">Select</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">Select</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Session</label>
              <select value={selectedSession} onChange={e => setSelectedSession(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">Select</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Term</label>
              <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">Select</option>
                {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CA Score</label>
              <input type="number" value={caScore} onChange={e => setCaScore(e.target.value)} min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mid-Term</label>
              <input type="number" value={midTerm} onChange={e => setMidTerm(e.target.value)} min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End-Term</label>
              <input type="number" value={endTerm} onChange={e => setEndTerm(e.target.value)} min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">Save</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300">Cancel</button>
          </div>
        </form>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mid</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Published</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <div className="font-medium text-gray-900">{r.students?.full_name}</div>
                  <div className="text-xs text-gray-500">{r.students?.admission_number}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{r.subjects?.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{r.ca_score ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{r.mid_term_score ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{r.end_term_score ?? '—'}</td>
                <td className="px-4 py-3 text-sm font-medium">{r.total_score ?? '—'}</td>
                <td className="px-4 py-3 text-sm">{r.grade || '—'}</td>
                <td className="px-4 py-3">{r.is_approved ? <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">Yes</span> : <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">No</span>}</td>
                <td className="px-4 py-3">{r.is_published ? <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">Yes</span> : <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">No</span>}</td>
              </tr>
            ))}
            {results.length === 0 && !loading && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">No results found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
