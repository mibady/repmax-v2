"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useShortlist } from '@/lib/hooks';
import type { Tables } from '@/types/database';

type Athlete = Tables<"athletes"> & {
  profile: Pick<Tables<"profiles">, "full_name" | "avatar_url"> | null;
};

interface CompareAthlete {
  id: string;
  name: string;
  position: string;
  classYear: string;
  rating: number;
  imageUrl: string;
  isOnline?: boolean;
  stats: {
    height: string;
    weight: string;
    wingspan: string;
    fortyYard: string;
    benchPress: string;
    verticalJump: string;
    shuttleRun: string;
    gpa: string;
    eligibility: 'Eligible' | 'Pending' | 'Ineligible';
    stateRank: string;
  };
  highlights?: {
    height?: boolean;
    weight?: boolean;
    wingspan?: boolean;
    fortyYard?: boolean;
    benchPress?: boolean;
    verticalJump?: boolean;
    shuttleRun?: boolean;
    gpa?: boolean;
    stateRank?: boolean;
  };
}

function formatHeight(inches: number | null): string {
  if (!inches) return '--';
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
}

function formatWeight(lbs: number | null): string {
  if (!lbs) return '--';
  return `${lbs} lbs`;
}

function formatFortyYard(time: number | null): string {
  if (!time) return '--';
  return `${time.toFixed(2)}s`;
}

function formatVertical(inches: number | null): string {
  if (!inches) return '--';
  return `${inches}"`;
}

function formatGpa(gpa: number | null): string {
  if (!gpa) return '--';
  return gpa.toFixed(1);
}

function getClassYearLabel(year: number): string {
  const currentYear = new Date().getFullYear();
  const diff = year - currentYear;
  if (diff <= 0) return 'Senior';
  if (diff === 1) return 'Junior';
  if (diff === 2) return 'Sophomore';
  return 'Freshman';
}

function athleteToCompare(athlete: Athlete): CompareAthlete {
  const name = athlete.profile?.full_name || 'Unknown Athlete';
  const imageUrl = athlete.profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1F1F22&color=D4AF37&size=160`;

  return {
    id: athlete.id,
    name,
    position: athlete.primary_position || 'ATH',
    classYear: getClassYearLabel(athlete.class_year),
    rating: athlete.star_rating || 0,
    imageUrl,
    stats: {
      height: formatHeight(athlete.height_inches),
      weight: formatWeight(athlete.weight_lbs),
      wingspan: '--', // Not in current schema
      fortyYard: formatFortyYard(athlete.forty_yard_time),
      benchPress: '--', // Not in current schema
      verticalJump: formatVertical(athlete.vertical_inches),
      shuttleRun: '--', // Not in current schema
      gpa: formatGpa(athlete.gpa),
      eligibility: athlete.ncaa_cleared ? 'Eligible' : 'Pending',
      stateRank: '--', // Not in current schema
    },
    highlights: {},
  };
}

function calculateHighlights(athletes: CompareAthlete[]): CompareAthlete[] {
  if (athletes.length < 2) return athletes;

  // Find best values for numeric stats
  const metrics = ['height', 'weight', 'fortyYard', 'verticalJump', 'gpa'] as const;

  return athletes.map(athlete => {
    const highlights: CompareAthlete['highlights'] = {};

    metrics.forEach(metric => {
      const value = athlete.stats[metric];
      if (value === '--') return;

      const numericValue = parseFloat(value.replace(/[^\d.]/g, ''));
      if (isNaN(numericValue)) return;

      const allValues = athletes
        .map(a => {
          const v = a.stats[metric];
          if (v === '--') return null;
          return parseFloat(v.replace(/[^\d.]/g, ''));
        })
        .filter((v): v is number => v !== null);

      // For forty yard, lower is better
      if (metric === 'fortyYard') {
        if (numericValue === Math.min(...allValues)) {
          highlights[metric] = true;
        }
      } else {
        // For everything else, higher is better
        if (numericValue === Math.max(...allValues)) {
          highlights[metric] = true;
        }
      }
    });

    return { ...athlete, highlights };
  });
}

function renderStars(rating: number) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center justify-center gap-0.5 mt-2 text-[#D4AF37]">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="material-symbols-outlined icon-filled text-[16px]">star</span>
      ))}
      {hasHalf && (
        <span className="material-symbols-outlined text-[16px]">star_half</span>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="material-symbols-outlined text-[16px]">star_outline</span>
      ))}
      <span className="ml-1 text-xs text-white font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

function getEligibilityColor(eligibility: string) {
  switch (eligibility) {
    case 'Eligible':
      return 'text-green-400';
    case 'Pending':
      return 'text-yellow-500';
    case 'Ineligible':
      return 'text-red-400';
    default:
      return 'text-white';
  }
}

function LoadingSkeleton() {
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="relative rounded-xl border border-[#2A2A2E] bg-[#1F1F22] overflow-hidden shadow-2xl p-8">
          <div className="flex items-center justify-center gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-4 animate-pulse">
                <div className="w-20 h-20 rounded-full bg-gray-700"></div>
                <div className="h-4 w-24 bg-gray-700 rounded"></div>
                <div className="h-3 w-16 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-700/50 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="bg-[#1F1F22] p-4 rounded-full inline-block mb-4">
          <span className="material-symbols-outlined text-[#D4AF37] text-4xl">compare</span>
        </div>
        <h3 className="text-white text-xl font-bold mb-2">No Athletes to Compare</h3>
        <p className="text-gray-400 mb-6">
          Add athletes from your recruiting board to start comparing their stats side by side.
        </p>
        <Link
          href="/recruiter/board"
          className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-6 py-3 text-sm font-bold text-[#050505] hover:bg-yellow-500 transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">group</span>
          Go to Recruiting Board
        </Link>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const { shortlist, isLoading } = useShortlist();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Convert shortlist athletes to compare format
  const availableAthletes = shortlist.map(item => athleteToCompare(item.athlete as unknown as Athlete));

  // Get selected athletes for comparison (default to first 3 if none selected)
  const athletesToCompare = selectedIds.length > 0
    ? availableAthletes.filter(a => selectedIds.includes(a.id))
    : availableAthletes.slice(0, 3);

  // Calculate highlights for comparison
  const athletesWithHighlights = calculateHighlights(athletesToCompare);

  const toggleAthleteSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 4) {
        return prev; // Max 4 athletes
      }
      return [...prev, id];
    });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (availableAthletes.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-white tracking-tight">Compare Athletes</h1>
          <p className="text-gray-400 text-sm">
            Comparing {athletesWithHighlights.length} athlete{athletesWithHighlights.length !== 1 ? 's' : ''} from your recruiting board
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-[#2A2A2E] bg-[#1F1F22] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2A2A2E] transition-colors">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export Data
          </button>
          <Link
            href="/recruiter/board"
            className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-bold text-[#050505] hover:bg-yellow-500 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Add Athlete
          </Link>
        </div>
      </div>

      {/* Athlete Selector */}
      {availableAthletes.length > 3 && (
        <div className="py-4 mb-4 border-b border-[#2A2A2E] bg-[#1F1F22] rounded-lg px-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Select athletes to compare (max 4)</p>
          <div className="flex flex-wrap gap-2">
            {availableAthletes.map(athlete => (
              <button
                key={athlete.id}
                onClick={() => toggleAthleteSelection(athlete.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedIds.includes(athlete.id) || (selectedIds.length === 0 && athletesToCompare.some(a => a.id === athlete.id))
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : 'bg-[#2A2A2E] text-white hover:bg-[#3A3A3E]'
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url("${athlete.imageUrl}")` }}
                ></div>
                {athlete.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Table Area */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="relative rounded-xl border border-[#2A2A2E] bg-[#1F1F22] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[#151517]">
                    {/* Sticky Corner Header */}
                    <th className="sticky left-0 z-30 w-[240px] min-w-[240px] bg-[#151517] p-4 text-left border-b border-r border-[#2A2A2E] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Metrics</div>
                    </th>
                    {/* Athlete Headers */}
                    {athletesWithHighlights.map((athlete) => (
                      <th key={athlete.id} className="w-[280px] min-w-[280px] p-4 border-b border-r border-[#2A2A2E] align-top bg-[#1F1F22]">
                        <Link href={`/athlete/${athlete.id}`} className="flex flex-col items-center gap-3 group">
                          <div className="relative">
                            <div
                              className="size-20 rounded-full bg-cover bg-center border-2 border-[#2A2A2E] group-hover:border-[#D4AF37] transition-colors"
                              style={{ backgroundImage: `url("${athlete.imageUrl}")` }}
                            ></div>
                          </div>
                          <div className="text-center">
                            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-[#D4AF37] transition-colors">{athlete.name}</h3>
                            <div className="flex items-center justify-center gap-2 mt-1">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2A2A2E] text-gray-300 uppercase tracking-wide">{athlete.position}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2A2A2E] text-gray-300 uppercase tracking-wide">{athlete.classYear}</span>
                            </div>
                            {renderStars(athlete.rating)}
                          </div>
                        </Link>
                      </th>
                    ))}
                    {/* Add New Header */}
                    {athletesWithHighlights.length < 4 && (
                      <th className="w-[240px] min-w-[240px] p-4 border-b border-[#2A2A2E] align-middle bg-[#151517]">
                        <Link
                          href="/recruiter/board"
                          className="flex flex-col items-center justify-center h-full min-h-[140px] rounded-lg border-2 border-dashed border-[#2A2A2E] bg-transparent group hover:border-[#D4AF37]/50 hover:bg-[#1F1F22] transition-all cursor-pointer"
                        >
                          <div className="size-10 rounded-full bg-[#2A2A2E] flex items-center justify-center text-gray-400 group-hover:text-[#D4AF37] transition-colors mb-2">
                            <span className="material-symbols-outlined">add</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors">Add Athlete</span>
                        </Link>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2E] bg-[#1F1F22]">
                  {/* Section: Physical Attributes */}
                  <tr className="bg-[#252529]">
                    <td className="sticky left-0 z-10 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-[#252529] border-r border-[#2A2A2E] shadow-[4px_0_10px_rgba(0,0,0,0.2)]" colSpan={athletesWithHighlights.length + 2}>
                      Physical Attributes
                    </td>
                  </tr>
                  <tr className="group hover:bg-[#252529] transition-colors">
                    <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">Height</td>
                    {athletesWithHighlights.map((athlete) => (
                      <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${athlete.highlights?.height ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-white'}`}>
                        {athlete.stats.height}
                      </td>
                    ))}
                    {athletesWithHighlights.length < 4 && (
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    )}
                  </tr>
                  <tr className="group hover:bg-[#252529] transition-colors">
                    <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">Weight</td>
                    {athletesWithHighlights.map((athlete) => (
                      <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${athlete.highlights?.weight ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-white'}`}>
                        {athlete.stats.weight}
                      </td>
                    ))}
                    {athletesWithHighlights.length < 4 && (
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    )}
                  </tr>
                  <tr className="group hover:bg-[#252529] transition-colors">
                    <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">Wingspan</td>
                    {athletesWithHighlights.map((athlete) => (
                      <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${athlete.highlights?.wingspan ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-white'}`}>
                        {athlete.stats.wingspan}
                      </td>
                    ))}
                    {athletesWithHighlights.length < 4 && (
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    )}
                  </tr>

                  {/* Section: Combine Stats */}
                  <tr className="bg-[#252529]">
                    <td className="sticky left-0 z-10 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-[#252529] border-r border-[#2A2A2E] shadow-[4px_0_10px_rgba(0,0,0,0.2)]" colSpan={athletesWithHighlights.length + 2}>
                      Combine Performance
                    </td>
                  </tr>
                  <tr className="group hover:bg-[#252529] transition-colors">
                    <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">40-Yard Dash</td>
                    {athletesWithHighlights.map((athlete) => (
                      <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${athlete.highlights?.fortyYard ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-white'}`}>
                        {athlete.stats.fortyYard}
                      </td>
                    ))}
                    {athletesWithHighlights.length < 4 && (
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    )}
                  </tr>
                  <tr className="group hover:bg-[#252529] transition-colors">
                    <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">Bench Press (225)</td>
                    {athletesWithHighlights.map((athlete) => (
                      <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${athlete.highlights?.benchPress ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-white'}`}>
                        {athlete.stats.benchPress}
                      </td>
                    ))}
                    {athletesWithHighlights.length < 4 && (
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    )}
                  </tr>
                  <tr className="group hover:bg-[#252529] transition-colors">
                    <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">Vertical Jump</td>
                    {athletesWithHighlights.map((athlete) => (
                      <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${athlete.highlights?.verticalJump ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-white'}`}>
                        {athlete.stats.verticalJump}
                      </td>
                    ))}
                    {athletesWithHighlights.length < 4 && (
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    )}
                  </tr>
                  <tr className="group hover:bg-[#252529] transition-colors">
                    <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">Shuttle Run</td>
                    {athletesWithHighlights.map((athlete) => (
                      <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${athlete.highlights?.shuttleRun ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-white'}`}>
                        {athlete.stats.shuttleRun}
                      </td>
                    ))}
                    {athletesWithHighlights.length < 4 && (
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    )}
                  </tr>

                  {/* Section: Academics & Others */}
                  <tr className="bg-[#252529]">
                    <td className="sticky left-0 z-10 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-[#252529] border-r border-[#2A2A2E] shadow-[4px_0_10px_rgba(0,0,0,0.2)]" colSpan={athletesWithHighlights.length + 2}>
                      Academics &amp; Status
                    </td>
                  </tr>
                  <tr className="group hover:bg-[#252529] transition-colors">
                    <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">GPA</td>
                    {athletesWithHighlights.map((athlete) => (
                      <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${athlete.highlights?.gpa ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-white'}`}>
                        {athlete.stats.gpa}
                      </td>
                    ))}
                    {athletesWithHighlights.length < 4 && (
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    )}
                  </tr>
                  <tr className="group hover:bg-[#252529] transition-colors">
                    <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">NCAA Eligibility</td>
                    {athletesWithHighlights.map((athlete) => (
                      <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${getEligibilityColor(athlete.stats.eligibility)}`}>
                        {athlete.stats.eligibility}
                      </td>
                    ))}
                    {athletesWithHighlights.length < 4 && (
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    )}
                  </tr>
                  <tr className="group hover:bg-[#252529] transition-colors">
                    <td className="sticky left-0 z-10 p-4 text-sm font-medium text-gray-300 border-r border-[#2A2A2E] bg-[#1F1F22] group-hover:bg-[#252529] shadow-[4px_0_24px_rgba(0,0,0,0.4)]">State Rank</td>
                    {athletesWithHighlights.map((athlete) => (
                      <td key={athlete.id} className={`p-4 text-center font-mono text-sm border-r border-[#2A2A2E] ${athlete.highlights?.stateRank ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-white'}`}>
                        {athlete.stats.stateRank}
                      </td>
                    ))}
                    {athletesWithHighlights.length < 4 && (
                      <td className="p-4 border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    )}
                  </tr>

                  {/* Empty spacer row for visual bottom padding */}
                  <tr className="h-20">
                    <td className="sticky left-0 z-10 bg-[#1F1F22] border-r border-[#2A2A2E] shadow-[4px_0_24px_rgba(0,0,0,0.4)]"></td>
                    {athletesWithHighlights.map((athlete) => (
                      <td key={athlete.id} className="border-r border-[#2A2A2E]"></td>
                    ))}
                    {athletesWithHighlights.length < 4 && (
                      <td className="border-l border-dashed border-[#2A2A2E] bg-[#151517]"></td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - Data source: RepMax Database</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 12px;
          width: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1F1F22;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2A2A2E;
          border-radius: 6px;
          border: 3px solid #1F1F22;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #45454a;
        }
        .icon-filled {
          font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
}
