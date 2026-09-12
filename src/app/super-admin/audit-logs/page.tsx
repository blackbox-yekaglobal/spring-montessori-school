import { getAuditLogs, getAuditLogStats } from '@/lib/actions/audit';
import AuditLogViewer from './AuditLogViewer';

export default async function AuditLogsPage() {
  const [logsResult, statsResult] = await Promise.all([
    getAuditLogs({ page: 1 }),
    getAuditLogStats(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-1">View system activity and audit trail</p>
      </div>
      <AuditLogViewer
        logs={logsResult.data || []}
        stats={statsResult.data || { todayCount: 0, totalCount: 0, actionBreakdown: {} }}
        totalCount={logsResult.count || 0}
      />
    </div>
  );
}
