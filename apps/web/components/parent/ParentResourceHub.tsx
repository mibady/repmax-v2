'use client';

import Link from 'next/link';

const guides = [
  {
    icon: 'gavel',
    color: 'bg-purple-500/20 text-purple-400',
    title: 'NCAA Compliance',
    description: 'Rules, risk levels, and quick reference',
    href: '/parent/resources/ncaa-compliance',
  },
  {
    icon: 'checklist',
    color: 'bg-green-500/20 text-green-400',
    title: 'Visit Playbook',
    description: '45 questions for official visits',
    href: '/parent/resources/visit-playbook',
  },
  {
    icon: 'payments',
    color: 'bg-yellow-500/20 text-yellow-400',
    title: 'Scholarship Guide',
    description: 'Cost calculator & 48 questions',
    href: '/parent/resources/scholarship-guide',
  },
];

export function ParentResourceHub() {
  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5">
      <div className="p-5 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">auto_stories</span>
          Parent Resources
        </h3>
        <Link href="/parent/resources" className="text-xs font-semibold text-primary hover:text-primary/80">
          View All
        </Link>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {guides.map((guide) => (
          <Link
            key={guide.title}
            href={guide.href}
            className="rounded-lg border border-white/5 p-4 hover:border-primary/30 transition-colors group"
          >
            <div className={`size-9 rounded-lg ${guide.color} flex items-center justify-center mb-3`}>
              <span className="material-symbols-outlined text-[18px]">{guide.icon}</span>
            </div>
            <h4 className="text-white font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{guide.title}</h4>
            <p className="text-xs text-slate-500">{guide.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
