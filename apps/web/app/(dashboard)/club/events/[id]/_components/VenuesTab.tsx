'use client';

import { useState } from 'react';
import { useTournamentVenues } from '@/lib/hooks/use-tournament-venues';
import { Loader2 } from 'lucide-react';

interface VenuesTabProps {
  tournamentId: string;
}

export default function VenuesTab({ tournamentId }: VenuesTabProps) {
  const { venues, isLoading, addVenue, removeVenue } = useTournamentVenues(tournamentId);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [fieldNumber, setFieldNumber] = useState('');
  const [surfaceType, setSurfaceType] = useState<"grass" | "turf" | "indoor" | "">('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addVenue({
        name,
        field_number: fieldNumber ? parseInt(fieldNumber, 10) : null,
        surface_type: surfaceType || null,
      });
      setIsAdding(false);
      setName('');
      setFieldNumber('');
      setSurfaceType('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Tournament Venues</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">{isAdding ? 'close' : 'add'}</span>
          {isAdding ? 'Cancel' : 'Add Venue'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#1F1F22] border border-white/5 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white text-xs font-medium mb-1.5 uppercase tracking-wider">Venue Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Memorial Field"
                className="w-full bg-[#141414] text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-white text-xs font-medium mb-1.5 uppercase tracking-wider">Field Number</label>
              <input
                type="number"
                value={fieldNumber}
                onChange={(e) => setFieldNumber(e.target.value)}
                placeholder="e.g. 1"
                className="w-full bg-[#141414] text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-white text-xs font-medium mb-1.5 uppercase tracking-wider">Surface Type</label>
              <select
                value={surfaceType}
                onChange={(e) => setSurfaceType(e.target.value as '' | 'grass' | 'turf' | 'indoor')}
                className="w-full bg-[#141414] text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="">Select Surface</option>
                <option value="grass">Natural Grass</option>
                <option value="turf">Artificial Turf</option>
                <option value="indoor">Indoor</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Save Venue'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {venues.length === 0 ? (
          <div className="md:col-span-3 py-12 text-center bg-[#141414] border border-dashed border-white/10 rounded-xl">
            <span className="material-symbols-outlined text-gray-600 text-4xl mb-2">location_on</span>
            <p className="text-gray-500">No venues added yet</p>
          </div>
        ) : (
          venues.map((venue) => (
            <div key={venue.id} className="bg-[#141414] border border-white/5 rounded-xl p-5 flex flex-col justify-between group hover:border-white/10 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-white font-bold">{venue.name}</h4>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this venue?')) {
                        removeVenue(venue.id);
                      }
                    }}
                    className="size-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {venue.field_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Field:</span>
                      <span className="text-white font-medium">#{venue.field_number}</span>
                    </div>
                  )}
                  {venue.surface_type && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Surface:</span>
                      <span className="text-white font-medium capitalize">{venue.surface_type}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
