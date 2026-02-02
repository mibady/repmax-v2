# Mobile Notifications PRP - Rich Notification System

## Goal

Build a comprehensive notification system for mobile platforms that delivers timely, actionable, and context-aware notifications with rich media, quick actions, and intelligent scheduling to support caregiving tasks without overwhelming users.

## Why

- **Timely Reminders**: Never miss medications or appointments
- **Smart Scheduling**: Notifications at optimal times based on user patterns
- **Rich Interactions**: Take action directly from notifications
- **Family Coordination**: Real-time updates across care team
- **Critical Alerts**: Emergency notifications that break through DND
- **Intelligent Bundling**: Group related notifications to reduce noise

## What (User-Visible Behavior)

- **Medication Reminders**: "Time for Mom's Metformin - 500mg" with Mark Taken button
- **Appointment Alerts**: "Dr. Smith appointment in 1 hour" with navigation
- **Family Updates**: "John marked morning medications as complete"
- **Voice Replies**: Reply to notifications with voice messages
- **Rich Media**: Photos of medications, maps to appointments
- **Smart Timing**: Learns best times to send non-urgent notifications
- **Critical Bypass**: Emergency alerts always get through

## All Needed Context

### Documentation References

- Expo Notifications: https://docs.expo.dev/versions/latest/sdk/notifications/
- Notifee: https://notifee.app/react-native/docs/overview
- OneSignal: https://documentation.onesignal.com/docs
- iOS User Notifications: https://developer.apple.com/documentation/usernotifications
- Android Notifications: https://developer.android.com/develop/ui/views/notifications
- Firebase Cloud Messaging: https://firebase.google.com/docs/cloud-messaging

### Package Dependencies

```json
{
  "dependencies": {
    "expo-notifications": "~0.27.0",
    "@notifee/react-native": "^7.8.0",
    "react-native-push-notification": "^8.1.1",
    "@react-native-firebase/messaging": "^18.7.0",
    "@react-native-firebase/app": "^18.7.0",
    "react-native-onesignal": "^5.0.0",
    "expo-task-manager": "~11.7.0",
    "expo-background-fetch": "~11.7.0",
    "@react-native-community/push-notification-ios": "^1.11.0"
  }
}
```

## Implementation Blueprint

### 1. Notification Service Architecture (src/services/notifications/NotificationService.ts)

```typescript
import * as Notifications from "expo-notifications";
import notifee, {
  AndroidImportance,
  AndroidCategory,
  TimestampTrigger,
  IntervalTrigger,
  EventType,
} from "@notifee/react-native";
import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Determine if notification should be shown
    const shouldShow = await shouldShowNotification(notification);

    return {
      shouldShowAlert: shouldShow,
      shouldPlaySound: notification.request.content.data?.playSound ?? true,
      shouldSetBadge: notification.request.content.data?.setBadge ?? true,
      priority: notification.request.content.data?.priority ?? "default",
    };
  },
});

export class NotificationService {
  private static instance: NotificationService;
  private notificationChannels: Map<string, string> = new Map();
  private userPreferences: UserNotificationPreferences | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize() {
    // Request permissions
    await this.requestPermissions();

    // Create notification channels (Android)
    if (Platform.OS === "android") {
      await this.createAndroidChannels();
    }

    // Register for remote notifications
    await this.registerForPushNotifications();

    // Set up notification listeners
    this.setupNotificationListeners();

    // Load user preferences
    await this.loadUserPreferences();

    // Schedule recurring notifications
    await this.scheduleRecurringNotifications();
  }

  private async createAndroidChannels() {
    // Critical channel for emergencies
    await notifee.createChannel({
      id: "critical",
      name: "Critical Alerts",
      importance: AndroidImportance.HIGH,
      sound: "emergency",
      vibration: true,
      vibrationPattern: [300, 500, 300, 500],
      bypassDnd: true,
    });

    // Medication reminders channel
    await notifee.createChannel({
      id: "medications",
      name: "Medication Reminders",
      importance: AndroidImportance.HIGH,
      sound: "medication_reminder",
      badge: true,
      category: AndroidCategory.REMINDER,
    });

    // Appointments channel
    await notifee.createChannel({
      id: "appointments",
      name: "Appointments",
      importance: AndroidImportance.DEFAULT,
      sound: "appointment",
      badge: true,
      category: AndroidCategory.EVENT,
    });

    // Family updates channel
    await notifee.createChannel({
      id: "family",
      name: "Family Updates",
      importance: AndroidImportance.LOW,
      badge: false,
      category: AndroidCategory.SOCIAL,
    });

    // Store channel IDs
    this.notificationChannels.set("critical", "critical");
    this.notificationChannels.set("medications", "medications");
    this.notificationChannels.set("appointments", "appointments");
    this.notificationChannels.set("family", "family");
  }

  async scheduleMedicationReminder(medication: Medication) {
    const { id, name, dosage, times, instructions, imageUrl } = medication;

    for (const time of times) {
      const [hours, minutes] = time.split(":").map(Number);
      const trigger = {
        type: "daily",
        hour: hours,
        minute: minutes,
      };

      // iOS notification
      if (Platform.OS === "ios") {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "💊 Medication Reminder",
            body: `Time for ${name} - ${dosage}`,
            data: {
              medicationId: id,
              type: "medication",
              actionButtons: ["taken", "snooze"],
            },
            sound: "medication_reminder.wav",
            attachments: imageUrl ? [{ url: imageUrl }] : [],
            categoryIdentifier: "MEDICATION_CATEGORY",
          },
          trigger,
          identifier: `med-${id}-${time}`,
        });
      }

      // Android notification with Notifee
      if (Platform.OS === "android") {
        await notifee.createTriggerNotification(
          {
            id: `med-${id}-${time}`,
            title: "💊 Medication Reminder",
            body: `Time for ${name} - ${dosage}`,
            subtitle: instructions,
            android: {
              channelId: "medications",
              smallIcon: "ic_medication",
              largeIcon: imageUrl,
              pressAction: {
                id: "default",
                launchActivity: "default",
              },
              actions: [
                {
                  title: "✓ Mark as Taken",
                  pressAction: {
                    id: "mark-taken",
                    launchActivity: "default",
                  },
                },
                {
                  title: "⏰ Snooze 15 min",
                  pressAction: {
                    id: "snooze",
                  },
                },
              ],
              style: imageUrl
                ? {
                    type: AndroidStyle.BIGPICTURE,
                    picture: imageUrl,
                  }
                : undefined,
            },
            ios: {
              attachments: imageUrl ? [{ url: imageUrl }] : [],
              categoryId: "MEDICATION_CATEGORY",
              sound: "medication_reminder.wav",
            },
          },
          trigger,
        );
      }
    }
  }

  async sendCriticalAlert(alert: CriticalAlert) {
    // Critical alerts bypass DND and mute switches
    if (Platform.OS === "ios") {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🚨 " + alert.title,
          body: alert.body,
          sound: {
            critical: true,
            name: "emergency.wav",
            volume: 1.0,
          },
          data: {
            type: "critical",
            alertId: alert.id,
            requiresAction: true,
          },
        },
        trigger: null, // Immediate
      });
    } else {
      await notifee.displayNotification({
        title: "🚨 " + alert.title,
        body: alert.body,
        android: {
          channelId: "critical",
          importance: AndroidImportance.HIGH,
          fullScreenAction: {
            id: "default",
            mainComponent: "EmergencyScreen",
          },
          ongoing: true,
          autoCancel: false,
          color: "#FF0000",
        },
      });
    }

    // Also trigger haptic feedback
    if (Platform.OS === "ios") {
      const { Haptics } = require("expo-haptics");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      const { Vibration } = require("react-native");
      Vibration.vibrate([0, 500, 200, 500, 200, 500]);
    }
  }

  async scheduleSmartNotification(notification: SmartNotification) {
    // Analyze user patterns to find optimal time
    const optimalTime = await this.findOptimalNotificationTime(
      notification.userId,
      notification.priority,
    );

    // Check quiet hours
    if (this.isQuietHours() && notification.priority !== "critical") {
      // Delay until end of quiet hours
      const delayedTime = this.getEndOfQuietHours();
      notification.scheduledFor = delayedTime;
    }

    // Bundle with similar notifications if appropriate
    if (notification.bundleKey) {
      await this.addToBundledNotification(notification);
      return;
    }

    // Schedule the notification
    await this.scheduleNotification(notification, optimalTime);
  }

  private async findOptimalNotificationTime(
    userId: string,
    priority: string,
  ): Promise<Date> {
    // Query user interaction patterns
    const { data: patterns } = await supabase
      .from("notification_interactions")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // Last 30 days

    // Analyze patterns with ML
    const optimalHours = this.analyzeInteractionPatterns(patterns);

    // Return next optimal slot
    const now = new Date();
    const optimal = new Date(now);

    if (priority === "high") {
      // High priority: within next hour
      optimal.setMinutes(optimal.getMinutes() + 15);
    } else if (priority === "medium") {
      // Medium priority: within next 4 hours at optimal time
      const targetHour = optimalHours[0];
      optimal.setHours(targetHour);
    } else {
      // Low priority: next day at optimal time
      optimal.setDate(optimal.getDate() + 1);
      optimal.setHours(optimalHours[0]);
    }

    return optimal;
  }
}
```

### 2. Rich Notification Actions (src/services/notifications/NotificationActions.ts)

```typescript
import notifee, { EventType, Event } from "@notifee/react-native";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export class NotificationActionHandler {
  static async initialize() {
    // iOS: Register notification categories
    if (Platform.OS === "ios") {
      await Notifications.setNotificationCategoryAsync("MEDICATION_CATEGORY", [
        {
          identifier: "mark-taken",
          buttonTitle: "Mark as Taken",
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: "snooze",
          buttonTitle: "Snooze 15 min",
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: "skip",
          buttonTitle: "Skip",
          options: {
            isDestructive: true,
            opensAppToForeground: false,
          },
        },
      ]);

      await Notifications.setNotificationCategoryAsync("APPOINTMENT_CATEGORY", [
        {
          identifier: "navigate",
          buttonTitle: "Get Directions",
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: "call-office",
          buttonTitle: "Call Office",
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: "reschedule",
          buttonTitle: "Reschedule",
          options: {
            opensAppToForeground: true,
          },
        },
      ]);
    }

    // Android: Handled via Notifee in notification creation

    // Set up action handlers
    this.setupActionHandlers();
  }

  private static setupActionHandlers() {
    // Notifee action handler (Android + iOS)
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      const { notification, pressAction } = detail;

      switch (type) {
        case EventType.ACTION_PRESS:
          await this.handleActionPress(pressAction.id, notification);
          break;

        case EventType.DISMISSED:
          await this.handleNotificationDismissed(notification);
          break;

        case EventType.DELIVERED:
          await this.trackNotificationDelivered(notification);
          break;
      }
    });

    // Expo notifications response handler
    Notifications.addNotificationResponseReceivedListener((response) => {
      const { actionIdentifier, notification } = response;
      this.handleActionPress(actionIdentifier, notification.request.content);
    });
  }

  private static async handleActionPress(actionId: string, notification: any) {
    switch (actionId) {
      case "mark-taken":
        await this.markMedicationTaken(notification.data?.medicationId);
        break;

      case "snooze":
        await this.snoozeMedication(notification.data?.medicationId);
        break;

      case "navigate":
        await this.openNavigation(notification.data?.address);
        break;

      case "call-office":
        await this.callPhoneNumber(notification.data?.phoneNumber);
        break;

      case "reschedule":
        await this.openRescheduling(notification.data?.appointmentId);
        break;

      default:
        // Open app to relevant screen
        await this.navigateToScreen(notification.data?.screen);
    }
  }

  private static async markMedicationTaken(medicationId: string) {
    // Update database
    await supabase.from("medication_logs").insert({
      medication_id: medicationId,
      taken_at: new Date().toISOString(),
      taken_via: "notification",
    });

    // Cancel future reminders for today
    await notifee.cancelNotification(`med-${medicationId}-today`);

    // Send confirmation notification
    await notifee.displayNotification({
      title: "✅ Medication Recorded",
      body: "Marked as taken successfully",
      android: {
        channelId: "confirmations",
        smallIcon: "ic_check",
        timeoutAfter: 3000,
      },
    });
  }

  private static async snoozeMedication(medicationId: string) {
    // Schedule new notification in 15 minutes
    const trigger = TimestampTrigger.fromDate(
      new Date(Date.now() + 15 * 60 * 1000),
    );

    await notifee.createTriggerNotification(
      {
        id: `med-${medicationId}-snooze`,
        title: "💊 Snoozed Reminder",
        body: "Time for your medication",
        android: {
          channelId: "medications",
          ongoing: true,
        },
      },
      trigger,
    );
  }
}
```

### 3. iOS Rich Notifications (ios/NotificationServiceExtension.swift)

```swift
import UserNotifications
import UIKit

class NotificationService: UNNotificationServiceExtension {
    var contentHandler: ((UNNotificationContent) -> Void)?
    var bestAttemptContent: UNMutableNotificationContent?

    override func didReceive(
        _ request: UNNotificationRequest,
        withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
    ) {
        self.contentHandler = contentHandler
        bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)

        guard let bestAttemptContent = bestAttemptContent else {
            contentHandler(request.content)
            return
        }

        // Enhance notification based on type
        if let notificationType = bestAttemptContent.userInfo["type"] as? String {
            switch notificationType {
            case "medication":
                enhanceMedicationNotification(bestAttemptContent)
            case "appointment":
                enhanceAppointmentNotification(bestAttemptContent)
            case "family_update":
                enhanceFamilyNotification(bestAttemptContent)
            default:
                break
            }
        }

        contentHandler(bestAttemptContent)
    }

    func enhanceMedicationNotification(_ content: UNMutableNotificationContent) {
        // Add medication image
        if let imageUrl = content.userInfo["imageUrl"] as? String,
           let url = URL(string: imageUrl) {
            downloadAndAttachImage(url: url, to: content)
        }

        // Add custom sound
        content.sound = UNNotificationSound(named: "medication_reminder.wav")

        // Add haptic feedback
        if #available(iOS 13.0, *) {
            content.targetContentIdentifier = "medication"
        }
    }

    func enhanceAppointmentNotification(_ content: UNMutableNotificationContent) {
        // Add map preview
        if let address = content.userInfo["address"] as? String {
            attachMapPreview(for: address, to: content)
        }

        // Add calendar integration
        content.categoryIdentifier = "APPOINTMENT_CATEGORY"

        // Add time-sensitive flag
        if #available(iOS 15.0, *) {
            content.interruptionLevel = .timeSensitive
        }
    }

    func attachMapPreview(for address: String, to content: UNMutableNotificationContent) {
        // Generate map snapshot
        let mapSnapshotOptions = MKMapSnapshotter.Options()

        // Geocode address
        let geocoder = CLGeocoder()
        geocoder.geocodeAddressString(address) { placemarks, error in
            guard let placemark = placemarks?.first,
                  let location = placemark.location else { return }

            mapSnapshotOptions.region = MKCoordinateRegion(
                center: location.coordinate,
                latitudinalMeters: 1000,
                longitudinalMeters: 1000
            )

            let snapshotter = MKMapSnapshotter(options: mapSnapshotOptions)
            snapshotter.start { snapshot, error in
                guard let snapshot = snapshot else { return }

                // Save and attach image
                if let attachment = self.saveImageAsAttachment(snapshot.image) {
                    content.attachments = [attachment]
                }
            }
        }
    }
}
```

### 4. Android Rich Notifications (android/RichNotificationService.kt)

```kotlin
package com.caregivingcompanion.notifications

import android.app.Notification
import android.app.PendingIntent
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.core.app.NotificationCompat
import androidx.core.app.Person
import androidx.core.graphics.drawable.IconCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import java.net.URL

class RichNotificationService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        val data = remoteMessage.data
        val notificationType = data["type"] ?: return

        when (notificationType) {
            "medication" -> showMedicationNotification(data)
            "appointment" -> showAppointmentNotification(data)
            "family_message" -> showFamilyMessageNotification(data)
            "emergency" -> showEmergencyNotification(data)
        }
    }

    private fun showMedicationNotification(data: Map<String, String>) {
        val medicationName = data["medication_name"] ?: ""
        val dosage = data["dosage"] ?: ""
        val imageUrl = data["image_url"]

        val builder = NotificationCompat.Builder(this, "medications")
            .setSmallIcon(R.drawable.ic_medication)
            .setContentTitle("💊 Medication Reminder")
            .setContentText("Time for $medicationName - $dosage")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setAutoCancel(false)
            .setOngoing(true)

        // Add medication image if available
        imageUrl?.let {
            val bitmap = loadBitmapFromUrl(it)
            bitmap?.let { bmp ->
                builder.setLargeIcon(bmp)
                builder.setStyle(
                    NotificationCompat.BigPictureStyle()
                        .bigPicture(bmp)
                        .bigLargeIcon(null)
                )
            }
        }

        // Add action buttons
        val takenIntent = Intent(this, NotificationActionReceiver::class.java).apply {
            action = "MEDICATION_TAKEN"
            putExtra("medication_id", data["medication_id"])
        }
        val takenPendingIntent = PendingIntent.getBroadcast(
            this, 0, takenIntent, PendingIntent.FLAG_UPDATE_CURRENT
        )

        val snoozeIntent = Intent(this, NotificationActionReceiver::class.java).apply {
            action = "MEDICATION_SNOOZE"
            putExtra("medication_id", data["medication_id"])
        }
        val snoozePendingIntent = PendingIntent.getBroadcast(
            this, 1, snoozeIntent, PendingIntent.FLAG_UPDATE_CURRENT
        )

        builder.addAction(
            R.drawable.ic_check,
            "Mark as Taken",
            takenPendingIntent
        )
        builder.addAction(
            R.drawable.ic_snooze,
            "Snooze 15 min",
            snoozePendingIntent
        )

        // Show notification
        notificationManager.notify(
            data["medication_id"]?.hashCode() ?: 0,
            builder.build()
        )
    }

    private fun showFamilyMessageNotification(data: Map<String, String>) {
        val senderName = data["sender_name"] ?: "Family Member"
        val message = data["message"] ?: ""
        val senderPhoto = data["sender_photo"]

        // Create messaging style notification
        val person = Person.Builder()
            .setName(senderName)
            .setIcon(senderPhoto?.let {
                IconCompat.createWithBitmap(loadBitmapFromUrl(it))
            })
            .build()

        val messagingStyle = NotificationCompat.MessagingStyle(person)
            .addMessage(message, System.currentTimeMillis(), person)

        val builder = NotificationCompat.Builder(this, "family")
            .setSmallIcon(R.drawable.ic_family)
            .setStyle(messagingStyle)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)

        // Add direct reply action
        val replyIntent = Intent(this, DirectReplyReceiver::class.java)
        val replyPendingIntent = PendingIntent.getBroadcast(
            this, 0, replyIntent, PendingIntent.FLAG_UPDATE_CURRENT
        )

        val remoteInput = RemoteInput.Builder("reply_text")
            .setLabel("Reply")
            .build()

        val replyAction = NotificationCompat.Action.Builder(
            R.drawable.ic_reply,
            "Reply",
            replyPendingIntent
        ).addRemoteInput(remoteInput).build()

        builder.addAction(replyAction)

        notificationManager.notify(
            data["thread_id"]?.hashCode() ?: 0,
            builder.build()
        )
    }
}
```

## Task Checklist

### Core Setup

- [ ] Configure notification permissions
- [ ] Set up push notification services
- [ ] Create notification channels
- [ ] Implement notification categories
- [ ] Configure background handlers

### Rich Notifications

- [ ] Medication reminders with images
- [ ] Appointment alerts with maps
- [ ] Family updates with avatars
- [ ] Voice reply support
- [ ] Quick action buttons

### Smart Features

- [ ] Optimal timing algorithm
- [ ] Quiet hours respect
- [ ] Notification bundling
- [ ] Priority-based delivery
- [ ] Learning from interactions

### Platform-Specific

- [ ] iOS notification extensions
- [ ] Android notification channels
- [ ] Critical alerts (iOS)
- [ ] Full-screen intents (Android)
- [ ] Notification badges

### Advanced Features

- [ ] Geofence-triggered notifications
- [ ] Wear OS/Apple Watch support
- [ ] CarPlay/Android Auto alerts
- [ ] Progressive notification escalation
- [ ] Family broadcast system

## Validation Loop

### Level 1: Local Testing

```bash
npm test -- notifications/scheduler
npm test -- notifications/actions
npm test -- notifications/delivery
```

### Level 2: Platform Testing

```bash
# iOS
npm run ios:test:notifications
npm run ios:test:critical-alerts

# Android
npm run android:test:channels
npm run android:test:rich-notifications
```

### Level 3: End-to-End

```bash
npm run test:e2e:medication-flow
npm run test:e2e:appointment-alerts
npm run test:e2e:family-updates
```

## Success Metrics

- [ ] 99% delivery rate for critical alerts
- [ ] < 2 second notification display time
- [ ] 80% interaction rate with actions
- [ ] Smart timing improves engagement 40%
- [ ] Zero missed critical medications
- [ ] Battery impact < 1% daily

## Common Gotchas

- iOS requires notification service extension for rich content
- Android 13+ needs runtime notification permission
- Critical alerts require special App Store approval
- Background notification handlers have time limits
- Deep links must handle cold app starts
- FCM tokens expire and need refresh
- Notification channels cannot be modified after creation
