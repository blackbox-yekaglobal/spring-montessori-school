'use client';

import { useState } from 'react';

interface LogEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_description: string | null;
  created_at: string;
  ip_address: string | null;
  profiles?: { full_name: string; email: string } | null;
  previous_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
}

interface Stats {
  todayCount: number;
  totalCount: number;
  actionBreakdown: Record<string, number>;
}

export default function AuditLogViewer({ logs, stats, totalCount }: {
  logs: LogEntry[];
  stats: Stats;
  totalCount: number;
}) {
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const actionColors: Record<string, string> = {
    create: 'bg-green-100 text-green-700',
    update: 'bg-blue-100 text-blue-700',
    delete: 'bg-red-100 text-red-700',
    view: 'bg-gray-100 text-gray-700',
    approve: 'bg-purple-100 text-purple-700',
    publish: 'bg-indigo-100 text-indigo-700',
    submit: 'bg-yellow-100 text-yellow-700',
    generate: 'bg-teal-100 text-teal-700',
    export: 'bg-orange-100 text-orange-700',
    login: 'bg-cyan-100 text-cyan-700',
    logout: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500">Today&apos;s Activity</div>
          <div className="text-2xl font-bold text-gray-900">{stats.todayCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500">Total Logs</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="text-sm text-gray-500 mb-2">Top Actions</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(stats.actionBreakdown)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([action, count]) => (
                <span key={action} className={`px-2 py-0.5 text-xs rounded-full ${actionColors[action] || 'bg-gray-100'}`}>
                  {action}: {count}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Action</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Actions</option>
              {['create', 'update', 'delete', 'view', 'approve', 'publish', 'submit', 'generate', 'export', 'login', 'logout'].map(a => (
                <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Entity Type</label>
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Types</option>
              {['student', 'staff', 'result', 'attendance', 'payment', 'announcement', 'exam', 'scratch_card'].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
          <span className="text-sm text-gray-500">{totalCount} total entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs
                .filter(log => !filterAction || log.action === filterAction)
                .filter(log => !filterEntity || log.entity_type === filterEntity)
                .map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {log.profiles?.full_name || 'Unknown'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${actionColors[log.action] || 'bg-gray-100'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{log.entity_type}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{log.entity_description || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{log.ip_address || '—'}</td>
                  <td className="px-4 py-3">
                    {(log.previous_values || log.new_values) && (
                      <button
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {expandedLog === log.id ? 'Hide' : 'View'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No audit logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded Log Detail */}
      {expandedLog && (() => {
        const log = logs.find(l => l.id === expandedLog);
        if (!log) return null;
        return (
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Log Detail — {log.action} on {log.entity_type}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {log.previous_values && (
                <div>
                  <div className="text-xs font-medium text-red-600 mb-1">Previous Values</div>
                  <pre className="text-xs bg-red-50 p-3 rounded overflow-auto max-h-48">{JSON.stringify(log.previous_values, null, 2)}</pre>
                </div>
              )}
              {log.new_values && (
                <div>
                  <div className="text-xs font-medium text-green-600 mb-1">New Values</div>
                  <pre className="text-xs bg-green-50 p-3 rounded overflow-auto max-h-48">{JSON.stringify(log.new_values, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
