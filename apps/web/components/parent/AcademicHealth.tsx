'use client';

import type { AcademicHealth as AcademicHealthType } from '@/lib/hooks';

interface AcademicHealthProps {
  academic: AcademicHealthType;
}

interface ProgressBarProps {
  label: string;
  icon: string;
  value: string;
  percent: number;
  color: string;
  note?: string;
}

function ProgressBar({ label, icon, value, percent, color, note }: ProgressBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-slate-400">{icon}</span>
          <span className="text-xs font-medium text-slate-300">{label}</span>
        </div>
        <span className="text-xs font-bold text-white">{value}</span>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      {note && <p className="text-[11px] text-slate-500 mt-0.5">{note}</p>}
    </div>
  );
}

export function AcademicHealth({ academic }: AcademicHealthProps) {
  // GPA progress (out of 4.0, minimum 2.3 for D1)
  const gpaPercent = academic.gpa ? (academic.gpa / 4.0) * 100 : 0;
  const gpaColor = !academic.gpa ? 'bg-red-400' : academic.gpa >= 3.0 ? 'bg-green-400' : academic.gpa >= 2.3 ? 'bg-yellow-400' : 'bg-red-400';

  // SAT progress (out of 1600)
  const satPercent = academic.satScore ? (academic.satScore / 1600) * 100 : 0;
  const satColor = !academic.satScore ? 'bg-slate-500' : academic.satScore >= 1100 ? 'bg-green-400' : academic.satScore >= 900 ? 'bg-yellow-400' : 'bg-red-400';

  // ACT progress (out of 36)
  const actPercent = academic.actScore ? (academic.actScore / 36) * 100 : 0;
  const actColor = !academic.actScore ? 'bg-slate-500' : academic.actScore >= 22 ? 'bg-green-400' : academic.actScore >= 17 ? 'bg-yellow-400' : 'bg-red-400';

  // Core courses
  const coursePercent = (academic.coreCourses.completed / academic.coreCourses.required) * 100;

  // Clearinghouse
  const clearinghouseLabels: Record<string, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    complete: 'Complete',
  };
  const clearinghousePercent = academic.clearinghouseStatus === 'complete' ? 100 : academic.clearinghouseStatus === 'in_progress' ? 50 : 0;
  const clearinghouseColor = academic.clearinghouseStatus === 'complete' ? 'bg-green-400' : academic.clearinghouseStatus === 'in_progress' ? 'bg-yellow-400' : 'bg-red-400';

  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-5">
      <h3 className="font-bold text-white flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-primary">monitoring</span>
        Academic Health
      </h3>
      <div className="space-y-4">
        <ProgressBar
          label="Core GPA"
          icon="school"
          value={academic.gpa ? academic.gpa.toFixed(2) : 'Not set'}
          percent={gpaPercent}
          color={gpaColor}
          note={academic.gpa ? `D1 minimum: 2.3` : 'Update in athlete profile'}
        />
        <ProgressBar
          label="SAT Score"
          icon="assignment"
          value={academic.satScore ? String(academic.satScore) : 'Not set'}
          percent={satPercent}
          color={satColor}
          note={academic.satScore ? `Out of 1600` : 'Add score to profile'}
        />
        <ProgressBar
          label="ACT Score"
          icon="quiz"
          value={academic.actScore ? String(academic.actScore) : 'Not set'}
          percent={actPercent}
          color={actColor}
          note={academic.actScore ? `Out of 36` : 'Add score to profile'}
        />
        <ProgressBar
          label="Core Courses"
          icon="menu_book"
          value={`${academic.coreCourses.completed}/${academic.coreCourses.required}`}
          percent={coursePercent}
          color={coursePercent >= 80 ? 'bg-green-400' : coursePercent >= 50 ? 'bg-yellow-400' : 'bg-red-400'}
          note="Update in profile — D1 requires 16 core courses"
        />
        <ProgressBar
          label="NCAA Clearinghouse"
          icon="verified"
          value={clearinghouseLabels[academic.clearinghouseStatus] || 'Not Started'}
          percent={clearinghousePercent}
          color={clearinghouseColor}
          note={academic.clearinghouseStatus === 'not_started' ? 'Register at eligibilitycenter.org' : undefined}
        />
      </div>
    </div>
  );
}
