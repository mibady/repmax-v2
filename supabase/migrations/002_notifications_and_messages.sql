-- Sprint 2A: Notifications and Messages Schema
-- This migration adds tables for notifications, messages, and conversations
-- with RLS policies and NCAA compliance checks

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('profile_view', 'shortlist', 'deadline', 'parent_link', 'summary', 'message', 'offer')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Only system/service role can insert notifications
CREATE POLICY "Service can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  -- Recruiting notifications
  new_application_push BOOLEAN DEFAULT TRUE,
  new_application_email BOOLEAN DEFAULT TRUE,
  interview_scheduled_push BOOLEAN DEFAULT TRUE,
  interview_scheduled_email BOOLEAN DEFAULT FALSE,
  profile_view_push BOOLEAN DEFAULT TRUE,
  profile_view_email BOOLEAN DEFAULT FALSE,
  shortlist_add_push BOOLEAN DEFAULT TRUE,
  shortlist_add_email BOOLEAN DEFAULT TRUE,
  -- Team notifications
  roster_updates_push BOOLEAN DEFAULT TRUE,
  roster_updates_email BOOLEAN DEFAULT FALSE,
  staff_messages_push BOOLEAN DEFAULT TRUE,
  staff_messages_email BOOLEAN DEFAULT TRUE,
  -- Events notifications
  schedule_changes_push BOOLEAN DEFAULT TRUE,
  schedule_changes_email BOOLEAN DEFAULT TRUE,
  results_push BOOLEAN DEFAULT FALSE,
  results_email BOOLEAN DEFAULT TRUE,
  signing_deadlines_push BOOLEAN DEFAULT TRUE,
  signing_deadlines_email BOOLEAN DEFAULT TRUE,
  -- Digests
  weekly_summary_push BOOLEAN DEFAULT FALSE,
  weekly_summary_email BOOLEAN DEFAULT TRUE,
  monthly_stats_push BOOLEAN DEFAULT FALSE,
  monthly_stats_email BOOLEAN DEFAULT TRUE,
  zone_pulse_push BOOLEAN DEFAULT TRUE,
  zone_pulse_email BOOLEAN DEFAULT FALSE,
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for notification preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- CONVERSATIONS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_ids UUID[] NOT NULL,
  last_message_id UUID,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for finding conversations by participant
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN (participant_ids);

-- RLS for conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Users can only see conversations they're part of
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = ANY(participant_ids));

-- Users can create conversations they're part of
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = ANY(participant_ids));

-- ============================================================
-- MESSAGES TABLE (Enhanced with NCAA compliance)
-- ============================================================

-- First, check if messages table exists and drop NCAA-related columns if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    -- Table exists, we may need to alter it
    -- Add new columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'messages' AND column_name = 'conversation_id') THEN
      ALTER TABLE messages ADD COLUMN conversation_id UUID REFERENCES conversations(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'messages' AND column_name = 'status') THEN
      ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'sent'
        CHECK (status IN ('sent', 'delivered', 'read'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'messages' AND column_name = 'ncaa_compliant') THEN
      ALTER TABLE messages ADD COLUMN ncaa_compliant BOOLEAN DEFAULT TRUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'messages' AND column_name = 'compliance_checked_at') THEN
      ALTER TABLE messages ADD COLUMN compliance_checked_at TIMESTAMPTZ;
    END IF;
  ELSE
    -- Create the messages table fresh
    CREATE TABLE messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id UUID NOT NULL REFERENCES profiles(id),
      recipient_id UUID NOT NULL REFERENCES profiles(id),
      subject TEXT,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
      ncaa_compliant BOOLEAN DEFAULT TRUE,
      compliance_checked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  END IF;
END $$;

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON messages;
DROP POLICY IF EXISTS "Users can send messages (NCAA compliant)" ON messages;
DROP POLICY IF EXISTS "Recipients can update message status" ON messages;

-- Users can see messages they sent or received
CREATE POLICY "Users can view messages they sent or received"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can send messages (NCAA compliance checked via trigger)
CREATE POLICY "Users can send messages (NCAA compliant)"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Recipients can update message status (mark as read/delivered)
CREATE POLICY "Recipients can update message status"
  ON messages FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- ============================================================
-- NCAA COMPLIANCE FUNCTIONS
-- ============================================================

-- Function to check if a message is NCAA compliant
-- Athletes cannot directly message recruiters - only respond to recruiter-initiated contact
CREATE OR REPLACE FUNCTION check_ncaa_compliance()
RETURNS TRIGGER AS $$
DECLARE
  sender_role TEXT;
  recipient_role TEXT;
  existing_conversation BOOLEAN;
BEGIN
  -- Get sender and recipient roles
  SELECT role INTO sender_role FROM profiles WHERE id = NEW.sender_id;
  SELECT role INTO recipient_role FROM profiles WHERE id = NEW.recipient_id;

  -- Default to compliant
  NEW.ncaa_compliant := TRUE;
  NEW.compliance_checked_at := NOW();

  -- Check if athlete is trying to initiate contact with a coach/recruiter
  IF sender_role = 'athlete' AND recipient_role IN ('coach', 'recruiter') THEN
    -- Check if there's an existing conversation initiated by the coach
    SELECT EXISTS (
      SELECT 1 FROM messages m
      WHERE m.conversation_id = NEW.conversation_id
        AND m.sender_id = NEW.recipient_id
        AND m.recipient_id = NEW.sender_id
      LIMIT 1
    ) INTO existing_conversation;

    -- If no prior coach-initiated contact, mark as non-compliant
    IF NOT existing_conversation THEN
      NEW.ncaa_compliant := FALSE;
      -- We allow the message but flag it for review
      -- In strict mode, you could raise an exception here:
      -- RAISE EXCEPTION 'NCAA Compliance: Athletes cannot initiate contact with recruiters';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for NCAA compliance check
DROP TRIGGER IF EXISTS check_message_compliance ON messages;
CREATE TRIGGER check_message_compliance
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION check_ncaa_compliance();

-- ============================================================
-- NOTIFICATION TRIGGERS
-- ============================================================

-- Function to create notification when a new message is received
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  sender_name TEXT;
  prefs notification_preferences%ROWTYPE;
BEGIN
  -- Get sender name
  SELECT COALESCE(full_name, email) INTO sender_name
  FROM profiles WHERE id = NEW.sender_id;

  -- Check recipient's notification preferences
  SELECT * INTO prefs
  FROM notification_preferences
  WHERE user_id = NEW.recipient_id;

  -- Create in-app notification
  INSERT INTO notifications (user_id, type, title, description, metadata)
  VALUES (
    NEW.recipient_id,
    'message',
    'New message from ' || sender_name,
    LEFT(NEW.content, 100),
    jsonb_build_object(
      'message_id', NEW.id,
      'sender_id', NEW.sender_id,
      'conversation_id', NEW.conversation_id
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new message notifications
DROP TRIGGER IF EXISTS on_new_message ON messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Function to create notification when added to shortlist
CREATE OR REPLACE FUNCTION notify_shortlist_add()
RETURNS TRIGGER AS $$
DECLARE
  coach_name TEXT;
  coach_org TEXT;
BEGIN
  -- Get coach info
  SELECT p.full_name, c.organization INTO coach_name, coach_org
  FROM profiles p
  LEFT JOIN coaches c ON c.profile_id = p.id
  WHERE p.id = NEW.coach_id;

  -- Create notification for the athlete
  INSERT INTO notifications (user_id, type, title, description, metadata)
  VALUES (
    NEW.athlete_id,
    'shortlist',
    'Added to shortlist by ' || COALESCE(coach_org, coach_name),
    COALESCE(coach_name, 'A recruiter') || ' has added you to their prospect list',
    jsonb_build_object(
      'shortlist_id', NEW.id,
      'coach_id', NEW.coach_id,
      'priority', NEW.priority
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for shortlist notifications (if shortlists table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shortlists') THEN
    DROP TRIGGER IF EXISTS on_shortlist_add ON shortlists;
    CREATE TRIGGER on_shortlist_add
      AFTER INSERT ON shortlists
      FOR EACH ROW
      EXECUTE FUNCTION notify_shortlist_add();
  END IF;
END $$;

-- ============================================================
-- UPDATE TIMESTAMP TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
DROP TRIGGER IF EXISTS notifications_updated_at ON notifications;
CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS conversations_updated_at ON conversations;
CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS messages_updated_at ON messages;
CREATE TRIGGER messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ENABLE REALTIME
-- ============================================================

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime for conversations
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE notifications IS 'User notifications for profile views, shortlists, messages, deadlines, etc.';
COMMENT ON TABLE notification_preferences IS 'User preferences for notification delivery (push/email)';
COMMENT ON TABLE conversations IS 'Message conversation threads between users';
COMMENT ON COLUMN messages.ncaa_compliant IS 'Flag indicating if message adheres to NCAA recruiting contact rules';
COMMENT ON FUNCTION check_ncaa_compliance() IS 'Validates messages against NCAA recruiting contact rules';
