'use client';

import Link from 'next/link';
import { SCHOLARSHIP_CATEGORIES, TOTAL_SCHOLARSHIP_QUESTIONS } from '@/lib/data/scholarship-guide';
import { ChecklistCategory } from '@/components/parent/ChecklistCategory';
import { CostCalculator } from '@/components/parent/CostCalculator';
import { useChecklistProgress } from '@/lib/hooks';

export default function ScholarshipGuidePage() {
  const { toggle, isChecked, reset, progress, checkedCount } = useChecklistProgress('scholarship-guide');

  const allIds = SCHOLARSHIP_CATEGORIES.flatMap((c) => c.questions.map((q) => q.id));
  const overallProgress = progress(allIds);
  const totalChecked = checkedCount(allIds);

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-4xl mx-auto">
        {/* Back Link */}
        <Link href="/parent/resources" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Resources
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-yellow-400 text-[24px]">payments</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Scholarship & Financial Aid Guide</h1>
          </div>
          <p className="text-slate-400 text-sm mt-2">
            {TOTAL_SCHOLARSHIP_QUESTIONS} questions across 6 categories plus a cost calculator to estimate your family&apos;s out-of-pocket expenses.
          </p>
        </div>

        {/* Cost Calculator */}
        <div className="mb-6">
          <CostCalculator />
        </div>

        {/* Overall Progress */}
        <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">task_alt</span>
              <span className="text-white font-semibold text-sm">Checklist Progress</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">
                {totalChecked}/{TOTAL_SCHOLARSHIP_QUESTIONS} questions
              </span>
              {totalChecked > 0 && (
                <button
                  onClick={reset}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="text-right mt-1">
            <span className="text-xs text-slate-500">{overallProgress}% complete</span>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          {SCHOLARSHIP_CATEGORIES.map((cat) => (
            <ChecklistCategory
              key={cat.id}
              icon={cat.icon}
              title={cat.title}
              description={cat.description}
              color={cat.color}
              questions={cat.questions}
              isChecked={isChecked}
              onToggle={toggle}
            />
          ))}
        </div>

        {/* Tip */}
        <div className="mt-8 bg-primary/5 rounded-xl p-4 border border-primary/20">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">lightbulb</span>
            <div>
              <p className="text-sm text-slate-300 font-medium mb-1">Important Reminder</p>
              <p className="text-xs text-slate-400">
                A verbal scholarship offer is NOT binding. Only a signed National Letter of Intent (NLI) with an accompanying financial aid agreement is a commitment. Get everything in writing before making decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
