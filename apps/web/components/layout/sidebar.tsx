'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type UserRole = 'athlete' | 'parent' | 'coach' | 'recruiter' | 'club' | 'admin';

interface SidebarUser {
  name: string;
  avatarUrl?: string;
  classYear?: number;
  title?: string;
  childName?: string; // For parent role
  teamName?: string;  // For coach role
  clubName?: string;  // For club role
}

interface SidebarProps {
  role: UserRole;
  user: SidebarUser;
  onSignOut?: () => void;
}

interface NavItem {
  icon: string;
  label: string;
  href: string;
  badge?: number | string;
  badgeColor?: string;
}

const athleteNavItems: NavItem[] = [
  { icon: 'dashboard', label: 'Dashboard', href: '/athlete' },
  { icon: 'badge', label: 'My Card', href: '/athlete/card/edit' },
  { icon: 'map', label: 'Zone Intel', href: '/zone/map' },
  { icon: 'trophy', label: 'Offers', href: '/athlete/offers' },
  { icon: 'mail', label: 'Messages', href: '/messages' },
];

const athleteSettingsItems: NavItem[] = [
  { icon: 'person', label: 'Profile', href: '/settings' },
  { icon: 'settings', label: 'Account', href: '/settings/notifications' },
];

const recruiterNavItems: NavItem[] = [
  { icon: 'view_kanban', label: 'Pipeline', href: '/recruiter/pipeline' },
  { icon: 'groups', label: 'Athletes', href: '/recruiter/prospects' },
  { icon: 'campaign', label: 'Campaigns', href: '/recruiter/campaigns' },
  { icon: 'chat_bubble', label: 'Messages', href: '/messages' },
  { icon: 'analytics', label: 'Analytics', href: '/recruiter/analytics' },
];

const recruiterSettingsItems: NavItem[] = [
  { icon: 'settings', label: 'Settings', href: '/settings' },
];

const parentNavItems: NavItem[] = [
  { icon: 'dashboard', label: 'Dashboard', href: '/parent' },
  { icon: 'person', label: "Child's Profile", href: '/parent/profile' },
  { icon: 'chat_bubble', label: 'Messages', href: '/messages' },
  { icon: 'calendar_today', label: 'Calendar', href: '/parent/calendar' },
  { icon: 'school', label: 'Schools', href: '/parent/schools' },
  { icon: 'library_books', label: 'Resources', href: '/parent/resources' },
];

const parentSettingsItems: NavItem[] = [
  { icon: 'settings', label: 'Settings', href: '/settings' },
  { icon: 'help', label: 'Help Center', href: '/help' },
];

const coachNavItems: NavItem[] = [
  { icon: 'dashboard', label: 'Dashboard', href: '/coach' },
  { icon: 'groups', label: 'Roster', href: '/coach/roster' },
  { icon: 'radar', label: 'Recruiting', href: '/coach/recruiting' },
  { icon: 'calendar_today', label: 'Schedule', href: '/coach/schedule' },
  { icon: 'playlist_add_check', label: 'Team Tasks', href: '/coach/tasks' },
];

const coachSettingsItems: NavItem[] = [
  { icon: 'settings', label: 'Settings', href: '/settings' },
];

const clubNavItems: NavItem[] = [
  { icon: 'dashboard', label: 'Dashboard', href: '/club' },
  { icon: 'event', label: 'Events', href: '/club/events' },
  { icon: 'groups', label: 'Athletes', href: '/club/athletes' },
  { icon: 'sports', label: 'Scouts', href: '/club/scouts' },
  { icon: 'analytics', label: 'Analytics', href: '/club/analytics' },
];

const clubSettingsItems: NavItem[] = [
  { icon: 'settings', label: 'Settings', href: '/settings' },
];

const adminNavItems: NavItem[] = [
  { icon: 'dashboard', label: 'Dashboard', href: '/admin' },
  { icon: 'group', label: 'User Management', href: '/admin/users' },
  { icon: 'shield', label: 'Content Moderation', href: '/admin/moderation' },
  { icon: 'toggle_on', label: 'Feature Flags', href: '/admin/flags' },
];

const adminSettingsItems: NavItem[] = [
  { icon: 'settings', label: 'Settings', href: '/settings' },
];

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
        isActive
          ? 'bg-primary text-black'
          : 'text-text-muted hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className={`material-symbols-outlined text-[20px] ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`}>
        {item.icon}
      </span>
      <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
      {item.badge !== undefined && (
        <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${
          item.badgeColor || 'bg-accent-purple/20 text-accent-purple'
        }`}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function AthleteSidebar({ user, onSignOut }: { user: SidebarUser; onSignOut?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface-dark border-r border-[#333] flex flex-col flex-shrink-0 h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#333]">
        <div className="size-8 text-primary mr-3">
          <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4L6 12V24C6 35.05 13.84 45.24 24 48C34.16 45.24 42 35.05 42 24V12L24 4ZM24 42C16.82 39.67 11 32.18 11 24V14.5L24 8.72L37 14.5V24C37 32.18 31.18 39.67 24 42Z" fill="currentColor" />
            <path d="M24 14L18 20L20.12 22.12L22.5 19.75V28H25.5V19.75L27.88 22.12L30 20L24 14Z" fill="white" />
          </svg>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">RepMax</h1>
      </div>

      {/* User Info */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-6">
          {user.avatarUrl ? (
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full size-12 ring-2 ring-primary/20"
              style={{ backgroundImage: `url('${user.avatarUrl}')` }}
            />
          ) : (
            <div className="size-12 rounded-full ring-2 ring-primary/20 bg-surface-dark flex items-center justify-center text-white font-bold">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          )}
          <div className="flex flex-col overflow-hidden">
            <h2 className="text-white text-sm font-semibold truncate">{user.name}</h2>
            {user.classYear && (
              <p className="text-text-muted text-xs font-normal truncate">Class of {user.classYear}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
        {athleteNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href || (item.href !== '/athlete' && pathname.startsWith(item.href))}
          />
        ))}

        {/* Settings Section */}
        <div className="mt-8 mb-2 px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
          Settings
        </div>
        {athleteSettingsItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-[#333]">
        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#333] text-sm text-text-muted hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function RecruiterSidebar({ user, onSignOut }: { user: SidebarUser; onSignOut?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0a0a0a] border-r border-white/5 flex flex-col justify-between p-4 h-full">
      <div className="flex flex-col gap-6">
        {/* Brand */}
        <Link href="/" className="flex gap-3 items-center px-2">
          <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-xl">sports_football</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-lg font-bold leading-none tracking-tight">RepMax</h1>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mt-1">Recruiter CRM</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {recruiterNavItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/recruiter/pipeline' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white/5 text-primary border border-white/5 group'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'group-hover:scale-110 transition-transform' : ''}`}>
                  {item.icon}
                </span>
                <p className="text-sm font-medium">{item.label}</p>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        {recruiterSettingsItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <p className="text-sm font-medium">{item.label}</p>
          </Link>
        ))}

        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-3 mt-2 border-t border-white/5">
          {user.avatarUrl ? (
            <div
              className="size-8 rounded-full bg-center bg-no-repeat bg-cover"
              style={{ backgroundImage: `url('${user.avatarUrl}')` }}
            />
          ) : (
            <div className="flex items-center justify-center size-8 rounded-full bg-primary/20">
              <span className="material-symbols-outlined text-primary text-sm">person</span>
            </div>
          )}
          <div className="flex flex-col">
            <p className="text-white text-sm font-medium">{user.name}</p>
            {user.title && <p className="text-gray-500 text-xs">{user.title}</p>}
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <p className="text-sm font-medium">Sign Out</p>
        </button>
      </div>
    </aside>
  );
}

function ParentSidebar({ user, onSignOut }: { user: SidebarUser; onSignOut?: () => void }) {
  const pathname = usePathname();
  const childName = user.childName || 'Your Athlete';

  return (
    <aside className="w-64 fixed h-full bg-[#050505] border-r border-white/10 flex flex-col z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-black font-bold">bolt</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary uppercase">RepMax</h1>
        </div>
        <div className="flex items-center gap-3 px-3 py-4 mb-8 bg-[#1F1F22] rounded-xl">
          {user.avatarUrl ? (
            <div
              className="size-10 rounded-full bg-cover bg-center border-2 border-primary/30"
              style={{ backgroundImage: `url('${user.avatarUrl}')` }}
            />
          ) : (
            <div className="size-10 rounded-full border-2 border-primary/30 bg-[#1F1F22] flex items-center justify-center text-white font-bold">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          )}
          <div className="flex flex-col">
            <p className="text-sm font-bold text-white">{user.name}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Parent of {childName}</p>
          </div>
        </div>
        <nav className="space-y-1">
          {parentNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard/parent' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#1F1F22] border-l-4 border-primary text-primary'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-6 border-t border-white/5 space-y-1">
        {parentSettingsItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

function CoachSidebar({ user, onSignOut }: { user: SidebarUser; onSignOut?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/10 flex flex-col justify-between p-4 bg-[#050505] h-full">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          {user.avatarUrl ? (
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-primary"
              style={{ backgroundImage: `url('${user.avatarUrl}')` }}
            />
          ) : (
            <div className="size-10 rounded-full border-2 border-primary bg-[#1F1F22] flex items-center justify-center text-white font-bold">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-white text-base font-bold leading-tight">{user.name}</h1>
            <p className="text-primary text-[10px] font-bold uppercase tracking-widest">{user.title || 'Head Coach'}</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {coachNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard/coach' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <p className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</p>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex flex-col gap-2">
        {coachSettingsItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <p className="text-sm font-medium">{item.label}</p>
          </Link>
        ))}
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
          <p className="text-sm font-medium">Sign Out</p>
        </button>
        <button disabled title="Coming soon" className="w-full flex items-center justify-center gap-2 rounded-lg py-3 bg-primary text-black font-bold text-sm tracking-wide mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Add Athlete
        </button>
      </div>
    </aside>
  );
}

function ClubSidebar({ user, onSignOut }: { user: SidebarUser; onSignOut?: () => void }) {
  const pathname = usePathname();
  const clubName = user.clubName || 'My Club';

  return (
    <aside className="w-64 border-r border-white/10 flex flex-col justify-between p-4 bg-[#050505] h-full">
      <div className="flex flex-col gap-6">
        <div className="flex gap-3 items-center px-2">
          <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-xl">groups_3</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-lg font-bold leading-none tracking-tight">RepMax</h1>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mt-1">Club Portal</p>
          </div>
        </div>

        <div className="px-2 py-3 bg-[#1F1F22] rounded-lg">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Organization</p>
          <p className="text-white font-semibold text-sm">{clubName}</p>
        </div>

        <nav className="flex flex-col gap-1">
          {clubNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard/club' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary text-black font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <p className="text-sm font-medium">{item.label}</p>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        {clubSettingsItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <p className="text-sm font-medium">{item.label}</p>
          </Link>
        ))}

        <div className="flex items-center gap-3 px-3 py-3 mt-2 border-t border-white/5">
          {user.avatarUrl ? (
            <div
              className="size-8 rounded-full bg-center bg-no-repeat bg-cover"
              style={{ backgroundImage: `url('${user.avatarUrl}')` }}
            />
          ) : (
            <div className="flex items-center justify-center size-8 rounded-full bg-primary/20">
              <span className="material-symbols-outlined text-primary text-sm">person</span>
            </div>
          )}
          <div className="flex flex-col">
            <p className="text-white text-sm font-medium">{user.name}</p>
            <p className="text-gray-500 text-xs">{user.title || 'Club Director'}</p>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <p className="text-sm font-medium">Sign Out</p>
        </button>
      </div>
    </aside>
  );
}

function AdminSidebar({ user, onSignOut }: { user: SidebarUser; onSignOut?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0a0a0a] border-r border-white/5 flex flex-col justify-between p-4 h-full">
      <div className="flex flex-col gap-6">
        {/* Brand */}
        <Link href="/" className="flex gap-3 items-center px-2">
          <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-xl">admin_panel_settings</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-lg font-bold leading-none tracking-tight">RepMax</h1>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mt-1">Admin Console</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white/5 text-primary border border-white/5 group'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'group-hover:scale-110 transition-transform' : ''}`}>
                  {item.icon}
                </span>
                <p className="text-sm font-medium">{item.label}</p>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        {adminSettingsItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <p className="text-sm font-medium">{item.label}</p>
          </Link>
        ))}

        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-3 mt-2 border-t border-white/5">
          {user.avatarUrl ? (
            <div
              className="size-8 rounded-full bg-center bg-no-repeat bg-cover"
              style={{ backgroundImage: `url('${user.avatarUrl}')` }}
            />
          ) : (
            <div className="flex items-center justify-center size-8 rounded-full bg-primary/20">
              <span className="material-symbols-outlined text-primary text-sm">person</span>
            </div>
          )}
          <div className="flex flex-col">
            <p className="text-white text-sm font-medium">{user.name}</p>
            <p className="text-gray-500 text-xs">Administrator</p>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <p className="text-sm font-medium">Sign Out</p>
        </button>
      </div>
    </aside>
  );
}

export function Sidebar({ role, user, onSignOut }: SidebarProps) {
  switch (role) {
    case 'athlete':
      return <AthleteSidebar user={user} onSignOut={onSignOut} />;
    case 'parent':
      return <ParentSidebar user={user} onSignOut={onSignOut} />;
    case 'coach':
      return <CoachSidebar user={user} onSignOut={onSignOut} />;
    case 'recruiter':
      return <RecruiterSidebar user={user} onSignOut={onSignOut} />;
    case 'club':
      return <ClubSidebar user={user} onSignOut={onSignOut} />;
    case 'admin':
      return <AdminSidebar user={user} onSignOut={onSignOut} />;
    default:
      return <AthleteSidebar user={user} onSignOut={onSignOut} />;
  }
}
