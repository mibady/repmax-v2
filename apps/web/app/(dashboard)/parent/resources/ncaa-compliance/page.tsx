'use client';

import Link from 'next/link';
import { COMPLIANCE_SECTIONS, NEVER_DO, ALWAYS_DO } from '@/lib/data/ncaa-compliance';
import { ExpandableRuleCard } from '@/components/parent/ExpandableRuleCard';
import { QuickReferenceGrid } from '@/components/parent/QuickReferenceGrid';

export default function NcaaCompliancePage() {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-4xl mx-auto">
        {/* Back Link */}
        <Link href="/parent/resources" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Resources
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-400 text-[24px]">gavel</span>
            </div>
            <h1 className="text-2xl font-bold text-white">NCAA Compliance Guide</h1>
          </div>
          <p className="text-slate-400 text-sm mt-2">
            Essential recruiting rules every parent needs to know. Organized by risk level — high-risk violations can cost your child their eligibility.
          </p>
        </div>

        {/* Quick Reference Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">quick_reference</span>
            Quick Reference
          </h2>
          <QuickReferenceGrid neverDo={NEVER_DO} alwaysDo={ALWAYS_DO} />
        </div>

        {/* Rule Sections */}
        {COMPLIANCE_SECTIONS.map((section) => (
          <div key={section.id} className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-2">{section.title}</h2>
            <p className="text-slate-400 text-sm mb-4">{section.description}</p>
            <div className="space-y-3">
              {section.rules.map((rule) => (
                <ExpandableRuleCard
                  key={rule.id}
                  icon={rule.icon}
                  title={rule.title}
                  risk={rule.risk}
                  summary={rule.summary}
                  details={rule.details}
                  highlights={rule.highlights}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Disclaimer */}
        <div className="mt-8 bg-white/5 rounded-xl p-4 border border-white/5">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-400">Disclaimer:</span> This guide is for informational purposes only and does not constitute legal advice. NCAA rules change frequently — always verify current rules at{' '}
            <a href="https://www.ncaa.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ncaa.org</a>{' '}
            or contact the school&apos;s compliance office directly.
          </p>
        </div>
      </div>
    </div>
  );
}
