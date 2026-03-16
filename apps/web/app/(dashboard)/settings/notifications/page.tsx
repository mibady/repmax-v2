'use client';

import { useNotificationPreferences } from '@/lib/hooks';
import { Loader2 } from 'lucide-react';

function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <div className="w-12 h-6 bg-slate-300 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
    </label>
  );
}

export default function NotificationSettingsPage() {
  const {
    preferences,
    isLoading,
    isSaving,
    error,
    hasChanges,
    updatePreference,
    savePreferences,
    discardChanges,
  } = useNotificationPreferences();

  const handleSave = async () => {
    try {
      await savePreferences();
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-32">
      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-10">
        {/* PageHeading */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight text-white">
            Notification Settings
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg">
            Choose how and when you receive recruiting alerts, offers, messages, and deadline reminders.
          </p>
          {error && (
            <p className="text-red-500 text-sm mt-2">Error: {error.message}</p>
          )}
        </div>

        <div className="grid gap-12">
          {/* Push Notifications */}
          <section>
            <div className="flex items-center gap-2 mb-6 px-1">
              <span className="material-symbols-outlined text-primary">app_badging</span>
              <h2 className="text-xl font-bold tracking-tight text-white">Push Notifications</h2>
            </div>
            <div className="grid gap-px bg-white/10 rounded-xl overflow-hidden border border-white/10">
              <div className="flex items-center justify-between p-6 bg-[#1A1A1A] hover:bg-white/[0.02] transition-colors gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-base font-bold text-white">Profile Views</p>
                  <p className="text-sm text-slate-500">Notify when a coach or recruiter views your player card.</p>
                </div>
                <ToggleSwitch
                  checked={preferences.push.profileViews}
                  onChange={(v) => updatePreference('push', 'profileViews', v)}
                />
              </div>
              <div className="flex items-center justify-between p-6 bg-[#1A1A1A] hover:bg-white/[0.02] transition-colors gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-base font-bold text-white">New Offers</p>
                  <p className="text-sm text-slate-500">Instant alerts when you receive a new scholarship offer.</p>
                </div>
                <ToggleSwitch
                  checked={preferences.push.newOffers}
                  onChange={(v) => updatePreference('push', 'newOffers', v)}
                />
              </div>
              <div className="flex items-center justify-between p-6 bg-[#1A1A1A] hover:bg-white/[0.02] transition-colors gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-base font-bold text-white">Recruiting Interest</p>
                  <p className="text-sm text-slate-500">Updates when coaches add you to their recruiting board.</p>
                </div>
                <ToggleSwitch
                  checked={preferences.push.shortlist}
                  onChange={(v) => updatePreference('push', 'shortlist', v)}
                />
              </div>
              <div className="flex items-center justify-between p-6 bg-[#1A1A1A] hover:bg-white/[0.02] transition-colors gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-base font-bold text-white">Messages</p>
                  <p className="text-sm text-slate-500">Notify when you receive a new message from a coach or recruiter.</p>
                </div>
                <ToggleSwitch
                  checked={preferences.push.messages}
                  onChange={(v) => updatePreference('push', 'messages', v)}
                />
              </div>
              <div className="flex items-center justify-between p-6 bg-[#1A1A1A] hover:bg-white/[0.02] transition-colors gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-base font-bold text-white">Calendar Reminders</p>
                  <p className="text-sm text-slate-500">Alerts for scheduled visits, calls, and evaluation deadlines.</p>
                </div>
                <ToggleSwitch
                  checked={preferences.push.calendar}
                  onChange={(v) => updatePreference('push', 'calendar', v)}
                />
              </div>
            </div>
          </section>

          {/* Email Notifications */}
          <section>
            <div className="flex items-center gap-2 mb-6 px-1">
              <span className="material-symbols-outlined text-primary">mail</span>
              <h2 className="text-xl font-bold tracking-tight text-white">Email Notifications</h2>
            </div>
            <div className="grid gap-px bg-white/10 rounded-xl overflow-hidden border border-white/10">
              <div className="flex flex-col @[480px]:flex-row @[480px]:items-center justify-between p-6 bg-[#1A1A1A] hover:bg-white/[0.02] transition-colors gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-base font-bold text-white">Weekly Recruiting Summary</p>
                  <p className="text-sm text-slate-500">A summary of your profile views, new interest, and recruiting activity.</p>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    className="bg-white/5 border border-white/10 text-sm text-white rounded-lg py-2 px-3 focus:ring-primary focus:border-primary"
                    value={preferences.email.digestFrequency}
                    onChange={(e) => updatePreference('email', 'digestFrequency', e.target.value as 'daily' | 'weekly' | 'monthly' | 'never')}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="never">Never</option>
                  </select>
                  <ToggleSwitch
                    checked={preferences.email.digest}
                    onChange={(v) => updatePreference('email', 'digest', v)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-6 bg-[#1A1A1A] hover:bg-white/[0.02] transition-colors gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-base font-bold text-white">Important Deadlines</p>
                  <p className="text-sm text-slate-500">Reminders for NCAA recruiting periods, signing days, and camp deadlines.</p>
                </div>
                <ToggleSwitch
                  checked={preferences.email.deadlines}
                  onChange={(v) => updatePreference('email', 'deadlines', v)}
                />
              </div>
              <div className="flex items-center justify-between p-6 bg-[#1A1A1A] hover:bg-white/[0.02] transition-colors gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-base font-bold text-white">Marketing & Tips</p>
                  <p className="text-sm text-slate-500">Occasional updates about new RepMax features and recruiting best practices.</p>
                </div>
                <ToggleSwitch
                  checked={preferences.email.marketing}
                  onChange={(v) => updatePreference('email', 'marketing', v)}
                />
              </div>
            </div>
          </section>



          {/* Quiet Hours Section */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6 px-1">
              <span className="material-symbols-outlined text-primary">do_not_disturb_on</span>
              <h2 className="text-xl font-bold tracking-tight text-white">Quiet Hours</h2>
            </div>
            <div className="p-6 bg-[#1A1A1A] rounded-xl border border-white/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-1 max-w-md">
                  <div className="flex items-center gap-3">
                    <p className="text-base font-bold text-white">Schedule Downtime</p>
                    <ToggleSwitch
                      checked={preferences.quietHours.enabled}
                      onChange={(v) => updatePreference('quietHours', 'enabled', v)}
                    />
                  </div>
                  <p className="text-sm text-slate-500">
                    Automatically silence all notifications during these hours to minimize distractions.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">From</label>
                    <input
                      className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:ring-primary focus:border-primary disabled:opacity-50"
                      type="time"
                      value={preferences.quietHours.from}
                      onChange={(e) => updatePreference('quietHours', 'from', e.target.value)}
                      disabled={!preferences.quietHours.enabled}
                    />
                  </div>
                  <div className="text-slate-500 mt-5">-</div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">To</label>
                    <input
                      className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:ring-primary focus:border-primary disabled:opacity-50"
                      type="time"
                      value={preferences.quietHours.to}
                      onChange={(e) => updatePreference('quietHours', 'to', e.target.value)}
                      disabled={!preferences.quietHours.enabled}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/10 p-4 md:pl-72 flex justify-center">
          <div className="max-w-4xl w-full flex items-center justify-between px-6">
            <div className="hidden md:block">
              <p className="text-sm text-slate-500">Unsaved changes detected</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                className="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold border border-white/10 text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                onClick={discardChanges}
                disabled={isSaving}
              >
                Discard
              </button>
              <button
                className="flex-1 md:flex-none px-8 py-2.5 rounded-lg text-sm font-black bg-primary text-[#0a0a0a] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
