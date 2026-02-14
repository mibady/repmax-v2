"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type CommType = "call" | "visit" | "email" | "message";

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
    return { error: "Only coaches can log communications" } as const;
  }

  return { coachId: coach.id, supabase } as const;
}

export async function logCommunication(
  athleteId: string,
  commType: CommType,
  summary: string
) {
  const result = await getCoachId();
  if ("error" in result) return { error: result.error };

  const { coachId, supabase } = result;

  const { error } = await supabase.from("communication_log").insert({
    recruiter_id: coachId,
    athlete_id: athleteId,
    comm_type: commType,
    summary,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/recruiter/communications");
  return { success: true };
}

export async function getAthleteContactEmail(
  athleteId: string
): Promise<{ email: string | null; error?: string }> {
  const result = await getCoachId();
  if ("error" in result) return { email: null, error: result.error };

  const { supabase } = result;

  // Get the athlete's profile_id
  const { data: athlete } = await supabase
    .from("athletes")
    .select("profile_id")
    .eq("id", athleteId)
    .single();

  if (!athlete) {
    return { email: null, error: "Athlete not found" };
  }

  // Get the user_id from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("id", athlete.profile_id)
    .single();

  if (!profile) {
    return { email: null, error: "Profile not found" };
  }

  // Use service role to read auth.users for email
  const serviceClient = createServiceClient();
  const { data: userData, error } = await serviceClient.auth.admin.getUserById(
    profile.user_id
  );

  if (error || !userData?.user?.email) {
    return { email: null, error: "Email not available" };
  }

  return { email: userData.user.email };
}
