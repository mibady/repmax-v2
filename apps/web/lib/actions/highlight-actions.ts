"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Tables } from "@/types/database";

export type Highlight = Tables<"highlights">;

export async function getMyHighlights(): Promise<Highlight[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get the user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return [];
  }

  // Get the athlete record
  const { data: athlete } = await supabase
    .from("athletes")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (!athlete) {
    return [];
  }

  // Get highlights for this athlete
  const { data: highlights, error } = await supabase
    .from("highlights")
    .select("*")
    .eq("athlete_id", athlete.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching highlights:", error);
    return [];
  }

  return highlights || [];
}

export async function getAthleteHighlights(athleteId: string): Promise<Highlight[]> {
  const supabase = await createClient();

  const { data: highlights, error } = await supabase
    .from("highlights")
    .select("*")
    .eq("athlete_id", athleteId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching athlete highlights:", error);
    return [];
  }

  return highlights || [];
}

export async function createHighlight(data: {
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get the user's athlete profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  const { data: athlete } = await supabase
    .from("athletes")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (!athlete) {
    return { error: "Athlete profile not found" };
  }

  const { data: highlight, error } = await supabase
    .from("highlights")
    .insert({
      athlete_id: athlete.id,
      title: data.title,
      description: data.description || null,
      video_url: data.video_url,
      thumbnail_url: data.thumbnail_url || null,
      duration_seconds: data.duration_seconds || null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/athlete/film");
  return { data: highlight };
}

export async function updateHighlight(
  highlightId: string,
  data: {
    title?: string;
    description?: string;
    thumbnail_url?: string;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify ownership through athlete → profile → user chain
  const { data: highlight } = await supabase
    .from("highlights")
    .select("athlete:athletes(profile:profiles(user_id))")
    .eq("id", highlightId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const highlightData = highlight as any;
  if (!highlightData || highlightData.athlete?.profile?.user_id !== user.id) {
    return { error: "Forbidden" };
  }

  const { error } = await supabase
    .from("highlights")
    .update(data)
    .eq("id", highlightId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/athlete/film");
  return { success: true };
}

export async function deleteHighlight(highlightId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify ownership
  const { data: highlight } = await supabase
    .from("highlights")
    .select("athlete:athletes(profile:profiles(user_id))")
    .eq("id", highlightId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const highlightData = highlight as any;
  if (!highlightData || highlightData.athlete?.profile?.user_id !== user.id) {
    return { error: "Forbidden" };
  }

  const { error } = await supabase
    .from("highlights")
    .delete()
    .eq("id", highlightId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/athlete/film");
  return { success: true };
}

export interface HighlightWithAthlete extends Highlight {
  athlete: {
    id: string;
    name: string;
    classYear: number;
    school: string;
    heightInches: number | null;
    weightLbs: number | null;
    position: string;
  } | null;
}

export async function getHighlight(highlightId: string): Promise<HighlightWithAthlete | null> {
  const supabase = await createClient();

  const { data: highlight, error } = await supabase
    .from("highlights")
    .select(`
      *,
      athletes(
        id,
        high_school,
        class_year,
        primary_position,
        height_inches,
        weight_lbs,
        profiles(full_name)
      )
    `)
    .eq("id", highlightId)
    .single();

  if (error || !highlight) {
    console.error("Error fetching highlight:", error);
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const athleteData = highlight.athletes as any;
  return {
    ...highlight,
    athlete: athleteData ? {
      id: athleteData.id,
      name: athleteData.profiles?.full_name || "Unknown",
      classYear: athleteData.class_year,
      school: athleteData.high_school,
      heightInches: athleteData.height_inches,
      weightLbs: athleteData.weight_lbs,
      position: athleteData.primary_position,
    } : null,
  };
}

export async function incrementHighlightViews(highlightId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("increment_highlight_views", {
    highlight_id: highlightId,
  });

  if (error) {
    // Fallback to manual increment if RPC doesn't exist
    const { data: current } = await supabase
      .from("highlights")
      .select("view_count")
      .eq("id", highlightId)
      .single();

    if (current) {
      await supabase
        .from("highlights")
        .update({ view_count: (current.view_count || 0) + 1 })
        .eq("id", highlightId);
    }
  }
}
