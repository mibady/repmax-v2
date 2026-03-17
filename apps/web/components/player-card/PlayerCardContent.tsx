'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { PlayerCardContentProps } from './types';
import HighlightVideo from './HighlightVideo';

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCz5tdm2iqfJ4HWNltYdzZxqDD6zvFqQFxnt8XAnlYNU5PepMx3HTwvhTH-esYE5zA4sgEvuLBo7PxEdcvYiBbXA7_loyZ49uw3KPhiG5s0H5PLQFYekJM4E6nKivPokKcEDg4l0cDCyg2eEJgsZz5FpYskvM5EYz5PCbDeWUyiB3r5lrztrr53ZUGsJ_FoaDdS7b0wv4EQuoJAgbTNAo_2LBmejJ7qGoSIDGQnEPDBLujfO4I48IZ12Yfa4lE-S6jUgG40lXh2rnQ';

const DEFAULT_THUMBNAIL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD0kL36A2BWxzFzDUEhlWJflUxzoToTl3AVBx8LzI8iXl6P_Z2w19x4UrmKu2VUVyUBN16sRxKirK-0xo1Q3OEi-cm8wO11Ss4uNOiRuWCTvioea_8BO16HCcKknhuyrRjhmh0AB2SG28LVgZu0kgYmiqig0zn4MTbOoRAf5NbTSu-kU5DvK6uoxxTYuIRZU9QWNLIHWpwN_G6Pd7A38-TGI-yTko6oAGBpneHDt5iI0UzinakkTymm-Gr4TeQk9oco8CsaakatJMs';

function formatValue(val: number | null | undefined, suffix = ''): string {
  if (val === null || val === undefined || val === 0) return 'N/A';
  return `${val}${suffix}`;
}

export default function PlayerCardContent({
  data,
  actions,
  variant = 'standalone',
}: PlayerCardContentProps) {
  const avatarUrl = data.avatarUrl || DEFAULT_AVATAR;
  const highlight = data.highlight || {
    thumbnail: DEFAULT_THUMBNAIL,
    title: 'No highlights uploaded yet',
    videoUrl: null,
  };

  const isStandalone = variant === 'standalone';

  return (
    <div
      className={`bg-card-dark border border-white/10 rounded-3xl shadow-2xl overflow-hidden ${
        isStandalone ? 'max-w-[480px] w-full' : 'w-full'
      }`}
    >
      {/* Hero Image */}
      <div
        className={`relative w-full ${
          isStandalone ? 'aspect-[4/3]' : 'aspect-[3/2]'
        } bg-gradient-to-b from-[#1a1a1a] to-card-dark overflow-hidden`}
      >
        <Image
          src={avatarUrl}
          alt={`Portrait of athlete ${data.name}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card-dark via-card-dark/40 to-transparent" />
        {/* Zone Badge */}
        {data.zone && (
          <div className="absolute top-4 right-4 bg-purple-900/80 border border-purple-500/50 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 z-10">
            <span className="material-symbols-outlined text-purple-200 text-[14px]">
              location_on
            </span>
            <span className="text-[10px] font-bold tracking-wider text-purple-100 uppercase">
              {data.zone} Zone
            </span>
          </div>
        )}
        {/* Verified Badge */}
        {data.verified && (
          <div className="absolute bottom-4 right-4 z-10 bg-green-900/80 border border-green-500/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-green-400 text-[16px] leading-none"
              style={{
                fontVariationSettings: "'FILL' 1, 'wght' 700",
              }}
            >
              verified
            </span>
            <span className="text-[10px] font-bold tracking-wider text-green-300 uppercase">
              Verified
            </span>
          </div>
        )}
      </div>

      {/* Identity Section */}
      <div className="px-6 pt-5 flex flex-col items-center text-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {data.name}
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            {[data.school, data.city, data.state].filter(Boolean).join(', ')}
          </p>
        </div>

        {/* Position Pills */}
        <div className="mt-4 flex gap-3">
          {data.primaryPosition && (
            <div className="flex h-7 items-center justify-center px-4 rounded-full bg-primary/20 border border-primary/30">
              <span className="text-primary text-xs font-bold tracking-wider">
                {data.primaryPosition}
              </span>
            </div>
          )}
          {data.secondaryPosition && (
            <div className="flex h-7 items-center justify-center px-4 rounded-full bg-neutral-800 border border-white/10">
              <span className="text-gray-300 text-xs font-bold tracking-wider">
                {data.secondaryPosition}
              </span>
            </div>
          )}
        </div>

        {/* Ratings & Class */}
        <div className="mt-5 w-full flex items-center justify-between border-y border-white/5 py-3 px-2">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              Class Of
            </span>
            <span className="text-sm font-bold text-white">
              {data.classYear || 'N/A'}
            </span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              Rating
            </span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`material-symbols-outlined text-[16px] ${
                    star <= data.starRating ? 'text-primary' : 'text-gray-700'
                  }`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              ))}
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
              Offers
            </span>
            <span className="text-sm font-bold text-primary">
              {data.offersCount}
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="p-6 flex flex-col gap-6">
        {/* Section: Bio */}
        {data.bio && (
          <section>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
              <p className="text-sm text-gray-300 leading-relaxed">
                {data.bio}
              </p>
            </div>
          </section>
        )}

        {/* Section: Athletic Metrics (3-col grid) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[20px]">
              straighten
            </span>
            <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
              Athletic Metrics
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
              <span className="text-[10px] text-gray-500 font-medium">
                Height
              </span>
              <span className="text-xl text-white font-bold font-mono">
                {data.metrics.height}
              </span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
              <span className="text-[10px] text-gray-500 font-medium">
                Weight
              </span>
              <span className="text-xl text-white font-bold font-mono">
                {formatValue(data.metrics.weight)}
              </span>
              {data.metrics.weight ? (
                <span className="text-[10px] text-gray-500 -mt-1">lbs</span>
              ) : null}
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
              <span className="text-[10px] text-gray-500 font-medium">
                40-Yard
              </span>
              <span className="text-xl text-primary font-bold font-mono">
                {data.metrics.fortyYard
                  ? `${data.metrics.fortyYard}s`
                  : 'N/A'}
              </span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
              <span className="text-[10px] text-gray-500 font-medium">
                10Y Split
              </span>
              <span className="text-xl text-white font-bold font-mono">
                {data.metrics.tenYardSplit
                  ? `${data.metrics.tenYardSplit}s`
                  : 'N/A'}
              </span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
              <span className="text-[10px] text-gray-500 font-medium">
                5-10-5
              </span>
              <span className="text-xl text-white font-bold font-mono">
                {data.metrics.fiveTenFive
                  ? `${data.metrics.fiveTenFive}s`
                  : 'N/A'}
              </span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
              <span className="text-[10px] text-gray-500 font-medium">
                Broad Jump
              </span>
              <span className="text-xl text-white font-bold font-mono">
                {formatValue(data.metrics.broadJump, '"')}
              </span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
              <span className="text-[10px] text-gray-500 font-medium">
                Vertical
              </span>
              <span className="text-xl text-white font-bold font-mono">
                {formatValue(data.metrics.vertical, '"')}
              </span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
              <span className="text-[10px] text-gray-500 font-medium">
                Wingspan
              </span>
              <span className="text-xl text-white font-bold font-mono">
                {formatValue(data.metrics.wingspan, '"')}
              </span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
              <span className="text-[10px] text-gray-500 font-medium">
                Bench
              </span>
              <span className="text-xl text-white font-bold font-mono">
                {formatValue(data.metrics.bench)}
              </span>
              {data.metrics.bench ? (
                <span className="text-[10px] text-gray-500 -mt-1">lbs</span>
              ) : null}
            </div>
            <div />
            <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col gap-1 hover:bg-white/10 transition-colors">
              <span className="text-[10px] text-gray-500 font-medium">
                Squat
              </span>
              <span className="text-xl text-white font-bold font-mono">
                {formatValue(data.metrics.squat)}
              </span>
              {data.metrics.squat ? (
                <span className="text-[10px] text-gray-500 -mt-1">lbs</span>
              ) : null}
            </div>
          </div>
        </section>

        {/* Section: Profile Snapshot */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[20px]">
              school
            </span>
            <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
              Profile Snapshot
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
              <span className="text-xs text-gray-500 font-medium">GPA</span>
              <span className="text-xl text-white font-bold font-mono">
                {formatValue(data.academics.gpa)}
              </span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
              <span className="text-xs text-gray-500 font-medium">W. GPA</span>
              <span className="text-xl text-white font-bold font-mono">
                {formatValue(data.academics.weightedGpa)}
              </span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 hover:bg-white/10 transition-colors">
              <span className="text-xs text-gray-500 font-medium">Offers</span>
              <span className="text-xl text-primary font-bold font-mono">
                {data.offersCount}
              </span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 font-medium">SAT</span>
              <span className="text-xl text-white font-bold font-mono">
                {formatValue(data.academics.sat)}
              </span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 font-medium">ACT</span>
              <span className="text-xl text-white font-bold font-mono">
                {formatValue(data.academics.act)}
              </span>
            </div>
          </div>
        </section>

        {/* Section: Documents */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[20px]">
              description
            </span>
            <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
              Documents
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {data.documents.transcripts.length > 0 ? (
              <a
                href={data.documents.transcripts[0].fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer text-center"
              >
                <span className="material-symbols-outlined text-primary text-[28px]">
                  description
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                  Transcript
                </span>
              </a>
            ) : (
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 opacity-40 text-center">
                <span className="material-symbols-outlined text-gray-500 text-[28px]">
                  description
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                  Transcript
                </span>
              </div>
            )}
            {data.documents.recommendations.length > 0 ? (
              <a
                href={data.documents.recommendations[0].fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer text-center"
              >
                <span className="material-symbols-outlined text-primary text-[28px]">
                  mail
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                  Letter
                </span>
              </a>
            ) : (
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 opacity-40 text-center">
                <span className="material-symbols-outlined text-gray-500 text-[28px]">
                  mail
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                  Letter
                </span>
              </div>
            )}
            <a
              href="#"
              className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-colors cursor-pointer text-center"
            >
              <span className="material-symbols-outlined text-primary text-[28px]">
                query_stats
              </span>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                Scouting Report
              </span>
            </a>
          </div>
        </section>

        {/* Section: Film */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                smart_display
              </span>
              <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
                Highlights
              </h2>
            </div>
            <Link
              href={`/athlete/${data.id}#highlights`}
              className="text-xs text-primary font-medium hover:underline"
            >
              View All
            </Link>
          </div>
          <HighlightVideo
            thumbnail={highlight.thumbnail}
            title={highlight.title}
            videoUrl={highlight.videoUrl}
          />
        </section>

        {/* Section: Coach Notes */}
        {data.coachNotes && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[20px]">
                sports
              </span>
              <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
                Coach Notes
              </h2>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {data.coachNotes}
              </p>
            </div>
          </section>
        )}

        {/* Section: Player Summary */}
        {data.playerSummary && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[20px]">
                person_search
              </span>
              <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase">
                Player Summary
              </h2>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5">
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {data.playerSummary}
              </p>
            </div>
          </section>
        )}

        {/* Section: NCAA ID */}
        {data.ncaaId && (
          <section>
            <div className="bg-primary/15 border border-primary/40 rounded-2xl p-5 flex flex-col items-center gap-3 text-center">
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                NCAA ID
              </span>
              <span className="text-2xl font-bold text-white font-mono tracking-wide">
                {data.ncaaId}
              </span>
            </div>
          </section>
        )}
      </div>

      {/* Actions slot */}
      {actions}
    </div>
  );
}
