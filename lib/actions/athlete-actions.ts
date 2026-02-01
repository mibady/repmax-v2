"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const AthleteProfileSchema = z.object({
  high_school: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(2).max(2),
  zone: z.enum(["West", "Southwest", "Midwest", "Southeast", "Northeast", "Mid-Atlantic"]).optional(),
  class_year: z.coerce.number().min(2020).max(2035),
  primary_position: z.string().min(1),
  secondary_position: z.string().optional(),
  height_inches: z.coerce.number().min(48).max(96).optional(),
  weight_lbs: z.coerce.number().min(100).max(400).optional(),
  forty_yard_time: z.coerce.number().min(4).max(7).optional(),
  vertical_inches: z.coerce.number().min(12).max(50).optional(),
  gpa: z.coerce.number().min(0).max(4).optional(),
  sat_score: z.coerce.number().min(400).max(1600).optional(),
  act_score: z.coerce.number().min(1).max(36).optional(),
  ncaa_id: z.string().optional(),
});

export async function createAthleteProfile(formData: FormData) {
  const supabase = await createClient();

  // Get current user
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
    throw new Error("Profile not found");
  }

  // Check if athlete profile already exists
  const { data: existingAthlete } = await supabase
    .from("athletes")
    .select("id")
    .eq("profile_id", profile.id)
    .single();

  if (existingAthlete) {
    throw new Error("Athlete profile already exists");
  }

  // Parse form data
  const rawData = Object.fromEntries(formData);
  const parsed = AthleteProfileSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  // Create athlete profile
  const { error } = await supabase.from("athletes").insert({
    profile_id: profile.id,
    ...parsed.data,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateAthleteProfile(athleteId: string, formData: FormData) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify ownership
  const { data: athlete } = await supabase
    .from("athletes")
    .select("profile:profiles(user_id)")
    .eq("id", athleteId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const athleteData = athlete as { profile?: { user_id: string } } | null;
  if (!athleteData || athleteData.profile?.user_id !== user.id) {
    throw new Error("Forbidden");
  }

  // Parse form data
  const rawData = Object.fromEntries(formData);
  const parsed = AthleteProfileSchema.partial().safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  // Update athlete profile
  const { error } = await supabase
    .from("athletes")
    .update(parsed.data)
    .eq("id", athleteId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/athletes/${athleteId}`);
  revalidatePath("/dashboard");

  return { success: true };
}

export async function getAthleteProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return null;
  }

  const { data: athlete } = await supabase
    .from("athletes")
    .select("*, profile:profiles(*)")
    .eq("profile_id", profile.id)
    .single();

  return athlete;
}
