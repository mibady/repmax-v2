'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTournamentDetail } from '@/lib/hooks';

export default function SchoolEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { tournament, myRegistration, registrationCount, isLoading, error } = useTournamentDetail(id);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load tournament</h3>
          <p className="text-slate-400 text-sm">{error?.message || 'Tournament not found'}</p>
        </div>
      </div>
    );
  }

  const entryFeeFormatted = tournament.entry_fee_cents
    ? `$${(tournament.entry_fee_cents / 100).toFixed(2)}`
    : 'Free';

  const spotsLeft = tournament.teams_capacity - registrationCount;
  const deadlineFormatted = tournament.registration_deadline
    ? new Date(tournament.registration_deadline).toLocaleDateString()
    : null;

  const isDeadlinePassed = tournament.registration_deadline
    ? new Date(tournament.registration_deadline) < new Date()
    : false;

  const canRegister = !myRegistration && spotsLeft > 0 && !isDeadlinePassed;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/school/events"
          className="size-10 rounded-lg bg-[#141414] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-gray-400">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h1 className="text-white text-2xl font-bold">{tournament.name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Registration Status Banner */}
      {myRegistration && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${
          myRegistration.payment_status === 'approved'
            ? 'bg-green-500/10 border border-green-500/20'
            : myRegistration.payment_status === 'rejected'
            ? 'bg-red-500/10 border border-red-500/20'
            : 'bg-yellow-500/10 border border-yellow-500/20'
        }`}>
          <span className="material-symbols-outlined text-2xl">
            {myRegistration.payment_status === 'approved' ? 'check_circle' :
             myRegistration.payment_status === 'rejected' ? 'cancel' : 'pending'}
          </span>
          <div>
            <p className="text-white font-medium">
              {myRegistration.payment_status === 'approved' && 'Your school is registered for this tournament'}
              {myRegistration.payment_status === 'pending' && 'Your registration is pending approval'}
              {myRegistration.payment_status === 'rejected' && 'Your registration was not approved'}
              {myRegistration.payment_status === 'waitlisted' && 'Your school is on the waitlist'}
            </p>
            <p className="text-gray-400 text-sm">
              Registered on {new Date(myRegistration.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {tournament.description && (
            <div className="bg-[#141414] border border-white/5 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">description</span>
                About This Tournament
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                {tournament.description}
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="bg-[#141414] border border-white/5 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">info</span>
              Event Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem icon="event" label="Start Date" value={new Date(tournament.start_date).toLocaleDateString()} />
              <DetailItem icon="event" label="End Date" value={new Date(tournament.end_date).toLocaleDateString()} />
              <DetailItem icon="location_on" label="Location" value={tournament.location} />
              <DetailItem icon="groups" label="Capacity" value={`${registrationCount} / ${tournament.teams_capacity} teams`} />
              <DetailItem icon="payments" label="Entry Fee" value={entryFeeFormatted} />
              {deadlineFormatted && (
                <DetailItem
                  icon="schedule"
                  label="Reg. Deadline"
                  value={deadlineFormatted}
                  highlight={isDeadlinePassed}
                />
              )}
              {tournament.event_tier && (
                <DetailItem icon="star" label="Event Tier" value={tournament.event_tier.charAt(0).toUpperCase() + tournament.event_tier.slice(1)} />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar — Registration CTA */}
        <div className="space-y-4">
          <div className="bg-[#141414] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-white font-semibold">Registration</h3>

            {/* Capacity */}
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-400">Spots Taken</span>
                <span className="text-white font-medium">{registrationCount} / {tournament.teams_capacity}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min((registrationCount / tournament.teams_capacity) * 100, 100)}%` }}
                />
              </div>
              {spotsLeft <= 5 && spotsLeft > 0 && (
                <p className="text-yellow-400 text-xs mt-1">Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining</p>
              )}
            </div>

            {/* Fee */}
            <div className="flex items-center justify-between py-2 border-t border-white/5">
              <span className="text-gray-400 text-sm">Entry Fee</span>
              <span className="text-white font-bold text-lg">{entryFeeFormatted}</span>
            </div>

            {tournament.entry_fee_cents > 0 && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Platform Fee (5%)</span>
                <span>${((tournament.entry_fee_cents * 0.05) / 100).toFixed(2)}</span>
              </div>
            )}

            {/* CTA */}
            {canRegister ? (
              <Link
                href={`/school/events/${id}/register`}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">how_to_reg</span>
                Register Now
              </Link>
            ) : myRegistration ? (
              <div className="text-center text-gray-400 text-sm py-2">
                Already registered
              </div>
            ) : spotsLeft <= 0 ? (
              <div className="text-center text-red-400 text-sm py-2">
                Tournament is full
              </div>
            ) : isDeadlinePassed ? (
              <div className="text-center text-red-400 text-sm py-2">
                Registration deadline has passed
              </div>
            ) : null}

            {deadlineFormatted && !isDeadlinePassed && (
              <p className="text-gray-500 text-xs text-center">
                Registration closes {deadlineFormatted}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className="material-symbols-outlined text-gray-500 text-lg mt-0.5">{icon}</span>
      <div>
        <p className="text-gray-500 text-xs">{label}</p>
        <p className={`text-sm font-medium ${highlight ? 'text-red-400' : 'text-white'}`}>{value}</p>
      </div>
    </div>
  );
}
