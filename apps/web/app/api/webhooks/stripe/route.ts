import { createServiceClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe lazily to avoid build errors when env vars are missing
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription" && session.subscription) {
          // Subscription checkout (Specs A, B, C)
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          const profileId = session.metadata?.profile_id;
          const planId = session.metadata?.plan_id;

          if (profileId && planId) {
            await supabase.from("subscriptions").insert({
              profile_id: profileId,
              plan_id: planId,
              stripe_subscription_id: subscription.id,
              status: "active",
              current_period_start: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
            });
          }
        } else if (session.mode === "payment") {
          // One-time payment checkout (Specs D organizer, E)
          const profileId = session.metadata?.profile_id;
          const productType = session.metadata?.product_type;
          const productSlug = session.metadata?.product_slug;

          if (profileId && productType) {
            await supabase.from("one_time_purchases").insert({
              profile_id: profileId,
              product_type: productType,
              product_slug: productSlug || null,
              stripe_session_id: session.id,
              stripe_payment_intent_id:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : null,
              amount_cents: session.amount_total || 0,
              status: "completed",
              metadata: session.metadata,
            });
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        // Tournament registration fees (Spec D variable amounts)
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const tournamentId = paymentIntent.metadata?.tournament_id;
        const schoolId = paymentIntent.metadata?.school_id;

        if (tournamentId && schoolId) {
          await supabase
            .from("tournament_registrations")
            .update({
              payment_status: "paid",
              stripe_payment_intent_id: paymentIntent.id,
              platform_fee_cents: parseInt(
                paymentIntent.metadata?.platform_fee_cents || "0",
                10
              ),
            })
            .eq("tournament_id", tournamentId)
            .eq("school_id", schoolId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status as "active" | "canceled" | "past_due" | "trialing",
            current_period_start: new Date(
              subscription.current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.subscription) {
          await supabase
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_subscription_id", invoice.subscription as string);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
