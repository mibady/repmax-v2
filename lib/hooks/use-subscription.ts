"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import type { Tables } from "@/types/database";

type SubscriptionPlan = Tables<"subscription_plans">;
type Subscription = Tables<"subscriptions"> & {
  plan: SubscriptionPlan | null;
};

export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      const supabase = createClient();
      const { data } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("active", true)
        .order("price_cents", { ascending: true });

      setPlans(data || []);
      setIsLoading(false);
    }

    fetchPlans();
  }, []);

  return { plans, isLoading };
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    const { data } = await supabase
      .from("subscriptions")
      .select(`*, plan:subscription_plans(*)`)
      .eq("profile_id", profile.id)
      .eq("status", "active")
      .single();

    setSubscription(data as Subscription | null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return { subscription, isLoading, refetch: fetchSubscription };
}
