// NCAA Compliance Guide — Static data for parent resources
// Organized by risk level for expandable rule cards

export type RiskLevel = 'high' | 'medium' | 'low';

export interface ComplianceRule {
  id: string;
  icon: string;
  title: string;
  risk: RiskLevel;
  summary: string;
  details: string[];
  highlights?: { label: string; value: string }[];
}

export interface ComplianceSection {
  id: string;
  title: string;
  description: string;
  rules: ComplianceRule[];
}

export const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  medium: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  low: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
};

export const COMPLIANCE_SECTIONS: ComplianceSection[] = [
  {
    id: 'contact-rules',
    title: 'Contact & Communication Rules',
    description: 'What coaches can and cannot do when reaching out to your family.',
    rules: [
      {
        id: 'contact-periods',
        icon: 'calendar_month',
        title: 'Recruiting Contact Periods',
        risk: 'high',
        summary: 'Coaches can only contact prospects during designated NCAA periods. Violations can result in scholarship loss.',
        details: [
          'Contact periods vary by division (D1 FBS, D1 FCS, D2, D3)',
          'Dead periods: No in-person contact or campus visits allowed',
          'Quiet periods: Contact only on campus; no off-campus visits',
          'Evaluation periods: Coaches can watch games but no in-person contact off-campus',
          'Contact periods: Full in-person contact allowed on and off campus',
        ],
        highlights: [
          { label: 'D1 Dead Period', value: 'Dec 1 – Jan 4' },
          { label: 'Spring Contact', value: 'Apr 15 – May 23' },
        ],
      },
      {
        id: 'phone-text',
        icon: 'phone_in_talk',
        title: 'Phone Calls & Text Messages',
        risk: 'medium',
        summary: 'Coaches may call or text recruits starting June 15 after sophomore year (D1). Rules differ by division.',
        details: [
          'D1: Coaches may call/text starting June 15 after sophomore year',
          'D2: Coaches may call/text starting June 15 after sophomore year',
          'D3: No restrictions on when coaches can call or text',
          'Parents/guardians may receive calls at any time',
          'Recruits may call coaches at any time without restriction',
          'There is no limit on the number of calls or texts a coach can send',
        ],
      },
      {
        id: 'social-media',
        icon: 'share',
        title: 'Social Media & DMs',
        risk: 'medium',
        summary: 'Private messages on social media count as recruiting contact. Public posts do not.',
        details: [
          'Direct messages (DMs) on any platform count as recruiting contact',
          'DMs follow the same timing rules as phone calls and texts',
          'Coaches may publicly "like" or comment on posts at any time',
          'Coaches may follow recruits on social media at any time',
          'Group messages from coaches count as individual contact with each recipient',
        ],
      },
      {
        id: 'unofficial-contact',
        icon: 'warning',
        title: 'Impermissible Contact (Boosters)',
        risk: 'high',
        summary: 'Boosters, alumni, and current players CANNOT recruit on behalf of a school. Report any such contact.',
        details: [
          'Boosters may not contact recruits to promote a school',
          'Current players cannot recruit prospective athletes on behalf of coaches',
          'Alumni cannot make phone calls or arrange visits for recruits',
          'If a booster contacts your family about a school, report it to compliance',
          'Accepting benefits from boosters can make your child ineligible',
        ],
      },
    ],
  },
  {
    id: 'visits',
    title: 'Campus Visits',
    description: 'Rules for official and unofficial visits to college campuses.',
    rules: [
      {
        id: 'official-visits',
        icon: 'flight',
        title: 'Official Visits',
        risk: 'high',
        summary: 'Schools pay for transportation, meals, and lodging. Limited to 5 official visits (D1).',
        details: [
          'D1: Maximum of 5 official visits total (across all schools)',
          'D2: No limit on official visits but each school may only host once',
          'Must have a test score (SAT/ACT) on file to take an official visit (D1)',
          'Must be registered with the NCAA Eligibility Center',
          'School pays for transportation, meals, lodging (up to 48 hours)',
          'Official visits cannot occur during dead periods',
          'A parent/guardian may accompany the recruit at the school\'s expense',
        ],
        highlights: [
          { label: 'D1 Limit', value: '5 total visits' },
          { label: 'Duration', value: 'Up to 48 hours' },
        ],
      },
      {
        id: 'unofficial-visits',
        icon: 'directions_car',
        title: 'Unofficial Visits',
        risk: 'low',
        summary: 'Family pays all costs. No limit on number of unofficial visits. Available during contact and quiet periods.',
        details: [
          'No limit on the number of unofficial visits',
          'All costs (travel, meals, lodging) are paid by the family',
          'Can occur during contact or quiet periods (not dead periods)',
          'Coaches may provide a campus tour and meet with the recruit',
          'No complimentary tickets to games during unofficial visits (D1)',
          'Available starting January 1 of sophomore year (D1)',
        ],
      },
    ],
  },
  {
    id: 'eligibility',
    title: 'Academic Eligibility',
    description: 'GPA, test scores, and course requirements for NCAA eligibility.',
    rules: [
      {
        id: 'gpa-requirements',
        icon: 'school',
        title: 'GPA & Core Course Requirements',
        risk: 'high',
        summary: 'NCAA uses a sliding scale: higher GPA allows lower test scores and vice versa. 16 core courses required for D1.',
        details: [
          'D1: 16 core courses required (4 English, 3 math, 2 science, etc.)',
          'D2: 16 core courses required with a minimum 2.2 core GPA',
          'D1 uses a sliding scale — 2.3 GPA needs 900+ SAT / 75+ ACT sum',
          '10 of 16 core courses must be completed before senior year (D1)',
          'GPA is calculated only from NCAA-approved core courses',
          'Regular high school GPA may differ from NCAA core GPA',
        ],
        highlights: [
          { label: 'D1 Min GPA', value: '2.3 core GPA' },
          { label: 'D1 Core Courses', value: '16 required' },
          { label: 'D2 Min GPA', value: '2.2 core GPA' },
        ],
      },
      {
        id: 'eligibility-center',
        icon: 'verified',
        title: 'NCAA Eligibility Center Registration',
        risk: 'high',
        summary: 'All college-bound athletes must register with the NCAA Eligibility Center. Start early — processing takes time.',
        details: [
          'Register at eligibilitycenter.org (formerly NCAA Clearinghouse)',
          'Register by the start of junior year at the latest',
          'Request your high school send transcripts after each year',
          'Send SAT/ACT scores directly to the Eligibility Center (code 9999)',
          'Registration fee: $90 (fee waivers available for qualifying families)',
          'International students have additional documentation requirements',
        ],
      },
      {
        id: 'test-scores',
        icon: 'assignment',
        title: 'SAT / ACT Score Requirements',
        risk: 'medium',
        summary: 'Test scores are part of the D1/D2 sliding scale. Scores must be sent directly from the testing agency.',
        details: [
          'D1: SAT or ACT required — part of sliding scale with GPA',
          'D2: SAT or ACT required — minimum score varies by GPA',
          'D3: No minimum test score requirement (school admission standards apply)',
          'Scores must be sent directly from SAT (code 9999) or ACT (code 9999)',
          'Self-reported scores on transcripts are NOT accepted',
          'Students may take the test multiple times; best scores are used',
        ],
      },
    ],
  },
  {
    id: 'financial',
    title: 'Financial Rules & NIL',
    description: 'Scholarship rules, NIL policies, and what families need to know about money.',
    rules: [
      {
        id: 'scholarships',
        icon: 'payments',
        title: 'Athletic Scholarship Rules',
        risk: 'medium',
        summary: 'D1 FBS football offers up to 85 full scholarships. D1 FCS and D2 use equivalency (partial scholarships).',
        details: [
          'D1 FBS: Up to 85 full (head-count) scholarships per team',
          'D1 FCS: 63 equivalency scholarships (can be split among more players)',
          'D2: 36 equivalency scholarships',
          'D3 & NAIA: No athletic scholarships (D3); NAIA offers up to 24',
          'Scholarships are renewable annually — not guaranteed for 4 years',
          'Multi-year scholarship agreements are allowed but not required',
          'Schools may reduce or cancel scholarships under certain conditions',
        ],
      },
      {
        id: 'nil',
        icon: 'monetization_on',
        title: 'Name, Image, and Likeness (NIL)',
        risk: 'medium',
        summary: 'Athletes may earn money from NIL deals. Rules vary by state and conference. Schools cannot pay directly for NIL.',
        details: [
          'Athletes may profit from their name, image, and likeness',
          'NIL deals must be disclosed to the school\'s compliance office',
          'Schools cannot arrange NIL deals as recruiting inducements',
          'NIL collectives are independent organizations — not school-affiliated',
          'State laws and conference rules may impose additional restrictions',
          'High school athletes may also have NIL opportunities (state-dependent)',
        ],
      },
      {
        id: 'impermissible-benefits',
        icon: 'block',
        title: 'Impermissible Benefits',
        risk: 'high',
        summary: 'Accepting gifts, money, or special treatment from coaches, boosters, or schools can result in immediate ineligibility.',
        details: [
          'Cannot accept free gear, clothing, or equipment from a school',
          'Cannot accept free meals outside of official visits',
          'Cannot accept transportation paid by the school (outside official visits)',
          'Cannot accept cash or gift cards from any school representative',
          'Cannot receive free or reduced-cost housing arranged by a school',
          'Violations can result in loss of eligibility for the athlete',
        ],
      },
    ],
  },
];

export interface QuickReferenceItem {
  text: string;
}

export const NEVER_DO: QuickReferenceItem[] = [
  { text: 'Accept money, gifts, or gear from coaches or boosters' },
  { text: 'Visit campus during a dead period' },
  { text: 'Let a booster arrange meetings with coaches' },
  { text: 'Sign anything without reading it carefully (NLI, NIL deals)' },
  { text: 'Ignore academic requirements — GPA matters as much as talent' },
  { text: 'Assume a verbal offer is binding (it is not)' },
  { text: 'Skip registering with the NCAA Eligibility Center' },
  { text: 'Respond to recruiting contact before the allowed date' },
  { text: 'Post negative content about schools or coaches on social media' },
  { text: 'Pay a recruiting service that guarantees scholarship placement' },
];

export const ALWAYS_DO: QuickReferenceItem[] = [
  { text: 'Register with the NCAA Eligibility Center by junior year' },
  { text: 'Keep grades up — NCAA uses a sliding scale for eligibility' },
  { text: 'Send SAT/ACT scores directly to the Eligibility Center (code 9999)' },
  { text: 'Track recruiting periods for your target division' },
  { text: 'Document all coach contact (dates, who, what was discussed)' },
  { text: 'Ask coaches directly about scholarship availability and next steps' },
  { text: 'Research the school academically, not just athletically' },
  { text: 'Prepare questions for official visits (academics, culture, support)' },
  { text: 'Report any suspicious contact from boosters to the school\'s compliance office' },
  { text: 'Understand the difference between a verbal offer and a National Letter of Intent' },
];
