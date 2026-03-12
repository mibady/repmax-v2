'use client';

interface ActivityItem {
  id: string;
  type: 'message' | 'offer' | 'visit' | 'film' | string;
  description: string;
  athleteName?: string;
  timestamp: string;
}

interface CoachActivityFeedProps {
  activity: ActivityItem[];
}

const typeIcons: Record<string, string> = {
  message: 'mail',
  offer: 'local_offer',
  visit: 'place',
  film: 'videocam',
};

const typeColors: Record<string, string> = {
  message: 'text-blue-400 bg-blue-400/10',
  offer: 'text-green-400 bg-green-400/10',
  visit: 'text-amber-400 bg-amber-400/10',
  film: 'text-purple-400 bg-purple-400/10',
};

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

export default function CoachActivityFeed({
  activity,
}: CoachActivityFeedProps) {
  const displayItems = activity.slice(0, 5);

  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-slate-400 text-lg">
          history
        </span>
        <h3 className="text-white font-semibold text-sm">Recent Activity</h3>
      </div>

      {/* Activity List */}
      <div className="space-y-2">
        {displayItems.map((item) => {
          const icon = typeIcons[item.type] || 'notifications';
          const colorClass =
            typeColors[item.type] || 'text-slate-400 bg-slate-400/10';

          return (
            <div
              key={item.id}
              className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {/* Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}
              >
                <span className="material-symbols-outlined text-sm">
                  {icon}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate">
                  {item.description}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {getRelativeTime(item.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All */}
      {activity.length > 5 && (
        <button className="block w-full text-center text-xs text-primary hover:text-primary/80 mt-3 transition-colors">
          View All Activity
        </button>
      )}
    </div>
  );
}
