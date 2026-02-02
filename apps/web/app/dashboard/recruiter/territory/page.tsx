"use client";

import Link from "next/link";
import { useState } from "react";
import { useMcpZones } from "@/lib/hooks";
import { useZoneAssignments, type AvailableRecruiter } from "@/lib/hooks/use-zone-assignments";
import { ZONE_COLORS, ZONE_DISPLAY_NAMES } from "@/lib/data/zone-data";
import type { ZoneCode, ZoneInfo } from "@/lib/data/zone-data";

interface ZoneAssignmentCardProps {
  zone: ZoneInfo;
  assignment?: { recruiter: string; imageUrl: string };
  availableRecruiters: AvailableRecruiter[];
  onAssign: (zoneCode: ZoneCode, recruiter: AvailableRecruiter) => void;
  onRemove: (zoneCode: ZoneCode) => void;
  isSaving: boolean;
}

function ZoneAssignmentCard({ zone, assignment, availableRecruiters, onAssign, onRemove, isSaving }: ZoneAssignmentCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const zoneCode = zone.zone_code as ZoneCode;
  const colors = ZONE_COLORS[zoneCode] || ZONE_COLORS.SOUTHWEST;
  const isAssigned = !!assignment;

  const handleAssignClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSelectRecruiter = (recruiter: AvailableRecruiter) => {
    onAssign(zoneCode, recruiter);
    setShowDropdown(false);
  };

  const handleRemove = () => {
    onRemove(zoneCode);
  };

  return (
    <div className={`group bg-[#121212] rounded-xl border ${isAssigned ? "border-white/5" : "border-dashed border-neutral-700"} p-4 ${isAssigned ? colors.border.replace("border", "hover:border") : "hover:bg-white/[0.02]"} transition-all duration-200 relative`}>
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          {isAssigned ? (
            <div
              className="h-12 w-12 rounded-full bg-neutral-800 bg-center bg-cover border border-white/10"
              style={{ backgroundImage: `url('${assignment.imageUrl}')` }}
            ></div>
          ) : (
            <div className="h-12 w-12 rounded-full bg-neutral-800 border border-dashed border-neutral-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-neutral-500 text-xl">person_add</span>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-semibold text-base ${isAssigned ? "text-white" : "text-neutral-300"}`}>
                {isAssigned ? assignment.recruiter : ZONE_DISPLAY_NAMES[zoneCode]}
              </h4>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
                {zoneCode}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {zone.states.slice(0, 6).map((state) => (
                <span key={state} className={`text-[10px] font-medium border px-2 py-0.5 rounded ${colors.bg} ${colors.text} ${colors.border}`}>
                  {state}
                </span>
              ))}
              {zone.states.length > 6 && (
                <span className="text-[10px] font-medium text-neutral-500 px-2 py-0.5">
                  +{zone.states.length - 6} more
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">group</span>
                {zone.total_recruits} athletes
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">star</span>
                {zone.blue_chip_count} blue chips
              </span>
              {zone.upcoming_events_30d > 0 && (
                <span className={`flex items-center gap-1 ${colors.text}`}>
                  <span className="material-symbols-outlined text-[14px]">event</span>
                  {zone.upcoming_events_30d} events
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-3 text-xs font-medium">
          {isAssigned ? (
            <>
              <button
                className="text-neutral-400 hover:text-white disabled:opacity-50"
                onClick={handleAssignClick}
                disabled={isSaving}
              >
                Edit
              </button>
              <button
                className="text-red-500 hover:text-red-400 disabled:opacity-50"
                onClick={handleRemove}
                disabled={isSaving}
              >
                Remove
              </button>
            </>
          ) : (
            <button
              className="flex items-center gap-1 text-[#D4AF37] hover:text-white font-semibold transition-colors disabled:opacity-50"
              onClick={handleAssignClick}
              disabled={isSaving}
            >
              Assign
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          )}
        </div>
      </div>

      {/* Recruiter Selection Dropdown */}
      {showDropdown && (
        <div className="absolute right-4 top-full mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-white/5">
            <p className="text-xs text-neutral-400 font-medium">Select Recruiter</p>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {availableRecruiters.length === 0 ? (
              <p className="p-3 text-sm text-neutral-500">No recruiters available</p>
            ) : (
              availableRecruiters.map((recruiter) => (
                <button
                  key={recruiter.id}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                  onClick={() => handleSelectRecruiter(recruiter)}
                >
                  <div
                    className="h-8 w-8 rounded-full bg-neutral-700 bg-center bg-cover border border-white/10 shrink-0"
                    style={{ backgroundImage: recruiter.imageUrl ? `url('${recruiter.imageUrl}')` : undefined }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{recruiter.name}</p>
                    <p className="text-xs text-neutral-400 truncate">{recruiter.title}</p>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="p-2 border-t border-white/5">
            <button
              className="w-full text-xs text-neutral-400 hover:text-white py-1"
              onClick={() => setShowDropdown(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MapZoneMarker({ zone, assignment, position }: { zone: ZoneInfo; assignment?: { recruiter: string }; position: { top: string; left: string } }) {
  const zoneCode = zone.zone_code as ZoneCode;
  const colors = ZONE_COLORS[zoneCode] || ZONE_COLORS.SOUTHWEST;
  const isAssigned = !!assignment;

  return (
    <div className="absolute group/zone cursor-pointer" style={{ top: position.top, left: position.left }}>
      <div className={`absolute -inset-4 ${colors.bg} rounded-full blur-xl group-hover/zone:opacity-75 transition-all ${isAssigned ? "opacity-50" : "opacity-30"}`}></div>
      <div className="relative flex flex-col items-center">
        <div className={`h-3 w-3 ${isAssigned ? colors.bg.replace("/10", "") : "bg-neutral-500"} rounded-full ${isAssigned ? `shadow-[0_0_15px_var(--tw-shadow-color)]` : ""} ${isAssigned ? "" : "border border-neutral-300"} ${isAssigned ? "animate-pulse" : ""}`}
          style={{ "--tw-shadow-color": isAssigned ? colors.text.replace("text", "rgb").replace("-400", "/ 0.5)").replace("-", "(") : undefined } as React.CSSProperties}
        ></div>
        <div className={`mt-2 bg-[#121212]/90 backdrop-blur-md border ${isAssigned ? colors.border : "border-neutral-700 border-dashed"} px-3 py-1.5 rounded-lg shadow-xl`}>
          <p className={`text-xs font-bold tracking-wider ${isAssigned ? colors.text : "text-neutral-400"}`}>{ZONE_DISPLAY_NAMES[zoneCode].toUpperCase()}</p>
          <p className={`text-[10px] font-medium ${isAssigned ? "text-white" : "text-neutral-500 italic"}`}>
            {isAssigned ? assignment.recruiter : "Unassigned"}
          </p>
        </div>
      </div>
    </div>
  );
}

// Map positions for each zone
const MAP_POSITIONS: Record<string, { top: string; left: string }> = {
  MIDWEST: { top: "35%", left: "55%" },
  NORTHEAST: { top: "25%", left: "80%" },
  PLAINS: { top: "45%", left: "45%" },
  SOUTHEAST: { top: "55%", left: "70%" },
  SOUTHWEST: { top: "60%", left: "35%" },
  WEST: { top: "35%", left: "15%" },
};

function formatTimeSince(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export default function TerritoryAssignmentsPage() {
  const { zones, isLoading: zonesLoading, error: zonesError } = useMcpZones();
  const {
    availableRecruiters,
    isLoading: assignmentsLoading,
    isSaving,
    error: assignmentsError,
    lastSaved,
    getAssignmentForZone,
    setLocalAssignment,
    saveAllAssignments,
    hasUnsavedChanges,
    refetch,
  } = useZoneAssignments();

  const isLoading = zonesLoading || assignmentsLoading;
  const error = zonesError || assignmentsError;

  const assignedZones = zones.filter(z => getAssignmentForZone(z.zone_code));
  const unassignedZones = zones.filter(z => !getAssignmentForZone(z.zone_code));

  // Calculate stats
  const totalAssigned = assignedZones.length;
  const totalOpen = unassignedZones.length;
  const totalRecruits = zones.reduce((sum, z) => sum + z.total_recruits, 0);
  const coveredRecruits = assignedZones.reduce((sum, z) => sum + z.total_recruits, 0);
  const coveragePercent = totalRecruits > 0 ? Math.round((coveredRecruits / totalRecruits) * 100) : 0;

  const handleAssign = (zoneCode: ZoneCode, recruiter: AvailableRecruiter) => {
    setLocalAssignment(zoneCode, recruiter);
  };

  const handleRemove = (zoneCode: ZoneCode) => {
    setLocalAssignment(zoneCode, null);
  };

  const handleSave = async () => {
    const success = await saveAllAssignments();
    if (success) {
      // Optionally show a success toast
    }
  };

  const handleCancel = () => {
    // Reset local changes by refetching
    refetch();
  };

  return (
    <div className="bg-[#050505] text-white font-display h-screen flex overflow-hidden selection:bg-[#D4AF37] selection:text-black">
      {/* Navigation Sidebar */}
      <nav className="w-20 lg:w-64 h-full bg-[#0a0a0a] border-r border-[#262626] flex flex-col justify-between shrink-0 z-20">
        <div className="flex flex-col gap-6 p-4">
          {/* Logo Area */}
          <div className="flex items-center gap-3 px-2">
            <div className="bg-[#D4AF37]/20 rounded-lg h-10 w-10 shrink-0 flex items-center justify-center text-[#D4AF37]">
              <span className="material-symbols-outlined">api</span>
            </div>
            <div className="hidden lg:flex flex-col">
              <h1 className="text-white text-base font-bold leading-tight">RepMax</h1>
              <p className="text-neutral-500 text-xs font-medium">Admin Console</p>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col gap-2 mt-4">
            <Link href="/dashboard/recruiter" className="flex items-center gap-3 px-3 py-3 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors group">
              <span className="material-symbols-outlined group-hover:text-[#D4AF37] transition-colors">dashboard</span>
              <p className="hidden lg:block text-sm font-medium leading-normal">Dashboard</p>
            </Link>
            <Link href="/dashboard/recruiter/territory" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
              <span className="material-symbols-outlined">map</span>
              <p className="hidden lg:block text-sm font-medium leading-normal">Assignments</p>
            </Link>
            <Link href="/dashboard/recruiter/pipeline" className="flex items-center gap-3 px-3 py-3 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors group">
              <span className="material-symbols-outlined group-hover:text-[#D4AF37] transition-colors">group</span>
              <p className="hidden lg:block text-sm font-medium leading-normal">Pipeline</p>
            </Link>
            <Link href="/dashboard/recruiter/prospects" className="flex items-center gap-3 px-3 py-3 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors group">
              <span className="material-symbols-outlined group-hover:text-[#D4AF37] transition-colors">person_search</span>
              <p className="hidden lg:block text-sm font-medium leading-normal">Candidates</p>
            </Link>
            <Link href="/dashboard/recruiter/reports" className="flex items-center gap-3 px-3 py-3 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors group">
              <span className="material-symbols-outlined group-hover:text-[#D4AF37] transition-colors">bar_chart</span>
              <p className="hidden lg:block text-sm font-medium leading-normal">Reports</p>
            </Link>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-[#262626]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-neutral-700"></div>
            <div className="hidden lg:flex flex-col">
              <p className="text-white text-sm font-medium leading-none">Admin User</p>
              <p className="text-neutral-500 text-xs mt-1">Logout</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area (Split View) */}
      <main className="flex flex-1 h-full overflow-hidden">
        {/* Left Panel: Map Visualization (55%) */}
        <section className="w-[55%] h-full relative bg-[#080808] border-r border-[#262626] hidden md:block overflow-hidden group">
          {/* Map Background */}
          <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, #1a1a1a 0%, #050505 100%)" }}></div>

          {/* Simulated Map Container */}
          <div className="w-full h-full relative flex items-center justify-center p-12">
            <div className="relative w-full aspect-[4/3] max-w-4xl">
              {/* Map placeholder */}
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center">
                <span className="material-symbols-outlined text-[120px] text-white/10">map</span>
              </div>

              {/* Zone Markers */}
              {zones.map(zone => (
                <MapZoneMarker
                  key={zone.zone_code}
                  zone={zone}
                  assignment={getAssignmentForZone(zone.zone_code)}
                  position={MAP_POSITIONS[zone.zone_code] || { top: "50%", left: "50%" }}
                />
              ))}
            </div>
          </div>

          {/* Map Legend */}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            <div className="bg-[#121212]/80 backdrop-blur border border-white/5 rounded-lg p-3 shadow-lg">
              <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2 font-semibold">Map Layers</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37]"></div>
                  <span className="text-xs text-neutral-300">Active Zones</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full border border-neutral-500"></div>
                  <span className="text-xs text-neutral-300">Unassigned</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel: List & Management (45%) */}
        <section className="w-full md:w-[45%] h-full flex flex-col bg-[#050505] relative border-l border-transparent md:border-[#262626]">
          {/* Sticky Header */}
          <header className="shrink-0 px-8 pt-8 pb-4 bg-[#050505]/95 backdrop-blur z-10 border-b border-white/5">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-black text-white tracking-tight">Territory Assignments</h2>
              <p className="text-neutral-400 text-sm">Distribute recruitment zones for the 2025 season.</p>
            </div>

            {/* Quick Stats */}
            {isLoading ? (
              <div className="flex gap-6 mt-6 animate-pulse">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 w-20 bg-gray-800 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="flex gap-6 mt-6">
                <div>
                  <p className="text-2xl font-bold text-white">{totalAssigned}</p>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Assigned</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#D4AF37]">{totalOpen}</p>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Open Zones</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{coveragePercent}%</p>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Coverage</p>
                </div>
              </div>
            )}
          </header>

          {/* Scrollable List Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6 pb-32">
            {error ? (
              <div className="text-center py-12 text-red-400">
                <span className="material-symbols-outlined text-4xl mb-2">error</span>
                <p>Error loading data</p>
                <p className="text-sm mt-1">{error.message}</p>
                <button
                  onClick={() => refetch()}
                  className="mt-4 text-sm text-[#D4AF37] hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : isLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-800 rounded-xl"></div>
                ))}
              </div>
            ) : (
              <>
                {/* Active Section */}
                {assignedZones.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Assignments</h3>
                      <button className="text-xs text-[#D4AF37] hover:text-[#D4AF37]/80 font-medium">View All</button>
                    </div>
                    <div className="flex flex-col gap-3">
                      {assignedZones.map(zone => (
                        <ZoneAssignmentCard
                          key={zone.zone_code}
                          zone={zone}
                          assignment={getAssignmentForZone(zone.zone_code)}
                          availableRecruiters={availableRecruiters}
                          onAssign={handleAssign}
                          onRemove={handleRemove}
                          isSaving={isSaving}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Unassigned Section */}
                {unassignedZones.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Pending / Unassigned</h3>
                    <div className="flex flex-col gap-3">
                      {unassignedZones.map(zone => (
                        <ZoneAssignmentCard
                          key={zone.zone_code}
                          zone={zone}
                          availableRecruiters={availableRecruiters}
                          onAssign={handleAssign}
                          onRemove={handleRemove}
                          isSaving={isSaving}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Fixed Action Footer */}
          <div className="absolute bottom-0 left-0 w-full bg-[#050505]/80 backdrop-blur-lg border-t border-white/10 p-6 flex justify-between items-center z-20">
            <div className="text-xs text-neutral-500 font-medium hidden sm:flex items-center gap-2">
              {hasUnsavedChanges && (
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  Unsaved changes
                </span>
              )}
              {!hasUnsavedChanges && lastSaved && (
                <span>Last saved: {formatTimeSince(lastSaved)}</span>
              )}
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <button
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-white font-medium hover:bg-white/5 transition-colors text-sm disabled:opacity-50"
                onClick={handleCancel}
                disabled={isSaving || !hasUnsavedChanges}
              >
                Cancel
              </button>
              <button
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-[#D4AF37] text-black font-bold hover:bg-[#d6aa1a] transition-colors shadow-[0_0_20px_rgba(212,175,55,0.2)] text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">check</span>
                    Save Assignments
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
