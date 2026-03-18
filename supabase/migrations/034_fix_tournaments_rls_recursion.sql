-- Fix: Drop recursive RLS policy that causes infinite recursion via school_members
-- The "Tournaments are viewable by everyone" policy (qual = true) already grants all SELECT access
DROP POLICY IF EXISTS "Registered teams can view tournaments" ON tournaments;
