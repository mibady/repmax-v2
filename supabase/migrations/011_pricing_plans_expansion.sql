-- Migration 011: Expand subscription_plans for multi-role pricing
-- Adds target_role column, deactivates legacy plans, inserts new plans

-- 1. Add target_role column
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS target_role TEXT;

-- 2. Tag existing plans as recruiter
UPDATE subscription_plans SET target_role = 'recruiter';

-- 3. Deactivate legacy pro/team (keep starter + scout active)
UPDATE subscription_plans SET active = false WHERE slug IN ('pro', 'team');

-- 4. Insert Athlete plans
INSERT INTO subscription_plans (name, slug, price_cents, billing_period, features, target_role, active) VALUES
  ('Athlete Basic', 'athlete-basic', 0, 'monthly', '["Basic Profile", "Limited Visibility", "View Offers"]'::jsonb, 'athlete', true),
  ('Athlete Premium', 'athlete-premium', 1499, 'monthly', '["Enhanced Profile", "Priority Visibility", "Video Highlights", "Direct Messaging", "Recruiting Analytics"]'::jsonb, 'athlete', true),
  ('Athlete Premium Annual', 'athlete-premium-annual', 14990, 'yearly', '["Enhanced Profile", "Priority Visibility", "Video Highlights", "Direct Messaging", "Recruiting Analytics"]'::jsonb, 'athlete', true),
  ('Athlete Pro', 'athlete-pro', 5999, 'monthly', '["Everything in Premium", "AI Film Analysis", "RepMax Score", "Featured Profile", "Verified Badge", "Priority Support"]'::jsonb, 'athlete', true),
  ('Athlete Pro Annual', 'athlete-pro-annual', 59990, 'yearly', '["Everything in Premium", "AI Film Analysis", "RepMax Score", "Featured Profile", "Verified Badge", "Priority Support"]'::jsonb, 'athlete', true);

-- 5. Insert Recruiter plans
INSERT INTO subscription_plans (name, slug, price_cents, billing_period, features, target_role, active) VALUES
  ('Recruiter Free', 'recruiter-free', 0, 'monthly', '["Basic Search", "10 Searches/Day", "Public Profiles"]'::jsonb, 'recruiter', true),
  ('Recruiter Pro', 'recruiter-pro', 9900, 'monthly', '["Full Database Access", "Unlimited Search", "Advanced Filters", "Export CSV", "Shortlists"]'::jsonb, 'recruiter', true),
  ('Recruiter Pro Annual', 'recruiter-pro-annual', 99000, 'yearly', '["Full Database Access", "Unlimited Search", "Advanced Filters", "Export CSV", "Shortlists"]'::jsonb, 'recruiter', true),
  ('Recruiter Team', 'recruiter-team', 29900, 'monthly', '["Everything in Pro", "5 Team Seats", "Shared Watchlists", "Collaboration Tools", "Priority Support"]'::jsonb, 'recruiter', true),
  ('Recruiter Team Annual', 'recruiter-team-annual', 299000, 'yearly', '["Everything in Pro", "5 Team Seats", "Shared Watchlists", "Collaboration Tools", "Priority Support"]'::jsonb, 'recruiter', true),
  ('Recruiter AI', 'recruiter-ai', 39900, 'monthly', '["Everything in Team", "AI Prospect Matching", "Predictive Analytics", "Custom Reports", "API Access"]'::jsonb, 'recruiter', true),
  ('Recruiter AI Annual', 'recruiter-ai-annual', 399000, 'yearly', '["Everything in Team", "AI Prospect Matching", "Predictive Analytics", "Custom Reports", "API Access"]'::jsonb, 'recruiter', true),
  ('Recruiter Enterprise', 'recruiter-enterprise', 0, 'monthly', '["Everything in AI", "Unlimited Seats", "SSO Integration", "Dedicated Account Manager", "Custom Reporting", "SLA"]'::jsonb, 'recruiter', true);

-- 6. Insert School plans (annual only)
INSERT INTO subscription_plans (name, slug, price_cents, billing_period, features, target_role, active) VALUES
  ('School Small', 'school-small', 150000, 'yearly', '["Up to 50 Athletes", "Basic Analytics", "Recruiting Calendar", "Email Support"]'::jsonb, 'school', true),
  ('School Medium', 'school-medium', 250000, 'yearly', '["Up to 200 Athletes", "Advanced Analytics", "Event Management", "Priority Support", "Custom Branding"]'::jsonb, 'school', true),
  ('School Large', 'school-large', 350000, 'yearly', '["Unlimited Athletes", "Full Analytics Suite", "Tournament Platform", "API Access", "Dedicated Success Manager", "SLA"]'::jsonb, 'school', true);

-- Note: Event and Dashr products are one-time payments via createOneTimeCheckout()
-- They do NOT need subscription_plans rows
