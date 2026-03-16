"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { generateRepmaxId, stateToZone } from "@/lib/utils/athlete-helpers";
import crypto from "crypto";

export interface CreateAthleteResult {
  result: "linked" | "created";
  athleteId: string;
  error?: string;
}

interface CreateAthleteParams {
  fullName: string;
  email: string;
  position: string;
  classYear: number;
  schoolName: string;
  city: string;
  state: string;
  teamId: string;
  coachProfileId: string;
}

export async function createAthleteForCoach(
  params: CreateAthleteParams
): Promise<CreateAthleteResult> {
  const {
    fullName,
    email,
    position,
    classYear,
    schoolName,
    city,
    state,
    teamId,
    coachProfileId,
  } = params;

  const supabase = createServiceClient();

  // 1. Check if user already exists by email
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (existingUser) {
    // Check if they have a profile
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", existingUser.id)
      .single();

    if (existingProfile && existingProfile.role === "athlete") {
      // Get athlete record
      const { data: existingAthlete } = await supabase
        .from("athletes")
        .select("id")
        .eq("profile_id", existingProfile.id)
        .single();

      if (!existingAthlete) {
        return { result: "linked", athleteId: "", error: "Athlete record not found for existing user" };
      }

      // Check if already on roster
      const { data: existingRoster } = await supabase
        .from("team_rosters")
        .select("id")
        .eq("team_id", teamId)
        .eq("athlete_id", existingAthlete.id)
        .single();

      if (existingRoster) {
        return { result: "linked", athleteId: existingAthlete.id, error: "Athlete is already on your roster" };
      }

      // Link: add to roster
      const { error: rosterError } = await supabase
        .from("team_rosters")
        .insert({ team_id: teamId, athlete_id: existingAthlete.id });

      if (rosterError) {
        return { result: "linked", athleteId: existingAthlete.id, error: rosterError.message };
      }

      // Send notification
      await supabase.from("notifications").insert({
        profile_id: existingProfile.id,
        type: "roster_add",
        title: "Added to Team Roster",
        message: `A coach has added you to their team roster.`,
      });

      return { result: "linked", athleteId: existingAthlete.id };
    }

    if (existingProfile && existingProfile.role !== "athlete") {
      return {
        result: "linked",
        athleteId: "",
        error: `User exists with a different role (${existingProfile.role})`,
      };
    }
  }

  // 2. Create new user + profile + athlete
  const password = crypto.randomUUID();
  const { data: newUser, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        invited_by_coach: true,
      },
    });

  if (createError || !newUser.user) {
    return {
      result: "created",
      athleteId: "",
      error: createError?.message || "Failed to create user",
    };
  }

  // Create profile
  const { data: newProfile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      user_id: newUser.user.id,
      role: "athlete",
      full_name: fullName,
    })
    .select("id")
    .single();

  if (profileError || !newProfile) {
    return {
      result: "created",
      athleteId: "",
      error: profileError?.message || "Failed to create profile",
    };
  }

  // Create athlete record
  const zone = stateToZone(state);
  const repmaxId = await generateRepmaxId(supabase, fullName, classYear);

  const { data: newAthlete, error: athleteError } = await supabase
    .from("athletes")
    .insert({
      profile_id: newProfile.id,
      primary_position: position,
      class_year: classYear,
      high_school: schoolName,
      city,
      state,
      zone: zone || "Southeast",
      repmax_id: repmaxId,
      ncaa_cleared: false,
    })
    .select("id")
    .single();

  if (athleteError || !newAthlete) {
    return {
      result: "created",
      athleteId: "",
      error: athleteError?.message || "Failed to create athlete record",
    };
  }

  // Add to roster
  await supabase
    .from("team_rosters")
    .insert({ team_id: teamId, athlete_id: newAthlete.id });

  // Create invite record
  await supabase.from("coach_athlete_invites").insert({
    coach_profile_id: coachProfileId,
    team_id: teamId,
    athlete_profile_id: newProfile.id,
    athlete_email: email.toLowerCase(),
    status: "pending",
  });

  // Generate magic link for invite
  await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  return { result: "created", athleteId: newAthlete.id };
}
