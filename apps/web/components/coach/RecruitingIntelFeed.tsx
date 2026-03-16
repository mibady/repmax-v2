'use client';

import type { CoachActivityItem, College } from '@/lib/hooks/use-coach-dashboard';

interface RecruitingIntelFeedProps {
  activity: CoachActivityItem[];
  colleges: College[];
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const temperatureColors: Record<string, string> = {
  Hot: 'text-red-400 bg-red-500/10',
  Warm: 'text-yellow-400 bg-yellow-500/10',
  Cold: 'text-blue-400 bg-blue-500/10',
};

export default function RecruitingIntelFeed({ activity, colleges }: RecruitingIntelFeedProps) {
  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">monitoring</span>
          Recruiting Intelligence
        </h3>
        <span className="text-[10px] text-white/30 uppercase tracking-wider">Live Feed</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Activity Feed */}
        <div className="lg:col-span-3 space-y-3">
          {activity.length === 0 ? (
            <p className="text-sm text-white/30 py-4 text-center">No recent activity</p>
          ) : (
            activity.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-start gap-3 group">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-primary text-[16px]">
                    {item.type === 'message' ? 'mail' : item.type === 'offer' ? 'emoji_events' : 'visibility'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate">
                    <span className="font-medium text-white">{item.athleteName}</span>{' '}
                    {item.description}
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5">{timeAgo(item.timestamp)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* College Interest Mini Panel */}
        <div className="lg:col-span-2 border-l border-white/5 pl-4">
          <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
            College Interest
          </h4>
          {colleges.length === 0 ? (
            <p className="text-xs text-white/30">No college data yet</p>
          ) : (
            <div className="space-y-2">
              {colleges.slice(0, 4).map((college) => (
                <div key={college.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-6 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white/40 text-[14px]">school</span>
                    </div>
                    <span className="text-xs text-white/70 truncate">{college.schoolName}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${temperatureColors[college.temperature] || 'text-white/40 bg-white/5'}`}>
                    {college.temperature}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
