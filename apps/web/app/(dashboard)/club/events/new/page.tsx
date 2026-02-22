'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const EVENT_TIERS = [
  { value: 'basic', label: 'Basic', price: '$99' },
  { value: 'standard', label: 'Standard', price: '$249' },
  { value: 'premium', label: 'Premium', price: '$499' },
] as const;

export default function CreateTournamentPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [entryFee, setEntryFee] = useState('0');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [eventTier, setEventTier] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const entryFeeCents = Math.round(parseFloat(entryFee || '0') * 100);

      const res = await fetch('/api/club/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || undefined,
          start_date: startDate,
          end_date: endDate,
          location,
          capacity: parseInt(capacity, 10),
          entry_fee_cents: entryFeeCents,
          registration_deadline: registrationDeadline || undefined,
          is_public: isPublic,
          event_tier: eventTier || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create tournament');
      }

      router.push('/club/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full bg-[#1F1F22] text-white border border-white/10 rounded-lg px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/club/events"
          className="size-10 rounded-lg bg-[#141414] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-gray-400">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-white text-2xl font-bold">Create Tournament</h1>
          <p className="text-gray-400 text-sm mt-1">Set up a new tournament event</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-[#141414] border border-white/5 rounded-xl p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-white text-sm font-medium mb-1.5">
              Tournament Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Spring Showcase 2026"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-white text-sm font-medium mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the tournament, rules, and what to expect..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-white text-sm font-medium mb-1.5">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-white text-sm font-medium mb-1.5">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-white text-sm font-medium mb-1.5">
              Location
            </label>
            <input
              id="location"
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. MetLife Stadium, East Rutherford, NJ"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="capacity" className="block text-white text-sm font-medium mb-1.5">
                Team Capacity
              </label>
              <input
                id="capacity"
                type="number"
                required
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g. 32"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="entryFee" className="block text-white text-sm font-medium mb-1.5">
                Entry Fee ($)
              </label>
              <input
                id="entryFee"
                type="number"
                min="0"
                step="0.01"
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
                placeholder="0.00"
                className={inputClass}
              />
              <p className="text-gray-500 text-xs mt-1">Leave at $0 for free entry</p>
            </div>
          </div>

          <div>
            <label htmlFor="registrationDeadline" className="block text-white text-sm font-medium mb-1.5">
              Registration Deadline
            </label>
            <input
              id="registrationDeadline"
              type="date"
              value={registrationDeadline}
              onChange={(e) => setRegistrationDeadline(e.target.value)}
              className={inputClass}
            />
            <p className="text-gray-500 text-xs mt-1">Optional. Leave blank for no deadline.</p>
          </div>

          <div>
            <label htmlFor="eventTier" className="block text-white text-sm font-medium mb-1.5">
              Event Tier
            </label>
            <select
              id="eventTier"
              value={eventTier}
              onChange={(e) => setEventTier(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a tier (optional)</option>
              {EVENT_TIERS.map((tier) => (
                <option key={tier.value} value={tier.value}>
                  {tier.label} ({tier.price})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              onClick={() => setIsPublic(!isPublic)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                isPublic ? 'bg-primary' : 'bg-white/10'
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition ${
                  isPublic ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <div>
              <span className="text-white text-sm font-medium">Public Tournament</span>
              <p className="text-gray-500 text-xs">Allow schools to discover and register for this tournament</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="size-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">add</span>
                  Create Tournament
                </>
              )}
            </button>
            <Link
              href="/club/events"
              className="px-5 py-2.5 text-gray-400 font-medium rounded-lg hover:text-white transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
