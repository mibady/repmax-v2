'use client';

import Link from 'next/link';
import { useSchoolDashboard } from '@/lib/hooks';

function StatCard({ icon, label, value }: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#141414] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
        </div>
        <span className="text-gray-400 text-sm font-medium">{label}</span>
      </div>
      <span className="text-white text-2xl font-bold">{value}</span>
    </div>
  );
}

export default function SchoolDashboardPage() {
  const { school, members, credits, isLoading, error } = useSchoolDashboard();

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

  if (!school) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-[#141414] border border-white/5 rounded-xl p-8 max-w-md text-center">
          <span className="material-symbols-outlined text-primary text-5xl mb-4">school</span>
          <h3 className="text-white text-xl font-bold mb-2">No School Found</h3>
          <p className="text-slate-400 text-sm mb-6">
            You are not currently a member of any school. Create one to get started.
          </p>
          <Link
            href="/school/settings"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Create School
          </Link>
        </div>
      </div>
    );
  }

  const totalCredits = credits.reduce((sum, c) => sum + c.balance, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{school.name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {school.division && <span className="mr-2">{school.division}</span>}
            {school.conference && <span className="mr-2">{school.conference}</span>}
            {school.city && school.state && <span>{school.city}, {school.state}</span>}
          </p>
        </div>
        <Link
          href="/school/settings"
          className="flex items-center gap-2 px-4 py-2 bg-[#1F1F22] text-white font-medium rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">settings</span>
          Settings
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon="group"
          label="Total Members"
          value={members.length.toString()}
        />
        <StatCard
          icon="event"
          label="Active Events"
          value="0"
        />
        <StatCard
          icon="toll"
          label="Credits Remaining"
          value={totalCredits.toString()}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/school/events"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">search</span>
          Browse Tournaments
        </Link>
        <Link
          href="/school/members"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1F1F22] text-white font-medium rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">person_add</span>
          Invite Members
        </Link>
        <Link
          href="/school/dashr"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1F1F22] text-white font-medium rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">speed</span>
          Browse Dashr Events
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tournaments */}
        <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h2 className="text-white font-bold">Tournament Registrations</h2>
            <Link
              href="/school/events/my"
              className="text-primary text-sm font-medium hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-slate-600 text-4xl mb-2">event_available</span>
            <p className="text-slate-500 text-sm">No active tournament registrations.</p>
            <Link href="/school/events" className="text-primary text-xs font-bold mt-2 inline-block hover:underline">Find a Tournament</Link>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h2 className="text-white font-bold">Team Members</h2>
            <Link
              href="/school/members"
              className="text-primary text-sm font-medium hover:underline"
            >
              Manage
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {members.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <span className="material-symbols-outlined text-slate-600 text-3xl mb-2">group</span>
                <p className="text-slate-500 text-sm">No members yet</p>
              </div>
            ) : (
              members.slice(0, 5).map((member) => (
                <div key={member.id} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{member.full_name || 'Unknown'}</p>
                      <p className="text-gray-500 text-xs">{member.email || ''}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      member.role === 'admin' ? 'bg-primary/10 text-primary' :
                      member.role === 'coach' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Credits */}
        <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h2 className="text-white font-bold">Credits</h2>
            <Link
              href="/school/billing"
              className="text-primary text-sm font-medium hover:underline"
            >
              View Billing
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {credits.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <span className="material-symbols-outlined text-slate-600 text-3xl mb-2">toll</span>
                <p className="text-slate-500 text-sm">No credits allocated</p>
              </div>
            ) : (
              credits.map((credit) => (
                <div key={credit.id} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium capitalize">{credit.credit_type.replace(/_/g, ' ')}</span>
                    <span className="text-primary font-bold text-lg">{credit.balance}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
