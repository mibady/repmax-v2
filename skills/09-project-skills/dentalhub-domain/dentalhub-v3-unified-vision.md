# DentalHub v3: The Unified Vision

## Standalone Cloud PMS + AI Practice Consultant

### No Dependencies. Full Control. Maximum Intelligence.

---

## 🎯 The Decision: Standalone + AI

After reviewing all previous versions, the direction is clear:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DENTALHUB v3 DIRECTION                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ❌ NOT THIS: Automation layer on top of Dentrix/NexHealth                 │
│     • Limited by their APIs                                                │
│     • Dependent on their uptime                                            │
│     • Can't access financial data (Dentrix Ascend limitation)              │
│     • Practice still paying for legacy software                            │
│                                                                             │
│  ✅ THIS: Standalone Cloud PMS that IS the AI Practice Consultant          │
│     • YOU are the source of truth                                          │
│     • Full data ownership                                                  │
│     • No API limitations                                                   │
│     • 18 AI agents built INTO the PMS                                      │
│     • One-time migration FROM legacy systems                               │
│     • Practice CANCELS Dentrix/Eaglesoft subscription                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Feature Review: Include or Exclude?

### From v1/v10 (AI Automation Layer)

| Feature                       | Include? | Reasoning                                 |
| ----------------------------- | :------: | ----------------------------------------- |
| **18 AI Agents Architecture** |  ✅ YES  | Core differentiator - this IS the product |
| **Morning Huddle**            |  ✅ YES  | High value, unique feature                |
| **Daily Wrap-Up**             |  ✅ YES  | High value, easy to build                 |
| **SDR Campaigns (8 types)**   |  ✅ YES  | Growth engine, competitive advantage      |
| **Knowledge Base (RAG)**      |  ✅ YES  | Powers AI intelligence                    |
| **AI Practice Consultant**    |  ✅ YES  | Premium feature, high value               |
| **Smart Scheduling**          |  ✅ YES  | Revenue optimization                      |
| **Procedure Code Audit**      |  ✅ YES  | Revenue recovery                          |
| **Lab Case Tracking**         |  ✅ YES  | Operational efficiency                    |
| **Supplies Management**       | ⚠️ LATER | Nice-to-have, not MVP                     |
| **OSHA Compliance Logs**      | ⚠️ LATER | Nice-to-have, not MVP                     |
| **Staff Training Agent**      | ⚠️ LATER | Nice-to-have, not MVP                     |
| **Marketing ROI Tracking**    |  ✅ YES  | Valuable for practices                    |
| **Multi-Location Support**    | ⚠️ LATER | Post-MVP, adds complexity                 |
| **NexHealth Integration**     |  ❌ NO   | We ARE the PMS now                        |
| **Dentrix Sync**              |  ❌ NO   | We ARE the PMS now                        |

### From v2 (Standalone PMS)

| Feature                 | Include? | Reasoning              |
| ----------------------- | :------: | ---------------------- |
| **Patient Management**  |  ✅ YES  | Core PMS function      |
| **Scheduling Calendar** |  ✅ YES  | Core PMS function      |
| **Billing/Ledger**      |  ✅ YES  | Core PMS function      |
| **Insurance Tracking**  |  ✅ YES  | Core PMS function      |
| **Treatment Plans**     |  ✅ YES  | Core clinical function |
| **Clinical Notes**      |  ✅ YES  | Core clinical function |
| **Recalls**             |  ✅ YES  | Core + AI automation   |
| **AI Voice (Retell)**   |  ✅ YES  | Key automation         |
| **SMS Automation**      |  ✅ YES  | Key automation         |
| **Patient Portal**      |  ✅ YES  | Modern expectation     |
| **Online Booking**      |  ✅ YES  | Growth feature         |
| **Stripe Payments**     |  ✅ YES  | Revenue capture        |
| **Reports**             |  ✅ YES  | Business intelligence  |
| **HIPAA Audit Log**     |  ✅ YES  | Compliance required    |
| **Data Import Wizard**  |  ✅ YES  | Migration path         |

### New Features Needed (Gap Analysis)

| Feature                        | Include? | Build vs. Integrate           |
| ------------------------------ | :------: | ----------------------------- |
| **Odontogram (Tooth Chart)**   |  ✅ YES  | BUILD - core clinical         |
| **Perio Charting**             |  ✅ YES  | BUILD - core clinical         |
| **CDT Code Database**          |  ✅ YES  | PURCHASE - ADA license        |
| **Digital Forms + Signatures** |  ✅ YES  | BUILD - compliance            |
| **Electronic Claims**          |  ✅ YES  | INTEGRATE - DentalXChange     |
| **Real-time Eligibility**      |  ✅ YES  | INTEGRATE - via clearinghouse |
| **E-Prescriptions**            |  ✅ YES  | INTEGRATE - DoseSpot          |
| **Imaging Bridge**             |  ✅ YES  | BUILD - URL bridge            |
| **Payment Terminal**           |  ✅ YES  | INTEGRATE - Stripe Terminal   |
| **Printable Forms**            |  ✅ YES  | BUILD - PDF generation        |

---

## 🏗️ DentalHub v3: Complete Feature Set

### The Merged Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DENTALHUB v3 ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                     ┌─────────────────────────┐                            │
│                     │   HEAD PRACTICE         │                            │
│                     │   CONSULTANT (HPC)      │                            │
│                     │   "The Brain"           │                            │
│                     └───────────┬─────────────┘                            │
│                                 │                                          │
│         ┌───────────────────────┼───────────────────────┐                  │
│         │                       │                       │                  │
│         ▼                       ▼                       ▼                  │
│  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐            │
│  │ DATA        │        │ CLINICAL    │        │ BUSINESS    │            │
│  │ INTELLIGENCE│        │ OPERATIONS  │        │ OPERATIONS  │            │
│  │ DEPT        │        │ DEPT        │        │ DEPT        │            │
│  │ (3 agents)  │        │ (6 agents)  │        │ (6 agents)  │            │
│  └─────────────┘        └─────────────┘        └─────────────┘            │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                           CORE PMS LAYER                                   │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │Patients │ │Schedule │ │Clinical │ │Billing  │ │Comms    │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                         INTEGRATION LAYER                                  │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │DentalX  │ │DoseSpot │ │Stripe   │ │Retell   │ │Imaging  │              │
│  │Change   │ │(eRx)    │ │Terminal │ │AI       │ │Bridge   │              │
│  │(Claims) │ │         │ │         │ │         │ │         │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                             │
│  ═══════════════════════════════════════════════════════════════════════   │
│                         DATA LAYER (Supabase)                              │
│  ═══════════════════════════════════════════════════════════════════════   │
│                                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │Postgres │ │Auth     │ │Storage  │ │Realtime │ │pgvector │              │
│  │(RLS)    │ │         │ │(Docs)   │ │         │ │(RAG)    │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 The 15 AI Agents (Refined for Standalone)

### Department 1: 🧠 Data Intelligence (3 Agents)

| Agent                          | Function                        | How It Works in Standalone                         |
| ------------------------------ | ------------------------------- | -------------------------------------------------- |
| **Data Analysis Agent**        | Trend detection, KPI monitoring | Runs SQL on YOUR database directly - no API limits |
| **Patient Demographics Agent** | Segmentation, profiling         | Full access to all patient data you own            |
| **Sync Agent**                 | Import/export data              | Migration from legacy systems, backup exports      |

### Department 2: 🩺 Clinical Operations (5 Agents)

| Agent                       | Function                 | How It Works in Standalone                            |
| --------------------------- | ------------------------ | ----------------------------------------------------- |
| **Lab Case Manager**        | Track lab cases          | Tables: lab_cases, lab_vendors - full tracking        |
| **Procedure Code Agent**    | Audit for missed revenue | Compares clinical_notes to charges - finds missed $   |
| **Patient Care Agent**      | Post-op automation       | Triggers from completed_procedures table              |
| **Hygiene Analytics Agent** | Recall optimization      | Full access to recalls, appointments, patient history |
| **Treatment Plan Agent**    | Case presentation AI     | Generates estimates, helps with acceptance            |

### Department 3: 💼 Business Operations (7 Agents)

| Agent                     | Function                | How It Works in Standalone                |
| ------------------------- | ----------------------- | ----------------------------------------- |
| **Revenue Agent**         | Collections, AR aging   | Full ledger access, automated statements  |
| **Marketing ROI Agent**   | Campaign tracking       | Tracks referral sources, calculates CAC   |
| **Smart Scheduler Agent** | Production optimization | Access to all scheduling + financial data |
| **SDR Agent**             | Lead nurturing          | 8 campaign types, voice + SMS             |
| **Recommendation Agent**  | Practice consulting     | RAG-powered strategic advice              |
| **Morning Huddle Agent**  | Daily briefings         | Generates from all practice data          |
| **Insurance Agent**       | Eligibility, claims     | Triggers clearinghouse integrations       |

---

## 📱 Complete Application Sitemap (v3)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DENTALHUB v3 - COMPLETE SITEMAP                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🌐 PUBLIC                                                                 │
│  ├─ / ............................ Marketing site                          │
│  ├─ /pricing ..................... Plans & pricing                         │
│  ├─ /login ....................... Staff login                             │
│  ├─ /signup ...................... Practice signup                         │
│  └─ /book/:slug .................. Patient online booking                  │
│                                                                             │
│  📊 COMMAND CENTER (New!)                                                  │
│  ├─ /command ..................... "Mission Control" dashboard             │
│  │   ├─ Live feed (real-time events)                                       │
│  │   ├─ Action items queue                                                 │
│  │   ├─ AI recommendations                                                 │
│  │   └─ Quick actions                                                      │
│  ├─ /command/huddle .............. Morning Huddle view                     │
│  │   ├─ Yesterday vs goal                                                  │
│  │   ├─ Today's opportunities                                              │
│  │   ├─ Hot list (VIP patients)                                            │
│  │   └─ Team celebrations                                                  │
│  └─ /command/consultant .......... AI Practice Consultant chat             │
│                                                                             │
│  📅 SCHEDULE                                                               │
│  ├─ /schedule .................... Calendar (day/week/month)               │
│  ├─ /schedule/smart .............. Smart scheduling suggestions            │
│  ├─ /schedule/waitlist ........... Waitlist management                     │
│  ├─ /schedule/blocks ............. Time blocks                             │
│  └─ /schedule/availability ....... Provider schedules                      │
│                                                                             │
│  👥 PATIENTS                                                               │
│  ├─ /patients .................... Patient list + search                   │
│  ├─ /patients/new ................ New patient                             │
│  ├─ /patients/:id ................ Patient profile                         │
│  │   ├─ Overview (demographics, alerts, balance)                           │
│  │   ├─ Chart (NEW: Odontogram + conditions)                              │
│  │   ├─ Perio (NEW: Periodontal charting)                                 │
│  │   ├─ Appointments                                                       │
│  │   ├─ Treatment plans                                                    │
│  │   ├─ Ledger                                                             │
│  │   ├─ Insurance                                                          │
│  │   ├─ Documents                                                          │
│  │   ├─ Forms (NEW: Digital forms)                                        │
│  │   ├─ Communications                                                     │
│  │   └─ Clinical notes                                                     │
│  └─ /patients/import ............. Migration wizard                        │
│                                                                             │
│  🦷 CLINICAL (New Section!)                                                │
│  ├─ /clinical/chart/:patientId ... Odontogram + charting                  │
│  ├─ /clinical/perio/:patientId ... Perio charting                         │
│  ├─ /clinical/notes/:patientId ... Clinical notes (SOAP)                  │
│  ├─ /clinical/treatment/:id ...... Treatment plan detail                  │
│  ├─ /clinical/prescriptions ...... E-Rx via DoseSpot                      │
│  └─ /clinical/imaging ............ Launch imaging bridge                   │
│                                                                             │
│  💰 BILLING                                                                │
│  ├─ /billing ..................... Billing dashboard                       │
│  ├─ /billing/charges ............. Post charges                            │
│  ├─ /billing/payments ............ Record payments                         │
│  ├─ /billing/ledger/:patientId ... Patient ledger                         │
│  ├─ /billing/claims .............. Claims list + submission               │
│  ├─ /billing/claims/:id .......... Claim detail                            │
│  ├─ /billing/eligibility ......... Run eligibility checks                 │
│  ├─ /billing/era ................. Process ERA/EOB                        │
│  ├─ /billing/aging ............... AR aging                                │
│  └─ /billing/statements .......... Patient statements                      │
│                                                                             │
│  🔔 RECALLS                                                                │
│  ├─ /recalls ..................... Recall queue                            │
│  ├─ /recalls/campaigns ........... Recare campaign settings               │
│  └─ /recalls/analytics ........... Recall effectiveness                   │
│                                                                             │
│  📞 SDR & CAMPAIGNS (New!)                                                 │
│  ├─ /campaigns ................... Campaign dashboard                      │
│  ├─ /campaigns/new ............... Create campaign                         │
│  ├─ /campaigns/:id ............... Campaign detail + performance          │
│  ├─ /campaigns/leads ............. Lead management                         │
│  ├─ /campaigns/templates ......... Message templates                       │
│  └─ /campaigns/knowledge ......... Knowledge base management              │
│                                                                             │
│  💬 COMMUNICATIONS                                                         │
│  ├─ /inbox ....................... Unified inbox (SMS/Voice/Email)        │
│  ├─ /inbox/compose ............... Send message                            │
│  ├─ /inbox/calls/:id ............. Call detail + transcript               │
│  └─ /inbox/templates ............. Quick reply templates                   │
│                                                                             │
│  🔬 LAB CASES (New!)                                                       │
│  ├─ /lab ......................... Lab case dashboard                      │
│  ├─ /lab/new ..................... New lab case                            │
│  ├─ /lab/:id ..................... Case detail                             │
│  └─ /lab/vendors ................. Lab vendor management                   │
│                                                                             │
│  📈 ANALYTICS & REPORTS                                                    │
│  ├─ /analytics ................... Analytics dashboard                     │
│  ├─ /analytics/production ........ Production reports                      │
│  ├─ /analytics/collections ....... Collection reports                      │
│  ├─ /analytics/appointments ...... Appointment analysis                    │
│  ├─ /analytics/recalls ........... Recall effectiveness                   │
│  ├─ /analytics/providers ......... Provider productivity                  │
│  ├─ /analytics/marketing ......... Marketing ROI                          │
│  └─ /analytics/custom ............ Custom report builder                  │
│                                                                             │
│  ⚙️ SETTINGS                                                               │
│  ├─ /settings .................... Settings home                           │
│  ├─ /settings/practice ........... Practice info                          │
│  ├─ /settings/users .............. Staff management                        │
│  ├─ /settings/providers .......... Provider setup                          │
│  ├─ /settings/operatories ........ Rooms/chairs                            │
│  ├─ /settings/appointment-types .. Appointment types                       │
│  ├─ /settings/fee-schedules ...... Fee schedules + CDT codes              │
│  ├─ /settings/insurance .......... Insurance plan library                 │
│  ├─ /settings/forms .............. Form builder                            │
│  ├─ /settings/automations ........ Automation rules                        │
│  ├─ /settings/voice-ai ........... Retell AI config                        │
│  ├─ /settings/integrations ....... Third-party connections                │
│  │   ├─ DentalXChange (claims)                                             │
│  │   ├─ DoseSpot (eRx)                                                     │
│  │   ├─ Stripe (payments)                                                  │
│  │   └─ Imaging (bridge)                                                   │
│  ├─ /settings/billing ............ Subscription                            │
│  └─ /settings/audit-log .......... HIPAA audit log                        │
│                                                                             │
│  🌐 PATIENT PORTAL                                                         │
│  ├─ /portal ....................... Patient dashboard                      │
│  ├─ /portal/appointments ......... View/request appointments              │
│  ├─ /portal/forms ................ Complete intake forms                  │
│  ├─ /portal/payments ............. Pay bills online                        │
│  ├─ /portal/documents ............ View documents                          │
│  └─ /portal/membership ........... Membership plan signup                 │
│                                                                             │
│  📝 FORMS (New!)                                                           │
│  ├─ /forms ....................... Form management                         │
│  ├─ /forms/builder ............... Form builder                            │
│  ├─ /forms/:id ................... Form detail                             │
│  ├─ /forms/submissions ........... View submissions                        │
│  └─ /f/:formId ................... Public form link (patient fills)       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

TOTAL PAGES: 75+
```

---

## 🔌 Third-Party Integration Strategy

### MUST INTEGRATE (Can't build efficiently)

| Integration            | Provider          | Purpose                | Effort  | Cost             |
| ---------------------- | ----------------- | ---------------------- | ------- | ---------------- |
| **Claims/Eligibility** | DentalXChange     | EDI 837D, 270/271, 835 | 4 weeks | ~$0.35/claim     |
| **E-Prescriptions**    | DoseSpot          | EPCS-certified eRx     | 3 weeks | ~$75/provider/mo |
| **Voice AI**           | Retell AI         | Inbound/outbound calls | Done    | Usage-based      |
| **Payments**           | Stripe + Terminal | Online + in-office     | 2 weeks | 2.9% + $0.30     |
| **AI/LLM**             | OpenAI/Claude     | Agent intelligence     | Done    | Usage-based      |

### MUST BUILD (Core to product)

| Feature             | Why Build             | Effort    |
| ------------------- | --------------------- | --------- |
| **Odontogram**      | Core clinical UX      | 3-4 weeks |
| **Perio Chart**     | Core clinical UX      | 2-3 weeks |
| **Digital Forms**   | Custom to workflows   | 2-3 weeks |
| **Smart Scheduler** | Competitive advantage | 2 weeks   |
| **Morning Huddle**  | Unique differentiator | 1 week    |
| **SDR Campaigns**   | Growth engine         | 3-4 weeks |
| **AI Consultant**   | Premium feature       | 2-3 weeks |

### CAN BRIDGE (Don't own, connect)

| Integration | Approach                    | Effort |
| ----------- | --------------------------- | ------ |
| **Imaging** | URL scheme to DEXIS/Apteryx | 1 week |
| **Labs**    | Digital RX forms, tracking  | 1 week |

---

## 📊 Database Additions for v3

### New Tables Needed

```sql
-- ============================================================================
-- V3 ADDITIONS: CLINICAL CHARTING
-- ============================================================================

-- Tooth conditions (odontogram)
CREATE TABLE tooth_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id),
  patient_id UUID NOT NULL REFERENCES patients(id),

  tooth_number TEXT NOT NULL, -- '1' to '32' (adult) or 'A' to 'T' (primary)
  surface TEXT, -- 'M', 'O', 'D', 'B', 'L' or combinations
  condition_type TEXT NOT NULL, -- 'existing', 'decay', 'watch', 'missing', etc.
  condition_detail TEXT, -- 'amalgam', 'composite', 'crown', 'implant', etc.

  diagnosed_date DATE,
  diagnosed_by UUID REFERENCES providers(id),
  resolved_date DATE,
  resolved_by UUID REFERENCES providers(id),

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Perio charting
CREATE TABLE perio_exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  provider_id UUID REFERENCES providers(id),

  exam_date DATE NOT NULL,
  exam_type TEXT DEFAULT 'full', -- 'full', 'limited'

  -- Summary scores
  avg_probing_depth DECIMAL(3,1),
  sites_bleeding INT,
  sites_with_pockets_4plus INT,
  sites_with_pockets_6plus INT,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE perio_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  perio_exam_id UUID NOT NULL REFERENCES perio_exams(id) ON DELETE CASCADE,

  tooth_number TEXT NOT NULL,
  site TEXT NOT NULL, -- 'MB', 'B', 'DB', 'ML', 'L', 'DL'

  probing_depth INT, -- 1-15mm
  recession INT, -- can be negative (overgrowth)
  bleeding BOOLEAN DEFAULT false,
  suppuration BOOLEAN DEFAULT false,
  furcation INT, -- 0, 1, 2, 3
  mobility INT, -- 0, 1, 2, 3
  plaque BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- V3 ADDITIONS: LAB CASES
-- ============================================================================

CREATE TABLE lab_vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id),

  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,

  turnaround_days INT DEFAULT 10,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lab_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  provider_id UUID REFERENCES providers(id),
  lab_vendor_id UUID REFERENCES lab_vendors(id),

  case_type TEXT NOT NULL, -- 'crown', 'bridge', 'denture', 'partial', 'implant', etc.
  description TEXT,

  tooth_numbers TEXT[], -- ['14', '15']
  shade TEXT,
  material TEXT,

  -- Status tracking
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'received', 'try_in', 'delivered', 'redo'

  -- Dates
  impression_date DATE,
  sent_date DATE,
  expected_date DATE,
  received_date DATE,
  seat_date DATE, -- Delivery appointment

  seat_appointment_id UUID REFERENCES appointments(id),

  -- Costs
  lab_fee DECIMAL(10,2),

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- V3 ADDITIONS: DIGITAL FORMS
-- ============================================================================

CREATE TABLE form_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id),

  name TEXT NOT NULL, -- 'New Patient Intake', 'Medical History', 'HIPAA Consent'
  description TEXT,
  form_type TEXT, -- 'intake', 'consent', 'medical_history', 'custom'

  -- JSON schema for form fields
  schema JSONB NOT NULL,

  -- Settings
  is_active BOOLEAN DEFAULT true,
  requires_signature BOOLEAN DEFAULT true,
  expires_days INT, -- Re-collect after X days

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id),
  form_template_id UUID NOT NULL REFERENCES form_templates(id),
  patient_id UUID REFERENCES patients(id),

  -- Submission data
  data JSONB NOT NULL,

  -- Signature
  signature_data TEXT, -- Base64 signature image
  signed_at TIMESTAMPTZ,
  signer_name TEXT,
  signer_ip TEXT,

  -- Metadata
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_via TEXT, -- 'portal', 'kiosk', 'email_link'

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- V3 ADDITIONS: SDR CAMPAIGNS
-- ============================================================================

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id),

  name TEXT NOT NULL,
  campaign_type TEXT NOT NULL, -- 'lead_gen', 'reactivation', 'no_show', 'recall', 'review', 'treatment_followup', 'birthday', 'custom'

  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'

  -- Targeting
  target_criteria JSONB, -- Filters for who to include

  -- Sequence
  sequence JSONB NOT NULL, -- Array of steps: [{delay, channel, template_id}]

  -- Scheduling
  active_hours JSONB, -- When to send messages
  timezone TEXT DEFAULT 'America/Los_Angeles',

  -- Performance
  enrolled_count INT DEFAULT 0,
  converted_count INT DEFAULT 0,

  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campaign_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  patient_id UUID NOT NULL REFERENCES patients(id),

  status TEXT DEFAULT 'active', -- 'active', 'completed', 'converted', 'unsubscribed', 'failed'

  current_step INT DEFAULT 0,
  next_action_at TIMESTAMPTZ,

  -- Outcome
  converted_at TIMESTAMPTZ,
  conversion_type TEXT, -- 'appointment_booked', 'review_left', etc.
  conversion_id UUID, -- Reference to what was created

  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- V3 ADDITIONS: KNOWLEDGE BASE (RAG)
-- ============================================================================

CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id),

  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- 'faq', 'procedure', 'insurance', 'policy', 'hours', 'pricing'

  -- Vector embedding for RAG
  embedding vector(1536),

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_embedding ON knowledge_base
  USING ivfflat (embedding vector_cosine_ops);

-- ============================================================================
-- V3 ADDITIONS: AI INSIGHTS
-- ============================================================================

CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id),

  insight_type TEXT NOT NULL, -- 'morning_huddle', 'daily_wrap', 'recommendation', 'alert'

  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'

  -- Related entities
  related_patients UUID[],
  related_appointments UUID[],

  -- Action taken
  is_read BOOLEAN DEFAULT false,
  is_actioned BOOLEAN DEFAULT false,
  actioned_at TIMESTAMPTZ,
  actioned_by UUID REFERENCES practice_users(id),

  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
```

---

## 📅 Revised Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4) ✅ MOSTLY DONE

- [x] Database schema (expand with v3 tables)
- [x] Supabase Auth + RLS
- [x] Next.js scaffold
- [x] Dashboard shell
- [ ] Add v3 tables for charting, forms, campaigns, knowledge base

### Phase 2: Core PMS (Weeks 5-10)

- [ ] Patient management (full CRUD)
- [ ] Scheduling calendar (FullCalendar)
- [ ] Billing/ledger (charges, payments, adjustments)
- [ ] Insurance tracking (basic)
- [ ] Recalls (basic)

### Phase 3: Clinical (Weeks 11-16) ⭐ NEW

- [ ] Odontogram (tooth chart UI)
- [ ] Perio charting (6-point probing)
- [ ] Clinical notes (SOAP format)
- [ ] Treatment plans (enhanced)
- [ ] Digital forms + signatures
- [ ] DoseSpot integration (eRx)

### Phase 4: Communications & AI (Weeks 17-22)

- [ ] Retell AI (voice + SMS)
- [ ] Confirmation/reminder automations
- [ ] SDR campaigns (8 types)
- [ ] Knowledge base (RAG setup)
- [ ] AI Practice Consultant (chat interface)
- [ ] Morning Huddle generator

### Phase 5: Revenue Cycle (Weeks 23-28)

- [ ] DentalXChange integration (claims)
- [ ] Real-time eligibility
- [ ] ERA/EOB processing
- [ ] Stripe Terminal (in-office payments)
- [ ] Statements generation

### Phase 6: Polish & Launch (Weeks 29-32)

- [ ] Patient portal
- [ ] Online booking
- [ ] Lab case tracking
- [ ] Imaging bridge
- [ ] Reports & analytics
- [ ] Migration wizard
- [ ] Documentation
- [ ] Beta testing

**Total Timeline: 32 weeks (8 months)**

---

## 💰 Integration Costs Summary

| Integration     | Setup Cost     | Monthly Cost  | Per-Transaction         |
| --------------- | -------------- | ------------- | ----------------------- |
| DentalXChange   | ~$500          | ~$100 base    | $0.35/claim, $0.15/elig |
| DoseSpot        | ~$500          | ~$75/provider | Included                |
| Stripe          | Free           | Free          | 2.9% + $0.30            |
| Stripe Terminal | ~$300 hardware | Free          | 2.7% + $0.05            |
| Retell AI       | Free           | Free          | ~$0.10/min voice        |
| OpenAI/Claude   | Free           | Free          | Usage-based             |

**Estimated monthly cost for 3-provider practice:**

- DentalXChange: ~$200 (claims + eligibility)
- DoseSpot: ~$225 (3 providers)
- Stripe: Transaction fees only
- Retell: ~$100-300 (depending on call volume)
- AI: ~$50-100

**Total integration overhead: ~$575-825/month**

This gets passed to customer in subscription price (baked into Gold tier).

---

## ✅ Final Feature Checklist: DentalHub v3

### Core PMS ✅

- [ ] Patient management
- [ ] Scheduling calendar
- [ ] Billing/ledger
- [ ] Insurance tracking
- [ ] Recalls
- [ ] Reports

### Clinical (NEW) ✅

- [ ] Odontogram
- [ ] Perio charting
- [ ] Clinical notes
- [ ] Treatment plans
- [ ] E-prescriptions (DoseSpot)
- [ ] Imaging bridge

### AI Automation ✅

- [ ] Voice AI receptionist
- [ ] SMS automation
- [ ] Appointment confirmations
- [ ] Recall outreach
- [ ] Review requests
- [ ] SDR campaigns (8 types)
- [ ] Morning Huddle
- [ ] Daily Wrap-Up
- [ ] AI Practice Consultant
- [ ] Smart scheduling
- [ ] Procedure code audit

### Revenue Cycle ✅

- [ ] Electronic claims (DentalXChange)
- [ ] Real-time eligibility
- [ ] ERA/EOB processing
- [ ] Stripe payments (online)
- [ ] Stripe Terminal (in-office)
- [ ] Patient statements

### Operations ✅

- [ ] Lab case tracking
- [ ] Digital forms
- [ ] Patient portal
- [ ] Online booking
- [ ] Knowledge base
- [ ] HIPAA audit log

---

## 🎯 This Is the Complete Vision

DentalHub v3 = **Standalone Cloud PMS** + **18 AI Agents** + **Integrated Revenue Cycle**

No Dentrix. No NexHealth. No dependencies.

YOU are the practice management system.
YOU are the AI practice consultant.
YOU are the growth engine.

Ready to finalize the architecture and start building?
