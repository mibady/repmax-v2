# Telegram Mini App SDK

## Initialization

```html
<script src="https://telegram.org/js/telegram-web-app.js?59"></script>
```

Or modern SDK:

```bash
npm install @telegram-apps/sdk
```

```typescript
import { init, retrieveLaunchParams } from "@telegram-apps/sdk";
init();
const { initData, themeParams, startParam } = retrieveLaunchParams();
```

## Lifecycle

```typescript
Telegram.WebApp.ready(); // Signal UI ready
Telegram.WebApp.expand(); // Full height
Telegram.WebApp.close(); // Close app
```

## User Data

```typescript
const user = Telegram.WebApp.initDataUnsafe.user;
// { id, first_name, last_name, username, language_code, is_premium }

// Validate on server with initData hash
```

## Theme

```typescript
const theme = Telegram.WebApp.themeParams
// { bg_color, text_color, hint_color, link_color, button_color, button_text_color }

// Listen for changes
Telegram.WebApp.onEvent('themeChanged', () => { ... })
```

## Main Button

```typescript
const btn = Telegram.WebApp.MainButton
btn.setText('Continue')
btn.show()
btn.onClick(() => { ... })
btn.showProgress()
btn.hideProgress()
btn.hide()
```

## Back Button

```typescript
Telegram.WebApp.BackButton.show()
Telegram.WebApp.BackButton.onClick(() => { ... })
```

## Haptics

```typescript
Telegram.WebApp.HapticFeedback.impactOccurred("medium"); // light, medium, heavy
Telegram.WebApp.HapticFeedback.notificationOccurred("success"); // error, success, warning
Telegram.WebApp.HapticFeedback.selectionChanged();
```

## Full Screen (Bot API 8.0+)

```typescript
Telegram.WebApp.requestFullscreen();
Telegram.WebApp.exitFullscreen();
Telegram.WebApp.lockOrientation(); // portrait, landscape
```

## Launch Methods

| Method          | Use Case         |
| --------------- | ---------------- |
| Keyboard button | Quick access     |
| Inline button   | In-chat launch   |
| Bot menu        | Main entry point |
| Direct link     | t.me/bot/app     |
| Attachment menu | Media actions    |
