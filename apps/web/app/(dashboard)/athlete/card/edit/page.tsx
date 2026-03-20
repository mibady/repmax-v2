"use client";

import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useAthleteCardEditor } from "@/lib/hooks";

const DEFAULT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCpFOEUz_rfWWSVZf8V8mFWpvSX0XbEvnGhfEPVxD3mYrqKA6J94E78iBa_bR1caG28xt4BCjjnmdpZ8gfWL2lqcqVjfRncL7V0MxJBJxQQLl315vZyu2h6k9L5D4eNTwqVSBKB6cji7NJkO3WIoWyV4PeQrLPwNIgFa36RdDTOOR035pkGUVlwoADx0noxixr0W7lVDf9paHXe5l3fXR4SoKoRwegF0Uejyfdrq-vkbtjy7k-3snSTmQeCc6x5BHmksTTT1Aer9Qo";

const cardClass = "bg-[#1F1F22] border border-[rgba(255,255,255,0.08)] rounded-[15px] p-5";
const sectionTitle = (emoji: string, label: string) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-base">{emoji}</span>
      <span className="text-xs font-bold uppercase tracking-wider text-white">{label}</span>
    </div>
    <div className="h-[2px] rounded-full bg-gradient-to-r from-[#d4af35] to-transparent" />
  </div>
);

const statBox = (label: string, value: string, highlight = false) => (
  <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-3 text-center">
    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-base font-bold font-mono ${highlight ? "text-[#10B981]" : "text-white"}`}>
      {value || "—"}
    </p>
  </div>
);

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&?\s]+)/);
  return match ? match[1] : null;
}

export default function AthleticProfilePage() {
  const {
    data,
    isLoading,
    error,
    profileCompletion,
  } = useAthleteCardEditor();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error.message}</p>
          <Link href="/athlete" className="text-primary hover:underline">
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const profileImage = data.avatarUrl || DEFAULT_AVATAR;
  const youtubeId = data.youtubeLink ? getYouTubeId(data.youtubeLink) : null;

  return (
    <div className="p-6 md:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/athlete"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">My Athletic Profile</h1>
              <div className="flex items-center gap-3 mt-1">
                {data.repmaxId && (
                  <span className="text-sm font-mono text-[#d4af35] font-bold">{data.repmaxId}</span>
                )}
                <div className="h-2 w-32 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-[#d4af35] rounded-full transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400">{profileCompletion}% Complete</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/settings/profile"
              className="px-5 py-2.5 rounded-lg bg-[#d4af35] text-black font-bold text-sm hover:bg-[#c4a030] transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Profile
            </Link>
            {data.repmaxId && (
              <Link
                href={`/card/${data.repmaxId}`}
                target="_blank"
                className="px-5 py-2.5 rounded-lg bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                View Public Card
              </Link>
            )}
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-[#1F1F22] border border-[rgba(255,255,255,0.08)] rounded-[15px] overflow-hidden border-t-[3px] border-t-[#d4af35]">
          <div className="flex flex-col md:flex-row">
            {/* Photo */}
            <div className="w-full md:w-64 h-64 md:h-auto relative shrink-0 bg-black/40">
              <Image
                src={profileImage}
                alt={data.name || "Athlete"}
                fill
                className="object-cover"
              />
              {data.jerseyNumber && (
                <div className="absolute bottom-3 left-3 bg-black/70 border border-white/20 rounded-lg px-3 py-1">
                  <span className="text-2xl font-black text-white font-mono">#{data.jerseyNumber}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">{data.name || "Unnamed Athlete"}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {data.position || "No Position"}{data.secondaryPosition ? ` / ${data.secondaryPosition}` : ""} · Class of {data.classYear}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {data.highSchool || "No School"}{data.city ? `, ${data.city}` : ""}{data.state ? `, ${data.state}` : ""}
                  </p>
                  {data.bio && (
                    <p className="text-sm text-gray-300 mt-3 max-w-lg leading-relaxed">{data.bio}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    {data.height && (
                      <span className="text-sm text-white font-mono font-bold">{data.height}</span>
                    )}
                    {data.weight && (
                      <span className="text-sm text-white font-mono font-bold">{data.weight} lbs</span>
                    )}
                  </div>
                </div>

                {/* Rankings placeholder + NCAA */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex gap-2 flex-wrap justify-end">
                    {["247", "Rivals", "ESPN"].map((src) => (
                      <div key={src} className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{src}</span>
                        <div className="flex gap-px">
                          {[1, 2, 3].map((s) => (
                            <span key={s} className="material-symbols-outlined text-[12px] text-[#d4af35]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gradient-to-r from-[#d4af35]/20 to-[#d4af35]/5 border border-[#d4af35]/30 rounded-lg px-4 py-2 text-center">
                    <p className="text-[10px] text-[#d4af35] font-bold uppercase tracking-wider">RM Composite</p>
                    <p className="text-lg font-black text-[#d4af35] font-mono">—</p>
                  </div>
                  {data.ncaaEcId && (
                    <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-1.5">
                      <p className="text-[10px] text-gray-500">NCAA ID</p>
                      <p className="text-xs font-mono text-white">{data.ncaaEcId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Film & Highlights */}
            <div className={cardClass}>
              {sectionTitle("🎬", "Film & Highlights")}
              {youtubeId ? (
                <div className="aspect-video rounded-[10px] overflow-hidden mb-4 bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-[10px] bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] flex items-center justify-center mb-4">
                  <div className="text-center text-gray-500">
                    <span className="material-symbols-outlined text-3xl mb-2 block">videocam_off</span>
                    <p className="text-xs">No highlight reel added</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                {data.hudlLink ? (
                  <a
                    href={data.hudlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-[10px] bg-gradient-to-r from-[#f15a29] to-[#e04e1a] border border-white/20 text-center font-bold text-sm text-white hover:opacity-90 transition-opacity"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                  >
                    Hudl Profile
                  </a>
                ) : (
                  <div className="flex-1 py-3 rounded-[10px] bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] text-center text-sm text-gray-500">
                    No Hudl Link
                  </div>
                )}
                {data.youtubeLink ? (
                  <a
                    href={data.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-[10px] bg-gradient-to-r from-[#ff0000] to-[#cc0000] border border-white/20 text-center font-bold text-sm text-white hover:opacity-90 transition-opacity"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                  >
                    YouTube
                  </a>
                ) : (
                  <div className="flex-1 py-3 rounded-[10px] bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] text-center text-sm text-gray-500">
                    No YouTube Link
                  </div>
                )}
              </div>
            </div>

            {/* Social Media */}
            <div className={cardClass}>
              {sectionTitle("📱", "Social Media")}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Twitter", value: data.twitter, icon: "𝕏" },
                  { label: "Instagram", value: data.instagram, icon: "📸" },
                  { label: "TikTok", value: null, icon: "🎵" },
                ].map((social) => (
                  <div
                    key={social.label}
                    className="bg-[#2a2a2d] border border-[#d4af35]/20 rounded-[10px] p-3 text-center"
                  >
                    <span className="text-2xl block mb-2">{social.icon}</span>
                    <p className="text-xs text-gray-500 mb-1">{social.label}</p>
                    <p className="text-xs text-white font-medium truncate">{social.value || "Not added"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Measurables & Combine */}
            <div className={cardClass}>
              {sectionTitle("⚡", "Measurables & Combine")}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {statBox("Height", data.height)}
                {statBox("Weight", data.weight ? `${data.weight} lbs` : "")}
                {statBox("40-Yard", data.fortyYard ? `${data.fortyYard}s` : "", true)}
                {statBox("10Y Split", data.tenYardSplit ? `${data.tenYardSplit}s` : "", true)}
                {statBox("5-10-5", data.fiveTenFive ? `${data.fiveTenFive}s` : "", true)}
                {statBox("Broad Jump", data.broadJump ? `${data.broadJump}"` : "", true)}
                {statBox("Vertical", data.vertical ? `${data.vertical}"` : "", true)}
                {statBox("Wingspan", data.wingspan ? `${data.wingspan}"` : "")}
                {statBox("Bench", data.benchPress ? `${data.benchPress} lbs` : "")}
                {statBox("Squat", data.squat ? `${data.squat} lbs` : "")}
              </div>
            </div>

            {/* Academics & Recruiting */}
            <div className={cardClass}>
              {sectionTitle("🎓", "Academics & Recruiting")}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {statBox("GPA", data.gpa)}
                {statBox("W. GPA", data.weightedGpa)}
                {statBox("SAT", data.sat)}
                {statBox("ACT", data.act)}
              </div>
              <div className="space-y-3">
                {data.academicInterest && (
                  <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Academic Interest</p>
                    <p className="text-sm text-white">{data.academicInterest}</p>
                  </div>
                )}
                {data.collegePriority && (
                  <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">College Priority</p>
                    <p className="text-sm text-gray-300">{data.collegePriority}</p>
                  </div>
                )}
                {data.dreamSchools && (
                  <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Dream Schools</p>
                    <p className="text-sm text-white">{data.dreamSchools}</p>
                  </div>
                )}
                {data.awards && (
                  <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Awards</p>
                    <p className="text-sm text-gray-300">{data.awards}</p>
                  </div>
                )}
                {data.otherSports && (
                  <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Other Sports</p>
                    <p className="text-sm text-white">{data.otherSports}</p>
                  </div>
                )}
                {data.campsAttended && (
                  <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Camps Attended</p>
                    <p className="text-sm text-gray-300">{data.campsAttended}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6">
            {/* Scouting Report */}
            <div className={cardClass}>
              {sectionTitle("🔍", "Scouting Report")}
              {data.playerSummary ? (
                <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-4 mb-3">
                  <p className="text-sm text-gray-300 leading-relaxed">{data.playerSummary}</p>
                </div>
              ) : (
                <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-4 mb-3 text-center">
                  <p className="text-sm text-gray-500">No player summary added</p>
                </div>
              )}
              {data.coachNotes && (
                <div className="bg-[#1a1a1a] border-l-2 border-l-[#d4af35] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-4">
                  <p className="text-[10px] text-[#d4af35] font-bold uppercase tracking-wider mb-2">Coach Quote</p>
                  <p className="text-sm text-gray-300 italic leading-relaxed">&ldquo;{data.coachNotes}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Contacts */}
            <div className={cardClass}>
              {sectionTitle("📞", "Contacts")}
              <div className="space-y-4">
                {/* Coach Contact */}
                {(data.coachPhone || data.coachEmail) && (
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-bold">HS Coach</p>
                    <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          {data.coachPhone && <p className="text-sm text-white">{data.coachPhone}</p>}
                          {data.coachEmail && <p className="text-xs text-gray-400 mt-0.5">{data.coachEmail}</p>}
                        </div>
                        <div className="flex gap-2">
                          {data.coachPhone && (
                            <a href={`tel:${data.coachPhone}`} className="w-8 h-8 rounded-lg bg-[#10B981]/20 border border-[#10B981]/30 flex items-center justify-center hover:bg-[#10B981]/30 transition-colors">
                              <span className="material-symbols-outlined text-[#10B981] text-[16px]">call</span>
                            </a>
                          )}
                          {data.coachPhone && (
                            <a href={`sms:${data.coachPhone}`} className="w-8 h-8 rounded-lg bg-[#d4af35]/20 border border-[#d4af35]/30 flex items-center justify-center hover:bg-[#d4af35]/30 transition-colors">
                              <span className="material-symbols-outlined text-[#d4af35] text-[16px]">sms</span>
                            </a>
                          )}
                          {data.coachEmail && (
                            <a href={`mailto:${data.coachEmail}`} className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center hover:bg-[#8B5CF6]/30 transition-colors">
                              <span className="material-symbols-outlined text-[#8B5CF6] text-[16px]">mail</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Parent 1 */}
                {(data.parent1Name || data.parent1Phone || data.parent1Email) && (
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-bold">Parent/Guardian 1</p>
                    <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          {data.parent1Name && <p className="text-sm text-white font-medium">{data.parent1Name}</p>}
                          {data.parent1Phone && <p className="text-xs text-gray-400 mt-0.5">{data.parent1Phone}</p>}
                          {data.parent1Email && <p className="text-xs text-gray-400 mt-0.5">{data.parent1Email}</p>}
                        </div>
                        <div className="flex gap-2">
                          {data.parent1Phone && (
                            <a href={`tel:${data.parent1Phone}`} className="w-8 h-8 rounded-lg bg-[#10B981]/20 border border-[#10B981]/30 flex items-center justify-center hover:bg-[#10B981]/30 transition-colors">
                              <span className="material-symbols-outlined text-[#10B981] text-[16px]">call</span>
                            </a>
                          )}
                          {data.parent1Phone && (
                            <a href={`sms:${data.parent1Phone}`} className="w-8 h-8 rounded-lg bg-[#d4af35]/20 border border-[#d4af35]/30 flex items-center justify-center hover:bg-[#d4af35]/30 transition-colors">
                              <span className="material-symbols-outlined text-[#d4af35] text-[16px]">sms</span>
                            </a>
                          )}
                          {data.parent1Email && (
                            <a href={`mailto:${data.parent1Email}`} className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center hover:bg-[#8B5CF6]/30 transition-colors">
                              <span className="material-symbols-outlined text-[#8B5CF6] text-[16px]">mail</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Parent 2 */}
                {(data.parent2Name || data.parent2Phone || data.parent2Email) && (
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-bold">Parent/Guardian 2</p>
                    <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          {data.parent2Name && <p className="text-sm text-white font-medium">{data.parent2Name}</p>}
                          {data.parent2Phone && <p className="text-xs text-gray-400 mt-0.5">{data.parent2Phone}</p>}
                          {data.parent2Email && <p className="text-xs text-gray-400 mt-0.5">{data.parent2Email}</p>}
                        </div>
                        <div className="flex gap-2">
                          {data.parent2Phone && (
                            <a href={`tel:${data.parent2Phone}`} className="w-8 h-8 rounded-lg bg-[#10B981]/20 border border-[#10B981]/30 flex items-center justify-center hover:bg-[#10B981]/30 transition-colors">
                              <span className="material-symbols-outlined text-[#10B981] text-[16px]">call</span>
                            </a>
                          )}
                          {data.parent2Phone && (
                            <a href={`sms:${data.parent2Phone}`} className="w-8 h-8 rounded-lg bg-[#d4af35]/20 border border-[#d4af35]/30 flex items-center justify-center hover:bg-[#d4af35]/30 transition-colors">
                              <span className="material-symbols-outlined text-[#d4af35] text-[16px]">sms</span>
                            </a>
                          )}
                          {data.parent2Email && (
                            <a href={`mailto:${data.parent2Email}`} className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center hover:bg-[#8B5CF6]/30 transition-colors">
                              <span className="material-symbols-outlined text-[#8B5CF6] text-[16px]">mail</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* No contacts fallback */}
                {!data.coachPhone && !data.coachEmail && !data.parent1Name && !data.parent1Phone && !data.parent1Email && !data.parent2Name && !data.parent2Phone && !data.parent2Email && (
                  <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-4 text-center">
                    <p className="text-sm text-gray-500">No contacts added</p>
                  </div>
                )}
              </div>
            </div>

            {/* Equipment Sizes */}
            <div className={cardClass}>
              {sectionTitle("👟", "Equipment Sizes")}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {statBox("Cleat", data.cleatSize)}
                {statBox("Shirt", data.shirtSize)}
                {statBox("Pants", data.pantsSize)}
                {statBox("Helmet", data.helmetSize)}
                {statBox("Gloves", data.gloveSize)}
              </div>
            </div>

            {/* Image Gallery */}
            <div className={`${cardClass} flex-1 flex flex-col`}>
              {sectionTitle("🖼️", "Image Gallery")}
              <div className="flex-1 grid grid-cols-2 gap-3 overflow-y-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent min-h-[200px]">
                {data.avatarUrl ? (
                  <>
                    {[data.avatarUrl, data.avatarUrl, data.avatarUrl, data.avatarUrl, data.avatarUrl, data.avatarUrl].map((src, i) => (
                      <div key={i} className="aspect-square rounded-[10px] overflow-hidden bg-black/40 relative">
                        <Image
                          src={src}
                          alt={`Gallery photo ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="col-span-2 flex-1 rounded-[10px] bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] flex items-center justify-center min-h-[200px]">
                    <div className="text-center text-gray-500">
                      <span className="material-symbols-outlined text-3xl mb-2 block">photo_library</span>
                      <p className="text-xs">No photos added</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Share Card */}
            <div className={`${cardClass} mt-auto`}>
              {sectionTitle("🔗", "Share Card")}
              <div className="space-y-3">
                {data.repmaxId ? (
                  <>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://repmax.io/card/${data.repmaxId}`);
                      }}
                      className="w-full py-3 rounded-[10px] bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] text-sm text-white font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                      Copy Card Link
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="w-full py-3 rounded-[10px] bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] text-sm text-white font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">print</span>
                      Print / Save PDF
                    </button>
                  </>
                ) : (
                  <div className="bg-[#1a1a1a] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-4 text-center">
                    <p className="text-sm text-gray-500">Complete your profile to share your card</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width: Documents & Recruiter Actions */}
        <div className={cardClass}>
          {sectionTitle("📄", "Documents & Recruiter Actions")}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "description", label: "Transcripts", desc: "Academic records" },
              { icon: "recommend", label: "Letters of Rec", desc: "Coach & teacher letters" },
              { icon: "folder", label: "Other Docs", desc: "Medical, eligibility" },
            ].map((doc) => (
              <div
                key={doc.label}
                className="bg-[#1a1a1a] border border-[#d4af35]/20 rounded-[10px] p-4 text-center hover:bg-[#1a1a1a]/80 hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#d4af35] text-2xl mb-2 block">{doc.icon}</span>
                <p className="text-sm font-bold text-white">{doc.label}</p>
                <p className="text-[10px] text-gray-500 mt-1">{doc.desc}</p>
              </div>
            ))}
            <div className="bg-[#d4af35] rounded-[10px] p-4 text-center hover:bg-[#c4a030] hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-black text-2xl mb-2">person_add</span>
              <p className="text-sm font-bold text-black">Add to Board</p>
              <p className="text-[10px] text-black/60 mt-1">Save to recruiting list</p>
            </div>
          </div>
        </div>

        {/* RepMax ID */}
        {data.repmaxId && (
          <div className="text-center py-2">
            <span className="text-xs font-mono text-[#d4af35]/50 bg-[#d4af35]/5 px-3 py-1 rounded-full border border-[#d4af35]/10">
              {data.repmaxId}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
