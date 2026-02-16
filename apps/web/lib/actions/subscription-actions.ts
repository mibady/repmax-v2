"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Stripe from "stripe";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

function getPriceId(planSlug: string): string | undefined {
  const map: Record<string, string | undefined> = {
    pro: process.env.STRIPE_PRO_PRICE_ID,
    team: process.env.STRIPE_TEAM_PRICE_ID,
    scout: process.env.STRIPE_SCOUT_PRICE_ID,
  };
  return map[planSlug];
}

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

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  // For free plans, create subscription directly
  if (plan.price_cents === 0) {
    const { error } = await supabase.from("subscriptions").insert({
      profile_id: profile.id,
      plan_id: plan.id,
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true, redirectTo: "/dashboard" };
  }

  // For paid plans, create Stripe checkout session
  const priceId = getPriceId(planSlug);
  if (!priceId) {
    return { error: `Price not configured for plan: ${planSlug}` };
  }

  try {
    const stripe = getStripe();

    // Get or create Stripe customer
    let stripeCustomerId = profile.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { profile_id: profile.id },
      });
      stripeCustomerId = customer.id;

      // Store customer ID using service client (bypasses RLS)
      const serviceClient = createServiceClient();
      await serviceClient
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", profile.id);
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { profile_id: profile.id, plan_id: plan.id },
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=canceled`,
    });

    if (!session.url) {
      return { error: "Failed to create checkout session" };
    }

    return { success: true, sessionUrl: session.url };
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return { error: "Failed to create checkout session. Please try again." };
  }
}

export async function createBillingPortalSession() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return { error: "No billing account found" };
  }

  try {
    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${baseUrl}/dashboard`,
    });

    return { success: true, url: session.url };
  } catch (err) {
    console.error("Billing portal error:", err);
    return { error: "Failed to open billing portal. Please try again." };
  }
}
