"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAthleteFullProfile } from "@/lib/hooks";
import { PlayerCardContent } from "@/components/player-card";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-32 w-full bg-gradient-to-b from-[#1a1a1a] to-[#121212]"></div>
      <div className="px-6 relative -mt-16 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gray-700"></div>
        <div className="mt-4 h-8 w-48 bg-gray-700 rounded"></div>
        <div className="mt-2 h-4 w-64 bg-gray-700 rounded"></div>
      </div>
      <div className="p-6 space-y-6">
        <div className="h-24 bg-gray-700 rounded-2xl"></div>
        <div className="h-24 bg-gray-700 rounded-2xl"></div>
        <div className="h-48 bg-gray-700 rounded-2xl"></div>
      </div>
    </div>
  );
}

export default function AthletePage() {
  const params = useParams();
  const router = useRouter();
  const athleteId = params.id as string;

  // Guard: only fetch when id is a valid UUID to avoid collisions with
  // sibling named routes like (dashboard)/athlete/offers that share the
  // /athlete/* URL space via route groups.
  const isValidId = UUID_RE.test(athleteId);

  const { data, isLoading, error } = useAthleteFullProfile(isValidId ? athleteId : "");

  if (!isValidId || error) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
          <h1 className="text-2xl font-bold text-white mb-2">
            {!isValidId ? "Athlete Not Found" : "Error Loading Athlete"}
          </h1>
          <p className="text-gray-400 mb-4">
            {!isValidId ? "The requested athlete profile does not exist." : error?.message}
          </p>
          <Link href="/athletes" className="text-orange-500 hover:text-orange-400">
            &larr; Back to Athletes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-900/20 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 w-full max-w-[480px]">
        {isLoading || !data ? (
          <div className="bg-[#121212] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            <LoadingSkeleton />
          </div>
        ) : (
          <PlayerCardContent
            data={data}
            variant="standalone"
            actions={
              <div className="p-6 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/5 flex flex-col gap-4">
                <button
                  onClick={() => router.push('/login?returnTo=/athlete/' + athleteId)}
                  className="w-full h-12 bg-primary hover:bg-yellow-500 text-black font-bold rounded-full flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-primary/20"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Add to Shortlist
                </button>
                <button
                  onClick={() => router.push('/login?returnTo=/athlete/' + athleteId)}
                  className="w-full h-12 bg-transparent border border-primary text-primary hover:bg-primary/10 font-bold rounded-full flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                  Contact Coach
                </button>
                <div className="w-full flex justify-center items-center gap-1.5 opacity-40 mt-2">
                  <span className="material-symbols-outlined text-[12px]">bolt</span>
                  <p className="text-[10px] font-medium tracking-widest uppercase">
                    Powered by REPMAX
                  </p>
                </div>
              </div>
            }
          />
        )}
      </main>
    </div>
  );
}
