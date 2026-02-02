# Platform-Specific UX States

Different platforms have unique states beyond the standard Empty/Loading/Error/Ideal. Reference this when building for each platform.

---

## Web (face-layer, vite-frontend)

### Standard States

| State   | Trigger                  | User Sees                |
| ------- | ------------------------ | ------------------------ |
| Empty   | No data exists           | Empty illustration + CTA |
| Loading | Initial fetch            | Skeleton                 |
| Error   | API/network failed       | Error message + retry    |
| Ideal   | Data loaded              | Primary UI               |
| Offline | No connection (optional) | Banner + cached data     |

### Web-Specific Considerations

- **SEO states**: Server-rendered loading vs client loading
- **Deep linking**: Every state should be URL-addressable
- **Browser back/forward**: Preserve state on navigation
- **Tab visibility**: Pause/resume background operations

---

## Mobile (expo-supabase)

### Standard States + Mobile-Specific

| State                 | Trigger                              | User Sees                     |
| --------------------- | ------------------------------------ | ----------------------------- |
| Empty                 | No data exists                       | Empty illustration + CTA      |
| Loading               | Initial fetch                        | Skeleton                      |
| Error                 | API/network failed                   | Error message + retry         |
| Ideal                 | Data loaded                          | Primary UI                    |
| **Offline**           | No connection                        | Cached data + offline banner  |
| **Permission Denied** | Camera/location/notifications denied | Explanation + settings link   |
| **Pull to Refresh**   | User pulls down                      | Refresh indicator             |
| **Keyboard Visible**  | Input focused                        | UI adjusts, submit accessible |

### Mobile-Specific States Detail

#### Permission States

```tsx
// Camera permission flow
const states = {
  not_determined: "Request permission modal",
  denied: "Explain why needed + 'Open Settings' button",
  authorized: "Show camera",
  restricted: "Feature unavailable message",
};
```

#### Offline with Cache

```tsx
// Show stale data with freshness indicator
<View>
  <Banner type="warning">
    Showing cached data from {lastSync}. Pull to refresh.
  </Banner>
  <DataList data={cachedData} />
</View>
```

#### Background/Foreground Transitions

| Transition       | Action                         |
| ---------------- | ------------------------------ |
| App backgrounded | Pause timers, save draft state |
| App foregrounded | Refresh data, check auth       |
| App killed       | Restore from persisted state   |

#### Pull-to-Refresh

```tsx
<FlatList
  refreshControl={
    <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
  }
/>
```

---

## Telegram Mini Apps (telegram-ui)

### Standard States + Telegram-Specific

| State                    | Trigger                     | User Sees                |
| ------------------------ | --------------------------- | ------------------------ |
| Empty                    | No data exists              | Empty illustration + CTA |
| Loading                  | Initial fetch               | Skeleton                 |
| Error                    | API/network failed          | Error message + retry    |
| Ideal                    | Data loaded                 | Primary UI               |
| **MainButton Loading**   | Primary action in progress  | Button shows spinner     |
| **BackButton Visible**   | Can navigate back           | BackButton in header     |
| **Viewport Expanded**    | User expanded app           | Full-height layout       |
| **CloudStorage Syncing** | Syncing with Telegram cloud | Sync indicator           |

### Telegram-Specific States Detail

#### MainButton States

```tsx
const mainButtonStates = {
  hidden: "No primary action available",
  visible: "Primary CTA shown",
  loading: "Action in progress, button disabled + spinner",
  disabled: "Action not available (validation failed)",
};

// Implementation
useEffect(() => {
  WebApp.MainButton.setText("Continue");
  WebApp.MainButton.show();

  if (isLoading) {
    WebApp.MainButton.showProgress();
    WebApp.MainButton.disable();
  } else {
    WebApp.MainButton.hideProgress();
    WebApp.MainButton.enable();
  }
}, [isLoading]);
```

#### BackButton States

```tsx
const backButtonStates = {
  hidden: "Root screen, no back navigation",
  visible: "Can go back, BackButton shown",
};

// Show/hide based on navigation depth
useEffect(() => {
  if (canGoBack) {
    WebApp.BackButton.show();
    WebApp.BackButton.onClick(handleBack);
  } else {
    WebApp.BackButton.hide();
  }
}, [canGoBack]);
```

#### Haptic Feedback Points

| Action           | Haptic Type                       |
| ---------------- | --------------------------------- |
| Button tap       | `impactOccurred('light')`         |
| Success          | `notificationOccurred('success')` |
| Error            | `notificationOccurred('error')`   |
| Selection change | `selectionChanged()`              |

#### Viewport States

```tsx
const viewportStates = {
  collapsed: "Mini app in default height",
  expanded: "User tapped expand, full height available",
};

// Request expansion for content-heavy screens
WebApp.expand();
```

#### CloudStorage Sync

```tsx
const cloudStorageStates = {
  synced: "Local and cloud in sync",
  syncing: "Uploading changes to Telegram cloud",
  conflict: "Local and cloud differ, needs resolution",
  offline: "Can't reach Telegram servers",
};
```

---

## Discord Activities (discord-ui)

### Standard States + Discord-Specific

| State                    | Trigger                  | User Sees                |
| ------------------------ | ------------------------ | ------------------------ |
| Empty                    | No data/participants     | Waiting screen           |
| Loading                  | Initial load             | Loading indicator        |
| Error                    | SDK/API failed           | Error + retry            |
| Ideal                    | Activity running         | Game/activity UI         |
| **Waiting for Players**  | Need more participants   | Lobby with invite button |
| **Participants Changed** | User joined/left         | Updated participant list |
| **Voice Connected**      | In voice channel         | Voice indicators         |
| **Activity Minimized**   | User minimized activity  | Compact/PiP view         |
| **SDK Loading**          | Discord SDK initializing | Splash/loading screen    |

### Discord-Specific States Detail

#### SDK Initialization

```tsx
const sdkStates = {
  loading: "Show splash screen while SDK loads",
  ready: "SDK connected, show activity",
  error: "SDK failed, show error + instructions",
};

// Wait for SDK before showing activity
useEffect(() => {
  discordSdk
    .ready()
    .then(() => {
      setIsReady(true);
    })
    .catch((error) => {
      setError("Could not connect to Discord");
    });
}, []);
```

#### Participant States

```tsx
const participantStates = {
  empty: "No participants yet (just host)",
  waiting: "Need minimum players, show invite",
  ready: "Enough players, can start",
  in_progress: "Activity running",
  leaving: "Participant disconnecting",
};

// Listen for participant changes
discordSdk.subscribe("ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE", (data) => {
  setParticipants(data.participants);
});
```

#### Speaking Indicators

```tsx
interface ParticipantProps {
  user: DiscordUser;
  speaking: boolean; // From SPEAKING_START/SPEAKING_STOP events
}

// Visual indicator for speaking
<Avatar user={user} className={speaking ? "ring-2 ring-green-500" : ""} />;
```

#### Invite Flow

```tsx
// Open Discord's invite dialog
const handleInvite = async () => {
  await discordSdk.commands.openInviteDialog();
};

// UI
<Button onClick={handleInvite}>
  <Users className="h-4 w-4" />
  Invite Friends
</Button>;
```

#### Activity Minimized

When user minimizes the activity:

- Show compact view with essential info
- Pause non-essential animations
- Maintain state for restoration

---

## ChatGPT Canvas (chatgpt-ui)

### Standard States + ChatGPT-Specific

| State                 | Trigger             | User Sees               |
| --------------------- | ------------------- | ----------------------- |
| Empty                 | Fresh artifact      | Blank canvas or starter |
| Loading               | Initial render      | Loading indicator       |
| Error                 | Render/API failed   | Error message           |
| Ideal                 | Content rendered    | Interactive artifact    |
| **Tool Executing**    | GPT calling tool    | Execution indicator     |
| **Artifact Updating** | GPT updating canvas | Progress/diff view      |
| **Context Limited**   | Near token limit    | Warning indicator       |
| **Theme Changing**    | User switched theme | Smooth transition       |

### ChatGPT-Specific States Detail

#### Artifact Lifecycle

```tsx
const artifactStates = {
  initial: "First render, show starter content",
  idle: "User can interact, GPT not active",
  updating: "GPT is modifying the artifact",
  error: "Update failed, show recovery options",
};
```

#### Tool Execution States

```tsx
const toolStates = {
  idle: "No tool running",
  executing: "Tool in progress, show indicator",
  completed: "Tool finished, show result",
  failed: "Tool failed, show error + retry",
};

// Visual
{
  toolExecuting && (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      Running {toolName}...
    </div>
  );
}
```

#### Theme Support

```tsx
// Detect and respond to theme changes
const theme = document.documentElement.getAttribute("data-theme");

// CSS variables adapt automatically with:
// .dark { --background: hsl(222.2 84% 4.9%); }
// :root { --background: hsl(0 0% 100%); }
```

#### Persistence with localStorage

```tsx
// ChatGPT artifacts can persist state locally
const usePersistedState = <T,>(key: string, initial: T) => {
  const [state, setState] = useState<T>(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
};
```

#### Context Window Awareness

```tsx
// Warn user if approaching limits
const contextStates = {
  normal: "Plenty of context available",
  warning: "Approaching limit, consider clearing history",
  critical: "Near limit, some features may fail",
};
```

---

## State Checklist by Platform

### Web (face-layer, vite-frontend)

- [ ] Empty state with CTA
- [ ] Loading skeleton (not spinner)
- [ ] Error state with retry
- [ ] Ideal/happy path
- [ ] Offline handling (optional)

### Mobile (expo-supabase)

All web states plus:

- [ ] Permission denied states
- [ ] Offline with cached data
- [ ] Pull-to-refresh
- [ ] Keyboard-aware layout
- [ ] Background/foreground handling

### Telegram (telegram-ui)

All web states plus:

- [ ] MainButton loading state
- [ ] BackButton visibility
- [ ] Haptic feedback integration
- [ ] Viewport expand/collapse
- [ ] CloudStorage sync state

### Discord (discord-ui)

All web states plus:

- [ ] SDK initialization
- [ ] Waiting for players
- [ ] Participant join/leave
- [ ] Speaking indicators
- [ ] Activity minimized view

### ChatGPT (chatgpt-ui)

All web states plus:

- [ ] Tool execution indicator
- [ ] Artifact updating state
- [ ] Theme-aware styling
- [ ] localStorage persistence
- [ ] Context window awareness
