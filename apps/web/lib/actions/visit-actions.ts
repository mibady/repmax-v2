"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createVisitSchema = z.object({
  athleteId: z.string().uuid("Invalid athlete ID"),
  visitDate: z.string().min(1, "Visit date is required"),
  visitType: z.enum(["official", "unofficial"]),
  visitTime: z.string().optional(),
  notes: z.string().optional(),
});

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
  const parsed = createVisitSchema.safeParse({ athleteId, visitDate, visitType, visitTime, notes });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  const result = await getCoachId();
  if ("error" in result) return { error: result.error };

  const { coachId, supabase } = result;

  const { error } = await supabase.from("campus_visits").insert({
    recruiter_id: coachId,
    athlete_id: parsed.data.athleteId,
    visit_date: parsed.data.visitDate,
    visit_time: parsed.data.visitTime || null,
    visit_type: parsed.data.visitType,
    status: "pending",
    notes: parsed.data.notes || null,
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
