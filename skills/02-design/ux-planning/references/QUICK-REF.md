# UX Planning Quick Reference

One-page cheat sheet for feature planning.

---

## Before Any Feature

**Fill in the blank:**

> "The [user type] wants to [action] so they can [outcome]."

If you can't → you don't understand the feature yet.

---

## Journey in 30 Seconds

| Phase      | Key Question                                       |
| ---------- | -------------------------------------------------- |
| **ENTRY**  | Where did they come from? What do they expect?     |
| **ACTION** | What's the ONE thing they need to do?              |
| **EXIT**   | How do they know it worked? Where do they go next? |

---

## Friction Quick Check

Before coding, ask:

1. **Clicks?** < 3 for common actions
2. **Decisions?** Each one = drop-off risk
3. **What can fail?** How do they recover?
4. **What confirms success?** Never leave them guessing

---

## States to Design (Always)

| State   | Don't Forget                    |
| ------- | ------------------------------- |
| Empty   | What do they see on first use?  |
| Loading | Skeleton > spinner              |
| Error   | Helpful message + recovery path |
| Success | Clear confirmation              |

---

## Red Flags

- Form resets on error (loses user input)
- Generic "Something went wrong"
- No empty state
- Success toast disappears too fast
- User asks "did it work?"

---

## Quick Wins

- Pre-fill what you know
- Default to most common choice
- Validate inline (on blur)
- Show progress for multi-step
- Confirm destructive actions

---

## AI Feature UX

- Show typing/thinking indicator
- Stream responses
- Don't lock input during response
- Provide "try again" on failure
