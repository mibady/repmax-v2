'use client';

import type { PlayerCardData } from '../types';

function formatValue(val: number | null | undefined): string {
  if (val === null || val === undefined || val === 0) return 'N/A';
  return `${val}`;
}

export function AcademicsSection({ data }: { data: PlayerCardData }) {
  const { academics } = data;
  const dreamSchools = data.dreamSchools?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const awards = data.awards?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const camps = data.campsAttended?.split(',').map(s => s.trim()).filter(Boolean) || [];

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[20px]">school</span>
        <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Academics</h2>
      </div>

      {/* GPA Cards */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
          <span className="text-xs text-gray-500 font-medium">GPA</span>
          <span className="text-xl text-white font-bold font-mono">{formatValue(academics.gpa)}</span>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
          <span className="text-xs text-gray-500 font-medium">W. GPA</span>
          <span className="text-xl text-white font-bold font-mono">{formatValue(academics.weightedGpa)}</span>
        </div>
        {data.coreGpa ? (
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
            <span className="text-xs text-gray-500 font-medium">Core GPA</span>
            <span className="text-xl text-white font-bold font-mono">{formatValue(data.coreGpa)}</span>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
            <span className="text-xs text-gray-500 font-medium">Offers</span>
            <span className="text-xl text-primary font-bold font-mono">{data.offersCount}</span>
          </div>
        )}
      </div>

      {/* SAT / ACT */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between mb-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium">SAT</span>
          <span className="text-xl text-white font-bold font-mono">{formatValue(academics.sat)}</span>
        </div>
        <div className="h-8 w-px bg-white/10" />
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500 font-medium">ACT</span>
          <span className="text-xl text-white font-bold font-mono">{formatValue(academics.act)}</span>
        </div>
      </div>

      {/* Academic Interest */}
      {data.academicInterest && (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-3">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Academic Interest</span>
          <p className="text-sm text-white">{data.academicInterest}</p>
        </div>
      )}

      {/* College Priority */}
      {data.collegePriority && (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-3">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-1">College Priority</span>
          <p className="text-sm text-white">{data.collegePriority}</p>
        </div>
      )}

      {/* Dream Schools */}
      {dreamSchools.length > 0 && (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-3">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2">Dream Schools</span>
          <div className="flex flex-wrap gap-2">
            {dreamSchools.map((school, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">{school}</span>
            ))}
          </div>
        </div>
      )}

      {/* Awards */}
      {awards.length > 0 && (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-3">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2">Awards & Honors</span>
          <div className="flex flex-wrap gap-2">
            {awards.map((award, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-xs font-semibold text-yellow-400">{award}</span>
            ))}
          </div>
        </div>
      )}

      {/* Camps Attended */}
      {camps.length > 0 && (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2">Camps Attended</span>
          <div className="flex flex-wrap gap-2">
            {camps.map((camp, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">{camp}</span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
