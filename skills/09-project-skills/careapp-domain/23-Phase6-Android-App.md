# Android App PRP - Caregiving Companion for Google Play

## Goal

Develop and deploy a native Android application that delivers a Pi.ai-like conversational caregiving experience with Material Design 3, Android-specific features, and seamless integration with Google services, targeting Android 7.0+ (API 24+) with optimization for Android 14 (API 34).

## Why

- **Reach 3B+ Android Users**: Access the largest mobile platform globally
- **Google Integration**: Leverage Google Assistant, Fit, Calendar, and more
- **Material You**: Deliver personalized, adaptive UI with dynamic theming
- **Background Services**: Run continuous health monitoring and voice services
- **Wear OS Support**: Extend to smartwatches for health tracking
- **Google Play Distribution**: Simplified updates and monetization

## What (User-Visible Behavior)

- **Material You Design**: Dynamic color extraction from wallpaper
- **Google Assistant Integration**: "Hey Google, check Mom's medications"
- **Widgets**: Home screen widgets for quick medication and task views
- **Android Auto**: Voice-first interface while driving
- **Wear OS Companion**: Medication reminders on smartwatch
- **Picture-in-Picture**: Continue video calls while using other apps

## All Needed Context

### Documentation References

- Material Design 3: https://m3.material.io/
- Android Developers: https://developer.android.com/
- Google Play Console: https://play.google.com/console/
- Android Jetpack: https://developer.android.com/jetpack
- Health Connect: https://developer.android.com/health-and-fitness/guides/health-connect
- Wear OS: https://developer.android.com/wear

### Android-Specific Dependencies

```gradle
// android/app/build.gradle
dependencies {
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.work:work-runtime:2.9.0'
    implementation 'com.google.android.gms:play-services-auth:20.7.0'
    implementation 'com.google.android.gms:play-services-fitness:21.1.0'
    implementation 'com.google.android.libraries.healthdata:health-connect:1.1.0'
    implementation 'androidx.health.connect:connect-client:1.1.0'
    implementation 'com.google.mlkit:speech-recognition:16.0.0'
    implementation 'androidx.wear:wear:1.3.0'
    implementation 'com.google.android.support:wearable:2.9.0'
}
```

## Implementation Blueprint

### 1. Android-Specific Project Structure

```
android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/caregivingcompanion/
│   │   │   │   ├── MainActivity.kt
│   │   │   │   ├── MainApplication.kt
│   │   │   │   ├── services/
│   │   │   │   │   ├── VoiceRecognitionService.kt
│   │   │   │   │   ├── MedicationReminderService.kt
│   │   │   │   │   ├── HealthMonitoringService.kt
│   │   │   │   │   └── SyncService.kt
│   │   │   │   ├── widgets/
│   │   │   │   │   ├── MedicationWidget.kt
│   │   │   │   │   ├── TaskWidget.kt
│   │   │   │   │   └── QuickActionWidget.kt
│   │   │   │   ├── receivers/
│   │   │   │   │   ├── BootReceiver.kt
│   │   │   │   │   ├── AlarmReceiver.kt
│   │   │   │   │   └── NotificationReceiver.kt
│   │   │   │   └── modules/
│   │   │   │       ├── GoogleAssistantModule.kt
│   │   │   │       ├── HealthConnectModule.kt
│   │   │   │       └── WearOSModule.kt
│   │   │   ├── res/
│   │   │   │   ├── layout/
│   │   │   │   ├── values/
│   │   │   │   ├── values-night/
│   │   │   │   ├── xml/ (widgets, shortcuts)
│   │   │   │   └── raw/ (sounds)
│   │   │   └── AndroidManifest.xml
│   │   └── debug/
│   └── build.gradle
├── wear/ (Wear OS app)
└── gradle.properties
```

### 2. Main Activity with Material You (MainActivity.kt)

```kotlin
package com.caregivingcompanion

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.core.view.WindowCompat
import com.google.android.material.color.DynamicColors
import androidx.health.connect.client.HealthConnectClient
import androidx.work.*
import java.util.concurrent.TimeUnit

class MainActivity : ComponentActivity() {
    private lateinit var healthConnectClient: HealthConnectClient

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Enable edge-to-edge display
        WindowCompat.setDecorFitsSystemWindows(window, false)

        // Apply Material You dynamic colors
        DynamicColors.applyToActivitiesIfAvailable(application)

        // Initialize Health Connect
        healthConnectClient = HealthConnectClient.getOrCreate(this)

        // Schedule background work
        scheduleBackgroundServices()

        // Set up the React Native bridge
        setContent {
            CaregivingCompanionTheme {
                // React Native content will be rendered here
                ReactNativeHost()
            }
        }

        // Request necessary permissions
        requestAndroidPermissions()
    }

    private fun scheduleBackgroundServices() {
        // Medication reminder worker
        val medicationWork = PeriodicWorkRequestBuilder<MedicationReminderWorker>(
            1, TimeUnit.HOURS
        ).build()

        // Health monitoring worker
        val healthWork = PeriodicWorkRequestBuilder<HealthMonitoringWorker>(
            15, TimeUnit.MINUTES
        ).setConstraints(
            Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()
        ).build()

        WorkManager.getInstance(this).apply {
            enqueueUniquePeriodicWork(
                "medication_reminders",
                ExistingPeriodicWorkPolicy.KEEP,
                medicationWork
            )
            enqueueUniquePeriodicWork(
                "health_monitoring",
                ExistingPeriodicWorkPolicy.KEEP,
                healthWork
            )
        }
    }

    private fun requestAndroidPermissions() {
        // Request permissions for Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requestPermissions(
                arrayOf(
                    Manifest.permission.POST_NOTIFICATIONS,
                    Manifest.permission.READ_MEDIA_AUDIO,
                    Manifest.permission.NEARBY_WIFI_DEVICES
                ),
                PERMISSION_REQUEST_CODE
            )
        }
    }
}
```

### 3. Voice Recognition Service (VoiceRecognitionService.kt)

```kotlin
package com.caregivingcompanion.services

import android.app.*
import android.content.Intent
import android.os.IBinder
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import androidx.core.app.NotificationCompat
import com.google.mlkit.nl.languageid.LanguageIdentification
import kotlinx.coroutines.*

class VoiceRecognitionService : Service(), RecognitionListener {
    private lateinit var speechRecognizer: SpeechRecognizer
    private lateinit var recognizerIntent: Intent
    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    override fun onCreate() {
        super.onCreate()

        // Create notification channel for foreground service
        createNotificationChannel()

        // Start as foreground service
        startForeground(NOTIFICATION_ID, createNotification())

        // Initialize speech recognizer
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
        speechRecognizer.setRecognitionListener(this)

        recognizerIntent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                    RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 1500)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START_LISTENING -> startListening()
            ACTION_STOP_LISTENING -> stopListening()
            ACTION_PROCESS_COMMAND -> processVoiceCommand(intent.getStringExtra("command"))
        }
        return START_STICKY
    }

    private fun startListening() {
        speechRecognizer.startListening(recognizerIntent)
    }

    private fun stopListening() {
        speechRecognizer.stopListening()
    }

    private fun processVoiceCommand(command: String?) {
        command?.let {
            serviceScope.launch {
                when {
                    it.contains("medication", ignoreCase = true) -> {
                        checkMedications()
                    }
                    it.contains("appointment", ignoreCase = true) -> {
                        checkAppointments()
                    }
                    it.contains("call", ignoreCase = true) -> {
                        initiateCall()
                    }
                    it.contains("emergency", ignoreCase = true) -> {
                        triggerEmergency()
                    }
                    else -> {
                        // Send to AI for processing
                        sendToAI(it)
                    }
                }
            }
        }
    }

    override fun onResults(results: Bundle?) {
        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        matches?.firstOrNull()?.let { command ->
            processVoiceCommand(command)
        }
    }

    private fun createNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Care Assistant Active")
            .setContentText("Listening for voice commands")
            .setSmallIcon(R.drawable.ic_mic)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    companion object {
        const val ACTION_START_LISTENING = "com.caregivingcompanion.START_LISTENING"
        const val ACTION_STOP_LISTENING = "com.caregivingcompanion.STOP_LISTENING"
        const val ACTION_PROCESS_COMMAND = "com.caregivingcompanion.PROCESS_COMMAND"
        private const val NOTIFICATION_ID = 1001
        private const val CHANNEL_ID = "voice_service"
    }
}
```

### 4. Home Screen Widget (MedicationWidget.kt)

```kotlin
package com.caregivingcompanion.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import android.app.PendingIntent
import android.content.Intent
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager

class MedicationWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val views = RemoteViews(context.packageName, R.layout.widget_medication)

        // Get medication data
        val medications = MedicationRepository.getTodaysMedications()
        val nextMedication = medications.firstOrNull { !it.taken }

        // Update widget UI
        views.apply {
            setTextViewText(R.id.medication_name, nextMedication?.name ?: "No medications")
            setTextViewText(R.id.medication_time, nextMedication?.time ?: "")
            setTextViewText(R.id.medication_count, "${medications.count { it.taken }}/${medications.size}")

            // Set up click handlers
            setOnClickPendingIntent(R.id.btn_taken,
                createPendingIntent(context, ACTION_MARK_TAKEN, nextMedication?.id))
            setOnClickPendingIntent(R.id.btn_snooze,
                createPendingIntent(context, ACTION_SNOOZE, nextMedication?.id))
            setOnClickPendingIntent(R.id.widget_container,
                createPendingIntent(context, ACTION_OPEN_APP))
        }

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)

        when (intent.action) {
            ACTION_MARK_TAKEN -> {
                val medicationId = intent.getStringExtra("medication_id")
                markMedicationTaken(context, medicationId)
            }
            ACTION_SNOOZE -> {
                val medicationId = intent.getStringExtra("medication_id")
                snoozeMedication(context, medicationId)
            }
        }
    }

    companion object {
        const val ACTION_MARK_TAKEN = "com.caregivingcompanion.MARK_TAKEN"
        const val ACTION_SNOOZE = "com.caregivingcompanion.SNOOZE"
        const val ACTION_OPEN_APP = "com.caregivingcompanion.OPEN_APP"
    }
}
```

### 5. Google Assistant Integration (GoogleAssistantModule.kt)

```kotlin
package com.caregivingcompanion.modules

import android.app.Activity
import android.content.Intent
import com.google.android.gms.actions.NoteIntents
import com.google.android.gms.actions.SearchIntents
import com.facebook.react.bridge.*

class GoogleAssistantModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "GoogleAssistant"

    @ReactMethod
    fun handleAssistantIntent(promise: Promise) {
        val activity = currentActivity ?: return promise.reject("NO_ACTIVITY", "No activity")

        when (activity.intent?.action) {
            NoteIntents.ACTION_CREATE_NOTE -> {
                val noteText = activity.intent.getStringExtra(NoteIntents.EXTRA_TEXT)
                promise.resolve(createResponse("create_note", noteText))
            }
            SearchIntents.ACTION_SEARCH -> {
                val query = activity.intent.getStringExtra(SearchIntents.QUERY)
                promise.resolve(createResponse("search", query))
            }
            "com.google.android.gms.actions.SEARCH_ACTION" -> {
                val query = activity.intent.getStringExtra("query")
                handleVoiceQuery(query, promise)
            }
            else -> {
                promise.resolve(null)
            }
        }
    }

    @ReactMethod
    fun registerAppActions() {
        // Register app actions for Google Assistant
        val shortcuts = listOf(
            createShortcut("check_medications", "Check medications",
                           "Check Mom's medications"),
            createShortcut("call_caregiver", "Call caregiver",
                           "Call my care team"),
            createShortcut("add_appointment", "Add appointment",
                           "Schedule doctor appointment")
        )

        ShortcutManagerCompat.setDynamicShortcuts(reactApplicationContext, shortcuts)
    }

    private fun handleVoiceQuery(query: String?, promise: Promise) {
        query?.let {
            when {
                it.contains("medication") -> checkMedications(promise)
                it.contains("appointment") -> checkAppointments(promise)
                it.contains("call") -> initiateCall(promise)
                else -> processWithAI(it, promise)
            }
        }
    }
}
```

### 6. Health Connect Integration (HealthConnectModule.kt)

```kotlin
package com.caregivingcompanion.modules

import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.*
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.temporal.ChronoUnit

class HealthConnectModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private lateinit var healthConnectClient: HealthConnectClient

    override fun initialize() {
        super.initialize()
        val context = reactApplicationContext
        healthConnectClient = HealthConnectClient.getOrCreate(context)
    }

    @ReactMethod
    fun readVitalSigns(promise: Promise) {
        reactApplicationContext.currentActivity?.let { activity ->
            activity.lifecycleScope.launch {
                try {
                    val endTime = Instant.now()
                    val startTime = endTime.minus(24, ChronoUnit.HOURS)

                    // Read heart rate
                    val heartRateRequest = ReadRecordsRequest(
                        HeartRateRecord::class,
                        timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                    )
                    val heartRateRecords = healthConnectClient.readRecords(heartRateRequest)

                    // Read blood pressure
                    val bloodPressureRequest = ReadRecordsRequest(
                        BloodPressureRecord::class,
                        timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                    )
                    val bloodPressureRecords = healthConnectClient.readRecords(bloodPressureRequest)

                    // Read steps
                    val stepsRequest = ReadRecordsRequest(
                        StepsRecord::class,
                        timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
                    )
                    val stepsRecords = healthConnectClient.readRecords(stepsRequest)

                    val vitals = WritableNativeMap().apply {
                        putDouble("heartRate", heartRateRecords.records.lastOrNull()?.samples?.lastOrNull()?.beatsPerMinute?.toDouble() ?: 0.0)
                        putString("bloodPressure", bloodPressureRecords.records.lastOrNull()?.let {
                            "${it.systolic.inMillimetersOfMercury}/${it.diastolic.inMillimetersOfMercury}"
                        } ?: "")
                        putInt("steps", stepsRecords.records.sumOf { it.count.toInt() })
                    }

                    promise.resolve(vitals)
                } catch (e: Exception) {
                    promise.reject("HEALTH_CONNECT_ERROR", e.message)
                }
            }
        }
    }

    @ReactMethod
    fun writeMedication(name: String, dose: String, time: String, promise: Promise) {
        reactApplicationContext.currentActivity?.let { activity ->
            activity.lifecycleScope.launch {
                try {
                    // Create custom medication record
                    val medicationRecord = MedicationRecord(
                        time = Instant.parse(time),
                        name = name,
                        dose = dose,
                        metadata = Metadata(
                            clientRecordId = "${name}_${time}",
                            dataOrigin = DataOrigin("com.caregivingcompanion")
                        )
                    )

                    healthConnectClient.insertRecords(listOf(medicationRecord))
                    promise.resolve(true)
                } catch (e: Exception) {
                    promise.reject("HEALTH_CONNECT_ERROR", e.message)
                }
            }
        }
    }
}
```

### 7. Android Auto Support (automotive/src/main/AndroidManifest.xml)

```xml
<application>
    <meta-data
        android:name="com.google.android.gms.car.application"
        android:resource="@xml/automotive_app_desc" />

    <service
        android:name=".car.CaregivingCarService"
        android:exported="true">
        <intent-filter>
            <action android:name="androidx.car.app.CarAppService" />
        </intent-filter>
    </service>
</application>
```

### 8. Material You Theme Configuration

```xml
<!-- res/values/themes.xml -->
<resources>
    <style name="Theme.CaregivingCompanion" parent="Theme.Material3.DayNight">
        <!-- Material You dynamic colors -->
        <item name="dynamicColorThemeOverlay">@style/ThemeOverlay.Material3.DynamicColors.DayNight</item>

        <!-- Custom brand colors as fallback -->
        <item name="colorPrimary">@color/md_theme_light_primary</item>
        <item name="colorOnPrimary">@color/md_theme_light_onPrimary</item>
        <item name="colorSecondary">@color/md_theme_light_secondary</item>

        <!-- Enable edge-to-edge -->
        <item name="android:windowTranslucentStatus">true</item>
        <item name="android:windowTranslucentNavigation">true</item>

        <!-- Predictive back gesture -->
        <item name="android:windowOptOutEdgeToEdgeEnforcement">false</item>
    </style>
</resources>
```

## Task Checklist

### Android Setup

- [ ] Configure Android Studio project
- [ ] Set up Material Design 3 theming
- [ ] Implement dynamic color extraction
- [ ] Configure Gradle dependencies
- [ ] Set up ProGuard rules

### Core Features

- [ ] Implement foreground services
- [ ] Create home screen widgets
- [ ] Build notification system
- [ ] Add shortcuts support
- [ ] Implement app actions

### Google Integration

- [ ] Integrate Google Sign-In
- [ ] Connect Health Connect API
- [ ] Implement Google Assistant actions
- [ ] Add Google Fit sync
- [ ] Configure Firebase services

### Background Services

- [ ] Create medication reminder service
- [ ] Build health monitoring worker
- [ ] Implement sync service
- [ ] Add location-based reminders
- [ ] Configure WorkManager tasks

### Android-Specific UI

- [ ] Implement Material You components
- [ ] Create adaptive layouts
- [ ] Add predictive back gesture
- [ ] Build Picture-in-Picture mode
- [ ] Support foldables and tablets

### Wear OS

- [ ] Create Wear OS companion app
- [ ] Implement watch faces
- [ ] Add complications
- [ ] Build voice commands
- [ ] Sync with phone app

## Validation Loop

### Level 1: Unit Testing

```bash
# Run Android unit tests
./gradlew test

# Run instrumented tests
./gradlew connectedAndroidTest
```

### Level 2: Device Testing

```bash
# Test on various API levels
./gradlew connectedCheck

# Test on Firebase Test Lab
gcloud firebase test android run \
  --type instrumentation \
  --app app/build/outputs/apk/debug/app-debug.apk \
  --test app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
```

### Level 3: Play Store Testing

```bash
# Build release APK
./gradlew assembleRelease

# Build App Bundle
./gradlew bundleRelease

# Upload to Play Console
fastlane supply --aab app/build/outputs/bundle/release/app-release.aab
```

## Success Metrics

- [ ] Material You theming works on Android 12+
- [ ] Widgets update within 30 minutes
- [ ] Background services run reliably
- [ ] Google Assistant integration responds < 2s
- [ ] Health Connect syncs daily
- [ ] Battery usage < 5% daily
- [ ] ANR rate < 0.1%
- [ ] Crash rate < 0.5%

## Common Gotchas

- Android 14 requires explicit foreground service types
- Health Connect needs special permissions and user consent
- Background work has strict battery optimization limits
- Material You requires fallback colors for older devices
- Widgets have memory and update frequency limits
- Google Play requires privacy policy for health data
- Android Auto has strict design guidelines
