'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ZONES = [
  'West',
  'Southwest',
  'Midwest',
  'Southeast',
  'Northeast',
  'Mid-Atlantic',
] as const;

export default function CoachSetupPage(): React.JSX.Element {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zone, setZone] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/coach/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          school_name: schoolName,
          city,
          state: state.toUpperCase(),
          zone,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create team');
      }

      router.push('/coach');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">groups</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Set Up Your Program</h1>
          <p className="text-slate-400">Tell us about your team to get started with RepMax.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1F1F22] rounded-xl border border-white/5 p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
              Program Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Eagles Football"
              className="w-full bg-[#2A2A2E] text-white text-sm rounded-lg px-3 py-2.5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-500"
            />
          </div>

          <div>
            <label htmlFor="schoolName" className="block text-sm font-medium text-slate-300 mb-1.5">
              School Name
            </label>
            <input
              id="schoolName"
              type="text"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Lincoln High School"
              className="w-full bg-[#2A2A2E] text-white text-sm rounded-lg px-3 py-2.5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-300 mb-1.5">
                City
              </label>
              <input
                id="city"
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Dallas"
                className="w-full bg-[#2A2A2E] text-white text-sm rounded-lg px-3 py-2.5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-500"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-slate-300 mb-1.5">
                State
              </label>
              <input
                id="state"
                type="text"
                required
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                placeholder="TX"
                className="w-full bg-[#2A2A2E] text-white text-sm rounded-lg px-3 py-2.5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-500 uppercase"
              />
            </div>
          </div>

          <div>
            <label htmlFor="zone" className="block text-sm font-medium text-slate-300 mb-1.5">
              Zone
            </label>
            <select
              id="zone"
              required
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full bg-[#2A2A2E] text-white text-sm rounded-lg px-3 py-2.5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="" disabled>Select a zone</option>
              {ZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-primary text-black font-bold px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="size-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">check</span>
                Create Program
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
