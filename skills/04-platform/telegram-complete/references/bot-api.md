# Telegram Bot API

## Getting Started

1. Message [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Choose name and username (must end in `bot`)
4. Receive token: `110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw`

## API Endpoint

```
https://api.telegram.org/bot<token>/METHOD_NAME
```

## Sending Messages

```typescript
// Text
await fetch(`${API}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    chat_id: 123456789,
    text: "Hello!",
    parse_mode: "HTML", // or 'MarkdownV2'
  }),
});

// Photo
const form = new FormData();
form.append("chat_id", "123456789");
form.append("photo", file);
await fetch(`${API}/sendPhoto`, { method: "POST", body: form });
```

## Receiving Updates

### Webhooks (Recommended)

```typescript
// Set webhook
await fetch(`${API}/setWebhook`, {
  method: "POST",
  body: JSON.stringify({ url: "https://your-server.com/webhook" }),
});

// Handle updates
app.post("/webhook", (req, res) => {
  const update = req.body;
  // Process update.message, update.callback_query, etc.
  res.sendStatus(200);
});
```

### Long Polling

```typescript
async function poll(offset = 0) {
  const res = await fetch(`${API}/getUpdates?offset=${offset}&timeout=30`);
  const { result } = await res.json();
  for (const update of result) {
    // Process update
    offset = update.update_id + 1;
  }
  poll(offset);
}
```

## Commands

```typescript
// Register commands
await fetch(`${API}/setMyCommands`, {
  method: "POST",
  body: JSON.stringify({
    commands: [
      { command: "start", description: "Start the bot" },
      { command: "help", description: "Show help" },
    ],
  }),
});
```

## Keyboards

### Reply Keyboard

```typescript
{
  reply_markup: {
    keyboard: [[{ text: 'Option 1' }, { text: 'Option 2' }]],
    resize_keyboard: true,
    one_time_keyboard: true
  }
}
```

### Inline Keyboard

```typescript
{
  reply_markup: {
    inline_keyboard: [
      [
        { text: "Click", callback_data: "action_1" },
        { text: "Link", url: "https://example.com" },
      ],
    ];
  }
}
```

## Callback Queries

```typescript
// Answer callback
await fetch(`${API}/answerCallbackQuery`, {
  method: "POST",
  body: JSON.stringify({
    callback_query_id: query.id,
    text: "Done!",
    show_alert: false,
  }),
});
```

## Inline Mode

```typescript
// Answer inline query
await fetch(`${API}/answerInlineQuery`, {
  method: "POST",
  body: JSON.stringify({
    inline_query_id: query.id,
    results: [
      {
        type: "article",
        id: "1",
        title: "Result",
        input_message_content: { message_text: "Selected!" },
      },
    ],
  }),
});
```
