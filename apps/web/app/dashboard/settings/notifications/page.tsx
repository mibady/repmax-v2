'use client';

import { useNotificationPreferences } from '@/lib/hooks';
import { Loader2 } from 'lucide-react';

const sidebarNavRecruitingSuite = [
  { icon: 'dashboard', label: 'Intelligence Dashboard', href: '/dashboard/recruiter' },
  { icon: 'groups', label: 'Team Management', href: '/dashboard/recruiter/pipeline' },
  { icon: 'person_search', label: 'Scouting Reports', href: '/dashboard/recruiter/prospects' },
];

const sidebarNavSettings = [
  { icon: 'person', label: 'Account Profile', href: '/dashboard/settings' },
  { icon: 'notifications_active', label: 'Notification Preferences', href: '/dashboard/settings/notifications', active: true },
  { icon: 'security', label: 'Security & Privacy', href: '/dashboard/settings/security' },
  { icon: 'payments', label: 'Billing & Plans', href: '/dashboard/settings/billing' },
];

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
      <div className="bg-slate-100 dark:bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-100 dark:bg-[#0a0a0a] font-sans text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-100/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-primary rounded flex items-center justify-center text-[#0a0a0a]">
              <span className="material-symbols-outlined text-2xl font-bold">sports_football</span>
            </div>
            <h2 className="text-xl font-black tracking-tighter uppercase italic">RepMax</h2>
          </div>
          <div className="hidden md:flex items-center">
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined text-sm">search</span>
              </span>
              <input
                className="w-64 bg-slate-100 dark:bg-[#1A1A1A] border-none focus:ring-1 focus:ring-primary rounded-lg py-2 pl-10 pr-4 text-sm transition-all"
                placeholder="Search recruits, teams, or scouts..."
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">Settings</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Notifications</p>
            </div>
            <div className="size-10 rounded-full bg-primary/20 border border-primary/40 p-0.5">
              <div className="size-full rounded-full bg-[#333]"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SideNavBar */}
        <aside className="w-72 hidden lg:flex flex-col border-r border-white/5 bg-slate-100 dark:bg-[#0a0a0a] p-6 gap-8 overflow-y-auto">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Recruiting Suite</p>
            <nav className="flex flex-col gap-1">
              {sidebarNavRecruitingSuite.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </a>
              ))}
            </nav>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Settings</p>
            <nav className="flex flex-col gap-1">
              {sidebarNavSettings.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    item.active
                      ? 'bg-primary text-[#0a0a0a] shadow-lg shadow-primary/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={item.active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  <span className={`text-sm ${item.active ? 'font-bold' : 'font-semibold'}`}>{item.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-32">
          <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-10">
            {/* PageHeading */}
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Notification Settings
              </h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-lg">
                Customize your intelligence flow. Choose how and when you receive critical recruiting alerts, offers,
                and scout updates.
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
                  <h2 className="text-xl font-bold tracking-tight">Push Notifications</h2>
                </div>
                <div className="grid gap-px bg-slate-200 dark:bg-white/10 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                  <div className="flex items-center justify-between p-6 bg-white dark:bg-[#1A1A1A] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-bold">Profile Views</p>
                      <p className="text-sm text-slate-500">Notify when a scout or coach views a prospect profile.</p>
                    </div>
                    <ToggleSwitch
                      checked={preferences.push.profileViews}
                      onChange={(v) => updatePreference('push', 'profileViews', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-6 bg-white dark:bg-[#1A1A1A] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-bold">New Offers</p>
                      <p className="text-sm text-slate-500">Instant alerts when an athlete in your watchlist receives a scholarship offer.</p>
                    </div>
                    <ToggleSwitch
                      checked={preferences.push.newOffers}
                      onChange={(v) => updatePreference('push', 'newOffers', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-6 bg-white dark:bg-[#1A1A1A] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-bold">Shortlist Activity</p>
                      <p className="text-sm text-slate-500">Updates on movement within your recruitment shortlist.</p>
                    </div>
                    <ToggleSwitch
                      checked={preferences.push.shortlist}
                      onChange={(v) => updatePreference('push', 'shortlist', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-6 bg-white dark:bg-[#1A1A1A] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-bold">Messages</p>
                      <p className="text-sm text-slate-500">Direct notifications for internal staff messages.</p>
                    </div>
                    <ToggleSwitch
                      checked={preferences.push.messages}
                      onChange={(v) => updatePreference('push', 'messages', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-6 bg-white dark:bg-[#1A1A1A] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-bold">Calendar Reminders</p>
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
                  <h2 className="text-xl font-bold tracking-tight">Email Notifications</h2>
                </div>
                <div className="grid gap-px bg-slate-200 dark:bg-white/10 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                  <div className="flex flex-col @[480px]:flex-row @[480px]:items-center justify-between p-6 bg-white dark:bg-[#1A1A1A] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-bold">Recruiting Intelligence Digest</p>
                      <p className="text-sm text-slate-500">A summarized report of all recruiting activity.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <select
                        className="bg-slate-100 dark:bg-white/5 border border-white/10 text-sm rounded-lg py-2 px-3 focus:ring-primary focus:border-primary"
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
                  <div className="flex items-center justify-between p-6 bg-white dark:bg-[#1A1A1A] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-bold">Important Deadlines</p>
                      <p className="text-sm text-slate-500">Emails regarding NCAA compliance periods and dead periods.</p>
                    </div>
                    <ToggleSwitch
                      checked={preferences.email.deadlines}
                      onChange={(v) => updatePreference('email', 'deadlines', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-6 bg-white dark:bg-[#1A1A1A] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-bold">Marketing & Tips</p>
                      <p className="text-sm text-slate-500">Occasional updates about new RepMax features and recruiting best practices.</p>
                    </div>
                    <ToggleSwitch
                      checked={preferences.email.marketing}
                      onChange={(v) => updatePreference('email', 'marketing', v)}
                    />
                  </div>
                </div>
              </section>

              {/* In-App Notifications */}
              <section>
                <div className="flex items-center gap-2 mb-6 px-1">
                  <span className="material-symbols-outlined text-primary">view_quilt</span>
                  <h2 className="text-xl font-bold tracking-tight">In-App Notifications</h2>
                </div>
                <div className="grid gap-px bg-slate-200 dark:bg-white/10 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                  <div className="flex items-center justify-between p-6 bg-white dark:bg-[#1A1A1A] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-bold">Badge Count</p>
                      <p className="text-sm text-slate-500">Show notification count on the sidebar and app icon.</p>
                    </div>
                    <ToggleSwitch
                      checked={preferences.inApp.badge}
                      onChange={(v) => updatePreference('inApp', 'badge', v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-6 bg-white dark:bg-[#1A1A1A] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-bold">System Sounds</p>
                      <p className="text-sm text-slate-500">Play a subtle sound when a new alert arrives while the app is open.</p>
                    </div>
                    <ToggleSwitch
                      checked={preferences.inApp.sounds}
                      onChange={(v) => updatePreference('inApp', 'sounds', v)}
                    />
                  </div>
                </div>
              </section>

              {/* Quiet Hours Section */}
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6 px-1">
                  <span className="material-symbols-outlined text-primary">do_not_disturb_on</span>
                  <h2 className="text-xl font-bold tracking-tight">Quiet Hours</h2>
                </div>
                <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-white/10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-col gap-1 max-w-md">
                      <div className="flex items-center gap-3">
                        <p className="text-base font-bold">Schedule Downtime</p>
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
                          className="bg-slate-100 dark:bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm focus:ring-primary focus:border-primary disabled:opacity-50"
                          type="time"
                          value={preferences.quietHours.from}
                          onChange={(e) => updatePreference('quietHours', 'from', e.target.value)}
                          disabled={!preferences.quietHours.enabled}
                        />
                      </div>
                      <div className="text-slate-500 mt-5">—</div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">To</label>
                        <input
                          className="bg-slate-100 dark:bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm focus:ring-primary focus:border-primary disabled:opacity-50"
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
        </main>
      </div>

      {/* Fixed Bottom Action Bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-100/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/10 p-4 md:pl-72 flex justify-center">
          <div className="max-w-4xl w-full flex items-center justify-between px-6">
            <div className="hidden md:block">
              <p className="text-sm text-slate-500">Unsaved changes detected</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button
                className="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold border border-slate-300 dark:border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50"
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

      <style jsx>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
        ::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
      `}</style>
    </div>
  );
}
