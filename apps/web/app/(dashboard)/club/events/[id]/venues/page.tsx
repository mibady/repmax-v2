'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTournamentDetail, useTournamentVenues } from '@/lib/hooks';

const SURFACE_TYPES = [
  { value: 'grass', label: 'Grass' },
  { value: 'turf', label: 'Turf' },
  { value: 'indoor', label: 'Indoor' },
] as const;

export default function ClubVenuesPage() {
  const { id } = useParams<{ id: string }>();
  const { tournament, isLoading: tournamentLoading } = useTournamentDetail(id);
  const { venues, isLoading: venuesLoading, addVenue, updateVenue, removeVenue } = useTournamentVenues(id);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formFieldNumber, setFormFieldNumber] = useState('');
  const [formSurface, setFormSurface] = useState('');
  const [formCapacity, setFormCapacity] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isLoading = tournamentLoading || venuesLoading;

  const resetForm = () => {
    setFormName('');
    setFormFieldNumber('');
    setFormSurface('');
    setFormCapacity('');
    setFormNotes('');
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (venue: any) => {
    setFormName(venue.name);
    setFormFieldNumber(venue.field_number?.toString() || '');
    setFormSurface(venue.surface_type || '');
    setFormCapacity(venue.capacity?.toString() || '');
    setFormNotes(venue.location_notes || '');
    setEditingId(venue.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setIsSaving(true);

    const fieldNum = formFieldNumber ? parseInt(formFieldNumber) : null;
    const cap = formCapacity ? parseInt(formCapacity) : null;
    const surfaceType = (formSurface || null) as any;

    const venueData = {
      name: formName.trim(),
      field_number: fieldNum,
      surface_type: surfaceType,
      capacity: cap,
      location_notes: formNotes.trim() || null,
    };

    if (editingId) {
      await updateVenue(editingId, venueData);
    } else {
      await addVenue(venueData);
    }

    setIsSaving(false);
    resetForm();
  };

  const handleDelete = async (venueId: string) => {
    setDeletingId(venueId);
    await removeVenue(venueId);
    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading venues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/club/events/${id}`}
          className="size-10 rounded-lg bg-[#141414] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-gray-400">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h1 className="text-white text-2xl font-bold">Venues</h1>
          <p className="text-gray-400 text-sm mt-1">{tournament?.name}</p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Add Venue
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#141414] border border-white/5 rounded-xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">
              {editingId ? 'Edit Venue' : 'Add Venue'}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="size-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-gray-400 text-lg">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">
                Venue Name *
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Stadium A"
                required
                className="w-full px-3 py-2 bg-[#1F1F22] border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">
                Field Number
              </label>
              <input
                type="number"
                min={1}
                value={formFieldNumber}
                onChange={(e) => setFormFieldNumber(e.target.value)}
                placeholder="e.g. 1"
                className="w-full px-3 py-2 bg-[#1F1F22] border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">
                Surface Type
              </label>
              <select
                value={formSurface}
                onChange={(e) => setFormSurface(e.target.value)}
                className="w-full px-3 py-2 bg-[#1F1F22] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
              >
                <option value="">Select surface...</option>
                {SURFACE_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs font-medium mb-1.5">
                Capacity
              </label>
              <input
                type="number"
                min={1}
                value={formCapacity}
                onChange={(e) => setFormCapacity(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full px-3 py-2 bg-[#1F1F22] border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-xs font-medium mb-1.5">
                Location Notes
              </label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Additional location details..."
                rows={2}
                className="w-full px-3 py-2 bg-[#1F1F22] border border-white/10 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !formName.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="size-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">
                    {editingId ? 'check' : 'add'}
                  </span>
                  {editingId ? 'Update Venue' : 'Add Venue'}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Venues List */}
      {venues.length === 0 && !showForm ? (
        <div className="bg-[#141414] border border-white/5 rounded-xl px-5 py-12 text-center">
          <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">stadium</span>
          <p className="text-slate-500 mb-1">No venues added yet</p>
          <p className="text-slate-600 text-sm">Add venues where tournament games will be played</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((venue: any) => (
            <div
              key={venue.id}
              className="bg-[#141414] border border-white/5 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-medium">{venue.name}</h3>
                  {venue.field_number && (
                    <p className="text-gray-500 text-xs mt-0.5">Field {venue.field_number}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(venue)}
                    className="size-7 rounded flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-gray-400 text-base">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(venue.id)}
                    disabled={deletingId === venue.id}
                    className="size-7 rounded flex items-center justify-center hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-gray-400 hover:text-red-400 text-base">delete</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {venue.surface_type && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-white/5 text-gray-400">
                    <span className="material-symbols-outlined text-xs">grass</span>
                    {venue.surface_type.charAt(0).toUpperCase() + venue.surface_type.slice(1)}
                  </span>
                )}
                {venue.capacity && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-white/5 text-gray-400">
                    <span className="material-symbols-outlined text-xs">groups</span>
                    {venue.capacity.toLocaleString()}
                  </span>
                )}
              </div>

              {venue.location_notes && (
                <p className="text-gray-500 text-xs">{venue.location_notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
