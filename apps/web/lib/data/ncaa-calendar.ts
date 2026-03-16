// NCAA D1 Football Recruiting Calendar Periods 2025-2026
// Source: 2025-26 NCAA Recruiting Calendar — Division I Football
// Official documents: FBS (Bowl Subdivision) and FCS (Championship Subdivision)
// Period: Aug. 1, 2025 – July 31, 2026

export type RecruitingPeriod = {
  start: string; // YYYY-MM-DD
  end: string;
  type: 'contact' | 'evaluation' | 'quiet' | 'dead';
  label: string;
  notes?: string;
  division: 'FBS' | 'FCS' | 'both';
};

// ─── FBS (Bowl Subdivision) ────────────────────────────────────
export const FBS_PERIODS: RecruitingPeriod[] = [
  { start: '2025-08-01', end: '2025-08-31', type: 'dead', label: 'Dead Period', notes: 'Except 48 hours before/after home contests in August or Sept 1-2 (quiet period during those windows)', division: 'FBS' },
  { start: '2025-09-01', end: '2025-11-30', type: 'evaluation', label: 'Evaluation Period', notes: '33 evaluation days (42 for U.S. service academies) during the fall evaluation period', division: 'FBS' },
  { start: '2025-12-01', end: '2026-01-04', type: 'dead', label: 'Dead Period', notes: 'Jan. 1-4: Quiet period for two- and four-year college transfer PSAs intending to enroll midyear', division: 'FBS' },
  { start: '2026-01-05', end: '2026-01-10', type: 'contact', label: 'Contact Period', division: 'FBS' },
  { start: '2026-01-11', end: '2026-01-11', type: 'quiet', label: 'Quiet Period', division: 'FBS' },
  { start: '2026-01-12', end: '2026-01-14', type: 'dead', label: 'Dead Period', division: 'FBS' },
  { start: '2026-01-15', end: '2026-01-31', type: 'contact', label: 'Contact Period', division: 'FBS' },
  { start: '2026-02-01', end: '2026-02-01', type: 'quiet', label: 'Quiet Period', division: 'FBS' },
  { start: '2026-02-02', end: '2026-03-01', type: 'dead', label: 'Dead Period', notes: 'National Signing Day window. For National Service Academies, Feb. 6 – March 1 is quiet period', division: 'FBS' },
  { start: '2026-03-02', end: '2026-04-14', type: 'quiet', label: 'Quiet Period', division: 'FBS' },
  { start: '2026-04-15', end: '2026-05-23', type: 'contact', label: 'Contact Period', notes: '140 recruiting-person days (180 for U.S. service academies) during the spring contact period', division: 'FBS' },
  { start: '2026-05-24', end: '2026-05-27', type: 'dead', label: 'Dead Period', division: 'FBS' },
  { start: '2026-05-28', end: '2026-06-21', type: 'quiet', label: 'Quiet Period', division: 'FBS' },
  { start: '2026-06-22', end: '2026-07-31', type: 'dead', label: 'Dead Period', division: 'FBS' },
];

// ─── FCS (Championship Subdivision) ───────────────────────────
export const FCS_PERIODS: RecruitingPeriod[] = [
  { start: '2025-08-01', end: '2025-08-31', type: 'dead', label: 'Dead Period', notes: 'Except 48 hours before/after home contests in August or Sept 1-2 (quiet period during those windows)', division: 'FCS' },
  { start: '2025-09-01', end: '2025-11-30', type: 'evaluation', label: 'Evaluation Period', notes: '33 evaluation days (42 for U.S. service academies) during the fall evaluation period', division: 'FCS' },
  { start: '2025-12-01', end: '2025-12-04', type: 'dead', label: 'Dead Period', division: 'FCS' },
  { start: '2025-12-05', end: '2025-12-18', type: 'contact', label: 'Contact Period', division: 'FCS' },
  { start: '2025-12-19', end: '2025-12-21', type: 'quiet', label: 'Quiet Period', division: 'FCS' },
  { start: '2025-12-22', end: '2026-01-04', type: 'dead', label: 'Dead Period', notes: 'Dec. 31 – Jan. 4: Quiet period for two- and four-year college transfer PSAs intending to enroll midyear', division: 'FCS' },
  { start: '2026-01-05', end: '2026-01-10', type: 'contact', label: 'Contact Period', division: 'FCS' },
  { start: '2026-01-11', end: '2026-01-11', type: 'quiet', label: 'Quiet Period', division: 'FCS' },
  { start: '2026-01-12', end: '2026-01-14', type: 'dead', label: 'Dead Period', division: 'FCS' },
  { start: '2026-01-15', end: '2026-01-31', type: 'contact', label: 'Contact Period', division: 'FCS' },
  { start: '2026-02-01', end: '2026-02-01', type: 'quiet', label: 'Quiet Period', division: 'FCS' },
  { start: '2026-02-02', end: '2026-03-01', type: 'dead', label: 'Dead Period', division: 'FCS' },
  { start: '2026-03-02', end: '2026-04-14', type: 'quiet', label: 'Quiet Period', division: 'FCS' },
  { start: '2026-04-15', end: '2026-05-23', type: 'contact', label: 'Contact Period', notes: '140 recruiting-person days (180 for U.S. service academies) during the spring contact period', division: 'FCS' },
  { start: '2026-05-24', end: '2026-05-27', type: 'dead', label: 'Dead Period', division: 'FCS' },
  { start: '2026-05-28', end: '2026-07-31', type: 'quiet', label: 'Quiet Period', division: 'FCS' },
];

// ─── D2 (Division II) ──────────────────────────────────────────
// NCAA D2 uses similar period structure but with different dates
export const D2_PERIODS: RecruitingPeriod[] = [
  { start: '2025-08-01', end: '2025-08-31', type: 'quiet', label: 'Quiet Period', division: 'both' },
  { start: '2025-09-01', end: '2025-11-30', type: 'evaluation', label: 'Evaluation Period', notes: 'Fall evaluation — coaches may attend games and practices', division: 'both' },
  { start: '2025-12-01', end: '2025-12-14', type: 'contact', label: 'Contact Period', division: 'both' },
  { start: '2025-12-15', end: '2026-01-04', type: 'dead', label: 'Dead Period', notes: 'Holiday dead period', division: 'both' },
  { start: '2026-01-05', end: '2026-01-31', type: 'contact', label: 'Contact Period', division: 'both' },
  { start: '2026-02-01', end: '2026-02-01', type: 'quiet', label: 'Quiet Period', division: 'both' },
  { start: '2026-02-02', end: '2026-02-28', type: 'dead', label: 'Dead Period', notes: 'National Signing Period', division: 'both' },
  { start: '2026-03-01', end: '2026-04-14', type: 'quiet', label: 'Quiet Period', division: 'both' },
  { start: '2026-04-15', end: '2026-05-23', type: 'contact', label: 'Contact Period', notes: 'Spring contact period', division: 'both' },
  { start: '2026-05-24', end: '2026-05-27', type: 'dead', label: 'Dead Period', division: 'both' },
  { start: '2026-05-28', end: '2026-07-31', type: 'quiet', label: 'Quiet Period', division: 'both' },
];

// ─── D3 (Division III) ─────────────────────────────────────────
// NCAA D3 does not offer athletic scholarships — no official recruiting periods
export const D3_PERIODS: RecruitingPeriod[] = [
  { start: '2025-08-01', end: '2025-08-31', type: 'quiet', label: 'Quiet Period', notes: 'D3 has limited recruiting restrictions — no athletic scholarships offered', division: 'both' },
  { start: '2025-09-01', end: '2025-11-30', type: 'contact', label: 'Contact Period', notes: 'Coaches may contact prospects and attend events year-round with fewer restrictions', division: 'both' },
  { start: '2025-12-01', end: '2025-12-14', type: 'contact', label: 'Contact Period', division: 'both' },
  { start: '2025-12-15', end: '2026-01-04', type: 'dead', label: 'Dead Period', notes: 'Holiday dead period', division: 'both' },
  { start: '2026-01-05', end: '2026-04-14', type: 'contact', label: 'Contact Period', notes: 'Open contact — D3 coaches have fewer period restrictions', division: 'both' },
  { start: '2026-04-15', end: '2026-07-31', type: 'contact', label: 'Contact Period', notes: 'Spring/summer open contact', division: 'both' },
];

// ─── NAIA ──────────────────────────────────────────────────────
// NAIA operates under its own rules, not NCAA — fewer restrictions
export const NAIA_PERIODS: RecruitingPeriod[] = [
  { start: '2025-08-01', end: '2026-07-31', type: 'contact', label: 'Open Recruiting', notes: 'NAIA has no mandated dead/quiet periods — coaches may contact prospects year-round. Individual conferences may set additional rules.', division: 'both' },
];

// ─── NJCAA (Junior College) ────────────────────────────────────
// NJCAA has its own recruiting rules separate from NCAA
export const NJCAA_PERIODS: RecruitingPeriod[] = [
  { start: '2025-08-01', end: '2026-07-31', type: 'contact', label: 'Open Recruiting', notes: 'NJCAA does not mandate recruiting periods like NCAA D1. Coaches may contact prospects year-round. Check with specific schools for conference rules.', division: 'both' },
];

// All divisions map
export type DivisionKey = 'FBS' | 'FCS' | 'D2' | 'D3' | 'NAIA' | 'NJCAA';

export const DIVISION_INFO: Record<DivisionKey, { label: string; subtitle: string; periods: RecruitingPeriod[] }> = {
  FBS: { label: 'D1 FBS', subtitle: 'Division I Bowl Subdivision', periods: FBS_PERIODS },
  FCS: { label: 'D1 FCS', subtitle: 'Division I Championship Subdivision', periods: FCS_PERIODS },
  D2: { label: 'Division II', subtitle: 'NCAA Division II Football', periods: D2_PERIODS },
  D3: { label: 'Division III', subtitle: 'NCAA Division III Football', periods: D3_PERIODS },
  NAIA: { label: 'NAIA', subtitle: 'National Association of Intercollegiate Athletics', periods: NAIA_PERIODS },
  NJCAA: { label: 'NJCAA', subtitle: 'National Junior College Athletic Association', periods: NJCAA_PERIODS },
};

export const ALL_DIVISIONS: DivisionKey[] = ['FBS', 'FCS', 'D2', 'D3', 'NAIA', 'NJCAA'];

// Combined for lookup
export const NCAA_RECRUITING_PERIODS: RecruitingPeriod[] = [...FBS_PERIODS, ...FCS_PERIODS];

export type PeriodType = RecruitingPeriod['type'];

export const PERIOD_COLORS: Record<PeriodType, { bg: string; text: string; border: string; dot: string; hex: string }> = {
  contact: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-400', hex: '#4ade80' },
  evaluation: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-400', hex: '#60a5fa' },
  quiet: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-400', hex: '#facc15' },
  dead: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400', hex: '#f87171' },
};

export const PERIOD_DEFINITIONS: Record<PeriodType, { title: string; definition: string; canDo: string[]; cantDo: string[] }> = {
  contact: {
    title: 'Contact Period',
    definition: 'A contact period is that period of time when it is permissible for authorized athletics department staff members to make in-person, off-campus recruiting contacts and evaluations.',
    canDo: [
      'Coaches can visit you at your school or home',
      'Coaches can call, text, and email you',
      'You can take official and unofficial visits',
      'Coaches can attend your games and practices',
      'In-person off-campus contact is permitted',
    ],
    cantDo: [
      'Contact rules and limits still apply per NCAA bylaws',
    ],
  },
  evaluation: {
    title: 'Evaluation Period',
    definition: 'An evaluation period is that period of time when it is permissible for authorized athletics department staff members to be involved in off-campus activities designed to assess the academic qualifications and playing ability of prospective student-athletes.',
    canDo: [
      'Coaches can watch you play or practice',
      'Coaches can assess your academic qualifications',
      'You can take unofficial visits to campus',
      'Phone, text, and email contact is permitted',
    ],
    cantDo: [
      'No in-person off-campus recruiting contacts',
      'Coaches cannot visit your home during this period',
    ],
  },
  quiet: {
    title: 'Quiet Period',
    definition: 'A quiet period is that period of time when it is permissible to make in-person recruiting contacts only on the member institution\'s campus. No in-person, off-campus recruiting contacts or evaluations may be made during the quiet period.',
    canDo: [
      'You can visit campuses (official and unofficial visits)',
      'In-person contact ON campus is allowed',
      'Phone, text, and email contact is permitted',
    ],
    cantDo: [
      'Coaches cannot visit you off-campus',
      'No in-person off-campus recruiting contacts',
      'No off-campus evaluations',
    ],
  },
  dead: {
    title: 'Dead Period',
    definition: 'A dead period is that period of time when it is not permissible to make in-person recruiting contacts or evaluations on or off the member institution\'s campus or to permit official or unofficial visits by prospective student-athletes to the institution\'s campus.',
    canDo: [
      'Phone calls, texts, and emails may still be permitted depending on your class year',
    ],
    cantDo: [
      'No in-person recruiting contacts on or off campus',
      'No official or unofficial campus visits',
      'No evaluations of any kind',
      'Coaches cannot attend your games or practices',
    ],
  },
};

export const PERIOD_LABELS: Record<PeriodType, string> = {
  contact: 'Coaches may contact you in person, make phone calls, and visit your school.',
  evaluation: 'Coaches may watch you play or practice but cannot have in-person contact off-campus.',
  quiet: 'You may visit campuses, but coaches cannot visit you. Phone/text contact is allowed.',
  dead: 'No in-person contact or campus visits allowed.',
};

/**
 * Get all NCAA recruiting periods that overlap with a given date
 */
export function getPeriodsForDate(date: string, division: 'FBS' | 'FCS' = 'FBS'): RecruitingPeriod[] {
  const periods = division === 'FBS' ? FBS_PERIODS : FCS_PERIODS;
  return periods.filter(p => date >= p.start && date <= p.end);
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

/**
 * Format a date range for display
 */
export function formatPeriodRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const sMonth = s.toLocaleString('en-US', { month: 'short' });
  const eMonth = e.toLocaleString('en-US', { month: 'short' });
  const sDay = s.getDate();
  const eDay = e.getDate();
  const sYear = s.getFullYear();
  const eYear = e.getFullYear();

  if (start === end) return `${sMonth}. ${sDay}, ${sYear}`;
  if (sYear === eYear && sMonth === eMonth) return `${sMonth}. ${sDay}-${eDay}, ${sYear}`;
  if (sYear === eYear) return `${sMonth}. ${sDay} – ${eMonth}. ${eDay}, ${sYear}`;
  return `${sMonth}. ${sDay}, ${sYear} – ${eMonth}. ${eDay}, ${eYear}`;
}
