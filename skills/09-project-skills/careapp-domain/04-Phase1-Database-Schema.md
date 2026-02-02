# Supabase Schema PRP - Caregiving Companion

## Goal

Design and implement a comprehensive Supabase database schema for the Caregiving Companion app, supporting multi-tenant caregiving teams, health records, financial tracking, and real-time collaboration.

## Why

- Establish scalable data architecture for multiple caregiving families
- Enable real-time updates across all connected caregivers
- Ensure HIPAA-compliant data storage for health information
- Provide audit trails for all critical care activities
- Support offline-first capabilities with sync

## What (User-Visible Behavior)

- **Instant Updates**: Changes by one caregiver appear immediately for all team members
- **Data Security**: Role-based access control for sensitive information
- **Audit History**: Complete timeline of all care activities
- **Smart Search**: Quick retrieval of medications, appointments, and documents
- **Data Export**: GDPR-compliant data portability

## All Needed Context

### Documentation References

- Supabase Schema: https://supabase.com/docs/guides/database/tables
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
- Realtime: https://supabase.com/docs/guides/realtime
- Storage: https://supabase.com/docs/guides/storage
- PostgreSQL JSON: https://www.postgresql.org/docs/current/datatype-json.html

### Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-key]
```

### Critical Design Decisions

- Use UUIDs for all primary keys for better distribution
- Implement soft deletes for audit compliance
- Store sensitive data encrypted at rest
- Use JSONB for flexible medical record storage
- Implement database-level constraints for data integrity
- Separate PII from general data for GDPR compliance

## Implementation Blueprint

### 1. Redis Integration Tables

```sql
-- Redis connection management
CREATE TABLE redis_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_name TEXT NOT NULL,
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  tls_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id)
);

-- Redis key tracking for better management
CREATE TABLE redis_key_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_pattern TEXT NOT NULL,
  key_type TEXT CHECK (key_type IN ('string', 'hash', 'list', 'set', 'zset', 'stream')),
  ttl_seconds INTEGER,
  description TEXT,
  last_accessed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key_pattern)
);

-- Redis caching configuration
CREATE TABLE cache_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_name TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  ttl_seconds INTEGER NOT NULL,
  max_size_mb INTEGER,
  eviction_policy TEXT DEFAULT 'volatile-lru',
  is_compressed BOOLEAN DEFAULT true,
  is_encrypted BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Retell AI Integration Tables

```sql
-- Voice call sessions
CREATE TABLE voice_call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sid TEXT UNIQUE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  care_recipient_id UUID REFERENCES care_recipients(id) ON DELETE SET NULL,
  agent_id TEXT NOT NULL,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('initiated', 'in-progress', 'completed', 'failed')),
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  recording_url TEXT,
  call_metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call transcripts
CREATE TABLE call_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_session_id UUID REFERENCES voice_call_sessions(id) ON DELETE CASCADE,
  speaker_type TEXT CHECK (speaker_type IN ('user', 'agent', 'system')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  sentiment_score FLOAT,
  entities JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice agent configurations
CREATE TABLE voice_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  language TEXT DEFAULT 'en-US',
  voice_settings JSONB DEFAULT '{"speed": 1.0, "pitch": 1.0, "stability": 0.5}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  UNIQUE(organization_id, agent_id)
);

-- SMS message tracking
CREATE TABLE sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  care_recipient_id UUID REFERENCES care_recipients(id) ON DELETE SET NULL,
  message_sid TEXT UNIQUE NOT NULL,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'failed', 'received')),
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  error_message TEXT,
  media_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Core User & Organization Schema

```sql
-- Organizations (Care Teams)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free',
  is_active BOOLEAN DEFAULT true
);

-- Users (linked to Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT CHECK (role IN ('primary_caregiver', 'family_member', 'professional', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  preferences JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true
);

-- Organization Members (many-to-many)
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Care Recipients (Elder being cared for)
CREATE TABLE care_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  blood_type TEXT,
  emergency_contact JSONB,
  medical_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);
```

### 4. Health Management Schema

```sql
-- Health Records
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_recipient_id UUID REFERENCES care_recipients(id) ON DELETE CASCADE,
  record_type TEXT CHECK (record_type IN ('diagnosis', 'procedure', 'lab_result', 'imaging', 'note')),
  title TEXT NOT NULL,
  description TEXT,
  record_date DATE NOT NULL,
  provider TEXT,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Medications
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_recipient_id UUID REFERENCES care_recipients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  prescriber TEXT,
  pharmacy TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Medication Logs
CREATE TABLE medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  administered_at TIMESTAMPTZ NOT NULL,
  administered_by UUID REFERENCES users(id),
  status TEXT CHECK (status IN ('given', 'missed', 'refused', 'delayed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_recipient_id UUID REFERENCES care_recipients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  provider TEXT,
  location TEXT,
  appointment_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  appointment_type TEXT,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Vitals Tracking
CREATE TABLE vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  care_recipient_id UUID REFERENCES care_recipients(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  temperature DECIMAL(4,1),
  weight DECIMAL(5,2),
  blood_sugar INTEGER,
  oxygen_saturation INTEGER,
  notes TEXT,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. Financial Management Schema

```sql
-- Financial Accounts
CREATE TABLE financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  account_type TEXT CHECK (account_type IN ('checking', 'savings', 'credit_card', 'investment', 'other')),
  institution TEXT,
  account_number_last4 TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bills & Expenses
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  payee TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  category TEXT,
  account_id UUID REFERENCES financial_accounts(id),
  status TEXT CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  paid_date DATE,
  paid_by UUID REFERENCES users(id),
  notes TEXT,
  recurring_schedule JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID REFERENCES financial_accounts(id),
  bill_id UUID REFERENCES bills(id),
  amount DECIMAL(10,2) NOT NULL,
  transaction_date DATE NOT NULL,
  description TEXT,
  category TEXT,
  transaction_type TEXT CHECK (transaction_type IN ('income', 'expense', 'transfer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);
```

### 4. Tasks & Collaboration Schema

```sql
-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('health', 'financial', 'home', 'legal', 'other')),
  priority TEXT CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  due_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES users(id),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Communications Log
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  message_type TEXT CHECK (message_type IN ('note', 'alert', 'update', 'question')),
  subject TEXT,
  content TEXT NOT NULL,
  urgency TEXT CHECK (urgency IN ('immediate', 'high', 'normal', 'low')),
  related_entity_type TEXT,
  related_entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);
```

### 5. Conversation & AI Context Schema

```sql
-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  title TEXT,
  context JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  audio_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Actions (Track what the AI did)
CREATE TABLE ai_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  action_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  action_details JSONB,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. Document Storage Schema

```sql
-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  document_type TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  category TEXT,
  tags TEXT[],
  related_entity_type TEXT,
  related_entity_id UUID,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id)
);
```

### 7. Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_recipients ENABLE ROW LEVEL SECURITY;
-- ... (enable for all tables)

-- Organization access policy
CREATE POLICY "Users can access their organizations"
  ON organizations
  FOR ALL
  USING (
    id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Care recipient access policy
CREATE POLICY "Users can access care recipients in their org"
  ON care_recipients
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Health records - restricted to non-viewers
CREATE POLICY "Only caregivers can access health records"
  ON health_records
  FOR ALL
  USING (
    care_recipient_id IN (
      SELECT cr.id
      FROM care_recipients cr
      JOIN organization_members om ON cr.organization_id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND om.role != 'viewer'
    )
  );
```

### 8. Realtime Subscriptions Setup

```sql
-- Enable realtime for critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE medications;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE communications;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### 9. Indexes for Performance

```sql
-- User lookups
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);

-- Organization members
CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);

-- Care recipient queries
CREATE INDEX idx_care_recipients_org_id ON care_recipients(organization_id);

-- Appointments by date
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_recipient ON appointments(care_recipient_id);

-- Medications active
CREATE INDEX idx_medications_active ON medications(care_recipient_id, is_active);

-- Tasks by status and due date
CREATE INDEX idx_tasks_status_due ON tasks(organization_id, status, due_date);

-- Messages by conversation
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
```

### 10. Database Functions & Triggers

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
-- ... (repeat for all tables)

-- Function to get user's organizations
CREATE OR REPLACE FUNCTION get_user_organizations(user_uuid UUID)
RETURNS TABLE (
  organization_id UUID,
  organization_name TEXT,
  user_role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.name,
    om.role
  FROM organizations o
  JOIN organization_members om ON o.id = om.organization_id
  WHERE om.user_id = user_uuid
  AND o.is_active = true;
END;
$$ LANGUAGE plpgsql;
```

## Task Checklist

### Initial Setup

- [ ] Create new Supabase project
- [ ] Configure environment variables
- [ ] Enable required extensions (uuid-ossp, pgcrypto)
- [ ] Set up database connection in Next.js

### Schema Creation

- [ ] Execute core user & organization tables
- [ ] Create health management tables
- [ ] Create financial management tables
- [ ] Create task & collaboration tables
- [x] Create Redis integration tables
- [x] Create Retell AI call tracking tables
- [ ] Create conversation & AI context tables
- [ ] Create document storage tables

### Security Configuration

- [ ] Enable Row Level Security on all tables
- [ ] Create RLS policies for each table
- [ ] Set up role-based access controls
- [ ] Configure Clerk integration with Supabase Auth

### Performance Optimization

- [ ] Create all required indexes
- [ ] Set up database functions and triggers
- [ ] Configure connection pooling
- [ ] Enable query performance monitoring

### Realtime Setup

- [ ] Enable realtime for required tables
- [ ] Configure client-side subscriptions
- [ ] Test realtime updates across clients
- [ ] Set up presence tracking

### Data Migration & Seeding

- [ ] Create seed data scripts
- [ ] Set up test organizations and users
- [ ] Create sample health and financial records
- [ ] Test all relationships and constraints

## Validation Loop

### Level 1: Schema Validation

```bash
# Connect to Supabase
npx supabase db diff

# Validate schema
npx supabase db lint

# Check migrations
npx supabase migration list
```

### Level 2: Security Testing

```bash
# Test RLS policies
npm run test:rls

# Verify user access controls
npm run test:permissions

# Check data isolation
npm run test:multi-tenant
```

### Level 3: Performance Testing

```bash
# Run query performance tests
npm run test:query-performance

# Check index usage
npm run analyze:indexes

# Test connection pooling
npm run test:connections
```

### Level 4: Integration Testing

```bash
# Test Clerk-Supabase integration
npm run test:auth-integration

# Test realtime subscriptions
npm run test:realtime

# Full end-to-end test
npm run e2e:database
```

## Success Criteria

- [ ] All tables created with proper relationships
- [ ] RLS policies prevent unauthorized access
- [ ] Realtime updates work across all clients
- [ ] Query performance < 100ms for common operations
- [ ] Full audit trail maintained for all changes
- [ ] HIPAA compliance requirements met

## Common Gotchas

- Supabase RLS policies are bypassed with service role key - use carefully
- Realtime subscriptions have connection limits - implement reconnection logic
- JSONB queries can be slow without proper indexes
- Soft deletes require careful query filtering
- UUID primary keys need gen_random_uuid() extension
- Clerk user IDs must be synced with Supabase users table
