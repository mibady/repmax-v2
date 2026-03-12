export type UserRole = 'athlete' | 'parent' | 'coach' | 'recruiter' | 'club' | 'admin';

export const ROLE_LABELS: Record<UserRole, { full: string; short: string; icon: string }> = {
  athlete:   { full: 'Student Athlete',    short: 'Athlete',    icon: 'sports_football' },
  parent:    { full: 'Parent / Guardian',  short: 'Parent',     icon: 'family_restroom' },
  coach:     { full: 'Head Coach',         short: 'Coach',      icon: 'sports' },
  recruiter: { full: 'College Recruiter',  short: 'Recruiter',  icon: 'person_search' },
  club:      { full: 'Club Organizer',     short: 'Club',       icon: 'groups' },
  admin:     { full: 'Administrator',      short: 'Admin',      icon: 'admin_panel_settings' },
};
