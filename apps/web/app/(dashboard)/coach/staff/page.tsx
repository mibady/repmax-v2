'use client';

import { useState } from 'react';

interface StaffMember {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  zones: string[];
  positions: string[];
  avatarInitials: string;
  yearsOnStaff: number;
  recruitingSchools: string[];
}

const DEMO_STAFF: StaffMember[] = [
  {
    id: '1',
    name: 'Coach James Davis',
    title: 'Head Coach & Offensive Coordinator',
    email: 'jdavis@rphs.edu',
    phone: '(951) 788-7311',
    zones: ['West', 'Southwest'],
    positions: ['QB', 'WR'],
    avatarInitials: 'JD',
    yearsOnStaff: 8,
    recruitingSchools: ['USC', 'UCLA', 'Oregon'],
  },
  {
    id: '2',
    name: 'Marcus Thompson',
    title: 'Defensive Coordinator',
    email: 'mthompson@rphs.edu',
    phone: '(951) 788-7312',
    zones: ['West', 'Southwest'],
    positions: ['DL', 'LB'],
    avatarInitials: 'MT',
    yearsOnStaff: 5,
    recruitingSchools: ['Arizona State', 'Washington'],
  },
  {
    id: '3',
    name: 'David Chen',
    title: 'Offensive Line Coach & Recruiting',
    email: 'dchen@rphs.edu',
    phone: '(951) 788-7313',
    zones: ['West'],
    positions: ['OL', 'TE'],
    avatarInitials: 'DC',
    yearsOnStaff: 3,
    recruitingSchools: ['Stanford', 'Cal Berkeley'],
  },
  {
    id: '4',
    name: 'James Robinson',
    title: 'DB Coach & Special Teams',
    email: 'jrobinson@rphs.edu',
    phone: '(951) 788-7314',
    zones: ['Southwest', 'South'],
    positions: ['DB', 'S'],
    avatarInitials: 'JR',
    yearsOnStaff: 4,
    recruitingSchools: ['Colorado', 'Oregon State'],
  },
  {
    id: '5',
    name: 'Anthony Rivera',
    title: 'Strength & Conditioning',
    email: 'arivera@rphs.edu',
    phone: '(951) 788-7315',
    zones: ['West'],
    positions: ['All'],
    avatarInitials: 'AR',
    yearsOnStaff: 2,
    recruitingSchools: ['Combines/Testing Coordination'],
  },
];

interface StaffNote {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  category: 'General' | 'Urgent' | 'Recruiting' | 'Strategy';
}

const DEMO_NOTES: StaffNote[] = [
  { id: '1', author: 'Coach James Davis', content: 'Spring practice starts March 24 - all coaches must submit position group evaluation forms by March 21', timestamp: '2026-03-16T08:00:00', category: 'Urgent' },
  { id: '2', author: 'Coach James Davis', content: 'USC offered Jaylen Washington - Coach Davis to follow up with OC this week', timestamp: '2026-03-15T14:30:00', category: 'Recruiting' },
  { id: '3', author: 'Marcus Thompson', content: 'Film room schedule updated - Monday/Wednesday after practice, Thursday game prep', timestamp: '2026-03-15T09:00:00', category: 'General' },
  { id: '4', author: 'David Chen', content: 'Implementing new spread RPO package for spring - need OL coach buy-in on blocking schemes', timestamp: '2026-03-14T16:45:00', category: 'Strategy' },
  { id: '5', author: 'James Robinson', content: 'Oregon DC reaching out about Carlos Mendez and Jamal Carter - schedule film review call', timestamp: '2026-03-14T11:15:00', category: 'Recruiting' },
  { id: '6', author: 'Anthony Rivera', content: 'Equipment order submitted for spring practice - delivery expected March 20', timestamp: '2026-03-13T10:00:00', category: 'General' },
];

const NOTE_COLORS: Record<string, string> = {
  General: 'bg-gray-500/15 text-gray-400',
  Urgent: 'bg-red-500/15 text-red-400',
  Recruiting: 'bg-green-500/15 text-green-400',
  Strategy: 'bg-blue-500/15 text-blue-400',
};

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function StaffHubPage() {
  const [staff] = useState<StaffMember[]>(DEMO_STAFF);
  const [notes] = useState<StaffNote[]>(DEMO_NOTES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [addFormName, setAddFormName] = useState('');
  const [addFormTitle, setAddFormTitle] = useState('');
  const [addFormEmail, setAddFormEmail] = useState('');

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">group_work</span>
              Staff Hub
            </h1>
            <p className="text-sm text-white/40 mt-1">{staff.length} coaching staff members</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Staff
          </button>
        </div>

        {/* Staff Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {staff.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
              className={`bg-[#1F1F22] rounded-xl border p-5 text-left transition-all hover:scale-[1.01] ${
                selectedMember?.id === member.id ? 'border-primary/40' : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">{member.avatarInitials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{member.name}</h3>
                  <p className="text-sm text-white/40">{member.title}</p>
                  <p className="text-xs text-white/20 mt-0.5">{member.yearsOnStaff} year{member.yearsOnStaff !== 1 ? 's' : ''} on staff</p>
                </div>
              </div>

              {/* Zone Assignments */}
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5">Recruiting Zones</p>
                <div className="flex flex-wrap gap-1.5">
                  {member.zones.map((zone) => (
                    <span key={zone} className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-medium">
                      {zone}
                    </span>
                  ))}
                </div>
              </div>

              {/* Position Groups */}
              <div className="mt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5">Position Groups</p>
                <div className="flex flex-wrap gap-1.5">
                  {member.positions.map((pos) => (
                    <span key={pos} className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-medium">
                      {pos}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact — shown when selected */}
              {selectedMember?.id === member.id && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <span className="material-symbols-outlined text-[14px]">mail</span>
                    {member.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <span className="material-symbols-outlined text-[14px]">phone</span>
                    {member.phone}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Recruiting Assignments Summary */}
        <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[18px]">map</span>
            Recruiting Assignments
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-white/30 py-2 pr-4">Coach</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-white/30 py-2 pr-4">Title</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-white/30 py-2 pr-4">Schools</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-white/30 py-2 pr-4">Zones</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-white/30 py-2">Positions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((m) => (
                  <tr key={m.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 text-white font-medium">{m.name}</td>
                    <td className="py-3 pr-4 text-white/50">{m.title}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {m.recruitingSchools.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-medium">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {m.zones.map((z) => (
                          <span key={z} className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 text-[10px] font-medium">{z}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {m.positions.map((p) => (
                          <span key={p} className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-medium">{p}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Staff Notes */}
        <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">sticky_note_2</span>
              Staff Notes
            </h2>
          </div>
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="bg-white/[0.03] rounded-xl p-4 hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-white">{note.author}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${NOTE_COLORS[note.category]}`}>
                    {note.category}
                  </span>
                  <span className="text-[10px] text-white/20 ml-auto">{formatTimestamp(note.timestamp)}</span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">{note.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-[#1a1a1a] border border-[#333] rounded-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Add Staff Member</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowAddModal(false);
                  setAddFormName('');
                  setAddFormTitle('');
                  setAddFormEmail('');
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    value={addFormName}
                    onChange={(e) => setAddFormName(e.target.value)}
                    placeholder="e.g. John Smith"
                    className="w-full bg-white/5 border border-[#333] rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">Title / Role *</label>
                  <input
                    type="text"
                    value={addFormTitle}
                    onChange={(e) => setAddFormTitle(e.target.value)}
                    placeholder="e.g. Running Backs Coach"
                    className="w-full bg-white/5 border border-[#333] rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={addFormEmail}
                    onChange={(e) => setAddFormEmail(e.target.value)}
                    placeholder="e.g. jsmith@school.edu"
                    className="w-full bg-white/5 border border-[#333] rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-[#333] text-gray-400 text-sm font-medium hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Add Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
