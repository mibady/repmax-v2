'use client';

import Link from 'next/link';

import type { RosterAthlete } from '@/lib/hooks/use-coach-dashboard';

interface AthleteCardProps {
  athlete: RosterAthlete;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500/80 text-green-100',
  committed: 'bg-blue-500/80 text-blue-100',
  transferred: 'bg-yellow-500/80 text-yellow-100',
  graduated: 'bg-slate-500/80 text-slate-100',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  committed: 'Committed',
  transferred: 'Transferred',
  graduated: 'Graduated',
};

function formatHeight(inches: number): string {
  const feet = Math.floor(inches / 12);
  const remaining = inches % 12;
  return `${feet}'${remaining}"`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function AthleteCard({ athlete }: AthleteCardProps) {
  return (
    <div className="group bg-[#1F1F22] rounded-xl border border-white/5 overflow-hidden hover:scale-[1.02] transition-transform duration-200">
      {/* Photo Area */}
      <div className="relative h-44 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        {athlete.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={athlete.avatarUrl}
            alt={athlete.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl font-bold text-white/60">
            {getInitials(athlete.name)}
          </span>
        )}

        {/* Status Badge - Top Right */}
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[athlete.status] || 'bg-slate-500/80 text-slate-100'}`}
        >
          {statusLabels[athlete.status] || athlete.status}
        </span>

        {/* Star Rating - Bottom Left */}
        {(athlete.starRating ?? 0) > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-black/60 rounded-full px-2 py-0.5">
            <span className="material-symbols-outlined text-yellow-400 text-sm">
              star
            </span>
            <span className="text-yellow-400 text-xs font-semibold">
              {athlete.starRating}
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4">
        <h3 className="text-white font-semibold truncate">{athlete.name}</h3>
        <p className="text-slate-400 text-xs mt-0.5">
          {athlete.position} &middot; Class of {athlete.classYear}
        </p>

        {/* 2x2 Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-white/5 rounded-lg px-2 py-1.5 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Size
            </p>
            <p className="text-xs text-white font-medium">
              {athlete.heightInches ? `${formatHeight(athlete.heightInches)} / ${athlete.weightLbs || '—'}` : '—'}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg px-2 py-1.5 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              GPA
            </p>
            <p className="text-xs text-white font-medium">
              {athlete.gpa != null ? athlete.gpa.toFixed(2) : '—'}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg px-2 py-1.5 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              40-Time
            </p>
            <p className="text-xs text-white font-medium">
              {athlete.fortyTime ? `${athlete.fortyTime.toFixed(2)}s` : '—'}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg px-2 py-1.5 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Offers
            </p>
            <p className="text-xs text-white font-medium">{athlete.offers}</p>
          </div>
        </div>

        {/* View Profile Button */}
        <Link
          href={`/coach/roster/${athlete.id}`}
          className="mt-3 block w-full text-center text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg py-2 transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
