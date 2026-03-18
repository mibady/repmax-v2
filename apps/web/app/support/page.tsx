import Link from 'next/link';
import PublicNav from '@/components/layout/public-nav';

const topics = [
  { icon: 'person', title: 'Account', description: 'Profile setup, login issues, account recovery' },
  { icon: 'credit_card', title: 'Billing', description: 'Subscriptions, invoices, refunds' },
  { icon: 'build', title: 'Technical', description: 'Bug reports, performance, compatibility' },
  { icon: 'sports_football', title: 'Recruiting', description: 'NCAA rules, messaging, offers' },
];

export default function SupportPage(): React.JSX.Element {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 pt-28">
      <PublicNav />

      <h1 className="text-2xl font-bold text-white mb-2 mt-6">Support</h1>
      <p className="text-gray-400 text-sm mb-8">
        Need help? Reach out to our team or browse common topics below.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <a
          href="mailto:support@repmax.io"
          className="bg-[#1F1F22] rounded-xl border border-white/5 p-6 hover:border-primary/30 transition-colors"
        >
          <span className="material-symbols-outlined text-primary text-[28px] mb-3">mail</span>
          <h3 className="text-white font-semibold mb-1">Email Support</h3>
          <p className="text-gray-400 text-sm">support@repmax.io</p>
        </a>
        <Link
          href="/help"
          className="bg-[#1F1F22] rounded-xl border border-white/5 p-6 hover:border-primary/30 transition-colors"
        >
          <span className="material-symbols-outlined text-primary text-[28px] mb-3">help</span>
          <h3 className="text-white font-semibold mb-1">Help Center</h3>
          <p className="text-gray-400 text-sm">Browse FAQs and guides</p>
        </Link>
      </div>

      <h2 className="text-white text-lg font-semibold mb-4">Common Topics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {topics.map((topic) => (
          <div
            key={topic.title}
            className="flex items-start gap-3 bg-[#1F1F22] rounded-xl border border-white/5 p-4"
          >
            <span className="material-symbols-outlined text-slate-400 text-[20px] mt-0.5">{topic.icon}</span>
            <div>
              <h4 className="text-white font-medium text-sm">{topic.title}</h4>
              <p className="text-gray-400 text-xs mt-0.5">{topic.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
