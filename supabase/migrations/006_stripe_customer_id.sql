-- Add Stripe customer ID to profiles for reuse across checkout sessions
ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;

-- Unique index — each profile maps to exactly one Stripe customer
CREATE UNIQUE INDEX idx_profiles_stripe_customer_id
  ON profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
