'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useOnboardingProfile, ProfileUpdateData } from '@/lib/hooks/use-onboarding-profile';

// Position options for dropdown
const POSITIONS = [
  'QB', 'RB', 'WR', 'TE', 'OL', 'OT', 'OG', 'C',
  'DL', 'DE', 'DT', 'LB', 'CB', 'S', 'DB',
  'K', 'P', 'LS', 'ATH'
];

// US States for dropdown
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// Class years
const CLASS_YEARS = [2024, 2025, 2026, 2027, 2028, 2029];

// Onboarding steps
type OnboardingStep = 'personal' | 'school' | 'measurables' | 'academics' | 'review';

const STEPS: { id: OnboardingStep; label: string; icon: string }[] = [
  { id: 'personal', label: 'Personal Info', icon: 'person' },
  { id: 'school', label: 'School & Position', icon: 'school' },
  { id: 'measurables', label: 'Athletic Measurables', icon: 'fitness_center' },
  { id: 'academics', label: 'Academics', icon: 'menu_book' },
  { id: 'review', label: 'Review & Complete', icon: 'check_circle' },
];

export default function OnboardingChatPage() {
  const router = useRouter();
  const {
    profile,
    athlete,
    completion,
    isLoading,
    isSaving,
    error,
    updateProfile,
    formatHeight,
    parseHeight,
  } = useOnboardingProfile();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('personal');
  const [formData, setFormData] = useState<ProfileUpdateData>({});
  const [heightFeet, setHeightFeet] = useState<number>(6);
  const [heightInches, setHeightInches] = useState<number>(0);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile || athlete) {
      setFormData({
        full_name: profile?.full_name || '',
        high_school: athlete?.high_school || '',
        city: athlete?.city || '',
        state: athlete?.state || '',
        class_year: athlete?.class_year || new Date().getFullYear() + 1,
        primary_position: athlete?.primary_position || '',
        secondary_position: athlete?.secondary_position || null,
        height_inches: athlete?.height_inches || null,
        weight_lbs: athlete?.weight_lbs || null,
        forty_yard_time: athlete?.forty_yard_time || null,
        vertical_inches: athlete?.vertical_inches || null,
        gpa: athlete?.gpa || null,
        sat_score: athlete?.sat_score || null,
        act_score: athlete?.act_score || null,
        ncaa_id: athlete?.ncaa_id || null,
      });

      // Set height feet/inches from total inches
      if (athlete?.height_inches) {
        setHeightFeet(Math.floor(athlete.height_inches / 12));
        setHeightInches(athlete.height_inches % 12);
      }
    }
  }, [profile, athlete]);

  // Handle form field changes
  const handleChange = (field: keyof ProfileUpdateData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle height changes
  const handleHeightChange = (feet: number, inches: number) => {
    setHeightFeet(feet);
    setHeightInches(inches);
    const totalInches = parseHeight(feet, inches);
    setFormData(prev => ({ ...prev, height_inches: totalInches }));
  };

  // Save current step data
  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setSaveMessage('Saved!');
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  // Move to next step
  const handleNext = async () => {
    await handleSave();
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
  };

  // Move to previous step
  const handlePrevious = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  // Complete onboarding
  const handleComplete = async () => {
    await handleSave();
    router.push('/dashboard');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="min-h-screen bg-background-dark flex">
      {/* Left Panel: Navigation */}
      <aside className="w-20 lg:w-64 flex-shrink-0 border-r border-surface-light/30 bg-[#0a0a0a] flex flex-col justify-between p-4 hidden md:flex">
        <div className="flex flex-col gap-8">
          {/* Logo Area */}
          <div className="flex items-center gap-3 pl-2">
            <div className="bg-primary/20 p-2 rounded-lg">
              <span className="material-symbols-outlined text-primary text-2xl">sports_football</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden lg:block">RepMax</h1>
          </div>

          {/* Onboarding Steps Nav */}
          <nav className="flex flex-col gap-2">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all text-left ${
                    isActive
                      ? 'bg-surface-dark border border-primary/20 text-white'
                      : isCompleted
                      ? 'hover:bg-surface-dark/50 text-primary'
                      : 'hover:bg-surface-dark/50 text-gray-400'
                  }`}
                >
                  <span className={`material-symbols-outlined ${isActive ? 'text-primary' : ''}`}>
                    {isCompleted ? 'check_circle' : step.icon}
                  </span>
                  <span className="font-medium text-sm hidden lg:block">{step.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-2">
          <Link
            className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-surface-dark/50 text-gray-400 hover:text-white transition-colors"
            href="/dashboard"
          >
            <span className="material-symbols-outlined">close</span>
            <span className="font-medium text-sm hidden lg:block">Skip for Now</span>
          </Link>
        </div>
      </aside>

      {/* Center Panel: Form */}
      <main className="flex-1 flex flex-col min-w-0 bg-background-dark relative">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-surface-light/30 bg-background-dark/95 backdrop-blur z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <span className="material-symbols-outlined text-white">menu</span>
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                Complete Your Profile
                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-wider font-bold">
                  Step {currentStepIndex + 1} of {STEPS.length}
                </span>
              </h2>
              <p className="text-xs text-gray-400">{STEPS[currentStepIndex].label}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {saveMessage && (
              <span className="text-xs text-green-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check</span>
                {saveMessage}
              </span>
            )}
            {isSaving && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                Saving...
              </span>
            )}
          </div>
        </header>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-32">
          <div className="max-w-2xl mx-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error.message}
              </div>
            )}

            {/* Personal Info Step */}
            {currentStep === 'personal' && (
              <div className="space-y-6">
                <div className="bg-surface-dark rounded-xl p-6 border border-white/5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">person</span>
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={formData.full_name || ''}
                        onChange={(e) => handleChange('full_name', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* School & Position Step */}
            {currentStep === 'school' && (
              <div className="space-y-6">
                <div className="bg-surface-dark rounded-xl p-6 border border-white/5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">school</span>
                    School Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">High School *</label>
                      <input
                        type="text"
                        value={formData.high_school || ''}
                        onChange={(e) => handleChange('high_school', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none"
                        placeholder="Enter your high school name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                      <input
                        type="text"
                        value={formData.city || ''}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">State *</label>
                      <select
                        value={formData.state || ''}
                        onChange={(e) => handleChange('state', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary/50 focus:outline-none"
                      >
                        <option value="">Select State</option>
                        {US_STATES.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Class Year *</label>
                      <select
                        value={formData.class_year || ''}
                        onChange={(e) => handleChange('class_year', parseInt(e.target.value))}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary/50 focus:outline-none"
                      >
                        <option value="">Select Year</option>
                        {CLASS_YEARS.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Primary Position *</label>
                      <select
                        value={formData.primary_position || ''}
                        onChange={(e) => handleChange('primary_position', e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary/50 focus:outline-none"
                      >
                        <option value="">Select Position</option>
                        {POSITIONS.map(pos => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Secondary Position</label>
                      <select
                        value={formData.secondary_position || ''}
                        onChange={(e) => handleChange('secondary_position', e.target.value || null)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary/50 focus:outline-none"
                      >
                        <option value="">None</option>
                        {POSITIONS.map(pos => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Measurables Step */}
            {currentStep === 'measurables' && (
              <div className="space-y-6">
                <div className="bg-surface-dark rounded-xl p-6 border border-white/5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">fitness_center</span>
                    Athletic Measurables
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">These help recruiters find you. Add what you have verified.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Height</label>
                      <div className="flex gap-2">
                        <select
                          value={heightFeet}
                          onChange={(e) => handleHeightChange(parseInt(e.target.value), heightInches)}
                          className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary/50 focus:outline-none"
                        >
                          {[5, 6, 7].map(f => (
                            <option key={f} value={f}>{f} ft</option>
                          ))}
                        </select>
                        <select
                          value={heightInches}
                          onChange={(e) => handleHeightChange(heightFeet, parseInt(e.target.value))}
                          className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary/50 focus:outline-none"
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i}>{i} in</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Weight (lbs)</label>
                      <input
                        type="number"
                        value={formData.weight_lbs || ''}
                        onChange={(e) => handleChange('weight_lbs', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none"
                        placeholder="185"
                        min={80}
                        max={400}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">40-Yard Dash (seconds)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.forty_yard_time || ''}
                        onChange={(e) => handleChange('forty_yard_time', e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none"
                        placeholder="4.52"
                        min={3.5}
                        max={8}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Vertical Jump (inches)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.vertical_inches || ''}
                        onChange={(e) => handleChange('vertical_inches', e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none"
                        placeholder="32.5"
                        min={10}
                        max={60}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Academics Step */}
            {currentStep === 'academics' && (
              <div className="space-y-6">
                <div className="bg-surface-dark rounded-xl p-6 border border-white/5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">menu_book</span>
                    Academic Information
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">Academic eligibility is important for NCAA requirements.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">GPA</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.gpa || ''}
                        onChange={(e) => handleChange('gpa', e.target.value ? parseFloat(e.target.value) : null)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none"
                        placeholder="3.50"
                        min={0}
                        max={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">SAT Score</label>
                      <input
                        type="number"
                        value={formData.sat_score || ''}
                        onChange={(e) => handleChange('sat_score', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none"
                        placeholder="1200"
                        min={400}
                        max={1600}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">ACT Score</label>
                      <input
                        type="number"
                        value={formData.act_score || ''}
                        onChange={(e) => handleChange('act_score', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none"
                        placeholder="24"
                        min={1}
                        max={36}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-surface-dark rounded-xl p-6 border border-white/5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">verified</span>
                    NCAA Eligibility
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">NCAA ID</label>
                      <input
                        type="text"
                        value={formData.ncaa_id || ''}
                        onChange={(e) => handleChange('ncaa_id', e.target.value || null)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-primary/50 focus:outline-none"
                        placeholder="Enter NCAA ID (if available)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <div className="space-y-6">
                <div className="bg-surface-dark rounded-xl p-6 border border-white/5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    Review Your Profile
                  </h3>

                  <div className="space-y-6">
                    {/* Personal */}
                    <div>
                      <h4 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-2">Personal</h4>
                      <div className="bg-black/30 rounded-lg p-4">
                        <p className="text-white font-medium">{formData.full_name || 'Not set'}</p>
                      </div>
                    </div>

                    {/* School */}
                    <div>
                      <h4 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-2">School</h4>
                      <div className="bg-black/30 rounded-lg p-4 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-gray-500">High School</span>
                          <p className="text-white">{formData.high_school || 'Not set'}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Location</span>
                          <p className="text-white">{formData.city && formData.state ? `${formData.city}, ${formData.state}` : 'Not set'}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Class Year</span>
                          <p className="text-white">{formData.class_year || 'Not set'}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Position</span>
                          <p className="text-white">
                            {formData.primary_position || 'Not set'}
                            {formData.secondary_position && ` / ${formData.secondary_position}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Measurables */}
                    <div>
                      <h4 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-2">Measurables</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="bg-black/30 rounded-lg p-3 text-center">
                          <span className="text-xs text-gray-500 block">Height</span>
                          <p className="text-white font-mono font-bold">{formData.height_inches ? formatHeight(formData.height_inches) : '--'}</p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3 text-center">
                          <span className="text-xs text-gray-500 block">Weight</span>
                          <p className="text-white font-mono font-bold">{formData.weight_lbs ? `${formData.weight_lbs} lbs` : '--'}</p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3 text-center">
                          <span className="text-xs text-gray-500 block">40-Yard</span>
                          <p className="text-white font-mono font-bold">{formData.forty_yard_time ? `${formData.forty_yard_time}s` : '--'}</p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3 text-center">
                          <span className="text-xs text-gray-500 block">Vertical</span>
                          <p className="text-white font-mono font-bold">{formData.vertical_inches ? `${formData.vertical_inches}"` : '--'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Academics */}
                    <div>
                      <h4 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-2">Academics</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-black/30 rounded-lg p-3 text-center">
                          <span className="text-xs text-gray-500 block">GPA</span>
                          <p className="text-white font-mono font-bold">{formData.gpa || '--'}</p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3 text-center">
                          <span className="text-xs text-gray-500 block">SAT</span>
                          <p className="text-white font-mono font-bold">{formData.sat_score || '--'}</p>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3 text-center">
                          <span className="text-xs text-gray-500 block">ACT</span>
                          <p className="text-white font-mono font-bold">{formData.act_score || '--'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {!completion.requiredComplete && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                    <p className="text-amber-400 text-sm flex items-center gap-2">
                      <span className="material-symbols-outlined">warning</span>
                      Some required fields are missing. You can still continue and complete them later.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fixed Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 bg-background-dark p-4 md:p-6 border-t border-surface-light/30">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-surface-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Previous
            </button>

            <div className="flex items-center gap-2">
              {STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStepIndex
                      ? 'bg-primary'
                      : index < currentStepIndex
                      ? 'bg-primary/50'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {currentStep === 'review' ? (
              <button
                onClick={handleComplete}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-background-dark font-bold transition-colors shadow-[0_0_15px_rgba(212,175,53,0.3)] disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Complete Setup'}
                <span className="material-symbols-outlined">check</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-background-dark font-bold transition-colors shadow-[0_0_15px_rgba(212,175,53,0.3)] disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Continue'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Right Panel: Progress Sidebar */}
      <aside className="w-[400px] hidden xl:flex flex-col border-l border-surface-light/30 bg-[#080808] relative overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Image src="/images/onboarding/sidebar-bg.png" alt="" className="w-full h-full object-cover" fill sizes="400px" />
        </div>
        
        <div className="p-8 flex flex-col h-full gap-8 overflow-y-auto relative z-10">
          {/* Progress Section */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative size-40">
              <svg className="size-full" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  className="text-surface-dark stroke-current"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="42"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  className="text-primary stroke-current transition-all duration-500"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="42"
                  strokeDasharray="263.89"
                  strokeDashoffset={263.89 - (263.89 * completion.percentage) / 100}
                  strokeLinecap="round"
                  strokeWidth="8"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{completion.percentage}%</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Complete</span>
              </div>
            </div>
            <h3 className="mt-4 text-lg font-medium text-white">Profile Completeness</h3>
            <p className="text-sm text-gray-500 text-center px-4 mt-1">
              {completion.percentage === 100
                ? "Your profile is complete!"
                : completion.percentage >= 60
                ? "You're almost there! Just a few more details."
                : "Fill in more details to boost your visibility."}
            </p>
          </div>

          {/* Completed Fields List */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
              Fields Completed ({completion.completedFields.length}/{completion.totalFields})
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {completion.completedFields.map((field) => (
                <div
                  key={field}
                  className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded"
                >
                  <span className="material-symbols-outlined text-sm">check</span>
                  {field.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </div>

          {/* Mini Preview Card */}
          <div className="mt-auto">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Live Preview</h4>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">Recruiter View</span>
            </div>
            <div className="bg-gradient-to-br from-surface-dark to-[#151515] p-5 rounded-2xl border border-white/5 shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 rounded-full size-12 flex items-center justify-center border-2 border-white/10 overflow-hidden">
                    <Image src="/images/athletes/placeholder/male-v1.png" alt="Avatar" className="w-full h-full object-cover" width={48} height={48} />
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">
                      {formData.full_name ? formData.full_name.split(' ')[0] + ' ' + (formData.full_name.split(' ')[1]?.[0] || '') + '.' : 'Your Name'}
                    </h5>
                    <p className="text-[10px] text-gray-400">
                      Class of &apos;{formData.class_year ? String(formData.class_year).slice(-2) : '--'} {formData.primary_position ? `\u2022 ${formData.primary_position}` : ''}
                    </p>
                  </div>
                </div>
                <div className="bg-primary/20 p-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-primary text-sm">star</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                  <p className="text-[9px] text-gray-500 uppercase">Height</p>
                  <p className="text-xs font-mono font-bold">{formData.height_inches ? formatHeight(formData.height_inches) : '--'}</p>
                </div>
                <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                  <p className="text-[9px] text-gray-500 uppercase">Weight</p>
                  <p className="text-xs font-mono font-bold">{formData.weight_lbs ? `${formData.weight_lbs} lbs` : '--'}</p>
                </div>
                <div className={`bg-black/30 p-2 rounded-lg border ${formData.forty_yard_time ? 'border-primary/30' : 'border-white/5'} relative overflow-hidden`}>
                  {formData.forty_yard_time && <div className="absolute inset-0 bg-primary/5"></div>}
                  <p className={`text-[9px] uppercase ${formData.forty_yard_time ? 'text-primary' : 'text-gray-500'}`}>40 YD</p>
                  <p className="text-xs font-mono font-bold text-white">{formData.forty_yard_time ? `${formData.forty_yard_time}s` : '--'}</p>
                </div>
                <div className="bg-black/30 p-2 rounded-lg border border-white/5">
                  <p className="text-[9px] text-gray-500 uppercase">Vertical</p>
                  <p className="text-xs font-mono font-bold">{formData.vertical_inches ? `${formData.vertical_inches}"` : '--'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
