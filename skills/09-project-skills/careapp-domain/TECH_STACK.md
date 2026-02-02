# Caregiving Companion: Technology Stack

This document provides a comprehensive overview of the technologies, libraries, and services used in the Caregiving Companion application.

## Key Integration Patterns

This section outlines the core architectural patterns used to integrate external services like Cal.com and Retell AI with the Unified Agent.

- **Service-Oriented Integration**: Complex third-party logic is encapsulated within dedicated service classes (e.g., `CalSchedulingService`). This promotes modularity and separates concerns, making the agent's core logic cleaner and easier to maintain.
- **Webhook-Driven Orchestration**: The system uses Next.js API routes to securely receive and process webhooks from external services. This pattern enables reactive, event-driven workflows, such as triggering a Retell call automatically when a Cal.com booking is created.
- **Dynamic Voice Personalization**: Retell AI's dynamic variables are used to inject real-time, contextual data into voice conversations. This allows the agent to provide personalized interactions, referencing specific details like usernames, appointment times, and the purpose of the call.

## Unified Agent Core

The Unified Agent Core represents a fundamental architectural shift, establishing a single, autonomous agent with a consistent personality and capabilities across all communication channels (voice, SMS, chat). This core is responsible for managing conversation history, executing tools, and proactively engaging with users based on predefined triggers and logic.

- **Unified Conversation Memory**: A centralized Redis-based system (`ConversationMemory.ts`) ensures that context is maintained seamlessly as users switch between channels.
- **Consistent Personality**: The agent uses a single system prompt (`UnifiedCaregivingCompanion.ts`) to ensure its behavior and tone are consistent everywhere.
- **Shared Toolset**: All tools (e.g., scheduling, reminders) are defined once and are accessible to the agent regardless of the interaction channel.
- **Proactive Engagement**: A background job system (`ProactiveEngine.ts` with BullMQ) enables the agent to initiate contact with users for things like medication reminders or wellness checks.

## Backend & APIs

### Upstash Redis

- **Library ID**: `/upstash/redis-js`
- **Description**: A serverless Redis client for JavaScript/TypeScript environments, offering a simple and efficient way to interact with Upstash Redis databases.

**Installation**

```bash
npm install @upstash/redis
```

**Basic Usage**

```javascript
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

// Example: set a value
await redis.set("key", "value");

// Example: get a value
const value = await redis.get("key");
```

**Key Features**

- Serverless and HTTP-based, no TCP connection required.
- Works in various environments including serverless functions and edge runtimes.
- Simple API for common Redis commands.
- Built-in support for telemetry and monitoring.

### ioredis

- **Library ID**: `/redis/ioredis`
- **Description**: A robust, performance-focused, and full-featured Redis client for Node.js, supporting features like Cluster, Sentinel, Streams, Pipelining, and Lua scripting.

**Installation**

```bash
npm install ioredis
```

**Key Features**

- High performance with support for autopipelining.
- Full-featured support for Redis commands, including Cluster and Sentinel.
- Promise-based API for modern async/await usage.
- Detailed documentation and active maintenance.

### Redis OM for Node.js

- **Library ID**: `/redis/redis-om-node`
- **Description**: Redis OM for Node.js makes it easy to model Redis data in your Node.js applications with object mapping and a fluent interface for saving and searching entities.

**Installation**

```bash
npm install redis-om
```

**Key Features**

- Object mapping for Redis hashes and JSON documents.
- Fluent API for building complex search queries.
- Schema definition for data validation and modeling.
- Full-text and geospatial search capabilities.

### BullMQ

- **Library ID**: `/taskforcesh/bullmq`
- **Description**: A robust and fast job and message queueing system for Node.js, built on top of Redis. It's designed for handling background jobs, message queues, and other asynchronous tasks with high performance and reliability.

**Installation**

```bash
npm install bullmq
```

**Basic Usage**

```javascript
import { Queue, Worker } from "bullmq";

const myQueue = new Queue("my-queue-name", {
  connection: { host: "127.0.0.1", port: 6379 },
});

async function addJob() {
  await myQueue.add("my-job-name", { foo: "bar" });
}

const worker = new Worker("my-queue-name", async (job) => {
  // Process job data
  console.log(job.data);
});
```

**Key Features**

- High-performance job processing.
- Support for delayed jobs, rate limiting, and repeatable jobs.
- Sandboxed processors for running untrusted code.
- Advanced features like groups, priorities, and concurrency settings.
- Rich telemetry and monitoring capabilities.

### Socket.IO Client

- **Library ID**: `/socketio/socket.io`
- **Description**: The client-side library for Socket.IO, which enables real-time, bidirectional, and event-based communication. It's used in the app to power features like live chat and real-time notifications.

**Installation**

```bash
npm install socket.io-client
```

**Key Features**

- Enables real-time communication between clients and servers.
- Automatically falls back to HTTP long-polling if WebSockets are not available.
- Supports automatic reconnection in case of disconnection.
- Provides a simple event-based API (`on`, `emit`).

### Supabase

- **Library ID**: `/supabase/supabase`
- **Description**: Supabase is an open-source backend platform providing a full Postgres database, authentication, storage, real-time, and edge functions to help developers build applications quickly.

**Installation**

```bash
npm install @supabase/supabase-js
```

**Basic Usage**

```javascript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://[YOUR_PROJECT_ID].supabase.co",
  "YOUR_ANON_KEY",
);

// Example: Invoke an edge function
const { data, error } = await supabase.functions.invoke("hello-world", {
  body: { name: "JavaScript" },
});
```

**Key Features**

- Hosted Postgres database with a powerful and easy-to-use interface.
- Built-in authentication with support for various providers.
- Auto-generated APIs for your database schema.
- Edge functions for running serverless logic.
- File storage with a CDN.

### Cal.com SDK

- **Description**: The official SDK for interacting with the Cal.com API, used for programmatically managing scheduling, bookings, and event types. It is essential for the agent's appointment scheduling tool.
- **Installation**:
  ```bash
  npm install @calcom/sdk
  ```
- **Key Features**:
  - Provides a typed interface for the Cal.com REST API.
  - Enables creating, retrieving, and managing bookings and event types.
  - Authenticates using API keys for secure server-to-server communication.

### Stripe

- **Library ID**: `/llmstxt/stripe-llms.txt`
- **Description**: Stripe is a financial infrastructure platform for businesses that provides payment processing, payouts, and other financial services.

**Installation**

```bash
npm install stripe
```

**Basic Usage**

```javascript
const stripe = require("stripe")("YOUR_SECRET_KEY");

// Example: Create a customer
const customer = await stripe.customers.create({
  description: "My First Test Customer (created for API docs)",
});
```

**Key Features**

- Comprehensive payment processing for web and mobile apps.
- Subscription and recurring billing management.
- Invoicing and financial reporting tools.
- Fraud protection with Radar.
- Secure and compliant with PCI-DSS.

## Voice, Monitoring & Analytics

### Retell SDK

- **Description**: The official TypeScript library for the Retell AI API, enabling developers to build voice-based AI agents and applications.
- **Installation**:
  ```bash
  npm install retell-sdk
  ```
- **Basic Usage**:

  ```javascript
  import Retell from "retell-sdk";

  const retellClient = new Retell({
    apiKey: "YOUR_RETELL_API_KEY",
  });

  async function createAgent() {
    const agent = await retellClient.agent.create({
      response_engine: {
        llm_id: "YOUR_LLM_ID",
        type: "retell-llm",
      },
      voice_id: "11labs-Adrian",
    });
    console.log("Agent created:", agent.agent_id);
  }
  ```

- **Key Features**:
  - Simplifies interaction with the Retell REST API.
  - Provides type safety for all request and response objects.
  - Supports both server-side and client-side environments.
  - Handles real-time voice communication and agent management.

### Anthropic Provider for Vercel AI SDK

- **Library**: `@ai-sdk/anthropic`
- **Description**: The official provider for integrating Anthropic's language models (e.g., Claude) with the Vercel AI SDK. It allows the Unified Agent to leverage Anthropic's powerful models for natural language understanding and generation.
- **Installation**:
  ```bash
  npm install @ai-sdk/anthropic
  ```
- **Key Features**:
  - Seamless integration with the `ai` package's `generateText` and `streamText` functions.
  - Full support for the Anthropic Messages API, including tool use and streaming.
  - Simplifies authentication and request management for Anthropic models.

### Vercel AI SDK

- **Description**: A TypeScript toolkit for building AI-powered applications and agents with React, Next.js, and other modern web frameworks.
- **Installation**:
  ```bash
  npm install ai
  ```
- **Basic Usage**:

  ```javascript
  // app/api/chat/route.js
  import { OpenAI } from "openai";
  import { OpenAIStream, StreamingTextResponse } from "ai";

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  export const runtime = "edge";

  export async function POST(req) {
    const { messages } = await req.json();
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages,
    });
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  }
  ```

- **Key Features**:
  - Unified API for various model providers (OpenAI, Anthropic, Google, etc.).
  - UI hooks for building chat and generative interfaces.
  - Supports streaming text responses and tool calls.
  - Framework-agnostic core library.

### Sentry for Next.js

- **Description**: The official Sentry SDK for Next.js, providing error monitoring, performance tracking, and session replay capabilities for Next.js applications.
- **Installation**:
  ```bash
  npx @sentry/wizard@latest -i nextjs
  ```
- **Basic Usage**:

  ```javascript
  // sentry.client.config.js, sentry.server.config.js, sentry.edge.config.js
  import * as Sentry from "@sentry/nextjs";

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
  ```

- **Key Features**:
  - Automatic error capturing for both client and server-side code.
  - Performance monitoring with distributed tracing.
  - Session replay to visualize user interactions.
  - Rich context and breadcrumbs for easier debugging.

### Vercel Analytics

- **Description**: A privacy-friendly analytics service from Vercel that provides real-time traffic insights without using cookies.
- **Installation**:
  ```bash
  npm install @vercel/analytics
  ```
- **Basic Usage**:

  ```jsx
  // app/layout.js
  import { Analytics } from "@vercel/analytics/react";

  export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <body>
          {children}
          <Analytics />
        </body>
      </html>
    );
  }
  ```

- **Key Features**:
  - Real-time traffic insights.
  - Privacy-focused, no cookies required.
  - Automatic tracking of page views.
  - Simple integration with Next.js and other frameworks.

### Vercel Speed Insights

- **Description**: A tool for measuring and improving web performance by tracking Core Web Vitals and other metrics.
- **Installation**:
  ```bash
  npm install @vercel/speed-insights
  ```
- **Basic Usage**:

  ```jsx
  // app/layout.js
  import { SpeedInsights } from "@vercel/speed-insights/next";

  export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <body>
          {children}
          <SpeedInsights />
        </body>
      </html>
    );
  }
  ```

- **Key Features**:
  - Tracks Core Web Vitals (LCP, FID, CLS).
  - Provides performance scores and recommendations.
  - Real-user monitoring (RUM).
  - Easy integration with Vercel deployments.

## Security

### Node.js Crypto

- **Description**: The native Node.js `crypto` module is used to perform cryptographic functions, primarily for verifying the integrity and authenticity of incoming webhooks from services like Cal.com. By creating an HMAC SHA256 hash with a shared secret, the application ensures that webhook payloads have not been tampered with and originate from a trusted source.
- **Usage**:

  ```javascript
  import crypto from "crypto";

  function verifySignature(payload, signature) {
    const hmac = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET);
    const digest = hmac.update(payload).digest("hex");
    return signature === digest;
  }
  ```

## UI Components & Libraries

### Emoji Picker React

- **Library ID**: `/ealush/emoji-picker-react`
- **Description**: A lightweight and customizable emoji picker for React applications.

**Installation**

```bash
npm install emoji-picker-react
```

**Basic Usage**

```jsx
import EmojiPicker from "emoji-picker-react";

function App() {
  return (
    <div>
      <EmojiPicker />
    </div>
  );
}
```

**Key Features**

- Customizable dimensions (height/width)
- Multiple emoji styles (Apple, Google, etc.)
- Skin tone selectors
- Recent/frequently used emoji suggestions
- Search functionality
- Lazy loading for performance

### shadcn/ui

- **Library ID**: `/shadcn-ui/ui`
- **Description**: A collection of beautifully designed, accessible UI components that can be copied and pasted into your applications. It is not a component library, but rather a set of reusable components that you can fully own and customize.

**Installation (CLI)**

```bash
npx shadcn-ui@latest init
```

**Adding Components**

```bash
npx shadcn-ui@latest add button
```

**Key Features**

- Components are fully customizable and accessible.
- You copy and paste the code, giving you full control.
- Integrates seamlessly with Tailwind CSS.
- Includes a CLI for easy component management.

### next-themes

- **Library ID**: `/pacocoursey/next-themes`
- **Description**: A library for easily adding dark mode to Next.js applications. It supports system preferences and allows for theme switching without any flash of incorrect theme.

**Installation**

```bash
npm install next-themes
```

**Key Features**

- Perfect dark mode for Next.js apps.
- No flash of un-themed content on page load.
- Supports system preference (`prefers-color-scheme`).
- Easy to implement with a `ThemeProvider` and `useTheme` hook.

### date-fns

- **Description**: A modern and lightweight JavaScript utility library for manipulating dates. It is used extensively within the `CalSchedulingService` to handle time zone conversions, calculate reminder times, and format dates for voice responses, ensuring that all scheduling logic is accurate and reliable.
- **Installation**:
  ```bash
  npm install date-fns
  ```
- **Key Features**:
  - Provides a comprehensive, simple, and consistent toolset.
  - Immutable functions always return a new date instance.
  - Modular design allows you to import only the functions you need, keeping bundle sizes small.
  - Excellent support for time zones via `date-fns-tz`.

### class-variance-authority (cva)

- **Library ID**: `/joe-bell/cva`
- **Description**: A utility for creating type-safe and reusable UI components with variants. It's particularly useful for building design systems with Tailwind CSS.

## Mobile App (React Native & Expo)

This section details the technology stack for the native iOS and Android applications, built using React Native and the Expo platform.

### Core Platform & Frameworks

- **React Native**: The core framework for building native apps using React. It allows for a single JavaScript codebase to be deployed on both iOS and Android, providing native performance and access to device features.
- **Expo**: An open-source platform and set of tools built around React Native. Expo simplifies development by providing a managed workflow, a rich SDK with pre-built native modules (e.g., for camera, contacts, sensors), and services for building, deploying, and updating apps.

### Navigation

- **React Navigation**: The primary navigation solution for the app. It provides a comprehensive and extensible library for managing screen transitions and navigation state. The app utilizes several of its navigators:
  - `@react-navigation/stack`: For managing a stack of screens, where new screens are placed on top of a stack.
  - `@react-navigation/bottom-tabs`: For creating a standard tab bar at the bottom of the screen.
  - `@react-navigation/drawer`: For implementing a slide-out drawer menu.

### UI & Styling

- **React Native Paper**: A high-quality, production-ready component library that implements Google's Material Design system. It provides a wide range of pre-built, themeable components that ensure a consistent and modern UI.
- **React Native Elements**: A cross-platform UI toolkit that provides a set of more general-purpose, customizable components. It is used alongside React Native Paper to fill any gaps and provide maximum flexibility in UI development.
- **React Native Gesture Handler & Reanimated**: These libraries are used together to create smooth, high-performance animations and gesture-based interactions, running them on the native UI thread to avoid performance bottlenecks.
- **React Native Shared Components**: The mobile app leverages components and logic from the web application where possible, sharing business logic, API interfaces, and data models. This approach ensures consistency across platforms while maintaining native performance and user experience on mobile devices.

### State Management & Data Fetching

- **Zustand**: A small, fast, and scalable state management solution. It provides a simple, hook-based API for managing global client state (e.g., UI state, theme settings) without the boilerplate of more complex libraries. Its simplicity makes it ideal for managing shared state across components.
- **TanStack Query (React Query)**: A powerful library for fetching, caching, synchronizing, and updating server state. It excels at managing asynchronous data, handling caching, background refetching, and stale data invalidation automatically. This is used for all communication with the backend API, ensuring the app's data is always fresh and the UI is responsive.

### Voice & Audio

- **@react-native-voice/voice**: A speech-to-text library that provides access to the native speech recognition services on iOS and Android. It is used to capture the user's voice and convert it into text for the agent to process.
- **Expo AV**: Part of the Expo SDK, this library is used for managing audio playback and recording. It controls the device's audio session, allowing the app to play the agent's spoken responses and manage microphone input.
- **Expo Speech**: This Expo SDK module provides text-to-speech (TTS) capabilities, enabling the application to convert the agent's text responses into natural-sounding speech.

### Offline Storage & Sync

- **AsyncStorage**: An asynchronous, persistent, key-value storage system for React Native. It is used for storing simple, unstructured data like user settings or session tokens. Data is stored locally on the device, allowing the app to retain information across sessions.
- **Expo SQLite**: This Expo SDK module provides access to a local SQLite database. It is used for managing larger, more complex, and structured data, such as conversation history or health records. It enables the app to perform powerful queries and manage data efficiently for a robust offline-first experience.

### Notifications & Background Tasks

- **Expo Notifications**: The primary library for receiving, scheduling, and handling both local and push notifications. It provides a unified API to interact with Apple Push Notification service (APNs) and Firebase Cloud Messaging (FCM).
- **Notifee**: A feature-rich library for creating and managing local notifications. It is used alongside Expo Notifications to build highly interactive and styled notifications (e.g., with images, quick actions, and progress bars), providing a richer user experience than the standard notification APIs.
- **Expo Task Manager**: The core Expo module for defining and managing long-running background tasks. It allows code to be executed even when the app is not in the foreground, which is essential for features like background data sync and handling notification actions.
- **Expo Background Fetch**: A library built on top of Task Manager that allows the app to periodically wake up in the background to fetch small amounts of data. This is used to keep app content fresh and to perform regular, low-priority sync operations.

### Device Feature Integration

- **Expo Contacts**: Provides access to the device's system contacts, allowing the app to read, add, and modify contact information with the user's permission.
- **Expo Calendar**: Enables the app to interact with the device's calendar, including creating, reading, and updating events. This is used to sync appointments scheduled within the app to the user's native calendar.
- **Expo Local Authentication**: Implements biometric authentication, allowing users to secure the app with Face ID, Touch ID, or fingerprint scanning.
- **Expo Haptics**: Provides access to the device's haptic feedback engine, allowing the app to trigger vibrations and other tactile responses to enhance user interactions.
- **Expo Sensors**: A collection of modules that provide access to various device sensors, such as the accelerometer and gyroscope. This can be used for features like shake-to-report-a-bug or detecting device movement.

### Testing

- **Jest**: The primary framework for unit and snapshot testing. It is used to test individual components and functions in isolation, ensuring that they behave as expected. Snapshot tests are used to track changes in the UI and prevent unintended regressions.
- **Detox**: A gray box end-to-end (E2E) testing framework for React Native. It runs the application on a real device or simulator and interacts with it from a user's perspective, verifying that the application flows work correctly from start to finish.

### Android-Specific Integration & Native Modules

This section details the native Android libraries and architectural patterns used to deliver an optimized experience on the Android platform. These components are written in Kotlin and integrated with the React Native application via native modules.

- **Material Design 3 (M3)**: The latest version of Google's design system. The app uses `com.google.android.material:material` to implement Material You, which enables dynamic color theming based on the user's wallpaper, creating a personalized and adaptive UI.
- **Android Jetpack - WorkManager**: The `androidx.work:work-runtime` library is used for scheduling and managing deferrable background tasks. This is critical for running services like medication reminders and health data synchronization, ensuring they execute reliably even when the app is not in the foreground.
- **Google Play Services**:
  - **Auth**: `com.google.android.gms:play-services-auth` is used for seamless and secure Google Sign-In, allowing users to authenticate with their Google account.
  - **Fitness**: `com.google.android.gms:play-services-fitness` provides access to the Google Fit platform for reading and writing fitness data.
- **Health Connect**: The `androidx.health.connect:connect-client` library is the modern API for reading and writing user health and fitness data on Android. It provides a unified interface for accessing data from various health apps, which is essential for the caregiving companion's health monitoring features.
- **Google ML Kit - Speech Recognition**: The `com.google.mlkit:speech-recognition` library provides on-device, high-accuracy speech-to-text capabilities. This is used in the `VoiceRecognitionService` to power the app's voice command features without requiring a constant network connection.
- **Wear OS**: The `androidx.wear:wear` and `com.google.android.support:wearable` libraries are used to build the companion app for Wear OS devices, enabling features like medication reminders and health alerts directly on the user's smartwatch.
- **Native Services & Receivers**: The application is architected with several native Android services (`VoiceRecognitionService`, `MedicationReminderService`) and broadcast receivers (`BootReceiver`, `AlarmReceiver`) to handle long-running tasks, system events, and notifications efficiently.
- **Home Screen Widgets**: Native code is used to create and manage home screen widgets, providing users with quick access to information like medication schedules and daily tasks directly from their home screen.

### iOS-Specific Integration & Native Modules

This section covers the native iOS frameworks and architectural patterns used to deliver a deeply integrated experience on the Apple platform. These components are written in Swift and bridged to the React Native application using native modules and app extensions.

- **HealthKit**: The core framework for accessing and managing user health data. The app uses a native `HealthKitModule` to request authorization, read vital signs (heart rate, blood pressure, etc.), and write health records. It also uses `HKObserverQuery` with background delivery to monitor for real-time health data changes.
- **SiriKit & App Intents**: Used to expose app functionality to Siri, allowing users to perform actions with voice commands (e.g., "Siri, check Mom's medications"). This is implemented via a native `IntentsExtension`.
- **WidgetKit**: The framework for building widgets for the iOS Home Screen and Lock Screen. The app provides interactive widgets of various sizes (`systemSmall`, `accessoryCircular`, etc.) to give users at-a-glance information about care tasks and medication schedules.
- **ActivityKit**: Powers Live Activities and the Dynamic Island. A native `LiveActivityModule` is used to start, update, and end real-time notifications on the Lock Screen for time-sensitive events like medication reminders.
- **WatchKit**: The framework for creating the companion app for Apple Watch. The `WatchExtension` allows the app to display critical information and send reminders directly to the user's wrist.
- **visionOS & SwiftUI**: The application includes a target for Apple Vision Pro (`CaregivingCompanionVision`), using SwiftUI to create an immersive spatial computing experience for care management.
- **Native App Extensions**: The architecture heavily relies on various app extensions (e.g., `WidgetExtension`, `NotificationServiceExtension`) to run code in the background and integrate with system-level UI features.

### Mobile Voice Integration & Processing

This section details the libraries and frameworks used to create a seamless, always-on conversational voice experience within the mobile application.

- **Wake Word & Intent Recognition (Picovoice)**:
  - **Porcupine (`@picovoice/porcupine-react-native`)**: An on-device wake word detection engine. It allows the app to listen for a custom wake word (e.g., "Hey Sarah") with very low power consumption, even when the app is in the background.
  - **Rhino (`@picovoice/rhino-react-native`)**: A Speech-to-Intent engine that processes voice commands entirely offline. This is used to handle basic, critical commands (e.g., checking medications, emergency contacts) when an internet connection is unavailable.

- **Core Speech & Audio Handling**:
  - **React Native Voice (`@react-native-voice/voice`)**: The primary library for accessing the native speech recognition APIs on both iOS and Android, providing real-time transcription of the user's speech.
  - **Expo AV (`expo-av`)**: Used to configure and manage the device's audio session, ensuring the app can record audio in the background and handle interruptions gracefully.
  - **Expo Speech (`expo-speech`)**: Provides text-to-speech (TTS) capabilities, allowing the application to speak its responses back to the user.

- **Real-time Communication & Background Processing**:
  - **React Native WebRTC (`react-native-webrtc`)**: Implements Web Real-Time Communication APIs, used to stream raw audio from the microphone directly to the backend (Retell AI) for very low-latency online conversation processing.
  - **React Native Background Actions (`react-native-background-actions`)**: A library used to create a persistent background service, primarily on Android, to ensure the wake word listener remains active even when the app is closed.

- **UI & Visualization**:
  - **Shopify Skia (`@shopify/react-native-skia`)**: A high-performance 2D graphics library used to render a real-time voice waveform visualization, providing visual feedback to the user as they speak.

### Mobile Notification System

This section describes the multi-layered architecture for delivering rich, reliable, and interactive notifications.

- **Core Notification Frameworks**:
  - **Expo Notifications (`expo-notifications`)**: Serves as the foundational library for handling the scheduling, receiving, and responding to local and push notifications across both platforms.
  - **Notifee (`@notifee/react-native`)**: A powerful library used for advanced notification features. It is responsible for creating Android Notification Channels, managing critical alerts that bypass Do Not Disturb, displaying rich media (images, icons), and adding interactive action buttons.

- **Push Notification Services**:
  - **Firebase Cloud Messaging (`@react-native-firebase/messaging`)**: The primary service for receiving remote push notifications from the backend. This enables real-time, server-initiated alerts, such as updates from other family members.
  - **OneSignal (`react-native-onesignal`)**: Integrated as a comprehensive push notification platform, likely used for its features in segmentation, delivery automation, and analytics.

- **Native & Background Processing**:
  - **Native Service Extensions**: The architecture includes native code to process notifications before they are displayed. This includes the `UNNotificationServiceExtension` on iOS and overriding `FirebaseMessagingService` on Android, allowing for features like downloading images for attachments or decrypting content.
  - **Expo Task Manager & Background Fetch**: These libraries (`expo-task-manager`, `expo-background-fetch`) are used to run notification-related logic in the background, ensuring tasks like snoozing reminders or handling actions can be processed even when the app is not in the foreground.

### Mobile Deployment & Distribution

This section outlines the tools and services used to build, test, and distribute the mobile application to the Apple App Store and Google Play Store.

- **CI/CD & Build Automation**:
  - **Expo Application Services (EAS)**: The primary cloud build service used to create production-ready application binaries (`.ipa` and `.aab`) from the React Native codebase. The `eas.json` file configures different build profiles for development, preview, and production.
  - **Fastlane**: A comprehensive automation tool that handles all aspects of the deployment pipeline. It is used for code signing, incrementing build numbers, managing provisioning profiles, uploading builds to TestFlight and the Play Console, and managing store metadata and screenshots.
  - **GitHub Actions**: The CI/CD platform that orchestrates the entire release workflow. The `.github/workflows/deploy.yml` file defines jobs for testing, building, and deploying the app automatically when a new version tag is pushed.

- **App Store & Beta Testing Management**:
  - **Apple App Store Connect**: The official portal for managing the iOS app, including its TestFlight beta program, App Store listing, and submission for review. Fastlane interacts with the App Store Connect API for automation.
  - **Google Play Console**: The portal for managing the Android app, including its internal, alpha, and beta testing tracks, as well as production releases. Fastlane uses the Google Play Console API to upload builds and manage releases.

- **Quality & Monitoring**:
  - **Codecov**: Integrated into the CI/CD pipeline to track test coverage and ensure code quality before deployment.
  - **Slack Integration**: Used for sending automated notifications to the development team about the status of builds and deployments.
    **Installation**

```bash
npm install class-variance-authority
```

**Key Features**

- Create components with multiple variants (e.g., size, color).
- Full TypeScript support for type safety.
- Helps in creating a consistent and maintainable component API.
- Works great with Tailwind CSS and other utility-first CSS frameworks.

### React Camera Pro

- **Library ID**: `/purple-technology/react-camera-pro`
- **Description**: A universal and mobile-friendly camera component for React, designed for Android and iOS, with features like photo taking, camera switching, and aspect ratio control.

**Installation**

```bash
npm install --save react-camera-pro
```

**Key Features**

- Easy-to-use component for camera access.
- Supports front and back cameras (`user` and `environment`).
- Customizable aspect ratio and error messages.

### Framer Motion

- **Library ID**: `/grx7/framer-motion`
- **Description**: A powerful and easy-to-use animation library for React. It provides the building blocks for creating fluid and complex animations with a simple and declarative API.

**Installation**

```bash
npm install framer-motion
```

**Key Features**

- Declarative animation syntax.
- Support for gestures like drag, pan, and hover.
- Animate presence for handling entering and exiting animations.
- Layout animations for smooth transitions between different layouts.

### @hello-pangea/dnd (formerly react-beautiful-dnd)

- **Library ID**: `/hello-pangea/dnd`
- **Description**: A performant and accessible library for creating beautiful drag-and-drop lists in React. It provides natural movement, keyboard support, and screen reader compatibility.

**Installation**

```bash
npm install @hello-pangea/dnd
```

**Key Features**

- High-performance drag-and-drop functionality.
- Excellent keyboard and screen reader support.
- Clean and powerful API for managing drag-and-drop interactions.
- No creation of wrapper DOM nodes, ensuring clean and semantic markup.

### React Mentions

- **Library ID**: `/signavio/react-mentions`
- **Description**: A component that provides @mention functionality, similar to what you see on platforms like Slack or Twitter. It's highly customizable and can be used for mentioning users, topics, etc.

**Installation**

```bash
npm install react-mentions --save
```

**Key Features**

- Supports single and multiple mention types in the same input.
- Customizable suggestion rendering.
- Can be used in a scrollable container.
- Allows asynchronous loading of mention data.

### React Textarea Autosize

- **Description**: A utility component that automatically adjusts the height of a textarea to match its content. This is useful for creating chat inputs or comment boxes that grow as the user types.

**Installation**

```bash
npm install react-textarea-autosize
```

**Key Features**

- Simple, dependency-free, and lightweight.
- Automatically resizes the textarea height to fit the content.
- Supports min/max rows and custom styling.

### clsx

- **Description**: A tiny (239B) utility for constructing `className` strings conditionally. It's a faster and smaller drop-in replacement for the `classnames` library.
- **Installation**:
  ```bash
  npm install clsx
  ```
- **Basic Usage**:

  ```javascript
  import clsx from "clsx";

  const buttonClasses = clsx(
    "base-class",
    { "is-active": isActive },
    isError && "error-class",
  );
  // => 'base-class is-active error-class'
  ```

- **Key Features**:
  - Extremely lightweight and performant.
  - Flexible API supports strings, objects, and arrays.
  - Ideal for use with utility-first CSS frameworks like Tailwind CSS.

### react-use

- **Description**: A large collection of essential React Hooks for managing sensor data, UI states, side effects, and more.
- **Installation**:
  ```bash
  npm install react-use
  ```
- **Basic Usage**:

  ```javascript
  import { useTitle } from "react-use";

  const Demo = () => {
    useTitle("My Awesome Page");
    return null;
  };
  ```

- **Key Features**:
  - Wide variety of hooks for sensors (`useLocation`, `useNetworkState`).
  - UI-related hooks (`useHover`, `useIdle`).
  - Lifecycle hooks (`useMount`, `useUnmount`).
  - State management hooks (`useLocalStorage`, `useSessionStorage`).

### Data Display & Virtualization

### TanStack Table

- **Library ID**: `/tanstack/table`
- **Description**: A headless UI library for building powerful and lightweight tables and datagrids. It provides the logic for sorting, filtering, pagination, and more, while giving you full control over the markup and styling.

**Installation**

```bash
npm install @tanstack/react-table
```

**Key Features**

- Headless and framework-agnostic.
- Extensible plugin system for adding features.
- Full control over markup and styles.
- Supports sorting, filtering, grouping, pagination, and more.

### React Virtualized

- **Library ID**: N/A (Community Standard)
- **Description**: A set of React components for efficiently rendering large lists and tabular data. It helps to improve performance by only rendering the items that are currently visible to the user.

**Installation**

```bash
npm install react-virtualized
```

**Key Features**

- Components for virtualizing lists, grids, and tables (`List`, `Grid`, `Table`).
- `AutoSizer` component to automatically adjust dimensions.
- `CellMeasurer` for dynamically measuring cell sizes.
- Improves performance for long lists by rendering only visible rows.

### Document Handling

### React PDF

- **Library ID**: N/A (Community Standard)
- **Description**: A library to display PDFs in a React application. It provides a set of components to render PDF documents and pages, giving developers control over the rendering process.

**Installation**

```bash
npm install react-pdf
```

**Key Features**

- Renders PDFs using PDF.js.
- Supports text layer for text selection and search.
- Supports annotation layer for links and other interactions.
- Customizable and flexible components (`<Document>` and `<Page>`).

### PDF.js (pdfjs-dist)

- **Library ID**: N/A (Community Standard)
- **Description**: The official distribution of Mozilla's PDF.js library, a web standards-based platform for parsing and rendering Portable Document Formats (PDFs). It is the core engine that powers `react-pdf`.

**Installation**

```bash
npm install pdfjs-dist
```

**Key Features**

- Provides the core functionality for rendering PDFs in the browser.
- Built with HTML5, ensuring broad compatibility.
- Supports low-level PDF parsing and manipulation.
- Includes a worker script (`pdf.worker.js`) to offload heavy processing from the main thread.

### Tesseract.js

- **Library ID**: N/A (Community Standard)
- **Description**: A JavaScript library that provides Optical Character Recognition (OCR) by porting the Tesseract engine to the browser and Node.js using WebAssembly. It can extract text from images in over 100 languages.

**Installation**

```bash
npm install tesseract.js
```

**Key Features**

- Pure JavaScript OCR for the browser and Node.js.
- Supports a wide variety of image formats.
- Multilingual support.
- Uses workers to perform OCR without blocking the main thread.

### Mammoth

- **Library ID**: N/A (Community Standard)
- **Description**: A library designed to convert `.docx` documents (from Microsoft Word, Google Docs, etc.) into simple and clean HTML. It focuses on using semantic information from the document rather than focusing on visual fidelity.

**Installation**

```bash
npm install mammoth
```

**Key Features**

- Converts `.docx` files to HTML and Markdown.
- Extracts raw text from documents.
- Supports custom style maps to control the conversion output.
- Can be used in both Node.js and the browser.

### file-type

- **Library ID**: N/A (Community Standard)
- **Description**: A library to detect the file type of a file, stream, or buffer by checking its magic number. It's useful for identifying binary-based file formats.

**Installation**

```bash
npm install file-type
```

**Key Features**

- Detects file types from buffers, streams, and file paths.
- Works in both Node.js and the browser.
- Supports a wide range of common file formats.
- Does not rely on file extensions, making it more reliable.

### TanStack Query

- **Library ID**: `/tanstack/query`
- **Description**: A powerful asynchronous state management library for fetching, caching, and updating data in React applications.

**Installation**

```bash
npm install @tanstack/react-query
```

**Basic Usage**

```javascript
import { useQuery } from "@tanstack/react-query";

function App() {
  const { isLoading, error, data } = useQuery(["repoData"], () =>
    fetch("https://api.github.com/repos/tannerlinsley/react-query").then(
      (res) => res.json(),
    ),
  );

  if (isLoading) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
    </div>
  );
}
```

**Key Features**

- Simplifies data fetching, caching, and synchronization.
- Automatic refetching on window focus, reconnect, and interval.
- Pagination and infinite query support.
- Devtools for easy debugging.

### Lucide React

- **Library ID**: `/lucide-icons/lucide`
- **Description**: A simply beautiful and consistent open-source icon library.

**Installation**

```bash
npm install lucide-react
```

**Basic Usage**

```javascript
import { Camera } from "lucide-react";

const App = () => {
  return <Camera />;
};

export default App;
```

**Key Features**

- Over 850 icons.
- Tree-shakable and highly optimized.
- Customizable size, color, and stroke width.
- Consistent design across all icons.

### Image Processing

### Sharp

- **Library ID**: N/A (Community Standard)
- **Description**: A high-performance Node.js image processing library. It is the fastest module to resize JPEG, PNG, WebP, GIF, AVIF, and TIFF images. It's used for tasks like creating thumbnails, resizing images on the fly, and applying various image transformations.

**Installation**

```bash
npm install sharp
```

**Key Features**

- High-speed image resizing and processing.
- Supports a wide range of image formats.
- Can perform operations like rotation, extraction, and composition.
- Works with streams and buffers, making it highly flexible.

### Keyboard Shortcuts

### React Hotkeys Hook

- **Library ID**: N/A (Community Standard)
- **Description**: A React hook for using keyboard shortcuts in components in a declarative way. It allows developers to easily manage hotkeys for actions like navigation, saving, or accessibility features.

**Installation**

```bash
npm install react-hotkeys-hook
```

**Key Features**

- Simple `useHotkeys` hook to bind keys to callbacks.
- Supports key combinations with modifiers like Ctrl, Shift, Alt, and Meta.
- Can be enabled or disabled conditionally.
- Provides an `isHotkeyPressed` utility to check if a key is currently pressed.

### Radix UI

- **Library ID**: `/radix-ui/primitives`
- **Description**: An open-source UI component library for building high-quality, accessible design systems and web apps. It provides unstyled, foundational components that can be fully customized.

**Installation (Example: Accordion)**

```bash
npm install @radix-ui/react-accordion
```

**Key Features**

- Unstyled and fully customizable to fit any design system.
- Focus on accessibility (WAI-ARIA standards).
- Composable API for maximum flexibility.
- Works seamlessly with frameworks like Next.js and CSS-in-JS libraries.

## Forms & Validation

### React Hook Form

- **Library ID**: `/react-hook-form/documentation`
- **Description**: A performant, flexible, and extensible library for building forms in React. It leverages hooks to minimize re-renders and provides easy-to-use validation. It integrates with schema validation libraries like Zod via the `@hookform/resolvers` package.

**Installation**

```bash
npm install react-hook-form
```

**Key Features**

- High performance with uncontrolled components.
- Simple API and easy integration with UI libraries.
- Built-in validation and support for schema-based validation with libraries like Zod.
- Reduces the amount of code you need to write for forms.

### Zod

- **Library ID**: `/colinhacks/zod`
- **Description**: A TypeScript-first schema declaration and validation library. It's designed to be developer-friendly and provides static type inference, which means you don't have to declare your static types twice.

**Installation**

```bash
npm install zod
```

**Key Features**

- TypeScript-first with excellent static type inference.
- Simple and chainable API for defining schemas.
- No dependencies and works in any JavaScript environment.
- Highly extensible for creating custom validations.

## Data Fetching & State Management

### TanStack Query (formerly React Query)

- **Library ID**: `/tanstack/query`
- **Description**: A powerful library for fetching, caching, synchronizing, and updating server state in your React applications. It significantly simplifies data fetching logic.

**Installation**

```bash
npm install @tanstack/react-query
```

**Key Features**

- Out-of-the-box caching and automatic refetching.
- Window focus refetching to keep data fresh.
- Support for pagination, infinite queries, and mutations.
- Devtools for easy debugging of your queries.

### SWR

- **Library ID**: `/vercel/swr`
- **Description**: A React Hooks library for data fetching, created by Vercel. The name "SWR" is derived from `stale-while-revalidate`, a caching strategy that ensures a fast user experience.

**Installation**

```bash
npm install swr
```

**Key Features**

- Fast, lightweight, and reusable data fetching.
- Built-in cache and request deduplication.
- Real-time updates with focus tracking and network reconnects.
- Supports pagination, optimistic UI, and dependent fetching.

### Zustand

- **Library ID**: `/pmndrs/zustand`
- **Description**: A small, fast, and scalable state management solution for React. It uses a minimalistic API based on hooks and doesn't require boilerplate code like reducers or context providers.

**Installation**

```bash
npm install zustand
```

**Key Features**

- Simple and un-opinionated state management.
- Manages state outside of React, making it easy to use with other libraries.
- Middleware support for logging, persistence, and more.
- Renders components only when the state they subscribe to changes.

### ElevenLabs

- **Library ID**: `/elevenlabs.io/llmstxt`
- **Description**: An AI voice generation platform that provides high-quality, natural-sounding text-to-speech (TTS) and voice cloning services. It's used for generating voice responses for the AI agent.

**Installation (Node.js SDK)**

```bash
npm install elevenlabs
```

**Key Features**

- Realistic and expressive AI voices.
- Voice cloning from a small audio sample.
- API for real-time and batch TTS conversion.
- Support for multiple languages and accents.

## AI & Voice

### OpenAI

- **Library ID**: `/websites/platform_openai`
- **Description**: Provides access to advanced AI models like GPT-4 for natural language processing, understanding, and generation. Used as the core intelligence for the Caregiving Companion's conversational agent.

**Installation (Python Client)**

```python
pip install openai
```

**Installation (Node.js Client)**

```bash
npm install openai
```

**Basic Usage (Node.js)**

```javascript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "gpt-4o",
  });

  console.log(completion.choices[0]);
}

main();
```

**Key Features**

- Access to state-of-the-art language models (GPT-4, GPT-3.5).
- Capabilities for text generation, embeddings, and fine-tuning.
- Function calling for integrating external tools and APIs.
- Image and audio processing capabilities.

### Anthropic (Claude)

- **Library ID**: `/docs.anthropic.com/llmstxt`
- **Description**: Provides access to the Claude family of AI models, known for their strong performance in conversational AI, reasoning, and safety. An alternative or complementary model to OpenAI's GPT series.

**Installation (Node.js Client)**

```bash
npm install @anthropic-ai/sdk
```

**Basic Usage (Node.js)**

```javascript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
  const message = await anthropic.messages.create({
    max_tokens: 1024,
    messages: [{ role: "user", content: "Hello, Claude" }],
    model: "claude-3-opus-20240229",
  });

  console.log(message.content);
}

main();
```

**Key Features**

- Access to high-performance models like Claude 3 Opus, Sonnet, and Haiku.
- Strong emphasis on AI safety and constitutional AI principles.
- Excellent for complex reasoning, analysis, and creative text generation.
- Supports large context windows for processing extensive documents.

### Deepgram

- **Library ID**: `/deepgram/deepgram-js-sdk`
- **Description**: A powerful API for real-time and pre-recorded speech-to-text transcription and voice intelligence. It's used for the app's voice input and analysis features.

**Installation (Node.js SDK)**

```bash
npm install @deepgram/sdk
```

**Basic Usage (Node.js - Transcribing a remote file)**

```javascript
import { createClient } from "@deepgram/sdk";

const deepgramClient = createClient(process.env.DEEPGRAM_API_KEY);

async function transcribe() {
  const { result, error } = await deepgramClient.listen.prerecorded.fromUrl(
    {
      url: "https://static.deepgram.com/examples/interview_speech-analytics.wav",
    },
    { model: "nova-2", smart_format: true },
  );

  if (error) throw error;
  console.log(result.results.channels[0].alternatives[0].transcript);
}

transcribe();
```

**Key Features**

- High-accuracy real-time and pre-recorded transcription.
- Voice intelligence features like speaker diarization, sentiment analysis, and topic detection.
- Support for multiple languages and audio formats.
- SDKs for various languages, including JavaScript and Python.

## Authentication & Security

### Clerk

- **Library ID**: `/websites/clerk`
- **Description**: A complete user management and authentication solution that provides pre-built UI components and SDKs to easily handle sign-up, sign-in, and user profile management.

**Installation (Next.js)**

```bash
npm install @clerk/nextjs
```

**Basic Usage (Next.js App Router)**

```jsx
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}

// app/page.tsx
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
```

**Key Features**

- Pre-built UI components for authentication (`<SignIn>`, `<SignUp>`).
- SDKs for popular frameworks like Next.js, React, and Vue.
- Social connections (Google, Facebook, etc.) and enterprise SSO.
- Multi-factor authentication (MFA) and passwordless login.
- Robust user management dashboard.

## Communication

### Retell AI

- **Library ID**: `/websites/retellai`
- **Description**: A comprehensive platform for building, testing, and deploying reliable AI phone agents. It's used for all voice and SMS communications in the Caregiving Companion app.

**Installation (TypeScript SDK)**

```bash
npm install retell-sdk
```

**Basic Usage (Creating an outbound call)**

```javascript
import { RetellClient } from "retell-sdk";

const retellClient = new RetellClient({
  apiKey: process.env.RETELL_API_KEY,
});

async function makeCall() {
  const agent = await retellClient.agent.create({
    // Agent configuration here
  });

  const call = await retellClient.call.create({
    agentId: agent.agentId,
    fromNumber: process.env.RETELL_FROM_NUMBER,
    toNumber: "+1234567890",
  });

  console.log("Call initiated:", call);
}

makeCall();
```

**Key Features**

- Low-latency, real-time voice conversations.
- SDKs for TypeScript/JavaScript and Python.
- Inbound and outbound call management.
- Customizable agents with different voices and response engines.
- Detailed call logging and monitoring.

### Resend

- **Library ID**: `/websites/resend`
- **Description**: An email API for developers, designed to send transactional and marketing emails programmatically. It's used for sending notifications, reminders, and summaries from the Caregiving Companion app.

**Installation (Node.js)**

```bash
npm install resend
```

**Basic Usage (Sending an email)**

```javascript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: "Caregiving Companion <notifications@yourdomain.com>",
      to: ["user@example.com"],
      subject: "Your Weekly Summary",
      html: "<strong>Here is your weekly summary...</strong>",
    });

    if (error) {
      return console.error({ error });
    }

    console.log({ data });
  } catch (error) {
    console.error(error);
  }
}

sendEmail();
```

**Key Features**

- Simple API for sending emails.
- Support for custom domains and DKIM/SPF records.
- Webhooks for tracking email events (sent, delivered, bounced, etc.).
- SDKs for multiple languages, including Node.js, Python, and Ruby.

## Data Fetching & State

### Vercel AI SDK

## Forms & Validation

### React Hook Form

- **Library ID**: `/react-hook-form/react-hook-form`
- **Description**: A performant, flexible, and extensible library for building forms in React. It minimizes re-renders and provides an easy-to-use API for validation and state management.

**Installation**

```bash
npm install react-hook-form
```

**Key Features**

- High performance with minimal re-renders.
- Simple, hook-based API.
- Integrates seamlessly with schema validation libraries like Zod.
- Supports uncontrolled components for better performance.

### Zod

- **Library ID**: `/colinhacks/zod`
- **Description**: A TypeScript-first schema validation library with static type inference. It is used to define the schemas for the agent's tools, ensuring that all inputs are correctly structured and type-safe before execution.

**Installation**

```bash
npm install zod
```

**Key Features**

- Enables the creation of complex schemas for data validation.
- Provides static type inference, reducing the need for duplicate type declarations.
- Zero dependencies and a small bundle size.
- Immutable API ensures that schemas are not accidentally modified.

````

**Key Features**
- Strong type safety and static type inference.
- Simple and expressive API for defining complex schemas.
- No dependencies, lightweight, and works in any JavaScript environment.
- Excellent integration with React Hook Form.

## Data Fetching & State

### TanStack Query (React Query)

- **Library ID**: `/tanstack/query`
- **Description**: A powerful library for fetching, caching, synchronizing, and updating server state in React applications. It simplifies data fetching logic and improves user experience.

**Installation**
```bash
npm install @tanstack/react-query
````

**Key Features**

- Automatic caching and background refetching.
- Optimistic updates for a smoother UI experience.
- Pagination and infinite scroll support out of the box.
- Devtools for easy debugging of queries and mutations.

### Zustand

- **Library ID**: `/pmndrs/zustand`
- **Description**: A small, fast, and scalable state management solution for React. It uses a simple, hook-based API and avoids the boilerplate of traditional state management libraries.

**Installation**

```bash
npm install zustand
```

**Key Features**

- Minimal and intuitive API.
- Manages state outside of React, making it fast and efficient.
- Middleware support for logging, persistence, and more.
- No need for context providers, simplifying component architecture.

### Vercel AI SDK

- **Library ID**: `/vercel/ai`
- **Description**: An open-source library for building AI-powered applications and agents. It provides helpers for streaming text responses, calling tools, and managing chat state.

**Installation**

```bash
npm install ai
```

**Basic Usage (Next.js with `useChat`)**

```jsx
// app/page.tsx
"use client";

import { useChat } from "ai/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>
          {m.role === "user" ? "User: " : "AI: "}
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
```

**Key Features**

- Framework-agnostic core for use in any JavaScript project.
- UI helpers for React, Svelte, and Vue.
- Supports streaming UI generation.
- Integrates with dozens of model providers, including OpenAI, Anthropic, and Google.

## Monitoring & Analytics

### Vercel Speed Insights

- **Library ID**: `/vercel/vercel`
- **Description**: A Vercel service that provides real-user monitoring of your site's performance. It helps you understand how your site performs for your users and identify areas for improvement.

**Installation**

```bash
npm install @vercel/speed-insights
```

**Key Features**

- Real-user performance monitoring.
- Core Web Vitals tracking (LCP, FID, CLS).
- No-code setup for Vercel-deployed projects.
- Detailed performance metrics and reports.

### Vercel Speed Insights

- **Library ID**: `/vercel/vercel`
- **Description**: A tool that analyzes your website's performance and provides actionable insights based on real-user data. It helps to identify and fix performance bottlenecks.

**Installation**

```bash
npm install @vercel/speed-insights
```

**Key Features**

- Real-user monitoring (RUM) for accurate performance metrics.
- Core Web Vitals tracking (LCP, FID, CLS).
- Actionable insights and recommendations.
- Easy integration with Vercel and Next.js.

### Vercel Analytics

- **Library ID**: `/vercel/vercel`
- **Description**: Vercel Analytics provides real-time performance monitoring and audience insights for websites deployed on Vercel. It helps track key metrics like Web Vitals and page views without impacting site performance.

**Installation**

```bash
npm install @vercel/analytics
```

**Key Features**

- Privacy-friendly, cookie-less analytics.
- Real-time data on visitor traffic and demographics.
- Core Web Vitals monitoring to optimize user experience.
- Seamless integration with Next.js and other frameworks on Vercel.

### Sentry

- **Library ID**: `/websites/sentry_io`
- **Description**: An application performance monitoring and error tracking platform that helps developers diagnose, fix, and optimize the performance of their code.

**Installation (Next.js)**

```bash
npm install --save @sentry/nextjs
```

**Basic Configuration (with Sentry Wizard)**

```bash
npx @sentry/wizard@latest -i nextjs
```

This command will automatically configure your Next.js application by creating necessary configuration files (`sentry.client.config.ts`, `sentry.server.config.ts`, etc.) and updating `next.config.js`.

**Key Features**

- Real-time error tracking and alerting.
- Performance monitoring with distributed tracing to identify bottlenecks.
- Release health tracking to monitor the impact of new deployments.
- Session replay to see user interactions leading up to an error.
- Support for a wide range of frameworks and languages.

### Vercel Web Analytics

- **Library ID**: `@vercel/analytics`
- **Description**: A privacy-friendly analytics service for gaining real-time traffic insights. It allows for tracking page views and custom events with zero configuration for Next.js and other supported frameworks.

**Installation**

```bash
npm install @vercel/analytics
```

**Key Features**

- **Easy Integration**: Add analytics to your project with a single component.
- **Real-Time Insights**: Monitor traffic as it happens from the Vercel dashboard.
- **Privacy-Focused**: Does not use cookies and anonymizes visitor data.
- **Custom Events**: Track specific user interactions beyond page views.
- **Debug Mode**: View analytics events in the browser console during development.

## Development Tools

### ESLint

- **Library ID**: `/eslint/eslint`
- **Description**: A pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript code, helping to maintain code quality and enforce coding standards.

**Installation & Setup**

```bash
# 1. Initialize ESLint configuration
npm init @eslint/config

# 2. (or) Manually install and create eslint.config.js
npm install eslint @eslint/js --save-dev
```

**Basic Configuration (`eslint.config.js`)**

```javascript
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];
```

**Key Features**

- Pluggable architecture with a wide range of community-developed plugins.
- Highly configurable rules to fit any project's coding standards.
- Automatic fixing of rule violations.
- Integrates with most modern code editors and build systems.

### Prettier

- **Library ID**: `/prettier/prettier`
- **Description**: An opinionated code formatter that enforces a consistent style by parsing your code and re-printing it with its own rules.

**Installation**

```bash
npm install --save-dev --save-exact prettier
```

**Basic Usage**

```bash
# Format a single file and write the output to the console
prettier index.js

# Format a single file in-place
prettier --write index.js

# Format all files in a directory
prettier --write .
```

**Configuration (`.prettierrc.json`)**

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**Key Features**

- Supports a wide range of languages and frameworks.
- Integrates with most code editors for on-the-fly formatting.
- Can be run from the command line or as a pre-commit hook.
- Minimal configuration required due to its opinionated nature.

### Husky

- **Library ID**: `/typicode/husky`
- **Description**: A tool that makes it easy to use Git hooks. It allows you to run scripts automatically at different stages of the Git lifecycle, such as before a commit or a push.

**Installation & Setup**

```bash
# 1. Install Husky
npm install husky --save-dev

# 2. Enable Git hooks
npx husky install

# 3. Add a hook
npx husky add .husky/pre-commit "npm test"
```

**Key Features**

- Simple setup and configuration.
- Supports all Git hooks.
- Can be used to run linters, formatters, and tests before committing code.
- Helps to maintain code quality and prevent bad commits.

## Build & Deployment

### Vercel

- **Library ID**: `/websites/vercel`
- **Description**: A cloud platform for frontend developers, providing the tools and infrastructure to build, deploy, and scale web applications and serverless functions with ease.

**Deployment**

```bash
# 1. Install the Vercel CLI
npm i -g vercel

# 2. Deploy the project
vercel
```

**Key Features**

- Git-based workflow for continuous deployment.
- Automatic HTTPS and SSL certificates.
- Global CDN for fast content delivery.
- Serverless functions for backend logic.
- Integrates with popular frameworks like Next.js, React, and Vue.

### Docker

- **Library ID**: `/websites/docs_docker_com`
- **Description**: An open-source platform that enables developers to build, ship, and run applications in containers, ensuring consistency across different environments.

**Basic Dockerfile for a Next.js App**

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Building and Running the Container**

```bash
# Build the Docker image
docker build -t my-next-app .

# Run the Docker container
docker run -p 3000:3000 my-next-app
```

**Key Features**

- Containerization for consistent and portable application environments.
- Docker Hub for sharing and managing container images.
- Docker Compose for defining and running multi-container applications.
- Integration with CI/CD pipelines for automated builds and deployments.

## Notifications & Scheduling

### node-cron

- **Library ID**: `/node-cron/node-cron`
- **Description**: A simple cron-like job scheduler for Node.js. It allows you to schedule tasks to run at specific times or intervals using standard crontab syntax.

**Installation**

```bash
npm install --save node-cron
```

**Key Features**

- Uses standard cron syntax for scheduling.
- Pure JavaScript with no dependencies.
- Supports optional second field for more granular scheduling.

### node-schedule

- **Library ID**: `/node-schedule/node-schedule`
- **Description**: A flexible job scheduler for Node.js that allows for both cron-like and date-based scheduling. It's suitable for scheduling jobs that need to run at a specific date and time.

**Installation**

```bash
npm install node-schedule
```

**Key Features**

- Schedule jobs for specific dates and times.
- Supports recurring jobs with recurrence rules.
- Timezone support for scheduling.

### web-push

- **Library ID**: N/A (Community Standard)
- **Description**: A library for Node.js to send push notifications using the Web Push Protocol. It handles the necessary encryption and protocol requirements for sending push messages to browsers.

**Installation**

```bash
npm install web-push --save
```

**Key Features**

- Implements the Web Push Protocol.
- Encrypts data payloads for secure delivery.
- Manages VAPID headers for application server identification.

## Financial & Payments

### Stripe

- **Library ID**: `/docs.stripe.com/llmstxt`
- **Description**: A suite of payment APIs that powers commerce for online businesses of all sizes. The app uses Stripe for general payment processing and **Stripe Connect** to facilitate payments between users for services.

**Installation**

```bash
# Using npm
npm install --save stripe @stripe/react-stripe-js @stripe/stripe-js
```

**Key Features**

- Comprehensive payment processing for credit cards, debit cards, and other payment methods.
- Subscription and recurring billing management.
- Secure and compliant with PCI-DSS standards.
- Tools for fraud prevention, invoicing, and financial reporting.

### Plaid

- **Library ID**: `/websites/plaid`
- **Description**: A financial technology platform that enables applications to connect with users' bank accounts. It's used to securely access transaction data for financial management features.

**Installation**

```bash
npm install --save plaid
```

**Key Features**

- Securely link to user bank accounts.
- Access real-time transaction data.
- Retrieve account balance and identity information.
- Supports thousands of financial institutions.

### currency.js

- **Library ID**: `/scurker/currency.js`
- **Description**: A lightweight JavaScript library for handling currency values without floating-point inaccuracies. It's used to perform calculations and format monetary values correctly.

**Installation**

```bash
npm install --save currency.js
```

**Key Features**

- Handles currency math with precision.
- Prevents common floating-point errors.
- Simple API for formatting and manipulation.
- No dependencies.

## PWA & Mobile

### Next-PWA

- **Library ID**: `/shadowwalker/next-pwa`
- **Description**: A zero-config PWA plugin for Next.js powered by Workbox, offering optimized caching, offline support, and features to maximize Lighthouse scores.

**Installation**

```bash
npm install next-pwa
```

**Configuration (`next.config.js`)**

```javascript
const withPWA = require("next-pwa")({
  dest: "public",
});

module.exports = withPWA({
  // next.js config
});
```

**Key Features**

- Enables Progressive Web App (PWA) functionality in Next.js applications.
- Powered by Workbox for optimized caching and offline support.
- Zero-configuration setup for easy integration.
- Helps to improve Lighthouse scores for performance and accessibility.

## Database & Storage

### Vercel Blob

- **Library ID**: `/vercel/storage`
- **Description**: A fast, easy, and efficient way to store files in the cloud. Vercel Blob allows you to upload and serve files from a globally distributed network.

**Installation**

```bash
npm install @vercel/blob
```

**Basic Usage (Uploading a file)**

```javascript
import { put } from "@vercel/blob";

const blob = await put("articles/hello-world.txt", "Hello World!", {
  access: "public",
});
```

**Key Features**

- Globally distributed storage for fast file access.
- Simple API for uploading, downloading, and managing files.
- Automatic caching and CDN integration.
- Secure and private by default.

## Environment & Config

### dotenv

- **Library ID**: `motdotla/dotenv` (Note: From general knowledge due to service unavailability)
- **Description**: A zero-dependency module that loads environment variables from a `.env` file into `process.env`.

**Installation**

```bash
npm install dotenv
```

**Basic Usage**

```javascript
// index.js
require("dotenv").config();

console.log(process.env.DB_HOST);
```

**.env file**

```
DB_HOST=localhost
DB_USER=root
DB_PASS=s1mpl3
```

**Key Features**

- Simple way to manage environment-specific variables.
- Keeps sensitive credentials out of your codebase.
- Easy to use and integrate into any Node.js project.

## Scheduling

### Cal.com

- **Library ID**: `/calcom/cal.com`
- **Description**: An open-source scheduling platform that allows users to manage their calendars, book appointments, and automate scheduling workflows.

**Installation (Self-Hosted with Docker)**

```bash
# Quick start with Docker development environment
yarn dx
```

**Key Features**

- Self-hostable for full data control and privacy.
- Customizable booking pages and event types.
- Integrates with popular calendar services (Google, Outlook, etc.).
- API for programmatic access to scheduling features.
- Workflow automation for reminders, follow-ups, and more.

## Architecture Decisions & Best Practices

### Core Architecture Patterns

**Unified Agent System**
The architecture uses a centralized agent approach that handles multiple communication channels (voice, SMS, chat) through a single interface. This provides consistency and reduces complexity.

**Best Practices:**

- Use Redis for session management and conversation memory
- Implement proper error boundaries for each communication channel
- Design stateless handlers that can be easily scaled

**Event-Driven Architecture**

```typescript
// Example: BullMQ job processing pattern
import { Queue, Worker } from "bullmq";

const notificationQueue = new Queue("notifications", {
  connection: { host: "redis-host", port: 6379 },
});

// Producer
await notificationQueue.add("send-reminder", {
  userId: "user123",
  type: "medication",
  scheduledTime: new Date(),
});

// Consumer
const worker = new Worker(
  "notifications",
  async (job) => {
    const { userId, type, scheduledTime } = job.data;
    // Process notification logic
  },
  { connection: { host: "redis-host", port: 6379 } },
);
```

### Integration Patterns

**Voice AI Integration (Retell SDK)**

```typescript
// Retell agent configuration
const retellConfig = {
  agent_id: process.env.RETELL_AGENT_ID,
  voice_id: "voice_id",
  response_engine: {
    type: "retell-llm",
    llm_websocket_url: `${process.env.BASE_URL}/api/llm-websocket`,
  },
};

// WebSocket handler for LLM integration
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const server = new WebSocketServer({ port: 8080 });

    server.on("connection", (ws) => {
      ws.on("message", async (data) => {
        const message = JSON.parse(data.toString());
        // Process with Anthropic/Vercel AI SDK
        const response = await generateResponse(message.transcript);
        ws.send(JSON.stringify({ response }));
      });
    });
  }
}
```

**Health Data Integration Pattern**

```typescript
// iOS HealthKit integration
import { HealthKit } from "@react-native-async-storage/async-storage";

const syncHealthData = async () => {
  try {
    const permissions = {
      permissions: {
        read: [
          HealthKit.Constants.Permissions.Steps,
          HealthKit.Constants.Permissions.HeartRate,
        ],
        write: [],
      },
    };

    await HealthKit.initHealthKit(permissions);
    const steps = await HealthKit.getStepCount({
      startDate: new Date().toISOString(),
    });

    // Sync to Supabase
    await supabase.from("health_metrics").insert({
      user_id: userId,
      metric_type: "steps",
      value: steps.value,
      recorded_at: new Date(),
    });
  } catch (error) {
    console.error("Health sync failed:", error);
  }
};
```

**Real-time Communication Pattern**

```typescript
// Socket.IO with Redis adapter for scaling
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

const io = new Server(server, {
  adapter: createAdapter(pubClient, subClient),
});

io.on("connection", (socket) => {
  socket.on("join-care-session", (caregiverId) => {
    socket.join(`caregiver-${caregiverId}`);
  });

  socket.on("emergency-alert", (data) => {
    io.to(`caregiver-${data.caregiverId}`).emit("emergency", data);
  });
});
```

### Database Architecture Best Practices

**Supabase Schema Design**

```sql
-- Users and relationships
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('caregiver', 'care_recipient')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Care relationships
CREATE TABLE care_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID REFERENCES users(id),
  care_recipient_id UUID REFERENCES users(id),
  relationship_type TEXT,
  status TEXT DEFAULT 'active'
);

-- Conversation memory for AI agents
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id TEXT NOT NULL,
  messages JSONB NOT NULL,
  context JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Redis Data Patterns**

```typescript
// Conversation memory pattern
const conversationKey = `conversation:${sessionId}`;
await redis.hset(conversationKey, {
  messages: JSON.stringify(messages),
  context: JSON.stringify(context),
  last_activity: Date.now(),
});
await redis.expire(conversationKey, 3600); // 1 hour TTL

// Job queue pattern for scheduled tasks
const scheduleReminder = async (
  userId: string,
  reminderData: any,
  scheduledTime: Date,
) => {
  await reminderQueue.add(
    "send-reminder",
    {
      userId,
      ...reminderData,
    },
    {
      delay: scheduledTime.getTime() - Date.now(),
    },
  );
};
```

### Mobile App Architecture

**State Management Pattern**

```typescript
// Context-based state management for health data
interface HealthContextType {
  metrics: HealthMetric[];
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSync: Date | null;
}

const HealthContext = createContext<HealthContextType | null>(null);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<HealthContextType>({
    metrics: [],
    syncStatus: 'idle',
    lastSync: null
  });

  const syncHealthData = useCallback(async () => {
    setState(prev => ({ ...prev, syncStatus: 'syncing' }));
    try {
      const data = await fetchHealthMetrics();
      setState(prev => ({
        ...prev,
        metrics: data,
        syncStatus: 'idle',
        lastSync: new Date()
      }));
    } catch (error) {
      setState(prev => ({ ...prev, syncStatus: 'error' }));
    }
  }, []);

  return (
    <HealthContext.Provider value={{ ...state, syncHealthData }}>
      {children}
    </HealthContext.Provider>
  );
};
```

**Background Processing Pattern**

```typescript
// Background task registration
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";

const BACKGROUND_SYNC_TASK = "background-health-sync";

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const healthData = await syncHealthMetrics();
    await uploadToSupabase(healthData);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register background task
await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
  minimumInterval: 15 * 60, // 15 minutes
  stopOnTerminate: false,
  startOnBoot: true,
});
```

### Security & Monitoring Best Practices

**Webhook Verification Pattern**

```typescript
import crypto from "crypto";

export const verifyWebhook = (
  payload: string,
  signature: string,
  secret: string,
): boolean => {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
};
```

**Error Monitoring Integration**

```typescript
import * as Sentry from '@sentry/nextjs';

// Custom error boundary for voice AI
export const VoiceErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div>
          <p>Voice service temporarily unavailable</p>
          <button onClick={resetError}>Retry</button>
        </div>
      )}
      beforeCapture={(scope) => {
        scope.setTag('component', 'voice-ai');
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};
```

This architecture emphasizes scalability, real-time capabilities, and robust error handling essential for a healthcare application. The patterns shown provide a foundation for building reliable, maintainable systems that can handle the critical nature of caregiving applications while ensuring data privacy and system reliability.

## Troubleshooting Common Issues

### Voice AI & Real-time Communication

**Retell SDK Connection Issues**

```typescript
// Debug WebSocket connection problems
const debugRetellConnection = () => {
  const ws = new WebSocket(process.env.RETELL_WEBSOCKET_URL);

  ws.onopen = () => {
    console.log("[v0] Retell WebSocket connected");
  };

  ws.onerror = (error) => {
    console.error("[v0] Retell WebSocket error:", error);
    // Common fixes:
    // 1. Check RETELL_AGENT_ID environment variable
    // 2. Verify webhook URL is publicly accessible
    // 3. Ensure proper SSL certificate for production
  };

  ws.onclose = (event) => {
    console.log("[v0] Retell WebSocket closed:", event.code, event.reason);
    if (event.code === 1006) {
      // Abnormal closure - likely network issue
      setTimeout(() => debugRetellConnection(), 5000); // Retry
    }
  };
};
```

**Audio Quality Issues**

```typescript
// WebRTC audio troubleshooting
const diagnoseAudioIssues = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000, // Retell prefers 16kHz
      },
    });

    const audioContext = new AudioContext({ sampleRate: 16000 });
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    // Check audio levels
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

    if (average < 10) {
      console.warn("[v0] Low audio input detected");
      // Suggest microphone permission check
    }
  } catch (error) {
    console.error("[v0] Audio access denied:", error);
    // Handle permission denied gracefully
  }
};
```

### Mobile App Issues

**Health Data Sync Failures**

```typescript
// iOS HealthKit troubleshooting
const troubleshootHealthKit = async () => {
  try {
    const isAvailable = await HealthKit.isHealthDataAvailable();
    if (!isAvailable) {
      throw new Error("HealthKit not available on this device");
    }

    const permissions = await HealthKit.getRequestStatusForAuthorization({
      read: [HealthKit.Constants.Permissions.Steps],
    });

    console.log("[v0] HealthKit permissions:", permissions);

    if (permissions === HealthKit.Constants.AuthorizationStatus.NotDetermined) {
      // Request permissions again
      await HealthKit.requestAuthorization({
        permissions: { read: [HealthKit.Constants.Permissions.Steps] },
      });
    }
  } catch (error) {
    console.error("[v0] HealthKit error:", error);
    // Fallback to manual entry
    showManualHealthDataEntry();
  }
};

// Android Health Connect troubleshooting
const troubleshootHealthConnect = async () => {
  try {
    const isAvailable = await HealthConnect.isAvailable();
    if (!isAvailable) {
      // Guide user to install Health Connect
      showHealthConnectInstallPrompt();
      return;
    }

    const hasPermissions = await HealthConnect.hasPermissions([
      { accessType: "read", recordType: "Steps" },
    ]);

    if (!hasPermissions) {
      await HealthConnect.requestPermissions([
        { accessType: "read", recordType: "Steps" },
      ]);
    }
  } catch (error) {
    console.error("[v0] Health Connect error:", error);
  }
};
```

**Background Task Failures**

```typescript
// Debug background processing
const debugBackgroundTasks = async () => {
  const taskStatus = await TaskManager.getTaskOptionsAsync(
    "background-health-sync",
  );
  console.log("[v0] Background task status:", taskStatus);

  if (!taskStatus) {
    console.warn("[v0] Background task not registered");
    // Re-register the task
    await registerBackgroundTask();
  }

  // Check background app refresh settings
  const backgroundRefreshStatus = await BackgroundFetch.getStatusAsync();
  if (
    backgroundRefreshStatus === BackgroundFetch.BackgroundFetchStatus.Denied
  ) {
    // Show user instructions to enable background refresh
    showBackgroundRefreshInstructions();
  }
};
```

### Database & Redis Issues

**Supabase Connection Problems**

```typescript
// Supabase connection diagnostics
const diagnoseSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (error) {
      console.error("[v0] Supabase error:", error);

      if (error.code === "PGRST301") {
        // Row Level Security issue
        console.warn("[v0] RLS policy blocking query");
      } else if (error.code === "42P01") {
        // Table doesn't exist
        console.error("[v0] Table not found - run migrations");
      }
    } else {
      console.log("[v0] Supabase connection healthy");
    }
  } catch (networkError) {
    console.error("[v0] Network error connecting to Supabase:", networkError);
    // Implement offline mode
    enableOfflineMode();
  }
};
```

**Redis Connection Issues**

```typescript
// Redis connection troubleshooting
const troubleshootRedis = async () => {
  const redis = new Redis(process.env.REDIS_URL);

  redis.on("connect", () => {
    console.log("[v0] Redis connected");
  });

  redis.on("error", (error) => {
    console.error("[v0] Redis error:", error);

    if (error.code === "ECONNREFUSED") {
      console.error("[v0] Redis server not running or unreachable");
    } else if (error.code === "NOAUTH") {
      console.error("[v0] Redis authentication failed");
    }
  });

  redis.on("reconnecting", (delay) => {
    console.log(`[v0] Redis reconnecting in ${delay}ms`);
  });

  // Test basic operations
  try {
    await redis.set("health-check", "ok", "EX", 10);
    const result = await redis.get("health-check");
    console.log("[v0] Redis health check:", result);
  } catch (error) {
    console.error("[v0] Redis operation failed:", error);
  }
};
```

### Notification Delivery Issues

**Push Notification Debugging**

```typescript
// Debug notification delivery
const debugNotifications = async () => {
  // Check device registration
  const token = await Notifications.getExpoPushTokenAsync();
  console.log("[v0] Push token:", token);

  // Test local notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification",
      body: "Testing notification system",
    },
    trigger: { seconds: 1 },
  });

  // Check notification permissions
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    console.warn("[v0] Notification permissions not granted");
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    console.log("[v0] New permission status:", newStatus);
  }

  // Verify server-side delivery
  try {
    const response = await fetch("/api/test-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.data }),
    });

    if (!response.ok) {
      console.error("[v0] Server notification test failed:", response.status);
    }
  } catch (error) {
    console.error("[v0] Notification API error:", error);
  }
};
```

### Authentication & Security Issues

**JWT Token Problems**

```typescript
// Debug authentication flow
const debugAuth = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("[v0] Auth session error:", error);
    return;
  }

  if (!session) {
    console.warn("[v0] No active session");
    // Redirect to login
    return;
  }

  // Check token expiry
  const now = Math.floor(Date.now() / 1000);
  if (session.expires_at && session.expires_at < now) {
    console.warn("[v0] Token expired, refreshing...");

    const { data, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      console.error("[v0] Token refresh failed:", refreshError);
      // Force re-login
      await supabase.auth.signOut();
    }
  }

  console.log("[v0] Auth session valid:", session.user.id);
};
```

**Webhook Verification Failures**

```typescript
// Debug webhook signature verification
const debugWebhookVerification = (req: NextApiRequest) => {
  const signature = req.headers["stripe-signature"] as string;
  const payload = JSON.stringify(req.body);

  console.log("[v0] Webhook signature:", signature);
  console.log("[v0] Payload length:", payload.length);

  try {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET!)
      .update(payload)
      .digest("hex");

    console.log("[v0] Expected signature:", expectedSignature);

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature.split("=")[1], "hex"),
      Buffer.from(expectedSignature, "hex"),
    );

    console.log("[v0] Signature valid:", isValid);
    return isValid;
  } catch (error) {
    console.error("[v0] Signature verification error:", error);
    return false;
  }
};
```

### Performance & Memory Issues

**Memory Leak Detection**

```typescript
// Monitor memory usage in React Native
const monitorMemoryUsage = () => {
  if (__DEV__) {
    setInterval(() => {
      const memoryUsage = performance.memory;
      console.log("[v0] Memory usage:", {
        used: Math.round(memoryUsage.usedJSHeapSize / 1024 / 1024) + "MB",
        total: Math.round(memoryUsage.totalJSHeapSize / 1024 / 1024) + "MB",
        limit: Math.round(memoryUsage.jsHeapSizeLimit / 1024 / 1024) + "MB",
      });

      // Alert if memory usage is high
      if (memoryUsage.usedJSHeapSize / memoryUsage.jsHeapSizeLimit > 0.8) {
        console.warn("[v0] High memory usage detected");
      }
    }, 30000); // Check every 30 seconds
  }
};
```

### Common Quick Fixes

**Environment Variables Checklist**

```shellscript
# Essential environment variables to verify
SUPABASE_URL=
SUPABASE_ANON_KEY=
REDIS_URL=
RETELL_AGENT_ID=
RETELL_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SENTRY_DSN=
```

**Network Connectivity Issues**

```typescript
// Network status monitoring
const monitorNetworkStatus = () => {
  const handleNetworkChange = (isConnected: boolean) => {
    console.log("[v0] Network status:", isConnected ? "online" : "offline");

    if (!isConnected) {
      // Enable offline mode
      enableOfflineMode();
    } else {
      // Sync pending data
      syncPendingData();
    }
  };

  NetInfo.addEventListener(handleNetworkChange);
};
```

These troubleshooting patterns help identify and resolve the most common issues in complex healthcare applications. The key is implementing comprehensive logging and graceful error handling to maintain system reliability even when individual components fail.
