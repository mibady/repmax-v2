import Link from 'next/link';

interface Conversation {
  id: string;
  name: string;
  role: 'Recruiter' | 'Parent' | 'Athlete';
  school?: string;
  lastMessage: string;
  timestamp: string;
  isUnread: boolean;
  isActive?: boolean;
  isOnline?: boolean;
  imageUrl?: string;
  initials?: string;
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Coach Williams',
    role: 'Recruiter',
    school: 'TCU',
    lastMessage: 'Hey, looking forward to seeing the new stats...',
    timestamp: '10:42 AM',
    isUnread: true,
    isActive: true,
    isOnline: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACynP_K7BPWr6CD-3XFvL0B1-DzyktXiScA7PcmjvUH_pNE7GdNszoTQHEqj9qFVBTXH52neqlx7jPat5xNzrMZNjuOLPLtKt6os3d_a3az74Bpj5zAFyUdMhQjLF_x29vXQ0W06qry8GvWRZVbLwwXzV-dH8j7C_MzLQ4dBjuTTluD7cB9ZJMT_foWIScSpD2AGkrm-ZaimrGtqq-kTnqgQ1Cy3P3s9cKiSZHOMaT5cYBF1sVNNenM-0QEChzppcpc_bIR6LrdA8',
  },
  {
    id: '2',
    name: 'Mrs. Washington',
    role: 'Parent',
    lastMessage: 'Can we reschedule the call regarding James?',
    timestamp: 'Yesterday',
    isUnread: true,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCygCGhEnf7pyF4ggdDAHpPNXsgJvumQrTtxCNcf3vU7kKGyv6n2wF8lmtRm7lDmA4yMzl4IPtvoaX9GZcpTcnQmhjh6spykgMn-L4qMBwRn-ya1mUL37ZCv1X11BHrGL4ByB73u4gPSoCqsJM8mWkbcvxkbpn3waeECLWWyB0xhBHCEa1fYi2s_xyx8bHzeIdDo-C_xB1uN0mtyTQCWM9-_COJ1sS1xOMMfoay0TJWv6-YLSJaGE-MjSMMWpIqfXCC0Ehj12kABB8',
  },
  {
    id: '3',
    name: 'David Miller',
    role: 'Athlete',
    lastMessage: 'Thanks for the update, coach!',
    timestamp: 'Tue',
    isUnread: false,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDu7lKgBp9FkBa3jHDbm5hH-uYpXrH4-vtZ61119_jknL4OF7u0HVrX9pTC0kjXc0VPRGLl6WtmVIUcRuCbivIcXeqiP9oTb303U4vAMPwvDxmZbknsZ-Tyf_SEkgYVjk0KljK9WH-xdY6RvPS50nOIpFjpEbmGBJc4MEjdAmE9xjng3g9kN7cyMaCjAKeyJySGzzqUIBsrmMYBCPHKhVvd30_4JIisOti4zK8Hp5aNzSfCYJFkMJb3Kt1-Fx_J_4j0W6jWa4xsbhY',
  },
  {
    id: '4',
    name: 'Alex Smith',
    role: 'Recruiter',
    school: 'Ohio State',
    lastMessage: 'Let me check with the head coach.',
    timestamp: 'Mon',
    isUnread: false,
    initials: 'AS',
  },
];

function getRoleBadgeStyles(role: string) {
  switch (role) {
    case 'Recruiter':
      return 'bg-blue-900/40 text-blue-400 border-blue-800/50';
    case 'Parent':
      return 'bg-green-900/40 text-green-400 border-green-800/50';
    case 'Athlete':
      return 'bg-purple-900/40 text-purple-400 border-purple-800/50';
    default:
      return 'bg-gray-900/40 text-gray-400 border-gray-800/50';
  }
}

export default function MessagesPage() {
  return (
    <div className="bg-[#050505] text-white font-display h-screen w-full overflow-hidden flex selection:bg-[#D4AF37]/30">
      {/* Pane 1: Global Navigation */}
      <nav className="w-[260px] flex-shrink-0 bg-[#0a0a0a] border-r border-[#27272a] flex flex-col justify-between h-full py-6 px-4">
        <div className="flex flex-col gap-8">
          {/* User Profile / Brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="size-10 rounded-full bg-[#1F1F22] border border-white/10"></div>
            <div className="flex flex-col">
              <h1 className="text-white text-base font-semibold leading-tight">RepMax</h1>
              <p className="text-[#D4AF37] text-xs font-medium uppercase tracking-wide">Coach Admin</p>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col gap-1">
            <Link href="/dashboard/recruiter" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors group">
              <span className="material-symbols-outlined text-2xl group-hover:scale-105 transition-transform">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link href="/messages" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#D4AF37]/20 text-white border-l-2 border-[#D4AF37] transition-colors">
              <span className="material-symbols-outlined text-2xl">chat_bubble</span>
              <span className="text-sm font-medium">Messages</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors group">
              <span className="material-symbols-outlined text-2xl group-hover:scale-105 transition-transform">group</span>
              <span className="text-sm font-medium">Recruiting</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors group">
              <span className="material-symbols-outlined text-2xl group-hover:scale-105 transition-transform">calendar_month</span>
              <span className="text-sm font-medium">Calendar</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors group">
              <span className="material-symbols-outlined text-2xl group-hover:scale-105 transition-transform">settings</span>
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-2">
          <button className="flex items-center gap-3 w-full px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-2xl">logout</span>
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </nav>

      {/* Pane 2: Conversation List */}
      <aside className="w-[360px] flex-shrink-0 bg-[#050505] border-r border-[#27272a] flex flex-col h-full">
        {/* Header */}
        <div className="p-5 pb-2">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-4">Messages</h1>
          {/* Search */}
          <label className="flex items-center gap-2 w-full bg-[#1a1a1a] rounded-lg px-3 h-10 border border-transparent focus-within:border-[#D4AF37]/50 focus-within:ring-1 focus-within:ring-[#D4AF37]/50 transition-all">
            <span className="material-symbols-outlined text-gray-400 text-xl">search</span>
            <input
              type="text"
              placeholder="Search conversations..."
              className="bg-transparent border-none text-sm text-white placeholder-gray-500 w-full focus:ring-0 p-0"
            />
          </label>
        </div>

        {/* Filters */}
        <div className="px-5 py-2 flex gap-2 overflow-x-auto">
          <button className="px-3 py-1.5 rounded-full bg-[#D4AF37] text-black text-xs font-semibold hover:opacity-90 transition-opacity">All</button>
          <button className="px-3 py-1.5 rounded-full bg-[#1a1a1a] text-gray-400 text-xs font-medium hover:bg-white/10 hover:text-white transition-colors border border-[#27272a]">Unread</button>
          <button className="px-3 py-1.5 rounded-full bg-[#1a1a1a] text-gray-400 text-xs font-medium hover:bg-white/10 hover:text-white transition-colors border border-[#27272a]">Archived</button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto mt-2">
          {mockConversations.map((convo) => (
            <div
              key={convo.id}
              className={`relative group cursor-pointer p-4 hover:bg-[#1a1a1a] transition-colors border-b border-[#27272a]/50 ${
                convo.isActive ? 'bg-[#D4AF37]/10 border-l-[3px] border-l-[#D4AF37]' : convo.isUnread ? 'border-l-[3px] border-l-[#D4AF37]' : 'border-l-[3px] border-l-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex gap-3">
                <div className="relative shrink-0">
                  {convo.imageUrl ? (
                    <div
                      className="size-12 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url('${convo.imageUrl}')` }}
                    ></div>
                  ) : (
                    <div className="size-12 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-bold border border-white/10">
                      {convo.initials}
                    </div>
                  )}
                  {convo.isOnline && (
                    <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-[#050505] rounded-full"></div>
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`text-sm truncate pr-2 ${convo.isUnread ? 'text-white font-semibold' : 'text-white font-medium'}`}>{convo.name}</h3>
                    <span className={`text-xs shrink-0 ${convo.isUnread ? 'text-[#D4AF37] font-medium' : 'text-gray-500'}`}>{convo.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${getRoleBadgeStyles(convo.role)}`}>
                      {convo.role}
                    </span>
                    {convo.school && <span className="text-[10px] text-gray-500">{convo.school}</span>}
                  </div>
                  <p className={`text-sm truncate ${convo.isUnread ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>{convo.lastMessage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Pane 3: Main Content (Empty State) */}
      <main className="flex-1 bg-[#050505] flex flex-col items-center justify-center h-full p-8 relative overflow-hidden">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-[#050505] to-[#050505] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          <div className="size-24 rounded-full bg-[#0a0a0a] border border-[#27272a] flex items-center justify-center mb-6 shadow-2xl shadow-black/50">
            <span className="material-symbols-outlined text-[48px] text-gray-600">mail</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No conversation selected</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">Choose a conversation from the list on the left to view messages, share player stats, or schedule calls.</p>
          <button className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#050505] font-bold rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_15px_-3px_rgba(212,175,55,0.3)]">
            <span className="material-symbols-outlined text-xl">add</span>
            New Message
          </button>
        </div>
      </main>
    </div>
  );
}
