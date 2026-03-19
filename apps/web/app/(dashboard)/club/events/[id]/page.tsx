'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTournamentDetail } from '@/lib/hooks';
import ScheduleTab from './_components/ScheduleTab';
import BracketsTab from './_components/BracketsTab';
import VenuesTab from './_components/VenuesTab';
import NotificationsTab from './_components/NotificationsTab';
import StandingsTab from './_components/StandingsTab';

type Tab = 'overview' | 'registrations' | 'schedule' | 'brackets' | 'standings' | 'venues' | 'notifications';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    approved: 'bg-green-500/10 text-green-400 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    waitlisted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${styles[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function ClubEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { tournament, registrations, registrationCount, isLoading, error, refetch } = useTournamentDetail(id);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleStatusUpdate(registrationId: string, status: 'approved' | 'rejected') {
    setUpdatingId(registrationId);
    try {
      const res = await fetch(`/api/tournaments/${id}/registrations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: registrationId, status }),
      });
      if (res.ok) {
        refetch();
      }
    } catch {
      // Error handling — refetch to show current state
      refetch();
    } finally {
      setUpdatingId(null);
    }
  }

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

  const deadlineFormatted = tournament.registration_deadline
    ? new Date(tournament.registration_deadline).toLocaleDateString()
    : 'No deadline';

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
        <div className="flex-1">
          <h1 className="text-white text-2xl font-bold">{tournament.name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tournament.is_public && (
            <span className="px-2 py-0.5 text-xs font-medium rounded border bg-green-500/10 text-green-400 border-green-500/20">
              Public
            </span>
          )}
          <span className={`px-2 py-0.5 text-xs font-medium rounded border ${
            tournament.status === 'upcoming' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
            tournament.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
            'bg-gray-500/10 text-gray-400 border-gray-500/20'
          }`}>
            {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5 pb-0 flex-wrap">
        {(['overview', 'registrations', 'schedule', 'brackets', 'standings', 'venues', 'notifications'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-[1px] capitalize ${
              activeTab === tab
                ? 'text-white border-primary'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            {tab === 'overview' ? 'Overview' : 
             tab === 'registrations' ? `Registrations (${registrationCount})` : 
             tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#141414] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">info</span>
              Tournament Details
            </h3>
            <div className="space-y-3">
              <InfoRow icon="event" label="Dates" value={`${new Date(tournament.start_date).toLocaleDateString()} - ${new Date(tournament.end_date).toLocaleDateString()}`} />
              <InfoRow icon="location_on" label="Location" value={tournament.location} />
              <InfoRow icon="groups" label="Capacity" value={`${registrationCount} / ${tournament.teams_capacity} teams`} />
              <InfoRow icon="payments" label="Entry Fee" value={entryFeeFormatted} />
              <InfoRow icon="schedule" label="Reg. Deadline" value={deadlineFormatted} />
              <InfoRow icon="visibility" label="Visibility" value={tournament.is_public ? 'Public' : 'Private'} />
              {tournament.event_tier && (
                <InfoRow icon="star" label="Event Tier" value={tournament.event_tier.charAt(0).toUpperCase() + tournament.event_tier.slice(1)} />
              )}
            </div>
          </div>

          {tournament.description && (
            <div className="bg-[#141414] border border-white/5 rounded-xl p-5 space-y-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">description</span>
                Description
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{tournament.description}</p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-[#141414] border border-white/5 rounded-xl p-5 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">analytics</span>
              Registration Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total" value={registrationCount.toString()} />
              <StatCard label="Approved" value={registrations.filter(r => r.payment_status === 'approved').length.toString()} />
              <StatCard label="Pending" value={registrations.filter(r => r.payment_status === 'pending').length.toString()} />
              <StatCard label="Rejected" value={registrations.filter(r => r.payment_status === 'rejected').length.toString()} />
            </div>
          </div>
        </div>
      )}

      {/* Registrations Tab */}
      {activeTab === 'registrations' && (
        <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
          {registrations.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">how_to_reg</span>
              <p className="text-slate-500">No registrations yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Team</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Contact</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Registered</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-white font-medium">
                        {reg.team_name || 'Unnamed Team'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white text-sm">{reg.contact_name || '-'}</div>
                        <div className="text-gray-500 text-xs">{reg.contact_email || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={reg.payment_status} />
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {reg.payment_status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStatusUpdate(reg.id, 'approved')}
                              disabled={updatingId === reg.id}
                              className="px-3 py-1 text-xs font-medium rounded bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(reg.id, 'rejected')}
                              disabled={updatingId === reg.id}
                              className="px-3 py-1 text-xs font-medium rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <ScheduleTab
          tournamentId={id}
          schedulePublished={!!tournament.schedule_published}
        />
      )}

      {/* Brackets Tab */}
      {activeTab === 'brackets' && <BracketsTab tournamentId={id} registrations={registrations} />}

      {/* Standings Tab */}
      {activeTab === 'standings' && <StandingsTab tournamentId={id} />}

      {/* Venues Tab */}
      {activeTab === 'venues' && <VenuesTab tournamentId={id} />}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && <NotificationsTab tournamentId={id} />}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="material-symbols-outlined text-gray-500 text-lg">{icon}</span>
      <span className="text-gray-500 text-sm w-28 shrink-0">{label}</span>
      <span className="text-white text-sm">{value}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#1F1F22] rounded-lg p-3 text-center">
      <div className="text-white text-xl font-bold">{value}</div>
      <div className="text-gray-500 text-xs mt-0.5">{label}</div>
    </div>
  );
}
