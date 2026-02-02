# Mobile Voice Integration PRP - Native Voice Experience

## Goal

Implement comprehensive voice capabilities across mobile platforms that deliver a Pi.ai-like conversational experience with always-listening wake word detection, background voice processing, seamless handoff between app states, and deep integration with device assistants (Siri, Google Assistant).

## Why

- **Always Available**: Voice companion accessible even when app is closed
- **Natural Interaction**: Wake word detection like "Hey Sarah" for hands-free
- **Platform Integration**: Works with Siri Shortcuts and Google Assistant
- **Background Processing**: Continues conversations during other tasks
- **Low Latency**: < 500ms response time for natural conversation flow
- **Offline Capability**: Basic voice commands work without internet

## What (User-Visible Behavior)

- **Wake Word Detection**: "Hey Sarah" activates from any screen
- **Background Listening**: Continues hearing while using other apps
- **Assistant Integration**: "Hey Siri, ask Sarah about Mom's medications"
- **Voice Shortcuts**: Custom phrases trigger complex actions
- **Live Transcription**: See words appear as you speak
- **Voice Profiles**: Recognizes different family members
- **Noise Cancellation**: Works in noisy environments

## All Needed Context

### Documentation References

- React Native Voice: https://github.com/react-native-voice/voice
- Expo Audio: https://docs.expo.dev/versions/latest/sdk/audio/
- iOS Speech Framework: https://developer.apple.com/documentation/speech
- Android SpeechRecognizer: https://developer.android.com/reference/android/speech/SpeechRecognizer
- WebRTC: https://webrtc.org/native-code/ios/
- Porcupine Wake Word: https://picovoice.ai/platform/porcupine/

### Critical Dependencies

```json
{
  "dependencies": {
    "@react-native-voice/voice": "^3.2.4",
    "expo-av": "~13.10.0",
    "expo-speech": "~11.7.0",
    "@picovoice/porcupine-react-native": "^3.0.0",
    "@picovoice/rhino-react-native": "^3.0.0",
    "react-native-webrtc": "^118.0.0",
    "react-native-background-actions": "^3.0.0",
    "react-native-sound": "^0.11.2",
    "@shopify/react-native-skia": "^0.1.0"
  }
}
```

## Implementation Blueprint

### 1. Wake Word Detection Service (src/services/voice/WakeWordService.ts)

```typescript
import Porcupine from "@picovoice/porcupine-react-native";
import { NativeModules, NativeEventEmitter, Platform } from "react-native";
import BackgroundService from "react-native-background-actions";
import { Audio } from "expo-av";

export class WakeWordService {
  private porcupine: Porcupine | null = null;
  private isListening = false;
  private backgroundTask: any = null;

  async initialize() {
    try {
      // Initialize Porcupine with custom wake word
      this.porcupine = await Porcupine.fromKeywords(
        ["hey-sarah"], // Custom wake word model
        {
          accessKey: process.env.PICOVOICE_ACCESS_KEY,
          sensitivity: 0.7,
        },
      );

      // Configure audio session for background
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      // Start background service for Android
      if (Platform.OS === "android") {
        await this.startAndroidBackgroundService();
      }

      // Register for iOS background audio
      if (Platform.OS === "ios") {
        await this.registeriOSBackgroundAudio();
      }
    } catch (error) {
      console.error("Wake word initialization failed:", error);
      throw error;
    }
  }

  async startListening() {
    if (this.isListening) return;

    this.isListening = true;

    // Start Porcupine processing
    await this.porcupine?.start((keywordIndex: number) => {
      if (keywordIndex === 0) {
        this.onWakeWordDetected();
      }
    });

    // Monitor audio levels for visual feedback
    this.startAudioLevelMonitoring();
  }

  private async onWakeWordDetected() {
    // Haptic feedback
    if (Platform.OS === "ios") {
      const { ImpactFeedback } = NativeModules;
      ImpactFeedback?.impact("medium");
    } else {
      const { Vibration } = require("react-native");
      Vibration.vibrate(50);
    }

    // Stop wake word detection
    await this.porcupine?.stop();

    // Start full voice recognition
    await VoiceRecognitionService.startConversation();
  }

  private async startAndroidBackgroundService() {
    const options = {
      taskName: "Voice Assistant",
      taskTitle: "Sarah is listening",
      taskDesc: 'Say "Hey Sarah" to start',
      taskIcon: {
        name: "ic_launcher_round",
        type: "mipmap",
      },
      color: "#3B82F6",
      linkingURI: "caregivingcompanion://voice",
      parameters: {
        delay: 1000,
      },
    };

    await BackgroundService.start(this.backgroundVoiceTask, options);
  }

  private backgroundVoiceTask = async (taskData: any) => {
    await new Promise(async (resolve) => {
      // Continuous listening loop
      while (BackgroundService.isRunning()) {
        await this.checkForWakeWord();
        await new Promise((r) => setTimeout(r, 100));
      }
    });
  };
}
```

### 2. Voice Recognition with Real-time Transcription (src/services/voice/VoiceRecognition.ts)

```typescript
import Voice from "@react-native-voice/voice";
import { Platform, NativeModules } from "react-native";
import { retellClient } from "@/lib/retell";
import NetInfo from "@react-native-community/netinfo";

export class VoiceRecognitionService {
  private isRecognizing = false;
  private transcriptBuffer: string[] = [];
  private silenceTimer: NodeJS.Timeout | null = null;
  private offlineMode = false;

  constructor() {
    // Set up voice event handlers
    Voice.onSpeechStart = this.onSpeechStart;
    Voice.onSpeechEnd = this.onSpeechEnd;
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechError = this.onSpeechError;

    // Monitor network status
    NetInfo.addEventListener((state) => {
      this.offlineMode = !state.isConnected;
    });
  }

  async startConversation() {
    try {
      this.isRecognizing = true;

      // Configure recognition based on platform
      const options = Platform.select({
        ios: {
          language: "en-US",
          partialResults: true,
          continuous: true,
          interimResults: true,
          maxAlternatives: 3,
        },
        android: {
          LANGUAGE: "en-US",
          PARTIAL_RESULTS: true,
          MAX_RESULTS: 5,
          PREFER_OFFLINE: this.offlineMode,
        },
      });

      await Voice.start("en-US", options);

      // Start silence detection
      this.startSilenceDetection();
    } catch (error) {
      console.error("Failed to start voice recognition:", error);
      this.handleRecognitionError(error);
    }
  }

  private onSpeechPartialResults = (e: any) => {
    const partialText = e.value[0];

    // Update live transcription UI
    VoiceUIStore.updateTranscript(partialText, "partial");

    // Reset silence timer
    this.resetSilenceTimer();

    // Stream to Retell for faster processing
    if (!this.offlineMode) {
      retellClient.streamPartialTranscript(partialText);
    }
  };

  private onSpeechResults = async (e: any) => {
    const finalText = e.value[0];
    const alternatives = e.value.slice(1);

    // Update final transcription
    VoiceUIStore.updateTranscript(finalText, "final");

    // Process based on connectivity
    if (this.offlineMode) {
      await this.processOfflineCommand(finalText);
    } else {
      await this.processOnlineConversation(finalText, alternatives);
    }
  };

  private async processOfflineCommand(text: string) {
    // Handle basic offline commands
    const command = this.parseOfflineCommand(text);

    switch (command.type) {
      case "medication_check":
        const meds = await OfflineStorage.getMedications();
        await this.speakOfflineResponse(
          `You have ${meds.length} medications today`,
        );
        break;

      case "emergency":
        await this.triggerEmergencyOffline();
        break;

      case "appointment_check":
        const appts = await OfflineStorage.getAppointments();
        await this.speakOfflineResponse(
          `You have ${appts.length} appointments`,
        );
        break;

      default:
        await this.speakOfflineResponse("I need internet to help with that");
    }
  }

  private async processOnlineConversation(
    text: string,
    alternatives: string[],
  ) {
    // Send to Retell/Claude for processing
    const response = await retellClient.processUtterance({
      text,
      alternatives,
      context: await this.getConversationContext(),
      userId: this.currentUserId,
    });

    // Play TTS response
    await this.playResponse(response);

    // Execute any actions
    if (response.actions) {
      await this.executeActions(response.actions);
    }
  }

  private startSilenceDetection() {
    this.silenceTimer = setTimeout(() => {
      // Auto-end after 2 seconds of silence
      this.endConversation();
    }, 2000);
  }

  private resetSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.startSilenceDetection();
    }
  }
}
```

### 3. iOS Siri Integration (ios/SiriIntegration.swift)

```swift
import Intents
import IntentsUI

// Siri Shortcuts Handler
class SiriShortcutsHandler: NSObject {

    @objc static func setupShortcuts() {
        // Check medications shortcut
        let checkMedsActivity = NSUserActivity(activityType: "com.caregiving.checkMedications")
        checkMedsActivity.title = "Check Mom's medications"
        checkMedsActivity.isEligibleForSearch = true
        checkMedsActivity.isEligibleForPrediction = true
        checkMedsActivity.suggestedInvocationPhrase = "Check medications"
        checkMedsActivity.persistentIdentifier = "check-meds"

        // Call caregiver shortcut
        let callActivity = NSUserActivity(activityType: "com.caregiving.callCaregiver")
        callActivity.title = "Call Sarah"
        callActivity.isEligibleForSearch = true
        callActivity.isEligibleForPrediction = true
        callActivity.suggestedInvocationPhrase = "Call my caregiver"

        // Donate shortcuts
        checkMedsActivity.becomeCurrent()
        callActivity.becomeCurrent()
    }

    @objc static func handleSiriRequest(_ activity: NSUserActivity) -> Bool {
        switch activity.activityType {
        case "com.caregiving.checkMedications":
            NotificationCenter.default.post(
                name: Notification.Name("SiriCheckMedications"),
                object: nil
            )
            return true

        case "com.caregiving.callCaregiver":
            NotificationCenter.default.post(
                name: Notification.Name("SiriCallCaregiver"),
                object: nil
            )
            return true

        default:
            return false
        }
    }
}

// Voice Profile Recognition
class VoiceProfileManager: NSObject {
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    private var voiceProfiles: [String: VoiceProfile] = [:]

    func identifySpeaker(audioBuffer: AVAudioPCMBuffer) -> String? {
        // Use on-device speaker recognition
        let features = extractVoiceFeatures(audioBuffer)

        for (userId, profile) in voiceProfiles {
            if matchesProfile(features, profile) {
                return userId
            }
        }

        return nil
    }

    private func extractVoiceFeatures(_ buffer: AVAudioPCMBuffer) -> VoiceFeatures {
        // Extract pitch, tone, cadence
        // This would use Core ML or custom audio processing
        return VoiceFeatures()
    }
}
```

### 4. Android Google Assistant Integration (android/GoogleAssistantIntegration.kt)

```kotlin
package com.caregivingcompanion.voice

import android.app.Activity
import android.content.Intent
import com.google.android.gms.actions.SearchIntents
import com.facebook.react.bridge.*

class GoogleAssistantModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "GoogleAssistant"

    @ReactMethod
    fun setupAppActions() {
        val shortcuts = listOf(
            createShortcut(
                "check_medications",
                "Check medications",
                "Check Mom's medications"
            ),
            createShortcut(
                "wellness_check",
                "Wellness check",
                "How is Mom doing"
            ),
            createShortcut(
                "emergency_contact",
                "Emergency",
                "Call emergency contact"
            )
        )

        ShortcutManagerCompat.setDynamicShortcuts(reactApplicationContext, shortcuts)
    }

    @ReactMethod
    fun handleVoiceAction(promise: Promise) {
        val activity = currentActivity ?: return promise.reject("NO_ACTIVITY", "No activity")

        when (activity.intent?.action) {
            SearchIntents.ACTION_SEARCH -> {
                val query = activity.intent.getStringExtra(SearchIntents.QUERY)
                handleVoiceQuery(query, promise)
            }
            "android.intent.action.VOICE_COMMAND" -> {
                val command = activity.intent.getStringExtra("android.intent.extra.TEXT")
                handleVoiceCommand(command, promise)
            }
            else -> promise.resolve(null)
        }
    }

    private fun handleVoiceQuery(query: String?, promise: Promise) {
        when {
            query?.contains("medication") == true -> {
                promise.resolve(createAction("check_medications", query))
            }
            query?.contains("appointment") == true -> {
                promise.resolve(createAction("check_appointments", query))
            }
            query?.contains("call") == true -> {
                promise.resolve(createAction("make_call", query))
            }
            else -> {
                promise.resolve(createAction("general_query", query))
            }
        }
    }
}

// Background Voice Service
class BackgroundVoiceService : Service() {
    private lateinit var speechRecognizer: SpeechRecognizer
    private var isListening = false

    override fun onCreate() {
        super.onCreate()

        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
        speechRecognizer.setRecognitionListener(object : RecognitionListener {
            override fun onResults(results: Bundle) {
                val matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                matches?.firstOrNull()?.let { processVoiceCommand(it) }
            }

            override fun onPartialResults(partialResults: Bundle) {
                val partialText = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                sendPartialTranscript(partialText?.firstOrNull())
            }
        })

        startContinuousListening()
    }

    private fun startContinuousListening() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 10000L)
        }

        speechRecognizer.startListening(intent)
        isListening = true
    }
}
```

### 5. Voice UI Components (src/components/voice/VoiceInterface.tsx)

```tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { useVoiceStore } from "@/stores/voiceStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export function VoiceInterface() {
  const { isListening, transcript, partialTranscript, audioLevel, voiceState } =
    useVoiceStore();

  const waveformAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animate waveform based on audio level
  useEffect(() => {
    Animated.timing(waveformAnim, {
      toValue: audioLevel,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [audioLevel]);

  // Pulse animation when listening
  useEffect(() => {
    if (isListening) {
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
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const handleMicPress = async () => {
    if (isListening) {
      await VoiceRecognitionService.stopConversation();
    } else {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await VoiceRecognitionService.startConversation();
    }
  };

  return (
    <View style={styles.container}>
      {/* Live Waveform Visualization */}
      {isListening && (
        <Canvas style={styles.waveform}>
          <WaveformPath audioLevel={audioLevel} />
        </Canvas>
      )}

      {/* Animated Microphone Button */}
      <Animated.View
        style={[
          styles.micContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleMicPress}
          style={[styles.micButton, isListening && styles.micButtonActive]}
        >
          <Ionicons
            name={isListening ? "mic" : "mic-outline"}
            size={40}
            color="white"
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Real-time Transcript */}
      <ScrollView style={styles.transcriptContainer}>
        {partialTranscript && (
          <Text style={styles.partialTranscript}>{partialTranscript}</Text>
        )}
        {transcript && <Text style={styles.finalTranscript}>{transcript}</Text>}
      </ScrollView>

      {/* Voice State Indicator */}
      <View style={styles.stateIndicator}>
        <Text style={styles.stateText}>{getVoiceStateText(voiceState)}</Text>
      </View>
    </View>
  );
}

// Custom waveform visualization
function WaveformPath({ audioLevel }: { audioLevel: number }) {
  const path = Skia.Path.Make();
  const width = 300;
  const height = 100;
  const centerY = height / 2;

  path.moveTo(0, centerY);

  for (let x = 0; x < width; x += 5) {
    const amplitude = audioLevel * 30 * Math.sin(x * 0.05);
    const y = centerY + amplitude * Math.sin(Date.now() * 0.001 + x * 0.1);
    path.lineTo(x, y);
  }

  return <Path path={path} color="#3B82F6" style="stroke" strokeWidth={2} />;
}
```

## Task Checklist

### Core Voice Services

- [ ] Implement wake word detection with Porcupine
- [ ] Build continuous background listening
- [ ] Create voice recognition service
- [ ] Implement offline command processing
- [ ] Set up voice profile recognition

### Platform Integrations

- [ ] Configure iOS Siri Shortcuts
- [ ] Implement Google Assistant actions
- [ ] Set up iOS background audio
- [ ] Configure Android foreground service
- [ ] Implement CarPlay/Android Auto voice

### Voice UI

- [ ] Build animated voice interface
- [ ] Create real-time transcript display
- [ ] Implement waveform visualization
- [ ] Add voice state indicators
- [ ] Build voice onboarding flow

### Background Processing

- [ ] iOS background audio session
- [ ] Android foreground service
- [ ] Wake word in background
- [ ] Notification with voice controls
- [ ] Battery optimization handling

### Advanced Features

- [ ] Multi-speaker recognition
- [ ] Emotion detection
- [ ] Ambient sound awareness
- [ ] Voice biometrics
- [ ] Custom wake word training

## Validation Loop

### Level 1: Unit Testing

```bash
# Test voice components
npm test -- voice/wake-word
npm test -- voice/recognition
npm test -- voice/offline
```

### Level 2: Platform Testing

```bash
# iOS testing
npm run ios:test:siri
npm run ios:test:background

# Android testing
npm run android:test:assistant
npm run android:test:service
```

### Level 3: Integration Testing

```bash
npm run test:voice:e2e
npm run test:voice:background
npm run test:voice:assistant
```

## Success Metrics

- [ ] Wake word detection > 95% accuracy
- [ ] < 500ms voice response latency
- [ ] Background battery usage < 3%
- [ ] Offline commands work reliably
- [ ] Assistant integration seamless
- [ ] Voice profiles 90% accurate

## Common Gotchas

- iOS requires specific background modes in Info.plist
- Android 12+ needs explicit microphone permission
- Wake word models need to be bundled with app
- Background services have strict battery limits
- Voice recognition accuracy varies by device
- Network switching can interrupt streaming
- Audio focus conflicts with media apps
