'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@repmax/shared/supabase';
import { useAthlete } from '@/lib/hooks';

function formatHeight(inches: number | null): string {
  if (!inches) return 'N/A';
  const feet = Math.floor(inches / 12);
  const remaining = inches % 12;
  return `${feet}'${remaining}"`;
}

function formatValue(val: number | null | undefined, suffix = ''): string {
  if (val === null || val === undefined || val === 0) return 'N/A';
  return `${val}${suffix}`;
}

interface Document {
  id: string;
  title: string;
  document_type: string;
  file_url: string;
}

export default function CoachRosterDetailPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { athlete, isLoading, error } = useAthlete(id);
  const [isRemoving, setIsRemoving] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [offersCount, setOffersCount] = useState(0);

  // Fetch documents and offers count
  useEffect(() => {
    if (!athlete?.id) return;
    const supabase = createClient();

    supabase
      .from('documents')
      .select('id, title, document_type, file_url')
      .eq('athlete_id', athlete.id)
      .order('uploaded_at', { ascending: false })
      .then(({ data }) => setDocuments(data ?? []));

    supabase
      .from('offers')
      .select('*', { count: 'exact', head: true })
      .eq('athlete_id', athlete.id)
      .then(({ count }) => setOffersCount(count || 0));
  }, [athlete?.id]);

  const handleRemoveFromRoster = async () => {
    if (!confirm('Remove this athlete from your roster? This cannot be undone.')) return;
    setIsRemoving(true);
    try {
      const res = await fetch(`/api/coach/roster?athlete_id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Athlete removed from roster');
        router.push('/coach/roster');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to remove athlete');
      }
    } catch {
      toast.error('Failed to remove athlete');
    } finally {
      setIsRemoving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-slate-400">Loading athlete...</p>
        </div>
      </div>
    );
  }

  if (error || !athlete) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load athlete</h3>
          <p className="text-slate-400 text-sm">{error?.message || 'Athlete not found'}</p>
        </div>
      </div>
    );
  }

  const name = athlete.profile?.full_name || 'Unknown Athlete';
  const avatarUrl = athlete.profile?.avatar_url || null;
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2);
  const starRating = athlete.star_rating || 0;
  const transcripts = documents.filter(d => d.document_type === 'transcript');
  const recommendations = documents.filter(d => d.document_type === 'recommendation');
  const highlight = athlete.highlights?.[0] ?? null;

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Link + Coach Actions */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/coach/roster" className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Roster
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={`/coach/roster/${id}/edit`}
              className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit
            </Link>
            <button
              onClick={() => router.push('/messages')}
              className="flex items-center gap-2 bg-[#2A2A2E] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#3A3A3E] transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">mail</span>
              Message
            </button>
            <button
              onClick={handleRemoveFromRoster}
              disabled={isRemoving}
              className="flex items-center gap-2 bg-[#2A2A2E] text-red-400 font-medium px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50 text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">person_remove</span>
              {isRemoving ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-[#1A1A1D] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* Hero Image */}
          <div className="relative w-full aspect-[3/2] bg-gradient-to-b from-[#1a1a1a] to-[#1A1A1D] overflow-hidden">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`Portrait of ${name}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#2A2A2E]">
                <span className="text-6xl font-bold text-white/30">{initials}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1D] via-[#1A1A1D]/40 to-transparent" />
            {/* Zone Badge */}
            {athlete.zone && (
              <div className="absolute top-4 right-4 bg-purple-900/80 border border-purple-500/50 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 z-10">
                <span className="material-symbols-outlined text-purple-200 text-[14px]">location_on</span>
                <span className="text-[10px] font-bold tracking-wider text-purple-100 uppercase">
                  {athlete.zone} Zone
                </span>
              </div>
            )}
            {/* Verified Badge */}
            {athlete.verified && (
              <div className="absolute bottom-4 right-4 z-10 bg-green-900/80 border border-green-500/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                <span
                  className="material-symbols-outlined text-green-400 text-[16px] leading-none"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
                >
                  verified
                </span>
                <span className="text-[10px] font-bold tracking-wider text-green-300 uppercase">Verified</span>
              </div>
            )}
          </div>

          {/* Identity Section */}
          <div className="px-6 pt-5 flex flex-col items-center text-center">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold tracking-tight text-white">{name}</h1>
              <p className="text-gray-400 text-sm font-medium">
                {[athlete.high_school, athlete.city, athlete.state].filter(Boolean).join(', ')}
              </p>
            </div>

            {/* Position Pills */}
            <div className="mt-4 flex gap-3">
              {athlete.primary_position && (
                <div className="flex h-7 items-center justify-center px-4 rounded-full bg-primary/20 border border-primary/30">
                  <span className="text-primary text-xs font-bold tracking-wider">{athlete.primary_position}</span>
                </div>
              )}
              {athlete.secondary_position && (
                <div className="flex h-7 items-center justify-center px-4 rounded-full bg-neutral-800 border border-white/10">
                  <span className="text-gray-300 text-xs font-bold tracking-wider">{athlete.secondary_position}</span>
                </div>
              )}
            </div>

            {/* Class / Rating / Offers Row */}
            <div className="mt-5 w-full flex items-center justify-between border-y border-white/5 py-3 px-2">
              <div className="flex flex-col items-start gap-1">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Class Of</span>
                <span className="text-sm font-bold text-white">{athlete.class_year || 'N/A'}</span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Rating</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`material-symbols-outlined text-[16px] ${star <= starRating ? 'text-primary' : 'text-gray-700'}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Offers</span>
                <span className="text-sm font-bold text-primary">{offersCount}</span>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="p-6 flex flex-col gap-6">
            {/* Bio */}
            {athlete.bio && (
              <section>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                  <p className="text-sm text-gray-300 leading-relaxed">{athlete.bio}</p>
                </div>
              </section>
            )}

            {/* Athletic Metrics */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[20px]">straighten</span>
                <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Athletic Metrics</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Height', value: formatHeight(athlete.height_inches) },
                  { label: 'Weight', value: formatValue(athlete.weight_lbs), unit: athlete.weight_lbs ? 'lbs' : null },
                  { label: '40-Yard', value: athlete.forty_yard_time ? `${athlete.forty_yard_time}s` : 'N/A', accent: true },
                  { label: '10Y Split', value: athlete.ten_yard_split ? `${athlete.ten_yard_split}s` : 'N/A' },
                  { label: '5-10-5', value: athlete.five_ten_five ? `${athlete.five_ten_five}s` : 'N/A' },
                  { label: 'Broad Jump', value: formatValue(athlete.broad_jump_inches, '"') },
                  { label: 'Vertical', value: formatValue(athlete.vertical_inches, '"') },
                  { label: 'Wingspan', value: formatValue(athlete.wingspan_inches, '"') },
                  { label: 'Bench', value: formatValue(athlete.bench_press_lbs), unit: athlete.bench_press_lbs ? 'lbs' : null },
                ].map((m) => (
                  <div key={m.label} className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                    <span className="text-[10px] text-gray-500 font-medium">{m.label}</span>
                    <span className={`text-xl font-bold font-mono ${m.accent ? 'text-primary' : 'text-white'}`}>
                      {m.value}
                    </span>
                    {m.unit && <span className="text-[10px] text-gray-500 -mt-1">{m.unit}</span>}
                  </div>
                ))}
                {/* Empty cell + Squat to match public card grid layout */}
                <div />
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                  <span className="text-[10px] text-gray-500 font-medium">Squat</span>
                  <span className="text-xl text-white font-bold font-mono">{formatValue(athlete.squat_lbs)}</span>
                  {athlete.squat_lbs ? <span className="text-[10px] text-gray-500 -mt-1">lbs</span> : null}
                </div>
              </div>
            </section>

            {/* Profile Snapshot (Academics) */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[20px]">school</span>
                <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Profile Snapshot</h2>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                  <span className="text-xs text-gray-500 font-medium">GPA</span>
                  <span className="text-xl text-white font-bold font-mono">{formatValue(athlete.gpa)}</span>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                  <span className="text-xs text-gray-500 font-medium">W. GPA</span>
                  <span className="text-xl text-white font-bold font-mono">{formatValue(athlete.weighted_gpa)}</span>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                  <span className="text-xs text-gray-500 font-medium">Offers</span>
                  <span className="text-xl text-primary font-bold font-mono">{offersCount}</span>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 font-medium">SAT</span>
                  <span className="text-xl text-white font-bold font-mono">{formatValue(athlete.sat_score)}</span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 font-medium">ACT</span>
                  <span className="text-xl text-white font-bold font-mono">{formatValue(athlete.act_score)}</span>
                </div>
              </div>
            </section>

            {/* Documents */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-[20px]">description</span>
                <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Documents</h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {transcripts.length > 0 ? (
                  <a href={transcripts[0].file_url} target="_blank" rel="noopener noreferrer" className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer text-center">
                    <span className="material-symbols-outlined text-primary text-[28px]">description</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Transcript</span>
                  </a>
                ) : (
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 opacity-40 text-center">
                    <span className="material-symbols-outlined text-gray-500 text-[28px]">description</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Transcript</span>
                  </div>
                )}
                {recommendations.length > 0 ? (
                  <a href={recommendations[0].file_url} target="_blank" rel="noopener noreferrer" className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer text-center">
                    <span className="material-symbols-outlined text-primary text-[28px]">mail</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Letter</span>
                  </a>
                ) : (
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 opacity-40 text-center">
                    <span className="material-symbols-outlined text-gray-500 text-[28px]">mail</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Letter</span>
                  </div>
                )}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 opacity-40 text-center">
                  <span className="material-symbols-outlined text-gray-500 text-[28px]">query_stats</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Scouting Report</span>
                </div>
              </div>
            </section>

            {/* Highlights */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">smart_display</span>
                  <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Highlights</h2>
                </div>
              </div>
              {highlight ? (
                <div
                  className="relative w-full aspect-video rounded-2xl overflow-hidden group cursor-pointer border border-white/10"
                  onClick={() => highlight.video_url && window.open(highlight.video_url, '_blank')}
                >
                  {highlight.thumbnail_url ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url('${highlight.thumbnail_url}')` }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#2A2A2E]" />
                  )}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center pl-1 shadow-glow group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-black text-[32px] font-bold">play_arrow</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md">
                    <p className="text-[10px] text-white font-medium">{highlight.title}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/5 rounded-2xl p-8 text-center">
                  <span className="material-symbols-outlined text-gray-600 text-4xl mb-2">videocam_off</span>
                  <p className="text-gray-500 text-sm">No highlights uploaded yet</p>
                </div>
              )}
            </section>

            {/* Coach Notes */}
            {athlete.coach_notes && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-[20px]">sports</span>
                  <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Coach Notes</h2>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{athlete.coach_notes}</p>
                </div>
              </section>
            )}

            {/* Player Summary */}
            {athlete.player_summary && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-[20px]">person_search</span>
                  <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Player Summary</h2>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{athlete.player_summary}</p>
                </div>
              </section>
            )}

            {/* NCAA ID */}
            {athlete.ncaa_id && (
              <section>
                <div className="bg-primary/15 border border-primary/40 rounded-2xl p-5 flex flex-col items-center gap-3 text-center">
                  <span className="text-[10px] uppercase tracking-widest text-primary font-bold">NCAA ID</span>
                  <span className="text-2xl font-bold text-white font-mono tracking-wide">{athlete.ncaa_id}</span>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
