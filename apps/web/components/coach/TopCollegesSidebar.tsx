'use client';

interface College {
  id: string;
  schoolName: string;
  temperature: 'Hot' | 'Warm' | 'Cold';
  prospectCount: number;
  scheduledVisits: number;
  notes?: string;
}

interface TopCollegesSidebarProps {
  colleges: College[];
}

const temperatureStyles: Record<College['temperature'], string> = {
  Hot: 'text-red-400 bg-red-400/10',
  Warm: 'text-amber-400 bg-amber-400/10',
  Cold: 'text-blue-400 bg-blue-400/10',
};

export default function TopCollegesSidebar({
  colleges,
}: TopCollegesSidebarProps) {
  return (
    <div className="bg-[#1F1F22] rounded-xl border border-white/5 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-lg">
            school
          </span>
          <h3 className="text-white font-semibold text-sm">Top Colleges</h3>
          <span className="bg-white/10 text-slate-400 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
            {colleges.length}
          </span>
        </div>
      </div>

      {/* College List */}
      <div className="space-y-2">
        {colleges.map((college) => (
          <div
            key={college.id}
            className="p-2.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-white font-medium truncate flex-1">
                {college.schoolName}
              </p>
              <span
                className={`text-[9px] font-medium px-2 py-0.5 rounded-full ml-2 ${temperatureStyles[college.temperature]}`}
              >
                {college.temperature}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">
                  person
                </span>
                {college.prospectCount} prospects
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">
                  event
                </span>
                {college.scheduledVisits} visits
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add College Button */}
      <button className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg py-2 transition-colors">
        <span className="material-symbols-outlined text-sm">add</span>
        Add College
      </button>

      {/* View All */}
      {colleges.length > 0 && (
        <button className="block w-full text-center text-xs text-primary hover:text-primary/80 mt-2 transition-colors">
          View All
        </button>
      )}
    </div>
  );
}
