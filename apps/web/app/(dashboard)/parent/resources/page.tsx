'use client';

import Link from 'next/link';

const guides = [
  {
    icon: 'gavel',
    color: 'bg-purple-500/20 text-purple-400',
    title: 'NCAA Compliance Guide',
    description: 'Understand contact periods, visit rules, eligibility requirements, and financial rules. Organized by risk level so you know what matters most.',
    href: '/parent/resources/ncaa-compliance',
  },
  {
    icon: 'checklist',
    color: 'bg-green-500/20 text-green-400',
    title: 'Official Visit Question Playbook',
    description: '45 essential questions across 7 categories to ask during campus visits. Track your progress with an interactive checklist.',
    href: '/parent/resources/visit-playbook',
  },
  {
    icon: 'payments',
    color: 'bg-yellow-500/20 text-yellow-400',
    title: 'Scholarship & Financial Aid Guide',
    description: 'Cost calculator plus 48 questions about scholarship offers, financial aid, hidden costs, and long-term planning.',
    href: '/parent/resources/scholarship-guide',
  },
];

const externalResources = [
  {
    icon: 'verified',
    color: 'bg-blue-500/20 text-blue-400',
    title: 'NCAA Eligibility Center',
    description: 'Register your child and track academic eligibility. Required for all D1 and D2 recruits.',
    url: 'https://web3.ncaa.org/ecwr3/',
  },
  {
    icon: 'event',
    color: 'bg-orange-500/20 text-orange-400',
    title: 'NCAA Important Dates',
    description: 'Key deadlines for registration, eligibility center, and recruiting periods.',
    url: 'https://www.ncaa.org/sports/2015/2/5/important-dates.aspx',
  },
  {
    icon: 'link',
    color: 'bg-teal-500/20 text-teal-400',
    title: 'Helpful Links',
    description: 'External resources including scholarship databases and recruiting guides.',
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
          <h1 className="text-2xl font-bold text-white">Parent Resource Hub</h1>
          <p className="text-slate-400 text-sm mt-1">Interactive guides and essential recruiting resources for your family.</p>
        </div>

        {/* RepMax Guides */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">auto_stories</span>
            RepMax Guides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {guides.map((guide) => (
              <Link
                key={guide.title}
                href={guide.href}
                className="bg-[#1F1F22] rounded-xl border border-white/5 p-6 hover:border-primary/30 transition-colors group"
              >
                <div className={`size-12 rounded-lg ${guide.color} flex items-center justify-center mb-4`}>
                  <span className="material-symbols-outlined text-[24px]">{guide.icon}</span>
                </div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-primary transition-colors">{guide.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{guide.description}</p>
                <span className="text-sm font-semibold text-primary inline-flex items-center gap-1">
                  Open Guide
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* External Resources */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">open_in_new</span>
            External Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {externalResources.map((resource) => (
              <div key={resource.title} className="bg-[#1F1F22] rounded-xl border border-white/5 p-6 hover:border-white/10 transition-colors">
                <div className={`size-12 rounded-lg ${resource.color} flex items-center justify-center mb-4`}>
                  <span className="material-symbols-outlined text-[24px]">{resource.icon}</span>
                </div>
                <h3 className="text-white font-semibold mb-2">{resource.title}</h3>
                <p className="text-slate-400 text-sm mb-4">{resource.description}</p>
                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1">
                  Visit Site
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
