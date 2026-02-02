# Validation Gates

Gate definitions for stage transitions in the unified workflow.

---

## Gate Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VALIDATION GATE                          │
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  CRITERIA   │ → │   CHECKS    │ → │   RESULT     │   │
│  │  (defined)  │    │  (executed)  │    │ pass/fail   │   │
│  └─────────────┘    └──────────────┘    └──────────────┘  │
│                                                             │
│  On Pass: Transition to next stage                          │
│  On Fail: Block with actionable error message               │
└─────────────────────────────────────────────────────────────┘
```

---

## Gate 1→2: PRP Validation

### Purpose

Ensure PRP is complete before starting backend work.

### Criteria

| Check             | Requirement             | How to Verify               |
| ----------------- | ----------------------- | --------------------------- |
| Sections Complete | All 17 sections present | Parse PRP headings          |
| Pattern Selected  | Pattern 01-05 defined   | Check section 1 or 15       |
| Data Model        | Section 8 has tables    | Validate SQL or entity list |
| API Design        | Section 9 has endpoints | Validate route list         |
| Skills Mapped     | Section 15 complete     | Check skills table          |
| Design System     | Section 16 has colors   | Check CSS variables         |

### Validation Script

```typescript
interface PRPValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export async function validatePRP(
  prpPath: string,
): Promise<PRPValidationResult> {
  const content = await fs.readFile(prpPath, "utf-8");
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required sections
  const requiredSections = [
    "## 1. Project Overview",
    "## 2. Goals & Success Metrics",
    "## 3. User Personas",
    "## 4. User Stories",
    "## 5. Functional Requirements",
    "## 6. Non-Functional Requirements",
    "## 7. Technical Architecture",
    "## 8. Data Model",
    "## 9. API Design",
    "## 10. UI/UX Requirements",
    "## 11. Integration Points",
    "## 12. Testing Strategy",
    "## 13. Deployment Plan",
    "## 14. Implementation Roadmap",
    "## 15. Skills Assessment",
    "## 16. Design System Foundation",
  ];

  for (const section of requiredSections) {
    if (!content.includes(section)) {
      errors.push(`Missing section: ${section}`);
    }
  }

  // Check pattern selection
  const patternMatch = content.match(/Pattern\s+(0[1-5])/i);
  if (!patternMatch) {
    errors.push("Pattern not selected (01-05)");
  }

  // Check data model has content
  const dataModelSection = extractSection(content, "## 8. Data Model");
  if (!dataModelSection || dataModelSection.length < 100) {
    errors.push("Section 8 (Data Model) appears empty or incomplete");
  }

  // Check API design has endpoints
  const apiSection = extractSection(content, "## 9. API Design");
  if (!apiSection?.includes("/api/")) {
    warnings.push("Section 9 (API Design) may be missing endpoints");
  }

  // Check design system has CSS variables
  const designSection = extractSection(content, "## 16. Design System");
  if (!designSection?.includes("--primary")) {
    warnings.push("Section 16 (Design System) may be missing CSS variables");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
```

### Error Messages

| Error                             | Action                                |
| --------------------------------- | ------------------------------------- |
| Missing section: ## 8. Data Model | Add data model with table definitions |
| Pattern not selected              | Add "Pattern: 05" to section 1 or 15  |
| Section 9 missing endpoints       | Define API routes in section 9        |

---

## Gate 2→3: Backend Validation

### Purpose

Ensure backend is functional before generating scaffold.

### Criteria

| Check                | Requirement                  | How to Verify            |
| -------------------- | ---------------------------- | ------------------------ |
| Database Connected   | Supabase responds            | `supabase status`        |
| Tables Created       | Expected tables exist        | Query information_schema |
| RLS Enabled          | All tables have RLS          | Check pg_tables          |
| Auth Working         | Can sign in/out              | Test auth flow           |
| Migrations Committed | Files in supabase/migrations | Check git status         |

### Validation Script

```typescript
interface BackendValidationResult {
  valid: boolean;
  database: { connected: boolean; tables: string[] };
  rls: { enabled: boolean; tables: string[] };
  auth: { configured: boolean; providers: string[] };
  migrations: { committed: boolean; count: number };
  errors: string[];
}

export async function validateBackend(): Promise<BackendValidationResult> {
  const errors: string[] = [];

  // Check database connection
  let tables: string[] = [];
  try {
    const result = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");

    tables = result.data?.map((t) => t.table_name) ?? [];
  } catch (e) {
    errors.push("Cannot connect to database");
  }

  // Check RLS enabled
  const rlsEnabled = await checkRLSEnabled();
  if (!rlsEnabled.allEnabled) {
    errors.push(`RLS not enabled on: ${rlsEnabled.missingTables.join(", ")}`);
  }

  // Check auth
  const authConfigured = await checkAuthConfiguration();
  if (!authConfigured) {
    errors.push("Auth not configured");
  }

  // Check migrations
  const migrations = await glob("supabase/migrations/*.sql");
  if (migrations.length === 0) {
    errors.push("No migrations found in supabase/migrations/");
  }

  return {
    valid: errors.length === 0,
    database: { connected: tables.length > 0, tables },
    rls: rlsEnabled,
    auth: authConfigured,
    migrations: { committed: migrations.length > 0, count: migrations.length },
    errors,
  };
}
```

### Error Messages

| Error                        | Action                                              |
| ---------------------------- | --------------------------------------------------- |
| Cannot connect to database   | Check SUPABASE_URL and keys in .env                 |
| RLS not enabled on: projects | Run: ALTER TABLE projects ENABLE ROW LEVEL SECURITY |
| Auth not configured          | Set up Supabase Auth providers                      |
| No migrations found          | Run: supabase db diff --file {name}                 |

---

## Gate 3→4: Scaffold Validation

### Purpose

Ensure scaffold is complete before generating copy.

### Criteria

| Check            | Requirement           | How to Verify           |
| ---------------- | --------------------- | ----------------------- |
| Types Generated  | database.ts exists    | Check types/database.ts |
| Hooks Created    | use-\*.ts files exist | Check lib/hooks/        |
| Actions Created  | \*-actions.ts exist   | Check lib/actions/      |
| Auth Working     | Can sign in/out       | Test auth flow          |
| TypeScript Clean | No compile errors     | npx tsc --noEmit        |

### Validation Script

```typescript
export async function validateScaffold(): Promise<ScaffoldValidationResult> {
  const errors: string[] = [];

  // Check types
  const typesExist = await fileExists("types/database.ts");
  if (!typesExist) {
    errors.push(
      "Types not generated. Run: npx supabase gen types typescript --local > types/database.ts",
    );
  }

  // Check hooks
  const hooks = await glob("lib/hooks/use-*.ts");
  if (hooks.length === 0) {
    errors.push("No hooks found in lib/hooks/");
  }

  // Check actions
  const actions = await glob("lib/actions/*-actions.ts");
  if (actions.length === 0) {
    errors.push("No actions found in lib/actions/");
  }

  // TypeScript check
  try {
    await exec("npx tsc --noEmit");
  } catch (e) {
    errors.push("TypeScript errors found. Run: npx tsc --noEmit");
  }

  return {
    valid: errors.length === 0,
    types: typesExist,
    hooks: hooks.length,
    actions: actions.length,
    errors,
  };
}
```

---

## Gate 5.5→6: Handoff Validation

### Purpose

Ensure handoff documents are complete before frontend work.

### Criteria

| Check               | Requirement                     | How to Verify         |
| ------------------- | ------------------------------- | --------------------- |
| Stitch Prompts      | STITCH-DESIGN-PROMPTS.md exists | Check docs/           |
| Handoff Checklist   | HANDOFF-CHECKLIST.md exists     | Check docs/           |
| Functional Contract | FUNCTIONAL-CONTRACT.md exists   | Check docs/           |
| No Placeholders     | No {placeholder} text           | Scan for { } patterns |

### Validation Script

```typescript
export async function validateHandoff(): Promise<HandoffValidationResult> {
  const errors: string[] = [];

  const requiredDocs = [
    "docs/STITCH-DESIGN-PROMPTS.md",
    "docs/HANDOFF-CHECKLIST.md",
    "docs/FUNCTIONAL-CONTRACT.md",
  ];

  for (const doc of requiredDocs) {
    if (!(await fileExists(doc))) {
      errors.push(`Missing: ${doc}`);
    } else {
      // Check for placeholders
      const content = await fs.readFile(doc, "utf-8");
      const placeholders = content.match(/\{[^}]+\}/g);
      if (placeholders && placeholders.length > 0) {
        errors.push(
          `Placeholders found in ${doc}: ${placeholders.slice(0, 3).join(", ")}`,
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

---

## Gate 7.5→8: Integration Validation

### Purpose

Ensure cross-phase integration before quality gates.

### Criteria

| Check             | Requirement           | How to Verify       |
| ----------------- | --------------------- | ------------------- |
| All Routes Work   | No 404s               | Navigate all routes |
| Auth Persists     | Session across pages  | Test auth state     |
| Build Succeeds    | npm run build passes  | Run build           |
| No Console Errors | Clean browser console | Manual check        |

### Validation Script

```typescript
export async function validateIntegration(): Promise<IntegrationValidationResult> {
  const errors: string[] = [];

  // Build check
  try {
    await exec("npm run build");
  } catch (e) {
    errors.push("Build failed. Fix errors before proceeding.");
    return { valid: false, errors };
  }

  // Route check (requires running server)
  const routes = await extractRoutes();
  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:3000${route}`);
      if (res.status === 404) {
        errors.push(`Route returns 404: ${route}`);
      }
    } catch {
      errors.push(`Cannot reach route: ${route}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

---

## Gate 8→9: Quality Validation

### Purpose

Ensure production readiness before agent handoff.

### Criteria

| Check         | Requirement                 | How to Verify     |
| ------------- | --------------------------- | ----------------- |
| Feature Audit | 0 critical, ≥95% functional | /audit --critical |
| TypeScript    | No errors                   | npx tsc --noEmit  |
| ESLint        | No errors                   | npx eslint .      |
| Build         | Succeeds                    | npm run build     |
| Tests         | Pass                        | npm run test      |

### Validation Script

```typescript
export async function validateQuality(): Promise<QualityValidationResult> {
  const results = {
    featureAudit: { pass: false, rate: 0, critical: 0 },
    typescript: { pass: false, errors: 0 },
    eslint: { pass: false, errors: 0 },
    build: { pass: false },
    tests: { pass: false, passed: 0, failed: 0 },
  };

  // Feature audit
  const auditResult = await runFeatureAudit();
  results.featureAudit = {
    pass: auditResult.critical === 0 && auditResult.rate >= 95,
    rate: auditResult.rate,
    critical: auditResult.critical,
  };

  // TypeScript
  try {
    await exec("npx tsc --noEmit");
    results.typescript = { pass: true, errors: 0 };
  } catch (e) {
    const errorCount = countTsErrors(e.stderr);
    results.typescript = { pass: false, errors: errorCount };
  }

  // ESLint
  try {
    await exec("npx eslint . --format json");
    results.eslint = { pass: true, errors: 0 };
  } catch (e) {
    const errorCount = countEslintErrors(e.stdout);
    results.eslint = { pass: false, errors: errorCount };
  }

  // Build
  try {
    await exec("npm run build");
    results.build = { pass: true };
  } catch {
    results.build = { pass: false };
  }

  // Tests
  try {
    const testOutput = await exec("npm run test -- --json");
    const testResults = JSON.parse(testOutput);
    results.tests = {
      pass: testResults.success,
      passed: testResults.numPassedTests,
      failed: testResults.numFailedTests,
    };
  } catch {
    results.tests = { pass: false, passed: 0, failed: 0 };
  }

  const allPass = Object.values(results).every((r) => r.pass);

  return {
    valid: allPass,
    results,
  };
}
```

---

## Gate Report Format

```markdown
# Workflow Gate Report

## Gate: {from} → {to}

**Status:** ✅ PASS / ❌ FAIL

### Checks

| Check      | Status | Details                   |
| ---------- | ------ | ------------------------- |
| Database   | ✅     | Connected, 5 tables       |
| RLS        | ✅     | Enabled on all tables     |
| Auth       | ✅     | Email + Google configured |
| Migrations | ✅     | 3 migrations committed    |

### Errors

{none / list of errors}

### Next Steps

{action items if failed}
```

---

## CLI Commands

```bash
# Validate specific gate
npm run workflow:validate --gate 2-3

# Validate all gates up to current stage
npm run workflow:validate --up-to 5

# Run gate with auto-fix for simple issues
npm run workflow:validate --gate 3-4 --fix
```
