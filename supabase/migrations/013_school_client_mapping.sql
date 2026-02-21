-- Migration 013: School Client Mapping
-- Maps existing coach profiles to new school entities and members

DO $$
DECLARE
    coach_record RECORD;
    school_id UUID;
    coach_emails TEXT[] := ARRAY[
        'bakersfield@repmax.io', 'carecruits@repmax.io', 'frontier@repmax.io',
        'garces@repmax.io', 'heritage@repmax.io', 'independence@repmax.io',
        'knight@repmax.io', 'mayfair@repmax.io', 'newburypark@repmax.io',
        'ontario@repmax.io', 'paraclete@repmax.io', 'redwood@repmax.io',
        'riversidepoly@repmax.io', 'sierracanyon@repmax.io', 'southeast@repmax.io',
        'stpius@repmax.io', 'western@repmax.io', 'wilson@repmax.io',
        'coach.davis@test.repmax.com'
    ];
    email_text TEXT;
    school_name TEXT;
    school_slug TEXT;
BEGIN
    FOREACH email_text IN ARRAY coach_emails
    LOOP
        -- Find the profile for this coach (email lives on auth.users, not profiles)
        SELECT p.id INTO coach_record
        FROM profiles p
        JOIN auth.users u ON p.user_id = u.id
        WHERE u.email = email_text;

        IF coach_record.id IS NOT NULL THEN
            -- Generate school name and slug from email (e.g. 'bakersfield' -> 'Bakersfield High')
            school_slug := split_part(email_text, '@', 1);
            school_name := initcap(replace(school_slug, '.', ' ')) || ' High School';
            
            -- Insert school if it doesn't exist
            INSERT INTO schools (name, slug, tier_slug, created_by)
            VALUES (school_name, school_slug, 'school-large', coach_record.id)
            ON CONFLICT (slug) DO UPDATE SET updated_at = now()
            RETURNING id INTO school_id;

            -- Link coach as admin member
            INSERT INTO school_members (school_id, profile_id, role)
            VALUES (school_id, coach_record.id, 'admin')
            ON CONFLICT (school_id, profile_id) DO NOTHING;
            
            -- Set profile role to 'school' if not already
            UPDATE profiles SET role = 'school' WHERE id = coach_record.id;
        END IF;
    END LOOP;
END $$;
