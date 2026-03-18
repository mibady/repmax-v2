'use client';

import { useState } from 'react';
import { type RiskLevel, RISK_COLORS } from '@/lib/data/ncaa-compliance';

interface ExpandableRuleCardProps {
  icon: string;
  title: string;
  risk: RiskLevel;
  summary: string;
  details: string[];
  highlights?: { label: string; value: string }[];
}

const RISK_LABELS: Record<RiskLevel, string> = {
  high: 'High Risk',
  medium: 'Medium',
  low: 'Low Risk',
};

export function ExpandableRuleCard({
  icon,
  title,
  risk,
  summary,
  details,
  highlights,
}: ExpandableRuleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = RISK_COLORS[risk];

  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-start gap-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className={`size-10 rounded-lg ${colors.bg} flex items-center justify-center shrink-0 mt-0.5`}>
          <span className={`material-symbols-outlined text-[20px] ${colors.text}`}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-white font-semibold text-sm">{title}</h4>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
              {RISK_LABELS[risk]}
            </span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">{summary}</p>
        </div>
        <span className={`material-symbols-outlined text-slate-500 text-[20px] shrink-0 mt-1 transition-transform ${expanded ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-white/5">
          <ul className="mt-4 space-y-2">
            {details.map((detail, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="material-symbols-outlined text-[14px] text-slate-500 mt-0.5 shrink-0">chevron_right</span>
                {detail}
              </li>
            ))}
          </ul>

          {highlights && highlights.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {highlights.map((h) => (
                <div key={h.label} className={`${colors.bg} ${colors.border} border rounded-lg px-3 py-2`}>
                  <div className="text-[10px] uppercase text-slate-400 font-medium">{h.label}</div>
                  <div className={`text-sm font-bold ${colors.text}`}>{h.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
