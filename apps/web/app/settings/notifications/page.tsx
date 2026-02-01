'use client';

import { useState } from 'react';
import { Moon, Clock, Ban, Mail, Smartphone, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  push: boolean;
  email: boolean;
}

interface SettingsCategory {
  id: string;
  title: string;
  settings: NotificationSetting[];
}

const INITIAL_SETTINGS: SettingsCategory[] = [
  {
    id: 'recruiting',
    title: 'Recruiting',
    settings: [
      {
        id: 'new_application',
        label: 'New Application',
        description: 'When a candidate submits a new form',
        push: true,
        email: true,
      },
      {
        id: 'interview_scheduled',
        label: 'Interview Scheduled',
        description: 'When a campus visit or call is scheduled',
        push: true,
        email: false,
      },
      {
        id: 'profile_view',
        label: 'Profile Views',
        description: 'When a coach views your profile',
        push: true,
        email: false,
      },
      {
        id: 'shortlist_add',
        label: 'Shortlist Activity',
        description: 'When added to a coach shortlist',
        push: true,
        email: true,
      },
    ],
  },
  {
    id: 'team',
    title: 'Team',
    settings: [
      {
        id: 'roster_updates',
        label: 'Roster Updates',
        description: 'Changes to team roster',
        push: true,
        email: false,
      },
      {
        id: 'staff_messages',
        label: 'Staff Messages',
        description: 'Direct messages from coaches',
        push: true,
        email: true,
      },
    ],
  },
  {
    id: 'tournaments',
    title: 'Events & Deadlines',
    settings: [
      {
        id: 'schedule_changes',
        label: 'Schedule Changes',
        description: 'Camp and combine schedule updates',
        push: true,
        email: true,
      },
      {
        id: 'results',
        label: 'Results & Rankings',
        description: 'Performance results and ranking updates',
        push: false,
        email: true,
      },
      {
        id: 'signing_deadlines',
        label: 'Signing Deadlines',
        description: 'NLI and commitment deadlines',
        push: true,
        email: true,
      },
    ],
  },
  {
    id: 'digests',
    title: 'Digests',
    settings: [
      {
        id: 'weekly_summary',
        label: 'Weekly Summary',
        description: 'Your recruiting activity summary',
        push: false,
        email: true,
      },
      {
        id: 'monthly_stats',
        label: 'Monthly Stats',
        description: 'Monthly performance analytics',
        push: false,
        email: true,
      },
      {
        id: 'zone_pulse',
        label: 'Zone Pulse Updates',
        description: 'Recruiting activity in your zone',
        push: true,
        email: false,
      },
    ],
  },
];

function Toggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-[#d4af35]' : 'bg-[#3a3a3d]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function NotificationPreferencesPage() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [quietHours, setQuietHours] = useState({
    enabled: false,
    startTime: '22:00',
    endTime: '07:00',
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateSetting = (
    categoryId: string,
    settingId: string,
    field: 'push' | 'email',
    value: boolean
  ) => {
    setSettings((prev) =>
      prev.map((category) => {
        if (category.id !== categoryId) return category;
        return {
          ...category,
          settings: category.settings.map((setting) => {
            if (setting.id !== settingId) return setting;
            return { ...setting, [field]: value };
          }),
        };
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Wire to Supabase
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleUnsubscribeAll = () => {
    setSettings((prev) =>
      prev.map((category) => ({
        ...category,
        settings: category.settings.map((setting) => ({
          ...setting,
          push: false,
          email: false,
        })),
      }))
    );
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-[#1F1F22] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Notification Preferences</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage how and when you receive notifications
            </p>
          </div>
        </div>

        {/* Column Headers */}
        <div className="flex items-center justify-end gap-8 mb-4 px-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Smartphone className="w-4 h-4" />
            <span>Push</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </div>
        </div>

        {/* Settings Categories */}
        <div className="space-y-6">
          {settings.map((category) => (
            <div
              key={category.id}
              className="bg-[#1F1F22] rounded-xl border border-[#2a2a2d] overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-[#2a2a2d]">
                <h2 className="text-white font-semibold">{category.title}</h2>
              </div>
              <div className="divide-y divide-[#2a2a2d]">
                {category.settings.map((setting) => (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between px-4 py-4"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-white text-sm font-medium">{setting.label}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{setting.description}</p>
                    </div>
                    <div className="flex items-center gap-8">
                      <Toggle
                        enabled={setting.push}
                        onChange={(value) =>
                          updateSetting(category.id, setting.id, 'push', value)
                        }
                        label={`${setting.label} push notifications`}
                      />
                      <Toggle
                        enabled={setting.email}
                        onChange={(value) =>
                          updateSetting(category.id, setting.id, 'email', value)
                        }
                        label={`${setting.label} email notifications`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Quiet Hours */}
          <div className="bg-[#1F1F22] rounded-xl border border-[#2a2a2d] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#2a2a2d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-[#d4af35]" />
                <h2 className="text-white font-semibold">Quiet Hours</h2>
              </div>
              <Toggle
                enabled={quietHours.enabled}
                onChange={(enabled) => setQuietHours((prev) => ({ ...prev, enabled }))}
                label="Enable quiet hours"
              />
            </div>
            {quietHours.enabled && (
              <div className="px-4 py-4 flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="time"
                      value={quietHours.startTime}
                      onChange={(e) =>
                        setQuietHours((prev) => ({ ...prev, startTime: e.target.value }))
                      }
                      className="w-full pl-10 pr-4 py-2 bg-[#2a2a2d] border border-[#3a3a3d] rounded-lg text-white text-sm focus:outline-none focus:border-[#d4af35]"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">End Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="time"
                      value={quietHours.endTime}
                      onChange={(e) =>
                        setQuietHours((prev) => ({ ...prev, endTime: e.target.value }))
                      }
                      className="w-full pl-10 pr-4 py-2 bg-[#2a2a2d] border border-[#3a3a3d] rounded-lg text-white text-sm focus:outline-none focus:border-[#d4af35]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3 bg-[#d4af35] hover:bg-[#e5c246] text-[#201d12] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
          <button
            onClick={handleUnsubscribeAll}
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-400 transition-colors"
          >
            <Ban className="w-4 h-4" />
            Unsubscribe from all notifications
          </button>
        </div>
      </div>
    </div>
  );
}
