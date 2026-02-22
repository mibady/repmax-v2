import { createClient } from "@/lib/supabase/server";
import { 
  athleteTierAtLeast, 
  recruiterTierAtLeast, 
  AthleteTier, 
  RecruiterTier 
} from "./subscription-tier";

/**
 * Fetches the current user's active subscription on the server.
 */
export async function getServerSubscription() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return null;

  const { data } = await supabase
    .from("subscriptions")
    .select(`*, plan:subscription_plans(*)`)
    .eq("profile_id", profile.id)
    .eq("status", "active")
    .maybeSingle();

  return data;
}

/**
 * Ensures the user has at least the required athlete tier.
 * Throws an error if they don't.
 */
export async function requireAthleteTier(minTier: AthleteTier) {
  const sub = await getServerSubscription();
  const slug = sub?.plan?.slug;
  if (!athleteTierAtLeast(slug, minTier)) {
    return { authorized: false, subscription: sub };
  }
  return { authorized: true, subscription: sub };
}

/**
 * Ensures the user has at least the required recruiter tier.
 * Throws an error if they don't.
 */
export async function requireRecruiterTier(minTier: RecruiterTier) {
  const sub = await getServerSubscription();
  const slug = sub?.plan?.slug;
  if (!recruiterTierAtLeast(slug, minTier)) {
    return { authorized: false, subscription: sub };
  }
  return { authorized: true, subscription: sub };
}
