'use client';

import { useState } from 'react';

interface CalculatorField {
  key: string;
  label: string;
  icon: string;
  placeholder: string;
}

const FIELDS: CalculatorField[] = [
  { key: 'coa', label: 'Cost of Attendance (per year)', icon: 'school', placeholder: '45000' },
  { key: 'athletic', label: 'Athletic Scholarship (per year)', icon: 'sports_football', placeholder: '25000' },
  { key: 'academic', label: 'Academic/Merit Aid (per year)', icon: 'emoji_events', placeholder: '5000' },
  { key: 'efc', label: 'Expected Family Contribution (per year)', icon: 'family_restroom', placeholder: '10000' },
];

export function CostCalculator() {
  const [values, setValues] = useState<Record<string, number>>({
    coa: 0,
    athletic: 0,
    academic: 0,
    efc: 0,
  });

  const handleChange = (key: string, raw: string) => {
    const num = parseInt(raw.replace(/[^0-9]/g, ''), 10);
    setValues((prev) => ({ ...prev, [key]: isNaN(num) ? 0 : num }));
  };

  const annualGap = Math.max(0, values.coa - values.athletic - values.academic - values.efc);
  const fourYearTotal = annualGap * 4;

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[20px]">calculate</span>
        <h3 className="text-white font-bold text-base">Cost Calculator</h3>
      </div>
      <p className="text-slate-400 text-sm mb-5">
        Estimate your annual out-of-pocket cost and 4-year total gap.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">{f.icon}</span>
              {f.label}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={values[f.key] === 0 ? '' : values[f.key].toLocaleString()}
                onChange={(e) => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`rounded-lg p-4 border ${annualGap > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
          <div className="text-xs text-slate-400 mb-1">Annual Gap</div>
          <div className={`text-2xl font-bold ${annualGap > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {fmt(annualGap)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Per year out-of-pocket</div>
        </div>
        <div className={`rounded-lg p-4 border ${fourYearTotal > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
          <div className="text-xs text-slate-400 mb-1">4-Year Total</div>
          <div className={`text-2xl font-bold ${fourYearTotal > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {fmt(fourYearTotal)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Total estimated gap</div>
        </div>
      </div>

      <p className="text-[11px] text-slate-600 mt-4">
        * This is an estimate. Actual costs may vary. Does not account for annual tuition increases, additional fees, or changes in aid.
      </p>
    </div>
  );
}
