import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { z } from "zod";

function getPriceId(planSlug: string): string | undefined {
  const map: Record<string, string | undefined> = {
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
  };
  return map[planSlug];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planSlug } = z.object({ planSlug: z.string() }).parse(body);

    if (!planSlug) {
      return NextResponse.json({ error: "Plan slug is required" }, { status: 400 });
    }

    const priceId = getPriceId(planSlug);
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const stripe = getStripe();
    let stripeCustomerId: string | null = null;
    const metadata: Record<string, string> = { profile_id: profile.id };

    // Prevent duplicate subscriptions
    const { data: activeSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("status", "active")
      .maybeSingle();

    if (activeSub && !planSlug.startsWith("school-")) {
      return NextResponse.json(
        { error: "You already have an active subscription. Manage it via the billing portal." },
        { status: 400 }
      );
    }

    // Check if it's a school plan
    if (planSlug.startsWith("school-")) {
      // Find school where user is admin
      const { data: membership } = await supabase
        .from("school_members")
        .select("school_id, schools(name, stripe_customer_id)")
        .eq("profile_id", profile.id)
        .eq("role", "admin")
        .single();

      if (!membership) {
        return NextResponse.json(
          { error: "You must be a school admin to subscribe to a school plan" },
          { status: 403 }
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const school: any = membership.schools;
      stripeCustomerId = school.stripe_customer_id;
      metadata.school_id = membership.school_id;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          name: school.name,
          metadata: { school_id: membership.school_id },
        });
        stripeCustomerId = customer.id;

        const serviceClient = createServiceClient();
        await serviceClient
          .from("schools")
          .update({ stripe_customer_id: stripeCustomerId })
          .eq("id", membership.school_id);
      }
    } else {
      // Regular profile-level plan
      stripeCustomerId = profile.stripe_customer_id;

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
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId!,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata,
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=canceled`,
    });

    return NextResponse.json({ url: session.url, sessionUrl: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
