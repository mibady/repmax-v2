'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@repmax/shared/supabase';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProfileSettingsPage() {
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalName, setOriginalName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (data) {
        setFullName(data.full_name || '');
        setOriginalName(data.full_name || '');
        setAvatarUrl(data.avatar_url || null);
      }
      setIsLoading(false);
    }
    loadProfile();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, WebP, or GIF image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Upload to storage
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile');

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const { url } = await res.json();

      // Update profile with new avatar URL
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id);

      if (error) throw new Error(error.message);

      setAvatarUrl(url);
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm('Remove your profile photo?')) return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (error) throw new Error(error.message);

      setAvatarUrl(null);
      toast.success('Profile photo removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove photo');
    }
  };

  const handleSaveName = async () => {
    if (fullName === originalName) return;
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw new Error(error.message);

      setOriginalName(fullName);
      toast.success('Name updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-10">
        {/* Page Heading */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight text-white">Profile</h1>
          <p className="text-slate-400 max-w-2xl text-lg">
            Manage your profile photo and display name.
          </p>
        </div>

        {/* Profile Photo Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 px-1">
            <span className="material-symbols-outlined text-primary">account_circle</span>
            <h2 className="text-xl font-bold tracking-tight text-white">Profile Photo</h2>
          </div>
          <div className="p-6 bg-[#1A1A1A] rounded-xl border border-white/10">
            <div className="flex items-center gap-6">
              {/* Avatar preview */}
              <div className="size-24 rounded-full bg-[#2A2A2E] border-2 border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="size-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white/40">{initials}</span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-sm text-slate-400">
                  Upload a photo. JPEG, PNG, WebP, or GIF — max 5MB.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <div className="size-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">upload</span>
                        {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                      </>
                    )}
                  </button>
                  {avatarUrl && (
                    <button
                      onClick={handleRemovePhoto}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-red-400 font-medium text-sm hover:bg-red-500/10 transition-colors border border-white/10"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Display Name Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 px-1">
            <span className="material-symbols-outlined text-primary">badge</span>
            <h2 className="text-xl font-bold tracking-tight text-white">Display Name</h2>
          </div>
          <div className="p-6 bg-[#1A1A1A] rounded-xl border border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex flex-col gap-2 flex-1 w-full">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white text-sm focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
              <button
                onClick={handleSaveName}
                disabled={isSaving || fullName === originalName}
                className="px-6 py-2.5 rounded-lg bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <div className="flex items-center gap-2 mb-6 px-1">
            <span className="material-symbols-outlined text-primary">tune</span>
            <h2 className="text-xl font-bold tracking-tight text-white">Other Settings</h2>
          </div>
          <div className="grid gap-px bg-white/10 rounded-xl overflow-hidden border border-white/10">
            <Link
              href="/settings/notifications"
              className="flex items-center justify-between p-5 bg-[#1A1A1A] hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white/40">notifications</span>
                <span className="text-sm font-medium text-white">Notification Preferences</span>
              </div>
              <span className="material-symbols-outlined text-white/20 text-[18px]">chevron_right</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
