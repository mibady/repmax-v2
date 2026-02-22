'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTournamentDetail } from '@/lib/hooks';

interface RosterEntry {
  player_name: string;
  jersey_number: string;
  position: string;
  class_year: string;
}

const EMPTY_PLAYER: RosterEntry = { player_name: '', jersey_number: '', position: '', class_year: '' };

type Step = 'registration' | 'payment' | 'roster' | 'complete';

export default function SchoolRegisterPage() {
  const { id: tournamentId } = useParams<{ id: string }>();
  const router = useRouter();
  const { tournament, myRegistration, isLoading, error } = useTournamentDetail(tournamentId);

  const [step, setStep] = useState<Step>('registration');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  // Registration form
  const [teamName, setTeamName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // School ID — fetched from user's school membership
  const [schoolId, setSchoolId] = useState<string | null>(null);

  // Roster
  const [players, setPlayers] = useState<RosterEntry[]>([{ ...EMPTY_PLAYER }]);

  // Fetch user's school
  const fetchSchool = useCallback(async () => {
    try {
      const res = await fetch('/api/schools/me');
      if (res.ok) {
        const data = await res.json();
        if (data.school) {
          setSchoolId(data.school.id);
          if (!teamName) {
            setTeamName(data.school.name);
          }
        }
      }
    } catch {
      // Silently fail — user may not have a school
    }
  }, [teamName]);

  useEffect(() => {
    fetchSchool();
  }, [fetchSchool]);

  // If already registered, skip to roster or complete
  useEffect(() => {
    if (myRegistration) {
      setRegistrationId(myRegistration.id);
      if (myRegistration.payment_status === 'approved' || myRegistration.payment_status === 'pending') {
        setStep('roster');
      }
    }
  }, [myRegistration]);

  async function handleRegistration(e: React.FormEvent) {
    e.preventDefault();
    if (!schoolId) {
      setFormError('You must be a member of a school to register. Please set up your school profile first.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_id: schoolId,
          team_name: teamName,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }

      const reg = await res.json();
      setRegistrationId(reg.id);

      // If there's a fee, go to payment step; otherwise go to roster
      if (tournament && tournament.entry_fee_cents > 0) {
        setStep('payment');
      } else {
        setStep('roster');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePayment() {
    if (!schoolId) return;

    setSubmitting(true);
    setFormError(null);

    try {
      // Use the createRegistrationPayment server action via API
      const res = await fetch('/api/tournaments/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournament_id: tournamentId,
          school_id: schoolId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Payment setup failed');
      }

      // For now, advance to roster (payment will be processed by Stripe webhook)
      setStep('roster');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  }

  function addPlayer() {
    setPlayers((prev) => [...prev, { ...EMPTY_PLAYER }]);
  }

  function removePlayer(index: number) {
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  }

  function updatePlayer(index: number, field: keyof RosterEntry, value: string) {
    setPlayers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  async function handleRosterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!registrationId) return;

    const validPlayers = players.filter((p) => p.player_name.trim());
    if (validPlayers.length === 0) {
      setFormError('Add at least one player to the roster');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/roster`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: registrationId,
          players: validPlayers.map((p) => ({
            player_name: p.player_name.trim(),
            jersey_number: p.jersey_number || undefined,
            position: p.position || undefined,
            class_year: p.class_year ? parseInt(p.class_year, 10) : undefined,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Roster submission failed');
      }

      setStep('complete');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Tournament not found</h3>
          <p className="text-slate-400 text-sm">{error?.message || 'Unable to load tournament'}</p>
        </div>
      </div>
    );
  }

  const entryFee = tournament.entry_fee_cents / 100;
  const platformFee = entryFee * 0.05;
  const totalFee = entryFee + platformFee;

  const inputClass = 'w-full bg-[#1F1F22] text-white border border-white/10 rounded-lg px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50';

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/school/events/${tournamentId}`}
          className="size-10 rounded-lg bg-[#141414] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-gray-400">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-white text-2xl font-bold">Register for {tournament.name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()} | {tournament.location}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {(['registration', 'payment', 'roster', 'complete'] as const).map((s, i) => {
          const steps = tournament.entry_fee_cents > 0
            ? ['registration', 'payment', 'roster', 'complete']
            : ['registration', 'roster', 'complete'];
          const idx = steps.indexOf(s);
          if (idx === -1) return null;

          const currentIdx = steps.indexOf(step);
          const isActive = s === step;
          const isDone = currentIdx > idx;

          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && idx > 0 && (
                <div className={`w-8 h-0.5 ${isDone ? 'bg-primary' : 'bg-white/10'}`} />
              )}
              <div className={`size-8 rounded-full flex items-center justify-center text-sm font-bold ${
                isActive ? 'bg-primary text-black' :
                isDone ? 'bg-primary/20 text-primary' :
                'bg-white/5 text-gray-500'
              }`}>
                {isDone ? (
                  <span className="material-symbols-outlined text-lg">check</span>
                ) : (
                  idx + 1
                )}
              </div>
              <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
            </div>
          );
        })}
      </div>

      {formError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-sm">{formError}</p>
        </div>
      )}

      {/* Step 1: Registration */}
      {step === 'registration' && (
        <div className="bg-[#141414] border border-white/5 rounded-xl p-6">
          <h2 className="text-white text-lg font-semibold mb-4">Team Information</h2>
          <form onSubmit={handleRegistration} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-1.5">Team Name</label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Lincoln High Lions"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-1.5">Contact Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Head Coach name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-1.5">Contact Email</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="coach@school.edu"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-1.5">Contact Phone (optional)</label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className={inputClass}
              />
            </div>

            {tournament.entry_fee_cents > 0 && (
              <div className="bg-[#1F1F22] rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Entry Fee</span>
                  <span className="text-white">${entryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Platform Fee (5%)</span>
                  <span className="text-white">${platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/5">
                  <span className="text-white">Total</span>
                  <span className="text-primary">${totalFee.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="size-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  Submitting...
                </>
              ) : tournament.entry_fee_cents > 0 ? (
                'Continue to Payment'
              ) : (
                'Register & Continue to Roster'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 'payment' && (
        <div className="bg-[#141414] border border-white/5 rounded-xl p-6 text-center space-y-4">
          <span className="material-symbols-outlined text-primary text-5xl">payments</span>
          <h2 className="text-white text-lg font-semibold">Payment Required</h2>
          <div className="bg-[#1F1F22] rounded-lg p-4 inline-block mx-auto">
            <div className="text-3xl font-bold text-primary">${totalFee.toFixed(2)}</div>
            <div className="text-gray-500 text-sm mt-1">Entry fee + platform fee</div>
          </div>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Payment will be processed via Stripe. You will be redirected to complete payment securely.
          </p>
          <button
            onClick={handlePayment}
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 mx-auto"
          >
            {submitting ? (
              <>
                <div className="size-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">lock</span>
                Pay ${totalFee.toFixed(2)}
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 3: Roster */}
      {step === 'roster' && (
        <div className="bg-[#141414] border border-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-semibold">Team Roster</h2>
            <button
              onClick={addPlayer}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">person_add</span>
              Add Player
            </button>
          </div>
          <form onSubmit={handleRosterSubmit} className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-2 py-2 text-left text-gray-400 font-medium">Name</th>
                    <th className="px-2 py-2 text-left text-gray-400 font-medium w-20">Jersey #</th>
                    <th className="px-2 py-2 text-left text-gray-400 font-medium w-28">Position</th>
                    <th className="px-2 py-2 text-left text-gray-400 font-medium w-24">Class Year</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {players.map((player, index) => (
                    <tr key={index}>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          required
                          value={player.player_name}
                          onChange={(e) => updatePlayer(index, 'player_name', e.target.value)}
                          placeholder="Player name"
                          className="w-full bg-[#1F1F22] text-white border border-white/10 rounded px-2 py-1.5 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={player.jersey_number}
                          onChange={(e) => updatePlayer(index, 'jersey_number', e.target.value)}
                          placeholder="#"
                          className="w-full bg-[#1F1F22] text-white border border-white/10 rounded px-2 py-1.5 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={player.position}
                          onChange={(e) => updatePlayer(index, 'position', e.target.value)}
                          className="w-full bg-[#1F1F22] text-white border border-white/10 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
                        >
                          <option value="">Select</option>
                          <option value="QB">QB</option>
                          <option value="RB">RB</option>
                          <option value="WR">WR</option>
                          <option value="TE">TE</option>
                          <option value="OL">OL</option>
                          <option value="DL">DL</option>
                          <option value="LB">LB</option>
                          <option value="CB">CB</option>
                          <option value="S">S</option>
                          <option value="K">K</option>
                          <option value="P">P</option>
                          <option value="ATH">ATH</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="2020"
                          max="2035"
                          value={player.class_year}
                          onChange={(e) => updatePlayer(index, 'class_year', e.target.value)}
                          placeholder="2026"
                          className="w-full bg-[#1F1F22] text-white border border-white/10 rounded px-2 py-1.5 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        {players.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePlayer(index)}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">close</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="size-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">save</span>
                    Submit Roster ({players.filter(p => p.player_name.trim()).length} players)
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === 'complete' && (
        <div className="bg-[#141414] border border-white/5 rounded-xl p-8 text-center space-y-4">
          <div className="size-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-green-400 text-3xl">check_circle</span>
          </div>
          <h2 className="text-white text-xl font-bold">Registration Complete</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Your team has been registered for {tournament.name}. The tournament organizer will review your registration.
          </p>
          <div className="flex items-center justify-center gap-3 pt-4">
            <Link
              href="/school/events/my"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">assignment</span>
              My Registrations
            </Link>
            <Link
              href="/school/events"
              className="px-5 py-2.5 text-gray-400 font-medium rounded-lg hover:text-white transition-colors"
            >
              Browse More
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
