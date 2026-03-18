// Scholarship & Financial Aid Guide — 48 questions across 6 categories
// Cost calculator inputs + interactive checklist

export interface ScholarshipQuestion {
  id: string;
  text: string;
  tip?: string;
}

export interface ScholarshipCategory {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  questions: ScholarshipQuestion[];
}

export const SCHOLARSHIP_CATEGORIES: ScholarshipCategory[] = [
  {
    id: 'understanding-offers',
    icon: 'description',
    title: 'Understanding Scholarship Offers',
    description: 'Key questions to evaluate and compare scholarship offers from different schools.',
    color: 'bg-blue-500/20 text-blue-400',
    questions: [
      { id: 'offer-1', text: 'Is this a full scholarship or a partial scholarship?' },
      { id: 'offer-2', text: 'What specific costs does the scholarship cover (tuition, room, board, books, fees)?' },
      { id: 'offer-3', text: 'Is this a one-year renewable or a multi-year guaranteed scholarship?' },
      { id: 'offer-4', text: 'What are the conditions for renewal (GPA, athletic performance, conduct)?' },
      { id: 'offer-5', text: 'Can the scholarship be reduced or revoked, and under what circumstances?' },
      { id: 'offer-6', text: 'What is the difference between this verbal offer and a National Letter of Intent?' },
      { id: 'offer-7', text: 'When is the deadline to accept or decline this offer?' },
      { id: 'offer-8', text: 'Can we negotiate the scholarship amount or terms?' },
    ],
  },
  {
    id: 'financial-aid',
    icon: 'account_balance',
    title: 'Financial Aid & Grants',
    description: 'Questions about non-athletic financial aid that can supplement a scholarship.',
    color: 'bg-green-500/20 text-green-400',
    questions: [
      { id: 'aid-1', text: 'Can my child receive both athletic and academic scholarships?' },
      { id: 'aid-2', text: 'What federal financial aid (Pell Grant, FSEOG) is my child eligible for?' },
      { id: 'aid-3', text: 'Does the school offer need-based grants in addition to athletic aid?' },
      { id: 'aid-4', text: 'What is the FAFSA deadline for this school, and have we filed it?' },
      { id: 'aid-5', text: 'Are there departmental or merit-based scholarships we should apply for?' },
      { id: 'aid-6', text: 'What work-study opportunities are available for student-athletes?' },
      { id: 'aid-7', text: 'How does NIL income affect financial aid eligibility?' },
      { id: 'aid-8', text: 'What outside scholarships can we apply for, and will they reduce the athletic award?' },
    ],
  },
  {
    id: 'hidden-costs',
    icon: 'receipt_long',
    title: 'Hidden Costs & Out-of-Pocket',
    description: 'Costs that scholarships may not cover — know the full financial picture.',
    color: 'bg-yellow-500/20 text-yellow-400',
    questions: [
      { id: 'cost-1', text: 'What is the total Cost of Attendance (COA) for this school?' },
      { id: 'cost-2', text: 'What fees are NOT covered by the scholarship (parking, lab fees, technology)?' },
      { id: 'cost-3', text: 'How much should we budget for personal expenses (clothing, travel home, entertainment)?' },
      { id: 'cost-4', text: 'Are there summer session costs, and does the scholarship cover them?' },
      { id: 'cost-5', text: 'What is the cost of a meal plan beyond what the scholarship provides?' },
      { id: 'cost-6', text: 'Are there required equipment or supply purchases for the program?' },
      { id: 'cost-7', text: 'What travel costs will the family incur to attend games?' },
      { id: 'cost-8', text: 'Does the scholarship cover a 5th year if my child redshirts?' },
    ],
  },
  {
    id: 'comparing-schools',
    icon: 'compare_arrows',
    title: 'Comparing Schools & Offers',
    description: 'Framework for evaluating multiple offers side by side.',
    color: 'bg-purple-500/20 text-purple-400',
    questions: [
      { id: 'comp-1', text: 'What is the net cost (COA minus all aid) at each school being considered?' },
      { id: 'comp-2', text: 'How do graduation rates compare between the schools?' },
      { id: 'comp-3', text: 'What is the job placement rate for graduates of each school?' },
      { id: 'comp-4', text: 'How does the strength of the academic program compare?' },
      { id: 'comp-5', text: 'What is the cost of living in each school\'s area?' },
      { id: 'comp-6', text: 'How far is each school from home, and what are travel costs?' },
      { id: 'comp-7', text: 'Which program offers the best development path for my child\'s goals?' },
      { id: 'comp-8', text: 'Have we created a side-by-side comparison spreadsheet?' },
    ],
  },
  {
    id: 'nli-signing',
    icon: 'draw',
    title: 'National Letter of Intent (NLI)',
    description: 'What to know before signing the most important document in recruiting.',
    color: 'bg-red-500/20 text-red-400',
    questions: [
      { id: 'nli-1', text: 'What exactly are we agreeing to by signing the NLI?' },
      { id: 'nli-2', text: 'What happens if my child wants to transfer after signing?' },
      { id: 'nli-3', text: 'What is the penalty for not fulfilling the NLI agreement?' },
      { id: 'nli-4', text: 'Can the NLI be voided, and under what circumstances?' },
      { id: 'nli-5', text: 'Is the financial aid agreement (separate document) attached to the NLI?' },
      { id: 'nli-6', text: 'What if the head coach leaves after we sign — can we get a release?' },
      { id: 'nli-7', text: 'Should we have a lawyer review the NLI and financial aid agreement?' },
      { id: 'nli-8', text: 'What are the exact signing dates for Early and Regular signing periods?' },
    ],
  },
  {
    id: 'long-term',
    icon: 'trending_up',
    title: 'Long-Term Financial Planning',
    description: 'Planning beyond freshman year — renewals, 5th year, and protecting your investment.',
    color: 'bg-orange-500/20 text-orange-400',
    questions: [
      { id: 'long-1', text: 'What is the total 4-year (or 5-year) cost projection with and without the scholarship?' },
      { id: 'long-2', text: 'What happens financially if my child is injured and can no longer play?' },
      { id: 'long-3', text: 'Does the school offer medical hardship waivers for injured athletes?' },
      { id: 'long-4', text: 'What insurance coverage does the school provide for athletic injuries?' },
      { id: 'long-5', text: 'If the scholarship is not renewed, what financial aid options exist?' },
      { id: 'long-6', text: 'Can we set up a 529 plan or education savings for uncovered costs?' },
      { id: 'long-7', text: 'What student loan options should we consider as a backup?' },
      { id: 'long-8', text: 'How do we budget for the Expected Family Contribution (EFC)?' },
    ],
  },
];

export const TOTAL_SCHOLARSHIP_QUESTIONS = SCHOLARSHIP_CATEGORIES.reduce(
  (sum, cat) => sum + cat.questions.length,
  0
);

// Cost Calculator defaults
export interface CostCalculatorInputs {
  costOfAttendance: number;
  athleticScholarship: number;
  academicAid: number;
  expectedFamilyContribution: number;
}

export const DEFAULT_CALCULATOR_INPUTS: CostCalculatorInputs = {
  costOfAttendance: 0,
  athleticScholarship: 0,
  academicAid: 0,
  expectedFamilyContribution: 0,
};
