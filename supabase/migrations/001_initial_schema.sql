-- RepMax v2 Initial Schema
-- Generated from Stitch designs: 2026-01-31
-- Entities: profiles, athletes, coaches, highlights, shortlists, messages, subscription_plans, subscriptions, offers

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('athlete', 'coach', 'recruiter', 'admin');
CREATE TYPE recruiting_zone AS ENUM ('West', 'Southwest', 'Midwest', 'Southeast', 'Northeast', 'Mid-Atlantic');
CREATE TYPE division AS ENUM ('D1', 'D2', 'D3', 'NAIA', 'JUCO');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'top');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');
CREATE TYPE billing_period AS ENUM ('monthly', 'yearly');
CREATE TYPE scholarship_type AS ENUM ('full', 'partial', 'walk-on', 'preferred-walk-on');

-- ============================================
-- TABLES
-- ============================================

-- Profiles (base user profile for all user types)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Athletes (athlete-specific data with measurables and academics)
CREATE TABLE athletes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    high_school TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zone recruiting_zone,
    class_year INTEGER NOT NULL CHECK (class_year >= 2020 AND class_year <= 2035),
    primary_position TEXT NOT NULL,
    secondary_position TEXT,
    -- Measurables
    height_inches INTEGER CHECK (height_inches >= 48 AND height_inches <= 96),
    weight_lbs INTEGER CHECK (weight_lbs >= 100 AND weight_lbs <= 400),
    forty_yard_time DECIMAL(4,2) CHECK (forty_yard_time >= 4.0 AND forty_yard_time <= 7.0),
    vertical_inches INTEGER CHECK (vertical_inches >= 12 AND vertical_inches <= 50),
    -- Academics
    gpa DECIMAL(3,2) CHECK (gpa >= 0.0 AND gpa <= 4.0),
    sat_score INTEGER CHECK (sat_score >= 400 AND sat_score <= 1600),
    act_score INTEGER CHECK (act_score >= 1 AND act_score <= 36),
    ncaa_id TEXT,
    ncaa_cleared BOOLEAN DEFAULT false,
    -- Ratings
    star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
    repmax_score INTEGER CHECK (repmax_score >= 0 AND repmax_score <= 100),
    verified BOOLEAN NOT NULL DEFAULT false,
    offers_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(profile_id)
);

-- Coaches (coach/recruiter-specific data)
CREATE TABLE coaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    school_name TEXT NOT NULL,
    division division NOT NULL,
    conference TEXT,
    title TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(profile_id)
);

-- Highlights (athlete video highlights and game tape)
CREATE TABLE highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    view_count INTEGER DEFAULT 0,
    ai_analyzed BOOLEAN DEFAULT false,
    ai_tags JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shortlists (coach shortlists of athletes)
CREATE TABLE shortlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    notes TEXT,
    priority priority_level DEFAULT 'medium',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(coach_id, athlete_id)
);

-- Messages (NCAA-compliant messaging)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject TEXT,
    body TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscription Plans
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    price_cents INTEGER NOT NULL,
    billing_period billing_period NOT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    max_team_seats INTEGER,
    max_searches_per_day INTEGER,
    has_api_access BOOLEAN DEFAULT false,
    has_export BOOLEAN DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions (user subscriptions to plans)
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    stripe_subscription_id TEXT,
    status subscription_status NOT NULL,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Offers (college offers received by athletes)
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    school_name TEXT NOT NULL,
    division division NOT NULL,
    scholarship_type scholarship_type,
    offer_date DATE NOT NULL,
    committed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

-- Profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Athletes
CREATE INDEX idx_athletes_profile_id ON athletes(profile_id);
CREATE INDEX idx_athletes_zone ON athletes(zone);
CREATE INDEX idx_athletes_class_year ON athletes(class_year);
CREATE INDEX idx_athletes_primary_position ON athletes(primary_position);
CREATE INDEX idx_athletes_state ON athletes(state);
CREATE INDEX idx_athletes_verified ON athletes(verified);
CREATE INDEX idx_athletes_star_rating ON athletes(star_rating);

-- Coaches
CREATE INDEX idx_coaches_profile_id ON coaches(profile_id);
CREATE INDEX idx_coaches_division ON coaches(division);
CREATE INDEX idx_coaches_school_name ON coaches(school_name);

-- Highlights
CREATE INDEX idx_highlights_athlete_id ON highlights(athlete_id);
CREATE INDEX idx_highlights_created_at ON highlights(created_at DESC);

-- Shortlists
CREATE INDEX idx_shortlists_coach_id ON shortlists(coach_id);
CREATE INDEX idx_shortlists_athlete_id ON shortlists(athlete_id);

-- Messages
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_unread ON messages(recipient_id) WHERE read = false;

-- Subscriptions
CREATE INDEX idx_subscriptions_profile_id ON subscriptions(profile_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Offers
CREATE INDEX idx_offers_athlete_id ON offers(athlete_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER athletes_updated_at
    BEFORE UPDATE ON athletes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER coaches_updated_at
    BEFORE UPDATE ON coaches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update offers_count on athletes
CREATE OR REPLACE FUNCTION update_athlete_offers_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE athletes SET offers_count = offers_count + 1 WHERE id = NEW.athlete_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE athletes SET offers_count = offers_count - 1 WHERE id = OLD.athlete_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER offers_count_trigger
    AFTER INSERT OR DELETE ON offers
    FOR EACH ROW EXECUTE FUNCTION update_athlete_offers_count();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Athletes: Public read, owner write
CREATE POLICY "Athletes are viewable by everyone" ON athletes
    FOR SELECT USING (true);

CREATE POLICY "Athletes can update own profile" ON athletes
    FOR UPDATE USING (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Athletes can insert own profile" ON athletes
    FOR INSERT WITH CHECK (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Coaches: Public read, owner write
CREATE POLICY "Coaches are viewable by everyone" ON coaches
    FOR SELECT USING (true);

CREATE POLICY "Coaches can update own profile" ON coaches
    FOR UPDATE USING (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Coaches can insert own profile" ON coaches
    FOR INSERT WITH CHECK (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Highlights: Public read, athlete owner write
CREATE POLICY "Highlights are viewable by everyone" ON highlights
    FOR SELECT USING (true);

CREATE POLICY "Athletes can manage own highlights" ON highlights
    FOR ALL USING (
        athlete_id IN (
            SELECT a.id FROM athletes a
            JOIN profiles p ON a.profile_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Shortlists: Coach can manage their own
CREATE POLICY "Coaches can view own shortlists" ON shortlists
    FOR SELECT USING (
        coach_id IN (
            SELECT c.id FROM coaches c
            JOIN profiles p ON c.profile_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "Coaches can manage own shortlists" ON shortlists
    FOR ALL USING (
        coach_id IN (
            SELECT c.id FROM coaches c
            JOIN profiles p ON c.profile_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Messages: Sender and recipient can view
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (
        sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        OR recipient_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Recipients can mark messages as read" ON messages
    FOR UPDATE USING (
        recipient_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Subscription Plans: Public read
CREATE POLICY "Plans are viewable by everyone" ON subscription_plans
    FOR SELECT USING (true);

-- Subscriptions: User can view their own
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Offers: Public read, athlete owner write
CREATE POLICY "Offers are viewable by everyone" ON offers
    FOR SELECT USING (true);

CREATE POLICY "Athletes can manage own offers" ON offers
    FOR ALL USING (
        athlete_id IN (
            SELECT a.id FROM athletes a
            JOIN profiles p ON a.profile_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- ============================================
-- SEED DATA: Subscription Plans
-- ============================================

INSERT INTO subscription_plans (name, slug, price_cents, billing_period, features, max_team_seats, max_searches_per_day, has_api_access, has_export) VALUES
('Starter', 'starter', 0, 'monthly', '["Basic Access", "Limited Search Queries", "Public Profiles Only"]', NULL, 10, false, false),
('Pro', 'pro', 999, 'monthly', '["Full Player Database", "Advanced Metrics & Stats", "Unlimited Search", "Export Data (CSV)"]', NULL, NULL, false, true),
('Team', 'team', 2999, 'monthly', '["5 Team Seats", "Collaboration Tools", "Shared Watchlists", "Priority Support"]', 5, NULL, false, true),
('Scout', 'scout', 0, 'monthly', '["API Access", "Custom Reporting", "Dedicated Account Manager", "SSO Integration"]', NULL, NULL, true, true);
