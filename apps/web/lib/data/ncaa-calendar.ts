// NCAA D1 FBS Football Recruiting Calendar Periods 2025-2026
// Source: NCAA Division I FBS/FCS Men's Football Recruiting Calendar
// Period types: contact, evaluation, quiet, dead

export type RecruitingPeriod = {
  start: string; // YYYY-MM-DD
  end: string;
  type: 'contact' | 'evaluation' | 'quiet' | 'dead';
  label: string;
  division: 'FBS' | 'FCS' | 'both';
};

export const NCAA_RECRUITING_PERIODS: RecruitingPeriod[] = [
  // 2025-2026 FBS Calendar
  // Contact Periods
  { start: '2025-11-24', end: '2025-12-14', type: 'contact', label: 'Contact Period', division: 'FBS' },
  { start: '2026-01-12', end: '2026-02-05', type: 'contact', label: 'Contact Period', division: 'FBS' },
  { start: '2026-04-16', end: '2026-05-31', type: 'contact', label: 'Contact Period', division: 'FBS' },

  // Evaluation Periods
  { start: '2025-09-01', end: '2025-11-23', type: 'evaluation', label: 'Evaluation Period', division: 'FBS' },
  { start: '2026-03-01', end: '2026-04-15', type: 'evaluation', label: 'Evaluation Period (Spring)', division: 'FBS' },

  // Quiet Periods
  { start: '2025-06-02', end: '2025-06-22', type: 'quiet', label: 'Quiet Period', division: 'FBS' },
  { start: '2025-07-07', end: '2025-07-31', type: 'quiet', label: 'Quiet Period', division: 'FBS' },
  { start: '2025-08-01', end: '2025-08-31', type: 'quiet', label: 'Quiet Period', division: 'FBS' },
  { start: '2026-02-06', end: '2026-02-28', type: 'quiet', label: 'Quiet Period', division: 'FBS' },

  // Dead Periods
  { start: '2025-06-23', end: '2025-07-06', type: 'dead', label: 'Dead Period', division: 'FBS' },
  { start: '2025-12-15', end: '2026-01-11', type: 'dead', label: 'Dead Period (Holiday)', division: 'FBS' },
  { start: '2026-02-04', end: '2026-02-05', type: 'dead', label: 'National Signing Day', division: 'FBS' },

  // FCS additions (some overlap with FBS)
  { start: '2025-12-01', end: '2025-12-14', type: 'contact', label: 'Contact Period', division: 'FCS' },
  { start: '2026-01-15', end: '2026-02-01', type: 'contact', label: 'Contact Period', division: 'FCS' },
  { start: '2025-09-01', end: '2025-11-30', type: 'evaluation', label: 'Evaluation Period', division: 'FCS' },
];

export type PeriodType = RecruitingPeriod['type'];

export const PERIOD_COLORS: Record<PeriodType, { bg: string; text: string; border: string; dot: string }> = {
  contact: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-400' },
  evaluation: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-400' },
  quiet: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
  dead: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400' },
};

export const PERIOD_LABELS: Record<PeriodType, string> = {
  contact: 'Coaches may contact you in person, make phone calls, and visit your school.',
  evaluation: 'Coaches may watch you play or practice but cannot have in-person contact off-campus.',
  quiet: 'You may visit campuses, but coaches cannot visit you. Phone/text contact is allowed.',
  dead: 'No in-person contact or campus visits allowed. No phone calls from coaches.',
};

/**
 * Get all NCAA recruiting periods that overlap with a given date
 */
export function getPeriodsForDate(date: string, division: 'FBS' | 'FCS' = 'FBS'): RecruitingPeriod[] {
  return NCAA_RECRUITING_PERIODS.filter(p =>
    (p.division === division || p.division === 'both') &&
    date >= p.start && date <= p.end
  );
}

/**
 * Get the background tint class for a calendar day based on NCAA period
 */
export function getPeriodTintForDate(date: string, division: 'FBS' | 'FCS' = 'FBS'): string | null {
  const periods = getPeriodsForDate(date, division);
  if (periods.length === 0) return null;
  // Priority: dead > quiet > evaluation > contact
  const priority: PeriodType[] = ['dead', 'quiet', 'evaluation', 'contact'];
  for (const type of priority) {
    const match = periods.find(p => p.type === type);
    if (match) return PERIOD_COLORS[type].bg;
  }
  return null;
}
