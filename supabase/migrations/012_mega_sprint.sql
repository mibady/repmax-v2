-- Migration 012: Mega Sprint
-- 6 new enums, 16 new tables, extend tournaments, RLS, indexes, triggers, realtime
-- Tables: one_time_purchases, schools, school_members, school_credits,
--         dashr_events, dashr_bookings, tournament_registrations, tournament_rosters,
--         tournament_brackets, tournament_venues, tournament_games, game_score_events,
--         game_player_stats, tournament_standings, tournament_notifications,
--         athlete_tournament_performance

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE bracket_type AS ENUM ('single_elim', 'double_elim', 'round_robin', 'pool_play', 'pool_to_bracket');
CREATE TYPE game_status AS ENUM ('scheduled', 'in_progress', 'final', 'postponed', 'canceled');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected', 'waitlisted');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'canceled');
CREATE TYPE score_event_type AS ENUM ('touchdown', 'field_goal', 'safety', 'extra_point', 'two_point_conversion');
CREATE TYPE school_member_role AS ENUM ('admin', 'coach', 'staff');

-- ============================================
-- EXTEND EXISTING ENUMS
-- ============================================

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'school';

-- ============================================
-- EXTEND EXISTING TOURNAMENTS TABLE
-- ============================================

ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS entry_fee_cents INT DEFAULT 0;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS event_tier TEXT;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS platform_fee_rate NUMERIC(5,4) DEFAULT 0.05;
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ============================================
-- TABLE 1: one_time_purchases
-- ============================================

CREATE TABLE one_time_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_slug TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    amount_cents INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TABLE 2: schools
-- ============================================

CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    division division,
    conference TEXT,
    city TEXT,
    state TEXT,
    tier_slug TEXT,
    stripe_customer_id TEXT,
    logo_url TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TABLE 3: school_members
-- ============================================

CREATE TABLE school_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role school_member_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(school_id, profile_id)
);

-- ============================================
-- TABLE 4: school_credits
-- ============================================

CREATE TABLE school_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    credit_type TEXT NOT NULL,
    balance INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(school_id, credit_type)
);

-- ============================================
-- TABLE 5: dashr_events
-- ============================================

CREATE TABLE dashr_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('combine', 'camp', 'clinic', 'intensive', 'blueprint')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT,
    city TEXT,
    state TEXT,
    capacity INT,
    price_cents INT NOT NULL DEFAULT 0,
    product_slug TEXT NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TABLE 6: dashr_bookings
-- ============================================

CREATE TABLE dashr_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES dashr_events(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    stripe_session_id TEXT,
    status booking_status NOT NULL DEFAULT 'pending',
    amount_cents INT NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TABLE 7: tournament_registrations
-- ============================================

CREATE TABLE tournament_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    payment_status registration_status NOT NULL DEFAULT 'pending',
    stripe_payment_intent_id TEXT,
    amount_cents INT NOT NULL DEFAULT 0,
    platform_fee_cents INT NOT NULL DEFAULT 0,
    team_name TEXT,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tournament_id, school_id)
);

-- ============================================
-- TABLE 8: tournament_rosters
-- ============================================

CREATE TABLE tournament_rosters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES tournament_registrations(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    jersey_number TEXT,
    position TEXT,
    class_year INT,
    athlete_id UUID REFERENCES athletes(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TABLE 9: tournament_brackets
-- ============================================

CREATE TABLE tournament_brackets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    bracket_type bracket_type NOT NULL,
    name TEXT NOT NULL DEFAULT 'Main Bracket',
    seeds JSONB DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TABLE 10: tournament_venues
-- ============================================

CREATE TABLE tournament_venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    field_number INT,
    surface_type TEXT,
    capacity INT,
    location_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TABLE 11: tournament_games
-- ============================================

CREATE TABLE tournament_games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    bracket_id UUID REFERENCES tournament_brackets(id) ON DELETE SET NULL,
    venue_id UUID REFERENCES tournament_venues(id) ON DELETE SET NULL,
    round INT NOT NULL DEFAULT 1,
    game_number INT,
    home_registration_id UUID REFERENCES tournament_registrations(id) ON DELETE SET NULL,
    away_registration_id UUID REFERENCES tournament_registrations(id) ON DELETE SET NULL,
    home_score INT NOT NULL DEFAULT 0,
    away_score INT NOT NULL DEFAULT 0,
    status game_status NOT NULL DEFAULT 'scheduled',
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TABLE 12: game_score_events
-- ============================================

CREATE TABLE game_score_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES tournament_games(id) ON DELETE CASCADE,
    event_type score_event_type NOT NULL,
    registration_id UUID REFERENCES tournament_registrations(id) ON DELETE SET NULL,
    player_name TEXT,
    quarter INT NOT NULL DEFAULT 1,
    game_clock TEXT,
    points INT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TABLE 13: game_player_stats
-- ============================================

CREATE TABLE game_player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES tournament_games(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES tournament_registrations(id) ON DELETE SET NULL,
    player_name TEXT NOT NULL,
    stat_type TEXT NOT NULL,
    stat_value NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TABLE 14: tournament_standings
-- ============================================

CREATE TABLE tournament_standings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES tournament_registrations(id) ON DELETE CASCADE,
    wins INT NOT NULL DEFAULT 0,
    losses INT NOT NULL DEFAULT 0,
    ties INT NOT NULL DEFAULT 0,
    points_for INT NOT NULL DEFAULT 0,
    points_against INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(tournament_id, registration_id)
);

-- ============================================
-- TABLE 15: tournament_notifications
-- ============================================

CREATE TABLE tournament_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('schedule_update', 'score_update', 'bracket_update', 'general')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    channels TEXT[] DEFAULT '{in_app}',
    sent_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TABLE 16: athlete_tournament_performance
-- ============================================

CREATE TABLE athlete_tournament_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    games_played INT NOT NULL DEFAULT 0,
    stats JSONB DEFAULT '{}',
    awards TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(athlete_id, tournament_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- one_time_purchases
CREATE INDEX idx_one_time_purchases_profile ON one_time_purchases(profile_id);
CREATE INDEX idx_one_time_purchases_product ON one_time_purchases(product_slug);
CREATE INDEX idx_one_time_purchases_status ON one_time_purchases(status);

-- schools
CREATE INDEX idx_schools_slug ON schools(slug);
CREATE INDEX idx_schools_division ON schools(division);
CREATE INDEX idx_schools_created_by ON schools(created_by);

-- school_members
CREATE INDEX idx_school_members_school ON school_members(school_id);
CREATE INDEX idx_school_members_profile ON school_members(profile_id);

-- school_credits
CREATE INDEX idx_school_credits_school ON school_credits(school_id);

-- dashr_events
CREATE INDEX idx_dashr_events_published ON dashr_events(is_published, start_date);
CREATE INDEX idx_dashr_events_type ON dashr_events(event_type);
CREATE INDEX idx_dashr_events_created_by ON dashr_events(created_by);

-- dashr_bookings
CREATE INDEX idx_dashr_bookings_event ON dashr_bookings(event_id);
CREATE INDEX idx_dashr_bookings_profile ON dashr_bookings(profile_id);
CREATE INDEX idx_dashr_bookings_status ON dashr_bookings(status);

-- tournament_registrations
CREATE INDEX idx_tournament_registrations_tournament ON tournament_registrations(tournament_id);
CREATE INDEX idx_tournament_registrations_school ON tournament_registrations(school_id);

-- tournament_rosters
CREATE INDEX idx_tournament_rosters_registration ON tournament_rosters(registration_id);
CREATE INDEX idx_tournament_rosters_athlete ON tournament_rosters(athlete_id);

-- tournament_brackets
CREATE INDEX idx_tournament_brackets_tournament ON tournament_brackets(tournament_id);

-- tournament_venues
CREATE INDEX idx_tournament_venues_tournament ON tournament_venues(tournament_id);

-- tournament_games
CREATE INDEX idx_tournament_games_tournament ON tournament_games(tournament_id, scheduled_at);
CREATE INDEX idx_tournament_games_bracket ON tournament_games(bracket_id);
CREATE INDEX idx_tournament_games_venue ON tournament_games(venue_id);
CREATE INDEX idx_tournament_games_status ON tournament_games(status);

-- game_score_events
CREATE INDEX idx_game_score_events_game ON game_score_events(game_id);
CREATE INDEX idx_game_score_events_registration ON game_score_events(registration_id);

-- game_player_stats
CREATE INDEX idx_game_player_stats_game ON game_player_stats(game_id);
CREATE INDEX idx_game_player_stats_registration ON game_player_stats(registration_id);

-- tournament_standings
CREATE INDEX idx_tournament_standings_tournament ON tournament_standings(tournament_id);
CREATE INDEX idx_tournament_standings_registration ON tournament_standings(registration_id);

-- tournament_notifications
CREATE INDEX idx_tournament_notifications_tournament ON tournament_notifications(tournament_id);

-- athlete_tournament_performance
CREATE INDEX idx_athlete_tournament_performance_athlete ON athlete_tournament_performance(athlete_id);
CREATE INDEX idx_athlete_tournament_performance_tournament ON athlete_tournament_performance(tournament_id);

-- ============================================
-- TRIGGERS (reuse existing update_updated_at function)
-- ============================================

CREATE TRIGGER update_one_time_purchases_updated_at
    BEFORE UPDATE ON one_time_purchases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_school_members_updated_at
    BEFORE UPDATE ON school_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_school_credits_updated_at
    BEFORE UPDATE ON school_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_dashr_events_updated_at
    BEFORE UPDATE ON dashr_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_dashr_bookings_updated_at
    BEFORE UPDATE ON dashr_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tournament_registrations_updated_at
    BEFORE UPDATE ON tournament_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tournament_rosters_updated_at
    BEFORE UPDATE ON tournament_rosters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tournament_brackets_updated_at
    BEFORE UPDATE ON tournament_brackets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tournament_venues_updated_at
    BEFORE UPDATE ON tournament_venues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tournament_games_updated_at
    BEFORE UPDATE ON tournament_games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_game_player_stats_updated_at
    BEFORE UPDATE ON game_player_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tournament_standings_updated_at
    BEFORE UPDATE ON tournament_standings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_athlete_tournament_performance_updated_at
    BEFORE UPDATE ON athlete_tournament_performance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tournaments_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY — ENABLE
-- ============================================

ALTER TABLE one_time_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashr_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashr_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_score_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_tournament_performance ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY — POLICIES
-- ============================================

-- ---- one_time_purchases ----
CREATE POLICY "Users can view own purchases" ON one_time_purchases
    FOR SELECT USING (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert own purchases" ON one_time_purchases
    FOR INSERT WITH CHECK (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ---- schools ----
CREATE POLICY "Schools are viewable by authenticated users" ON schools
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "School creator can update" ON schools
    FOR UPDATE USING (
        created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "School creator can delete" ON schools
    FOR DELETE USING (
        created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Authenticated users can create schools" ON schools
    FOR INSERT WITH CHECK (
        created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ---- school_members ----
CREATE POLICY "Members can view own school members" ON school_members
    FOR SELECT USING (
        school_id IN (
            SELECT sm.school_id FROM school_members sm
            JOIN profiles p ON sm.profile_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "School admins can insert members" ON school_members
    FOR INSERT WITH CHECK (
        school_id IN (
            SELECT sm.school_id FROM school_members sm
            JOIN profiles p ON sm.profile_id = p.id
            WHERE p.user_id = auth.uid() AND sm.role = 'admin'
        )
    );

CREATE POLICY "School admins can update members" ON school_members
    FOR UPDATE USING (
        school_id IN (
            SELECT sm.school_id FROM school_members sm
            JOIN profiles p ON sm.profile_id = p.id
            WHERE p.user_id = auth.uid() AND sm.role = 'admin'
        )
    );

CREATE POLICY "School admins can delete members" ON school_members
    FOR DELETE USING (
        school_id IN (
            SELECT sm.school_id FROM school_members sm
            JOIN profiles p ON sm.profile_id = p.id
            WHERE p.user_id = auth.uid() AND sm.role = 'admin'
        )
    );

-- ---- school_credits ----
CREATE POLICY "Members can view own school credits" ON school_credits
    FOR SELECT USING (
        school_id IN (
            SELECT sm.school_id FROM school_members sm
            JOIN profiles p ON sm.profile_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "School admins can manage credits" ON school_credits
    FOR ALL USING (
        school_id IN (
            SELECT sm.school_id FROM school_members sm
            JOIN profiles p ON sm.profile_id = p.id
            WHERE p.user_id = auth.uid() AND sm.role = 'admin'
        )
    );

-- ---- dashr_events ----
CREATE POLICY "Published events are viewable by everyone" ON dashr_events
    FOR SELECT USING (
        is_published = true
        OR created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Event creator can insert" ON dashr_events
    FOR INSERT WITH CHECK (
        created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Event creator can update" ON dashr_events
    FOR UPDATE USING (
        created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Event creator can delete" ON dashr_events
    FOR DELETE USING (
        created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ---- dashr_bookings ----
CREATE POLICY "Users can view own bookings" ON dashr_bookings
    FOR SELECT USING (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Event creators can view bookings" ON dashr_bookings
    FOR SELECT USING (
        event_id IN (
            SELECT de.id FROM dashr_events de
            WHERE de.created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can create own bookings" ON dashr_bookings
    FOR INSERT WITH CHECK (
        profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ---- tournament_registrations ----
-- School members can view their school's registrations
CREATE POLICY "School members can view own registrations" ON tournament_registrations
    FOR SELECT USING (
        school_id IN (
            SELECT sm.school_id FROM school_members sm
            JOIN profiles p ON sm.profile_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Tournament organizer can view all registrations for their tournament
CREATE POLICY "Tournament organizer can view registrations" ON tournament_registrations
    FOR SELECT USING (
        tournament_id IN (
            SELECT t.id FROM tournaments t WHERE t.organizer_id = auth.uid()
        )
    );

-- School admins can register
CREATE POLICY "School admins can register" ON tournament_registrations
    FOR INSERT WITH CHECK (
        school_id IN (
            SELECT sm.school_id FROM school_members sm
            JOIN profiles p ON sm.profile_id = p.id
            WHERE p.user_id = auth.uid() AND sm.role = 'admin'
        )
    );

-- School admins can update their registration
CREATE POLICY "School admins can update registration" ON tournament_registrations
    FOR UPDATE USING (
        school_id IN (
            SELECT sm.school_id FROM school_members sm
            JOIN profiles p ON sm.profile_id = p.id
            WHERE p.user_id = auth.uid() AND sm.role = 'admin'
        )
    );

-- ---- tournament_rosters ----
-- School members can view rosters for their registrations
CREATE POLICY "School members can view own rosters" ON tournament_rosters
    FOR SELECT USING (
        registration_id IN (
            SELECT tr.id FROM tournament_registrations tr
            WHERE tr.school_id IN (
                SELECT sm.school_id FROM school_members sm
                JOIN profiles p ON sm.profile_id = p.id
                WHERE p.user_id = auth.uid()
            )
        )
    );

-- Tournament organizer can view all rosters
CREATE POLICY "Tournament organizer can view rosters" ON tournament_rosters
    FOR SELECT USING (
        registration_id IN (
            SELECT tr.id FROM tournament_registrations tr
            JOIN tournaments t ON tr.tournament_id = t.id
            WHERE t.organizer_id = auth.uid()
        )
    );

-- School admins/coaches can manage rosters
CREATE POLICY "School staff can manage rosters" ON tournament_rosters
    FOR ALL USING (
        registration_id IN (
            SELECT tr.id FROM tournament_registrations tr
            WHERE tr.school_id IN (
                SELECT sm.school_id FROM school_members sm
                JOIN profiles p ON sm.profile_id = p.id
                WHERE p.user_id = auth.uid() AND sm.role IN ('admin', 'coach')
            )
        )
    );

-- ---- tournament_brackets ----
-- Public view for public tournaments
CREATE POLICY "Public brackets are viewable" ON tournament_brackets
    FOR SELECT USING (
        tournament_id IN (SELECT t.id FROM tournaments t WHERE t.is_public = true)
        OR tournament_id IN (SELECT t.id FROM tournaments t WHERE t.organizer_id = auth.uid())
    );

-- Tournament organizer can manage brackets
CREATE POLICY "Tournament organizer can manage brackets" ON tournament_brackets
    FOR ALL USING (
        tournament_id IN (
            SELECT t.id FROM tournaments t WHERE t.organizer_id = auth.uid()
        )
    );

-- ---- tournament_venues ----
-- Public view for public tournaments
CREATE POLICY "Public venues are viewable" ON tournament_venues
    FOR SELECT USING (
        tournament_id IN (SELECT t.id FROM tournaments t WHERE t.is_public = true)
        OR tournament_id IN (SELECT t.id FROM tournaments t WHERE t.organizer_id = auth.uid())
    );

-- Tournament organizer can manage venues
CREATE POLICY "Tournament organizer can manage venues" ON tournament_venues
    FOR ALL USING (
        tournament_id IN (
            SELECT t.id FROM tournaments t WHERE t.organizer_id = auth.uid()
        )
    );

-- ---- tournament_games ----
-- Public view for public tournaments
CREATE POLICY "Public games are viewable" ON tournament_games
    FOR SELECT USING (
        tournament_id IN (SELECT t.id FROM tournaments t WHERE t.is_public = true)
        OR tournament_id IN (SELECT t.id FROM tournaments t WHERE t.organizer_id = auth.uid())
    );

-- Registered school members can view games
CREATE POLICY "Registered teams can view games" ON tournament_games
    FOR SELECT USING (
        tournament_id IN (
            SELECT tr.tournament_id FROM tournament_registrations tr
            WHERE tr.school_id IN (
                SELECT sm.school_id FROM school_members sm
                JOIN profiles p ON sm.profile_id = p.id
                WHERE p.user_id = auth.uid()
            )
        )
    );

-- Tournament organizer can manage games
CREATE POLICY "Tournament organizer can manage games" ON tournament_games
    FOR ALL USING (
        tournament_id IN (
            SELECT t.id FROM tournaments t WHERE t.organizer_id = auth.uid()
        )
    );

-- ---- game_score_events ----
-- Public view for public tournament games
CREATE POLICY "Public score events are viewable" ON game_score_events
    FOR SELECT USING (
        game_id IN (
            SELECT tg.id FROM tournament_games tg
            JOIN tournaments t ON tg.tournament_id = t.id
            WHERE t.is_public = true
        )
        OR game_id IN (
            SELECT tg.id FROM tournament_games tg
            JOIN tournaments t ON tg.tournament_id = t.id
            WHERE t.organizer_id = auth.uid()
        )
    );

-- Tournament organizer can insert score events
CREATE POLICY "Tournament organizer can insert score events" ON game_score_events
    FOR INSERT WITH CHECK (
        game_id IN (
            SELECT tg.id FROM tournament_games tg
            JOIN tournaments t ON tg.tournament_id = t.id
            WHERE t.organizer_id = auth.uid()
        )
        AND created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ---- game_player_stats ----
-- Public view for public tournament games
CREATE POLICY "Public player stats are viewable" ON game_player_stats
    FOR SELECT USING (
        game_id IN (
            SELECT tg.id FROM tournament_games tg
            JOIN tournaments t ON tg.tournament_id = t.id
            WHERE t.is_public = true
        )
        OR game_id IN (
            SELECT tg.id FROM tournament_games tg
            JOIN tournaments t ON tg.tournament_id = t.id
            WHERE t.organizer_id = auth.uid()
        )
    );

-- Tournament organizer can manage player stats
CREATE POLICY "Tournament organizer can manage player stats" ON game_player_stats
    FOR ALL USING (
        game_id IN (
            SELECT tg.id FROM tournament_games tg
            JOIN tournaments t ON tg.tournament_id = t.id
            WHERE t.organizer_id = auth.uid()
        )
    );

-- ---- tournament_standings ----
-- Public view for public tournaments
CREATE POLICY "Public standings are viewable" ON tournament_standings
    FOR SELECT USING (
        tournament_id IN (SELECT t.id FROM tournaments t WHERE t.is_public = true)
        OR tournament_id IN (SELECT t.id FROM tournaments t WHERE t.organizer_id = auth.uid())
    );

-- Tournament organizer can manage standings
CREATE POLICY "Tournament organizer can manage standings" ON tournament_standings
    FOR ALL USING (
        tournament_id IN (
            SELECT t.id FROM tournaments t WHERE t.organizer_id = auth.uid()
        )
    );

-- ---- tournament_notifications ----
-- Registered teams and organizer can view notifications
CREATE POLICY "Tournament participants can view notifications" ON tournament_notifications
    FOR SELECT USING (
        tournament_id IN (SELECT t.id FROM tournaments t WHERE t.is_public = true)
        OR tournament_id IN (SELECT t.id FROM tournaments t WHERE t.organizer_id = auth.uid())
        OR tournament_id IN (
            SELECT tr.tournament_id FROM tournament_registrations tr
            WHERE tr.school_id IN (
                SELECT sm.school_id FROM school_members sm
                JOIN profiles p ON sm.profile_id = p.id
                WHERE p.user_id = auth.uid()
            )
        )
    );

-- Tournament organizer can create notifications
CREATE POLICY "Tournament organizer can create notifications" ON tournament_notifications
    FOR INSERT WITH CHECK (
        tournament_id IN (
            SELECT t.id FROM tournaments t WHERE t.organizer_id = auth.uid()
        )
        AND created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- ---- athlete_tournament_performance ----
-- Public view
CREATE POLICY "Tournament performance is viewable by everyone" ON athlete_tournament_performance
    FOR SELECT USING (true);

-- Athlete can view own performance
CREATE POLICY "Athletes can view own performance" ON athlete_tournament_performance
    FOR SELECT USING (
        athlete_id IN (
            SELECT a.id FROM athletes a
            JOIN profiles p ON a.profile_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Tournament organizer can manage performance records
CREATE POLICY "Tournament organizer can manage performance" ON athlete_tournament_performance
    FOR ALL USING (
        tournament_id IN (
            SELECT t.id FROM tournaments t WHERE t.organizer_id = auth.uid()
        )
    );

-- ---- Update existing tournaments policies for public access ----
-- Allow public SELECT for public tournaments (existing policy only allows organizer)
CREATE POLICY "Public tournaments are viewable" ON tournaments
    FOR SELECT USING (is_public = true);

-- Allow authenticated users to view tournaments they're registered for
CREATE POLICY "Registered teams can view tournaments" ON tournaments
    FOR SELECT USING (
        id IN (
            SELECT tr.tournament_id FROM tournament_registrations tr
            WHERE tr.school_id IN (
                SELECT sm.school_id FROM school_members sm
                JOIN profiles p ON sm.profile_id = p.id
                WHERE p.user_id = auth.uid()
            )
        )
    );

-- ============================================
-- REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE tournament_games;
ALTER PUBLICATION supabase_realtime ADD TABLE game_score_events;
