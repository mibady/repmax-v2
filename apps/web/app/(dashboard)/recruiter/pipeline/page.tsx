'use client';

import { useState, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import { useRecruiterPipeline, type CrmStage, type PipelineEntry, useSubscription, useShortlist } from "@/lib/hooks";
import { getRecruiterTier } from "@/lib/utils/subscription-tier";
import Link from "next/link";
import { toast } from "sonner";

interface ProspectCard {
  id: string;
  athleteId: string;
  name: string;
  school: string;
  position: string;
  classYear: number;
  zone: string | null;
  state: string | null;
  stars: number;
  avatarUrl: string | null;
  lastActivity: string;
  isPriority: boolean;
  priority: string | null;
  notes: string | null;
  stage: CrmStage;
  sortOrder: number;
}

interface PipelineColumn {
  id: CrmStage;
  title: string;
  color: string;
  bgColor: string;
  textColor: string;
  count: number;
  prospects: ProspectCard[];
}

type SortMode = 'default' | 'name-asc' | 'name-desc' | 'stars-asc' | 'stars-desc' | 'class-asc' | 'class-desc';

const COLUMN_CONFIG: Array<{
  id: CrmStage;
  title: string;
  color: string;
  bgColor: string;
  textColor: string;
}> = [
  { id: 'identified', title: 'Identified', color: 'border-gray-600', bgColor: 'bg-gray-500/20', textColor: 'text-gray-300' },
  { id: 'contacted', title: 'Contacted', color: 'border-blue-600', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' },
  { id: 'evaluating', title: 'Evaluating', color: 'border-purple-600', bgColor: 'bg-purple-500/20', textColor: 'text-purple-400' },
  { id: 'visit_scheduled', title: 'Visit Scheduled', color: 'border-orange-600', bgColor: 'bg-orange-500/20', textColor: 'text-orange-400' },
  { id: 'offered', title: 'Offered', color: 'border-primary', bgColor: 'bg-primary/20', textColor: 'text-primary' },
  { id: 'committed', title: 'Committed', color: 'border-green-600', bgColor: 'bg-green-500/20', textColor: 'text-green-400' },
];

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

function sortProspects(prospects: ProspectCard[], sortMode: SortMode): ProspectCard[] {
  const sorted = [...prospects];
  switch (sortMode) {
    case 'name-asc': return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc': return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'stars-asc': return sorted.sort((a, b) => a.stars - b.stars);
    case 'stars-desc': return sorted.sort((a, b) => b.stars - a.stars);
    case 'class-asc': return sorted.sort((a, b) => a.classYear - b.classYear);
    case 'class-desc': return sorted.sort((a, b) => b.classYear - a.classYear);
    default: return sorted.sort((a, b) => a.sortOrder - b.sortOrder);
  }
}

function mapPipelineToColumns(entries: PipelineEntry[]): PipelineColumn[] {
  const columns: PipelineColumn[] = COLUMN_CONFIG.map(config => ({
    ...config,
    count: 0,
    prospects: [],
  }));

  entries.forEach(entry => {
    const column = columns.find(c => c.id === entry.stage);
    if (column) {
      const profile = Array.isArray(entry.athlete?.profile) ? entry.athlete.profile[0] : entry.athlete?.profile;
      const prospect: ProspectCard = {
        id: entry.id,
        athleteId: entry.athlete.id,
        name: profile?.full_name || 'Unknown Athlete',
        school: `${entry.athlete.high_school || 'Unknown'}, ${entry.athlete.state || ''}`.replace(/, $/, ''),
        position: entry.athlete.primary_position,
        classYear: entry.athlete.class_year,
        zone: entry.athlete.zone,
        state: entry.athlete.state,
        stars: entry.athlete.star_rating || 0,
        avatarUrl: profile?.avatar_url || null,
        lastActivity: formatTimeAgo(entry.last_touch),
        isPriority: entry.priority === 'top' || entry.priority === 'high',
        priority: entry.priority,
        notes: entry.notes,
        stage: entry.stage,
        sortOrder: (entry as PipelineEntry & { sort_order?: number }).sort_order ?? 0,
      };
      column.prospects.push(prospect);
      column.count++;
    }
  });

  return columns;
}

function extractFilterOptions(entries: PipelineEntry[]) {
  const classYears = new Set<number>();
  const positions = new Set<string>();
  const zones = new Set<string>();
  entries.forEach(entry => {
    if (entry.athlete.class_year) classYears.add(entry.athlete.class_year);
    if (entry.athlete.primary_position) positions.add(entry.athlete.primary_position);
    if (entry.athlete.zone) zones.add(entry.athlete.zone);
  });
  return {
    classYears: Array.from(classYears).sort((a, b) => a - b),
    positions: Array.from(positions).sort(),
    zones: Array.from(zones).sort(),
  };
}

function filterPipeline(
  entries: PipelineEntry[],
  filters: { classYear: string; position: string; zone: string; search: string }
): PipelineEntry[] {
  return entries.filter(entry => {
    if (filters.classYear !== 'all' && entry.athlete.class_year !== parseInt(filters.classYear, 10)) return false;
    if (filters.position !== 'all' && entry.athlete.primary_position !== filters.position) return false;
    if (filters.zone !== 'all' && entry.athlete.zone !== filters.zone) return false;
    if (filters.search) {
      const profile = Array.isArray(entry.athlete?.profile) ? entry.athlete.profile[0] : entry.athlete?.profile;
      const name = (profile?.full_name || '').toLowerCase();
      const school = (entry.athlete.high_school || '').toLowerCase();
      const q = filters.search.toLowerCase();
      if (!name.includes(q) && !school.includes(q)) return false;
    }
    return true;
  });
}

// =============================================
// NOTE EDITOR (inline)
// =============================================
function NoteEditor({
  pipelineId,
  currentNote,
  onSave,
  onClose,
}: {
  pipelineId: string;
  currentNote: string | null;
  onSave: (pipelineId: string, notes: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(currentNote || '');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="mt-2 pt-2 border-t border-white/5" onClick={(e) => e.preventDefault()}>
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a note..."
        className="w-full bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 p-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
        rows={2}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            onSave(pipelineId, text);
            onClose();
          }
          if (e.key === 'Escape') onClose();
        }}
      />
      <div className="flex justify-between items-center mt-1">
        <span className="text-[9px] text-gray-600">⌘+Enter to save</span>
        <div className="flex gap-1">
          <button
            onClick={() => onClose()}
            className="text-[10px] text-gray-500 hover:text-white px-2 py-0.5 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(pipelineId, text); onClose(); }}
            className="text-[10px] text-primary hover:text-primary/80 font-bold px-2 py-0.5 rounded transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================
// SORT MENU
// =============================================
function SortMenu({ sortMode, onSort }: { sortMode: SortMode; onSort: (mode: SortMode) => void }) {
  const [open, setOpen] = useState(false);
  const options: { value: SortMode; label: string; icon: string }[] = [
    { value: 'default', label: 'Default', icon: 'sort' },
    { value: 'name-asc', label: 'Name A→Z', icon: 'sort_by_alpha' },
    { value: 'name-desc', label: 'Name Z→A', icon: 'sort_by_alpha' },
    { value: 'stars-desc', label: 'Rating ↓', icon: 'star' },
    { value: 'stars-asc', label: 'Rating ↑', icon: 'star' },
    { value: 'class-asc', label: 'Class ↑', icon: 'school' },
    { value: 'class-desc', label: 'Class ↓', icon: 'school' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`p-1 rounded hover:bg-white/10 transition-colors ${sortMode !== 'default' ? 'text-primary' : 'text-gray-500'}`}
        title="Sort column"
      >
        <span className="material-symbols-outlined text-[16px]">swap_vert</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-[#1a1a1d] border border-white/10 rounded-lg shadow-xl z-40 py-1 min-w-[140px]">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onSort(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-white/5 transition-colors ${
                  sortMode === opt.value ? 'text-primary font-bold' : 'text-gray-400'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// =============================================
// PROSPECT CARD — Visual, photo-prominent
// =============================================
function ProspectCardComponent({
  prospect,
  columnId,
  onStageChange,
  onNoteEdit,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isViewOnly = false,
  isBookmarked = false,
  onToggleBookmark,
  editingNoteId,
  onNoteSave,
  onNoteClose,
}: {
  prospect: ProspectCard;
  columnId: string;
  onStageChange: (pipelineId: string, newStage: CrmStage) => void;
  onNoteEdit: (pipelineId: string) => void;
  onMoveUp: (pipelineId: string) => void;
  onMoveDown: (pipelineId: string) => void;
  isFirst: boolean;
  isLast: boolean;
  isViewOnly?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: (athleteId: string) => void;
  editingNoteId: string | null;
  onNoteSave: (pipelineId: string, notes: string) => void;
  onNoteClose: () => void;
}) {
  const isOffered = columnId === 'offered';
  const isCommitted = columnId === 'committed';

  const cardBorderClass = isOffered
    ? 'border-primary/40 shadow-[0_0_15px_-5px_rgba(242,204,13,0.15)]'
    : isCommitted
      ? 'border-green-500/50'
      : 'border-white/5';

  const currentIndex = COLUMN_CONFIG.findIndex(c => c.id === columnId);
  const canMoveForward = currentIndex < COLUMN_CONFIG.length - 1;
  const canMoveBack = currentIndex > 0;
  const nextStatus = canMoveForward ? COLUMN_CONFIG[currentIndex + 1] : null;
  const prevStatus = canMoveBack ? COLUMN_CONFIG[currentIndex - 1] : null;

  const initials = prospect.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  const priorityColors: Record<string, string> = {
    top: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-blue-500',
    low: 'bg-gray-500',
  };

  return (
    <div className={`bg-[#141414] hover:bg-[#1c1c1c] border ${cardBorderClass} rounded-xl overflow-hidden cursor-pointer group transition-all shadow-sm`}>
      {/* Top: Photo + Identity */}
      <Link href={`/card/${prospect.athleteId}`} className="block">
        <div className="flex gap-3 p-3">
          {/* Large Photo */}
          <div className="relative flex-shrink-0">
            {prospect.avatarUrl ? (
              <Image
                src={prospect.avatarUrl}
                alt={prospect.name}
                width={56}
                height={56}
                className="rounded-lg object-cover size-14 border border-white/10"
              />
            ) : (
              <div className="size-14 rounded-lg bg-gradient-to-br from-primary/30 to-purple-600/30 border border-white/10 flex items-center justify-center">
                <span className="text-lg font-bold text-white/60">{initials}</span>
              </div>
            )}
            {/* Priority dot */}
            {prospect.isPriority && (
              <div className={`absolute -top-1 -right-1 size-3 ${priorityColors[prospect.priority || 'high']} rounded-full ring-2 ring-[#141414] animate-pulse`} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <h4 className="font-bold text-white text-sm truncate">{prospect.name}</h4>
              {/* Stars — compact */}
              <div className="flex gap-0.5 flex-shrink-0">
                {Array.from({ length: Math.min(prospect.stars, 5) }).map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-primary text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-gray-500 truncate">{prospect.school}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="bg-white/5 text-gray-300 border border-white/5 text-[10px] px-1.5 py-0.5 rounded font-bold">
                {prospect.position}
              </span>
              <span className="text-[10px] text-gray-600 font-mono">&apos;{String(prospect.classYear).slice(-2)}</span>
              {prospect.zone && (
                <span className="text-[10px] text-purple-400/70 truncate">{prospect.zone}</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Note display */}
      {prospect.notes && editingNoteId !== prospect.id && (
        <div
          className="mx-3 mb-2 bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-white/10 transition-colors"
          onClick={(e) => { e.preventDefault(); if (!isViewOnly) onNoteEdit(prospect.id); }}
        >
          <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{prospect.notes}</p>
        </div>
      )}

      {/* Note editor */}
      {editingNoteId === prospect.id && (
        <div className="mx-3 mb-2">
          <NoteEditor
            pipelineId={prospect.id}
            currentNote={prospect.notes}
            onSave={onNoteSave}
            onClose={onNoteClose}
          />
        </div>
      )}

      {/* Footer: time + actions */}
      <div className="px-3 pb-2 flex justify-between items-center">
        <span className="font-mono text-[10px] text-gray-600">{prospect.lastActivity}</span>

        {/* Action buttons — visible on hover */}
        {!isViewOnly && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Bookmark / shortlist for compare */}
            {onToggleBookmark && (
              <button
                onClick={(e) => { e.preventDefault(); onToggleBookmark(prospect.athleteId); }}
                className={`p-1 rounded hover:bg-white/10 transition-colors ${isBookmarked ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
                title={isBookmarked ? 'Remove from Compare list' : 'Add to Compare list'}
              >
                <span className="material-symbols-outlined text-[14px]" style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}>bookmark</span>
              </button>
            )}
            {/* Add/edit note */}
            <button
              onClick={(e) => { e.preventDefault(); onNoteEdit(prospect.id); }}
              className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-primary transition-colors"
              title="Add note"
            >
              <span className="material-symbols-outlined text-[14px]">edit_note</span>
            </button>
            {/* Move up */}
            {!isFirst && (
              <button
                onClick={(e) => { e.preventDefault(); onMoveUp(prospect.id); }}
                className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                title="Move up"
              >
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              </button>
            )}
            {/* Move down */}
            {!isLast && (
              <button
                onClick={(e) => { e.preventDefault(); onMoveDown(prospect.id); }}
                className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                title="Move down"
              >
                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
              </button>
            )}
            {/* Stage back */}
            {prevStatus && (
              <button
                onClick={(e) => { e.preventDefault(); onStageChange(prospect.id, prevStatus.id); }}
                className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                title={`Move to ${prevStatus.title}`}
              >
                <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              </button>
            )}
            {/* Stage forward */}
            {nextStatus && (
              <button
                onClick={(e) => { e.preventDefault(); onStageChange(prospect.id, nextStatus.id); }}
                className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                title={`Move to ${nextStatus.title}`}
              >
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex h-full gap-3 min-w-[1600px]">
      {COLUMN_CONFIG.map((column) => (
        <div key={column.id} className="flex flex-col w-72 flex-shrink-0 bg-[#0a0a0a] rounded-xl border border-white/5 h-full">
          <div className={`p-3 border-t-4 ${column.color} rounded-t-xl flex items-center justify-between`}>
            <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
            <div className="h-5 w-8 bg-gray-700 rounded-full animate-pulse" />
          </div>
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
            {[1, 2].map((i) => (
              <div key={i} className="bg-[#141414] border border-white/5 rounded-xl p-3 animate-pulse">
                <div className="flex gap-3">
                  <div className="size-14 bg-gray-700 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-700 rounded mb-2" />
                    <div className="h-3 w-32 bg-gray-700 rounded mb-2" />
                    <div className="h-4 w-12 bg-gray-700 rounded" />
                  </div>
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
        href="/recruiter/prospects"
        className="flex items-center gap-2 bg-primary hover:bg-[#d9b70b] text-[#050505] px-6 py-3 rounded-lg font-bold text-sm transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">search</span>
        Browse Athletes
      </Link>
    </div>
  );
}

export default function RecruiterPipelinePage() {
  const { pipeline, isLoading, moveToStage, updateNotes, reorderInColumn } = useRecruiterPipeline();
  const { subscription, isLoading: subLoading } = useSubscription();
  const { add: addToShortlist, remove: removeFromShortlist, isInShortlist } = useShortlist();
  const tier = getRecruiterTier(subscription?.plan?.slug);
  const isViewOnly = tier === 'free';

  const [classYearFilter, setClassYearFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [columnSorts, setColumnSorts] = useState<Record<string, SortMode>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const [draggedPipelineId, setDraggedPipelineId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const filterOptions = useMemo(() => extractFilterOptions(pipeline), [pipeline]);

  const filteredPipeline = useMemo(
    () => filterPipeline(pipeline, {
      classYear: classYearFilter,
      position: positionFilter,
      zone: zoneFilter,
      search: searchQuery,
    }),
    [pipeline, classYearFilter, positionFilter, zoneFilter, searchQuery]
  );

  const handleStageChange = useCallback(async (pipelineId: string, newStage: CrmStage) => {
    await moveToStage(pipelineId, newStage);
  }, [moveToStage]);

  const handleToggleBookmark = useCallback(async (athleteId: string) => {
    if (isInShortlist(athleteId)) {
      await removeFromShortlist(athleteId);
      toast.success('Removed from Compare list');
    } else {
      await addToShortlist(athleteId);
      toast.success('Added to Compare list');
    }
  }, [isInShortlist, addToShortlist, removeFromShortlist]);

  const handleNoteSave = useCallback(async (pipelineId: string, notes: string) => {
    if (updateNotes) {
      await updateNotes(pipelineId, notes);
      toast.success('Note saved');
    }
  }, [updateNotes]);

  const handleMoveUp = useCallback((pipelineId: string) => {
    if (reorderInColumn) reorderInColumn(pipelineId, -1);
  }, [reorderInColumn]);

  const handleMoveDown = useCallback((pipelineId: string) => {
    if (reorderInColumn) reorderInColumn(pipelineId, 1);
  }, [reorderInColumn]);

  const handleDragStart = (e: React.DragEvent, pipelineId: string) => {
    e.dataTransfer.setData("text/plain", pipelineId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedPipelineId(pipelineId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumnId(columnId);
  };

  const handleDragLeave = () => setDragOverColumnId(null);

  const handleDrop = async (e: React.DragEvent, columnStage: CrmStage) => {
    e.preventDefault();
    const pipelineId = e.dataTransfer.getData("text/plain");
    setDraggedPipelineId(null);
    setDragOverColumnId(null);
    if (pipelineId) await handleStageChange(pipelineId, columnStage);
  };

  const handleDragEnd = () => {
    setDraggedPipelineId(null);
    setDragOverColumnId(null);
  };

  if (isLoading || subLoading) {
    return <div className="flex flex-col h-full min-h-0"><LoadingSkeleton /></div>;
  }

  const pipelineData = mapPipelineToColumns(filteredPipeline);
  const totalProspects = pipelineData.reduce((sum, col) => sum + col.count, 0);
  const totalUnfiltered = pipeline.length;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Free-tier upgrade banner */}
      {!subLoading && isViewOnly && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4 flex items-center justify-between">
          <span className="text-sm text-primary">Free tier — view-only pipeline. Upgrade to manage prospects.</span>
          <a href="/pricing" className="text-xs font-bold text-primary hover:underline">Upgrade</a>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-white text-xl font-bold tracking-tight">Pipeline Dashboard</h1>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <span className="text-gray-500 text-sm font-mono">
            {totalProspects} prospect{totalProspects !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-[18px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or school..."
              className="bg-[#141414] text-white pl-9 pr-3 py-2 rounded-lg text-sm border border-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-primary transition-colors w-52"
            />
          </div>

          {/* Class Filter */}
          <div className="relative">
            <select
              value={classYearFilter}
              onChange={(e) => setClassYearFilter(e.target.value)}
              className="appearance-none bg-[#141414] text-white pl-3 pr-8 py-2 rounded-lg text-sm border border-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors w-32"
            >
              <option value="all">All Classes</option>
              {filterOptions.classYears.map((year) => (
                <option key={year} value={year.toString()}>Class of {year}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </div>
          </div>

          {/* Position Filter */}
          <div className="relative">
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="appearance-none bg-[#141414] text-white pl-3 pr-8 py-2 rounded-lg text-sm border border-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors w-32"
            >
              <option value="all">All Positions</option>
              {filterOptions.positions.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </div>
          </div>

          {/* Zone Filter */}
          <div className="relative">
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="appearance-none bg-[#141414] text-white pl-3 pr-8 py-2 rounded-lg text-sm border border-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors w-32"
            >
              <option value="all">All Zones</option>
              {filterOptions.zones.map((zone) => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </div>
          </div>

          {/* Clear filters */}
          {(classYearFilter !== 'all' || positionFilter !== 'all' || zoneFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setClassYearFilter('all');
                setPositionFilter('all');
                setZoneFilter('all');
                setSearchQuery('');
              }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded border border-white/10 hover:border-white/20"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
              Clear ({totalUnfiltered - totalProspects} hidden)
            </button>
          )}
        </div>

        {!isViewOnly && (
          <Link
            href="/recruiter/prospects"
            className="flex items-center gap-2 bg-primary hover:bg-[#d9b70b] text-[#050505] px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-primary/10"
          >
            <span className="material-symbols-outlined text-[20px] font-bold">add</span>
            Add Prospect
          </Link>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {totalProspects === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex h-full gap-3 min-w-[1600px]">
            {pipelineData.map((column) => {
              const colSort = columnSorts[column.id] || 'default';
              const sortedProspects = sortProspects(column.prospects, colSort);

              return (
                <div
                  key={column.id}
                  className={`flex flex-col w-72 flex-shrink-0 bg-[#0a0a0a] rounded-xl border h-full relative overflow-hidden transition-all ${
                    dragOverColumnId === column.id
                      ? 'border-primary/60 ring-2 ring-primary/30'
                      : 'border-white/5'
                  }`}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  {/* Glow for Offered */}
                  {column.id === 'offered' && (
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                  )}

                  {/* Column Header */}
                  <div className={`p-3 border-t-4 ${column.color} rounded-t-xl bg-[#0a0a0a] flex items-center justify-between sticky top-0 z-10`}>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold text-gray-200 text-sm tracking-wide ${column.id === 'offered' ? 'font-bold text-white' : ''}`}>
                        {column.title}
                      </h3>
                      <span className={`${column.bgColor} ${column.textColor} text-xs font-bold px-2 py-0.5 rounded-full`}>
                        {column.count}
                      </span>
                    </div>
                    <SortMenu
                      sortMode={colSort}
                      onSort={(mode) => setColumnSorts(prev => ({ ...prev, [column.id]: mode }))}
                    />
                  </div>

                  {/* Column Content */}
                  <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 relative z-10" style={{ height: 'calc(100vh - 280px)' }}>
                    {sortedProspects.map((prospect, idx) => (
                      <div
                        key={prospect.id}
                        draggable={!isViewOnly}
                        onDragStart={isViewOnly ? undefined : (e) => handleDragStart(e, prospect.id)}
                        onDragEnd={isViewOnly ? undefined : handleDragEnd}
                        className={`transition-opacity ${draggedPipelineId === prospect.id ? 'opacity-40' : 'opacity-100'}`}
                      >
                        <ProspectCardComponent
                          prospect={prospect}
                          columnId={column.id}
                          onStageChange={handleStageChange}
                          onNoteEdit={(id) => setEditingNoteId(editingNoteId === id ? null : id)}
                          onMoveUp={handleMoveUp}
                          onMoveDown={handleMoveDown}
                          isFirst={idx === 0}
                          isLast={idx === sortedProspects.length - 1}
                          isViewOnly={isViewOnly}
                          isBookmarked={isInShortlist(prospect.athleteId)}
                          onToggleBookmark={handleToggleBookmark}
                          editingNoteId={editingNoteId}
                          onNoteSave={handleNoteSave}
                          onNoteClose={() => setEditingNoteId(null)}
                        />
                      </div>
                    ))}
                    {column.prospects.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-600">
                        <span className="material-symbols-outlined text-2xl mb-2">inbox</span>
                        <p className="text-xs">No prospects</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #444; }
      ` }} />
    </div>
  );
}
