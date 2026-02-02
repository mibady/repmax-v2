---
name: fidelity-gate
description: Pre-delivery verification checkpoint for Stitch conversions and data-driven frontends. Run before claiming "100% fidelity" or "zero fabrication". Use when (1) completing Stitch-to-code conversion, (2) finishing any data extraction project, (3) auditing design-to-code accuracy.
---

# Fidelity Gate

Pre-delivery verification checkpoint ensuring 1:1 fidelity between source designs and extracted/generated outputs. Prevents "fabrication" (making up data not in source) and "omission" (missing data that is in source).

## When to Use

- **After Stage 6 (Data Model Extraction)** - Verify schema-suggestion.json matches Stitch designs
- **After Stage 9 (Stitch → Code)** - Verify React components match HTML exports
- **Before claiming "100% fidelity"** - Any conversion/extraction project
- **Before final delivery** - Catch missing or fabricated elements
- **With feature-audit** - Use together for comprehensive coverage

## Core Principle: Zero Fabrication, Zero Omission

| Issue       | Definition                                           | Example                                           |
| ----------- | ---------------------------------------------------- | ------------------------------------------------- |
| Fabrication | Output contains data NOT in source                   | Entity `orders` not in any design                 |
| Omission    | Source contains data NOT in output                   | Status badge "Pending" not in enum                |
| Mismatch    | Output type/structure differs from source            | Field is `string` but should be `enum`            |
| Incomplete  | Partial extraction (some fields, not all)            | Form has 5 inputs, only 3 extracted               |

---

## Audit Categories

### 1. Entity Fidelity

Verify every entity in output was derived from source:

```markdown
| Entity Name    | Source Evidence              | In Output? | Confidence |
| -------------- | ---------------------------- | ---------- | ---------- |
| patients       | Patient List table           | ✓          | High       |
| appointments   | Calendar screen              | ✓          | High       |
| leads          | ??? (not in any design)      | ✗ REMOVE   | Fabricated |
```

**Evidence Types:**
- Form with entity-specific fields
- Table/list displaying entity data
- Card showing entity details
- Navigation item suggesting entity

### 2. Field Fidelity

For each entity, verify every field was derived from source:

```markdown
## Entity: patients

| Field Name    | Source Evidence           | Type Extracted | Correct? |
| ------------- | ------------------------- | -------------- | -------- |
| full_name     | Input: "Full Name"        | string         | ✓        |
| email         | Input type="email"        | string         | ✓        |
| status        | Badge: Active/Inactive    | enum           | ✓        |
| credit_score  | ??? (not in design)       | number         | REMOVE   |
```

### 3. Enum Value Fidelity

Verify every enum value exists in source:

```markdown
## Enum: patient_status

| Value    | Source Evidence         | In Output? |
| -------- | ----------------------- | ---------- |
| active   | Green badge "Active"    | ✓          |
| inactive | Gray badge "Inactive"   | ✓          |
| pending  | Yellow badge "Pending"  | ✓          |
| deleted  | ??? (not in design)     | REMOVE     |
```

### 4. Relationship Fidelity

Verify relationships have evidence in source:

```markdown
| Relationship              | Evidence                        | Valid? |
| ------------------------- | ------------------------------- | ------ |
| appointments → patients   | Dropdown "Select Patient"       | ✓      |
| appointments → providers  | Dropdown "Provider"             | ✓      |
| patients → insurance      | ??? (no insurance UI shown)     | REMOVE |
```

### 5. Navigation Fidelity

Verify navigation structure matches source:

```markdown
| Nav Item       | Screen Exists? | Entity Mapped? |
| -------------- | -------------- | -------------- |
| Dashboard      | ✓              | N/A            |
| Patients       | ✓              | patients       |
| Appointments   | ✓              | appointments   |
| Reports        | ✗ (not in design) | REMOVE      |
```

---

## Fidelity Score Calculation

```
Fidelity Score = (Correct Items / Total Items) × 100%

Where:
- Correct Items = Extracted items with valid source evidence
- Total Items = All items in output + All items in source
```

### Thresholds

| Score   | Status   | Action Required                          |
| ------- | -------- | ---------------------------------------- |
| ≥ 98%   | PASS     | Proceed to next stage                    |
| 95-97%  | REVIEW   | Document exceptions, get approval        |
| 90-94%  | WARN     | Fix omissions before proceeding          |
| < 90%   | FAIL     | Major re-extraction/re-audit required    |

---

## Workflow

### Step 1: Prepare Source Evidence

Gather all Stitch HTML exports:

```bash
# Export all screens from Stitch
for screen_id in $(cat screens.json | jq -r '.[].id'); do
  mcp__stitch__get_screen({ projectId: "<id>", screenId: "$screen_id" })
done
```

### Step 2: Generate Fidelity Matrix

Create comparison tables for each category:

```bash
npm run workflow:fidelity-audit -- \
  --html-dir stitch-exports/ \
  --schema schema-suggestion.json \
  --output FIDELITY-REPORT.md
```

### Step 3: Visual Comparison

For each screen:
1. Open Stitch screen (or HTML export)
2. Open corresponding output (schema, React component)
3. Manually verify each element

### Step 4: Mark Discrepancies

Tag each discrepancy:

- `[OMISSION]` - Source has, output missing
- `[FABRICATION]` - Output has, source missing
- `[MISMATCH]` - Both have, but different
- `[PARTIAL]` - Incomplete extraction

### Step 5: Remediate

| Discrepancy Type | Action                                  |
| ---------------- | --------------------------------------- |
| OMISSION         | Add to output from source               |
| FABRICATION      | Remove from output (unless intentional) |
| MISMATCH         | Correct output to match source          |
| PARTIAL          | Complete the extraction                 |

### Step 6: Re-audit

After remediation, re-run audit until score ≥ 98%.

---

## Fidelity Report Template

```markdown
# Fidelity Audit Report

**Project:** {project-name}
**Audit Date:** {date}
**Auditor:** {name}
**Source:** Stitch Project {id} ({screen_count} screens)
**Target:** schema-suggestion.json

---

## Executive Summary

| Metric                 | Value  |
| ---------------------- | ------ |
| Fidelity Score         | XX%    |
| Status                 | PASS/FAIL |
| Entities Audited       | X      |
| Fields Audited         | X      |
| Enums Audited          | X      |
| Relationships Audited  | X      |
| Fabrications Found     | X      |
| Omissions Found        | X      |
| Mismatches Found       | X      |

---

## Detailed Findings

### Entities

| Entity | Status | Notes |
| ------ | ------ | ----- |
| ...    | ...    | ...   |

### Fields

[Per-entity field tables]

### Enums

[Enum value tables]

### Relationships

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

| Item | Discrepancy | Action Taken | Verified By |
| ---- | ----------- | ------------ | ----------- |
| ...  | ...         | ...          | ...         |

---

## Sign-off

### Pre-Remediation
- Initial Score: XX%
- Status: {PASS/FAIL}

### Post-Remediation
- Final Score: XX%
- Status: {PASS/FAIL}

**Approved By:** _______________
**Date:** _______________
```

---

## Integration with Other Skills

### With feature-audit

Run fidelity-gate **before** feature-audit:

1. **fidelity-gate** - Verify extraction accuracy (data matches source)
2. **feature-audit** - Verify feature completeness (features work correctly)

```
Stitch HTML → fidelity-gate → schema-suggestion.json → feature-audit → Production
```

### With stitch-workflow

Fidelity-gate is Stage 6.5 in the Stitch workflow:

```
Stage 6: Data Model Extraction
  ↓
Stage 6.5: Fidelity Audit ← THIS SKILL
  ↓
Stage 7: Backend Foundation
```

---

## Quick Commands

```bash
# Generate fidelity report
npm run workflow:fidelity-audit -- \
  --html-dir stitch-exports/ \
  --schema schema-suggestion.json \
  --output FIDELITY-REPORT.md

# Compare specific screen
npm run workflow:fidelity-compare -- \
  --html stitch-exports/dashboard.html \
  --entity appointments

# List all source evidence for an entity
npm run workflow:fidelity-evidence -- \
  --html-dir stitch-exports/ \
  --entity patients
```

---

## Trigger Phrases

- "Verify extraction accuracy"
- "Fidelity check"
- "Fidelity audit"
- "Check for fabrication"
- "Audit data model"
- "100% fidelity"
- "Zero fabrication"
- "Compare schema to designs"
- "Verify schema matches Stitch"

---

## Exit Criteria

- [ ] Fidelity score ≥ 98% (or approved exceptions documented)
- [ ] Zero unexplained fabrications
- [ ] All omissions addressed or documented as intentional
- [ ] Fidelity report signed off
- [ ] Ready for next stage

---

## References

- `stitch-workflow/SKILL.md` - Full workflow context
- `feature-audit/SKILL.md` - Post-fidelity feature verification
- `stitch-workflow/references/feature-fidelity-gate.md` - Feature-level fidelity
