const faqs = [
  {
    question: 'How do I create my athlete profile?',
    answer:
      'After signing up, navigate to your dashboard and click "Edit Profile." Fill in your measurables (height, weight, 40-yard dash, etc.), academic info (GPA, class year), and upload a profile photo. Your profile is visible to coaches and recruiters once completed.',
  },
  {
    question: 'How does messaging work on RepMax?',
    answer:
      'RepMax provides NCAA-compliant messaging between athletes and coaches. Coaches can initiate contact through the platform, and athletes can respond directly. All messages are stored in your inbox and comply with NCAA communication rules.',
  },
  {
    question: 'How do I upload highlight film?',
    answer:
      'Go to your athlete dashboard and select the "Film" section. You can paste a link to your highlight video (YouTube, Hudl, etc.) or upload directly. Coaches can view your film from your public profile card.',
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

export default function HelpCenterPage(): React.JSX.Element {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Help Center</h1>
        <p className="text-slate-400 text-sm mb-8">Frequently asked questions about RepMax.</p>

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

        <div className="mt-10 bg-[#1F1F22] rounded-xl border border-white/5 p-6 text-center">
          <span className="material-symbols-outlined text-slate-500 text-4xl mb-3">support_agent</span>
          <h3 className="text-white font-semibold mb-1">Still need help?</h3>
          <p className="text-slate-400 text-sm mb-4">
            Our support team is here to assist you.
          </p>
          <a
            href="mailto:support@repmax.com"
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
