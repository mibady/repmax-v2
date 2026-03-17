'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useImageUpload, useDropzone } from '@/hooks/useImageUpload';

const positions = [
  'Quarterback', 'Running Back', 'Wide Receiver', 'Tight End',
  'Offensive Line', 'Defensive Line', 'Linebacker',
  'Cornerback', 'Safety', 'Kicker', 'Punter',
];

const currentYear = new Date().getFullYear();
const classYears = Array.from({ length: 5 }, (_, i) => currentYear + i);

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCpFOEUz_rfWWSVZf8V8mFWpvSX0XbEvnGhfEPVxD3mYrqKA6J94E78iBa_bR1caG28xt4BCjjnmdpZ8gfWL2lqcqVjfRncL7V0MxJBJxQQLl315vZyu2h6k9L5D4eNTwqVSBKB6cji7NJkO3WIoWyV4PeQrLPwNIgFa36RdDTOOR035pkGUVlwoADx0noxixr0W7lVDf9paHXe5l3fXR4SoKoRwegF0Uejyfdrq-vkbtjy7k-3snSTmQeCc6x5BHmksTTT1Aer9Qo';

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
  gpa: string;
  weightedGpa: string;
  coreGpa: string;
  sat: string;
  act: string;
  major: string;
  academicInterest: string;
  collegePriority: string;
  hudlLink: string;
  youtubeLink: string;
  coachNotes: string;
  playerSummary: string;
  ncaaEcId: string;
  coachPhone: string;
  coachEmail: string;
  phone: string;
  twitter: string;
  instagram: string;
  parent1Name: string;
  parent1Phone: string;
  parent1Email: string;
  parent2Name: string;
  parent2Phone: string;
  parent2Email: string;
  siblingsInfo: string;
  jerseyNumber: string;
  organizationName: string;
  awards: string;
  otherSports: string;
  campsAttended: string;
  dreamSchools: string;
  cleatSize: string;
  shirtSize: string;
  pantsSize: string;
  helmetSize: string;
  gloveSize: string;
}

const inputClass = 'w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-text-grey focus:border-primary focus:outline-none transition-colors';
const monoInputClass = `${inputClass} font-mono`;
const selectClass = 'w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-primary focus:outline-none transition-colors';
const labelClass = 'block text-sm text-text-grey mb-2';
const textareaClass = `${inputClass} resize-none`;

export default function CoachRosterEditPage(): React.JSX.Element {
  const params = useParams();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<AthleteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [rosterFound, setRosterFound] = useState(false);

  const { isUploading, progress, error: uploadError, upload } = useImageUpload({
    type: 'profile',
    onSuccess: (url) => {
      updateField('avatarUrl', url);
      // Also update the athlete's profile avatar_url via the API
      fetch(`/api/coach/athlete/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: url }),
      });
    },
  });

  const handleFileSelect = async (file: File) => {
    try {
      await upload(file);
    } catch {
      // Error handled in hook
    }
  };

  const { isDragging, dropzoneProps } = useDropzone(handleFileSelect);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/coach/athlete/${id}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to load athlete');
        }
        setData(await res.json());
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

    if (id) { load(); loadRoster(); }
  }, [id]);

  const updateField = useCallback((field: keyof AthleteData, value: string | number) => {
    setData(prev => prev ? { ...prev, [field]: value } : prev);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (data) updateField(name as keyof AthleteData, value);
  };

  const handleSave = async () => {
    if (!data) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/coach/athlete/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }
      if (rosterFound) {
        await fetch('/api/coach/roster', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ athlete_id: id, priority, notes }),
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Athlete not found'}</p>
          <Link href="/coach/roster" className="text-primary hover:underline">Return to roster</Link>
        </div>
      </div>
    );
  }

  const profileImage = data.avatarUrl || DEFAULT_AVATAR;
  const profileCompletion = Math.round(
    (Object.values(data).filter(v => v !== '' && v !== null && v !== 0).length / Object.keys(data).length) * 100
  );

  return (
    <div className="p-8">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
      />

      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/coach/roster/${id}`} className="flex items-center gap-2 text-text-grey hover:text-white transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">Edit Player Card</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${profileCompletion}%` }} />
              </div>
              <span className="text-sm text-text-grey">{profileCompletion}% Complete</span>
            </div>
            {saveSuccess && (
              <span className="text-sm text-green-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Saved!
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-primary text-black font-bold text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <div className="size-4 border-2 border-black border-t-transparent rounded-full animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href={`/card/${id}`}
              target="_blank"
              className="px-4 py-2 rounded-lg bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              View Card
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Photo */}
            <section className="rounded-xl bg-surface-dark border border-white/5 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">photo_camera</span>
                Profile Photo
              </h2>
              <div className="flex items-start gap-6">
                <div className="relative">
                  <div
                    {...dropzoneProps}
                    className={`h-32 w-32 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${
                      isDragging ? 'border-primary bg-primary/10' : 'border-white/20 bg-white/5'
                    } ${isUploading ? 'opacity-50' : ''}`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-text-grey">{progress}%</span>
                      </div>
                    ) : (
                      <Image src={profileImage} alt="Profile" width={128} height={128} className="object-cover w-full h-full" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary text-black flex items-center justify-center shadow-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-grey mb-3">
                    Upload an action shot or headshot. This will be the main image on the card.
                  </p>
                  {uploadError && <p className="text-sm text-red-400 mb-3">{uploadError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? 'Uploading...' : 'Upload Photo'}
                    </button>
                  </div>
                  <p className="text-xs text-text-grey mt-2">Drag and drop or click to upload. Max 5MB. JPEG, PNG, WebP, or GIF.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                <div>
                  <label className={labelClass}>Organization/Team Name</label>
                  <input type="text" name="organizationName" value={data.organizationName} onChange={handleChange} placeholder="SoCal Elite 7v7" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Jersey Number</label>
                  <input type="text" name="jerseyNumber" value={data.jerseyNumber} onChange={handleChange} placeholder="#7" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={labelClass}>Twitter</label>
                  <input type="text" name="twitter" value={data.twitter} onChange={handleChange} placeholder="@handle" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Instagram</label>
                  <input type="text" name="instagram" value={data.instagram} onChange={handleChange} placeholder="@handle" className={inputClass} />
                </div>
              </div>
            </section>

            {/* Basic Information */}
            <section className="rounded-xl bg-surface-dark border border-white/5 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" name="name" value={data.name} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Primary Position</label>
                  <select name="position" value={data.position} onChange={handleChange} className={selectClass}>
                    <option value="" className="bg-surface-dark">Select position</option>
                    {positions.map(pos => <option key={pos} value={pos} className="bg-surface-dark">{pos}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Secondary Position</label>
                  <select name="secondaryPosition" value={data.secondaryPosition} onChange={handleChange} className={selectClass}>
                    <option value="" className="bg-surface-dark">None</option>
                    {positions.map(pos => <option key={pos} value={pos} className="bg-surface-dark">{pos}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Class Year</label>
                  <select name="classYear" value={data.classYear} onChange={(e) => updateField('classYear', parseInt(e.target.value))} className={selectClass}>
                    {classYears.map(y => <option key={y} value={y} className="bg-surface-dark">{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>High School</label>
                  <input type="text" name="highSchool" value={data.highSchool} onChange={handleChange} className={inputClass} />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className={labelClass}>City</label>
                    <input type="text" name="city" value={data.city} onChange={handleChange} className={inputClass} />
                  </div>
                  <div className="w-24">
                    <label className={labelClass}>State</label>
                    <input type="text" name="state" value={data.state} onChange={handleChange} maxLength={2} className={`${inputClass} uppercase`} />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Bio</label>
                  <textarea name="bio" value={data.bio} onChange={handleChange} maxLength={280} rows={3} placeholder="Tell coaches about this athlete..." className={textareaClass} />
                  <p className="text-xs text-text-grey mt-1">{data.bio.length}/280 characters</p>
                </div>
              </div>

              {/* Parent/Guardian subsection */}
              <div className="border-t border-white/5 mt-6 pt-6">
                <h3 className="text-sm font-semibold text-text-grey uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">family_restroom</span>
                  Parent/Guardian Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-text-grey mb-2 font-medium">Parent/Guardian 1</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>Name</label>
                        <input type="text" name="parent1Name" value={data.parent1Name} onChange={handleChange} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Phone</label>
                        <input type="tel" name="parent1Phone" value={data.parent1Phone} onChange={handleChange} placeholder="(555) 123-4567" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Email</label>
                        <input type="email" name="parent1Email" value={data.parent1Email} onChange={handleChange} placeholder="parent@email.com" className={inputClass} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-text-grey mb-2 font-medium">Parent/Guardian 2</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>Name</label>
                        <input type="text" name="parent2Name" value={data.parent2Name} onChange={handleChange} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Phone</label>
                        <input type="tel" name="parent2Phone" value={data.parent2Phone} onChange={handleChange} placeholder="(555) 123-4567" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Email</label>
                        <input type="email" name="parent2Email" value={data.parent2Email} onChange={handleChange} placeholder="parent@email.com" className={inputClass} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Siblings</label>
                    <textarea name="siblingsInfo" value={data.siblingsInfo} onChange={handleChange} rows={2} placeholder="Names, ages, schools, sports..." className={textareaClass} />
                  </div>
                </div>
              </div>
            </section>

            {/* Measurables */}
            <section className="rounded-xl bg-surface-dark border border-white/5 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">straighten</span>
                Measurables
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>Height</label>
                  <input type="text" name="height" value={data.height} onChange={handleChange} placeholder={`6'1"`} className={monoInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Weight (lbs)</label>
                  <input type="text" name="weight" value={data.weight} onChange={handleChange} placeholder="185" className={monoInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Wingspan (in)</label>
                  <input type="text" name="wingspan" value={data.wingspan} onChange={handleChange} placeholder="74" className={monoInputClass} />
                </div>
                <div>
                  <label className={labelClass}>40-Yard (s)</label>
                  <input type="text" name="fortyYard" value={data.fortyYard} onChange={handleChange} placeholder="4.52" className={`${monoInputClass} text-primary`} />
                </div>
                <div>
                  <label className={labelClass}>10Y Split (s)</label>
                  <input type="text" name="tenYardSplit" value={data.tenYardSplit} onChange={handleChange} placeholder="1.55" className={monoInputClass} />
                </div>
                <div>
                  <label className={labelClass}>5-10-5 (s)</label>
                  <input type="text" name="fiveTenFive" value={data.fiveTenFive} onChange={handleChange} placeholder="4.35" className={monoInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Broad Jump (in)</label>
                  <input type="text" name="broadJump" value={data.broadJump} onChange={handleChange} placeholder="120" className={monoInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Bench Press (lbs)</label>
                  <input type="text" name="benchPress" value={data.benchPress} onChange={handleChange} placeholder="225" className={monoInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Squat (lbs)</label>
                  <input type="text" name="squat" value={data.squat} onChange={handleChange} placeholder="405" className={monoInputClass} />
                </div>
                <div>
                  <label className={labelClass}>Vertical (in)</label>
                  <input type="text" name="vertical" value={data.vertical} onChange={handleChange} placeholder="36" className={monoInputClass} />
                </div>
              </div>

              {/* Equipment Sizes subsection */}
              <div className="border-t border-white/5 mt-6 pt-6">
                <h3 className="text-sm font-semibold text-text-grey uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">checkroom</span>
                  Equipment Sizes
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className={labelClass}>Cleat Size</label>
                    <input type="text" name="cleatSize" value={data.cleatSize} onChange={handleChange} placeholder="10.5" className={monoInputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Shirt</label>
                    <select name="shirtSize" value={data.shirtSize} onChange={handleChange} className={selectClass}>
                      <option value="" className="bg-surface-dark">-</option>
                      {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(s => <option key={s} value={s} className="bg-surface-dark">{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Pants</label>
                    <select name="pantsSize" value={data.pantsSize} onChange={handleChange} className={selectClass}>
                      <option value="" className="bg-surface-dark">-</option>
                      {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(s => <option key={s} value={s} className="bg-surface-dark">{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Helmet</label>
                    <select name="helmetSize" value={data.helmetSize} onChange={handleChange} className={selectClass}>
                      <option value="" className="bg-surface-dark">-</option>
                      {['S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s} className="bg-surface-dark">{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Gloves</label>
                    <select name="gloveSize" value={data.gloveSize} onChange={handleChange} className={selectClass}>
                      <option value="" className="bg-surface-dark">-</option>
                      {['S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s} className="bg-surface-dark">{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Academics & Recruiting */}
            <section className="rounded-xl bg-surface-dark border border-white/5 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">school</span>
                Academics & Recruiting
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>GPA</label>
                    <input type="text" name="gpa" value={data.gpa} onChange={handleChange} placeholder="3.8" className={monoInputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Weighted GPA</label>
                    <input type="text" name="weightedGpa" value={data.weightedGpa} onChange={handleChange} placeholder="4.2" className={monoInputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>SAT Score</label>
                    <input type="text" name="sat" value={data.sat} onChange={handleChange} placeholder="1280" className={monoInputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>ACT Score</label>
                    <input type="text" name="act" value={data.act} onChange={handleChange} placeholder="28" className={monoInputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Academic Interest</label>
                  <input type="text" name="academicInterest" value={data.academicInterest} onChange={handleChange} placeholder="Business, Engineering, Undecided..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>College Priority</label>
                  <textarea name="collegePriority" value={data.collegePriority} onChange={handleChange} rows={2} placeholder="What's important when selecting a college?" className={textareaClass} />
                </div>
                <div>
                  <label className={labelClass}>Awards</label>
                  <textarea name="awards" value={data.awards} onChange={handleChange} rows={2} placeholder="Academic and sports awards..." className={textareaClass} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Other Sports</label>
                    <input type="text" name="otherSports" value={data.otherSports} onChange={handleChange} placeholder="Track, Basketball..." className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Dream Schools</label>
                    <input type="text" name="dreamSchools" value={data.dreamSchools} onChange={handleChange} placeholder="USC, Oregon, UCLA..." className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Camps Attended</label>
                  <textarea name="campsAttended" value={data.campsAttended} onChange={handleChange} rows={2} placeholder="Nike Elite 11, Rivals Camp..." className={textareaClass} />
                </div>
              </div>
            </section>

            {/* Film & Highlights */}
            <section className="rounded-xl bg-surface-dark border border-white/5 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">smart_display</span>
                Film & Highlights
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Hudl Profile Link</label>
                  <input type="url" name="hudlLink" value={data.hudlLink} onChange={handleChange} placeholder="https://www.hudl.com/profile/..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>YouTube Highlight Reel</label>
                  <input type="url" name="youtubeLink" value={data.youtubeLink} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=..." className={inputClass} />
                </div>
              </div>
            </section>

            {/* Coach Notes & Summary */}
            <section className="rounded-xl bg-surface-dark border border-white/5 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">sports</span>
                Coach Notes & Summary
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Coach Notes</label>
                  <textarea name="coachNotes" value={data.coachNotes} onChange={handleChange} rows={3} placeholder="Coach intangibles, work ethic, leadership..." className={textareaClass} />
                </div>
                <div>
                  <label className={labelClass}>Player Summary</label>
                  <textarea name="playerSummary" value={data.playerSummary} onChange={handleChange} rows={3} placeholder="Player summary and best program fit..." className={textareaClass} />
                </div>
              </div>
            </section>

            {/* NCAA ID / Recruiting # */}
            <section className="rounded-xl bg-surface-dark border border-white/5 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">verified</span>
                NCAA ID / Recruiting #
              </h2>
              <p className="text-xs text-text-grey mb-4">If applicable</p>
              <div>
                <label className={labelClass}>NCAA ID</label>
                <input type="text" name="ncaaEcId" value={data.ncaaEcId} onChange={handleChange} placeholder="e.g. 2503129456" className={inputClass} />
              </div>
            </section>

            {/* HS Coach Contact */}
            <section className="rounded-xl bg-surface-dark border border-white/5 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">contact_phone</span>
                HS Coach Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Coach Phone</label>
                  <input type="tel" name="coachPhone" value={data.coachPhone} onChange={handleChange} placeholder="(555) 123-4567" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Coach Email</label>
                  <input type="email" name="coachEmail" value={data.coachEmail} onChange={handleChange} placeholder="coach@school.edu" className={inputClass} />
                </div>
              </div>
            </section>

            {/* Roster Management (Coach-only) */}
            <section className="rounded-xl bg-surface-dark border border-white/5 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">assignment</span>
                Roster Management
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Roster Priority</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)} className={selectClass}>
                    <option value="low" className="bg-surface-dark">Low</option>
                    <option value="medium" className="bg-surface-dark">Medium</option>
                    <option value="high" className="bg-surface-dark">High</option>
                    <option value="top" className="bg-surface-dark">Top</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Internal Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Internal roster notes (not visible to athlete)..." className={textareaClass} />
                </div>
              </div>
            </section>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-sm font-medium text-text-grey mb-4">LIVE PREVIEW</h3>
              <div className="rounded-2xl bg-[#0A0A0A] border border-white/10 overflow-hidden shadow-2xl max-h-[80vh] overflow-y-auto">
                {/* Hero Image */}
                <div className="relative aspect-[4/3] bg-gradient-to-b from-[#1a1a1a] to-[#0A0A0A] overflow-hidden">
                  <Image src={profileImage} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                </div>
                {/* Identity */}
                <div className="p-4 -mt-8 relative z-10">
                  <h4 className="text-xl font-bold text-white">{data.name || 'Athlete Name'}</h4>
                  <p className="text-sm text-text-grey">
                    {[data.highSchool, data.city, data.state].filter(Boolean).join(', ')}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {data.position && (
                      <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold">{data.position}</span>
                    )}
                    {data.secondaryPosition && (
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-bold">{data.secondaryPosition}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 border-y border-white/5 py-3 text-xs">
                    <div className="text-center">
                      <p className="text-text-grey uppercase tracking-wider">Class</p>
                      <p className="text-white font-bold mt-1">{data.classYear}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-text-grey uppercase tracking-wider">GPA</p>
                      <p className="text-white font-bold font-mono mt-1">{data.gpa || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-text-grey uppercase tracking-wider">40-Yard</p>
                      <p className="text-primary font-bold font-mono mt-1">{data.fortyYard ? `${data.fortyYard}s` : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
