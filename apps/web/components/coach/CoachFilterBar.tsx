'use client';

interface CoachFilterBarProps {
  filterPosition: string;
  filterClass: string;
  filterStatus: string;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  sortBy: string;
  onFilterChange: (filter: string, value: string) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: string) => void;
}

const positions = ['All', 'QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K/P', 'ATH'];
const classYears = ['All', '2025', '2026', '2027', '2028'];
const statuses = ['All', 'Active', 'Committed', 'Transferred', 'Graduated'];
const sortOptions = ['Name', 'Position', 'Class', 'GPA', 'Offers'];

export default function CoachFilterBar({
  filterPosition,
  filterClass,
  filterStatus,
  searchQuery,
  viewMode,
  sortBy,
  onFilterChange,
  onViewModeChange,
  onSearchChange,
  onSortChange,
}: CoachFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
          search
        </span>
        <input
          type="text"
          placeholder="Search athletes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#2A2A2E] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>

      {/* Position */}
      <select
        value={filterPosition}
        onChange={(e) => onFilterChange('position', e.target.value)}
        className="bg-[#2A2A2E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer"
      >
        {positions.map((pos) => (
          <option key={pos} value={pos}>
            {pos === 'All' ? 'All Positions' : pos}
          </option>
        ))}
      </select>

      {/* Class Year */}
      <select
        value={filterClass}
        onChange={(e) => onFilterChange('class', e.target.value)}
        className="bg-[#2A2A2E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer"
      >
        {classYears.map((year) => (
          <option key={year} value={year}>
            {year === 'All' ? 'All Classes' : `Class of ${year}`}
          </option>
        ))}
      </select>

      {/* Status */}
      <select
        value={filterStatus}
        onChange={(e) => onFilterChange('status', e.target.value)}
        className="bg-[#2A2A2E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s === 'All' ? 'All Statuses' : s}
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="bg-[#2A2A2E] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer"
      >
        {sortOptions.map((opt) => (
          <option key={opt} value={opt}>
            Sort: {opt}
          </option>
        ))}
      </select>

      {/* View Mode Toggle */}
      <div className="flex items-center bg-[#2A2A2E] border border-white/10 rounded-lg overflow-hidden">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`px-3 py-2 transition-colors ${
            viewMode === 'grid'
              ? 'bg-primary/20 text-primary'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Grid view"
        >
          <span className="material-symbols-outlined text-lg">grid_view</span>
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`px-3 py-2 transition-colors ${
            viewMode === 'list'
              ? 'bg-primary/20 text-primary'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label="List view"
        >
          <span className="material-symbols-outlined text-lg">view_list</span>
        </button>
      </div>
    </div>
  );
}
