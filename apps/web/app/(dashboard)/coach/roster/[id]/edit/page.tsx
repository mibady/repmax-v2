'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAthlete } from '@/lib/hooks';

export default function CoachRosterEditPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { athlete, isLoading, error } = useAthlete(id);

  const [priority, setPriority] = useState<string>('medium');
  const [notes, setNotes] = useState<string>('');
  const [rosterFound, setRosterFound] = useState(false);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch the roster entry for this athlete from the coach dashboard
  useEffect(() => {
    async function fetchRosterEntry(): Promise<void> {
      try {
        const res = await fetch('/api/coach/dashboard');
        if (!res.ok) {
          setLoadingRoster(false);
          return;
        }
        const data = await res.json();
        const entry = data.roster?.find(
          (r: { id: string; priority?: string; notes?: string }) => r.id === id
        );
        if (entry) {
          setRosterFound(true);
          setPriority(entry.priority || 'medium');
          setNotes(entry.notes || '');
        }
      } catch {
        // Ignore -- page still works for display
      } finally {
        setLoadingRoster(false);
      }
    }

    if (id) fetchRosterEntry();
  }, [id]);

  const handleSave = async (): Promise<void> => {
    if (!rosterFound) {
      setSaveMessage({ type: 'error', text: 'No roster entry found for this athlete' });
      return;
    }

    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch('/api/coach/roster', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athlete_id: id, priority, notes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSaveMessage({ type: 'success', text: 'Changes saved successfully' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loadingRoster) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading...</p>
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

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link href={`/coach/roster/${id}`} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Athlete
        </Link>

        <h1 className="text-2xl font-bold text-white mb-6">Edit Roster Entry</h1>

        {/* Read-only Athlete Summary */}
        <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-[#2A2A2E] flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden">
              {athlete.profile?.avatar_url ? (
                <img src={athlete.profile.avatar_url} alt={name} className="size-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">{name}</h2>
              <p className="text-slate-400 text-sm">
                {athlete.primary_position || 'N/A'} &middot; Class of {athlete.class_year || 'N/A'} &middot; GPA: {athlete.gpa?.toFixed(1) || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-5">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#2A2A2E] text-white text-sm rounded-lg px-3 py-2.5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="top">Top</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this athlete..."
                rows={4}
                className="w-full bg-[#2A2A2E] text-white text-sm rounded-lg px-3 py-2.5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-500 resize-none"
              />
            </div>
          </div>

          {/* Save Feedback */}
          {saveMessage && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              saveMessage.type === 'success'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {saveMessage.text}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving || !rosterFound}
              className="flex items-center gap-2 bg-primary text-black font-bold px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="size-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  Save Changes
                </>
              )}
            </button>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 bg-[#2A2A2E] text-slate-300 font-medium px-5 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>

          {!rosterFound && (
            <p className="text-yellow-400 text-xs mt-3">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">warning</span>
              No roster entry found for this athlete. Save is disabled.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
