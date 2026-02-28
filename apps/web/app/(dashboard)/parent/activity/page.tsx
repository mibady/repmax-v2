'use client';

import Link from 'next/link';
import { useParentDashboard } from '@/lib/hooks';

export default function ParentActivityPage() {
  const { activity, isLoading, error, refresh } = useParentDashboard();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load activity</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Back Link */}
        <Link href="/parent" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Recent Activity</h1>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh
          </button>
        </div>

        {/* Activity List */}
        {activity.length === 0 ? (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-12 text-center">
            <span className="material-symbols-outlined text-slate-600 text-5xl mb-3">inbox</span>
            <h3 className="text-white font-semibold mb-1">No recent activity</h3>
            <p className="text-slate-500 text-sm">Activity from coaches and recruiters will appear here.</p>
          </div>
        ) : (
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 divide-y divide-white/5">
            {activity.map((item, index) => (
              <div key={item.id || index} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className={`size-10 rounded-full flex items-center justify-center ${
                  item.type === 'view' ? 'bg-blue-500/20 text-blue-400' :
                  item.type === 'message' ? 'bg-green-500/20 text-green-400' :
                  item.type === 'update' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-primary/20 text-primary'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {item.type === 'view' ? 'visibility' :
                     item.type === 'message' ? 'chat_bubble' :
                     item.type === 'update' ? 'upload' : 'bookmark'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{item.message}</p>
                  <p className="text-xs text-slate-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
