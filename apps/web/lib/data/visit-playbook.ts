// Official Visit Question Playbook — 45 questions across 7 categories
// Interactive checklist for parents preparing for college visits

export interface PlaybookQuestion {
  id: string;
  text: string;
  tip?: string;
}

export interface PlaybookCategory {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
  questions: PlaybookQuestion[];
}

export const VISIT_CATEGORIES: PlaybookCategory[] = [
  {
    id: 'academics',
    icon: 'school',
    title: 'Academics & Support',
    description: 'Questions about academic programs, tutoring, and student-athlete support services.',
    color: 'bg-blue-500/20 text-blue-400',
    questions: [
      { id: 'acad-1', text: 'What is the average GPA of student-athletes on the team?' },
      { id: 'acad-2', text: 'What academic support services are available (tutoring, study hall)?' },
      { id: 'acad-3', text: 'How are class schedules coordinated with practice times?' },
      { id: 'acad-4', text: 'What is the graduation rate for football players?' },
      { id: 'acad-5', text: 'Can athletes change their major if they want to?' },
      { id: 'acad-6', text: 'Are there academic advisors specifically for athletes?' },
      { id: 'acad-7', text: 'What happens if my child is struggling academically — is there a support plan?' },
    ],
  },
  {
    id: 'athletics',
    icon: 'sports_football',
    title: 'Athletics & Program',
    description: 'Questions about the football program, coaching philosophy, and player development.',
    color: 'bg-green-500/20 text-green-400',
    questions: [
      { id: 'ath-1', text: 'What is your coaching philosophy and team culture?' },
      { id: 'ath-2', text: 'How many players at my child\'s position are currently on the roster?' },
      { id: 'ath-3', text: 'What is the typical path for freshmen — redshirt or compete immediately?' },
      { id: 'ath-4', text: 'How do you develop players in the off-season?' },
      { id: 'ath-5', text: 'What does a typical weekly schedule look like during the season?' },
      { id: 'ath-6', text: 'How are playing time decisions made?' },
      { id: 'ath-7', text: 'What strength and conditioning resources are available?' },
    ],
  },
  {
    id: 'financial',
    icon: 'payments',
    title: 'Financial Aid & Scholarships',
    description: 'Questions about scholarship details, financial aid, and costs beyond tuition.',
    color: 'bg-yellow-500/20 text-yellow-400',
    questions: [
      { id: 'fin-1', text: 'Is the scholarship offer a full or partial scholarship?' },
      { id: 'fin-2', text: 'Is the scholarship guaranteed for all 4 (or 5) years?' },
      { id: 'fin-3', text: 'Under what circumstances could the scholarship be reduced or revoked?' },
      { id: 'fin-4', text: 'What additional costs should we expect beyond tuition (books, fees, travel)?' },
      { id: 'fin-5', text: 'Are there academic scholarships or grants in addition to athletic aid?' },
      { id: 'fin-6', text: 'What happens to the scholarship if my child gets injured?' },
      { id: 'fin-7', text: 'Does the school offer summer school funding?' },
    ],
  },
  {
    id: 'campus-life',
    icon: 'apartment',
    title: 'Campus Life & Culture',
    description: 'Questions about daily life, housing, and the overall campus experience.',
    color: 'bg-purple-500/20 text-purple-400',
    questions: [
      { id: 'camp-1', text: 'Where do freshmen athletes live — dorms, athlete housing, or off-campus?' },
      { id: 'camp-2', text: 'What does a typical day look like for a student-athlete?' },
      { id: 'camp-3', text: 'What meal plans are available for athletes?' },
      { id: 'camp-4', text: 'How do athletes balance social life and athletics?' },
      { id: 'camp-5', text: 'What is the surrounding community like — safe, walkable, things to do?' },
      { id: 'camp-6', text: 'Are there team-building activities or community service requirements?' },
    ],
  },
  {
    id: 'medical',
    icon: 'health_and_safety',
    title: 'Medical & Wellness',
    description: 'Questions about injury care, mental health support, and athlete wellness programs.',
    color: 'bg-red-500/20 text-red-400',
    questions: [
      { id: 'med-1', text: 'What medical staff is available — athletic trainers, team doctors?' },
      { id: 'med-2', text: 'What is the concussion protocol?' },
      { id: 'med-3', text: 'What happens if my child has a season-ending injury?' },
      { id: 'med-4', text: 'Is there a sports psychologist or mental health counselor available?' },
      { id: 'med-5', text: 'What nutrition support is provided (dietitian, meal planning)?' },
      { id: 'med-6', text: 'Who pays for medical treatment related to sports injuries?' },
    ],
  },
  {
    id: 'post-career',
    icon: 'work',
    title: 'Post-College & Career',
    description: 'Questions about life after football — career services, alumni network, and NFL preparation.',
    color: 'bg-orange-500/20 text-orange-400',
    questions: [
      { id: 'post-1', text: 'What career services are available for student-athletes?' },
      { id: 'post-2', text: 'Do you have an alumni network that helps with job placement?' },
      { id: 'post-3', text: 'How many players have gone on to play professionally?' },
      { id: 'post-4', text: 'Are there internship opportunities during the off-season?' },
      { id: 'post-5', text: 'What NIL support and education does the program provide?' },
      { id: 'post-6', text: 'Is there a life-skills or leadership development program?' },
    ],
  },
  {
    id: 'parent-specific',
    icon: 'family_restroom',
    title: 'Parent-Specific Questions',
    description: 'Questions that parents should ask directly — communication, safety, and involvement.',
    color: 'bg-teal-500/20 text-teal-400',
    questions: [
      { id: 'par-1', text: 'How will the coaching staff communicate with parents?' },
      { id: 'par-2', text: 'What is the policy on parent attendance at practices?' },
      { id: 'par-3', text: 'How are disciplinary issues handled?' },
      { id: 'par-4', text: 'What is the transfer portal policy if things don\'t work out?' },
      { id: 'par-5', text: 'Can we speak with current players\' parents about their experience?' },
      { id: 'par-6', text: 'What is your commitment to player safety and well-being?' },
    ],
  },
];

export const TOTAL_QUESTIONS = VISIT_CATEGORIES.reduce(
  (sum, cat) => sum + cat.questions.length,
  0
);
