'use client';

import Link from 'next/link';
import { useClubDashboard } from '@/lib/hooks';

function StatCard({ icon, label, value, change, changeType }: {
  icon: string;
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}) {
  return (
    <div className="bg-[#141414] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
        </div>
        <span className="text-gray-400 text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-white text-2xl font-bold">{value}</span>
        {change && (
          <span className={`text-xs font-medium ${
            changeType === 'positive' ? 'text-green-400' :
            changeType === 'negative' ? 'text-red-400' :
            'text-gray-400'
          }`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

function TournamentStatusBadge({ status }: { status: 'upcoming' | 'active' | 'completed' }) {
  const styles = {
    upcoming: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    completed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  const labels = {
    upcoming: 'Upcoming',
    active: 'Active',
    completed: 'Completed',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: 'completed' | 'pending' | 'failed' }) {
  const styles = {
    completed: 'bg-green-500/10 text-green-400',
    pending: 'bg-yellow-500/10 text-yellow-400',
    failed: 'bg-red-500/10 text-red-400',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function VerificationTypeBadge({ type }: { type: 'identity' | 'academic' | 'athletic' }) {
  const styles = {
    identity: 'bg-purple-500/10 text-purple-400',
    academic: 'bg-blue-500/10 text-blue-400',
    athletic: 'bg-orange-500/10 text-orange-400',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${styles[type]}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

export default function ClubDashboardPage() {
  const {
    tournaments,
    verifications,
    payments,
    metrics,
    isLoading,
    error,
  } = useClubDashboard();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load dashboard</h3>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const totalRevenue = metrics?.totalRevenue || tournaments.reduce((sum, t) => sum + t.revenue, 0);
  const totalRegistrations = metrics?.totalRegistrations || tournaments.reduce((sum, t) => sum + t.registrations, 0);
  const activeEvents = metrics?.activeEvents || tournaments.filter(t => t.status === 'active' || t.status === 'upcoming').length;
  const pendingVerifications = metrics?.pendingVerifications || verifications.length;

  return (
    <div className="p-6 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="event"
          label="Active Events"
          value={activeEvents.toString()}
          change={activeEvents > 0 ? `${activeEvents} scheduled` : undefined}
          changeType="positive"
        />
        <StatCard
          icon="groups"
          label="Total Registrations"
          value={totalRegistrations.toString()}
          change={totalRegistrations > 0 ? 'All events' : undefined}
          changeType="positive"
        />
        <StatCard
          icon="payments"
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          change={totalRevenue > 0 ? 'All time' : undefined}
          changeType="positive"
        />
        <StatCard
          icon="verified_user"
          label="Pending Verifications"
          value={pendingVerifications.toString()}
          change={pendingVerifications > 0 ? `${pendingVerifications} pending` : undefined}
          changeType="neutral"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/club/events/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Create Tournament
        </Link>
        <Link
          href="/club/verifications"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1F1F22] text-white font-medium rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">verified_user</span>
          View Verification Queue
          {pendingVerifications > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-primary text-black rounded">
              {pendingVerifications}
            </span>
          )}
        </Link>
        <Link
          href="/club/athletes"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1F1F22] text-white font-medium rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">groups</span>
          Manage Athletes
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tournament Overview */}
        <div className="lg:col-span-2 bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h2 className="text-white font-bold">Tournament Overview</h2>
            <Link
              href="/club/events"
              className="text-primary text-sm font-medium hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {tournaments.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">event</span>
                <p className="text-slate-500">No tournaments yet</p>
                <Link
                  href="/club/events/new"
                  className="mt-3 inline-block text-primary text-sm font-medium hover:underline"
                >
                  Create your first tournament
                </Link>
              </div>
            ) : (
              tournaments.slice(0, 5).map((tournament) => (
                <div key={tournament.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-semibold">{tournament.name}</h3>
                      <p className="text-gray-500 text-sm">{tournament.date}</p>
                    </div>
                    <TournamentStatusBadge status={tournament.status} />
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-gray-500 text-lg">groups</span>
                      <span className="text-gray-400">
                        {tournament.registrations}/{tournament.capacity} registered
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-gray-500 text-lg">payments</span>
                      <span className="text-gray-400">${tournament.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  {/* Registration progress bar */}
                  <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(tournament.registrations / tournament.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Verification Queue */}
          <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h2 className="text-white font-bold">Verification Queue</h2>
              {pendingVerifications > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-primary text-black rounded">
                  {pendingVerifications} pending
                </span>
              )}
            </div>
            <div className="divide-y divide-white/5">
              {verifications.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <span className="material-symbols-outlined text-slate-600 text-3xl mb-2">verified_user</span>
                  <p className="text-slate-500 text-sm">No pending verifications</p>
                </div>
              ) : (
                verifications.slice(0, 5).map((item) => (
                  <div key={item.id} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium">{item.athleteName}</span>
                      <VerificationTypeBadge type={item.type} />
                    </div>
                    <span className="text-gray-500 text-xs">{item.submittedAt}</span>
                  </div>
                ))
              )}
            </div>
            {verifications.length > 0 && (
              <div className="px-5 py-3 border-t border-white/5">
                <Link
                  href="/club/verifications"
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Review all verifications
                </Link>
              </div>
            )}
          </div>

          {/* Recent Payments */}
          <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h2 className="text-white font-bold">Recent Payments</h2>
              <Link
                href="/club/payments"
                className="text-primary text-sm font-medium hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {payments.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <span className="material-symbols-outlined text-slate-600 text-3xl mb-2">payments</span>
                  <p className="text-slate-500 text-sm">No recent payments</p>
                </div>
              ) : (
                payments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-sm font-medium truncate max-w-[180px]">
                        {payment.description}
                      </span>
                      <PaymentStatusBadge status={payment.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">{payment.date}</span>
                      <span className="text-white text-sm font-semibold">
                        ${payment.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
