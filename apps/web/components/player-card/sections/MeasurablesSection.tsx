'use client';

import type { PlayerCardMetrics } from '../types';

function formatValue(val: number | null | undefined, suffix = ''): string {
  if (val === null || val === undefined || val === 0) return 'N/A';
  return `${val}${suffix}`;
}

function MetricCard({ label, value, unit, highlight }: { label: string; value: string; unit?: string; highlight?: boolean }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
      <span className="text-[10px] text-gray-500 font-medium">{label}</span>
      <span className={`text-xl font-bold font-mono ${highlight ? 'text-primary' : 'text-white'}`}>{value}</span>
      {unit && value !== 'N/A' && <span className="text-[10px] text-gray-500 -mt-1">{unit}</span>}
    </div>
  );
}

export function MeasurablesSection({ metrics }: { metrics: PlayerCardMetrics }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[20px]">straighten</span>
        <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Measurables</h2>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <MetricCard label="Height" value={metrics.height} />
        <MetricCard label="Weight" value={formatValue(metrics.weight)} unit="lbs" />
        <MetricCard label="Wingspan" value={formatValue(metrics.wingspan, '"')} />
        <MetricCard label="40-Yard" value={metrics.fortyYard ? `${metrics.fortyYard}s` : 'N/A'} highlight />
        <MetricCard label="10Y Split" value={metrics.tenYardSplit ? `${metrics.tenYardSplit}s` : 'N/A'} />
        <MetricCard label="5-10-5" value={metrics.fiveTenFive ? `${metrics.fiveTenFive}s` : 'N/A'} />
        <MetricCard label="Broad Jump" value={formatValue(metrics.broadJump, '"')} />
        <MetricCard label="Bench" value={formatValue(metrics.bench)} unit="lbs" />
        <MetricCard label="Squat" value={formatValue(metrics.squat)} unit="lbs" />
        <MetricCard label="Vertical" value={formatValue(metrics.vertical, '"')} />
      </div>
    </section>
  );
}
