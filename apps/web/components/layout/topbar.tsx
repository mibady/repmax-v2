'use client';

// Z-index fix: topbar should be above all content
import Link from 'next/link';
import { useState } from 'react';

export type UserRole = 'athlete' | 'parent' | 'coach' | 'recruiter' | 'club' | 'admin';

interface TopbarUser {
  name: string;
  avatarUrl?: string;
  zone?: string;
  title?: string;
}

interface TopbarProps {
  role: UserRole;
  user: TopbarUser;
  title?: string;
  unreadNotifications?: number;
  availableRoles?: UserRole[];
  onRoleSwitch?: (role: UserRole) => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  athlete: 'Athlete',
  parent: 'Parent',
  coach: 'Coach',
  recruiter: 'Recruiter',
  club: 'Club',
  admin: 'Admin',
};

const ROLE_DASHBOARD_PATHS: Record<UserRole, string> = {
  athlete: '/athlete',
  parent: '/parent',
  coach: '/coach',
  recruiter: '/recruiter/pipeline',
  club: '/club',
  admin: '/admin',
};

function RoleSwitcher({
  currentRole,
  availableRoles,
  onRoleSwitch,
}: {
  currentRole: UserRole;
  availableRoles: UserRole[];
  onRoleSwitch?: (role: UserRole) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (availableRoles.length <= 1) {
    return (
      <div className="flex items-center gap-1.5 pl-3 pr-3 py-1.5 rounded-full bg-primary text-black text-sm font-bold">
        <span>{ROLE_LABELS[currentRole]}</span>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-primary hover:bg-primary/90 transition-colors text-black text-sm font-bold shadow-lg shadow-primary/10"
      >
        <span>{ROLE_LABELS[currentRole]}</span>
        <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-3 w-64 p-2 bg-surface-dark border border-[rgba(255,255,255,0.08)] rounded-[12px] shadow-2xl z-50">
            {availableRoles.map((role) => {
              const isActive = role === currentRole;
              return (
                <Link
                  key={role}
                  href={ROLE_DASHBOARD_PATHS[role]}
                  onClick={() => {
                    setIsOpen(false);
                    onRoleSwitch?.(role);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/10 border border-primary/20'
                      : 'text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`text-sm font-medium ${isActive ? 'font-bold text-primary' : ''}`}>
                    {ROLE_LABELS[role]} Dashboard
                  </span>
                  {isActive && (
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                  )}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function AthleteTopbar({ user, title, unreadNotifications, availableRoles, onRoleSwitch }: Omit<TopbarProps, 'role'>) {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-[#333] bg-background-dark/95 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <RoleSwitcher
          currentRole="athlete"
          availableRoles={availableRoles || ['athlete']}
          onRoleSwitch={onRoleSwitch}
        />
        <div className="h-6 w-[1px] bg-[#333]" />
        <h2 className="text-xl font-bold text-white">{title || 'Overview'}</h2>
      </div>
      <div className="flex items-center gap-4">
        {user.zone && (
          <div className="hidden md:flex items-center px-3 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20">
            <span className="material-symbols-outlined text-accent-purple text-[18px] mr-2">location_on</span>
            <span className="text-xs font-bold text-accent-purple uppercase tracking-wider">{user.zone} Zone</span>
          </div>
        )}
        <div className="h-8 w-[1px] bg-[#333] mx-2" />
        <button className="relative p-2 text-text-muted hover:text-white transition-colors rounded-lg hover:bg-white/5">
          <span className="material-symbols-outlined">notifications</span>
          {unreadNotifications !== undefined && unreadNotifications > 0 && (
            <span className="absolute top-2 right-2 size-2 bg-primary rounded-full ring-2 ring-background-dark" />
          )}
        </button>
      </div>
    </header>
  );
}

function RecruiterTopbar({ title, unreadNotifications }: Omit<TopbarProps, 'role' | 'user'>) {
  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0a]/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-white text-xl font-bold tracking-tight">{title || 'Dashboard'}</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-gray-500 text-[20px]">search</span>
          </div>
          <input
            type="text"
            className="block w-64 pl-10 pr-3 py-2 border border-white/5 rounded-lg leading-5 bg-[#141414] text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-[#1c1c1c] focus:ring-1 focus:ring-primary/50 focus:border-primary/50 sm:text-sm transition-colors"
            placeholder="Search athletes, schools..."
          />
        </div>
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          {unreadNotifications !== undefined && unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-[#0a0a0a]" />
          )}
        </button>
      </div>
    </header>
  );
}

function ParentTopbar({ user, title, unreadNotifications }: Omit<TopbarProps, 'role'>) {
  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-white">{title || "Marcus's Recruiting Journey"}</h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
          <span className="material-symbols-outlined">notifications</span>
          {unreadNotifications !== undefined && unreadNotifications > 0 && (
            <span className="absolute top-2 right-2 size-2 bg-primary rounded-full ring-2 ring-[#050505]" />
          )}
        </button>
        <div className="h-8 w-[1px] bg-white/10 mx-2" />
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <div
              className="size-9 rounded-full bg-center bg-no-repeat bg-cover border-2 border-primary/30"
              style={{ backgroundImage: `url('${user.avatarUrl}')` }}
            />
          ) : (
            <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center text-white font-bold">
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function CoachTopbar({ title, unreadNotifications }: Omit<TopbarProps, 'role' | 'user'>) {
  return (
    <header className="h-16 flex items-center justify-between border-b border-white/10 px-8 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-3 text-primary">
          <div className="size-6">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fillRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-black italic tracking-tighter">REPMAX</h2>
        </div>
        <div className="relative w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-[20px]">search</span>
          <input
            className="w-full bg-[#1F1F22] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all text-white placeholder:text-white/30"
            placeholder="Search athletes, coaches, or scouts..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <h2 className="text-white text-lg font-semibold">{title || 'Team Dashboard'}</h2>
        <button className="relative p-2 text-white/60 hover:text-white transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          {unreadNotifications !== undefined && unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 bg-primary rounded-full border-2 border-[#050505]" />
          )}
        </button>
      </div>
    </header>
  );
}

function ClubTopbar({ user, title, unreadNotifications }: Omit<TopbarProps, 'role'>) {
  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0a]/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-white text-xl font-bold tracking-tight">{title || 'Club Dashboard'}</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-gray-500 text-[20px]">search</span>
          </div>
          <input
            type="text"
            className="block w-64 pl-10 pr-3 py-2 border border-white/5 rounded-lg leading-5 bg-[#141414] text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-[#1c1c1c] focus:ring-1 focus:ring-primary/50 focus:border-primary/50 sm:text-sm transition-colors"
            placeholder="Search events, athletes..."
          />
        </div>
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          {unreadNotifications !== undefined && unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 bg-primary rounded-full border-2 border-[#0a0a0a]" />
          )}
        </button>
        <div className="h-8 w-[1px] bg-white/10" />
        <div className="flex items-center gap-3">
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
          </div>
        </div>
      </div>
    </header>
  );
}

function AdminTopbar({ title, unreadNotifications }: Omit<TopbarProps, 'role' | 'user'>) {
  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0a0a]/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-white text-xl font-bold tracking-tight">{title || 'Admin Dashboard'}</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-gray-500 text-[20px]">search</span>
          </div>
          <input
            type="text"
            className="block w-64 pl-10 pr-3 py-2 border border-white/5 rounded-lg leading-5 bg-[#141414] text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-[#1c1c1c] focus:ring-1 focus:ring-primary/50 focus:border-primary/50 sm:text-sm transition-colors"
            placeholder="Search users, flags..."
          />
        </div>
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          {unreadNotifications !== undefined && unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-[#0a0a0a]" />
          )}
        </button>
      </div>
    </header>
  );
}

export function Topbar({ role, user, title, unreadNotifications, availableRoles, onRoleSwitch }: TopbarProps) {
  switch (role) {
    case 'athlete':
      return (
        <AthleteTopbar
          user={user}
          title={title}
          unreadNotifications={unreadNotifications}
          availableRoles={availableRoles}
          onRoleSwitch={onRoleSwitch}
        />
      );
    case 'parent':
      return (
        <ParentTopbar
          user={user}
          title={title}
          unreadNotifications={unreadNotifications}
        />
      );
    case 'coach':
      return (
        <CoachTopbar
          title={title}
          unreadNotifications={unreadNotifications}
        />
      );
    case 'recruiter':
      return (
        <RecruiterTopbar
          title={title}
          unreadNotifications={unreadNotifications}
        />
      );
    case 'club':
      return (
        <ClubTopbar
          user={user}
          title={title}
          unreadNotifications={unreadNotifications}
        />
      );
    case 'admin':
      return (
        <AdminTopbar
          title={title}
          unreadNotifications={unreadNotifications}
        />
      );
    default:
      return (
        <AthleteTopbar
          user={user}
          title={title}
          unreadNotifications={unreadNotifications}
          availableRoles={availableRoles}
          onRoleSwitch={onRoleSwitch}
        />
      );
  }
}
