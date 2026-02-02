---
name: project-memory
description: Cross-session memory for project decisions, context, and milestones. Persists across Claude Code sessions.
---

# Project Memory - Cross-Session RAG

Maintain project context and decisions across multiple Claude Code sessions.

## Commands

| Command | Purpose |
|---------|---------|
| `/remember "..."` | Save a decision or context note |
| `/recall` | Query past memories |
| `/session-end` | Generate and save session summary |

## When to Use

- **Starting a session**: Run `/recall` to load prior context
- **Making decisions**: Use `/remember` to capture rationale
- **Ending a session**: Run `/session-end` to preserve context
- **Milestone commits**: Auto-captured via git hook

## Memory Types

| Type | Description | Example |
|------|-------------|---------|
| `decision` | Architecture/tech choices | "Using Supabase over Firebase for RLS" |
| `session-summary` | End-of-session context | "Completed auth, next: payments" |
| `milestone` | What was shipped | "M3: Auth - Added magic link" |
| `blocker-solution` | Problems and fixes | "Fixed RLS loop with security definer" |

## Usage

### Remember a Decision

```
/remember "Using Stripe Connect direct charges - platform takes 10% fee"
```

### Recall Past Context

```
/recall                     # Recent memories for current project
/recall "auth decisions"    # Search semantically
/recall --type milestone    # Filter by type
/recall --all              # Search all projects
```

### End Session

```
/session-end
```

This generates:
- Accomplishments
- Files changed
- Current state
- Next steps

### Auto-Captured Milestones

When you commit with milestone format:
```bash
git commit -m "M3: Auth - Magic link authentication"
```

The post-commit hook automatically saves this to memory.

## Integration with /prime

When running `/prime`, the system can optionally query project memory for prior session context. This helps maintain continuity across sessions.

## What NOT to Store

- Source code (use knowledgeBase for that)
- Config files
- Package.json
- Build artifacts

Focus on **decisions and context**, not code.

## Setup

Requires environment variables:
- `UPSTASH_VECTOR_REST_URL`
- `UPSTASH_VECTOR_REST_TOKEN`
- `OPENAI_API_KEY`

If not configured, commands fail gracefully with instructions.

## Architecture

- **Vector Store**: Upstash Vector (shared with knowledgeBase)
- **Embeddings**: OpenAI text-embedding-3-small (384 dimensions)
- **ID Format**: `memory:{project}:{type}:{timestamp}`
- **Filtering**: Memory IDs prefixed with `memory:` to separate from code chunks

## Files

| File | Purpose |
|------|---------|
| `src/services/projectMemory.ts` | Core service |
| `.claude/commands/remember.md` | /remember command |
| `.claude/commands/recall.md` | /recall command |
| `.claude/commands/session-end.md` | /session-end command |
| `.husky/post-commit` | Milestone auto-capture |
| `src/scripts/saveMilestoneMemory.ts` | Post-commit helper |
