'use client';

import type { ParentMetrics } from '@/lib/hooks';

interface RecruitingPulseProps {
  metrics: ParentMetrics;
  classYear: number;
}

export function RecruitingPulse({ metrics, classYear }: RecruitingPulseProps) {
  // Calculate days to next signing day (early signing: Dec 18, regular: Feb 4)
  const now = new Date();
  const year = classYear;
  const earlySigningDay = new Date(year - 1, 11, 18); // Dec 18 of senior year
  const regularSigningDay = new Date(year, 1, 4); // Feb 4

  let signingTarget = earlySigningDay;
  if (now > earlySigningDay) signingTarget = regularSigningDay;
  if (now > regularSigningDay) signingTarget = new Date(year, 11, 18); // next cycle early signing (Dec of grad year)
  if (now > signingTarget) signingTarget = new Date(year + 1, 1, 4); // next cycle regular signing

  const daysToSigning = Math.max(0, Math.ceil((signingTarget.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const signingLabel = signingTarget.getMonth() === 11 ? 'Early Signing Day' : 'Regular Signing Day';

  const cards = [
    {
      icon: 'school',
      label: 'Schools Watching',
      value: metrics.schoolsTracking,
      sub: 'On shortlists',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      icon: 'chat_bubble',
      label: 'Coach Contacts',
      value: metrics.coachMessages,
      sub: 'Unread messages',
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      icon: 'emoji_events',
      label: 'Offers',
      value: metrics.offersCount,
      sub: 'Scholarship offers',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      icon: 'calendar_month',
      label: `Days to ${signingLabel}`,
      value: daysToSigning,
      sub: signingTarget.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-[#1F1F22] rounded-xl p-5 border border-white/5">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <span className={`material-symbols-outlined text-[20px] ${card.color}`}>{card.icon}</span>
            {card.label}
          </div>
          <span className="text-3xl font-bold text-white">{card.value}</span>
          <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
