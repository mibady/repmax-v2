"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getBaseUrl } from "@/lib/utils/get-base-url";
import { generateRepmaxId } from "@/lib/utils/athlete-helpers";

export interface AuthResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

export async function login(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  redirect("/dashboard");
}

export async function signup(formData: FormData): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullname") as string;

  if (!email || !password || !fullName) {
    return { success: false, error: "All fields are required" };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${getBaseUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Redirect to onboarding to select role
  redirect("/onboarding/role");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getBaseUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { success: true };
}

export async function signInWithApple(): Promise<AuthResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: `${getBaseUrl()}/auth/callback`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { success: true };
}

export async function resetPassword(email: string): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getBaseUrl()}/auth/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export type UserRole = "athlete" | "parent" | "coach" | "recruiter" | "club";

// Map UI roles to database roles
function mapRoleToDbRole(role: UserRole): "athlete" | "coach" | "recruiter" | "admin" | "parent" | "club" {
  switch (role) {
    case "athlete":   return "athlete";
    case "parent":    return "parent";
    case "coach":     return "coach";
    case "recruiter": return "recruiter";
    case "club":      return "club";
    default:          return "athlete";
  }
}

// Get redirect path based on role
function getRedirectPathForRole(role: UserRole): string {
  switch (role) {
    case "athlete":   return "/onboarding/chat";
    case "parent":    return "/parent";
    case "coach":     return "/coach";
    case "recruiter": return "/recruiter/pipeline";
    case "club":      return "/club";
    default:          return "/onboarding/chat";
  }
}

export async function updateUserRole(role: UserRole): Promise<AuthResult> {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "You must be logged in to update your role" };
  }

  const dbRole = mapRoleToDbRole(role);

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  let profileId: string;

  if (existingProfile) {
    profileId = existingProfile.id;
    // Update existing profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        role: dbRole,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }
  } else {
    // Create new profile
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        role: dbRole,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
      })
      .select("id")
      .single();

    if (insertError || !newProfile) {
      return { success: false, error: insertError?.message || "Failed to create profile" };
    }
    profileId = newProfile.id;
  }

  // Create role-specific records in coaches table
  if (role === "coach") {
    await supabase.from("coaches").upsert({
      profile_id: profileId,
      school_name: "",
      division: null,
      school_type: "high_school",
      title: "Head Coach",
    }, { onConflict: "profile_id" });
  } else if (role === "recruiter") {
    await supabase.from("coaches").upsert({
      profile_id: profileId,
      school_name: "",
      division: "D1",
      school_type: "college",
      title: "Recruiting Coordinator",
    }, { onConflict: "profile_id" });
  } else if (role === "athlete") {
    const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
    const classYear = new Date().getFullYear() + 1;
    const repmaxId = await generateRepmaxId(supabase, fullName, classYear);
    await supabase.from("athletes").upsert({
      profile_id: profileId,
      high_school: "TBD",
      city: "TBD",
      state: "TBD",
      class_year: classYear,
      primary_position: "ATH",
      repmax_id: repmaxId,
      ncaa_cleared: false,
    }, { onConflict: "profile_id" });
  }
  // club role does NOT get a coaches record

  // Also update user metadata with the original role for reference
  await supabase.auth.updateUser({
    data: { role: role },
  });

  const redirectPath = getRedirectPathForRole(role);
  redirect(redirectPath);
}
