'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAthlete } from '@/lib/hooks';

export default function CoachRosterDetailPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { athlete, isLoading, error } = useAthlete(id);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveFromRoster = async () => {
    if (!confirm('Remove this athlete from your roster? This cannot be undone.')) return;
    setIsRemoving(true);
    try {
      const res = await fetch(`/api/coach/roster?athlete_id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Athlete removed from roster');
        router.push('/coach/roster');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to remove athlete');
      }
    } catch {
      toast.error('Failed to remove athlete');
    } finally {
      setIsRemoving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading athlete...</p>
        </div>
      </div>
    );
  }

  if (error || !athlete) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load athlete</h3>
          <p className="text-slate-400 text-sm">{error?.message || 'Athlete not found'}</p>
        </div>
      </div>
    );
  }

  const name = athlete.profile?.full_name || 'Unknown Athlete';
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2);
  const heightFt = athlete.height_inches ? Math.floor(athlete.height_inches / 12) : null;
  const heightIn = athlete.height_inches ? athlete.height_inches % 12 : null;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link href="/coach/roster" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Roster
        </Link>

        {/* Header Card */}
        <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="size-20 rounded-full bg-[#2A2A2E] flex items-center justify-center text-white font-bold text-2xl shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{name}</h1>
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <span className="font-mono text-white">{athlete.primary_position || 'N/A'}</span>
                <span>&middot;</span>
                <span>Class of {athlete.class_year || 'N/A'}</span>
                {athlete.state && (
                  <>
                    <span>&middot;</span>
                    <span>{athlete.state}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4 text-center">
            <p className="text-slate-400 text-xs mb-1">GPA</p>
            <p className="text-white text-xl font-bold font-mono">{athlete.gpa?.toFixed(2) || 'N/A'}</p>
          </div>
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4 text-center">
            <p className="text-slate-400 text-xs mb-1">Height</p>
            <p className="text-white text-xl font-bold font-mono">
              {heightFt !== null ? `${heightFt}'${heightIn}"` : 'N/A'}
            </p>
          </div>
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4 text-center">
            <p className="text-slate-400 text-xs mb-1">Weight</p>
            <p className="text-white text-xl font-bold font-mono">
              {athlete.weight_lbs ? `${athlete.weight_lbs} lbs` : 'N/A'}
            </p>
          </div>
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4 text-center">
            <p className="text-slate-400 text-xs mb-1">40-Yard</p>
            <p className="text-white text-xl font-bold font-mono">
              {athlete.forty_yard_time ? `${athlete.forty_yard_time}s` : 'N/A'}
            </p>
          </div>
          <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4 text-center">
            <p className="text-slate-400 text-xs mb-1">Offers</p>
            <p className="text-white text-xl font-bold font-mono">
              {athlete.offers_count ?? 0}
            </p>
          </div>
        </div>

        {/* Highlights Section */}
        <div className="bg-[#1F1F22] rounded-xl border border-white/5 mb-6">
          <div className="p-4 border-b border-white/5">
            <h2 className="text-white font-semibold">Highlights</h2>
          </div>
          <div className="p-4">
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">videocam_off</span>
              <p className="text-slate-500 text-sm">No highlights available</p>
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-3">
          <Link
            href={`/coach/roster/${id}/edit`}
            className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
            Edit
          </Link>
          <button
            onClick={() => router.push('/messages')}
            className="flex items-center gap-2 bg-[#2A2A2E] text-white font-medium px-4 py-2.5 rounded-lg hover:bg-[#3A3A3E] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">mail</span>
            Message Athlete
          </button>
          <button
            onClick={handleRemoveFromRoster}
            disabled={isRemoving}
            className="flex items-center gap-2 bg-[#2A2A2E] text-red-400 font-medium px-4 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">person_remove</span>
            {isRemoving ? 'Removing...' : 'Remove from Roster'}
          </button>
        </div>
      </div>
    </div>
  );
}
