import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { getBaseUrl } from "@/lib/utils/get-base-url";

const bookingSchema = z.object({
  quantity: z.number().int().positive().max(10).default(1),
});

function getPriceId(productSlug: string): string | undefined {
  const map: Record<string, string | undefined> = {
    "dashr-standard": process.env.STRIPE_DASHR_STANDARD_PRICE_ID,
    "dashr-ai": process.env.STRIPE_DASHR_AI_PRICE_ID,
    "dashr-blueprint": process.env.STRIPE_DASHR_BLUEPRINT_PRICE_ID,
    "dashr-clinic": process.env.STRIPE_DASHR_CLINIC_PRICE_ID,
    "dashr-intensive": process.env.STRIPE_DASHR_INTENSIVE_PRICE_ID,
  };
  return map[productSlug];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: eventId } = await params;
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
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const quantity = parsed.data.quantity;

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from("dashr_events")
      .select("*")
      .eq("id", eventId)
      .eq("is_published", true)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check capacity
    if (event.capacity) {
      const { count: bookingCount } = await supabase
        .from("dashr_bookings")
        .select("id", { count: "exact", head: true })
        .eq("event_id", eventId)
        .neq("status", "canceled");

      const remaining = event.capacity - (bookingCount || 0);
      if (remaining < quantity) {
        return NextResponse.json(
          { error: `Only ${remaining} spots remaining` },
          { status: 400 }
        );
      }
    }

    // Check if user already has a confirmed booking
    const { data: confirmedBooking } = await supabase
      .from("dashr_bookings")
      .select("id")
      .eq("event_id", eventId)
      .eq("profile_id", profile.id)
      .eq("status", "confirmed")
      .maybeSingle();

    if (confirmedBooking) {
      return NextResponse.json(
        { error: "You already have a confirmed booking for this event" },
        { status: 409 }
      );
    }

    // Delete any previous pending bookings for this user/event to avoid orphaned rows
    await supabase
      .from("dashr_bookings")
      .delete()
      .eq("event_id", eventId)
      .eq("profile_id", profile.id)
      .eq("status", "pending");

    // Get the Stripe price for this event's product
    const priceId = getPriceId(event.product_slug);
    if (!priceId) {
      return NextResponse.json(
        { error: `Price not configured for product: ${event.product_slug}` },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Get or create Stripe customer
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

    // Create the booking row with pending status
    const { data: booking, error: bookingError } = await supabase
      .from("dashr_bookings")
      .insert({
        event_id: eventId,
        profile_id: profile.id,
        quantity,
        status: "pending",
        amount_cents: event.price_cents * quantity,
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking insert error:", bookingError);
      return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }

    // Create Stripe checkout session
    const baseUrl = getBaseUrl();

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "payment",
      line_items: [{ price: priceId, quantity }],
      metadata: {
        profile_id: profile.id,
        booking_id: booking.id,
        event_id: eventId,
        product_type: "dashr",
        product_slug: event.product_slug,
      },
      success_url: `${baseUrl}/dashr/${eventId}?checkout=success`,
      cancel_url: `${baseUrl}/dashr/${eventId}?checkout=canceled`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    // Update booking with stripe session id
    await supabase
      .from("dashr_bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    return NextResponse.json({
      success: true,
      sessionUrl: session.url,
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("Dashr booking POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
