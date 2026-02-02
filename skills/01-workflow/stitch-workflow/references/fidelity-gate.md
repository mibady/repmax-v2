# Fidelity Gate Reference

**Stage 6.5 Pre-Delivery Verification for Design-to-Code Conversion**

This reference provides detailed guidance for the Fidelity Audit stage (Stage 6.5) of the Stitch Workflow. Use this when verifying that the extracted data model (`schema-suggestion.json`) matches the Stitch designs with 100% accuracy.

---

## Purpose

The Fidelity Gate prevents two critical issues:

| Issue Type      | Definition                                 | Risk                                        |
| --------------- | ------------------------------------------ | ------------------------------------------- |
| **Fabrication** | Output contains data NOT in source designs | Builds features that were never designed    |
| **Omission**    | Source designs contain data NOT in output  | Missing features that stakeholders approved |

---

## When to Run

Run the fidelity audit:

1. **After Stage 6 (Data Model Extraction)** - Before proceeding to backend build
2. **After Stage 9 (Stitch → Code)** - Before claiming conversion complete
3. **Before any milestone claiming "100% fidelity"**
4. **When debugging data model issues** - Trace back to source evidence

---

## Audit Process

### Step 1: Prepare Source Materials

Gather all Stitch HTML exports in one location:

```bash
# Directory structure
stitch-exports/
├── landing.html
├── sign-in.html
├── sign-up.html
├── dashboard.html
├── patients-list.html
├── patient-detail.html
├── appointments.html
└── settings.html
```

### Step 2: Run Automated Audit

```bash
npm run workflow:fidelity-audit -- \
  --html-dir stitch-exports/ \
  --schema schema-suggestion.json \
  --output docs/FIDELITY-REPORT.md
```

### Step 3: Manual Visual Verification

For each screen, compare side-by-side:

1. Open Stitch screen (or HTML export)
2. Open corresponding section in `schema-suggestion.json`
3. Verify each UI element has a corresponding data field
4. Document any discrepancies

---

## Audit Categories

### 1. Entity Completeness

Every entity in `schema-suggestion.json` must have source evidence:

```markdown
## Entity Audit

| Entity Name  | Source Evidence            | Status    |
| ------------ | -------------------------- | --------- |
| patients     | patients-list.html table   | ✅ Valid  |
| appointments | appointments.html calendar | ✅ Valid  |
| analytics    | (not in any design)        | ❌ Remove |
```

**Evidence Types:**

- Form with entity-specific fields
- Table/list displaying entity records
- Card showing entity details
- Navigation item (sidebar/menu)

### 2. Field Completeness

Every field in each entity must have source evidence:

```markdown
## Entity: patients

| Field Name    | Source Evidence           | Type   | Status    |
| ------------- | ------------------------- | ------ | --------- |
| full_name     | Input label "Full Name"   | string | ✅ Valid  |
| email         | Input type="email"        | string | ✅ Valid  |
| date_of_birth | Date picker "DOB"         | date   | ✅ Valid  |
| credit_limit  | (not in any form/display) | number | ❌ Remove |
```

### 3. Enum Value Completeness

Every enum value must have source evidence:

```markdown
## Enum: patient_status

| Value    | Source Evidence        | Status    |
| -------- | ---------------------- | --------- |
| active   | Green badge "Active"   | ✅ Valid  |
| inactive | Gray badge "Inactive"  | ✅ Valid  |
| pending  | Yellow badge "Pending" | ✅ Valid  |
| archived | (not shown anywhere)   | ❌ Remove |
```

**Where to find enum values:**

- Badge/pill variants
- Dropdown/select options
- Filter options
- Status indicators
- Tab labels

### 4. Relationship Completeness

Every relationship must have source evidence:

```markdown
## Relationships

| From         | To        | Type       | Evidence                  | Status    |
| ------------ | --------- | ---------- | ------------------------- | --------- |
| appointments | patients  | belongs_to | "Select Patient" dropdown | ✅ Valid  |
| appointments | providers | belongs_to | Provider column in table  | ✅ Valid  |
| patients     | insurance | has_one    | (no insurance UI)         | ❌ Remove |
```

### 5. Navigation Structure

Verify navigation matches extracted entities:

```markdown
## Navigation Audit

| Nav Item     | Screen Exists | Maps to Entity | Status    |
| ------------ | ------------- | -------------- | --------- |
| Dashboard    | ✅            | (aggregate)    | ✅ Valid  |
| Patients     | ✅            | patients       | ✅ Valid  |
| Appointments | ✅            | appointments   | ✅ Valid  |
| Reports      | ❌            | reports        | ❌ Remove |
```

---

## Fidelity Score

### Calculation

```
Fidelity Score = (Valid Items / Total Items) × 100%

Where:
- Valid Items = Items with verified source evidence
- Total Items = All items in output + Unique items in source
```

### Thresholds

| Score  | Status | Action                              |
| ------ | ------ | ----------------------------------- |
| ≥ 98%  | PASS   | Proceed to Stage 7                  |
| 95-97% | REVIEW | Document exceptions, get approval   |
| 90-94% | WARN   | Fix discrepancies before proceeding |
| < 90%  | FAIL   | Major re-extraction required        |

---

## Discrepancy Tags

When marking issues in the report, use these tags:

| Tag             | Meaning                        | Resolution                         |
| --------------- | ------------------------------ | ---------------------------------- |
| `[OMISSION]`    | Source has it, output doesn't  | Add to schema-suggestion.json      |
| `[FABRICATION]` | Output has it, source doesn't  | Remove from schema-suggestion.json |
| `[MISMATCH]`    | Both have it, types differ     | Correct type in schema             |
| `[PARTIAL]`     | Some fields extracted, not all | Complete the extraction            |

---

## Multi-Tenant Compliance

For SaaS applications, verify tenant isolation fields:

```markdown
## Multi-Tenant Audit (practiceId)

| Entity         | Has Tenant Field? | Correct? |
| -------------- | ----------------- | -------- |
| patients       | ✅ practice_id    | ✅ Valid |
| appointments   | ✅ practice_id    | ✅ Valid |
| clinical_notes | ❌ missing        | ⚠️ Add   |
| users          | N/A (via join)    | ✅ Valid |
| audit_logs     | N/A (global)      | ✅ Valid |
```

**Rules:**

- All user-facing data entities need tenant field
- System/audit tables may be global
- Users table uses join table, not direct field

---

## Audit Field Compliance

For regulated industries (healthcare, finance), verify audit fields:

```markdown
## Audit Fields Check

| Entity         | created_at | updated_at | created_by | signed_at | signed_by |
| -------------- | ---------- | ---------- | ---------- | --------- | --------- |
| clinical_notes | ✅         | ✅         | ✅         | ✅        | ✅        |
| prescriptions  | ✅         | ✅         | ✅         | ✅        | ✅        |
| consent_forms  | ✅         | ✅         | ✅         | ❌        | ❌        |
```

**Required for:**

- Clinical/medical records
- Financial transactions
- Legal documents
- Compliance-sensitive data

---

## Fidelity Report Template

Create `docs/FIDELITY-REPORT.md`:

```markdown
# Fidelity Audit Report

**Project:** {project-name}
**Audit Date:** {YYYY-MM-DD}
**Auditor:** {name}
**Source:** Stitch Project {id} ({N} screens)
**Target:** schema-suggestion.json

---

## Executive Summary

| Metric                | Value     |
| --------------------- | --------- |
| **Fidelity Score**    | XX%       |
| **Status**            | PASS/FAIL |
| Entities Audited      | X         |
| Fields Audited        | X         |
| Enums Audited         | X         |
| Relationships Audited | X         |
| Fabrications Found    | X         |
| Omissions Found       | X         |

---

## Entity Audit

[Entity completeness table]

---

## Field Audit

[Per-entity field tables]

---

## Enum Audit

[Enum value tables]

---

## Relationship Audit

[Relationship evidence tables]

---

## Discrepancies

### Fabrications (Remove from Output)

1. [ ] {item} - no source evidence

### Omissions (Add to Output)

1. [ ] {item} - found on {screen}, missing from output

### Mismatches (Correct in Output)

1. [ ] {item} - source shows {X}, output has {Y}

---

## Remediation Log

| Item | Type | Action Taken | Verified |
| ---- | ---- | ------------ | -------- |
| ...  | ...  | ...          | ✅/❌    |

---

## Sign-off

- **Initial Score:** XX%
- **Final Score:** XX% (after remediation)
- **Status:** PASS

**Approved By:** ******\_\_\_******
**Date:** ******\_\_\_******
```

---

## Common Issues

### 1. "Missing entity for sidebar item"

**Problem:** Navigation shows "Reports" but no `reports` entity extracted.

**Resolution:**

- If screen exists: Add entity to schema
- If screen doesn't exist: Remove nav item from designs

### 2. "Field type mismatch"

**Problem:** Design shows dropdown (enum), schema has `string`.

**Resolution:** Update schema to use enum type with extracted values.

### 3. "Relationship not detected"

**Problem:** Form has "Select Patient" dropdown but no relationship extracted.

**Resolution:** Add `belongs_to` relationship from child to parent entity.

### 4. "Enum values incomplete"

**Problem:** Status badge shows 5 colors, only 3 values extracted.

**Resolution:** Inspect each badge variant, add missing values.

### 5. "Audit fields missing"

**Problem:** Clinical form exists but no `created_by`, `signed_at` fields.

**Resolution:** Add audit columns for compliance-required entities.

---

## Integration Points

### With stitch-workflow

Stage 6.5 sits between data extraction and backend build:

```
Stage 6: Extract Data Model
    ↓ schema-suggestion.json
Stage 6.5: Fidelity Audit ← THIS
    ↓ FIDELITY-REPORT.md (score ≥ 95%)
Stage 7: Backend Foundation
```

### With feature-audit

Run in sequence for comprehensive coverage:

```
Fidelity Audit (Stage 6.5)
  → Verifies extraction accuracy (data matches designs)

Feature Audit (Stage 12)
  → Verifies implementation completeness (features work)
```

### With feature-fidelity-gate

Complementary checks:

| Check                 | What It Verifies                  |
| --------------------- | --------------------------------- |
| Fidelity Gate (this)  | Data model matches designs        |
| Feature Fidelity Gate | Features in prompts exist in code |

---

## Commands Reference

```bash
# Full fidelity audit
npm run workflow:fidelity-audit -- \
  --html-dir stitch-exports/ \
  --schema schema-suggestion.json \
  --output docs/FIDELITY-REPORT.md

# Compare single screen to entity
npm run workflow:fidelity-compare -- \
  --html stitch-exports/patients-list.html \
  --entity patients

# Find source evidence for entity
npm run workflow:fidelity-evidence -- \
  --html-dir stitch-exports/ \
  --entity appointments

# Verify multi-tenant compliance
npm run workflow:fidelity-tenant -- \
  --schema schema-suggestion.json \
  --tenant-field practice_id
```

---

## Bypass Options

```bash
# Disable fidelity gate (not recommended)
SKIP_FIDELITY_GATE=true

# Relaxed mode (warn but don't block)
FIDELITY_GATE_MODE=relaxed

# Lower threshold (default is 95%)
FIDELITY_THRESHOLD=90
```

---

## Exit Criteria

Before proceeding to Stage 7 (Backend Foundation):

- [ ] Fidelity score ≥ 95% (or approved exceptions)
- [ ] Zero unexplained fabrications
- [ ] All omissions addressed or documented
- [ ] FIDELITY-REPORT.md generated
- [ ] Sign-off recorded

---

## Related References

| Reference                   | Purpose                       |
| --------------------------- | ----------------------------- |
| `feature-fidelity-gate.md`  | Feature omission prevention   |
| `developer-handoff-spec.md` | Technical bridge template     |
| `stitch-native-stack.md`    | Design system mappings        |
| `platform-variations.md`    | Platform-specific adjustments |
