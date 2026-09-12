'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getExamById, getExamQuestions, getQuestions, addQuestionToExam, removeQuestionFromExam, getExamAttempts, updateExam } from '@/lib/actions/cbt';

interface ExamDetail {
  id: string;
  title: string;
  exam_type: string;
  total_marks: number;
  duration_minutes: number;
  start_date: string;
  end_date: string;
  is_locked: boolean;
  is_published: boolean;
  instructions: string | null;
  classes?: { name: string };
  subjects?: { name: string };
}

interface ExamQuestion {
  id: string;
  question_id: string;
  question_number: number;
  marks_override: number | null;
  question_bank?: {
    question_text: string;
    question_type: string;
    options: Record<string, string> | null;
    correct_answer: string;
    marks: number;
    difficulty: string;
  };
}

export default function ExamDetailPage() {
  const params = useParams();
  const examId = params.id as string;
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState('');

  useEffect(() => {
    loadData();
  }, [examId]);

  async function loadData() {
    setLoading(true);
    const [examRes, questionsRes] = await Promise.all([
      getExamById(examId),
      getExamQuestions(examId),
    ]);
    if (examRes.data) setExam(examRes.data);
    if (questionsRes.data) setExamQuestions(questionsRes.data);

    // Load available questions for this class/subject
    if (examRes.data) {
      const qRes = await getQuestions({
        class_id: (examRes.data as any).class_id,
        subject_id: (examRes.data as any).subject_id,
      });
      if (qRes.data) {
        // Filter out already-added questions
        const addedIds = new Set(questionsRes.data?.map(eq => eq.question_id) || []);
        setAvailableQuestions(qRes.data.filter(q => !addedIds.has(q.id)));
      }
    }
    setLoading(false);
  }

  async function handleAddQuestion() {
    if (!selectedQuestion) return;
    const nextNum = examQuestions.length + 1;
    const result = await addQuestionToExam(examId, selectedQuestion, nextNum);
    if (result.error) setError(result.error);
    else { setShowAddQuestion(false); setSelectedQuestion(''); await loadData(); }
  }

  async function handleRemoveQuestion(questionId: string) {
    const result = await removeQuestionFromExam(examId, questionId);
    if (result.error) setError(result.error);
    else await loadData();
  }

  async function togglePublished() {
    if (!exam) return;
    const result = await updateExam(examId, { is_published: !exam.is_published });
    if (result.error) setError(result.error);
    else await loadData();
  }

  async function toggleLocked() {
    if (!exam) return;
    const result = await updateExam(examId, { is_locked: !exam.is_locked });
    if (result.error) setError(result.error);
    else await loadData();
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;
  if (!exam) return <div className="text-center py-8 text-red-500">Exam not found</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
        <div className="flex gap-3 mt-1 text-sm text-gray-500">
          <span>{exam.classes?.name}</span>
          <span>{exam.subjects?.name}</span>
          <span>{exam.duration_minutes} minutes</span>
          <span>{exam.total_marks} marks</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
          {error}<button onClick={() => setError('')} className="ml-2 font-bold">&times;</button>
        </div>
      )}

      {/* Exam Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-3">
        <button onClick={togglePublished}
          className={`px-4 py-2 text-sm rounded-md ${exam.is_published ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-600 text-white hover:bg-green-700'}`}>
          {exam.is_published ? 'Unpublish' : 'Publish Exam'}
        </button>
        <button onClick={toggleLocked}
          className={`px-4 py-2 text-sm rounded-md ${exam.is_locked ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
          {exam.is_locked ? 'Unlock Exam' : 'Lock Exam'}
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-sm">
          <span className={`px-2 py-1 rounded-full font-medium ${exam.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {exam.is_published ? 'Published' : 'Draft'}
          </span>
          <span className={`px-2 py-1 rounded-full font-medium ${exam.is_locked ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
            {exam.is_locked ? 'Locked' : 'Unlocked'}
          </span>
        </div>
      </div>

      {/* Exam Questions */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Questions ({examQuestions.length})</h2>
          <button onClick={() => setShowAddQuestion(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
            + Add Question
          </button>
        </div>

        {showAddQuestion && (
          <div className="px-6 py-4 bg-blue-50 border-b">
            <div className="flex gap-3">
              <select value={selectedQuestion} onChange={e => setSelectedQuestion(e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">Select a question</option>
                {availableQuestions.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.question_text.substring(0, 80)}... ({q.marks} marks, {q.difficulty})
                  </option>
                ))}
              </select>
              <button onClick={handleAddQuestion} className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">Add</button>
              <button onClick={() => setShowAddQuestion(false)} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        )}

        <div className="divide-y">
          {examQuestions.map(eq => (
            <div key={eq.id} className="px-6 py-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-400">Q{eq.question_number}</span>
                  <span className="text-xs text-gray-500">{eq.question_bank?.question_type.replace('_', ' ')}</span>
                  <span className="text-xs text-gray-500">{eq.marks_override || eq.question_bank?.marks} marks</span>
                </div>
                <p className="text-sm text-gray-900">{eq.question_bank?.question_text}</p>
              </div>
              <button onClick={() => handleRemoveQuestion(eq.question_id)} className="text-red-600 hover:text-red-900 text-sm">Remove</button>
            </div>
          ))}
          {examQuestions.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-gray-500">No questions added yet. Add questions from the question bank.</div>
          )}
        </div>
      </div>

      {/* Instructions */}
      {exam.instructions && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Exam Instructions</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{exam.instructions}</p>
        </div>
      )}
    </div>
  );
}
