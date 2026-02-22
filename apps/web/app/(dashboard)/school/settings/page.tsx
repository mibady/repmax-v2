'use client';

import { useState, useEffect } from 'react';
import { useSchoolDashboard } from '@/lib/hooks';

const DIVISIONS = ['D1', 'D2', 'D3', 'NAIA', 'JUCO'] as const;

export default function SchoolSettingsPage() {
  const { school, isLoading, error, refetch } = useSchoolDashboard();

  const [name, setName] = useState('');
  const [division, setDivision] = useState<string>('');
  const [conference, setConference] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (school) {
      setName(school.name || '');
      setDivision(school.division || '');
      setConference(school.conference || '');
      setCity(school.city || '');
      setState(school.state || '');
    }
  }, [school]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      if (!school) {
        // Create new school
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const res = await fetch('/api/schools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            slug,
            division: division || null,
            conference: conference || null,
            city: city || null,
            state: state || null,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to create school');
        }
      } else {
        // Update existing school - use a direct PATCH call
        const res = await fetch('/api/schools', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            division: division || null,
            conference: conference || null,
            city: city || null,
            state: state || null,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update school');
        }
      }

      setSaveSuccess(true);
      refetch();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load settings</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">School Settings</h1>
        <p className="text-gray-400 text-sm mt-1">
          {school ? 'Update your school information' : 'Set up your school profile'}
        </p>
      </div>

      <form onSubmit={handleSave} className="max-w-xl space-y-5">
        <div className="bg-[#141414] border border-white/5 rounded-xl p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">School Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[#1F1F22] border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary/50"
              placeholder="e.g. State University"
            />
          </div>

          {/* Division */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Division</label>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1F1F22] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary/50"
            >
              <option value="">Select Division</option>
              {DIVISIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Conference */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Conference</label>
            <input
              type="text"
              value={conference}
              onChange={(e) => setConference(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1F1F22] border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary/50"
              placeholder="e.g. Big Ten"
            />
          </div>

          {/* City + State Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1F1F22] border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary/50"
                placeholder="e.g. Columbus"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1F1F22] border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary/50"
                placeholder="e.g. OH"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="px-6 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : school ? 'Save Changes' : 'Create School'}
          </button>
          {saveSuccess && (
            <span className="text-green-400 text-sm font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              Saved successfully
            </span>
          )}
          {saveError && (
            <span className="text-red-400 text-sm">{saveError}</span>
          )}
        </div>
      </form>
    </div>
  );
}
