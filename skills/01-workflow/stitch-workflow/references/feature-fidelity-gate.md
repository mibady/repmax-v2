# Feature Fidelity Gate

**Project-Agnostic Feature Omission Prevention System**

## Problem Statement

During Stitch-to-code conversion, features specified in design prompts are sometimes:

- Simplified due to complexity concerns
- Omitted due to backend uncertainty
- Skipped to prioritize speed
- Forgotten during implementation

**Result:** Delivered product is missing critical features that were approved in design.

## Solution Architecture

A multi-stage validation system that prevents feature omission through:

1. **Automatic Feature Extraction** (Stage 5)
2. **Handoff Completeness Validation** (Stage 5.5)
3. **Feature Implementation Gate** (Stage 6-7)
4. **Reconciliation with Parity Score** (Stage 6.5)
5. **Final Feature Audit** (Stage 7.5)

```
┌─────────────────────────────────────────────────────────────┐
│              FEATURE FIDELITY SAFEGUARD SYSTEM              │
│                                                             │
│  Stage 5: Write STITCH-DESIGN-PROMPTS.md                   │
│    ↓                                                        │
│  [AUTO] Generate FEATURE-MANIFEST.json                     │
│    ↓                                                        │
│  Stage 5.5: Write DEVELOPER-HANDOFF-SPEC.md                │
│    ↓                                                        │
│  [GATE #1] Block if features missing from handoff          │
│    ↓                                                        │
│  Stage 6: Generate HTML in Google Stitch                   │
│    ↓                                                        │
│  [RECONCILE] Compare HTML features vs manifest (95% min)   │
│    ↓                                                        │
│  Stage 6.5: Convert page.tsx                               │
│    ↓                                                        │
│  [GATE #2] Block if page features not implemented          │
│    ↓                                                        │
│  Stage 7.5: Final feature audit                            │
│    ↓                                                        │
│  [AUDIT] Verify 100% feature parity                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Component 1: Feature Manifest Generator

**When:** After writing `docs/STITCH-DESIGN-PROMPTS.md`

**What:** Parses Stitch prompts and extracts all features into structured JSON.

### Usage

```bash
# Automatic (hooked to Write tool)
# Runs automatically when STITCH-DESIGN-PROMPTS.md is saved

# Manual
npm run workflow:feature-manifest
# or
npx tsx src/scripts/generateFeatureManifest.ts [project-path]
```

### How It Works

**Platform-Agnostic Parsing:**

- Extracts features from markdown structure (bullet lists, numbered lists, sections)
- Categorizes features: component, interaction, data-display, form, navigation, state
- Marks as required (default) or optional (if description contains "optional")
- Works for Next.js, Vite, Expo, Telegram, Discord, ChatGPT - any platform

**Example Input (STITCH-DESIGN-PROMPTS.md):**

```markdown
## Phase 3: Dashboard

### 3.1 Dashboard Overview
```

Create a dashboard page with:

- StatCard showing total revenue (${data.revenue})
- StatCard showing active loads ({data.activeLoads})
- AI Consultant chat interface in sidebar
- Chairside schedule component
- Quick actions panel with "New Load" button

```

### Backend Integration
...
```

**Example Output (FEATURE-MANIFEST.json):**

```json
{
  "project": "dentalhub",
  "generated_at": "2025-01-24T10:00:00Z",
  "source": "docs/STITCH-DESIGN-PROMPTS.md",
  "platform": "next.js",
  "pages": [
    {
      "page": "Dashboard Overview",
      "path": "/dashboard",
      "phase": "Phase 3: Dashboard",
      "features": [
        {
          "id": "dashboard-overview-1",
          "description": "StatCard showing total revenue (${data.revenue})",
          "category": "data-display",
          "required": true,
          "implemented": false
        },
        {
          "id": "dashboard-overview-2",
          "description": "StatCard showing active loads ({data.activeLoads})",
          "category": "data-display",
          "required": true,
          "implemented": false
        },
        {
          "id": "dashboard-overview-3",
          "description": "AI Consultant chat interface in sidebar",
          "category": "component",
          "required": true,
          "implemented": false
        },
        {
          "id": "dashboard-overview-4",
          "description": "Chairside schedule component",
          "category": "component",
          "required": true,
          "implemented": false
        },
        {
          "id": "dashboard-overview-5",
          "description": "Quick actions panel with \"New Load\" button",
          "category": "interaction",
          "required": true,
          "implemented": false
        }
      ]
    }
  ],
  "summary": {
    "total_features": 5,
    "required_features": 5,
    "implemented": 0,
    "deferred": 0,
    "completion_rate": 0
  }
}
```

### Feature Extraction Patterns

| Pattern           | Example                        | Extracted                   |
| ----------------- | ------------------------------ | --------------------------- |
| Bullet list       | `- StatCard showing revenue`   | "StatCard showing revenue"  |
| Numbered list     | `1. Create user button`        | "Create user button"        |
| Section colon     | `Header: Logo and nav menu`    | "Header: Logo and nav menu" |
| Component mention | `Button for creating projects` | "Button: creating projects" |

### Meta Instructions (Skipped)

These are NOT extracted as features:

- "Use shadcn/ui components"
- "Apply responsive design"
- "Include hover/focus states"
- "Use Tailwind CSS"
- "Export as React"

---

## Component 2: Stitch Completeness Validator Hook

**When:** Before writing `docs/DEVELOPER-HANDOFF-SPEC.md`

**What:** Blocks handoff document creation if it doesn't reference all required features.

### Trigger

```yaml
# .claude/hooks.yaml
- name: stitch-completeness-validator
  trigger: Write
  path_pattern: "docs/DEVELOPER-HANDOFF-SPEC.md|docs/HANDOFF-CHECKLIST.md"
  script: .claude/hooks/stitch-completeness-validator.ts
  on_error: block
```

### How It Works

1. Load `docs/FEATURE-MANIFEST.json`
2. Parse handoff document for feature references
3. Match features using fuzzy logic (accounts for wording variations)
4. Block if required features are missing

### Example Block Message

```
⛔ BLOCKED: Feature Fidelity Gate Failed
═════════════════════════════════════════════════
File: docs/DEVELOPER-HANDOFF-SPEC.md

Handoff document is incomplete. Missing 2 required features:

📄 Dashboard Overview:
   - AI Consultant chat interface in sidebar
   - Chairside schedule component

📊 Coverage: 3/5 required features (60%)

💡 Actions:
   1. Review docs/FEATURE-MANIFEST.json
   2. Add missing features to handoff document
   3. OR mark features as deferred in manifest:
      {"deferred": {"reason": "Phase 2", "approved_by": "user"}}

To bypass: Set SKIP_FEATURE_FIDELITY=true
═════════════════════════════════════════════════
```

### Bypass Options

```bash
# Disable all feature fidelity checks
SKIP_FEATURE_FIDELITY=true

# Relaxed mode (warns but doesn't block)
FEATURE_FIDELITY_MODE=relaxed
```

---

## Component 3: Feature Implementation Gate Hook

**When:** Before editing page files (`app/**/page.tsx`, `screens/**/*.tsx`, etc.)

**What:** Blocks page implementation until all features for that page are marked complete.

### Trigger

```yaml
# .claude/hooks.yaml
- name: feature-implementation-gate
  trigger: Edit,Write
  path_pattern: "app/**/page.tsx|pages/**/*.tsx|screens/**/*.tsx"
  script: .claude/hooks/feature-implementation-gate.ts
  on_error: block
```

### Platform-Agnostic Patterns

Works for any framework:

- Next.js: `app/**/page.tsx`
- Vite/React Router: `pages/**/*.tsx`
- Expo: `screens/**/*.tsx` or `app/**/*.tsx`
- Custom: Any path pattern you define

### Workflow

1. Load `docs/FEATURE-MANIFEST.json`
2. Match file path to page in manifest
3. Check if all required features are `"implemented": true`
4. Allow if placeholder file (contains "INTEGRATION POINT" or "TODO")
5. Block if features not complete

### Example Block Message

```
⛔ BLOCKED: Feature Implementation Incomplete
═════════════════════════════════════════════════
File: app/dashboard/page.tsx
Page: Dashboard Overview

This page has 2 unimplemented required features:

1. AI Consultant chat interface in sidebar
2. Chairside schedule component

📊 Progress: 3/5 features (60%)

💡 Actions:
   1. Implement missing features
   2. Update docs/FEATURE-MANIFEST.json: set "implemented": true
   3. OR defer features: {"deferred": {"reason": "...", "approved_by": "user"}}

To bypass: Set SKIP_FEATURE_FIDELITY=true
═════════════════════════════════════════════════
```

### Updating Feature Status

Edit `docs/FEATURE-MANIFEST.json`:

```json
{
  "id": "dashboard-overview-3",
  "description": "AI Consultant chat interface in sidebar",
  "category": "component",
  "required": true,
  "implemented": true // ← Mark as complete
}
```

---

## Component 4: Enhanced Reconcile with Parity Score

**When:** After generating HTML in Google Stitch (Stage 6)

**What:** Compares Stitch HTML against feature manifest, reports parity score.

### Usage

```bash
npm run workflow:reconcile path/to/stitch-export.html

# or
npx tsx src/scripts/reconcileStitch.ts stitch-exports/dashboard.html
```

### How It Works

1. Parse Stitch HTML for features (buttons, forms, data displays, navigation)
2. Load `docs/FEATURE-MANIFEST.json`
3. Match Stitch features against manifest using fuzzy matching
4. Calculate parity score: `(found / required) * 100`
5. Fail if parity < 95%

### Platform-Agnostic HTML Parsing

Extracts features semantically, works for any HTML:

- **Buttons:** All `<button>` elements
- **Forms:** All `<form>` with inputs
- **Data displays:** Elements with `card`, `stat` classes
- **Navigation:** `<nav>` links, header links
- **Sections:** `<section>`, `<article>` with headings

### Example Output

```markdown
# Stitch Reconciliation Report (Feature Parity)

**Generated:** 2025-01-24T10:00:00Z
**Page:** Dashboard Overview
**Stitch Source:** stitch-exports/dashboard.html
**Feature Parity Score:** 60%

---

## Summary

- ✅ Features found: 3
- ❌ Features missing: 2
- ⚠️ Features excess: 1
- 📊 Parity score: 60%

## Issues

🔴 **CRITICAL**: 2 required features missing from Stitch output
🔴 **CRITICAL**: Feature parity below 95% (60%)

## ❌ Missing Features (Not in Stitch Output)

These features were promised in STITCH-DESIGN-PROMPTS.md but are missing:

1. AI Consultant chat interface in sidebar
2. Chairside schedule component

**Action Required:** Re-generate Stitch output with complete feature set.

## ✅ Found Features (Matched)

1. StatCard showing total revenue
2. StatCard showing active loads
3. Quick actions panel with "New Load" button

---

## Next Steps

❌ **FAIL** - Feature parity below threshold (< 95%).

1. Review missing features list above
2. Update Stitch prompts to include all required features
3. Re-generate in Google Stitch
4. Re-run this reconciliation
5. OR mark features as deferred in manifest if intentional
```

---

## Component 5: Deferring Features

**When:** A feature is intentionally moved to a later phase.

**How:** Edit `docs/FEATURE-MANIFEST.json` and add a `deferred` object:

```json
{
  "id": "dashboard-overview-3",
  "description": "AI Consultant chat interface in sidebar",
  "category": "component",
  "required": true,
  "implemented": false,
  "deferred": {
    "reason": "Complex AI integration - moving to Phase 2",
    "approved_by": "user",
    "target_phase": "Phase 2"
  }
}
```

**Effect:**

- Feature is skipped in all validations
- Still tracked in manifest for later phases
- Approval recorded for accountability

---

## Enforcement Modes

### Strict Mode (Default)

```bash
# No environment variables needed
# Blocks all operations that fail validation
```

### Relaxed Mode

```bash
# Warns but doesn't block
export FEATURE_FIDELITY_MODE=relaxed
```

### Disabled

```bash
# Skip all feature fidelity checks
export SKIP_FEATURE_FIDELITY=true

# Or skip all workflow enforcement
export SKIP_WORKFLOW_ENFORCEMENT=true
```

---

## Integration with Unified Workflow

### Stage 5: Stitch Prompts

**NEW:**

1. Write `docs/STITCH-DESIGN-PROMPTS.md`
2. **AUTO:** `docs/FEATURE-MANIFEST.json` generated
3. Review manifest, adjust `required` flags if needed

### Stage 5.5: Developer Handoff

**NEW:**

1. Write `docs/DEVELOPER-HANDOFF-SPEC.md`
2. **GATE:** Blocked if features missing from handoff
3. Fix: Add all features from manifest to handoff

### Stage 6: Stitch Generation

**NEW:**

1. Generate HTML in Google Stitch
2. **RECONCILE:** Run feature parity check
3. If < 95%: Re-generate with complete features
4. If ≥ 95%: Proceed to conversion

### Stage 6.5: Page Conversion

**NEW:**

1. Start implementing page (e.g., `app/dashboard/page.tsx`)
2. **GATE:** Blocked if features not marked `implemented: true`
3. Implement all features, then update manifest
4. Conversion allowed when all features complete

### Stage 7.5: Final Audit

**ENHANCED:**

- Feature audit now checks against `FEATURE-MANIFEST.json`
- Reports feature parity score
- Verifies no features were omitted during implementation

---

## Workflow Commands

| Command                             | When             | Purpose                                  |
| ----------------------------------- | ---------------- | ---------------------------------------- |
| `npm run workflow:feature-manifest` | After Stage 5    | Generate feature manifest from prompts   |
| `npm run workflow:reconcile <html>` | After Stage 6    | Verify Stitch HTML has all features      |
| (Manual) Edit manifest              | During Stage 6-7 | Mark features as implemented or deferred |

---

## Best Practices

### 1. Write Detailed Stitch Prompts

**Bad:**

```
Create a dashboard with stats and actions.
```

**Good:**

```
Create a dashboard with:
- StatCard showing total revenue (${data.revenue})
- StatCard showing active loads ({data.activeLoads})
- AI Consultant chat interface in sidebar
- Chairside schedule component
- Quick actions panel with "New Load" button
```

The more specific your prompts, the better the feature extraction.

### 2. Review Generated Manifest

After Stage 5, review `docs/FEATURE-MANIFEST.json`:

- Check if all features were extracted
- Manually add features that weren't detected
- Mark truly optional features: `"required": false`

### 3. Run Reconcile Early

Don't wait until all pages are done. Reconcile each page after Stitch generation:

```bash
npm run workflow:reconcile stitch-exports/dashboard.html
```

Fix issues immediately while the design is fresh.

### 4. Update Manifest During Implementation

As you implement features, mark them complete:

```json
"implemented": true
```

This allows the implementation gate to track progress accurately.

### 5. Defer Intentionally, Not Accidentally

If a feature is too complex, defer it explicitly:

```json
"deferred": {
  "reason": "AI integration requires ML pipeline setup first",
  "approved_by": "product-owner",
  "target_phase": "Phase 2"
}
```

Never skip features silently.

---

## Troubleshooting

### "No feature manifest found"

**Cause:** `FEATURE-MANIFEST.json` doesn't exist.

**Fix:**

```bash
npm run workflow:feature-manifest
```

### "No features extracted from Stitch prompts"

**Cause:** Prompts lack structured bullet points.

**Fix:** Rewrite prompts with clear bullet/numbered lists of features.

### "Feature parity below 95%"

**Cause:** Stitch output is missing features from the prompts.

**Fix:**

1. Review missing features in reconciliation report
2. Update Stitch prompts to be more explicit
3. Re-generate in Google Stitch
4. Re-run reconcile

### "Page has unimplemented features"

**Cause:** Trying to edit a page before marking features as implemented.

**Fix:** Edit `docs/FEATURE-MANIFEST.json` and set `"implemented": true` for completed features.

---

## FAQ

**Q: Does this work for Expo/Telegram/Discord projects?**
A: Yes. The system is platform-agnostic. It parses markdown structure and HTML semantics, not platform-specific code.

**Q: What if my Stitch prompt doesn't have bullet points?**
A: The generator also extracts from numbered lists, section headers, and component mentions. But for best results, use bullet/numbered lists.

**Q: Can I manually edit the feature manifest?**
A: Yes. It's a JSON file. You can add features, mark as optional, defer, or mark as implemented.

**Q: What if I want to skip a feature temporarily?**
A: Mark it as deferred with a reason and target phase. This documents the decision.

**Q: Does this slow down the workflow?**
A: No. Feature extraction is automatic. Validation hooks only run on relevant file saves. Reconcile is manual and fast (< 1 second per page).

**Q: What if reconcile reports false negatives?**
A: The fuzzy matching may miss some features. Manually update the manifest to reflect reality. Report patterns to improve the matching algorithm.

---

## Implementation Checklist

To enable feature fidelity safeguards for a project:

- [ ] Stage 5: Write detailed Stitch prompts with bullet lists
- [ ] Stage 5: Generate feature manifest: `npm run workflow:feature-manifest`
- [ ] Stage 5: Review and adjust manifest (optional features, defer)
- [ ] Stage 5.5: Write handoff spec (gate will validate)
- [ ] Stage 6: After Stitch generation, run reconcile per page
- [ ] Stage 6-7: Mark features as implemented during build
- [ ] Stage 7.5: Final feature audit passes

---

## Summary

This system prevents the "dental dashboard incident" from happening again by:

1. **Extracting** all promised features automatically
2. **Validating** handoff documents include all features
3. **Reconciling** Stitch output against promises (95% threshold)
4. **Gating** page implementation until features are complete
5. **Auditing** final implementation for 100% parity

**Result:** No feature is silently omitted. Every promised feature is tracked, validated, and delivered or explicitly deferred.
