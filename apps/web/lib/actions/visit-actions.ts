"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getCoachId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found" } as const;
  }

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (!coach) {
    return { error: "Only coaches can manage visits" } as const;
  }

  return { coachId: coach.id, supabase } as const;
}

export async function createVisit(
  athleteId: string,
  visitDate: string,
  visitType: "official" | "unofficial",
  visitTime?: string,
  notes?: string
) {
  const result = await getCoachId();
  if ("error" in result) return { error: result.error };

  const { coachId, supabase } = result;

  const { error } = await supabase.from("campus_visits").insert({
    recruiter_id: coachId,
    athlete_id: athleteId,
    visit_date: visitDate,
    visit_time: visitTime || null,
    visit_type: visitType,
    status: "pending",
    notes: notes || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/recruiter/visits");
  return { success: true };
}

export async function updateVisitStatus(
  visitId: string,
  status: "confirmed" | "pending" | "cancelled"
) {
  const result = await getCoachId();
  if ("error" in result) return { error: result.error };

  const { coachId, supabase } = result;

  const { error } = await supabase
    .from("campus_visits")
    .update({ status })
    .eq("id", visitId)
    .eq("recruiter_id", coachId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/recruiter/visits");
  return { success: true };
}

export async function cancelVisit(visitId: string) {
  return updateVisitStatus(visitId, "cancelled");
}
