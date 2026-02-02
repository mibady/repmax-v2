---
name: agentic-prompts
description: Token-efficient prompt formula for AI agents using Input-Workflow-Output structure.
---

# Agentic Prompts

Token-efficient, repeatable prompt formula for AI agents.

## When to Use

- Creating prompts for AI agents
- Custom commands or workflows
- Multi-agent orchestration
- Codifying repeated prompts (after 3+ uses)

## Stack

| Component | Purpose |
|-----------|---------|
| Input | Metadata, title, purpose, variables |
| Workflow | Steps and instructions |
| Output | Structured report format |

## Quick Start

```markdown
# {TITLE}

**Metadata:**
- Allowed Tools: {tools}
- Model: {model}

**Purpose:** {one-line task description}

**Variables:**
- {VAR_NAME}: {description} (dynamic|static)

**Workflow:**
1. {Step 1}
2. {Step 2}
3. {Step 3}

**Instructions:**
- {Constraint or clarification}

**Report:**
Output strictly in {FORMAT}:
```{format}
{schema}
```
```

## Core Patterns

### Pattern 01: Ad Hoc (Discovery)

First encounter, discover solution structure.

```markdown
# Discover API Integration Steps

**Purpose:** Analyze endpoint and generate integration plan.

**Variables:**
- API_DOCS: (provided below)
- SCHEMA: User { id, name, email }

**Workflow:**
1. Parse API documentation
2. Generate 4-step numbered action list (Tool, Args, Purpose)
3. Validate against SCHEMA

**Report:**
Output strictly in YAML:
```yaml
steps:
  - tool: string
    args: object
    purpose: string
```
```

### Pattern 02: Reusable Prompt (Automation)

Codified task repeated 3+ times.

```markdown
# Generate React Component

**Metadata:**
- Allowed Tools: read, write

**Purpose:** Create TypeScript React component using shadcn/ui.

**Variables:**
- COMPONENT_NAME: (dynamic)
- DATA_SCHEMA: (dynamic)
- TEMPLATE_PATH: /templates/component.ts (static)

**Workflow:**
1. Read {TEMPLATE_PATH}
2. Replace placeholders with {COMPONENT_NAME} and {DATA_SCHEMA}
3. Write to components/ui/{COMPONENT_NAME}.tsx

**Report:**
Output only the final code block. No explanation.
```

### Pattern 03: Sub-Agent (Specialization)

Orchestrator delegates to specialized agents.

```markdown
# Analyze Log File

**Purpose:** Coordinate sub-agents for log analysis.

**Variables:**
- LOG_FILE_PATH: (dynamic)

**Workflow:**
1. Delegate to **ClassifierAgent**:
   - Input: {LOG_FILE_PATH}
   - Output: `{"error_type": string, "id": string}[]` (top 10)

2. Delegate to **SummarizerAgent**:
   - Input: ClassifierAgent output
   - Output: 3-sentence executive summary

3. Delegate to **ReviewerAgent**:
   - Input: Summary + {LOG_FILE_PATH}
   - Output: Accuracy score (0-100)

**Report:**
Return only final summary if accuracy >= 80, else return errors.
```

### Pattern 04: MCP Wrapper (Integration)

Agent selects tools from MCP server.

```markdown
# Book Travel

**Metadata:**
- Allowed Tools: travel_flights, travel_hotels, calendar_create

**Purpose:** Fulfill travel request using MCP tools.

**Variables:**
- DESTINATION: (dynamic)
- DATES: { start: string, end: string } (dynamic)

**Workflow:**
1. Call travel_flights({DESTINATION}, {DATES})
2. Call travel_hotels({DESTINATION}, {DATES})
3. Call calendar_create with booking confirmations

**Instructions:**
- Do not output code
- Use only provided tools

**Report:**
```json
{
  "confirmation": "string",
  "tool_calls": ["tool_name(args)", ...]
}
```
```

### Pattern 05: Full Application (Production)

Minimal user prompt, heavy system prompt.

**System Prompt (Persistent):**
```markdown
You are ProfileAgent.

**Identity:** User profile manager for AppName.

**Tools:** db_update, validate_email, audit_log

**Constraints:**
- Always validate email format before update
- Log all changes to audit_log
- Return JSON only

**Output Schema:**
{ "success": boolean, "changes": string[] }
```

**User Prompt (Minimal):**
```
Update profile. name: {new_name}, email: {new_email}
```

## Token Efficiency

| Strategy | Implementation |
|----------|----------------|
| System Prompt | Move persistent rules, identity, schemas here |
| Variables | Reference long paths/data with short names |
| Report Section | Force JSON/YAML to eliminate conversational text |
| Consistency | Same structure reduces agent confusion |

## Variable Types

| Type | Example | Usage |
|------|---------|-------|
| Dynamic | `USER_INPUT: (from request)` | Changes per invocation |
| Static | `TEMPLATE_PATH: /templates/base.ts` | Fixed across invocations |
| Computed | `OUTPUT_PATH: {PROJECT_ROOT}/dist` | Derived from other vars |

## Checklist

- [ ] Purpose is one clear sentence
- [ ] Variables section contains ALL inputs
- [ ] Workflow is numbered, sequential
- [ ] Report specifies exact output format
- [ ] No repeated context (use variable references)
- [ ] Sections are composable (only include what's needed)
