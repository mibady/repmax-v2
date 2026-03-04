'use client';

import Link from 'next/link';

const resources = [
  {
    icon: 'checklist',
    color: 'bg-blue-500/20 text-blue-400',
    title: 'Eligibility Requirements',
    description: 'Learn about GPA requirements, test scores, and core courses needed for NCAA eligibility.',
    url: 'https://web3.ncaa.org/ecwr3/',
  },
  {
    icon: 'gavel',
    color: 'bg-purple-500/20 text-purple-400',
    title: 'NCAA Recruiting Rules',
    description: 'Understand contact periods, official visits, and communication rules for each division.',
    url: 'https://www.ncaa.org/sports/2014/10/28/recruiting.aspx',
  },
  {
    icon: 'event',
    color: 'bg-green-500/20 text-green-400',
    title: 'Important Dates',
    description: 'Key deadlines for registration, eligibility center, and recruiting periods.',
    url: 'https://www.ncaa.org/sports/2015/2/5/important-dates.aspx',
  },
  {
    icon: 'link',
    color: 'bg-orange-500/20 text-orange-400',
    title: 'Helpful Links',
    description: 'External resources including NCAA Eligibility Center, scholarship databases, and recruiting guides.',
    url: 'https://www.ncaa.org/student-athletes/future/helpful-links',
  },
];

export default function ParentResourcesPage() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Back Link */}
        <Link href="/parent" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">NCAA Resources</h1>
          <p className="text-slate-400 text-sm mt-1">Essential information for the recruiting process.</p>
        </div>

        {/* Resource Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource) => (
            <div key={resource.title} className="bg-[#1F1F22] rounded-xl border border-white/5 p-6 hover:border-white/10 transition-colors">
              <div className={`size-12 rounded-lg ${resource.color} flex items-center justify-center mb-4`}>
                <span className="material-symbols-outlined text-[24px]">{resource.icon}</span>
              </div>
              <h3 className="text-white font-semibold mb-2">{resource.title}</h3>
              <p className="text-slate-400 text-sm mb-4">{resource.description}</p>
              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1">
                Learn More
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
