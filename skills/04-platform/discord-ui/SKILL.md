---
name: discord-ui
description: Theme-aware UI components matching Discord's design language. Use when building user interfaces for Discord Activities or bots.
version: 1.0.0
---

# Discord UI Components Skill

Build interfaces that match Discord's visual design.

## Color System

### Background Colors

| Variable | Dark | Light | Usage |
|----------|------|-------|-------|
| `--discord-bg-primary` | #313338 | #ffffff | Main background |
| `--discord-bg-secondary` | #2b2d31 | #f2f3f5 | Cards, sidebars |
| `--discord-bg-tertiary` | #1e1f22 | #e3e5e8 | Headers, inputs |
| `--discord-bg-floating` | #232428 | #ffffff | Modals, tooltips |

### Text Colors

| Variable | Dark | Light | Usage |
|----------|------|-------|-------|
| `--discord-text-normal` | #dbdee1 | #313338 | Primary text |
| `--discord-text-muted` | #949ba4 | #5c5e66 | Secondary text |
| `--discord-text-link` | #00a8fc | #006ce7 | Links |

### Brand Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--discord-blurple` | #5865f2 | Primary buttons, accents |
| `--discord-green` | #23a55a | Success, online status |
| `--discord-yellow` | #f0b232 | Warnings, idle status |
| `--discord-red` | #f23f43 | Errors, danger, DND |
| `--discord-fuchsia` | #eb459f | Special accents |

### Status Colors

| Status | Color | Variable |
|--------|-------|----------|
| Online | #23a55a | `--discord-status-online` |
| Idle | #f0b232 | `--discord-status-idle` |
| DND | #f23f43 | `--discord-status-dnd` |
| Offline | #80848e | `--discord-status-offline` |

---

## Button Component

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
}

function Button({ variant = 'primary', size = 'md', children, ...props }) {
  const variants = {
    primary: 'bg-[var(--discord-blurple)] hover:bg-[#4752c4] text-white',
    secondary: 'bg-[#4e5058] hover:bg-[#686d73] text-white',
    success: 'bg-[var(--discord-green)] hover:bg-[#1a7d43] text-white',
    danger: 'bg-[var(--discord-red)] hover:bg-[#da373c] text-white',
    link: 'bg-transparent hover:underline text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[38px]',
    lg: 'px-6 py-2.5 text-base min-h-[44px]',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'rounded-[3px] font-medium',
        'transition-colors active:translate-y-px',
        'disabled:opacity-50',
        variants[variant],
        sizes[size]
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

---

## Avatar Component

```tsx
interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'idle' | 'dnd' | 'offline';
  speaking?: boolean;
}

function Avatar({ src, name, size = 'md', status, speaking }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  const statusColors = {
    online: 'bg-[var(--discord-status-online)]',
    idle: 'bg-[var(--discord-status-idle)]',
    dnd: 'bg-[var(--discord-status-dnd)]',
    offline: 'bg-[var(--discord-status-offline)]',
  };

  return (
    <div className="relative inline-block">
      <div className={cn(
        'rounded-full overflow-hidden bg-[var(--discord-blurple)]',
        sizes[size],
        speaking && 'ring-2 ring-[var(--discord-green)] ring-offset-2 ring-offset-[var(--discord-bg-primary)]'
      )}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-white font-semibold">
            {name?.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      {status && (
        <div className={cn(
          'absolute bottom-0 right-0 rounded-full border-[3px]',
          'border-[var(--discord-bg-primary)]',
          statusColors[status],
          size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'
        )} />
      )}
    </div>
  );
}
```

---

## Card Component

```tsx
function Card({ children, elevated, onClick }) {
  return (
    <div className={cn(
      'rounded-lg p-4',
      elevated 
        ? 'bg-[var(--discord-bg-floating)] shadow-[0_8px_16px_rgba(0,0,0,0.24)]'
        : 'bg-[var(--discord-bg-secondary)]',
      onClick && 'cursor-pointer hover:brightness-110 transition-all'
    )}>
      {children}
    </div>
  );
}
```

---

## Input Component

```tsx
function Input({ label, error, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wide text-[var(--discord-text-muted)] mb-2">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2.5 rounded-[3px]',
          'bg-[var(--discord-input-bg)] text-[var(--discord-text-normal)]',
          'border-none outline-none',
          'placeholder:text-[var(--discord-text-muted)]',
          error && 'ring-2 ring-[var(--discord-red)]'
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-[var(--discord-red)] mt-1">{error}</p>
      )}
    </div>
  );
}
```

---

## Speaking Indicator

```tsx
function SpeakingRing({ speaking, children }) {
  return (
    <div className={cn(
      speaking && [
        'ring-2 ring-[var(--discord-green)]',
        'ring-offset-2 ring-offset-[var(--discord-bg-primary)]',
        'animate-[speaking_1s_ease-in-out_infinite]'
      ]
    )}>
      {children}
    </div>
  );
}

// CSS animation
@keyframes speaking {
  0%, 100% { box-shadow: 0 0 0 0 rgba(35, 165, 90, 0.4); }
  50% { box-shadow: 0 0 0 4px rgba(35, 165, 90, 0.2); }
}
```

---

## User Card

```tsx
function UserCard({ name, avatarUrl, status, subtitle, speaking, onClick }) {
  return (
    <Card onClick={onClick}>
      <div className="flex items-center gap-3">
        <Avatar 
          src={avatarUrl} 
          name={name} 
          status={status} 
          speaking={speaking} 
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{name}</p>
          {subtitle && (
            <p className="text-sm text-[var(--discord-text-muted)] truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
```

---

## Participant Grid

```tsx
function ParticipantGrid({ participants, maxVisible = 8 }) {
  const visible = participants.slice(0, maxVisible);
  const remaining = participants.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {visible.map(p => (
        <div key={p.id} className="flex flex-col items-center gap-1">
          <Avatar 
            src={p.avatarUrl} 
            name={p.name} 
            size="lg" 
            speaking={p.speaking} 
          />
          <span className="text-xs text-[var(--discord-text-muted)] truncate max-w-[80px]">
            {p.name}
          </span>
        </div>
      ))}
      {remaining > 0 && (
        <div className="flex flex-col items-center gap-1">
          <div className="w-20 h-20 rounded-full bg-[var(--discord-bg-secondary)] flex items-center justify-center">
            <span className="text-lg font-semibold">+{remaining}</span>
          </div>
          <span className="text-xs text-[var(--discord-text-muted)]">more</span>
        </div>
      )}
    </div>
  );
}
```

---

## Typography

Discord uses specific typography patterns:

```css
/* Font family */
font-family: 'gg sans', 'Noto Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;

/* Headers */
.header-lg { font-size: 20px; font-weight: 600; line-height: 24px; }
.header-md { font-size: 16px; font-weight: 600; line-height: 20px; }
.header-sm { font-size: 12px; font-weight: 700; line-height: 16px; text-transform: uppercase; }

/* Body */
.body-md { font-size: 16px; line-height: 20px; }
.body-sm { font-size: 14px; line-height: 18px; }

/* Muted */
.text-muted { color: var(--discord-text-muted); }
```

---

## Spacing & Borders

| Use Case | Value |
|----------|-------|
| Card padding | 16px |
| Card border radius | 8px |
| Button border radius | 3px |
| Avatar border radius | 50% |
| Gap between elements | 12px |

---

## Best Practices

1. **Use CSS variables** - Never hardcode colors
2. **Support dark theme** - Discord is dark-first
3. **Match button styles** - Use 3px border radius
4. **Speaking indicators** - Green ring with pulse animation
5. **Status indicators** - Position at bottom-right of avatars
6. **Font** - Use gg sans or fallbacks
