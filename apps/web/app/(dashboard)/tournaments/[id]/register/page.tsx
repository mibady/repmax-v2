'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTournamentDetail } from '@/lib/hooks';
import { Loader2, ArrowLeft, Calendar, MapPin, CreditCard, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function TournamentRegisterPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { tournament, isLoading, error } = useTournamentDetail(id);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form fields
  const [teamName, setTeamName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [waiverAccepted, setWaiverAccepted] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12 flex items-center justify-center">
        <Loader2 className="size-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12 flex items-center justify-center">
        <div className="text-center p-8 bg-[#141414] border border-white/5 rounded-3xl max-w-md">
          <h2 className="text-white text-xl font-bold mb-2">Event Not Found</h2>
          <p className="text-gray-500 mb-6">This event doesn&apos;t exist or is no longer available.</p>
          <Link href="/tournaments" className="text-primary font-bold hover:underline">Back to Events</Link>
        </div>
      </div>
    );
  }

  const entryFee = tournament.entry_fee_cents ? `$${(tournament.entry_fee_cents / 100).toFixed(2)}` : 'Free';
  const hasWaiver = !!tournament.waiver_text;
  const waiverText = tournament.waiver_text;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (hasWaiver && !waiverAccepted) {
      setSubmitError('You must accept the waiver to register.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/tournaments/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_name: teamName,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone || undefined,
          waiver_accepted: hasWaiver ? waiverAccepted : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12 flex items-center justify-center px-4">
        <div className="text-center p-8 bg-[#141414] border border-white/10 rounded-3xl max-w-md w-full">
          <div className="size-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="size-8 text-green-500" />
          </div>
          <h2 className="text-white text-2xl font-black mb-2">Registration Submitted</h2>
          <p className="text-gray-400 mb-6">You&apos;ll receive a confirmation email with event details and next steps.</p>
          <button
            onClick={() => router.push(`/tournaments/${id}`)}
            className="w-full bg-primary hover:bg-primary/90 text-black font-black py-3 rounded-2xl transition-all"
          >
            Back to Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-24 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <Link href={`/tournaments/${id}`} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Event</span>
        </Link>

        <h1 className="text-3xl font-black text-white mb-2">Register</h1>
        <p className="text-gray-500 mb-8">{tournament.name}</p>

        {/* Event Summary */}
        <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 mb-8 space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="size-4 text-primary" />
            <span className="text-gray-400">{new Date(tournament.start_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="size-4 text-primary" />
            <span className="text-gray-400">{tournament.location}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CreditCard className="size-4 text-primary" />
            <span className="text-gray-400">Entry Fee: {entryFee}</span>
          </div>
        </div>

        {submitError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
            {submitError}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Team Name</label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary"
              placeholder="Your team name"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Contact Name</label>
            <input
              type="text"
              required
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email</label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone</label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary"
              placeholder="(555) 555-5555"
            />
          </div>

          {/* Digital Waiver */}
          {hasWaiver && waiverText && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Waiver Agreement</label>
              <div className="bg-[#141414] border border-white/10 rounded-xl px-4 py-3 max-h-40 overflow-y-auto">
                <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-wrap">{waiverText}</p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={waiverAccepted}
                  onChange={(e) => setWaiverAccepted(e.target.checked)}
                  className="mt-1 size-4 rounded border-white/20 bg-[#141414] text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-300">
                  I have read and agree to the waiver terms above
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary/90 text-black font-black py-4 rounded-2xl transition-all shadow-[0_0_30px_-5px_rgba(212,175,55,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="size-5 animate-spin" /> : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}
