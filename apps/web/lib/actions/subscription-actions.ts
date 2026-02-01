"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getSubscriptionPlans() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("active", true)
    .order("price_cents", { ascending: true });

  return data || [];
}

export async function getCurrentSubscription() {
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

  const { data } = await supabase
    .from("subscriptions")
    .select(`*, plan:subscription_plans(*)`)
    .eq("profile_id", profile.id)
    .eq("status", "active")
    .single();

  return data;
}

export async function createCheckoutSession(planSlug: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get the plan
  const { data: plan } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("slug", planSlug)
    .single();

  if (!plan) {
    return { error: "Plan not found" };
  }

  // For free plans, create subscription directly
  if (plan.price_cents === 0) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return { error: "Profile not found" };
    }

    const { error } = await supabase.from("subscriptions").insert({
      profile_id: profile.id,
      plan_id: plan.id,
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(), // 1 year
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true, redirectTo: "/dashboard" };
  }

  // For paid plans, create Stripe checkout session
  // This would integrate with Stripe - placeholder for now
  return {
    error: "Stripe integration not configured. Contact support.",
  };
}
