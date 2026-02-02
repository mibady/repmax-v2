---
name: telegram-complete
description: Complete Telegram development including Mini Apps (TWA SDK, full-screen, sensors, biometrics, storage) and Bot API (commands, keyboards, inline mode, payments). Use for any Telegram bot or Mini App development. Triggers on "telegram bot", "telegram mini app", "telegram webapp", "telegram payments", "telegram stars", "TWA SDK".
---

# Telegram Development

Complete guide for Telegram Bots and Mini Apps.

## Quick Links

| Topic                | Reference                     |
| -------------------- | ----------------------------- |
| Mini App SDK         | `references/miniapp-sdk.md`   |
| Bot API              | `references/bot-api.md`       |
| Payments & Stars     | `references/payments.md`      |
| Storage Options      | `references/storage.md`       |
| UI Components        | `references/ui-components.md` |
| Sensors & Biometrics | `references/sensors.md`       |

## Mini Apps Quick Start

```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

```typescript
// Initialize
Telegram.WebApp.ready();
Telegram.WebApp.expand();

// User data
const { initData, themeParams } = Telegram.WebApp;

// Main button
Telegram.WebApp.MainButton.setText("Continue").show();
```

## Bot Quick Start

```typescript
// Create bot with @BotFather
// Token: 110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw

const API = `https://api.telegram.org/bot${TOKEN}`;

// Send message
await fetch(`${API}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ chat_id, text: "Hello!" }),
});
```

## Payments (Stars)

```typescript
// Create invoice for digital goods
const invoice = await bot.createInvoiceLink({
  title: "Premium Access",
  description: "Unlock features",
  payload: JSON.stringify({ type: "premium", userId }),
  provider_token: "", // Empty for Stars
  currency: "XTR",
  prices: [{ label: "Premium", amount: 100 }], // 100 Stars
});
```

## Storage Comparison

| Feature   | CloudStorage | DeviceStorage | SecureStorage |
| --------- | ------------ | ------------- | ------------- |
| Syncs     | ✅           | ❌            | ❌            |
| Encrypted | ✅           | ❌            | ✅            |
| Max Size  | 4KB/key      | 5MB           | 5MB           |
| Use Case  | Settings     | Cache         | Tokens        |

## UI Components

```tsx
import { AppRoot, List, Cell, Button } from "@telegram-apps/telegram-ui";

<AppRoot>
  <List>
    <Cell onClick={handler}>{item.name}</Cell>
  </List>
  <Button onClick={submit}>Submit</Button>
</AppRoot>;
```

## Sensors (Bot API 8.0+)

```typescript
// Accelerometer
Telegram.WebApp.Accelerometer.start({ refresh_rate: 50 });
Telegram.WebApp.onEvent("accelerometerChanged", () => {
  const { x, y, z } = Telegram.WebApp.Accelerometer;
});

// Biometrics
Telegram.WebApp.BiometricManager.init();
Telegram.WebApp.BiometricManager.authenticate({ reason: "Verify identity" });
```

## Best Practices

- Always call `ready()` when UI loads
- Use `themeParams` for colors
- Handle safe areas on mobile
- Test in both iOS and Android
- Support light/dark themes
