'use client';

import { useState, useEffect } from 'react';
import { getExaminations, createExam, deleteExam } from '@/lib/actions/cbt';
import { getClasses, getSubjects, getAcademicSessions } from '@/lib/actions/academic';

interface Exam {
  id: string;
  title: string;
  exam_type: string;
  total_marks: number;
  duration_minutes: number;
  start_date: string;
  end_date: string;
  is_locked: boolean;
  is_published: boolean;
  classes?: { name: string };
  subjects?: { name: string; code: string };
  academic_sessions?: { name: string };
}

export default function CBTPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [sessions, setSessions] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState('ca1');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [totalMarks, setTotalMarks] = useState('100');
  const [duration, setDuration] = useState('60');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    loadExams();
    getClasses().then(res => { if (res.data) setClasses(res.data); });
    getSubjects().then(res => { if (res.data) setSubjects(res.data); });
    getAcademicSessions().then(res => { if (res.data) setSessions(res.data); });
  }, []);

  async function loadExams() {
    setLoading(true);
    const res = await getExaminations();
    if (res.data) setExams(res.data);
    setLoading(false);
  }

  function resetForm() {
    setTitle(''); setExamType('ca1'); setClassId(''); setSubjectId('');
    setSessionId(''); setTotalMarks('100'); setDuration('60');
    setStartDate(''); setEndDate(''); setInstructions('');
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const result = await createExam({
      title, exam_type: examType, class_id: classId, subject_id: subjectId,
      session_id: sessionId, total_marks: Number(totalMarks),
      duration_minutes: Number(duration), start_date: startDate, end_date: endDate,
      instructions: instructions || undefined,
    });
    if (result.error) setError(result.error);
    else { await loadExams(); resetForm(); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this exam?')) return;
    const result = await deleteExam(id);
    if (result.error) setError(result.error);
    else setExams(exams.filter(e => e.id !== id));
  }

  const examTypeLabels: Record<string, string> = {
    ca1: 'CA 1', ca2: 'CA 2', ca3: 'CA 3',
    mid_term: 'Mid-Term', end_term: 'End of Term',
    mock: 'Mock Exam',
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CBT Examinations</h1>
          <p className="text-gray-600 mt-1">Create and manage computer-based tests</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
          + New Exam
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
              <label className="block text-sm font-medium text-gray-700">Exam Type</label>
              <select value={examType} onChange={e => setExamType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                {Object.entries(examTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Session *</label>
              <select value={sessionId} onChange={e => setSessionId(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">Select</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
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
              <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)} min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Marks</label>
              <input type="number" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date *</label>
              <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date *</label>
              <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
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

      {/* Exams List */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {exams.map(exam => (
              <tr key={exam.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exam.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{examTypeLabels[exam.exam_type] || exam.exam_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.classes?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.subjects?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.duration_minutes} min</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{exam.total_marks}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-1">
                    {exam.is_locked && <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">Locked</span>}
                    {exam.is_published ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">Published</span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">Draft</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <a href={`/dashboard/cbt/exam/${exam.id}`} className="text-blue-600 hover:text-blue-900">Manage</a>
                  <button onClick={() => handleDelete(exam.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
            {exams.length === 0 && !loading && (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">No exams yet. Create your first exam.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
