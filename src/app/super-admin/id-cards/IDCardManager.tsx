'use client';

import { useState } from 'react';
import { generateIDCards } from '@/lib/actions/results';

interface Card {
  id: string;
  student_id: string;
  card_number: string;
  issue_date: string;
  is_active: boolean;
  students?: { full_name: string; admission_number: string; current_class?: { name: string } } | null;
}

interface ClassItem { id: string; name: string; }
interface SessionItem { id: string; name: string; }

export default function IDCardManager({ cards, classes, sessions }: {
  cards: Card[];
  classes: ClassItem[];
  sessions: SessionItem[];
}) {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerate = async () => {
    if (!selectedClass || !selectedSession) {
      setMessage('Please select both a class and session.');
      return;
    }
    setGenerating(true);
    setMessage('');
    const result = await generateIDCards(selectedClass, selectedSession);
    setGenerating(false);
    if (result.success) {
      setMessage(`Successfully generated ${result.count || 0} ID cards.`);
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate ID Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Select class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Select session</option>
              {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Cards'}
            </button>
          </div>
        </div>
        {message && (
          <p className={`mt-3 text-sm ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
        )}
      </div>

      {/* ID Card List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Generated Cards ({cards.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Card Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admission No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cards.map(card => (
                <tr key={card.id}>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900">{card.card_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{card.students?.full_name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{card.students?.admission_number || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{card.students?.current_class?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(card.issue_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${card.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {card.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {cards.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">No ID cards generated yet. Select a class and session to generate.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
