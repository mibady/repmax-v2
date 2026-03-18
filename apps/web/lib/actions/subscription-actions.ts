"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe";
import { getBaseUrl } from "@/lib/utils/get-base-url";

function getPriceId(planSlug: string): string | undefined {
  const map: Record<string, string | undefined> = {
    // Legacy (archive after migration)
    pro: process.env.STRIPE_PRO_PRICE_ID,
    team: process.env.STRIPE_TEAM_PRICE_ID,
    scout: process.env.STRIPE_SCOUT_PRICE_ID,
    // Spec A: Athlete
    "athlete-premium": process.env.STRIPE_ATHLETE_PREMIUM_MONTHLY_PRICE_ID,
    "athlete-pro": process.env.STRIPE_ATHLETE_PRO_MONTHLY_PRICE_ID,
    "athlete-premium-annual": process.env.STRIPE_ATHLETE_PREMIUM_ANNUAL_PRICE_ID,
    "athlete-pro-annual": process.env.STRIPE_ATHLETE_PRO_ANNUAL_PRICE_ID,
    // Spec B: Recruiter
    "recruiter-pro": process.env.STRIPE_RECRUITER_PRO_MONTHLY_PRICE_ID,
    "recruiter-team": process.env.STRIPE_RECRUITER_TEAM_MONTHLY_PRICE_ID,
    "recruiter-ai": process.env.STRIPE_RECRUITER_AI_MONTHLY_PRICE_ID,
    "recruiter-pro-annual": process.env.STRIPE_RECRUITER_PRO_ANNUAL_PRICE_ID,
    "recruiter-team-annual": process.env.STRIPE_RECRUITER_TEAM_ANNUAL_PRICE_ID,
    "recruiter-ai-annual": process.env.STRIPE_RECRUITER_AI_ANNUAL_PRICE_ID,
    // Spec C: Schools
    "school-small": process.env.STRIPE_SCHOOL_SMALL_ANNUAL_PRICE_ID,
    "school-medium": process.env.STRIPE_SCHOOL_MEDIUM_ANNUAL_PRICE_ID,
    "school-large": process.env.STRIPE_SCHOOL_LARGE_ANNUAL_PRICE_ID,
    // Spec D: Events
    "event-basic": process.env.STRIPE_EVENT_BASIC_PRICE_ID,
    "event-standard": process.env.STRIPE_EVENT_STANDARD_PRICE_ID,
    "event-premium": process.env.STRIPE_EVENT_PREMIUM_PRICE_ID,
    // Spec E: Dashr
    "dashr-standard": process.env.STRIPE_DASHR_STANDARD_PRICE_ID,
    "dashr-ai": process.env.STRIPE_DASHR_AI_PRICE_ID,
    "dashr-blueprint": process.env.STRIPE_DASHR_BLUEPRINT_PRICE_ID,
    "dashr-clinic": process.env.STRIPE_DASHR_CLINIC_PRICE_ID,
    "dashr-intensive": process.env.STRIPE_DASHR_INTENSIVE_PRICE_ID,
  };
  return map[planSlug];
}

/** Slugs that use one-time payment mode */
const PAYMENT_SLUGS = new Set([
  "event-basic", "event-standard", "event-premium",
  "dashr-standard", "dashr-ai", "dashr-blueprint", "dashr-clinic", "dashr-intensive",
]);

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

  // Prevent duplicate subscriptions
  const { data: activeSub } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("status", "active")
    .maybeSingle();

  if (activeSub && !PAYMENT_SLUGS.has(planSlug)) {
    return { error: "You already have an active subscription. Manage it via the billing portal." };
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
        email: user.email || undefined,
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

    const baseUrl = getBaseUrl();
    const mode = PAYMENT_SLUGS.has(planSlug) ? "payment" : "subscription";

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode,
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
    const baseUrl = getBaseUrl();

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

export async function createOneTimeCheckout(
  productSlug: string,
  quantity: number = 1,
  metadata?: Record<string, string>
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const priceId = getPriceId(productSlug);
  if (!priceId) {
    return { error: `Price not configured for product: ${productSlug}` };
  }

  if (!PAYMENT_SLUGS.has(productSlug)) {
    return { error: `Product ${productSlug} is not a one-time payment product` };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  try {
    const stripe = getStripe();

    let stripeCustomerId = profile.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { profile_id: profile.id },
      });
      stripeCustomerId = customer.id;

      const serviceClient = createServiceClient();
      await serviceClient
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", profile.id);
    }

    const baseUrl = getBaseUrl();

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "payment",
      line_items: [{ price: priceId, quantity }],
      metadata: {
        ...metadata,
        profile_id: profile.id,
        product_type: productSlug.startsWith("dashr-") ? "dashr" : "event",
        product_slug: productSlug,
      },
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/dashboard?checkout=canceled`,
    });

    if (!session.url) {
      return { error: "Failed to create checkout session" };
    }

    return { success: true, sessionUrl: session.url };
  } catch (err) {
    console.error("Stripe one-time checkout error:", err);
    return { error: "Failed to create checkout session. Please try again." };
  }
}

export async function createRegistrationPayment(
  tournamentId: string,
  schoolId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get tournament entry fee
  const { data: tournament } = await supabase
    .from("off_season_events")
    .select("id, entry_fee_cents, platform_fee_rate")
    .eq("id", tournamentId)
    .single();

  if (!tournament) {
    return { error: "Tournament not found" };
  }

  if (!tournament.entry_fee_cents || tournament.entry_fee_cents <= 0) {
    return { error: "Tournament has no entry fee configured" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found" };
  }

  try {
    const stripe = getStripe();

    let stripeCustomerId = profile.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { profile_id: profile.id },
      });
      stripeCustomerId = customer.id;

      const serviceClient = createServiceClient();
      await serviceClient
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", profile.id);
    }

    const platformFeeRate = tournament.platform_fee_rate ?? 0.05;
    const platformFeeCents = Math.round(
      tournament.entry_fee_cents * platformFeeRate
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: tournament.entry_fee_cents,
      currency: "usd",
      customer: stripeCustomerId,
      metadata: {
        tournament_id: tournamentId,
        school_id: schoolId,
        profile_id: profile.id,
        platform_fee_cents: platformFeeCents.toString(),
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: tournament.entry_fee_cents,
      platformFee: platformFeeCents,
    };
  } catch (err) {
    console.error("Registration payment error:", err);
    return { error: "Failed to create payment. Please try again." };
  }
}
