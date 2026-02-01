import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  roles: ('athlete' | 'coach' | 'recruiter' | 'admin')[];
  joinedDate: string;
  lastActive: string;
  isOnlineNow: boolean;
  status: 'active' | 'suspended' | 'pending';
  imageUrl: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'David Chen',
    email: 'david.chen@example.com',
    roles: ['athlete', 'coach'],
    joinedDate: 'Oct 12, 2023',
    lastActive: '2 mins ago',
    isOnlineNow: true,
    status: 'active',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGMRJma_KfsjLnHx-tnlCcWb5OHBvJfDTGs6sy50bgkUvKIgbANip44czgFGmsBAWVDVi0ITHkkt6TvU7LEE8LkGxNy6yFLScfWxB8hUqU-nURuwC9PP0VbT5AYgv75RSAPp-9in58WY_VkBdRN0KHYgKCa20ZO8mkmIN-RAnJn5rL-wi_XKiPTrpz3LFYrOed-aN9KaXAcKwGX0gzn8ZLPAQ8Nzdd7YR4nHmAttfoMGjJ-OryW4Npgr_AKdKu9znL0OYiovIbyR0',
  },
  {
    id: '2',
    name: 'Sarah Jenkins',
    email: 's.jenkins@domain.org',
    roles: ['athlete'],
    joinedDate: 'Jan 05, 2024',
    lastActive: '4h ago',
    isOnlineNow: false,
    status: 'active',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrQtlltEaoenGpZD4y4aFojumaiXo7pTa10WbQpSfJKh-A6GBBhwAITpcztkJpUkjsXn-XwWrfqlLqPyJtJe6ReAnRnEHnyd7Y71zUev9l38qaEhH_8EK6LHkVEwYQbpmM9Fg8jwFI-ggn105dI2go_gkxmfEOIMd94EqyXbYuDjf-KC5SrqrSwxegXgWaGNhoWRmt6DJkSCxG41KRLlk7fGDZR5kjIbfjAi2A9mp3FKKR7wi89WE5Pgx6EanhEUSuIE1gyRvL2iA',
  },
  {
    id: '3',
    name: 'Mark Thompson',
    email: 'm.tom@legacy.com',
    roles: ['coach'],
    joinedDate: 'Nov 22, 2022',
    lastActive: '12 days ago',
    isOnlineNow: false,
    status: 'suspended',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZdVrgQGuypalW6tgj4jjTADCUxJ3NLhKa7UXPNLncl6nZg3kpFFbTbeVkgCbX_39ZqV8-8IKx28fOEU8LLstx78nUrFvmW51CRdH80_oFJFARAKr3Wx-KkfRO945GFLTSXcwpQrSoYpyN3MmG5AxQQLoicjqNVmjOTustCBsx-5XSycSj88SAuiuq_O-TBONChY0m3CGeTlcV5fUUlCkFjeD07TmCM0z3_DYGhOJk2bU3xaX1zlRWEBF_bPNJDLGhkO-rIwa3vvU',
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'jw@cloudcorp.io',
    roles: ['athlete'],
    joinedDate: 'Feb 14, 2024',
    lastActive: 'Active now',
    isOnlineNow: true,
    status: 'active',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlaJwqH_QCiLbIdEN77tWe6xtux5Yi0d2QU1cft4btEj7mRFuZ9h5yeMUSsimMN8XDN1F9gutxc3eQ_kEB8nEySS6C8bNSsxZ9ioo3CUm17NNDSyyUGYHjZxwc8CYvxcJWgqUJpu1tfV5DEbwvQQy_JjEq9umni0Yeb-NYl7AsFLPYFiFFvuVDBAPf_NxZbDkoVo0G25wMKj_xOkTyvmlQALfOscr2ExyCZSLgLO8zbotUPtJ65TQ-xP9hAUW9_DuU6DtT57BM8AM',
  },
  {
    id: '5',
    name: 'Lisa Wong',
    email: 'lisa.w@creative.net',
    roles: ['coach'],
    joinedDate: 'Mar 01, 2024',
    lastActive: '1h ago',
    isOnlineNow: false,
    status: 'active',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvlEPNZu_YKq02obDc5k0sJi75mtxnMOPRkV8VVF0pTS87mCYIiUD1RuYnO_RtRpV4s_mUT5qiDyZKEkY5tS7Zhb4qOptKBZ8j5Cm6PsCKTtQbgqPbChWCeKvQILR7dkjYC-3G9NMHwcf3ryrwfLJZN0VCCFLRrFNb8X5c8QxrViEybO-61pKwQA8-iEp2jTxOg4vh7vSTHX9N8C3qe4v_AgYVNmfP5-EDwFVRCSqu51pPNZyyQeSJ0YJKcjEVrYGFhEMEb3O1F74',
  },
];

function getRoleStyles(role: string) {
  switch (role) {
    case 'athlete':
      return 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/30';
    case 'coach':
      return 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/30';
    case 'recruiter':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'admin':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'suspended':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
}

export default function UserManagementPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* SideNavBar */}
      <aside className="w-64 border-r border-zinc-800 bg-[#050505] h-screen flex flex-col justify-between p-4 sticky top-0">
        <div className="flex flex-col gap-8">
          <div className="flex gap-3 items-center px-2">
            <div className="bg-[#d26060] size-10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white">shield_person</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-base font-bold leading-none">RepMax Admin</h1>
              <p className="text-zinc-500 text-xs font-medium mt-1">Management Suite</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#d26060]/10 text-[#d26060] border border-[#d26060]/20">
              <span className="material-symbols-outlined text-[20px]">group</span>
              <p className="text-sm font-semibold">Users</p>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">article</span>
              <p className="text-sm font-medium">Content</p>
            </Link>
            <Link href="/admin/analytics" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">analytics</span>
              <p className="text-sm font-medium">Analytics</p>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">flag</span>
              <p className="text-sm font-medium">Feature Flags</p>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer mt-4 border-t border-zinc-800 pt-6">
              <span className="material-symbols-outlined text-[20px]">settings</span>
              <p className="text-sm font-medium">Settings</p>
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-8 rounded-full bg-zinc-700"></div>
              <div className="flex flex-col">
                <p className="text-xs font-bold text-white">Alex Rivera</p>
                <p className="text-[10px] text-zinc-500">Super Admin</p>
              </div>
            </div>
            <button className="w-full bg-[#d26060] hover:bg-[#d26060]/90 text-white text-xs font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">add</span>
              Add User
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050505] overflow-y-auto">
        {/* Header */}
        <div className="p-8 pb-4">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-white text-4xl font-black tracking-tight">User Management</h2>
              <p className="text-zinc-500 text-base">Control platform access, roles, and administrative overrides.</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-[#121212] border border-zinc-800">
              <div className="flex justify-between items-start">
                <p className="text-zinc-400 text-sm font-medium">Total Users</p>
                <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">+12.5%</span>
              </div>
              <p className="text-white tracking-tight text-3xl font-bold">12,842</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-[#121212] border border-zinc-800">
              <div className="flex justify-between items-start">
                <p className="text-zinc-400 text-sm font-medium">Active Today</p>
                <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">+5.2%</span>
              </div>
              <p className="text-white tracking-tight text-3xl font-bold">1,402</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-[#121212] border border-zinc-800">
              <div className="flex justify-between items-start">
                <p className="text-zinc-400 text-sm font-medium">New Signups (24h)</p>
                <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">+8.1%</span>
              </div>
              <p className="text-white tracking-tight text-3xl font-bold">48</p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative h-12 w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email, or user ID..."
                  className="w-full h-full rounded-lg bg-[#121212] border-zinc-800 border focus:border-[#d26060] focus:ring-1 focus:ring-[#d26060] text-white pl-12 pr-4 text-sm transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#121212] border border-zinc-800 px-4 text-white text-sm font-medium hover:border-zinc-700">
                <span>Role: All</span>
                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
              </button>
              <button className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#121212] border border-zinc-800 px-4 text-white text-sm font-medium hover:border-zinc-700">
                <span>Status: Active</span>
                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
              </button>
              <button className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#d26060]/10 border border-[#d26060]/30 px-4 text-[#d26060] text-sm font-bold">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                <span>Advanced Filters</span>
              </button>
            </div>
          </div>

          {/* High Density Table Area */}
          <div className="bg-[#121212] rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Name & Identity</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Role(s)</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Joined Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {mockUsers.map((user) => (
                  <tr key={user.id} className={`hover:bg-white/5 transition-colors group ${user.status === 'suspended' ? 'bg-[#d26060]/5' : ''}`}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-9 rounded-full bg-cover bg-center border-2 border-zinc-800 ${user.status === 'suspended' ? 'grayscale' : ''}`}
                          style={{ backgroundImage: `url('${user.imageUrl}')` }}
                        ></div>
                        <div className="flex flex-col">
                          <p className="text-sm font-bold text-white">{user.name}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        {user.roles.map((role) => (
                          <span key={role} className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getRoleStyles(role)}`}>
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-xs text-zinc-300">{user.joinedDate}</p>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`size-2 rounded-full ${user.isOnlineNow ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
                        <p className={`text-xs ${user.isOnlineNow ? 'text-zinc-300' : 'text-zinc-500'}`}>{user.lastActive}</p>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusStyles(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-zinc-800 bg-zinc-900/30">
              <p className="text-xs text-zinc-500">Showing <span className="text-white font-bold">1-10</span> of <span className="text-white font-bold">12,842</span> users</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-400 text-xs font-bold hover:text-white transition-colors">Previous</button>
                <button className="px-3 py-1.5 rounded bg-zinc-800 text-white text-xs font-bold border border-zinc-700">1</button>
                <button className="px-3 py-1.5 rounded hover:bg-zinc-800 text-zinc-400 text-xs font-bold hover:text-white transition-colors">2</button>
                <button className="px-3 py-1.5 rounded hover:bg-zinc-800 text-zinc-400 text-xs font-bold hover:text-white transition-colors">3</button>
                <button className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-400 text-xs font-bold hover:text-white transition-colors">Next</button>
              </div>
            </div>
          </div>

          {/* Footer Meta Info */}
          <div className="mt-8 pt-8 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-600 font-medium">
            <p>© 2024 RepMax Performance Systems - Internal Admin Console</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#d26060]">System Status: Optimal</a>
              <a href="#" className="hover:text-[#d26060]">API Documentation</a>
              <a href="#" className="hover:text-[#d26060]">Audit Logs</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
