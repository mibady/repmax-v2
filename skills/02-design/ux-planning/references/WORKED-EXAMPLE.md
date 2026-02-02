# UX Planning: Worked Example

Real example using DentalHub appointment confirmation flow.

---

## Feature: Appointment Confirmation

### JTBD

The **front desk staff** wants to **confirm tomorrow's appointments** so they can **reduce no-shows and fill gaps**.

---

### Entry

- **Source:** Dashboard sidebar → "Tomorrow's Schedule" or morning notification
- **Mental state:** Rushed (doing this before patients arrive), task-oriented
- **Expectation:** See tomorrow's appointments, one-click confirm/call
- **Pre-filled data:** Patient name, phone, appointment time, last visit, confirmation history

### Action

- **Primary action:** Confirm appointments (via text or mark as called)
- **Required decisions:**
  - Which confirmation method? (Text vs Call vs Skip)
  - Priority order? (Show already-confirmed vs needing action)
- **Defaults we can set:**
  - Auto-sort by "needs action first"
  - Default to text (most common)
  - Pre-compose message template
- **Feedback needed:**
  - Text sent indicator (real-time)
  - Delivery status (sent → delivered → read)
  - Call logged confirmation

### Exit

- **Success indicator:**
  - Individual: Green checkmark + timestamp
  - Batch: "15/18 confirmed" progress bar
- **Next step:** Jump to unconfirmed, or "All done! View full schedule"
- **Undo option:** "Resend" or "Mark as unconfirmed"
- **Persisted state:** Confirmation status, timestamp, method used

### Edge Cases

| Case             | Trigger                  | User Sees                         | Action                  |
| ---------------- | ------------------------ | --------------------------------- | ----------------------- |
| Empty            | No appointments tomorrow | "No appointments scheduled"       | CTA to view schedule    |
| All confirmed    | Already done             | "All 18 appointments confirmed ✓" | Link to schedule        |
| Phone invalid    | Bad number on file       | Warning icon + "Update phone"     | Inline edit or skip     |
| Text failed      | Delivery error           | "Failed to send" + retry          | Retry or switch to call |
| Patient canceled | While confirming         | Real-time update "Canceled"       | Remove from list        |

---

## Friction Audit Results

### Quantitative

- ✅ Clicks to confirm single: 1 (tap "Send Text")
- ✅ Clicks to confirm batch: 2 (Select all → Confirm selected)
- ⚠️ Form fields: Phone edit should be inline, not separate page
- ✅ Time to complete: ~30 seconds for typical 15 appointments

### Cognitive

- ✅ Decisions forced: Only method (text vs call), can default
- ✅ Jargon: Plain language ("Send Text" not "Dispatch SMS")
- ✅ Scan time: Patient name + time + status visible immediately
- ✅ Memory: No cross-referencing needed, all info on screen

### Error Friction

- ⚠️ Invalid phone: Currently fails silently → Add inline warning
- ✅ Network error: Retry button present
- ✅ Partial success: Shows which succeeded/failed individually
- ✅ Data preserved: Confirmation status saved immediately

### Trust Friction

- ✅ Reversible: Can resend or change status
- ✅ Transparent: Shows exact message being sent
- ✅ Clear next steps: Progress indicator + completion state
- ✅ Audit trail: Logged who confirmed when

---

## State Designs

### Empty State

```
┌─────────────────────────────────────┐
│     📅 No Appointments Tomorrow     │
│                                     │
│   Your schedule is clear for        │
│   [Date]. Enjoy the quiet!          │
│                                     │
│   [View Full Schedule]              │
└─────────────────────────────────────┘
```

### Loading State

```
┌─────────────────────────────────────┐
│ Tomorrow's Appointments             │
│─────────────────────────────────────│
│ ░░░░░░░░░░░░░░░░  9:00 AM          │
│ ░░░░░░░░░░░░░░░░  9:30 AM          │
│ ░░░░░░░░░░░░░░░░  10:00 AM         │
│ Loading appointments...             │
└─────────────────────────────────────┘
```

### Ideal State (Primary Design)

```
┌─────────────────────────────────────┐
│ Tomorrow's Appointments    12/18 ✓  │
│─────────────────────────────────────│
│ ⚠️ Needs Confirmation (6)           │
│─────────────────────────────────────│
│ □ Sarah Chen      9:00 AM   [Text]  │
│   Cleaning • Last: 6mo ago          │
│                                     │
│ □ Mike Johnson    9:30 AM   [Text]  │
│   Crown prep • Last: 2wk ago        │
│─────────────────────────────────────│
│ ✓ Already Confirmed (12)      [▼]   │
│─────────────────────────────────────│
│ [Select All Unconfirmed] [Send All] │
└─────────────────────────────────────┘
```

### Error State (Invalid Phone)

```
┌─────────────────────────────────────┐
│ □ Sarah Chen      9:00 AM           │
│   ⚠️ Invalid phone: (555) 000-0000  │
│   [Edit Phone] or [Mark as Called]  │
└─────────────────────────────────────┘
```

### Success State

```
┌─────────────────────────────────────┐
│ Tomorrow's Appointments    18/18 ✓  │
│─────────────────────────────────────│
│ ✅ All appointments confirmed!      │
│    Last updated: 8:45 AM            │
│                                     │
│ [View Tomorrow's Schedule]          │
└─────────────────────────────────────┘
```

---

## Implementation Notes

### FACE Layer

```typescript
// Components needed:
- AppointmentList (handles all states)
- AppointmentCard (individual item)
- ConfirmationButton (text/call toggle)
- BatchActions (select all, send all)
- PhoneEditInline (quick fix bad numbers)
- ProgressIndicator (12/18 confirmed)
```

### HEAD Layer (if AI-assisted)

```typescript
// AI could:
- Predict no-show risk (prioritize high-risk)
- Suggest optimal confirmation time
- Draft personalized messages
- Flag patients who never confirm
```

### DNA Layer

```typescript
// API needs:
- GET /appointments/tomorrow (with confirmation status)
- POST /confirmations/send-text (returns delivery status)
- PATCH /appointments/:id/confirmation (manual update)
- Webhook for delivery receipts
```

---

## Anti-Patterns Avoided

| ❌ Bad UX                      | ✅ Our Approach                      |
| ------------------------------ | ------------------------------------ |
| Show all in one flat list      | Group by status (needs action first) |
| Page reload after each confirm | Optimistic update + background sync  |
| Modal for phone edit           | Inline edit keeps context            |
| Generic "Error occurred"       | Specific "Phone invalid: (555)..."   |
| No progress indication         | "12/18 confirmed" always visible     |
| Success toast disappears       | Persistent completion state          |
