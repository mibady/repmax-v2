'use client';

import { useState, useMemo } from "react";
import { useShortlist, type PipelineStatus } from "@/lib/hooks";
import type { Tables } from "@/types/database";
import Link from "next/link";

type ShortlistItem = Tables<"shortlists"> & {
  athlete: Tables<"athletes"> & {
    profile: Pick<Tables<"profiles">, "full_name" | "avatar_url"> | null;
  };
};

interface ProspectCard {
  id: string;
  athleteId: string;
  name: string;
  school: string;
  position: string;
  classYear: number;
  zone: string | null;
  stars: number;
  avatar: string;
  lastActivity: string;
  status?: string;
  isPriority?: boolean;
  notes?: string | null;
  pipelineStatus: PipelineStatus;
}

interface PipelineColumn {
  id: PipelineStatus;
  title: string;
  color: string;
  bgColor: string;
  textColor: string;
  count: number;
  prospects: ProspectCard[];
}

const COLUMN_CONFIG: Array<{
  id: PipelineStatus;
  title: string;
  color: string;
  bgColor: string;
  textColor: string;
}> = [
  {
    id: 'identified',
    title: 'Identified',
    color: 'border-gray-600',
    bgColor: 'bg-gray-500/20',
    textColor: 'text-gray-300',
  },
  {
    id: 'contacted',
    title: 'Contacted',
    color: 'border-blue-600',
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
  },
  {
    id: 'evaluating',
    title: 'Evaluating',
    color: 'border-purple-600',
    bgColor: 'bg-purple-500/20',
    textColor: 'text-purple-400',
  },
  {
    id: 'visit_scheduled',
    title: 'Visit Scheduled',
    color: 'border-orange-600',
    bgColor: 'bg-orange-500/20',
    textColor: 'text-orange-400',
  },
  {
    id: 'offered',
    title: 'Offered',
    color: 'border-primary',
    bgColor: 'bg-primary/20',
    textColor: 'text-primary',
  },
  {
    id: 'committed',
    title: 'Committed',
    color: 'border-green-600',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
  },
];

function getPlaceholderAvatar(id: string): string {
  const colors = ['6366f1', 'd946ef', 'ec4899', 'f43f5e', 'f97316', 'eab308', '22c55e', '14b8a6', '06b6d4', '3b82f6'];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return `https://ui-avatars.com/api/?name=A&background=${colors[index]}&color=fff&size=128`;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function mapShortlistToProspects(shortlist: ShortlistItem[]): PipelineColumn[] {
  const columns: PipelineColumn[] = COLUMN_CONFIG.map(config => ({
    ...config,
    count: 0,
    prospects: [],
  }));

  shortlist.forEach(item => {
    const pipelineStatus = item.pipeline_status || 'identified';
    const column = columns.find(c => c.id === pipelineStatus);

    if (column) {
      const prospect: ProspectCard = {
        id: item.id,
        athleteId: item.athlete_id,
        name: item.athlete.profile?.full_name || 'Unknown Athlete',
        school: `${item.athlete.high_school}, ${item.athlete.state}`,
        position: item.athlete.primary_position,
        classYear: item.athlete.class_year,
        zone: item.athlete.zone,
        stars: item.athlete.star_rating || 3,
        avatar: item.athlete.profile?.avatar_url || getPlaceholderAvatar(item.athlete_id),
        lastActivity: formatTimeAgo(item.updated_at),
        isPriority: item.priority === 'top' || item.priority === 'high',
        notes: item.notes,
        status: item.notes || undefined,
        pipelineStatus,
      };
      column.prospects.push(prospect);
      column.count++;
    }
  });

  return columns;
}

// Extract unique filter options from shortlist data
function extractFilterOptions(shortlist: ShortlistItem[]) {
  const classYears = new Set<number>();
  const positions = new Set<string>();
  const zones = new Set<string>();

  shortlist.forEach(item => {
    if (item.athlete.class_year) {
      classYears.add(item.athlete.class_year);
    }
    if (item.athlete.primary_position) {
      positions.add(item.athlete.primary_position);
    }
    if (item.athlete.zone) {
      zones.add(item.athlete.zone);
    }
  });

  return {
    classYears: Array.from(classYears).sort((a, b) => a - b),
    positions: Array.from(positions).sort(),
    zones: Array.from(zones).sort(),
  };
}

// Filter shortlist based on selected filters
function filterShortlist(
  shortlist: ShortlistItem[],
  filters: { classYear: string; position: string; zone: string }
): ShortlistItem[] {
  return shortlist.filter(item => {
    // Filter by class year
    if (filters.classYear !== 'all') {
      const selectedYear = parseInt(filters.classYear, 10);
      if (item.athlete.class_year !== selectedYear) {
        return false;
      }
    }

    // Filter by position
    if (filters.position !== 'all') {
      if (item.athlete.primary_position !== filters.position) {
        return false;
      }
    }

    // Filter by zone
    if (filters.zone !== 'all') {
      if (item.athlete.zone !== filters.zone) {
        return false;
      }
    }

    return true;
  });
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 text-primary text-[10px]">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          star
        </span>
      ))}
    </div>
  );
}

function ProspectCardComponent({
  prospect,
  columnId,
  onStatusChange,
}: {
  prospect: ProspectCard;
  columnId: string;
  onStatusChange: (athleteId: string, newStatus: PipelineStatus) => void;
}) {
  const isOffered = columnId === 'offered';
  const isCommitted = columnId === 'committed';
  const hoverBorderColor = {
    contacted: 'hover:border-blue-500/30',
    evaluating: 'hover:border-purple-500/30',
    visit_scheduled: 'hover:border-orange-500/30',
    offered: 'hover:border-primary/40',
    committed: '',
  }[columnId] || '';

  const cardBorderClass = isOffered
    ? 'border-primary/40 shadow-[0_0_15px_-5px_rgba(242,204,13,0.15)]'
    : isCommitted
      ? 'border-green-500/50 opacity-80 hover:opacity-100'
      : 'border-white/5';

  // Get available status transitions
  const currentIndex = COLUMN_CONFIG.findIndex(c => c.id === columnId);
  const canMoveForward = currentIndex < COLUMN_CONFIG.length - 1;
  const canMoveBack = currentIndex > 0;
  const nextStatus = canMoveForward ? COLUMN_CONFIG[currentIndex + 1] : null;
  const prevStatus = canMoveBack ? COLUMN_CONFIG[currentIndex - 1] : null;

  return (
    <div className={`bg-[#141414] hover:bg-[#1c1c1c] border ${cardBorderClass} ${hoverBorderColor} rounded-lg p-3 cursor-pointer group transition-all shadow-sm relative`}>
      {prospect.isPriority && (
        <div className="absolute top-3 right-3 size-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
      )}

      <Link href={`/athlete/${prospect.athleteId}`}>
        <div className={`flex justify-between items-start mb-2 ${prospect.isPriority ? 'pr-4' : ''}`}>
          <div className="flex flex-col">
            <h4 className="font-bold text-white text-sm">{prospect.name}</h4>
            <p className="text-xs text-gray-500">{prospect.school}</p>
          </div>
          {!prospect.isPriority && <StarRating count={prospect.stars} />}
        </div>

        {prospect.isPriority && (
          <div className="mb-3">
            <StarRating count={prospect.stars} />
          </div>
        )}

        <div className="flex items-center gap-3 mt-3">
          <div
            className="bg-center bg-no-repeat bg-cover rounded-full size-8 border border-white/10"
            style={{ backgroundImage: `url("${prospect.avatar}")` }}
          />
          <span className="bg-white/5 text-gray-300 border border-white/5 text-[10px] px-2 py-1 rounded font-medium">
            {prospect.position}
          </span>
        </div>
      </Link>

      <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
        {isCommitted ? (
          <div className="flex items-center gap-1 text-green-400">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            <span className="font-mono text-[10px]">{prospect.status || 'Committed'}</span>
          </div>
        ) : prospect.status ? (
          <span className={`font-mono text-[10px] ${
            columnId === 'contacted' ? 'text-blue-400' :
            columnId === 'evaluating' ? 'text-purple-400' :
            columnId === 'visit_scheduled' ? 'text-orange-400' :
            columnId === 'offered' ? 'text-primary' :
            'text-gray-400'
          }`}>
            {prospect.status}
          </span>
        ) : (
          <span className="font-mono text-[10px] text-gray-500">{prospect.lastActivity}</span>
        )}
        <span className="font-mono text-[10px] text-gray-500">{prospect.lastActivity}</span>
      </div>

      {/* Status change buttons */}
      <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
        {prevStatus && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onStatusChange(prospect.athleteId, prevStatus.id);
            }}
            className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[12px]">arrow_back</span>
            {prevStatus.title}
          </button>
        )}
        {!prevStatus && <div />}
        {nextStatus && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onStatusChange(prospect.athleteId, nextStatus.id);
            }}
            className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-white transition-colors"
          >
            {nextStatus.title}
            <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex h-full gap-4 min-w-[1600px]">
      {COLUMN_CONFIG.map((column) => (
        <div
          key={column.id}
          className="flex flex-col w-72 flex-shrink-0 bg-[#0a0a0a] rounded-xl border border-white/5 h-full"
        >
          <div className={`p-3 border-t-4 ${column.color} rounded-t-xl bg-[#0a0a0a] flex items-center justify-between`}>
            <div className="h-4 w-20 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-5 w-8 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-[#141414] border border-white/5 rounded-lg p-3 animate-pulse">
                <div className="h-4 w-24 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 w-32 bg-gray-700 rounded mb-3"></div>
                <div className="flex items-center gap-3">
                  <div className="size-8 bg-gray-700 rounded-full"></div>
                  <div className="h-5 w-12 bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-20">
      <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">person_search</span>
      <h3 className="text-xl font-bold text-white mb-2">No Athletes in Pipeline</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        Start building your recruiting pipeline by adding athletes to your shortlist.
      </p>
      <Link
        href="/dashboard/recruiter/prospects"
        className="flex items-center gap-2 bg-primary hover:bg-[#d9b70b] text-[#050505] px-6 py-3 rounded-lg font-bold text-sm transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">search</span>
        Browse Athletes
      </Link>
    </div>
  );
}

export default function RecruiterPipelinePage() {
  const { shortlist, isLoading, updateStatus, isPending } = useShortlist();

  // Filter state
  const [classYearFilter, setClassYearFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  // Extract unique filter options from the full shortlist
  const filterOptions = useMemo(() => extractFilterOptions(shortlist), [shortlist]);

  // Apply filters to shortlist
  const filteredShortlist = useMemo(
    () => filterShortlist(shortlist, {
      classYear: classYearFilter,
      position: positionFilter,
      zone: zoneFilter,
    }),
    [shortlist, classYearFilter, positionFilter, zoneFilter]
  );

  const pipelineData = mapShortlistToProspects(filteredShortlist);
  const totalProspects = pipelineData.reduce((sum, col) => sum + col.count, 0);
  const totalUnfiltered = shortlist.length;

  const handleStatusChange = async (athleteId: string, newStatus: PipelineStatus) => {
    await updateStatus(athleteId, newStatus);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-white text-xl font-bold tracking-tight">Pipeline Dashboard</h1>
          <div className="h-4 w-px bg-white/10 mx-2"></div>
          <span className="text-gray-500 text-sm font-mono">
            {totalProspects} prospect{totalProspects !== 1 ? 's' : ''}
          </span>
          {isPending && (
            <span className="text-xs text-primary animate-pulse">Updating...</span>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {/* Class Filter */}
          <div className="relative">
            <select
              value={classYearFilter}
              onChange={(e) => setClassYearFilter(e.target.value)}
              className="appearance-none bg-[#141414] text-white pl-3 pr-10 py-2 rounded-lg text-sm border border-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors w-40"
            >
              <option value="all">All Classes</option>
              {filterOptions.classYears.map((year) => (
                <option key={year} value={year.toString()}>
                  Class of {year}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </div>
          </div>

          {/* Position Filter */}
          <div className="relative">
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="appearance-none bg-[#141414] text-white pl-3 pr-10 py-2 rounded-lg text-sm border border-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors w-40"
            >
              <option value="all">All Positions</option>
              {filterOptions.positions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </div>
          </div>

          {/* Zone Filter */}
          <div className="relative">
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="appearance-none bg-[#141414] text-white pl-3 pr-10 py-2 rounded-lg text-sm border border-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors w-40"
            >
              <option value="all">All Zones</option>
              {filterOptions.zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </div>
          </div>

          {/* Filter indicator */}
          {(classYearFilter !== 'all' || positionFilter !== 'all' || zoneFilter !== 'all') && (
            <button
              onClick={() => {
                setClassYearFilter('all');
                setPositionFilter('all');
                setZoneFilter('all');
              }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded border border-white/10 hover:border-white/20"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
              Clear filters ({totalUnfiltered - totalProspects} hidden)
            </button>
          )}
        </div>

        <Link
          href="/dashboard/recruiter/prospects"
          className="flex items-center gap-2 bg-primary hover:bg-[#d9b70b] text-[#050505] px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-primary/10"
        >
          <span className="material-symbols-outlined text-[20px] font-bold">add</span>
          Add Prospect
        </Link>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {isLoading ? (
          <LoadingSkeleton />
        ) : totalProspects === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex h-full gap-4 min-w-[1600px]">
            {pipelineData.map((column) => (
              <div
                key={column.id}
                className="flex flex-col w-72 flex-shrink-0 bg-[#0a0a0a] rounded-xl border border-white/5 h-full relative overflow-hidden"
              >
                {/* Gold glow for Offered column */}
                {column.id === 'offered' && (
                  <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
                )}

                {/* Column Header */}
                <div className={`p-3 border-t-4 ${column.color} rounded-t-xl bg-[#0a0a0a] flex items-center justify-between sticky top-0 z-10`}>
                  <h3 className={`font-semibold text-gray-200 text-sm tracking-wide ${column.id === 'offered' ? 'font-bold text-white' : ''}`}>
                    {column.title}
                  </h3>
                  <span className={`${column.bgColor} ${column.textColor} text-xs font-bold px-2 py-0.5 rounded-full`}>
                    {column.count}
                  </span>
                </div>

                {/* Column Content */}
                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-3 relative z-10" style={{ height: 'calc(100vh - 280px)' }}>
                  {column.prospects.map((prospect) => (
                    <ProspectCardComponent
                      key={prospect.id}
                      prospect={prospect}
                      columnId={column.id}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                  {column.prospects.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-600">
                      <span className="material-symbols-outlined text-2xl mb-2">inbox</span>
                      <p className="text-xs">No prospects</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
}
