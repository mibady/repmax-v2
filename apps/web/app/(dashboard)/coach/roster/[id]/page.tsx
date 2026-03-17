'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAthleteFullProfile } from '@/lib/hooks';
import { PlayerCardContent } from '@/components/player-card';

export default function CoachRosterDetailPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data, isLoading, error } = useAthleteFullProfile(id);
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
        const resData = await res.json();
        toast.error(resData.error || 'Failed to remove athlete');
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

  if (error || !data) {
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

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Link + Coach Actions */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/coach/roster" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Roster
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/coach/roster/${id}/edit`}
              className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit
            </Link>
            <button
              onClick={() => router.push('/messages')}
              className="flex items-center gap-2 bg-[#2A2A2E] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#3A3A3E] transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">mail</span>
              Message
            </button>
            <button
              onClick={handleRemoveFromRoster}
              disabled={isRemoving}
              className="flex items-center gap-2 bg-[#2A2A2E] text-red-400 font-medium px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50 text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">person_remove</span>
              {isRemoving ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>

        <PlayerCardContent data={data} variant="embedded" />
      </div>
    </div>
  );
}
