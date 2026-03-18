'use client';

import Link from 'next/link';
import type { ActivityItem } from '@/lib/hooks';

interface RecentActivityProps {
  activity: ActivityItem[];
}

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  view: { icon: 'visibility', color: 'text-blue-400' },
  shortlist: { icon: 'bookmark_added', color: 'text-green-400' },
  message: { icon: 'mail', color: 'text-purple-400' },
  update: { icon: 'update', color: 'text-slate-400' },
};

export function RecentActivity({ activity }: RecentActivityProps) {
  const items = activity.slice(0, 5);

  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5">
      <div className="p-5 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">notifications</span>
          Recent Activity
        </h3>
        <Link href="/parent/activity" className="text-xs font-semibold text-primary hover:text-primary/80">
          View All
        </Link>
      </div>
      <div className="divide-y divide-white/5">
        {items.length === 0 ? (
          <div className="p-6 text-center">
            <span className="material-symbols-outlined text-slate-600 text-3xl mb-2">inbox</span>
            <p className="text-sm text-slate-500">No activity yet</p>
          </div>
        ) : (
          items.map((item) => {
            const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.update;
            return (
              <div key={item.id} className="p-4 flex items-start gap-3 hover:bg-white/[0.02] transition-colors">
                <span className={`material-symbols-outlined text-[18px] mt-0.5 ${config.color}`}>
                  {config.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate">{item.message}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.time}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
