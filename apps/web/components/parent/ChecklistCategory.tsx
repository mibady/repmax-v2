'use client';

import { useState } from 'react';

interface ChecklistQuestion {
  id: string;
  text: string;
  tip?: string;
}

interface ChecklistCategoryProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  questions: ChecklistQuestion[];
  isChecked: (id: string) => boolean;
  onToggle: (id: string) => void;
}

export function ChecklistCategory({
  icon,
  title,
  description,
  color,
  questions,
  isChecked,
  onToggle,
}: ChecklistCategoryProps) {
  const [expanded, setExpanded] = useState(false);
  const checkedCount = questions.filter((q) => isChecked(q.id)).length;
  const total = questions.length;
  const pct = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className={`size-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-white font-semibold text-sm">{title}</h4>
            <span className="text-xs text-slate-400 shrink-0 ml-2">
              {checkedCount}/{total}
            </span>
          </div>
          <p className="text-slate-500 text-xs mb-2">{description}</p>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <span className={`material-symbols-outlined text-slate-500 text-[20px] shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {expanded && (
        <div className="border-t border-white/5 divide-y divide-white/5">
          {questions.map((q) => (
            <label
              key={q.id}
              className="flex items-start gap-3 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
            >
              <input
                type="checkbox"
                checked={isChecked(q.id)}
                onChange={() => onToggle(q.id)}
                className="mt-0.5 size-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/30 shrink-0 accent-[#D4AF37]"
              />
              <span className={`text-sm leading-relaxed ${isChecked(q.id) ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                {q.text}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
