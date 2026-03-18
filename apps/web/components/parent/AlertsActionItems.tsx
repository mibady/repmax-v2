'use client';

import Link from 'next/link';
import type { Alert } from '@/lib/hooks';

interface AlertsActionItemsProps {
  alerts: Alert[];
}

const ALERT_STYLES: Record<string, { dot: string; bg: string; border: string }> = {
  urgent: { dot: 'bg-red-400', bg: 'bg-red-500/5', border: 'border-red-500/20' },
  warning: { dot: 'bg-yellow-400', bg: 'bg-yellow-500/5', border: 'border-yellow-500/20' },
  info: { dot: 'bg-blue-400', bg: 'bg-blue-500/5', border: 'border-blue-500/20' },
};

// Sort: urgent first, then warning, then info
const PRIORITY: Record<string, number> = { urgent: 0, warning: 1, info: 2 };

export function AlertsActionItems({ alerts }: AlertsActionItemsProps) {
  const sorted = [...alerts].sort(
    (a, b) => (PRIORITY[a.type] ?? 3) - (PRIORITY[b.type] ?? 3)
  );

  if (sorted.length === 0) return null;

  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5">
      <div className="p-5 border-b border-white/5">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">notifications_active</span>
          Alerts & Action Items
        </h3>
      </div>
      <div className="divide-y divide-white/5">
        {sorted.map((alert) => {
          const style = ALERT_STYLES[alert.type] || ALERT_STYLES.info;
          return (
            <div key={alert.id} className={`p-4 flex items-center gap-3 ${style.bg}`}>
              <span className={`size-2.5 rounded-full ${style.dot} shrink-0`} />
              <p className="text-sm text-slate-300 flex-1">{alert.message}</p>
              {alert.action && alert.actionUrl && (
                <Link
                  href={alert.actionUrl}
                  className="text-xs font-semibold text-primary hover:text-primary/80 whitespace-nowrap"
                >
                  {alert.action}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
