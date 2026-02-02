# Mobile App Architecture PRP - Caregiving Companion Native Apps

## Goal

Establish a comprehensive mobile app architecture using React Native and Expo to deliver native Android and iOS applications that provide a Pi.ai-like conversational experience with full voice capabilities, offline support, and seamless synchronization with the web platform.

## Why

- **Native Performance**: Deliver smooth, responsive experiences with 60fps animations
- **App Store Presence**: Reach users through Google Play and Apple App Store
- **Device Integration**: Access native features like contacts, calendar, biometrics
- **Offline-First**: Continue functioning without internet connection
- **Background Processing**: Run voice recognition and notifications in background
- **Platform-Specific UX**: Honor iOS and Android design guidelines

## What (User-Visible Behavior)

- **Instant Launch**: App opens in < 2 seconds with cached conversation
- **Voice-First Interface**: Always-listening mode with wake word detection
- **Seamless Sync**: Conversations sync across web, iOS, and Android
- **Native Notifications**: Rich push notifications with quick actions
- **Biometric Security**: Face ID/Touch ID for sensitive data
- **Offline Mode**: Full functionality without internet (sync when connected)

## All Needed Context

### Documentation References

- React Native: https://reactnative.dev/docs/getting-started
- Expo Documentation: https://docs.expo.dev/
- React Native Voice: https://github.com/react-native-voice/voice
- React Native Navigation: https://reactnavigation.org/docs/getting-started
- AsyncStorage: https://react-native-async-storage.github.io/async-storage/
- React Native Reanimated: https://docs.swmansion.com/react-native-reanimated/
- Notifee (Notifications): https://notifee.app/react-native/docs/overview

### Technology Stack

```json
{
  "framework": "React Native 0.73+",
  "platform": "Expo SDK 50",
  "navigation": "React Navigation 6",
  "state": "Zustand + React Query",
  "voice": "React Native Voice + Expo Audio",
  "storage": "AsyncStorage + SQLite",
  "animations": "Reanimated 3",
  "testing": "Jest + Detox"
}
```

### Package Dependencies

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-dev-client": "~3.3.0",
    "react": "18.2.0",
    "react-native": "0.73.0",

    "// Navigation": "",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "@react-navigation/stack": "^6.3.0",
    "@react-navigation/drawer": "^6.6.0",

    "// UI Components": "",
    "react-native-elements": "^3.4.3",
    "react-native-paper": "^5.11.0",
    "react-native-vector-icons": "^10.0.0",
    "react-native-gesture-handler": "~2.14.0",
    "react-native-reanimated": "~3.6.0",
    "react-native-safe-area-context": "4.8.0",
    "react-native-screens": "~3.29.0",

    "// Voice & Audio": "",
    "@react-native-voice/voice": "^3.2.4",
    "expo-av": "~13.10.0",
    "expo-speech": "~11.7.0",

    "// Storage & State": "",
    "@react-native-async-storage/async-storage": "1.21.0",
    "expo-sqlite": "~11.9.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",

    "// Notifications": "",
    "expo-notifications": "~0.27.0",
    "@notifee/react-native": "^7.8.0",
    "expo-task-manager": "~11.7.0",
    "expo-background-fetch": "~11.7.0",

    "// Device Features": "",
    "expo-contacts": "~12.8.0",
    "expo-calendar": "~12.2.0",
    "expo-local-authentication": "~13.8.0",
    "expo-haptics": "~12.8.0",
    "expo-sensors": "~12.9.0",

    "// Networking": "",
    "axios": "^1.6.0",
    "socket.io-client": "^4.6.0",
    "@supabase/supabase-js": "^2.39.0",

    "// Development": "",
    "expo-updates": "~0.24.0",
    "react-native-dotenv": "^3.4.0",
    "flipper-plugin-react-query-devtools": "^1.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.0",
    "@types/react-native": "~0.73.0",
    "typescript": "^5.3.0",
    "jest": "^29.7.0",
    "detox": "^20.14.0",
    "@testing-library/react-native": "^12.4.0"
  }
}
```

## Implementation Blueprint

### 1. Project Structure

```
caregiving-companion-mobile/
├── src/
│   ├── app/                    # App entry points
│   │   ├── _layout.tsx         # Root layout with providers
│   │   ├── (auth)/            # Authentication screens
│   │   ├── (tabs)/            # Main tab navigation
│   │   │   ├── chat.tsx       # Chat/voice interface
│   │   │   ├── dashboard.tsx  # Care dashboard
│   │   │   ├── health.tsx     # Health tracking
│   │   │   └── profile.tsx    # Settings/profile
│   │   └── (modals)/          # Modal screens
│   ├── components/
│   │   ├── ui/                # Shared UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   ├── voice/             # Voice components
│   │   │   ├── VoiceButton.tsx
│   │   │   ├── WaveformVisualizer.tsx
│   │   │   └── TranscriptDisplay.tsx
│   │   ├── chat/              # Chat components
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── MessageList.tsx
│   │   │   └── InputBar.tsx
│   │   └── shared/            # Shared components
│   ├── hooks/
│   │   ├── useVoice.ts       # Voice recognition hook
│   │   ├── useChat.ts        # Chat functionality
│   │   ├── useOffline.ts     # Offline detection
│   │   └── useNotifications.ts
│   ├── services/
│   │   ├── api/               # API clients
│   │   ├── voice/             # Voice services
│   │   ├── storage/           # Local storage
│   │   └── sync/              # Sync engine
│   ├── stores/
│   │   ├── chatStore.ts      # Chat state
│   │   ├── voiceStore.ts     # Voice state
│   │   └── userStore.ts      # User state
│   ├── utils/
│   │   ├── platform.ts       # Platform-specific code
│   │   ├── permissions.ts    # Permission handling
│   │   └── constants.ts
│   └── types/
├── android/                    # Android-specific code
├── ios/                       # iOS-specific code
├── assets/                    # Images, fonts, sounds
├── app.json                   # Expo configuration
├── babel.config.js
├── metro.config.js
├── tsconfig.json
└── package.json
```

### 2. Core App Component (src/app/\_layout.tsx)

```tsx
import { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { VoiceProvider } from "@/providers/VoiceProvider";
import { NotificationProvider } from "@/providers/NotificationProvider";
import { OfflineManager } from "@/services/sync/OfflineManager";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    // Initialize offline manager
    OfflineManager.initialize();

    // Hide splash screen
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <VoiceProvider>
                <NotificationProvider>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      animation: "slide_from_right",
                    }}
                  >
                    <Stack.Screen
                      name="(tabs)"
                      options={{ animation: "none" }}
                    />
                    <Stack.Screen
                      name="(auth)"
                      options={{ animation: "slide_from_bottom" }}
                    />
                    <Stack.Screen
                      name="(modals)"
                      options={{
                        presentation: "modal",
                        animation: "slide_from_bottom",
                      }}
                    />
                  </Stack>
                </NotificationProvider>
              </VoiceProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

### 3. Voice Interface Component (src/components/voice/VoiceInterface.tsx)

```tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from "react-native";
import Voice from "@react-native-voice/voice";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useVoiceStore } from "@/stores/voiceStore";
import { WaveformVisualizer } from "./WaveformVisualizer";
import Haptics from "expo-haptics";

export function VoiceInterface() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { sendVoiceMessage, playResponse } = useVoiceStore();

  useEffect(() => {
    // Configure audio session for voice
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    // Set up voice recognition handlers
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechError = onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = () => {
    console.log("Speech recognition started");
    startPulseAnimation();
  };

  const onSpeechEnd = () => {
    console.log("Speech recognition ended");
    stopPulseAnimation();
  };

  const onSpeechResults = async (e: any) => {
    const text = e.value[0];
    setTranscript(text);

    // Send to AI and get response
    const response = await sendVoiceMessage(text);

    // Play AI response with TTS
    await playResponse(response);
  };

  const onSpeechPartialResults = (e: any) => {
    setTranscript(e.value[0]);
  };

  const onSpeechError = (e: any) => {
    console.error("Speech recognition error:", e);
    setIsListening(false);
    stopPulseAnimation();
  };

  const startListening = async () => {
    try {
      await Voice.start("en-US");
      setIsListening(true);

      // Haptic feedback
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error("Failed to start voice recognition:", error);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.error("Failed to stop voice recognition:", error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  return (
    <View style={styles.container}>
      {isListening && <WaveformVisualizer isActive={isListening} />}

      <Animated.View
        style={[
          styles.micButton,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={isListening ? stopListening : startListening}
          style={[styles.button, isListening && styles.buttonActive]}
        >
          <Ionicons
            name={isListening ? "mic" : "mic-outline"}
            size={32}
            color="white"
          />
        </TouchableOpacity>
      </Animated.View>

      {transcript !== "" && (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  micButton: {
    marginVertical: 30,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonActive: {
    backgroundColor: "#EF4444",
  },
  transcriptContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    maxWidth: "90%",
  },
  transcriptText: {
    fontSize: 16,
    color: "#1F2937",
    textAlign: "center",
  },
});
```

### 4. Offline Sync Manager (src/services/sync/OfflineManager.ts)

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { supabase } from "@/services/api/supabase";
import * as SQLite from "expo-sqlite";

interface SyncQueue {
  id: string;
  type: "create" | "update" | "delete";
  table: string;
  data: any;
  timestamp: number;
}

class OfflineManager {
  private db: SQLite.Database;
  private isOnline: boolean = true;
  private syncQueue: SyncQueue[] = [];

  async initialize() {
    // Open SQLite database for offline storage
    this.db = SQLite.openDatabase("caregiving_companion.db");

    // Create tables for offline storage
    await this.createOfflineTables();

    // Monitor network status
    NetInfo.addEventListener((state) => {
      this.handleConnectivityChange(state.isConnected ?? false);
    });

    // Load pending sync items
    await this.loadSyncQueue();
  }

  private async createOfflineTables() {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          // Conversations table
          tx.executeSql(`
          CREATE TABLE IF NOT EXISTS conversations (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            messages TEXT,
            created_at INTEGER,
            updated_at INTEGER,
            synced INTEGER DEFAULT 0
          )
        `);

          // Medications table
          tx.executeSql(`
          CREATE TABLE IF NOT EXISTS medications (
            id TEXT PRIMARY KEY,
            name TEXT,
            dosage TEXT,
            frequency TEXT,
            times TEXT,
            synced INTEGER DEFAULT 0
          )
        `);

          // Sync queue table
          tx.executeSql(`
          CREATE TABLE IF NOT EXISTS sync_queue (
            id TEXT PRIMARY KEY,
            type TEXT,
            table_name TEXT,
            data TEXT,
            timestamp INTEGER
          )
        `);
        },
        reject,
        resolve,
      );
    });
  }

  private async handleConnectivityChange(isConnected: boolean) {
    this.isOnline = isConnected;

    if (isConnected) {
      // Sync pending changes when coming online
      await this.syncPendingChanges();
    }
  }

  async saveOffline(
    table: string,
    data: any,
    operation: "create" | "update" | "delete",
  ) {
    const id = data.id || this.generateId();

    // Save to SQLite
    await this.saveToSQLite(table, { ...data, id });

    // Add to sync queue
    const syncItem: SyncQueue = {
      id: this.generateId(),
      type: operation,
      table,
      data: { ...data, id },
      timestamp: Date.now(),
    };

    this.syncQueue.push(syncItem);
    await this.saveSyncQueue();

    // Try to sync immediately if online
    if (this.isOnline) {
      await this.syncItem(syncItem);
    }

    return id;
  }

  private async syncPendingChanges() {
    const pending = [...this.syncQueue];

    for (const item of pending) {
      try {
        await this.syncItem(item);

        // Remove from queue on success
        this.syncQueue = this.syncQueue.filter((i) => i.id !== item.id);
        await this.saveSyncQueue();
      } catch (error) {
        console.error("Sync failed for item:", item.id, error);
      }
    }
  }

  private async syncItem(item: SyncQueue) {
    switch (item.type) {
      case "create":
        await supabase.from(item.table).insert(item.data);
        break;
      case "update":
        await supabase
          .from(item.table)
          .update(item.data)
          .eq("id", item.data.id);
        break;
      case "delete":
        await supabase.from(item.table).delete().eq("id", item.data.id);
        break;
    }
  }

  private async saveToSQLite(table: string, data: any) {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        const columns = Object.keys(data).join(", ");
        const placeholders = Object.keys(data)
          .map(() => "?")
          .join(", ");
        const values = Object.values(data);

        tx.executeSql(
          `INSERT OR REPLACE INTO ${table} (${columns}) VALUES (${placeholders})`,
          values,
          (_, result) => resolve(result),
          (_, error) => {
            reject(error);
            return false;
          },
        );
      });
    });
  }

  private async loadSyncQueue() {
    const stored = await AsyncStorage.getItem("sync_queue");
    if (stored) {
      this.syncQueue = JSON.parse(stored);
    }
  }

  private async saveSyncQueue() {
    await AsyncStorage.setItem("sync_queue", JSON.stringify(this.syncQueue));
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getOfflineData(table: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM ${table} ORDER BY updated_at DESC`,
          [],
          (_, result) => {
            const rows = result.rows._array;
            resolve(rows);
          },
          (_, error) => {
            reject(error);
            return false;
          },
        );
      });
    });
  }
}

export default new OfflineManager();
```

### 5. Platform-Specific Configuration

#### iOS Configuration (ios/Info.plist additions)

```xml
<key>NSMicrophoneUsageDescription</key>
<string>The app needs microphone access for voice commands and calls</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>The app uses speech recognition to transcribe your voice</string>
<key>NSContactsUsageDescription</key>
<string>The app needs contacts access to help coordinate care</string>
<key>NSCalendarsUsageDescription</key>
<string>The app needs calendar access to schedule appointments</string>
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
  <string>voip</string>
  <string>fetch</string>
  <string>remote-notification</string>
</array>
```

#### Android Configuration (android/app/src/main/AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.READ_CONTACTS" />
<uses-permission android:name="android.permission.READ_CALENDAR" />
<uses-permission android:name="android.permission.WRITE_CALENDAR" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

<application>
  <service
    android:name=".VoiceRecognitionService"
    android:foregroundServiceType="microphone"
    android:exported="false" />
</application>
```

## Task Checklist

### Initial Setup

- [ ] Initialize Expo project with TypeScript template
- [ ] Install all dependencies from package.json
- [ ] Configure Expo plugins for native modules
- [ ] Set up development builds for iOS and Android
- [ ] Configure environment variables

### Core Architecture

- [ ] Implement navigation structure with React Navigation
- [ ] Set up state management with Zustand
- [ ] Configure React Query for API calls
- [ ] Implement offline storage with SQLite
- [ ] Create sync manager for offline support

### Voice Integration

- [ ] Integrate React Native Voice for speech recognition
- [ ] Implement Expo Audio for TTS playback
- [ ] Create wake word detection system
- [ ] Build voice activity detection
- [ ] Implement noise cancellation

### UI Components

- [ ] Port web components to React Native
- [ ] Create platform-specific components
- [ ] Implement gesture handlers
- [ ] Add animations with Reanimated
- [ ] Build accessibility features

### Platform Features

- [ ] Configure push notifications
- [ ] Implement biometric authentication
- [ ] Add contact integration
- [ ] Set up calendar sync
- [ ] Configure background tasks

### Testing & Deployment

- [ ] Set up unit tests with Jest
- [ ] Configure E2E tests with Detox
- [ ] Implement crash reporting
- [ ] Set up CI/CD pipeline
- [ ] Configure OTA updates

## Validation Loop

### Level 1: Component Testing

```bash
# Run unit tests
npm test

# Test voice components
npm test -- --testPathPattern=voice

# Test offline sync
npm test -- --testPathPattern=sync
```

### Level 2: Platform Testing

```bash
# iOS simulator testing
npm run ios

# Android emulator testing
npm run android

# Device testing with Expo Go
npx expo start
```

### Level 3: E2E Testing

```bash
# Run Detox tests on iOS
detox test --configuration ios

# Run Detox tests on Android
detox test --configuration android
```

### Level 4: Performance Testing

```bash
# Bundle size analysis
npx expo export --analyze

# Performance profiling
npx react-native-performance
```

## Success Metrics

- [ ] App launches in < 2 seconds
- [ ] Voice recognition accuracy > 95%
- [ ] Offline mode fully functional
- [ ] 60fps animations throughout
- [ ] < 50MB initial download size
- [ ] Push notifications delivered < 5s
- [ ] Sync completes in < 3s on reconnection

## Common Gotchas

- React Native Voice requires specific iOS audio session configuration
- Android background services need special permissions post Android 12
- Expo managed workflow limits some native module access
- iOS App Store requires detailed permission explanations
- SQLite performance degrades with large datasets
- Push notification tokens expire and need refresh
- Background fetch has platform-specific limitations
