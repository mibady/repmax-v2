"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRecruiterTier } from "@/lib/utils/subscription-server";

export async function addToShortlist(athleteId: string, notes?: string) {
  const { authorized } = await requireRecruiterTier("pro");
  if (!authorized) {
    return { error: "Pro recruiter subscription required" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  // Get coach ID
  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (!coach) {
    return { error: "Only coaches can add to shortlists" };
  }

  // Add to shortlist
  const { error } = await supabase.from("shortlists").insert({
    coach_id: coach.id,
    athlete_id: athleteId,
    notes,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Athlete already in shortlist" };
    }
    return { error: error.message };
  }

  revalidatePath("/shortlist");
  revalidatePath(`/athletes/${athleteId}`);

  return { success: true };
}

export async function removeFromShortlist(athleteId: string) {
  const { authorized } = await requireRecruiterTier("pro");
  if (!authorized) {
    return { error: "Pro recruiter subscription required" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  // Get coach ID
  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (!coach) {
    return { error: "Only coaches can remove from shortlists" };
  }

  const { error } = await supabase
    .from("shortlists")
    .delete()
    .eq("coach_id", coach.id)
    .eq("athlete_id", athleteId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/shortlist");
  revalidatePath(`/athletes/${athleteId}`);

  return { success: true };
}

export async function updateShortlistPriority(
  athleteId: string,
  priority: "low" | "medium" | "high" | "top"
) {
  const { authorized } = await requireRecruiterTier("pro");
  if (!authorized) {
    return { error: "Pro recruiter subscription required" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  // Get coach ID
  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (!coach) {
    return { error: "Only coaches can update shortlists" };
  }

  const { error } = await supabase
    .from("shortlists")
    .update({ priority })
    .eq("coach_id", coach.id)
    .eq("athlete_id", athleteId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/shortlist");

  return { success: true };
}

export type PipelineStatus = "identified" | "contacted" | "evaluating" | "visit_scheduled" | "offered" | "committed";

export async function updateShortlistStatus(
  athleteId: string,
  pipelineStatus: PipelineStatus
) {
  const { authorized } = await requireRecruiterTier("pro");
  if (!authorized) {
    return { error: "Pro recruiter subscription required" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  // Get coach ID
  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (!coach) {
    return { error: "Only coaches can update shortlists" };
  }

  const { error } = await supabase
    .from("shortlists")
    .update({ pipeline_status: pipelineStatus })
    .eq("coach_id", coach.id)
    .eq("athlete_id", athleteId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/recruiter/pipeline");
  revalidatePath("/shortlist");

  return { success: true };
}

export async function getShortlist() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return [];
  }

  // Get coach ID
  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (!coach) {
    return [];
  }

  const { data } = await supabase
    .from("shortlists")
    .select(
      `
      *,
      athlete:athletes(
        *,
        profile:profiles(full_name, avatar_url)
      )
    `
    )
    .eq("coach_id", coach.id)
    .order("updated_at", { ascending: false });

  return data || [];
}
