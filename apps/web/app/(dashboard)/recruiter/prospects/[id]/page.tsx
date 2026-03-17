'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAthleteFullProfile, useShortlist, useRecruiterPipeline, type CrmStage } from '@/lib/hooks';
import { logCommunication, getAthleteContactEmail } from '@/lib/actions/communication-actions';
import { PlayerCardContent } from '@/components/player-card';

interface TimelineItem {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  time: string;
  attachment?: { name: string };
}

// Timeline data placeholder - will come from activity log when implemented
function getTimelineData(): TimelineItem[] {
  return [];
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <div className="bg-[#2a271d] rounded-xl border border-[#433d28] h-[600px] animate-pulse"></div>
        </div>
        <div className="lg:col-span-7">
          <div className="bg-[#2a271d] rounded-xl border border-[#433d28] h-[400px] animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
        <h2 className="text-xl font-bold mb-2">Error Loading Athlete</h2>
        <p className="text-gray-400 mb-4">{error.message}</p>
        <button
          onClick={onRetry}
          className="bg-primary text-black px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default function ProspectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const athleteId = params.id as string;

  const { data, isLoading, error } = useAthleteFullProfile(athleteId);
  const { shortlist, add, remove, isInShortlist } = useShortlist();
  const { pipeline, addToPipeline, moveToStage } = useRecruiterPipeline();
  const [toast, setToast] = useState<string | null>(null);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTimelineFilter, setShowTimelineFilter] = useState(false);
  const [timelineFilters, setTimelineFilters] = useState<Record<string, boolean>>({
    calls: true, emails: true, visits: true, offers: true, notes: true,
  });

  const shortlistItem = shortlist.find(item => item.athlete_id === athleteId);
  const isOnShortlist = isInShortlist(athleteId);
  const pipelineEntry = pipeline.find(e => e.athlete.id === athleteId);
  const isInPipeline = !!pipelineEntry;
  const currentPipelineStage = pipelineEntry?.stage || 'identified';

  const handleAddToShortlist = async () => {
    await add(athleteId);
  };

  const handleRemoveFromShortlist = async () => {
    await remove(athleteId);
  };

  const handleAddToPipeline = async () => {
    await addToPipeline(athleteId);
    showToast('Added to pipeline');
  };

  const handlePipelineStageChange = async (newStage: CrmStage) => {
    if (pipelineEntry) {
      await moveToStage(pipelineEntry.id, newStage);
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCall = async () => {
    const result = await logCommunication(athleteId, 'call', 'Phone call initiated');
    if (result.error) {
      showToast(`Error: ${result.error}`);
    } else {
      showToast('Call logged');
    }
  };

  const handleEmail = async () => {
    const emailResult = await getAthleteContactEmail(athleteId);
    if (emailResult.email) {
      window.open(`mailto:${emailResult.email}`);
      await logCommunication(athleteId, 'email', `Email sent to ${emailResult.email}`);
      showToast('Email opened & logged');
    } else {
      showToast('No email available for this athlete');
    }
  };

  const handleDM = () => {
    if (data) {
      router.push(`/messages`);
    } else {
      showToast('Cannot message: profile not found');
    }
  };

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  if (!data) return <ErrorState error={new Error('Athlete not found')} onRetry={() => window.location.reload()} />;

  const timelineData = getTimelineData();

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <Link className="text-[#c3b998] hover:text-primary transition-colors" href="/recruiter/prospects">
          Prospects
        </Link>
        <span className="text-[#c3b998] material-symbols-outlined text-[20px]">chevron_right</span>
        <span className="text-white font-medium">{data.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Full Player Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <PlayerCardContent
            data={data}
            variant="embedded"
            actions={
              <div className="p-4 border-t border-white/5">
                {/* Contact Actions */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={handleCall}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group"
                  >
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">call</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Call</span>
                  </button>
                  <button
                    onClick={handleEmail}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group"
                  >
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">mail</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Email</span>
                  </button>
                  <button
                    onClick={handleDM}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group"
                  >
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">chat</span>
                    <span className="text-[10px] uppercase font-bold text-gray-400">DM</span>
                  </button>
                </div>
              </div>
            }
          />
        </div>

        {/* Right Column: CRM */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* CRM Control Bar */}
          <div className="bg-[#2a271d] p-4 rounded-xl border border-[#433d28] flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3 flex-wrap">
              {/* Pipeline Controls */}
              {isInPipeline ? (
                <div className="relative">
                  <select
                    value={currentPipelineStage}
                    onChange={(e) => handlePipelineStageChange(e.target.value as CrmStage)}
                    className="appearance-none bg-[#363225] text-white pl-9 pr-8 py-2 rounded-lg border border-[#433d28] focus:border-primary focus:outline-none text-sm font-medium cursor-pointer min-w-[140px]"
                  >
                    <option value="identified">Identified</option>
                    <option value="contacted">Contacted</option>
                    <option value="evaluating">Evaluating</option>
                    <option value="visit_scheduled">Visit Scheduled</option>
                    <option value="offered">Offered</option>
                    <option value="committed">Committed</option>
                  </select>
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-primary text-[20px]">
                    manage_search
                  </span>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#c3b998] text-[20px] pointer-events-none">
                    expand_more
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleAddToPipeline}
                  className="flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-lg border border-primary/40 hover:bg-primary/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">person_add</span>
                  <span className="text-primary text-sm font-medium">Add to Pipeline</span>
                </button>
              )}

              {/* Shortlist Bookmark Toggle */}
              {isOnShortlist ? (
                <button
                  onClick={handleRemoveFromShortlist}
                  className="flex items-center gap-2 bg-[#363225] px-3 py-2 rounded-lg border border-[#433d28] hover:bg-[#363225]/80 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                  <span className="text-[#c3b998] text-sm font-medium">Saved</span>
                </button>
              ) : (
                <button
                  onClick={handleAddToShortlist}
                  className="flex items-center gap-2 bg-[#363225] px-3 py-2 rounded-lg border border-[#433d28] hover:bg-[#363225]/80 transition-colors"
                >
                  <span className="material-symbols-outlined text-[#c3b998] text-[20px]">bookmark</span>
                  <span className="text-[#c3b998] text-sm font-medium">Save</span>
                </button>
              )}
            </div>

            {/* Priority indicator */}
            {isInPipeline && pipelineEntry?.priority && (
              <div className="flex items-center gap-2 pl-4 border-l border-[#433d28]">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    pipelineEntry.priority === 'top' || pipelineEntry.priority === 'high'
                      ? 'text-primary'
                      : 'text-[#c3b998]'
                  }`}
                  style={{ fontVariationSettings: pipelineEntry.priority === 'top' ? "'FILL' 1" : "'FILL' 0" }}
                >
                  flag
                </span>
                <span className="text-white text-sm font-medium capitalize">{pipelineEntry.priority} Priority</span>
              </div>
            )}
          </div>

          {/* Tags & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tags */}
            <div className="bg-[#2a271d] p-5 rounded-xl border border-[#433d28]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold text-sm">Tags</h3>
                <button onClick={() => setIsEditingTags(!isEditingTags)} className={`transition-colors ${isEditingTags ? 'text-primary' : 'text-[#c3b998] hover:text-primary'}`}>
                  <span className="material-symbols-outlined text-[20px]">{isEditingTags ? 'check' : 'edit'}</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.primaryPosition && (
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium border border-primary/20">
                    {data.primaryPosition} Target
                  </span>
                )}
                {data.classYear && (
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-500 text-xs font-medium border border-purple-500/20">
                    Class of &apos;{String(data.classYear).slice(-2)}
                  </span>
                )}
                {data.zone && (
                  <span className="px-3 py-1 rounded-full bg-[#363225] text-[#c3b998] text-xs font-medium border border-[#433d28]">
                    {data.zone}
                  </span>
                )}
                {customTags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-[#363225] text-[#c3b998] text-xs font-medium border border-[#433d28] flex items-center gap-1">
                    {tag}
                    {isEditingTags && (
                      <button onClick={() => setCustomTags(prev => prev.filter(t => t !== tag))} className="text-red-400 hover:text-red-300 ml-1">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    )}
                  </span>
                ))}
                {isEditingTags ? (
                  <form onSubmit={(e) => { e.preventDefault(); const trimmed = newTagInput.trim(); if (trimmed && !customTags.includes(trimmed)) { setCustomTags(prev => [...prev, trimmed]); setNewTagInput(''); } }} className="flex items-center">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      placeholder="New tag..."
                      className="px-3 py-1 rounded-full bg-[#363225] text-white text-xs border border-[#433d28] focus:border-primary focus:outline-none w-24"
                      autoFocus
                    />
                  </form>
                ) : (
                  <button onClick={() => setIsEditingTags(true)} className="px-3 py-1 rounded-full border border-dashed border-[#c3b998]/50 text-[#c3b998] text-xs font-medium hover:border-primary hover:text-primary transition-colors">
                    + Add
                  </button>
                )}
              </div>
            </div>

            {/* Quick Note */}
            <div className="bg-[#2a271d] p-5 rounded-xl border border-[#433d28] flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-semibold text-sm">Notes</h3>
              </div>
              {(pipelineEntry?.notes || shortlistItem?.notes) ? (
                <p className="text-[#c3b998] text-sm leading-relaxed flex-1">
                  &quot;{pipelineEntry?.notes || shortlistItem?.notes}&quot;
                </p>
              ) : (
                <p className="text-[#c3b998]/50 text-sm italic flex-1">
                  No notes yet. Add notes when you add to pipeline.
                </p>
              )}
              <div className="mt-3 flex justify-end">
                <Link href={`/dashboard/messages?to=${athleteId}`} className="text-primary text-xs font-bold hover:underline">
                  Send Message
                </Link>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-[#2a271d] rounded-xl border border-[#433d28] p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-semibold">Activity Timeline</h3>
              <div className="relative">
                <button onClick={() => setShowTimelineFilter(!showTimelineFilter)} className={`bg-[#363225] text-white text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${showTimelineFilter ? 'border-primary' : 'border-[#433d28] hover:border-primary/50'}`}>
                  <span className="material-symbols-outlined text-[16px]">filter_list</span>
                  Filter
                </button>
                {showTimelineFilter && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-[#363225] border border-[#433d28] rounded-lg shadow-xl z-50 p-2">
                    {Object.entries(timelineFilters).map(([key, checked]) => (
                      <label key={key} className="flex items-center gap-2 px-2 py-1.5 text-sm text-white hover:bg-white/5 rounded cursor-pointer capitalize">
                        <input type="checkbox" checked={checked} onChange={() => setTimelineFilters(f => ({ ...f, [key]: !f[key] }))} className="accent-primary" />
                        {key}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="relative space-y-8 pl-2">
              {timelineData.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity recorded yet</p>
              ) : (
                <>
                  <div className="absolute top-2 bottom-2 left-[19px] w-[2px] bg-[#433d28]"></div>
                  {timelineData.map((item) => (
                    <div key={item.id} className="relative flex gap-4">
                      <div
                        className={`relative z-10 size-10 rounded-full ${item.iconBg} border border-[#433d28] flex items-center justify-center shrink-0`}
                      >
                        <span className={`material-symbols-outlined ${item.iconColor} text-sm`}>{item.icon}</span>
                      </div>
                      <div className="flex flex-col pt-1 w-full">
                        <div className="flex justify-between items-start">
                          <p className="text-white text-sm font-medium">{item.title}</p>
                          <span className="text-xs text-[#c3b998]">{item.time}</span>
                        </div>
                        <p className="text-[#c3b998] text-xs mt-0.5">{item.description}</p>
                        {item.attachment && (
                          <div className="mt-2 p-2 bg-[#363225] rounded border border-[#433d28] max-w-md">
                            <div className="flex items-center gap-2 text-xs text-[#c3b998]">
                              <span className="material-symbols-outlined text-sm">attachment</span>
                              <span>{item.attachment.name}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2a271d] border border-[#433d28] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <span className="text-sm">{toast}</span>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #201d12;
        }
        ::-webkit-scrollbar-thumb {
          background: #433d28;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #d4af35;
        }
      ` }} />
    </div>
  );
}
