'use client';

import type { PlayerCardContentProps } from './types';
import {
  HeroSection,
  FilmSection,
  MeasurablesSection,
  AcademicsSection,
  ScoutingSection,
  ContactsSection,
  EquipmentSection,
  SocialSection,
  DocumentsSection,
  ShareSection,
} from './sections';

export default function PlayerCardContent({
  data,
  actions,
  variant = 'standalone',
}: PlayerCardContentProps) {
  const isMini = variant === 'mini';

  if (isMini) {
    return (
      <div className="bg-card-dark border border-white/10 rounded-3xl shadow-2xl overflow-hidden w-full">
        <HeroSection data={data} />
        <div className="p-6 flex flex-col gap-6">
          {data.bio && (
            <section>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
                <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">{data.bio}</p>
              </div>
            </section>
          )}
          <MeasurablesSection metrics={data.metrics} />
          <AcademicsSection data={data} />
        </div>
        {actions}
      </div>
    );
  }

  return (
    <div
      className={`bg-card-dark border border-white/10 rounded-3xl shadow-2xl overflow-hidden ${
        variant === 'standalone' ? 'max-w-[480px] w-full' : 'w-full'
      }`}
    >
      <HeroSection data={data} />

      {/* Scrollable Content Area */}
      <div className="p-6 flex flex-col gap-6">
        {/* Bio */}
        {data.bio && (
          <section>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
              <p className="text-sm text-gray-300 leading-relaxed">{data.bio}</p>
            </div>
          </section>
        )}

        {/* Film */}
        <FilmSection data={data} />

        {/* Social */}
        <SocialSection data={data} />

        {/* Measurables */}
        <MeasurablesSection metrics={data.metrics} />

        {/* Academics */}
        <AcademicsSection data={data} />

        {/* Scouting Report Notes */}
        <ScoutingSection data={data} />

        {/* Contacts */}
        <ContactsSection data={data} />

        {/* Equipment */}
        <EquipmentSection data={data} />

        {/* Documents */}
        <DocumentsSection data={data} />

        {/* Share Card */}
        <ShareSection data={data} />

        {/* NCAA ID */}
        {data.ncaaId && (
          <section>
            <div className="bg-primary/15 border border-primary/40 rounded-2xl p-5 flex flex-col items-center gap-3 text-center">
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">NCAA ID</span>
              <span className="text-2xl font-bold text-white font-mono tracking-wide">{data.ncaaId}</span>
            </div>
          </section>
        )}
      </div>

      {/* Actions slot */}
      {actions}
    </div>
  );
}
