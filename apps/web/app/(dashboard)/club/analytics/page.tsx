import Link from 'next/link';

export default function ClubAnalyticsPage(): React.JSX.Element {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-5xl mx-auto">
        <Link href="/club" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Club Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track player development metrics, club performance, and recruiting pipeline analytics.
          </p>
        </div>

        <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-12 text-center">
          <span className="material-symbols-outlined text-slate-600 text-5xl mb-4">bar_chart</span>
          <h3 className="text-white font-semibold text-lg mb-2">Analytics coming soon</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Club analytics is being built. You will be able to view player development trends, recruiting funnels, and performance reports here.
          </p>
        </div>
      </div>
    </div>
  );
}
