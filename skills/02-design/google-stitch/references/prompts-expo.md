# Stitch Prompts - Expo

Templates for Expo mobile applications.

## Output Target

- React Native components
- Expo Router navigation
- NativeWind (Tailwind for RN)
- Native UI patterns

## Template

```markdown
## Screen: [ScreenName]

**Framework target:** Expo with NativeWind

**Purpose:** [Screen purpose]

**Navigation:** Tab / Stack / Modal

**Layout:**

- SafeAreaView wrapper
- [Platform-specific considerations]

**Components:**

- [React Native components]
- [Expo components if needed]

**Copy:**

- [All text content]

**Platform differences:**

- iOS: [iOS-specific UI]
- Android: [Android-specific UI]

**States:**

- Loading: ActivityIndicator
- Error: Alert or inline error
- Success: [Normal state]
```

## Mobile Considerations

- Touch targets minimum 44x44 points
- Safe area insets for notches
- Keyboard avoiding views for forms
- Platform-specific navigation patterns
- Haptic feedback for actions
