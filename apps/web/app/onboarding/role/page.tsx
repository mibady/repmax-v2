'use client';

import { useState, useTransition } from 'react';
import { updateUserRole, type UserRole } from '@/lib/actions/auth-actions';

export default function Page() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('athlete');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
  };

  const handleContinue = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateUserRole(selectedRole);
      if (!result.success && result.error) {
        setError(result.error);
      }
      // If successful, the server action will redirect
    });
  };

  return (
    <>
      <div className="w-full max-w-[600px] flex flex-col min-h-screen px-4 py-8 md:px-8">
{/*  Logo Header  */}
<header className="flex justify-center mb-8">
<h2 className="text-primary tracking-tight text-[28px] font-extrabold leading-tight text-center uppercase drop-shadow-sm">
                REPMAX
            </h2>
</header>
{/*  Progress Indicator  */}
<div className="flex flex-col gap-3 mb-8 w-full">
<div className="flex justify-between items-center">
<p className="text-white text-sm font-medium leading-normal">Step 1 of 3: Role Selection</p>
<span className="text-text-secondary text-xs">Next: Profile Setup</span>
</div>
{/*  Progress Bar Container  */}
<div className="flex w-full gap-2">
{/*  Step 1: Active  */}
<div className="h-1.5 flex-1 rounded-full bg-primary shadow-[0_0_10px_rgba(237,188,29,0.4)]"></div>
{/*  Step 2: Inactive  */}
<div className="h-1.5 flex-1 rounded-full bg-surface-dark"></div>
{/*  Step 3: Inactive  */}
<div className="h-1.5 flex-1 rounded-full bg-surface-dark"></div>
</div>
</div>
{/*  Headline  */}
<div className="mb-8 text-center">
<h1 className="text-white tracking-tight text-[32px] md:text-[36px] font-bold leading-tight">
                What&apos;s Your Role?
            </h1>
<p className="text-text-secondary mt-2 text-base font-normal">
                Choose the profile type that best fits your needs.
            </p>
</div>

{/*  Error Message  */}
{error && (
  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
    <p className="text-red-400 text-sm text-center">{error}</p>
  </div>
)}

{/*  Role Selection Cards  */}
<div className="flex flex-col gap-4 flex-1">
{/*  Athlete Card  */}
<label className="group relative cursor-pointer">
<input
  checked={selectedRole === 'athlete'}
  onChange={() => handleRoleChange('athlete')}
  className="peer sr-only"
  name="role"
  type="radio"
  value="athlete"
/>
<div className="relative flex items-center gap-4 rounded-xl border-2 border-transparent bg-surface-dark p-4 transition-all duration-200 hover:bg-surface-hover peer-checked:border-primary peer-checked:shadow-[0_0_15px_rgba(237,188,29,0.15)] peer-focus:ring-2 peer-focus:ring-primary/50">
{/*  Icon/Emoji  */}
<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2A2A2E] text-2xl group-hover:scale-110 transition-transform duration-200">
                        🏈
                    </div>
{/*  Text Content  */}
<div className="flex grow flex-col">
<p className="text-white text-base font-bold leading-snug">Athlete</p>
<p className="text-text-secondary text-sm font-normal leading-normal">I want to get recruited.</p>
</div>
{/*  Selection Indicator  */}
<div className="text-transparent transition-colors duration-200 peer-checked:text-primary">
<span className="material-symbols-outlined filled text-[28px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
</div>
{/*  Unselected Ring (Absolute positioned to overlap when not checked)  */}
<div className="absolute right-4 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full border-2 border-[#3F3F46] peer-checked:opacity-0 transition-opacity"></div>
</div>
</label>
{/*  Parent Card  */}
<label className="group relative cursor-pointer">
<input
  checked={selectedRole === 'parent'}
  onChange={() => handleRoleChange('parent')}
  className="peer sr-only"
  name="role"
  type="radio"
  value="parent"
/>
<div className="relative flex items-center gap-4 rounded-xl border-2 border-transparent bg-surface-dark p-4 transition-all duration-200 hover:bg-surface-hover peer-checked:border-primary peer-checked:shadow-[0_0_15px_rgba(237,188,29,0.15)] peer-focus:ring-2 peer-focus:ring-primary/50">
<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2A2A2E] text-2xl group-hover:scale-110 transition-transform duration-200">
                        👪
                    </div>
<div className="flex grow flex-col">
<p className="text-white text-base font-bold leading-snug">Parent</p>
<p className="text-text-secondary text-sm font-normal leading-normal">I am managing a player&apos;s profile.</p>
</div>
<div className="text-transparent transition-colors duration-200 peer-checked:text-primary">
<span className="material-symbols-outlined filled text-[28px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
</div>
<div className="absolute right-4 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full border-2 border-[#3F3F46] peer-checked:opacity-0 transition-opacity"></div>
</div>
</label>
{/*  Coach Card  */}
<label className="group relative cursor-pointer">
<input
  checked={selectedRole === 'coach'}
  onChange={() => handleRoleChange('coach')}
  className="peer sr-only"
  name="role"
  type="radio"
  value="coach"
/>
<div className="relative flex items-center gap-4 rounded-xl border-2 border-transparent bg-surface-dark p-4 transition-all duration-200 hover:bg-surface-hover peer-checked:border-primary peer-checked:shadow-[0_0_15px_rgba(237,188,29,0.15)] peer-focus:ring-2 peer-focus:ring-primary/50">
<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2A2A2E] text-2xl group-hover:scale-110 transition-transform duration-200">
                        🧢
                    </div>
<div className="flex grow flex-col">
<p className="text-white text-base font-bold leading-snug">Coach</p>
<p className="text-text-secondary text-sm font-normal leading-normal">I manage a high school or college team.</p>
</div>
<div className="text-transparent transition-colors duration-200 peer-checked:text-primary">
<span className="material-symbols-outlined filled text-[28px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
</div>
<div className="absolute right-4 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full border-2 border-[#3F3F46] peer-checked:opacity-0 transition-opacity"></div>
</div>
</label>
{/*  Recruiter Card  */}
<label className="group relative cursor-pointer">
<input
  checked={selectedRole === 'recruiter'}
  onChange={() => handleRoleChange('recruiter')}
  className="peer sr-only"
  name="role"
  type="radio"
  value="recruiter"
/>
<div className="relative flex items-center gap-4 rounded-xl border-2 border-transparent bg-surface-dark p-4 transition-all duration-200 hover:bg-surface-hover peer-checked:border-primary peer-checked:shadow-[0_0_15px_rgba(237,188,29,0.15)] peer-focus:ring-2 peer-focus:ring-primary/50">
<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2A2A2E] text-2xl group-hover:scale-110 transition-transform duration-200">
                        👀
                    </div>
<div className="flex grow flex-col">
<p className="text-white text-base font-bold leading-snug">Recruiter</p>
<p className="text-text-secondary text-sm font-normal leading-normal">I am looking for talent.</p>
</div>
<div className="text-transparent transition-colors duration-200 peer-checked:text-primary">
<span className="material-symbols-outlined filled text-[28px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
</div>
<div className="absolute right-4 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full border-2 border-[#3F3F46] peer-checked:opacity-0 transition-opacity"></div>
</div>
</label>
{/*  Club Organizer Card  */}
<label className="group relative cursor-pointer">
<input
  checked={selectedRole === 'organizer'}
  onChange={() => handleRoleChange('organizer')}
  className="peer sr-only"
  name="role"
  type="radio"
  value="organizer"
/>
<div className="relative flex items-center gap-4 rounded-xl border-2 border-transparent bg-surface-dark p-4 transition-all duration-200 hover:bg-surface-hover peer-checked:border-primary peer-checked:shadow-[0_0_15px_rgba(237,188,29,0.15)] peer-focus:ring-2 peer-focus:ring-primary/50">
<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#2A2A2E] text-2xl group-hover:scale-110 transition-transform duration-200">
                        📋
                    </div>
<div className="flex grow flex-col">
<p className="text-white text-base font-bold leading-snug">Club Organizer</p>
<p className="text-text-secondary text-sm font-normal leading-normal">I run a league or club event.</p>
</div>
<div className="text-transparent transition-colors duration-200 peer-checked:text-primary">
<span className="material-symbols-outlined filled text-[28px]" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
</div>
<div className="absolute right-4 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full border-2 border-[#3F3F46] peer-checked:opacity-0 transition-opacity"></div>
</div>
</label>
</div>
{/*  Footer / Button  */}
<div className="mt-8 pt-4 pb-4 sticky bottom-0 bg-gradient-to-t from-[#050505] to-transparent">
<button
  onClick={handleContinue}
  disabled={isPending}
  className="w-full cursor-pointer flex items-center justify-center rounded-xl bg-primary h-14 px-5 text-[#221e11] text-lg font-bold leading-normal tracking-wide shadow-lg hover:bg-[#d9ab1b] hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:active:scale-100"
>
  {isPending ? (
    <>
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#221e11]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Saving...
    </>
  ) : (
    'Continue'
  )}
</button>
</div>
</div>
    </>
  );
}
