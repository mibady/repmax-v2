# MCP Plugins Template

Auto-configure MCP plugins based on project tech stack.

---

## Detection Logic

### From package.json Dependencies

| Dependency | Plugin |
|------------|--------|
| `@supabase/supabase-js` | supabase |
| `@supabase/ssr` | supabase |
| `stripe` | stripe |
| `@stripe/stripe-js` | stripe |
| `@playwright/test` | playwright |
| `playwright` | playwright |

### From Environment Variables

| Variable Pattern | Plugin |
|-----------------|--------|
| `SUPABASE_*` | supabase |
| `NEXT_PUBLIC_SUPABASE_*` | supabase |
| `STRIPE_*` | stripe |
| `NEXT_PUBLIC_STRIPE_*` | stripe |

### From PRP Tech Stack

| PRP Section | Plugin |
|-------------|--------|
| Database: Supabase | supabase |
| Payments: Stripe | stripe |
| Testing: Playwright | playwright |

---

## Plugin Configuration Templates

### Supabase Plugin

```json
{
  "supabase": {
    "command": "npx",
    "args": ["-y", "@anthropic/claude-supabase-mcp"]
  }
}
```

**Capabilities:**
- Database queries and schema inspection
- RLS policy management
- Edge function deployment
- Storage management
- Auth user management

### Stripe Plugin

```json
{
  "stripe": {
    "command": "npx",
    "args": ["-y", "@anthropic/claude-stripe-mcp"]
  }
}
```

**Capabilities:**
- Create/manage products and prices
- Customer management
- Payment intent handling
- Subscription management
- Invoice handling

### Playwright Plugin

```json
{
  "playwright": {
    "command": "npx",
    "args": ["-y", "@anthropic/claude-playwright-mcp"]
  }
}
```

**Capabilities:**
- Browser automation
- E2E test execution
- Screenshot capture
- Visual testing

### Context7 Plugin

```json
{
  "context7": {
    "command": "npx",
    "args": ["-y", "@anthropic/claude-context7-mcp"]
  }
}
```

**Capabilities:**
- Documentation lookup
- Library API reference
- Code examples

---

## Generated Settings File

**File:** `target-project/.claude/settings.json`

```json
{
  "mcpServers": {
    // Plugins populated based on detection
  }
}
```

---

## Detection Algorithm

```
1. Read package.json
   - Extract dependencies and devDependencies
   - Match against dependency patterns

2. Read .env.example (if exists)
   - Extract variable names
   - Match against env variable patterns

3. Read PRP (if provided)
   - Extract Tech Stack section
   - Match against PRP patterns

4. For each detected plugin:
   - Add to mcpServers config
   - Note capabilities in CLAUDE.md

5. Write .claude/settings.json
```

---

## Full Settings Template

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@anthropic/claude-supabase-mcp"]
    },
    "stripe": {
      "command": "npx",
      "args": ["-y", "@anthropic/claude-stripe-mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@anthropic/claude-playwright-mcp"]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@anthropic/claude-context7-mcp"]
    }
  }
}
```

---

## Plugin Documentation Section

Add to generated CLAUDE.md:

```markdown
## MCP Plugins

The following MCP plugins are configured for this project:

| Plugin | Purpose | Common Commands |
|--------|---------|-----------------|
| supabase | Database and auth | Query tables, manage RLS, deploy functions |
| stripe | Payments | Create products, manage subscriptions |
| playwright | Testing | Run E2E tests, capture screenshots |
| context7 | Documentation | Look up library docs and examples |

### Supabase Plugin Usage

- Query database: Use natural language to query tables
- Create migration: Describe the schema change needed
- Check RLS: Ask about current row-level security policies

### Stripe Plugin Usage

- Create product: Describe the product and pricing
- List customers: Query customer data
- Check payments: Review payment history

### Playwright Plugin Usage

- Run E2E tests: Execute test suite
- Debug tests: Step through failing tests
- Screenshot: Capture page state
```

---

## Platform-Specific Plugin Sets

### SaaS Web App (Pattern 05)

```json
{
  "mcpServers": {
    "supabase": { ... },
    "stripe": { ... },
    "playwright": { ... },
    "context7": { ... }
  }
}
```

### Mobile App (Expo)

```json
{
  "mcpServers": {
    "supabase": { ... },
    "context7": { ... }
  }
}
```

### Telegram Mini App

```json
{
  "mcpServers": {
    "supabase": { ... },
    "context7": { ... }
  }
}
```

### Discord Activity

```json
{
  "mcpServers": {
    "supabase": { ... },
    "context7": { ... }
  }
}
```

### ChatGPT Canvas (Client-Only)

```json
{
  "mcpServers": {
    "context7": { ... }
  }
}
```

### ChatGPT Canvas (With Backend)

```json
{
  "mcpServers": {
    "supabase": { ... },
    "stripe": { ... },
    "context7": { ... }
  }
}
```

---

## Usage in /handoff

1. Run detection algorithm on target project
2. Build mcpServers config with detected plugins
3. Write `.claude/settings.json`
4. Add plugin documentation section to CLAUDE.md
