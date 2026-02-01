'use client';

import { useState } from 'react';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'never';
}

interface NotificationSection {
  id: string;
  title: string;
  icon: string;
  settings: NotificationSetting[];
}

const initialSections: NotificationSection[] = [
  {
    id: 'push',
    title: 'Push Notifications',
    icon: 'app_badging',
    settings: [
      { id: 'profile-views', title: 'Profile Views', description: 'Notify when a scout or coach views a prospect profile.', enabled: true },
      { id: 'new-offers', title: 'New Offers', description: 'Instant alerts when an athlete in your watchlist receives a scholarship offer.', enabled: true },
      { id: 'shortlist', title: 'Shortlist Activity', description: 'Updates on movement within your recruitment shortlist.', enabled: false },
      { id: 'messages', title: 'Messages', description: 'Direct notifications for internal staff messages.', enabled: true },
      { id: 'calendar', title: 'Calendar Reminders', description: 'Alerts for scheduled visits, calls, and evaluation deadlines.', enabled: true },
    ],
  },
  {
    id: 'email',
    title: 'Email Notifications',
    icon: 'mail',
    settings: [
      { id: 'digest', title: 'Recruiting Intelligence Digest', description: 'A summarized report of all recruiting activity.', enabled: true, frequency: 'weekly' },
      { id: 'deadlines', title: 'Important Deadlines', description: 'Emails regarding NCAA compliance periods and dead periods.', enabled: true },
      { id: 'marketing', title: 'Marketing & Tips', description: 'Occasional updates about new RepMax features and recruiting best practices.', enabled: false },
    ],
  },
  {
    id: 'inapp',
    title: 'In-App Notifications',
    icon: 'view_quilt',
    settings: [
      { id: 'badge', title: 'Badge Count', description: 'Show notification count on the sidebar and app icon.', enabled: true },
      { id: 'sounds', title: 'System Sounds', description: 'Play a subtle sound when a new alert arrives while the app is open.', enabled: false },
    ],
  },
];

const sidebarNavRecruitingSuite = [
  { icon: 'dashboard', label: 'Intelligence Dashboard' },
  { icon: 'groups', label: 'Team Management' },
  { icon: 'person_search', label: 'Scouting Reports' },
];

const sidebarNavSettings = [
  { icon: 'person', label: 'Account Profile' },
  { icon: 'notifications_active', label: 'Notification Preferences', active: true },
  { icon: 'security', label: 'Security & Privacy' },
  { icon: 'payments', label: 'Billing & Plans' },
];

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-12 h-6 bg-slate-300 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
    </label>
  );
}

export default function NotificationSettingsPage() {
  const [sections, setSections] = useState(initialSections);
  const [quietHoursFrom, setQuietHoursFrom] = useState('22:00');
  const [quietHoursTo, setQuietHoursTo] = useState('07:00');
  const [hasChanges, setHasChanges] = useState(true);

  const handleToggle = (sectionId: string, settingId: string, enabled: boolean) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              settings: section.settings.map((setting) =>
                setting.id === settingId ? { ...setting, enabled } : setting
              ),
            }
          : section
      )
    );
    setHasChanges(true);
  };

  const handleFrequencyChange = (sectionId: string, settingId: string, frequency: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              settings: section.settings.map((setting) =>
                setting.id === settingId
                  ? { ...setting, frequency: frequency as NotificationSetting['frequency'] }
                  : setting
              ),
            }
          : section
      )
    );
    setHasChanges(true);
  };

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
            <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-[#0a0a0a]"></span>
          </button>
          <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold">Coach Harrison</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Director of Personnel</p>
            </div>
            <div className="size-10 rounded-full bg-primary/20 border border-primary/40 p-0.5">
              <div
                className="size-full rounded-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBDvNL4E_Q5y5KSx5qt23VVqvehU0W_1Fjw9niCEvScfjSwiRddf5aEtey1EmTiMQ4YDkmsVstTmqv2NvUswr1CNMGvn2HEdmhjRwu-rRpKsZYOxZ9ymm-GIInOSfLUnbwvxMdOnyssYXoUOKxeEfypKpgND_-MmDmwOzLDfQygzTR2FMd-SAPpMHe18orcBm7zGR-lK_MklQscMRJ1UYXKtXUB3Abhhhm08RUgCpzvoDbg08HV_cAUXhtMvAdfEuR5BaBP5TkWBWc")',
                }}
              />
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
                  href="#"
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
                  href="#"
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
          <div className="mt-auto">
            <div className="bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 p-4 rounded-xl">
              <p className="text-xs font-bold text-primary mb-1">PRO PLAN</p>
              <p className="text-[10px] text-slate-400 mb-3">Your subscription renews on Oct 12, 2024.</p>
              <button className="w-full py-2 bg-primary text-[#0a0a0a] text-[10px] font-black uppercase tracking-widest rounded hover:bg-primary/90 transition-all">
                Upgrade Account
              </button>
            </div>
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
            </div>

            <div className="grid gap-12">
              {sections.map((section) => (
                <section key={section.id}>
                  <div className="flex items-center gap-2 mb-6 px-1">
                    <span className="material-symbols-outlined text-primary">{section.icon}</span>
                    <h2 className="text-xl font-bold tracking-tight">{section.title}</h2>
                  </div>
                  <div className="grid gap-px bg-slate-200 dark:bg-white/10 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                    {section.settings.map((setting) => (
                      <div
                        key={setting.id}
                        className={`flex ${setting.frequency ? 'flex-col @[480px]:flex-row @[480px]:items-center' : 'items-center'} justify-between p-6 bg-white dark:bg-[#1A1A1A] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors gap-4`}
                      >
                        <div className="flex flex-col gap-1">
                          <p className="text-base font-bold">{setting.title}</p>
                          <p className="text-sm text-slate-500">{setting.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          {setting.frequency !== undefined && (
                            <select
                              className="bg-slate-100 dark:bg-white/5 border border-white/10 text-sm rounded-lg py-2 px-3 focus:ring-primary focus:border-primary"
                              value={setting.frequency}
                              onChange={(e) => handleFrequencyChange(section.id, setting.id, e.target.value)}
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="never">Never</option>
                            </select>
                          )}
                          <ToggleSwitch
                            checked={setting.enabled}
                            onChange={(enabled) => handleToggle(section.id, setting.id, enabled)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              {/* Quiet Hours Section */}
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6 px-1">
                  <span className="material-symbols-outlined text-primary">do_not_disturb_on</span>
                  <h2 className="text-xl font-bold tracking-tight">Quiet Hours</h2>
                </div>
                <div className="p-6 bg-white dark:bg-[#1A1A1A] rounded-xl border border-slate-200 dark:border-white/10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-col gap-1 max-w-md">
                      <p className="text-base font-bold">Schedule Downtime</p>
                      <p className="text-sm text-slate-500">
                        Automatically silence all notifications during these hours to minimize distractions.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">From</label>
                        <input
                          className="bg-slate-100 dark:bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm focus:ring-primary focus:border-primary"
                          type="time"
                          value={quietHoursFrom}
                          onChange={(e) => {
                            setQuietHoursFrom(e.target.value);
                            setHasChanges(true);
                          }}
                        />
                      </div>
                      <div className="text-slate-500 mt-5">—</div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">To</label>
                        <input
                          className="bg-slate-100 dark:bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm focus:ring-primary focus:border-primary"
                          type="time"
                          value={quietHoursTo}
                          onChange={(e) => {
                            setQuietHoursTo(e.target.value);
                            setHasChanges(true);
                          }}
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
                className="flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold border border-slate-300 dark:border-white/10 hover:bg-white/5 transition-colors"
                onClick={() => setHasChanges(false)}
              >
                Discard
              </button>
              <button
                className="flex-1 md:flex-none px-8 py-2.5 rounded-lg text-sm font-black bg-primary text-[#0a0a0a] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20 uppercase tracking-widest"
                onClick={() => setHasChanges(false)}
              >
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
