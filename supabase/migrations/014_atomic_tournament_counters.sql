-- Atomic tournament registration increment
CREATE OR REPLACE FUNCTION increment_tournament_registration(t_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_capacity INTEGER;
    v_registered INTEGER;
BEGIN
    SELECT teams_capacity, teams_registered INTO v_capacity, v_registered
    FROM tournaments
    WHERE id = t_id
    FOR UPDATE;

    IF v_capacity IS NOT NULL AND v_registered >= v_capacity THEN
        RETURN FALSE;
    END IF;

    UPDATE tournaments
    SET teams_registered = COALESCE(teams_registered, 0) + 1
    WHERE id = t_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic school creation with admin member
CREATE OR REPLACE FUNCTION create_school_with_admin(
    school_name TEXT,
    school_slug TEXT,
    school_division TEXT,
    school_conference TEXT,
    school_city TEXT,
    school_state TEXT,
    admin_id UUID
)
RETURNS JSONB AS $$
DECLARE
    new_school_id UUID;
    result JSONB;
BEGIN
    INSERT INTO schools (
        name,
        slug,
        division,
        conference,
        city,
        state,
        created_by
    ) VALUES (
        school_name,
        school_slug,
        school_division,
        school_conference,
        school_city,
        school_state,
        admin_id
    ) RETURNING id INTO new_school_id;

    INSERT INTO school_members (
        school_id,
        profile_id,
        role
    ) VALUES (
        new_school_id,
        admin_id,
        'admin'
    );

    SELECT to_jsonb(s) INTO result FROM schools s WHERE id = new_school_id;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
