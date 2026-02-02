# DentalHub v3: Third-Party Integration Research

## Deep Dive into Claims, eRx, Payments, and Clinical Integrations

---

## 🎯 Integration Philosophy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BUILD vs BUY vs BRIDGE DECISION                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  BUILD when:                                                               │
│  ✅ Core to your competitive advantage                                     │
│  ✅ You need full control over UX                                          │
│  ✅ Data ownership is critical                                             │
│  ✅ Reasonable development effort                                          │
│                                                                             │
│  INTEGRATE when:                                                           │
│  ✅ Regulatory/certification requirements (eRx, claims)                    │
│  ✅ Established standards exist (EDI, HL7)                                 │
│  ✅ Vendor has better economies of scale                                   │
│  ✅ Time-to-market is critical                                             │
│                                                                             │
│  BRIDGE when:                                                              │
│  ✅ Hardware-dependent (imaging sensors)                                   │
│  ✅ Practice already owns the software                                     │
│  ✅ Deep integration not needed                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ CLAIMS & ELIGIBILITY: DentalXChange

### Overview

| Attribute           | Details                                  |
| ------------------- | ---------------------------------------- |
| **Company**         | DentalXChange (Henry Schein One company) |
| **Website**         | https://www.dentalxchange.com            |
| **Type**            | Dental-specific clearinghouse            |
| **Market Position** | One of the top 3 dental clearinghouses   |

### Capabilities

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DENTALXCHANGE CAPABILITIES                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CLAIMS (EDI 837D)                                                         │
│  ├─ Primary claim submission                                               │
│  ├─ Secondary/tertiary claims                                              │
│  ├─ Claim status inquiry (276/277)                                         │
│  ├─ Claim acknowledgments                                                  │
│  ├─ Rejection/denial reasons                                               │
│  └─ Attachment support (NEA FastAttach)                                    │
│                                                                             │
│  ELIGIBILITY (EDI 270/271)                                                 │
│  ├─ Real-time eligibility verification                                     │
│  ├─ Benefits breakdown                                                     │
│  ├─ Deductible status                                                      │
│  ├─ Annual maximum remaining                                               │
│  ├─ Coverage percentages by category                                       │
│  ├─ Waiting periods                                                        │
│  └─ Frequency limitations                                                  │
│                                                                             │
│  ERA/EOB (EDI 835)                                                         │
│  ├─ Electronic remittance advice                                           │
│  ├─ Payment posting data                                                   │
│  ├─ Adjustment reason codes                                                │
│  └─ Patient responsibility calculation                                     │
│                                                                             │
│  VALUE-ADDS                                                                │
│  ├─ Claim scrubbing (validation before submission)                         │
│  ├─ Payer enrollment assistance                                            │
│  ├─ Reporting and analytics                                                │
│  └─ Support for paper claim printing                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### API Details

```typescript
// DentalXChange API Structure (REST)

// Base URL
const BASE_URL = 'https://api.dentalxchange.com/v1';

// Authentication
// OAuth 2.0 with client credentials

// Key Endpoints:

// 1. Eligibility Check
POST /eligibility/verify
{
  "payer_id": "DELTA01",
  "subscriber_id": "123456789",
  "subscriber_dob": "1985-05-15",
  "patient_first_name": "John",
  "patient_last_name": "Smith",
  "patient_dob": "1985-05-15",
  "provider_npi": "1234567890",
  "service_date": "2026-01-17"
}

// Response includes:
// - Eligibility status
// - Plan details
// - Deductible (met/remaining)
// - Annual max (used/remaining)
// - Coverage by category (D0, D1, D2, etc.)

// 2. Claim Submission
POST /claims/submit
{
  "claim_type": "837D",
  "billing_provider": {...},
  "rendering_provider": {...},
  "subscriber": {...},
  "patient": {...},
  "procedures": [
    {
      "code": "D2740",
      "tooth": "14",
      "surface": null,
      "fee": 1200.00,
      "date": "2026-01-17"
    }
  ]
}

// 3. Claim Status
GET /claims/{claim_id}/status

// 4. ERA Retrieval
GET /era/pending
GET /era/{era_id}
```

### Pricing

| Transaction Type  | Cost         |
| ----------------- | ------------ |
| Claim submission  | ~$0.35/claim |
| Eligibility check | ~$0.15/check |
| ERA retrieval     | Included     |
| Monthly minimum   | ~$50-100     |

### Integration Effort

```
Timeline: 4-5 weeks

Week 1: API access, sandbox setup, authentication
Week 2: Eligibility integration + UI
Week 3: Claim submission + validation
Week 4: ERA processing + auto-posting
Week 5: Testing, edge cases, production deployment
```

### Alternatives Considered

| Clearinghouse         | Pros                                   | Cons                 | Decision         |
| --------------------- | -------------------------------------- | -------------------- | ---------------- |
| **DentalXChange**     | Dental-specific, good API, HSO backing | HSO is competitor    | ✅ Recommended   |
| **Vyne Dental**       | Good attachments, dental-focused       | Smaller market share | Good alternative |
| **Availity**          | Large, multi-specialty                 | Not dental-specific  | ❌ Too generic   |
| **Tesia**             | Good API                               | Newer, less proven   | ❌ Risk          |
| **Change Healthcare** | Huge                                   | Not dental-focused   | ❌ Overkill      |

---

## 2️⃣ E-PRESCRIPTIONS: DoseSpot

### Overview

| Attribute         | Details                               |
| ----------------- | ------------------------------------- |
| **Company**       | DoseSpot (DrFirst subsidiary)         |
| **Website**       | https://www.dosespot.com              |
| **Type**          | Embedded e-prescribing platform       |
| **Certification** | Surescripts-certified, EPCS-certified |

### Why DoseSpot?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     WHY DOSESPOT FOR DENTAL?                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  REGULATORY COMPLIANCE                                                     │
│  ├─ Surescripts certified (required for eRx transmission)                  │
│  ├─ EPCS certified (controlled substances)                                 │
│  ├─ State PDMP integration (prescription monitoring)                       │
│  └─ DEA EPCS auditing requirements met                                     │
│                                                                             │
│  DENTAL-FRIENDLY                                                           │
│  ├─ Pre-built dental medication favorites                                  │
│  │   • Antibiotics (Amoxicillin, Clindamycin, Metronidazole)              │
│  │   • Pain (Ibuprofen, Acetaminophen + combinations)                      │
│  │   • Controlled (Hydrocodone, Tylenol #3) with EPCS                      │
│  │   • Steroids (Medrol dose pack)                                         │
│  │   • Oral rinses (Chlorhexidine, Magic Mouthwash)                        │
│  ├─ Dental-specific dosing suggestions                                     │
│  └─ Common dental allergies flagged                                        │
│                                                                             │
│  EMBEDDABLE                                                                │
│  ├─ iframe integration (fastest)                                           │
│  ├─ Full API available (more control)                                      │
│  ├─ SSO from your app                                                      │
│  └─ Patient context passing                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Integration Options

#### Option A: iframe Embed (Recommended for MVP)

```typescript
// DoseSpot iframe Integration

// 1. Generate SSO token (server-side)
const generateDoseSpotToken = async (clinicianId: string, patientId: string) => {
  const response = await fetch('https://api.dosespot.com/v1/sso/token', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DOSESPOT_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      clinician_id: clinicianId,
      patient_id: patientId, // Your internal patient ID
      // DoseSpot will match or create patient
      patient_data: {
        first_name: 'John',
        last_name: 'Smith',
        dob: '1985-05-15',
        gender: 'M',
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '90210',
        phone: '5551234567'
      }
    })
  });

  return response.json(); // { sso_url: 'https://app.dosespot.com/sso/...' }
};

// 2. Render iframe in your app
const PrescriptionModule = ({ ssoUrl }: { ssoUrl: string }) => {
  return (
    <div className="h-[600px] w-full">
      <iframe
        src={ssoUrl}
        className="w-full h-full border-0"
        allow="clipboard-write"
      />
    </div>
  );
};
```

#### Option B: Full API (More Control)

```typescript
// DoseSpot Full API Integration

// Prescribe medication
POST /v1/prescriptions
{
  "clinician_id": "12345",
  "patient_id": "67890",
  "pharmacy_id": "NCPDP123456",
  "medication": {
    "ndc": "00093-0089-01", // National Drug Code
    "drug_name": "Amoxicillin 500mg",
    "quantity": 21,
    "days_supply": 7,
    "directions": "Take 1 capsule 3 times daily for 7 days"
  },
  "refills": 0,
  "notes": "Post extraction prophylaxis"
}

// Search pharmacies
GET /v1/pharmacies?zip=90210&radius=10

// Check drug interactions
POST /v1/interactions
{
  "patient_id": "67890",
  "new_medication_ndc": "00093-0089-01"
}
```

### EPCS (Controlled Substances) Requirements

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     EPCS CERTIFICATION PROCESS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PER-PROVIDER REQUIREMENTS:                                                │
│                                                                             │
│  1. Identity Proofing                                                      │
│     • Government ID verification                                           │
│     • DEA license verification                                             │
│     • Usually done via video call                                          │
│     • One-time process (~30 minutes)                                       │
│                                                                             │
│  2. Two-Factor Authentication                                              │
│     • Hard token (preferred) or                                            │
│     • Biometric (fingerprint/face)                                         │
│     • Required for every controlled Rx                                     │
│                                                                             │
│  3. DEA Registration                                                       │
│     • Provider must have DEA license                                       │
│     • Must be registered for EPCS with DEA                                 │
│                                                                             │
│  DOSESPOT HANDLES:                                                         │
│  ✅ Identity proofing process                                              │
│  ✅ Soft token (app-based 2FA)                                             │
│  ✅ PDMP reporting                                                         │
│  ✅ Audit trails                                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Pricing

| Item             | Cost                |
| ---------------- | ------------------- |
| Setup/onboarding | ~$500 one-time      |
| Per provider     | ~$75-100/month      |
| EPCS add-on      | ~$25/provider/month |
| Per transaction  | Usually included    |

### Integration Effort

```
Timeline: 3 weeks (iframe), 5 weeks (full API)

Week 1: Account setup, sandbox, SSO configuration
Week 2: iframe integration, patient data sync
Week 3: Testing, EPCS provider enrollment
(Weeks 4-5 for full API: drug search, pharmacy search, custom UI)
```

### Alternatives Considered

| Provider               | Pros                                | Cons                 | Decision       |
| ---------------------- | ----------------------------------- | -------------------- | -------------- |
| **DoseSpot**           | Embeddable, dental-friendly, proven | Cost                 | ✅ Recommended |
| **DrFirst (Rcopia)**   | Enterprise features                 | Complex, expensive   | ❌ Overkill    |
| **NewCrop**            | Good API                            | Less dental-specific | ❌             |
| **Practice Fusion Rx** | Free                                | Limited features     | ❌             |

---

## 3️⃣ PAYMENTS: Stripe + Stripe Terminal

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     STRIPE FOR DENTAL PAYMENTS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ONLINE PAYMENTS (Already Planned)                                         │
│  ├─ Patient portal bill pay                                                │
│  ├─ Payment links via SMS/email                                            │
│  ├─ Recurring payments (membership plans)                                  │
│  └─ Payment plans/installments                                             │
│                                                                             │
│  IN-OFFICE PAYMENTS (NEW - Stripe Terminal)                                │
│  ├─ Physical card reader at front desk                                     │
│  ├─ Chip + tap + swipe                                                     │
│  ├─ HSA/FSA cards                                                          │
│  ├─ Apple Pay / Google Pay                                                 │
│  ├─ Split payments                                                         │
│  └─ Receipts (email/print)                                                 │
│                                                                             │
│  UNIFIED EXPERIENCE                                                        │
│  ├─ Same dashboard for online + in-person                                  │
│  ├─ Automatic reconciliation                                               │
│  ├─ Dispute handling                                                       │
│  └─ Reporting                                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Stripe Terminal Integration

```typescript
// Stripe Terminal Integration

// 1. Server: Register Terminal Reader
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Register a reader (one-time setup)
const reader = await stripe.terminal.readers.create({
  registration_code: 'simulated-wpe', // From physical device
  label: 'Front Desk Reader',
  location: 'tml_xxx' // Terminal location
});

// 2. Server: Create Payment Intent
const createTerminalPayment = async (amount: number, patientId: string) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // cents
    currency: 'usd',
    payment_method_types: ['card_present'],
    capture_method: 'automatic',
    metadata: {
      patient_id: patientId,
      practice_id: 'xxx'
    }
  });

  return paymentIntent;
};

// 3. Server: Process Payment on Reader
const processPayment = async (readerId: string, paymentIntentId: string) => {
  const result = await stripe.terminal.readers.processPaymentIntent(
    readerId,
    { payment_intent: paymentIntentId }
  );

  return result;
};

// 4. Client: Terminal UI Component
const TerminalPayment = ({ amount, patientId }: Props) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handlePayment = async () => {
    setStatus('processing');

    // Create payment intent
    const { client_secret, id } = await fetch('/api/terminal/create-payment', {
      method: 'POST',
      body: JSON.stringify({ amount, patientId })
    }).then(r => r.json());

    // Process on reader
    const result = await fetch('/api/terminal/process-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId: id })
    }).then(r => r.json());

    if (result.status === 'succeeded') {
      setStatus('success');
      // Post payment to patient ledger
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="text-3xl font-bold mb-4">
        ${amount.toFixed(2)}
      </div>

      {status === 'idle' && (
        <Button onClick={handlePayment}>
          Collect Payment
        </Button>
      )}

      {status === 'processing' && (
        <div className="text-blue-600">
          Present card on reader...
        </div>
      )}

      {status === 'success' && (
        <div className="text-green-600">
          ✓ Payment successful
        </div>
      )}
    </div>
  );
};
```

### Hardware Options

| Device                  | Cost  | Features                       |
| ----------------------- | ----- | ------------------------------ |
| **BBPOS WisePOS E**     | ~$249 | Countertop, WiFi, touchscreen  |
| **Stripe Reader S700**  | ~$349 | Premium, faster, larger screen |
| **BBPOS Chipper 2X BT** | ~$59  | Bluetooth, mobile              |
| **Verifone P400**       | ~$299 | Traditional countertop         |

**Recommendation:** BBPOS WisePOS E for front desk (good balance of features/price)

### Pricing

| Transaction Type          | Fee          |
| ------------------------- | ------------ |
| Online (card not present) | 2.9% + $0.30 |
| In-person (card present)  | 2.6% + $0.10 |
| In-person (tap)           | 2.6% + $0.10 |

### Integration Effort

```
Timeline: 2 weeks

Week 1: Stripe Terminal SDK, reader registration, payment flow
Week 2: Ledger integration, receipts, error handling, testing
```

---

## 4️⃣ IMAGING: Bridge Integration

### The Reality of Dental Imaging

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DENTAL IMAGING LANDSCAPE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  WHY NOT BUILD IMAGING:                                                    │
│  ❌ Hardware sensors are proprietary                                       │
│  ❌ DICOM standards are complex                                            │
│  ❌ FDA clearance required for diagnostic software                         │
│  ❌ Practices already own imaging software                                 │
│  ❌ Would add years to development                                         │
│                                                                             │
│  THE BRIDGE APPROACH:                                                      │
│  ✅ Launch imaging software from DentalHub                                 │
│  ✅ Pass patient context (name, chart #)                                   │
│  ✅ User takes x-rays in imaging software                                  │
│  ✅ Optionally pull images back into DentalHub                             │
│                                                                             │
│  COMMON IMAGING SOFTWARE:                                                  │
│  • DEXIS (most common, ~40% market)                                        │
│  • Apteryx XrayVision                                                      │
│  • Carestream Dental                                                       │
│  • XDR Radiology                                                           │
│  • Schick                                                                  │
│  • Romexis (Planmeca)                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Bridge Implementation

```typescript
// Imaging Bridge - Launch external software with patient context

// DEXIS uses command-line arguments
const launchDEXIS = (patient: Patient) => {
  // Windows command
  const command = `"C:\\Program Files\\DEXIS\\DEXIS.exe" /patient="${patient.chart_number}" /lastname="${patient.last_name}" /firstname="${patient.first_name}"`;

  // In Electron or Tauri app, you can execute directly
  // In web app, you need a local bridge agent
};

// Some software uses URL schemes
const launchApteryxWeb = (patient: Patient) => {
  const url = `apteryx://open?chartNumber=${patient.chart_number}`;
  window.open(url);
};

// For web-only (no desktop app), provide instructions
const ImagingBridge = ({ patient }: { patient: Patient }) => {
  const [bridgeStatus, setBridgeStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Launch Imaging Software</h3>

      <div className="space-y-3">
        <p className="text-gray-600">
          Patient: {patient.first_name} {patient.last_name}
        </p>
        <p className="text-gray-600">
          Chart #: {patient.chart_number}
        </p>

        <div className="flex gap-3">
          <Button onClick={() => launchDEXIS(patient)}>
            Open in DEXIS
          </Button>
          <Button variant="outline" onClick={() => launchApteryxWeb(patient)}>
            Open in Apteryx
          </Button>
        </div>

        <p className="text-sm text-gray-500">
          Don't see your imaging software?
          <a href="/settings/integrations/imaging" className="text-blue-600">
            Configure imaging bridge
          </a>
        </p>
      </div>
    </div>
  );
};
```

### Settings UI for Imaging Configuration

```typescript
// Settings page for imaging bridge configuration

const ImagingSettings = () => {
  const [imagingSoftware, setImagingSoftware] = useState('dexis');
  const [executablePath, setExecutablePath] = useState('');

  const softwareOptions = [
    { id: 'dexis', name: 'DEXIS', defaultPath: 'C:\\Program Files\\DEXIS\\DEXIS.exe' },
    { id: 'apteryx', name: 'Apteryx XrayVision', defaultPath: 'C:\\Program Files\\Apteryx\\XrayVision.exe' },
    { id: 'carestream', name: 'Carestream', defaultPath: '' },
    { id: 'xdr', name: 'XDR Radiology', defaultPath: '' },
    { id: 'custom', name: 'Custom', defaultPath: '' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <label>Imaging Software</label>
        <select value={imagingSoftware} onChange={e => setImagingSoftware(e.target.value)}>
          {softwareOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Executable Path</label>
        <input
          type="text"
          value={executablePath}
          onChange={e => setExecutablePath(e.target.value)}
          placeholder="C:\Program Files\..."
        />
        <p className="text-sm text-gray-500">
          Path to your imaging software executable
        </p>
      </div>

      <Button>Test Connection</Button>
      <Button variant="primary">Save Settings</Button>
    </div>
  );
};
```

### Integration Effort

```
Timeline: 1-2 weeks

Week 1: Bridge UI, software detection, launch commands
Week 2: Settings UI, testing with multiple software vendors
```

---

## 5️⃣ CDT CODE DATABASE

### Options

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CDT CODE DATABASE OPTIONS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  OPTION A: Purchase ADA CDT License                                        │
│  ├─ Official source                                                        │
│  ├─ Updated annually (January)                                             │
│  ├─ ~$100-500 for electronic license                                       │
│  ├─ Includes all ~600 codes with descriptions                              │
│  └─ Required for commercial use                                            │
│                                                                             │
│  OPTION B: Use Free Sources (Limited)                                      │
│  ├─ CMS publishes some dental codes                                        │
│  ├─ Not complete                                                           │
│  ├─ May be outdated                                                        │
│  └─ Risky for commercial product                                           │
│                                                                             │
│  RECOMMENDATION: Purchase ADA CDT license                                  │
│  • One-time cost ~$500                                                     │
│  • Annual update subscription ~$100                                        │
│  • Avoids any licensing issues                                             │
│  • Get the official data file                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Implementation

```typescript
// CDT Codes Database Structure

CREATE TABLE cdt_codes (
  code TEXT PRIMARY KEY, -- 'D0120'
  category TEXT NOT NULL, -- 'Diagnostic', 'Preventive', 'Restorative', etc.
  subcategory TEXT,
  description TEXT NOT NULL,
  nomenclature TEXT, -- ADA official nomenclature

  -- For billing
  typical_fee_low DECIMAL(10,2),
  typical_fee_high DECIMAL(10,2),

  -- For clinical
  requires_tooth BOOLEAN DEFAULT false,
  requires_surface BOOLEAN DEFAULT false,
  requires_quadrant BOOLEAN DEFAULT false,

  -- Status
  effective_date DATE,
  end_date DATE, -- If code was retired
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  ada_version TEXT, -- 'CDT 2026'
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with categories
INSERT INTO cdt_codes (code, category, description, requires_tooth, requires_surface) VALUES
('D0120', 'Diagnostic', 'Periodic oral evaluation', false, false),
('D0150', 'Diagnostic', 'Comprehensive oral evaluation – new or established patient', false, false),
('D0210', 'Diagnostic', 'Intraoral – complete series of radiographic images', false, false),
('D0220', 'Diagnostic', 'Intraoral – periapical first radiographic image', true, false),
('D1110', 'Preventive', 'Prophylaxis – adult', false, false),
('D1120', 'Preventive', 'Prophylaxis – child', false, false),
('D2140', 'Restorative', 'Amalgam – one surface, primary or permanent', true, true),
('D2150', 'Restorative', 'Amalgam – two surfaces, primary or permanent', true, true),
('D2160', 'Restorative', 'Amalgam – three surfaces, primary or permanent', true, true),
('D2330', 'Restorative', 'Resin-based composite – one surface, anterior', true, true),
('D2740', 'Restorative', 'Crown – porcelain/ceramic substrate', true, false),
-- ... 600+ more codes
```

### Integration Effort

```
Timeline: 1 week

Day 1-2: Purchase license, get data file
Day 3-4: Parse and import into database
Day 5: Build code search UI
Day 6-7: Testing, fee schedule linking
```

---

## 📊 Integration Summary

### Total Integration Effort

| Integration            | Effort          | Cost (Setup)     | Cost (Monthly)      |
| ---------------------- | --------------- | ---------------- | ------------------- |
| DentalXChange (claims) | 4-5 weeks       | ~$500            | ~$200               |
| DoseSpot (eRx)         | 3 weeks         | ~$500            | ~$225 (3 providers) |
| Stripe Terminal        | 2 weeks         | ~$249 (hardware) | Transaction fees    |
| Imaging Bridge         | 1-2 weeks       | $0               | $0                  |
| CDT Codes              | 1 week          | ~$500 (license)  | ~$100/year          |
| **TOTAL**              | **11-13 weeks** | **~$1,750**      | **~$425+**          |

### Recommended Sequence

```
1. CDT Codes (Week 1)
   - Needed for billing, claims, charting
   - Foundation for other features

2. Stripe Terminal (Weeks 2-3)
   - Immediate revenue impact
   - Quick win for practices

3. DoseSpot (Weeks 4-6)
   - Legal requirement in CA
   - High value for dentists

4. DentalXChange (Weeks 7-11)
   - Complex but essential
   - Revenue cycle completion

5. Imaging Bridge (Week 12-13)
   - Last priority
   - Nice-to-have for V1
```

---

## ✅ Final Recommendation

For DentalHub v3 standalone PMS:

1. **DentalXChange** for claims/eligibility - dental-specific, proven
2. **DoseSpot** for e-prescriptions - embeddable, handles compliance
3. **Stripe + Terminal** for payments - unified online + in-office
4. **Bridge approach** for imaging - don't try to replace existing software
5. **Purchase ADA CDT license** - required for commercial use

Total additional development: **11-13 weeks**
Total setup cost: **~$1,750**
Total monthly cost: **~$425+** (passed to customer)

This fills ALL critical gaps identified in the gap analysis while keeping development scope manageable.
