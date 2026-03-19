'use client';

import type { PlayerCardData } from '../types';

function ContactCard({ label, name, phone, email }: { label: string; name: string; phone?: string | null; email?: string | null }) {
  if (!name) return null;

  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-2">{label}</span>
      <p className="text-sm font-semibold text-white mb-2">{name}</p>
      <div className="flex gap-2">
        {phone && (
          <>
            <a href={`tel:${phone}`} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-[10px] font-semibold text-green-400 hover:bg-green-500/20 transition-colors">
              <span className="material-symbols-outlined text-[12px]">call</span>
              Call
            </a>
            <a href={`sms:${phone}`} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] font-semibold text-blue-400 hover:bg-blue-500/20 transition-colors">
              <span className="material-symbols-outlined text-[12px]">sms</span>
              Text
            </a>
          </>
        )}
        {email && (
          <a href={`mailto:${email}`} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] font-semibold text-purple-400 hover:bg-purple-500/20 transition-colors">
            <span className="material-symbols-outlined text-[12px]">mail</span>
            Email
          </a>
        )}
      </div>
    </div>
  );
}

export function ContactsSection({ data }: { data: PlayerCardData }) {
  const hasCoach = data.coachName || data.coachPhone || data.coachEmail;
  const hasParent1 = data.parent1Name;
  const hasParent2 = data.parent2Name;

  if (!hasCoach && !hasParent1 && !hasParent2) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-[20px]">contacts</span>
        <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">Contacts</h2>
      </div>
      <div className="space-y-3">
        {hasCoach && (
          <ContactCard
            label="HS Coach"
            name={data.coachName || 'Coach'}
            phone={data.coachPhone}
            email={data.coachEmail}
          />
        )}
        {hasParent1 && (
          <ContactCard
            label="Parent / Guardian 1"
            name={data.parent1Name!}
            phone={data.parent1Phone}
            email={data.parent1Email}
          />
        )}
        {hasParent2 && (
          <ContactCard
            label="Parent / Guardian 2"
            name={data.parent2Name!}
            phone={data.parent2Phone}
            email={data.parent2Email}
          />
        )}
      </div>
    </section>
  );
}
