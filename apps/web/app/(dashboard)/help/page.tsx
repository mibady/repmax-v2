'use client';

import { useUser } from '@/lib/hooks/use-user';
import type { UserRole } from '@/components/layout/sidebar';

interface FAQ {
  question: string;
  answer: string;
}

const roleFaqs: Record<UserRole, { label: string; faqs: FAQ[] }> = {
  athlete: {
    label: 'Athlete',
    faqs: [
      {
        question: 'How do I create my athlete profile?',
        answer:
          'After signing up, navigate to your dashboard and click "Edit Profile." Fill in your measurables (height, weight, 40-yard dash, etc.), academic info (GPA, class year), and upload a profile photo. Your profile is visible to coaches and recruiters once completed.',
      },
      {
        question: 'How do I upload highlight film?',
        answer:
          'Go to your athlete dashboard and select the "Film" section. Paste a link to your highlight video (YouTube, Hudl, etc.). Coaches can view your film from your public profile card.',
      },
      {
        question: 'How does my player card and QR code work?',
        answer:
          'Your player card is a public profile page that showcases your stats, film, and recruiting info. It includes a unique QR code you can share at camps, combines, and with coaches. Anyone who scans it is taken directly to your card — no login required.',
      },
      {
        question: 'How do I track offers and recruiting interest?',
        answer:
          'The Offers section of your dashboard shows all recruiting interest and offers from college programs. You can view offer details, compare programs, and track your recruiting timeline all in one place.',
      },
    ],
  },
  recruiter: {
    label: 'Recruiter',
    faqs: [
      {
        question: 'How do I manage my recruiting pipeline?',
        answer:
          'The Pipeline page is a Kanban-style board where you track prospects through stages like Identified, Contacted, Evaluating, and Offered. Drag prospects between columns or click to update their status and add notes.',
      },
      {
        question: 'How do I search and compare prospects?',
        answer:
          'Use the Prospects page to search athletes by position, measurables, class year, and zone. The Compare tool lets you evaluate multiple athletes side-by-side across key metrics to make data-driven recruiting decisions.',
      },
      {
        question: 'How does territory and visit management work?',
        answer:
          'The Territory page shows your assigned recruiting zones on an interactive map. The Visits section lets you plan and log campus visits, school visits, and evaluation trips — keeping your travel organized and compliant.',
      },
      {
        question: 'How do I generate recruiting reports?',
        answer:
          'Navigate to Reports to generate evaluation summaries, pipeline analytics, and territory coverage reports. These can be exported and shared with your coaching staff.',
      },
    ],
  },
  coach: {
    label: 'Coach',
    faqs: [
      {
        question: 'How do I manage my team roster?',
        answer:
          'The Roster page lets you view and manage all athletes on your team. You can add players, update their information, and track their recruiting status. Athletes linked to your program appear automatically.',
      },
      {
        question: 'How do I use the task management system?',
        answer:
          'The Tasks section helps you organize coaching responsibilities — from film review deadlines to recruiting follow-ups. Create tasks, set due dates, assign priority levels, and mark them complete as you go.',
      },
      {
        question: 'How do I access and review athlete film?',
        answer:
          'Visit the Film Room to browse highlight videos uploaded by your athletes. You can review film, leave feedback, and share standout clips with college recruiters who are evaluating your players.',
      },
      {
        question: 'How does RepMax help with NCAA compliance?',
        answer:
          'All messaging and recruiter interactions on RepMax are designed to comply with NCAA communication rules. The platform tracks contact periods and ensures outreach follows current regulations.',
      },
    ],
  },
  parent: {
    label: 'Parent',
    faqs: [
      {
        question: 'How do I link to my child\'s account?',
        answer:
          'From your Parent dashboard, use the "Link Child" option to connect to your child\'s athlete profile. Once linked, you can monitor their recruiting activity, profile views, and messages — all from your own dashboard.',
      },
      {
        question: 'How do I track my child\'s recruiting activity?',
        answer:
          'The Activity feed shows profile views from coaches, new messages, offer updates, and film engagement. You\'ll see a real-time picture of your child\'s recruiting journey without needing to log into their account.',
      },
      {
        question: 'How do I research schools and programs?',
        answer:
          'The Schools section lets you browse college programs, compare academic and athletic profiles, and save schools to a watchlist. Use filters for division, location, and program size to find the right fit.',
      },
      {
        question: 'How does the recruiting calendar work?',
        answer:
          'The Calendar shows upcoming recruiting events, campus visit dates, and key deadlines (signing days, evaluation periods). You can sync events to stay on top of your child\'s recruiting timeline.',
      },
    ],
  },
  club: {
    label: 'Club Organizer',
    faqs: [
      {
        question: 'How do I create events and tournaments?',
        answer:
          'From your Club dashboard, click "Create Event" to set up tournaments, combines, or showcases. Add details like date, location, format, divisions, and registration fees. Athletes and teams can register directly through the platform.',
      },
      {
        question: 'How do I manage registered athletes?',
        answer:
          'The Athletes section shows everyone registered for your events. You can view rosters, check payment status, send announcements, and manage check-in on event day.',
      },
      {
        question: 'How does scout and recruiter access work?',
        answer:
          'Recruiters and scouts can discover your events through the platform. You can invite specific recruiters, grant sideline access passes, and share event schedules and rosters to increase exposure for your athletes.',
      },
      {
        question: 'What analytics are available for my events?',
        answer:
          'The Analytics section shows registration trends, attendance numbers, revenue tracking, and athlete performance data from your events. Use these insights to grow your program and demonstrate value to sponsors.',
      },
    ],
  },
  admin: {
    label: 'Admin',
    faqs: [
      {
        question: 'How do I manage users and accounts?',
        answer:
          'The Users section lets you search, view, and manage all accounts on the platform. You can update roles, suspend accounts, reset passwords, and review user activity logs.',
      },
      {
        question: 'How does content moderation work?',
        answer:
          'The Moderation Queue shows flagged content (profiles, messages, film) that needs review. You can approve, edit, or remove content and take action on accounts that violate platform guidelines.',
      },
      {
        question: 'How do I manage feature flags?',
        answer:
          'Feature Flags let you enable or disable platform features for specific roles or user segments without deploying code. Use them for gradual rollouts, A/B testing, or temporarily disabling features during maintenance.',
      },
      {
        question: 'What system analytics are available?',
        answer:
          'The Analytics dashboard shows platform-wide metrics including user growth, engagement rates, subscription revenue, and system health. Use these to monitor platform performance and identify trends.',
      },
    ],
  },
};

const generalFaqs: FAQ[] = [
  {
    question: 'How does messaging work on RepMax?',
    answer:
      'RepMax provides NCAA-compliant messaging between athletes and coaches. Coaches can initiate contact through the platform, and athletes can respond directly. All messages are stored in your inbox and comply with NCAA communication rules.',
  },
  {
    question: 'What features are included in each subscription plan?',
    answer:
      'The Starter plan (free) includes basic profile access and limited searches. Pro ($9.99/mo) unlocks the full athlete database, unlimited search, and data export. Team ($29.99/mo) adds 5 seats, collaboration tools, and shared shortlists. Scout plans are custom-priced for enterprise needs.',
  },
  {
    question: 'How do I cancel my subscription?',
    answer:
      'Go to Settings, then navigate to your billing page. Click "Manage Subscription" to access your Stripe billing portal where you can cancel or change your plan. Cancellation takes effect at the end of your current billing period.',
  },
  {
    question: 'How is my data stored and protected?',
    answer:
      'Your data is stored securely using Supabase (PostgreSQL) with row-level security policies. All data is encrypted in transit via HTTPS and at rest. We follow industry best practices for data protection, including access controls and regular security reviews.',
  },
];

function FaqAccordion({ faqs }: { faqs: FAQ[] }) {
  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <details
          key={faq.question}
          className="group bg-[#1F1F22] rounded-xl border border-white/5 overflow-hidden"
        >
          <summary className="flex items-center justify-between cursor-pointer p-5 text-white font-medium text-sm hover:bg-white/[0.02] transition-colors list-none">
            {faq.question}
            <span className="material-symbols-outlined text-slate-400 text-[20px] transition-transform group-open:rotate-180 shrink-0 ml-4">
              expand_more
            </span>
          </summary>
          <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

export default function HelpCenterPage(): React.JSX.Element {
  const { user, isLoading } = useUser();
  const role = user?.profile?.role as UserRole | undefined;
  const roleData = role ? roleFaqs[role] : null;

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Help Center</h1>
        <p className="text-slate-400 text-sm mb-8">Frequently asked questions about RepMax.</p>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[62px] bg-[#1F1F22] rounded-xl border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {roleData && (
              <div className="mb-10">
                <h2 className="text-lg font-semibold text-white mb-4">
                  {roleData.label} FAQs
                </h2>
                <FaqAccordion faqs={roleData.faqs} />
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-white mb-4">General</h2>
              <FaqAccordion faqs={generalFaqs} />
            </div>
          </>
        )}

        <div className="mt-10 bg-[#1F1F22] rounded-xl border border-white/5 p-6 text-center">
          <span className="material-symbols-outlined text-slate-500 text-4xl mb-3">support_agent</span>
          <h3 className="text-white font-semibold mb-1">Still need help?</h3>
          <p className="text-slate-400 text-sm mb-4">
            Our support team is here to assist you.
          </p>
          <a
            href="mailto:support@repmax.io"
            className="inline-flex items-center gap-2 bg-primary text-black font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">mail</span>
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
