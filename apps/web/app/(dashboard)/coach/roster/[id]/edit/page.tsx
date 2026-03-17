'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const positions = [
  'Quarterback', 'Running Back', 'Wide Receiver', 'Tight End',
  'Offensive Line', 'Defensive Line', 'Linebacker',
  'Cornerback', 'Safety', 'Kicker', 'Punter',
];

const currentYear = new Date().getFullYear();
const classYears = Array.from({ length: 5 }, (_, i) => currentYear + i);

interface AthleteData {
  athleteId: string;
  name: string;
  avatarUrl: string;
  position: string;
  secondaryPosition: string;
  classYear: number;
  highSchool: string;
  city: string;
  state: string;
  bio: string;
  zone: string;
  // Measurables
  height: string;
  weight: string;
  fortyYard: string;
  tenYardSplit: string;
  fiveTenFive: string;
  broadJump: string;
  vertical: string;
  wingspan: string;
  benchPress: string;
  squat: string;
  // Academics
  gpa: string;
  weightedGpa: string;
  coreGpa: string;
  sat: string;
  act: string;
  major: string;
  academicInterest: string;
  collegePriority: string;
  // Film
  hudlLink: string;
  youtubeLink: string;
  // Coach assessment
  coachNotes: string;
  playerSummary: string;
  ncaaEcId: string;
  coachPhone: string;
  coachEmail: string;
  // Contact & Social
  phone: string;
  twitter: string;
  instagram: string;
  // Parent/Guardian
  parent1Name: string;
  parent1Phone: string;
  parent1Email: string;
  parent2Name: string;
  parent2Phone: string;
  parent2Email: string;
  siblingsInfo: string;
  // Team
  jerseyNumber: string;
  organizationName: string;
  // Recruiting
  awards: string;
  otherSports: string;
  campsAttended: string;
  dreamSchools: string;
  // Equipment
  cleatSize: string;
  shirtSize: string;
  pantsSize: string;
  helmetSize: string;
  gloveSize: string;
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5 px-1">
      <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
      <h2 className="text-lg font-bold tracking-tight text-white">{title}</h2>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', half = false }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  half?: boolean;
}) {
  return (
    <div className={half ? '' : 'col-span-full sm:col-span-1'}>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-slate-600"
      />
    </div>
  );
}

export default function CoachRosterEditPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<AthleteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Also load roster entry for priority/notes
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [rosterFound, setRosterFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/coach/athlete/${id}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to load athlete');
        }
        const athleteData = await res.json();
        setData(athleteData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    }

    async function loadRoster() {
      try {
        const res = await fetch('/api/coach/dashboard');
        if (!res.ok) return;
        const dashData = await res.json();
        const entry = dashData.roster?.find(
          (r: { id: string; priority?: string; notes?: string }) => r.id === id
        );
        if (entry) {
          setRosterFound(true);
          setPriority(entry.priority || 'medium');
          setNotes(entry.notes || '');
        }
      } catch { /* ignore */ }
    }

    if (id) {
      load();
      loadRoster();
    }
  }, [id]);

  const updateField = useCallback((field: keyof AthleteData, value: string | number) => {
    setData(prev => prev ? { ...prev, [field]: value } : prev);
  }, []);

  const handleSave = async () => {
    if (!data) return;
    setIsSaving(true);

    try {
      // Save athlete data
      const res = await fetch(`/api/coach/athlete/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      // Save roster entry (priority/notes) if found
      if (rosterFound) {
        await fetch('/api/coach/roster', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ athlete_id: id, priority, notes }),
        });
      }

      toast.success('Changes saved successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
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

  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-3">error</span>
          <h3 className="text-white font-semibold mb-2">Failed to load athlete</h3>
          <p className="text-slate-400 text-sm">{error || 'Athlete not found'}</p>
        </div>
      </div>
    );
  }

  const initials = data.name ? data.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';

  return (
    <div className="h-full overflow-y-auto pb-32">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href={`/coach/roster/${id}`} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Athlete
          </Link>
          <Link href={`/card/${id}`} target="_blank" className="flex items-center gap-1.5 text-primary text-sm hover:underline">
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            View Public Card
          </Link>
        </div>

        {/* Title + Avatar */}
        <div className="flex items-center gap-5 mb-8">
          <div className="size-16 rounded-full bg-[#2A2A2E] border-2 border-primary/30 flex items-center justify-center overflow-hidden shrink-0">
            {data.avatarUrl ? (
              <img src={data.avatarUrl} alt={data.name} className="size-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-white/40">{initials}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Player Card</h1>
            <p className="text-slate-400 text-sm">{data.name} &middot; {data.position || 'No position'} &middot; Class of {data.classYear}</p>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Basic Information */}
          <section className="bg-[#1A1A1D] rounded-xl border border-white/10 p-6">
            <SectionHeader icon="person" title="Basic Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" value={data.name} onChange={v => updateField('name', v)} placeholder="Athlete name" />
              <Field label="Jersey #" value={data.jerseyNumber} onChange={v => updateField('jerseyNumber', v)} placeholder="#" />
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Primary Position</label>
                <select
                  value={data.position}
                  onChange={e => updateField('position', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select position</option>
                  {positions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Secondary Position</label>
                <select
                  value={data.secondaryPosition}
                  onChange={e => updateField('secondaryPosition', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">None</option>
                  {positions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Class Year</label>
                <select
                  value={data.classYear}
                  onChange={e => updateField('classYear', parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  {classYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <Field label="High School" value={data.highSchool} onChange={v => updateField('highSchool', v)} placeholder="School name" />
              <Field label="City" value={data.city} onChange={v => updateField('city', v)} placeholder="City" />
              <Field label="State" value={data.state} onChange={v => updateField('state', v)} placeholder="CA" />
              <div className="col-span-full">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bio</label>
                <textarea
                  value={data.bio}
                  onChange={e => updateField('bio', e.target.value)}
                  placeholder="Brief bio about the athlete..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-600 resize-none"
                />
              </div>
            </div>
          </section>

          {/* Measurables */}
          <section className="bg-[#1A1A1D] rounded-xl border border-white/10 p-6">
            <SectionHeader icon="straighten" title="Measurables" />
            <p className="text-xs text-yellow-500/80 mb-4 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Coach-verified data takes priority over athlete-entered values
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <Field label="Height" value={data.height} onChange={v => updateField('height', v)} placeholder={`6'1"`} />
              <Field label="Weight (lbs)" value={data.weight} onChange={v => updateField('weight', v)} placeholder="185" />
              <Field label="40-Yard (s)" value={data.fortyYard} onChange={v => updateField('fortyYard', v)} placeholder="4.60" />
              <Field label="10Y Split (s)" value={data.tenYardSplit} onChange={v => updateField('tenYardSplit', v)} placeholder="1.55" />
              <Field label="5-10-5 (s)" value={data.fiveTenFive} onChange={v => updateField('fiveTenFive', v)} placeholder="4.30" />
              <Field label="Broad Jump (in)" value={data.broadJump} onChange={v => updateField('broadJump', v)} placeholder="120" />
              <Field label="Vertical (in)" value={data.vertical} onChange={v => updateField('vertical', v)} placeholder="36" />
              <Field label="Wingspan (in)" value={data.wingspan} onChange={v => updateField('wingspan', v)} placeholder="74" />
              <Field label="Bench (lbs)" value={data.benchPress} onChange={v => updateField('benchPress', v)} placeholder="225" />
              <Field label="Squat (lbs)" value={data.squat} onChange={v => updateField('squat', v)} placeholder="405" />
            </div>
          </section>

          {/* Academics */}
          <section className="bg-[#1A1A1D] rounded-xl border border-white/10 p-6">
            <SectionHeader icon="school" title="Academics" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="GPA" value={data.gpa} onChange={v => updateField('gpa', v)} placeholder="3.50" />
              <Field label="Weighted GPA" value={data.weightedGpa} onChange={v => updateField('weightedGpa', v)} placeholder="4.10" />
              <Field label="Core GPA" value={data.coreGpa} onChange={v => updateField('coreGpa', v)} placeholder="3.40" />
              <Field label="SAT" value={data.sat} onChange={v => updateField('sat', v)} placeholder="1200" />
              <Field label="ACT" value={data.act} onChange={v => updateField('act', v)} placeholder="28" />
              <Field label="Desired Major" value={data.major} onChange={v => updateField('major', v)} placeholder="Business" />
              <Field label="Academic Interest" value={data.academicInterest} onChange={v => updateField('academicInterest', v)} placeholder="Engineering, Pre-Med..." />
              <Field label="College Priority" value={data.collegePriority} onChange={v => updateField('collegePriority', v)} placeholder="Academics, athletics..." />
            </div>
          </section>

          {/* Film */}
          <section className="bg-[#1A1A1D] rounded-xl border border-white/10 p-6">
            <SectionHeader icon="smart_display" title="Film & Highlights" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Hudl Link" value={data.hudlLink} onChange={v => updateField('hudlLink', v)} placeholder="https://www.hudl.com/..." />
              <Field label="YouTube Link" value={data.youtubeLink} onChange={v => updateField('youtubeLink', v)} placeholder="https://youtube.com/..." />
            </div>
          </section>

          {/* Coach Assessment */}
          <section className="bg-[#1A1A1D] rounded-xl border border-white/10 p-6">
            <SectionHeader icon="sports" title="Coach Assessment" />
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Coach Notes</label>
                <textarea
                  value={data.coachNotes}
                  onChange={e => updateField('coachNotes', e.target.value)}
                  placeholder="Your observations, strengths, areas for improvement..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-600 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Player Summary</label>
                <textarea
                  value={data.playerSummary}
                  onChange={e => updateField('playerSummary', e.target.value)}
                  placeholder="Recruiting summary visible on the player card..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-600 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="NCAA ID" value={data.ncaaEcId} onChange={v => updateField('ncaaEcId', v)} placeholder="NCAA eligibility center ID" />
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Roster Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="top">Top</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Roster Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Internal notes about this roster entry..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-600 resize-none"
                />
              </div>
            </div>
          </section>

          {/* Coach Contact */}
          <section className="bg-[#1A1A1D] rounded-xl border border-white/10 p-6">
            <SectionHeader icon="call" title="Coach Contact (shown on card)" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Coach Phone" value={data.coachPhone} onChange={v => updateField('coachPhone', v)} placeholder="(555) 123-4567" />
              <Field label="Coach Email" value={data.coachEmail} onChange={v => updateField('coachEmail', v)} placeholder="coach@school.edu" />
            </div>
          </section>

          {/* Athlete Contact & Social */}
          <section className="bg-[#1A1A1D] rounded-xl border border-white/10 p-6">
            <SectionHeader icon="contacts" title="Athlete Contact & Social" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Phone" value={data.phone} onChange={v => updateField('phone', v)} placeholder="(555) 123-4567" />
              <Field label="Twitter / X" value={data.twitter} onChange={v => updateField('twitter', v)} placeholder="@handle" />
              <Field label="Instagram" value={data.instagram} onChange={v => updateField('instagram', v)} placeholder="@handle" />
            </div>
          </section>

          {/* Parent/Guardian Information */}
          <section className="bg-[#1A1A1D] rounded-xl border border-white/10 p-6">
            <SectionHeader icon="family_restroom" title="Parent/Guardian Information" />
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Parent/Guardian 1</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Name" value={data.parent1Name} onChange={v => updateField('parent1Name', v)} placeholder="Full name" />
                  <Field label="Phone" value={data.parent1Phone} onChange={v => updateField('parent1Phone', v)} placeholder="(555) 123-4567" />
                  <Field label="Email" value={data.parent1Email} onChange={v => updateField('parent1Email', v)} placeholder="parent@email.com" />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Parent/Guardian 2</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Name" value={data.parent2Name} onChange={v => updateField('parent2Name', v)} placeholder="Full name" />
                  <Field label="Phone" value={data.parent2Phone} onChange={v => updateField('parent2Phone', v)} placeholder="(555) 123-4567" />
                  <Field label="Email" value={data.parent2Email} onChange={v => updateField('parent2Email', v)} placeholder="parent@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Siblings / Family Info</label>
                <textarea
                  value={data.siblingsInfo}
                  onChange={e => updateField('siblingsInfo', e.target.value)}
                  placeholder="Siblings, family athletic background..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-600 resize-none"
                />
              </div>
            </div>
          </section>

          {/* Team Info */}
          <section className="bg-[#1A1A1D] rounded-xl border border-white/10 p-6">
            <SectionHeader icon="groups" title="Team / Organization" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Organization Name" value={data.organizationName} onChange={v => updateField('organizationName', v)} placeholder="7v7 club, travel team..." />
              <Field label="Jersey #" value={data.jerseyNumber} onChange={v => updateField('jerseyNumber', v)} placeholder="#" />
            </div>
          </section>

          {/* Recruiting */}
          <section className="bg-[#1A1A1D] rounded-xl border border-white/10 p-6">
            <SectionHeader icon="emoji_events" title="Recruiting & Awards" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-full">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Awards & Honors</label>
                <textarea
                  value={data.awards}
                  onChange={e => updateField('awards', e.target.value)}
                  placeholder="All-State, Team MVP, Camp awards..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-600 resize-none"
                />
              </div>
              <Field label="Other Sports" value={data.otherSports} onChange={v => updateField('otherSports', v)} placeholder="Track, Basketball..." />
              <Field label="Camps Attended" value={data.campsAttended} onChange={v => updateField('campsAttended', v)} placeholder="Nike Opening, Under Armour..." />
              <div className="col-span-full">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Dream Schools</label>
                <textarea
                  value={data.dreamSchools}
                  onChange={e => updateField('dreamSchools', e.target.value)}
                  placeholder="Top schools the athlete is interested in..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-600 resize-none"
                />
              </div>
            </div>
          </section>

          {/* Equipment Sizes */}
          <section className="bg-[#1A1A1D] rounded-xl border border-white/10 p-6">
            <SectionHeader icon="checkroom" title="Equipment Sizes" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <Field label="Cleats" value={data.cleatSize} onChange={v => updateField('cleatSize', v)} placeholder="11" />
              <Field label="Shirt" value={data.shirtSize} onChange={v => updateField('shirtSize', v)} placeholder="L" />
              <Field label="Pants" value={data.pantsSize} onChange={v => updateField('pantsSize', v)} placeholder="34" />
              <Field label="Helmet" value={data.helmetSize} onChange={v => updateField('helmetSize', v)} placeholder="L" />
              <Field label="Gloves" value={data.gloveSize} onChange={v => updateField('gloveSize', v)} placeholder="L" />
            </div>
          </section>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/10 p-4 md:pl-72 flex justify-center">
        <div className="max-w-4xl w-full flex items-center justify-between px-6">
          <p className="text-sm text-slate-500 hidden md:block">
            Editing {data.name}&apos;s player card
          </p>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => router.back()}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold border border-white/10 text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 md:flex-none px-8 py-2.5 rounded-lg text-sm font-black bg-primary text-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving && <div className="size-4 rounded-full border-2 border-black border-t-transparent animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
