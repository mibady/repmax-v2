'use client';

import type { RosterAthlete } from '@/lib/hooks/use-coach-dashboard';

interface AthleteDevelopmentStatusProps {
  roster: RosterAthlete[];
}

export default function AthleteDevelopmentStatus({ roster }: AthleteDevelopmentStatusProps) {
  const recruitingReady = roster.filter(
    (a) => a.status === 'active' && a.offers > 0 && a.gpa != null && a.gpa >= 2.5
  ).length;

  const needsFilmUpdate = roster.filter(
    (a) => a.status === 'active' && a.offers === 0
  ).length;

  const academicRisk = roster.filter(
    (a) => a.gpa != null && a.gpa < 2.5
  ).length;

  const total = roster.length || 1;

  const statuses = [
    {
      label: 'Recruiting Ready',
      count: recruitingReady,
      pct: Math.round((recruitingReady / total) * 100),
      color: 'bg-green-500',
      textColor: 'text-green-400',
      icon: 'check_circle',
    },
    {
      label: 'Needs Film Update',
      count: needsFilmUpdate,
      pct: Math.round((needsFilmUpdate / total) * 100),
      color: 'bg-yellow-500',
      textColor: 'text-yellow-400',
      icon: 'videocam_off',
    },
    {
      label: 'Academic Risk',
      count: academicRisk,
      pct: Math.round((academicRisk / total) * 100),
      color: 'bg-red-500',
      textColor: 'text-red-400',
      icon: 'warning',
    },
  ];

  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[18px]">trending_up</span>
        Athlete Development Status
      </h3>
      <div className="space-y-3">
        {statuses.map((s) => (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[16px] ${s.textColor}`}>
                  {s.icon}
                </span>
                <span className="text-xs text-white/70">{s.label}</span>
              </div>
              <span className="text-xs font-semibold text-white">{s.count}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${s.color} transition-all duration-500`}
                style={{ width: `${Math.min(s.pct, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
