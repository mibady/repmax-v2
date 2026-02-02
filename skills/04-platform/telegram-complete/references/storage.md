# Telegram Storage

## Comparison

| Feature              | CloudStorage | DeviceStorage | SecureStorage |
| -------------------- | ------------ | ------------- | ------------- |
| Syncs Across Devices | ✅           | ❌            | ❌            |
| Encrypted            | ✅           | ❌            | ✅ (Keychain) |
| Max Keys             | 1,024        | Unlimited     | 10            |
| Max Value Size       | 4KB          | 5MB           | 5MB           |
| Bot API              | 6.9+         | 9.0+          | 9.0+          |
| Use Case             | Settings     | Cache         | Tokens        |

## Cloud Storage

Syncs across devices. Perfect for preferences.

```typescript
const storage = Telegram.WebApp.CloudStorage;

// Set
storage.setItem("theme", "dark", (err, stored) => {
  if (stored) console.log("Saved");
});

// Get
storage.getItem("theme", (err, value) => {
  console.log("Theme:", value);
});

// Get multiple
storage.getItems(["theme", "lang"], (err, values) => {
  // values = { theme: 'dark', lang: 'en' }
});

// Remove
storage.removeItem("theme", (err, removed) => {});

// Get all keys
storage.getKeys((err, keys) => {
  console.log("Keys:", keys);
});
```

## Device Storage (Bot API 9.0+)

Local storage for larger data. Does not sync.

```typescript
const storage = Telegram.WebApp.DeviceStorage;

// Same API as CloudStorage
storage.setItem("cache", largeData, callback);
storage.getItem("cache", callback);
```

## Secure Storage (Bot API 9.0+)

Encrypted storage for sensitive data. Uses iOS Keychain / Android Keystore.

```typescript
const secure = Telegram.WebApp.SecureStorage;

// Store token
secure.setItem("auth_token", token, (err, stored) => {
  if (stored) console.log("Token secured");
});

// Retrieve (may require biometrics)
secure.getItem("auth_token", (err, value) => {
  if (value) useToken(value);
});

// Restore after reinstall (prompts biometrics)
secure.restoreItem("auth_token", (err, value) => {
  if (value) console.log("Restored:", value);
});
```

## Best Practices

- Use CloudStorage for user preferences
- Use DeviceStorage for cached data
- Use SecureStorage for auth tokens only
- Handle errors gracefully (storage may fail)
- Check API version before using newer storage
