"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
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
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
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
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback`,
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
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export type UserRole = "athlete" | "parent" | "coach" | "recruiter" | "organizer";

// Map UI roles to database roles
function mapRoleToDbRole(role: UserRole): "athlete" | "coach" | "recruiter" | "admin" {
  switch (role) {
    case "athlete":
    case "parent": // Parents manage athlete profiles
      return "athlete";
    case "coach":
      return "coach";
    case "recruiter":
      return "recruiter";
    case "organizer": // Club organizers get admin-like access
      return "admin";
    default:
      return "athlete";
  }
}

// Get redirect path based on role
function getRedirectPathForRole(role: UserRole): string {
  switch (role) {
    case "athlete":
    case "parent":
      return "/onboarding/chat";
    case "coach":
    case "recruiter":
    case "organizer":
      return "/dashboard";
    default:
      return "/dashboard";
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

  if (existingProfile) {
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
    const { error: insertError } = await supabase.from("profiles").insert({
      user_id: user.id,
      role: dbRole,
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
    });

    if (insertError) {
      return { success: false, error: insertError.message };
    }
  }

  // Also update user metadata with the original role for reference
  await supabase.auth.updateUser({
    data: { role: role },
  });

  const redirectPath = getRedirectPathForRole(role);
  redirect(redirectPath);
}
