import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getBaseUrl } from "@/lib/utils/get-base-url";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    let stripeCustomerId = profile.stripe_customer_id;

    // Check if user is a school admin - prioritize school billing
    const { data: membership } = await supabase
      .from("school_members")
      .select("school_id, schools(stripe_customer_id)")
      .eq("profile_id", profile.id)
      .eq("role", "admin")
      .maybeSingle();

    if (membership?.schools) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const school: any = membership.schools;
      if (school.stripe_customer_id) {
        stripeCustomerId = school.stripe_customer_id;
      }
    }

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found. Subscribe to a paid plan first." },
        { status: 404 }
      );
    }

    const stripe = getStripe();
    const baseUrl = getBaseUrl();

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Billing portal error:", error);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
