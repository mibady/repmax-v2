'use client';

import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-slate-600 text-5xl mb-4">settings</span>
        <h2 className="text-xl font-bold text-white mb-2">Settings</h2>
        <p className="text-slate-400 text-sm mb-6">Coming soon. We&apos;re working on this feature.</p>
        <Link href="/athlete" className="text-primary text-sm font-medium hover:text-primary/80">
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
