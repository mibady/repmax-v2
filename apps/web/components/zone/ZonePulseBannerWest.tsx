'use client';

import Link from 'next/link';

interface ZonePulseBannerWestProps {
  zoneName?: string;
  states?: string;
  athleteCount?: number;
  eventCount?: number;
  portalStatus?: 'open' | 'closed';
  signingDayCountdown?: string;
}

export default function ZonePulseBannerWest({
  zoneName = 'West Zone',
  states = 'CA, NV, OR, WA, UT, CO',
  athleteCount = 81,
  eventCount = 3,
  portalStatus = 'open',
  signingDayCountdown = '',
}: ZonePulseBannerWestProps) {
  return (
    <>
      {/* Main Component: Zone Pulse Banner West */}
      <div className="w-full max-w-5xl rounded-xl border border-primary/50 bg-gradient-to-br from-[#8956f51f] to-[#1F1F22] p-6 shadow-lg shadow-primary/10 transition-all hover:shadow-primary/20 group">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left Section: Zone Info */}
          <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary pulse-dot"></span>
              </div>
              <h2 className="text-primary text-xl font-bold tracking-tight">{zoneName}</h2>
            </div>
            <p className="text-slate-400 text-sm font-medium pl-6">{states}</p>
          </div>

          {/* Center Section: Metrics */}
          <div className="flex flex-1 w-full lg:w-auto items-center justify-center gap-8 lg:gap-16 border-y border-white/5 py-4 lg:border-0 lg:py-0">
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-3xl font-bold text-white">{athleteCount}</span>
              <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Athletes</span>
            </div>
            <div className="h-8 w-px bg-white/10 hidden lg:block"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-3xl font-bold text-white">{eventCount}</span>
              <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Events</span>
            </div>
          </div>

          {/* Right Section: Status Badges */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 items-end w-full lg:w-auto">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full w-full sm:w-auto justify-center lg:justify-end ${
              portalStatus === 'open'
                ? 'bg-emerald-500/10 border border-emerald-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <span className={`material-symbols-outlined text-[18px] ${
                portalStatus === 'open' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {portalStatus === 'open' ? 'check_circle' : 'cancel'}
              </span>
              <span className={`text-sm font-medium whitespace-nowrap ${
                portalStatus === 'open' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                Portal: {portalStatus === 'open' ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 w-full sm:w-auto justify-center lg:justify-end">
              <span className="material-symbols-outlined text-orange-400 text-[18px]">schedule</span>
              <span className="text-orange-400 text-sm font-medium whitespace-nowrap">
                Signing Day: <span className="font-mono">{signingDayCountdown}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="mt-6 flex justify-center lg:justify-start pt-4 border-t border-white/5">
          <Link
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-primary transition-colors duration-200 group/link"
            href="/dashboard/zone"
          >
            View zone details
            <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover/link:translate-y-0.5">
              arrow_downward
            </span>
          </Link>
        </div>
      </div>

      {/* Custom styles from Stitch */}
      <style dangerouslySetInnerHTML={{ __html: `
        .pulse-dot {
          box-shadow: 0 0 0 0 rgba(137, 86, 245, 0.7);
          animation: pulse-purple 2s infinite;
        }

        @keyframes pulse-purple {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(137, 86, 245, 0.7);
          }

          70% {
            transform: scale(1);
            box-shadow: 0 0 0 6px rgba(137, 86, 245, 0);
          }

          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(137, 86, 245, 0);
          }
        }
      ` }} />
    </>
  );
}
