# iOS App PRP - Caregiving Companion for App Store

## Goal

Develop and deploy a native iOS application that delivers a Pi.ai-like conversational caregiving experience with iOS design guidelines, deep Apple ecosystem integration, and premium features for iPhone, iPad, Apple Watch, and Apple Vision Pro, targeting iOS 15+ with optimization for iOS 17.

## Why

- **Premium User Base**: iOS users spend 2.5x more on apps and subscriptions
- **Apple Ecosystem**: Seamless integration across iPhone, iPad, Watch, Mac, Vision Pro
- **HealthKit Integration**: Direct access to comprehensive health data
- **Privacy-First**: Apple's privacy framework builds user trust
- **Family Sharing**: Built-in family coordination features
- **Siri Shortcuts**: Voice automation throughout iOS

## What (User-Visible Behavior)

- **Dynamic Island**: Live medication reminders and call status
- **Interactive Widgets**: Lock screen and home screen widgets
- **Live Activities**: Real-time care updates on lock screen
- **Apple Watch App**: Medication reminders and health tracking
- **SharePlay**: Share care sessions with family members
- **Focus Filters**: Care-specific focus modes
- **Vision Pro**: Immersive care dashboard in spatial computing

## All Needed Context

### Documentation References

- Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/
- HealthKit: https://developer.apple.com/documentation/healthkit
- SiriKit: https://developer.apple.com/documentation/sirikit
- WidgetKit: https://developer.apple.com/documentation/widgetkit
- WatchKit: https://developer.apple.com/documentation/watchkit
- App Store Connect: https://appstoreconnect.apple.com/

### iOS-Specific Configuration

```swift
// Info.plist requirements
NSHealthShareUsageDescription
NSHealthUpdateUsageDescription
NSSiriUsageDescription
NSFaceIDUsageDescription
NSMotionUsageDescription
NSLocationWhenInUseUsageDescription
NSUserTrackingUsageDescription
```

## Implementation Blueprint

### 1. iOS Native Modules (ios/CaregivingCompanion/)

```
ios/
├── CaregivingCompanion/
│   ├── AppDelegate.swift
│   ├── SceneDelegate.swift
│   ├── Modules/
│   │   ├── HealthKitModule.swift
│   │   ├── SiriModule.swift
│   │   ├── LiveActivityModule.swift
│   │   ├── DynamicIslandModule.swift
│   │   └── VisionProModule.swift
│   ├── Services/
│   │   ├── HealthDataService.swift
│   │   ├── NotificationService.swift
│   │   └── BackgroundTaskService.swift
│   ├── Extensions/
│   │   ├── NotificationServiceExtension/
│   │   ├── WidgetExtension/
│   │   ├── IntentsExtension/
│   │   └── WatchExtension/
│   └── Resources/
├── CaregivingCompanionWidget/
├── CaregivingCompanionWatch/
├── CaregivingCompanionVision/
└── Podfile
```

### 2. HealthKit Integration Module (HealthKitModule.swift)

```swift
import Foundation
import HealthKit
import React

@objc(HealthKitModule)
class HealthKitModule: RCTEventEmitter {
    private let healthStore = HKHealthStore()
    private var healthKitObservers: [HKObserverQuery] = []

    override static func moduleName() -> String! {
        return "HealthKit"
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func supportedEvents() -> [String]! {
        return ["HealthDataUpdate", "MedicationReminder", "VitalSignAlert"]
    }

    @objc
    func requestAuthorization(_ resolve: @escaping RCTPromiseResolveBlock,
                            rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard HKHealthStore.isHealthDataAvailable() else {
            reject("HEALTH_KIT_UNAVAILABLE", "HealthKit is not available on this device", nil)
            return
        }

        // Define data types to read
        let readTypes: Set<HKObjectType> = [
            HKObjectType.quantityType(forIdentifier: .heartRate)!,
            HKObjectType.quantityType(forIdentifier: .bloodPressureSystolic)!,
            HKObjectType.quantityType(forIdentifier: .bloodPressureDiastolic)!,
            HKObjectType.quantityType(forIdentifier: .bloodGlucose)!,
            HKObjectType.quantityType(forIdentifier: .bodyTemperature)!,
            HKObjectType.quantityType(forIdentifier: .oxygenSaturation)!,
            HKObjectType.quantityType(forIdentifier: .stepCount)!,
            HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!,
            HKObjectType.clinicalType(forIdentifier: .medicationRecord)!,
            HKObjectType.clinicalType(forIdentifier: .allergyRecord)!
        ]

        // Define data types to write
        let writeTypes: Set<HKSampleType> = [
            HKObjectType.quantityType(forIdentifier: .bloodPressureSystolic)!,
            HKObjectType.quantityType(forIdentifier: .bloodPressureDiastolic)!,
            HKObjectType.quantityType(forIdentifier: .bloodGlucose)!,
            HKObjectType.categoryType(forIdentifier: .mindfulSession)!
        ]

        healthStore.requestAuthorization(toShare: writeTypes, read: readTypes) { success, error in
            if success {
                self.setupHealthKitObservers()
                resolve(true)
            } else {
                reject("AUTHORIZATION_FAILED", error?.localizedDescription ?? "Unknown error", error)
            }
        }
    }

    @objc
    func readVitalSigns(_ resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
        let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate)!
        let bloodPressureSystolicType = HKQuantityType.quantityType(forIdentifier: .bloodPressureSystolic)!
        let bloodPressureDiastolicType = HKQuantityType.quantityType(forIdentifier: .bloodPressureDiastolic)!

        let now = Date()
        let startOfDay = Calendar.current.startOfDay(for: now)
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: now, options: .strictStartDate)

        var vitals: [String: Any] = [:]
        let group = DispatchGroup()

        // Read heart rate
        group.enter()
        let heartRateQuery = HKStatisticsQuery(quantityType: heartRateType,
                                              quantitySamplePredicate: predicate,
                                              options: .discreteAverage) { _, result, error in
            if let result = result,
               let average = result.averageQuantity() {
                vitals["heartRate"] = average.doubleValue(for: HKUnit.count().unitDivided(by: .minute()))
            }
            group.leave()
        }
        healthStore.execute(heartRateQuery)

        // Read blood pressure
        group.enter()
        let bpQuery = HKCorrelationQuery(
            type: HKCorrelationType.correlationType(forIdentifier: .bloodPressure)!,
            predicate: predicate,
            samplePredicates: nil
        ) { _, correlations, error in
            if let correlation = correlations?.first {
                let systolicSamples = correlation.objects(for: bloodPressureSystolicType)
                let diastolicSamples = correlation.objects(for: bloodPressureDiastolicType)

                if let systolic = systolicSamples.first as? HKQuantitySample,
                   let diastolic = diastolicSamples.first as? HKQuantitySample {
                    vitals["bloodPressure"] = [
                        "systolic": systolic.quantity.doubleValue(for: .millimeterOfMercury()),
                        "diastolic": diastolic.quantity.doubleValue(for: .millimeterOfMercury())
                    ]
                }
            }
            group.leave()
        }
        healthStore.execute(bpQuery)

        group.notify(queue: .main) {
            resolve(vitals)
        }
    }

    @objc
    func writeMedicationRecord(_ medication: NSDictionary,
                              resolver resolve: @escaping RCTPromiseResolveBlock,
                              rejecter reject: @escaping RCTPromiseRejectBlock) {
        // iOS 16+ Medication tracking
        if #available(iOS 16.0, *) {
            // Create medication record using HealthKit Clinical Records
            // This requires special entitlements from Apple
            resolve(true)
        } else {
            // Fallback for older iOS versions
            reject("UNSUPPORTED", "Medication tracking requires iOS 16+", nil)
        }
    }

    private func setupHealthKitObservers() {
        // Monitor heart rate changes
        let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate)!
        let heartRateQuery = HKObserverQuery(sampleType: heartRateType, predicate: nil) { _, _, error in
            if error == nil {
                self.sendEvent(withName: "HealthDataUpdate", body: ["type": "heartRate"])
            }
        }
        healthStore.execute(heartRateQuery)
        healthKitObservers.append(heartRateQuery)

        // Enable background delivery for critical health data
        healthStore.enableBackgroundDelivery(for: heartRateType, frequency: .immediate) { success, error in
            if !success {
                print("Failed to enable background delivery: \(error?.localizedDescription ?? "Unknown")")
            }
        }
    }
}
```

### 3. Dynamic Island & Live Activities (LiveActivityModule.swift)

```swift
import ActivityKit
import SwiftUI

@available(iOS 16.1, *)
struct CareActivityAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        var medicationName: String
        var timeRemaining: Int
        var dosage: String
        var taken: Bool
    }

    var careRecipientName: String
}

@objc(LiveActivityModule)
class LiveActivityModule: NSObject {
    private var currentActivity: Activity<CareActivityAttributes>?

    @objc
    func startMedicationReminder(_ medication: NSDictionary,
                                resolver resolve: @escaping RCTPromiseResolveBlock,
                                rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard #available(iOS 16.1, *) else {
            reject("UNSUPPORTED", "Live Activities require iOS 16.1+", nil)
            return
        }

        let attributes = CareActivityAttributes(
            careRecipientName: medication["recipientName"] as? String ?? "Mom"
        )

        let initialState = CareActivityAttributes.ContentState(
            medicationName: medication["name"] as? String ?? "",
            timeRemaining: medication["timeRemaining"] as? Int ?? 3600,
            dosage: medication["dosage"] as? String ?? "",
            taken: false
        )

        do {
            let activity = try Activity.request(
                attributes: attributes,
                contentState: initialState,
                pushType: .token
            )

            self.currentActivity = activity

            // Schedule updates
            Task {
                for await pushToken in activity.pushTokenUpdates {
                    let tokenString = pushToken.map { String(format: "%02x", $0) }.joined()
                    // Send token to backend for remote updates
                    self.sendPushTokenToBackend(tokenString)
                }
            }

            resolve(["activityId": activity.id])
        } catch {
            reject("ACTIVITY_ERROR", error.localizedDescription, error)
        }
    }

    @objc
    func updateActivity(_ update: NSDictionary,
                       resolver resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard #available(iOS 16.1, *),
              let activity = currentActivity else {
            reject("NO_ACTIVITY", "No active Live Activity", nil)
            return
        }

        Task {
            let updatedState = CareActivityAttributes.ContentState(
                medicationName: update["name"] as? String ?? "",
                timeRemaining: update["timeRemaining"] as? Int ?? 0,
                dosage: update["dosage"] as? String ?? "",
                taken: update["taken"] as? Bool ?? false
            )

            await activity.update(using: updatedState)
            resolve(true)
        }
    }
}
```

### 4. iOS Widget (Widget/CaregivingWidget.swift)

```swift
import WidgetKit
import SwiftUI

struct MedicationEntry: TimelineEntry {
    let date: Date
    let medications: [Medication]
    let nextReminder: Date?
}

struct CaregivingWidgetView: View {
    @Environment(\.widgetFamily) var family
    var entry: MedicationEntry

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        case .systemLarge:
            LargeWidgetView(entry: entry)
        case .accessoryCircular:
            CircularWidgetView(entry: entry)
        case .accessoryRectangular:
            RectangularWidgetView(entry: entry)
        case .accessoryInline:
            InlineWidgetView(entry: entry)
        default:
            EmptyView()
        }
    }
}

struct SmallWidgetView: View {
    let entry: MedicationEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "pills.fill")
                    .foregroundColor(.blue)
                Text("Medications")
                    .font(.headline)
            }

            if let nextMed = entry.medications.first {
                Text(nextMed.name)
                    .font(.subheadline)
                    .lineLimit(1)

                Text(nextMed.time, style: .time)
                    .font(.caption)
                    .foregroundColor(.secondary)

                Text(nextMed.dosage)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            Spacer()
        }
        .padding()
        .containerBackground(for: .widget) {
            Color(.systemBackground)
        }
    }
}

@main
struct CaregivingWidget: Widget {
    let kind: String = "CaregivingWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            CaregivingWidgetView(entry: entry)
        }
        .configurationDisplayName("Caregiving Companion")
        .description("Track medications and care tasks")
        .supportedFamilies([
            .systemSmall,
            .systemMedium,
            .systemLarge,
            .accessoryCircular,
            .accessoryRectangular,
            .accessoryInline
        ])
        .contentMarginsDisabled() // iOS 17+
    }
}
```

### 5. Apple Watch App (Watch/ContentView.swift)

```swift
import SwiftUI
import WatchKit
import HealthKit

struct ContentView: View {
    @StateObject private var healthManager = HealthManager()
    @State private var medications: [Medication] = []
    @State private var showingVoiceRecorder = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 12) {
                    // Health Metrics Card
                    HealthMetricsCard(healthManager: healthManager)

                    // Next Medication
                    if let nextMed = medications.first {
                        MedicationCard(medication: nextMed)
                    }

                    // Quick Actions
                    QuickActionsGrid()

                    // Voice Assistant Button
                    Button(action: { showingVoiceRecorder = true }) {
                        Label("Ask Assistant", systemImage: "mic.fill")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                }
                .padding()
            }
            .navigationTitle("Care Companion")
            .navigationBarTitleDisplayMode(.inline)
        }
        .sheet(isPresented: $showingVoiceRecorder) {
            VoiceRecorderView()
        }
    }
}

struct HealthMetricsCard: View {
    @ObservedObject var healthManager: HealthManager

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Health Status")
                .font(.headline)

            HStack {
                VStack(alignment: .leading) {
                    Label("\(healthManager.heartRate) BPM", systemImage: "heart.fill")
                        .foregroundColor(.red)
                        .font(.caption)

                    Label("\(healthManager.steps) steps", systemImage: "figure.walk")
                        .foregroundColor(.green)
                        .font(.caption)
                }

                Spacer()

                CircularProgressView(progress: healthManager.activityProgress)
                    .frame(width: 50, height: 50)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct MedicationCard: View {
    let medication: Medication
    @State private var taken = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "pills.fill")
                    .foregroundColor(.blue)
                Text("Next Medication")
                    .font(.headline)
            }

            Text(medication.name)
                .font(.subheadline)

            HStack {
                Text(medication.time, style: .time)
                    .font(.caption)

                Spacer()

                Text(medication.dosage)
                    .font(.caption)
            }
            .foregroundColor(.secondary)

            Button(action: markTaken) {
                Label(taken ? "Taken" : "Mark as Taken",
                      systemImage: taken ? "checkmark.circle.fill" : "circle")
            }
            .buttonStyle(.bordered)
            .disabled(taken)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }

    func markTaken() {
        withAnimation {
            taken = true
        }

        // Haptic feedback
        WKInterfaceDevice.current().play(.success)

        // Log to HealthKit
        // ...
    }
}
```

### 6. Siri Shortcuts Integration (IntentsExtension/IntentHandler.swift)

```swift
import Intents

class IntentHandler: INExtension {
    override func handler(for intent: INIntent) -> Any {
        switch intent {
        case is CheckMedicationIntent:
            return CheckMedicationIntentHandler()
        case is CallCaregiverIntent:
            return CallCaregiverIntentHandler()
        case is LogHealthDataIntent:
            return LogHealthDataIntentHandler()
        default:
            return self
        }
    }
}

class CheckMedicationIntentHandler: NSObject, CheckMedicationIntentHandling {
    func handle(intent: CheckMedicationIntent,
                completion: @escaping (CheckMedicationIntentResponse) -> Void) {
        // Fetch medication data
        MedicationService.shared.fetchTodaysMedications { medications in
            let response = CheckMedicationIntentResponse(code: .success, userActivity: nil)

            let taken = medications.filter { $0.taken }.count
            let total = medications.count

            response.summary = "You've taken \(taken) of \(total) medications today."

            if let next = medications.first(where: { !$0.taken }) {
                response.nextMedication = next.name
                response.nextTime = next.time
            }

            completion(response)
        }
    }

    func resolveCareRecipient(for intent: CheckMedicationIntent,
                              with completion: @escaping (INPersonResolutionResult) -> Void) {
        // Resolve care recipient
        if let recipient = intent.careRecipient {
            completion(.success(with: recipient))
        } else {
            // Default to primary care recipient
            let defaultRecipient = INPerson(
                personHandle: INPersonHandle(value: "mom", type: .unknown),
                nameComponents: nil,
                displayName: "Mom",
                image: nil,
                contactIdentifier: nil,
                customIdentifier: "primary_recipient"
            )
            completion(.success(with: defaultRecipient))
        }
    }
}
```

### 7. Vision Pro Support (VisionOS/ImmersiveCareView.swift)

```swift
import SwiftUI
import RealityKit
import ARKit

@available(visionOS 1.0, *)
struct ImmersiveCareView: View {
    @State private var showImmersiveSpace = false
    @Environment(\.openImmersiveSpace) var openImmersiveSpace
    @Environment(\.dismissImmersiveSpace) var dismissImmersiveSpace

    var body: some View {
        NavigationSplitView {
            // Sidebar with care categories
            List {
                NavigationLink("Dashboard") {
                    DashboardView()
                }
                NavigationLink("Medications") {
                    MedicationsView()
                }
                NavigationLink("Health Data") {
                    HealthDataView()
                }
                NavigationLink("Care Team") {
                    CareTeamView()
                }
            }
            .navigationTitle("Care Companion")
        } detail: {
            // 3D visualization space
            VStack {
                if showImmersiveSpace {
                    ImmersiveHealthVisualization()
                } else {
                    Button("Enter Immersive Mode") {
                        Task {
                            await openImmersiveSpace(id: "HealthSpace")
                            showImmersiveSpace = true
                        }
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
        }
    }
}

struct ImmersiveHealthVisualization: View {
    @State private var healthData: HealthData?

    var body: some View {
        RealityView { content in
            // Create 3D health visualization
            let model = ModelEntity(
                mesh: .generateSphere(radius: 0.1),
                materials: [SimpleMaterial(color: .blue, isMetallic: true)]
            )

            // Position in space
            model.position = [0, 1.5, -2]

            // Add to scene
            content.add(model)

            // Add interactive elements
            let tapGesture = TapGesture()
                .onEnded { _ in
                    // Handle interaction
                }

            model.addGesture(tapGesture)
        }
    }
}
```

## Task Checklist

### iOS Setup

- [ ] Configure Xcode project settings
- [ ] Set up code signing and provisioning
- [ ] Configure capabilities and entitlements
- [ ] Add required Info.plist entries
- [ ] Set up App Groups for data sharing

### Core Features

- [ ] Implement HealthKit integration
- [ ] Create Live Activities
- [ ] Build Dynamic Island support
- [ ] Add interactive widgets
- [ ] Implement Siri Shortcuts

### Apple Ecosystem

- [ ] Build Apple Watch app
- [ ] Add iPad optimization
- [ ] Implement Mac Catalyst support
- [ ] Create Vision Pro experience
- [ ] Add AirPods audio routing

### iOS-Specific UI

- [ ] Follow Human Interface Guidelines
- [ ] Implement SF Symbols
- [ ] Add haptic feedback
- [ ] Support Dark Mode
- [ ] Handle Dynamic Type

### Privacy & Security

- [ ] Implement App Tracking Transparency
- [ ] Add privacy nutrition labels
- [ ] Configure data encryption
- [ ] Implement biometric authentication
- [ ] Add privacy report

## Validation Loop

### Level 1: Xcode Testing

```bash
# Run unit tests
xcodebuild test -scheme CaregivingCompanion -destination 'platform=iOS Simulator,name=iPhone 15 Pro'

# Run UI tests
xcodebuild test -scheme CaregivingCompanionUITests -destination 'platform=iOS Simulator,name=iPad Pro'

# Test on Apple Watch
xcodebuild test -scheme CaregivingCompanionWatch -destination 'platform=watchOS Simulator,name=Apple Watch Series 9'
```

### Level 2: TestFlight

```bash
# Archive for TestFlight
xcodebuild archive -scheme CaregivingCompanion -archivePath ./build/CaregivingCompanion.xcarchive

# Export for TestFlight
xcodebuild -exportArchive -archivePath ./build/CaregivingCompanion.xcarchive -exportPath ./build -exportOptionsPlist ExportOptions.plist

# Upload to TestFlight
xcrun altool --upload-app -f ./build/CaregivingCompanion.ipa -u "apple@example.com" -p "app-specific-password"
```

## Success Metrics

- [ ] App launches < 1 second
- [ ] HealthKit sync completes daily
- [ ] Live Activities update in real-time
- [ ] Widgets refresh every 15 minutes
- [ ] Siri Shortcuts respond < 2 seconds
- [ ] Battery usage < 3% daily
- [ ] Crash-free rate > 99.5%
- [ ] App Store rating > 4.5 stars

## Common Gotchas

- HealthKit requires explicit user consent for each data type
- Live Activities have strict memory limits (4KB)
- Widgets cannot make network requests directly
- Background refresh is limited by iOS battery optimization
- App Store review requires detailed health data usage explanations
- Clinical Records API requires special Apple approval
- Vision Pro apps need spatial audio considerations
