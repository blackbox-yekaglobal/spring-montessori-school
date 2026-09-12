'use client';

import { useState, useEffect } from 'react';
import { getScratchCards, getScratchCardBatches, generateScratchCardBatch } from '@/lib/actions/results';
import { getAcademicSessions, getTerms, getClasses } from '@/lib/actions/academic';

interface ScratchCard {
  id: string;
  serial_number: string;
  pin: string;
  status: string;
  remaining_attempts: number;
  max_attempts: number;
  used_at: string | null;
  students?: { full_name: string; admission_number: string } | null;
}

interface Batch {
  id: string;
  card_count: number;
  created_at: string;
}

export default function ScratchCardsPage() {
  const [cards, setCards] = useState<ScratchCard[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [sessions, setSessions] = useState<{ id: string; name: string }[]>([]);
  const [terms, setTerms] = useState<{ id: string; name: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [cardCount, setCardCount] = useState('50');
  const [sessionId, setSessionId] = useState('');
  const [termId, setTermId] = useState('');
  const [classId, setClassId] = useState('');

  useEffect(() => {
    loadData();
    getAcademicSessions().then(res => { if (res.data) setSessions(res.data); });
    getTerms().then(res => { if (res.data) setTerms(res.data); });
    getClasses().then(res => { if (res.data) setClasses(res.data); });
  }, []);

  async function loadData() {
    setLoading(true);
    const [cardsRes, batchesRes] = await Promise.all([getScratchCards(), getScratchCardBatches()]);
    if (cardsRes.data) setCards(cardsRes.data);
    if (batchesRes.data) setBatches(batchesRes.data);
    setLoading(false);
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const result = await generateScratchCardBatch({
      card_count: Number(cardCount),
      session_id: sessionId,
      term_id: termId,
      class_id: classId || undefined,
    });
    if (result.error) setError(result.error);
    else { await loadData(); setShowForm(false); }
  }

  const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    used: 'bg-gray-100 text-gray-800',
    expired: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scratch Cards</h1>
          <p className="text-gray-600 mt-1">Generate and manage result scratch cards</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
          Generate Batch
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4">
          {error}<button onClick={() => setError('')} className="ml-2 font-bold">&times;</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{cards.filter(c => c.status === 'available').length}</div>
          <div className="text-sm text-gray-500">Available</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{cards.filter(c => c.status === 'used').length}</div>
          <div className="text-sm text-gray-500">Used</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{batches.length}</div>
          <div className="text-sm text-gray-500">Batches</div>
        </div>
      </div>

      {/* Generate Form */}
      {showForm && (
        <form onSubmit={handleGenerate} className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Number of Cards</label>
              <input type="number" value={cardCount} onChange={e => setCardCount(e.target.value)} min="1" max="500"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2" />
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
              <label className="block text-sm font-medium text-gray-700">Term *</label>
              <select value={termId} onChange={e => setTermId(e.target.value)} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">Select</option>
                {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Class (optional)</label>
              <select value={classId} onChange={e => setClassId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2">
                <option value="">All classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">Generate</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300">Cancel</button>
          </div>
        </form>
      )}

      {/* Cards Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PIN</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used By</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cards.map(card => (
              <tr key={card.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono text-gray-900">{card.serial_number}</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-500">{card.pin}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${statusColors[card.status] || 'bg-gray-100 text-gray-800'}`}>
                    {card.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{card.remaining_attempts}/{card.max_attempts}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{card.students?.full_name || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{card.used_at ? new Date(card.used_at).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
            {cards.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">No scratch cards generated yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
