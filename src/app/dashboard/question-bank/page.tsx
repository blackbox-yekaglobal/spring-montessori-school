'use client';

import { useState, useEffect } from 'react';
import { getQuestions, createQuestion, deleteQuestion } from '@/lib/actions/cbt';
import { getClasses, getSubjects } from '@/lib/actions/academic';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  marks: number;
  difficulty: string;
  correct_answer: string;
  subjects?: { name: string; code: string };
  classes?: { name: string };
}

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterClass, setFilterClass] = useState('');

  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [marks, setMarks] = useState('1');
  const [difficulty, setDifficulty] = useState('medium');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    loadQuestions();
    getClasses().then(res => { if (res.data) setClasses(res.data); });
    getSubjects().then(res => { if (res.data) setSubjects(res.data); });
  }, []);

  async function loadQuestions() {
    setLoading(true);
    const filters: Record<string, string> = {};
    if (filterSubject) filters.subject_id = filterSubject;
    if (filterClass) filters.class_id = filterClass;
    const res = await getQuestions(filters);
    if (res.data) setQuestions(res.data);
    setLoading(false);
  }

  function resetForm() {
    setQuestionText(''); setQuestionType('multiple_choice'); setClassId('');
    setSubjectId(''); setMarks('1'); setDifficulty('medium'); setCorrectAnswer('');
    setOptionA(''); setOptionB(''); setOptionC(''); setOptionD(''); setExplanation('');
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const options = questionType === 'multiple_choice' ? { A: optionA, B: optionB, C: optionC, D: optionD } : undefined;

    const result = await createQuestion({
      subject_id: subjectId,
      class_id: classId,
      question_type: questionType,
      question_text: questionText,
      options,
      correct_answer: correctAnswer,
      marks: Number(marks),
      difficulty,
      explanation: explanation || undefined,
    });

    if (result.error) setError(result.error);
    else { await loadQuestions(); resetForm(); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this question?')) return;
    const result = await deleteQuestion(id);
    if (result.error) setError(result.error);
    else setQuestions(questions.filter(q => q.id !== id));
  }

  const difficultyColors: Record<string, string> = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-600 mt-1">Create and manage exam questions</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
          + New Question
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
          {error}<button onClick={() => setError('')} className="ml-2 font-bold">&times;</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select value={filterSubject} onChange={e => { setFilterSubject(e.target.value); }}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filterClass} onChange={e => { setFilterClass(e.target.value); }}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={loadQuestions} className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700">Filter</button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <select value={questionType} onChange={e => setQuestionType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True/False</option>
                <option value="fill_in_blank">Fill in the Blank</option>
                <option value="essay">Essay</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Question *</label>
            <textarea value={questionText} onChange={e => setQuestionText(e.target.value)} required rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
          </div>
          {questionType === 'multiple_choice' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700">Option A</label>
                <input type="text" value={optionA} onChange={e => setOptionA(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Option B</label>
                <input type="text" value={optionB} onChange={e => setOptionB(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Option C</label>
                <input type="text" value={optionC} onChange={e => setOptionC(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Option D</label>
                <input type="text" value={optionD} onChange={e => setOptionD(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" /></div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Correct Answer *</label>
              <input type="text" value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} required placeholder="e.g. A, True, or text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Marks</label>
              <input type="number" value={marks} onChange={e => setMarks(e.target.value)} min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Explanation</label>
            <input type="text" value={explanation} onChange={e => setExplanation(e.target.value)} placeholder="Optional explanation"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">Create</button>
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300">Cancel</button>
          </div>
        </form>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-400">#{idx + 1}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${difficultyColors[q.difficulty] || 'bg-gray-100 text-gray-800'}`}>{q.difficulty}</span>
                  <span className="text-xs text-gray-500">{q.question_type.replace('_', ' ')}</span>
                  <span className="text-xs text-gray-500">{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
                </div>
                <p className="text-sm text-gray-900">{q.question_text}</p>
                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                  <span>{q.classes?.name}</span>
                  <span>{q.subjects?.name}</span>
                  <span className="text-green-600">Answer: {q.correct_answer}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(q.id)} className="text-red-600 hover:text-red-900 text-sm ml-4">Delete</button>
            </div>
          </div>
        ))}
        {questions.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">No questions yet. Create your first question.</div>
        )}
      </div>
    </div>
  );
}
