'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@repmax/shared/supabase';
import { useAthlete } from './use-athletes';
import type { PlayerCardData } from '@/components/player-card/types';

function formatHeight(inches: number | null): string {
  if (!inches) return 'N/A';
  const feet = Math.floor(inches / 12);
  const remaining = inches % 12;
  return `${feet}'${remaining}"`;
}

export function useAthleteFullProfile(id: string) {
  const { athlete, isLoading: athleteLoading, error } = useAthlete(id);
  const [data, setData] = useState<PlayerCardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (athleteLoading) {
      setIsLoading(true);
      return;
    }

    if (!athlete) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    async function fetchExtras() {
      const [docsResult, offersResult] = await Promise.all([
        supabase
          .from('documents')
          .select('id, title, document_type, file_url')
          .eq('athlete_id', athlete!.id)
          .order('uploaded_at', { ascending: false }),
        supabase
          .from('offers')
          .select('*', { count: 'exact', head: true })
          .eq('athlete_id', athlete!.id),
      ]);

      if (cancelled) return;

      const docs = docsResult.data ?? [];
      const transcripts = docs
        .filter((d) => d.document_type === 'transcript')
        .map((d) => ({ id: d.id, fileUrl: d.file_url }));
      const recommendations = docs
        .filter((d) => d.document_type === 'recommendation')
        .map((d) => ({ id: d.id, fileUrl: d.file_url }));

      const highlight = athlete!.highlights?.[0]
        ? {
            thumbnail:
              athlete!.highlights[0].thumbnail_url ||
              'https://lh3.googleusercontent.com/aida-public/AB6AXuD0kL36A2BWxzFzDUEhlWJflUxzoToTl3AVBx8LzI8iXl6P_Z2w19x4UrmKu2VUVyUBN16sRxKirK-0xo1Q3OEi-cm8wO11Ss4uNOiRuWCTvioea_8BO16HCcKknhuyrRjhmh0AB2SG28LVgZu0kgYmiqig0zn4MTbOoRAf5NbTSu-kU5DvK6uoxxTYuIRZU9QWNLIHWpwN_G6Pd7A38-TGI-yTko6oAGBpneHDt5iI0UzinakkTymm-Gr4TeQk9oco8CsaakatJMs',
            title: athlete!.highlights[0].title,
            videoUrl: athlete!.highlights[0].video_url || null,
          }
        : null;

      const cardData: PlayerCardData = {
        id: athlete!.id,
        name: athlete!.profile?.full_name || 'Unknown Athlete',
        school: athlete!.high_school,
        city: athlete!.city,
        state: athlete!.state,
        zone: athlete!.zone,
        classYear: athlete!.class_year,
        primaryPosition: athlete!.primary_position,
        secondaryPosition: athlete!.secondary_position,
        starRating: athlete!.star_rating || 0,
        verified: athlete!.verified ?? false,
        avatarUrl: athlete!.profile?.avatar_url || null,
        bio: athlete!.bio,
        coachNotes: athlete!.coach_notes,
        playerSummary: athlete!.player_summary,
        ncaaId: athlete!.ncaa_id,
        repmaxId: (athlete as Record<string, unknown>).repmax_id as string ?? null,
        offersCount: offersResult.count || 0,
        metrics: {
          height: formatHeight(athlete!.height_inches),
          weight: athlete!.weight_lbs,
          fortyYard: athlete!.forty_yard_time,
          tenYardSplit: athlete!.ten_yard_split,
          fiveTenFive: athlete!.five_ten_five,
          broadJump: athlete!.broad_jump_inches,
          vertical: athlete!.vertical_inches,
          wingspan: athlete!.wingspan_inches,
          bench: athlete!.bench_press_lbs,
          squat: athlete!.squat_lbs,
        },
        academics: {
          gpa: athlete!.gpa,
          weightedGpa: athlete!.weighted_gpa,
          sat: athlete!.sat_score,
          act: athlete!.act_score,
        },
        documents: { transcripts, recommendations },
        highlight,
      };

      setData(cardData);
      setIsLoading(false);
    }

    fetchExtras();
    return () => {
      cancelled = true;
    };
  }, [athlete, athleteLoading]);

  return { data, isLoading, error };
}
