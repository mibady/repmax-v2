'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar, Topbar, type UserRole } from '@/components/layout';
import { useUser } from '@/lib/hooks';
import { createClient } from '@repmax/shared/supabase';
import { Loader2 } from 'lucide-react';

function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  const titleMap: Record<string, string> = {
    athlete: 'Overview',
    pipeline: 'Pipeline Dashboard',
    prospects: 'Athletes',
    campaigns: 'Campaigns',
    messages: 'Messages',
    analytics: 'Analytics',
    settings: 'Settings',
    notifications: 'Notification Settings',
    edit: 'Edit Profile Card',
    film: 'Film Room',
    documents: 'Documents',
    map: 'Zone Intel',
    offers: 'Offers',
    compare: 'Compare Athletes',
    communications: 'Communications',
    territory: 'Territory',
    visits: 'Campus Visits',
    reports: 'Reports',
    admin: 'Platform Analytics',
    users: 'User Management',
    moderation: 'Content Moderation',
    flags: 'Feature Flags',
    roster: 'Roster',
    tasks: 'Team Tasks',
    profile: 'Profile',
    schools: 'Schools',
    calendar: 'Calendar',
    activity: 'Activity',
    resources: 'Resources',
    events: 'Events',
    verifications: 'Verifications',
    athletes: 'Athletes',
    payments: 'Payments',
    recruiting: 'Recruiting',
    schedule: 'Schedule',
    scouts: 'Scouts',
    help: 'Help Center',
    new: 'Create New',
    school: 'School Dashboard',
    members: 'Members',
    billing: 'Billing',
    dashr: 'Dashr Events',
  };

  return titleMap[lastSegment] || 'Dashboard';
}

function getRoleFromPathname(pathname: string): UserRole {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/recruiter')) return 'recruiter';
  if (pathname.startsWith('/coach')) return 'coach';
  if (pathname.startsWith('/parent')) return 'parent';
  if (pathname.startsWith('/club')) return 'club';
  if (pathname.startsWith('/school')) return 'school';
  return 'athlete';
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !user.profile) {
    return null;
  }

  const role = (user.profile.role as UserRole) || getRoleFromPathname(pathname);
  const pageTitle = getPageTitle(pathname);

  // Construct user data for sidebar/topbar
  const sidebarUser = {
    name: user.profile.full_name || user.email || 'User',
    avatarUrl: user.profile.avatar_url || undefined,
    classYear: undefined, // Would come from athlete data
    title: role === 'recruiter' ? 'Recruiter' : undefined,
  };

  const topbarUser = {
    name: user.profile.full_name || user.email || 'User',
    avatarUrl: user.profile.avatar_url || undefined,
    zone: undefined, // Would come from athlete data
    title: role === 'recruiter' ? 'Recruiter' : undefined,
  };

  // Determine available roles for role switcher
  const availableRoles: UserRole[] = ['athlete'];
  if (user.profile.role === 'recruiter' || user.profile.role === 'coach') {
    availableRoles.push('recruiter');
  }
  if (user.profile.role === 'admin') {
    availableRoles.push('admin');
  }

  return (
    <div className="flex h-screen w-full bg-[#050505] text-slate-200 font-sans overflow-hidden selection:bg-primary/30 selection:text-primary">
      <Sidebar role={role} user={sidebarUser} onSignOut={handleSignOut} />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background-dark relative min-w-0">
        <Topbar
          role={role}
          user={topbarUser}
          title={pageTitle}
          availableRoles={availableRoles}
          userId={user.id}
        />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
}
