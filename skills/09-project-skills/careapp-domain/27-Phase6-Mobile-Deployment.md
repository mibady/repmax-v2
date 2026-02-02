# Mobile Deployment PRP - App Store & Google Play Distribution

## Goal

Establish a comprehensive deployment pipeline for distributing the Caregiving Companion mobile apps through Apple App Store and Google Play Store, including CI/CD automation, beta testing programs, release management, and post-launch monitoring.

## Why

- **Professional Distribution**: Reach millions through official app stores
- **Automated Pipeline**: Reduce deployment time from days to hours
- **Quality Assurance**: Catch issues before they reach production
- **Beta Programs**: Test with real users before wide release
- **Compliance**: Meet all store requirements and healthcare regulations
- **Analytics**: Track adoption and performance metrics

## What (User-Visible Behavior)

- **App Store Presence**: Professional listing with screenshots and videos
- **Automatic Updates**: Seamless OTA updates for bug fixes
- **Beta Access**: TestFlight/Play Console testing programs
- **Version Management**: Clear versioning and release notes
- **Crash Reporting**: Immediate detection and fixes
- **Performance Monitoring**: Smooth experience across devices

## All Needed Context

### Documentation References

- App Store Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play Policies: https://play.google.com/console/about/policy/
- Expo EAS Build: https://docs.expo.dev/build/introduction/
- Fastlane: https://docs.fastlane.tools/
- App Store Connect API: https://developer.apple.com/app-store-connect/api/
- Google Play Console API: https://developers.google.com/android-publisher

### Store Requirements

- **Apple App Store**:
  - Apple Developer Program ($99/year)
  - App Store Connect account
  - iOS 13.0+ minimum
  - Privacy policy URL
  - HIPAA compliance documentation

- **Google Play Store**:
  - Google Play Developer account ($25 one-time)
  - Play Console access
  - Android 7.0+ (API 24) minimum
  - Data safety section
  - Health app questionnaire

## Implementation Blueprint

### 1. EAS Build Configuration (eas.json)

```json
{
  "cli": {
    "version": ">= 5.0.0",
    "requireCommit": true
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug",
        "buildType": "apk"
      },
      "ios": {
        "simulator": true,
        "buildConfiguration": "Debug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      },
      "ios": {
        "simulator": false,
        "buildConfiguration": "Release"
      },
      "env": {
        "ENVIRONMENT": "staging"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      },
      "ios": {
        "buildConfiguration": "Release",
        "distribution": "app-store"
      },
      "env": {
        "ENVIRONMENT": "production"
      },
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./credentials/google-play-service-account.json",
        "track": "production",
        "releaseStatus": "completed",
        "rollout": 0.1
      },
      "ios": {
        "appleId": "caregiver@company.com",
        "ascAppId": "1234567890",
        "appleTeamId": "TEAM_ID"
      }
    }
  }
}
```

### 2. CI/CD Pipeline (github/workflows/deploy.yml)

```yaml
name: Deploy Mobile Apps

on:
  push:
    tags:
      - "v*.*.*"
  workflow_dispatch:
    inputs:
      platform:
        description: "Platform to deploy"
        required: true
        default: "both"
        type: choice
        options:
          - ios
          - android
          - both

jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
      build_number: ${{ steps.version.outputs.build_number }}
    steps:
      - uses: actions/checkout@v4

      - name: Extract version
        id: version
        run: |
          VERSION=${GITHUB_REF#refs/tags/v}
          BUILD_NUMBER=$(date +%s)
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "build_number=$BUILD_NUMBER" >> $GITHUB_OUTPUT

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: |
          npm ci
          npm install -g eas-cli

  test:
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run tests
        run: |
          npm test
          npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build-ios:
    needs: [setup, test]
    if: github.event.inputs.platform == 'ios' || github.event.inputs.platform == 'both'
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build iOS app
        run: |
          eas build --platform ios --profile production --non-interactive

      - name: Download IPA
        run: |
          eas build:download --platform ios --profile production

      - name: Upload to TestFlight
        run: |
          fastlane ios beta
        env:
          FASTLANE_USER: ${{ secrets.APPLE_ID }}
          FASTLANE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
          FASTLANE_APPLE_APPLICATION_SPECIFIC_PASSWORD: ${{ secrets.APP_SPECIFIC_PASSWORD }}

  build-android:
    needs: [setup, test]
    if: github.event.inputs.platform == 'android' || github.event.inputs.platform == 'both'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build Android app
        run: |
          eas build --platform android --profile production --non-interactive

      - name: Download AAB
        run: |
          eas build:download --platform android --profile production

      - name: Upload to Play Console
        run: |
          fastlane android deploy
        env:
          GOOGLE_PLAY_JSON_KEY: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}

  post-deployment:
    needs: [build-ios, build-android]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: "Mobile app deployment ${{ needs.setup.outputs.version }}"
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          tag_name: v${{ needs.setup.outputs.version }}
          generate_release_notes: true
          draft: false
          prerelease: false
```

### 3. Fastlane Configuration (fastlane/Fastfile)

```ruby
# iOS Lane
platform :ios do
  desc "Build and upload to TestFlight"
  lane :beta do
    # Ensure we're on a clean branch
    ensure_git_status_clean

    # Increment build number
    increment_build_number(
      build_number: latest_testflight_build_number + 1
    )

    # Build the app
    build_app(
      scheme: "CaregivingCompanion",
      export_method: "app-store",
      output_directory: "./build",
      output_name: "CaregivingCompanion.ipa"
    )

    # Upload to TestFlight
    upload_to_testflight(
      skip_waiting_for_build_processing: true,
      changelog: generate_changelog,
      groups: ["Internal Testers", "Beta Testers"]
    )

    # Send notification
    slack(
      message: "iOS app uploaded to TestFlight! 🚀",
      success: true
    )
  end

  desc "Submit to App Store"
  lane :release do
    # Screenshot generation
    capture_screenshots

    # Upload metadata and screenshots
    upload_to_app_store(
      force: true,
      automatic_release: false,
      submit_for_review: true,
      submission_information: {
        add_id_info_uses_idfa: false,
        export_compliance_uses_encryption: true,
        export_compliance_encryption_updated: false
      }
    )
  end
end

# Android Lane
platform :android do
  desc "Build and upload to Play Console"
  lane :beta do
    # Build AAB
    gradle(
      task: "bundle",
      build_type: "Release"
    )

    # Upload to internal testing
    upload_to_play_store(
      track: "internal",
      release_status: "completed",
      aab: "./app/build/outputs/bundle/release/app-release.aab",
      json_key: ENV["GOOGLE_PLAY_JSON_KEY"],
      mapping: "./app/build/outputs/mapping/release/mapping.txt"
    )

    # Promote to beta if tests pass
    if run_tests_successfully?
      upload_to_play_store_track_promote(
        track: "internal",
        track_promote_to: "beta",
        rollout: 0.5
      )
    end
  end

  desc "Release to production"
  lane :release do
    upload_to_play_store(
      track: "production",
      release_status: "inProgress",
      rollout: 0.1,
      aab: "./app/build/outputs/bundle/release/app-release.aab"
    )
  end
end

# Helper functions
def generate_changelog
  changelog_from_git_commits(
    between: [last_git_tag, "HEAD"],
    pretty: "- %s",
    merge_commit_filtering: "exclude_merges"
  )
end

def run_tests_successfully?
  begin
    gradle(task: "test")
    true
  rescue
    false
  end
end
```

### 4. App Store Metadata (metadata/en-US/)

```yaml
# App Information
name: Caregiving Companion
subtitle: Your AI-Powered Care Assistant
primary_category: MEDICAL
secondary_category: HEALTH_AND_FITNESS

# Description
description: |
  Caregiving Companion is your trusted AI assistant for managing care responsibilities with confidence and ease.

  KEY FEATURES:
  • 24/7 AI Care Assistant - Always available to answer questions and provide support
  • Voice-First Interface - Natural conversations like talking to a caring friend
  • Medication Management - Never miss a dose with smart reminders
  • Health Tracking - Monitor vitals and symptoms with easy logging
  • Family Coordination - Keep everyone informed and involved
  • Emergency Support - Quick access to critical information when needed

  PRIVACY & SECURITY:
  • HIPAA compliant data handling
  • End-to-end encryption
  • Your data is never sold or shared
  • Complete control over your information

keywords: |
  caregiver, eldercare, medication reminder, health tracking, 
  family care, AI assistant, voice assistant, care management,
  senior care, medical reminder

# Privacy
privacy_url: https://caregivingcompanion.com/privacy
support_url: https://caregivingcompanion.com/support

# App Review Information
demo_user: demo@caregivingcompanion.com
demo_password: DemoPassword123!
notes: |
  This app helps caregivers manage care for elderly parents or loved ones.
  Voice features require microphone permission.
  Health data is stored securely and never shared.
```

### 5. Monitoring & Analytics Setup (src/services/monitoring/AppMonitoring.ts)

```typescript
import * as Sentry from "sentry-expo";
import Analytics from "@segment/analytics-react-native";
import appsFlyer from "react-native-appsflyer";
import { Amplitude } from "@amplitude/react-native";
import crashlytics from "@react-native-firebase/crashlytics";
import perf from "@react-native-firebase/perf";

export class AppMonitoring {
  static async initialize() {
    // Sentry for error tracking
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      enableInExpoDevelopment: false,
      debug: __DEV__,
      environment: process.env.ENVIRONMENT,
      tracesSampleRate: 0.2,
      beforeSend(event) {
        // Scrub sensitive data
        delete event.user?.email;
        delete event.extra?.authToken;
        return event;
      },
    });

    // Firebase Crashlytics
    await crashlytics().setCrashlyticsCollectionEnabled(!__DEV__);

    // Analytics
    await Analytics.setup(process.env.SEGMENT_KEY, {
      trackAppLifecycleEvents: true,
      trackAttributionData: true,
      flushInterval: 20,
    });

    // AppsFlyer for attribution
    appsFlyer.initSdk({
      devKey: process.env.APPSFLYER_KEY,
      isDebug: __DEV__,
      appId: process.env.APP_ID,
      onInstallConversionDataListener: true,
    });

    // Amplitude for product analytics
    await Amplitude.getInstance().init(process.env.AMPLITUDE_KEY);

    // Performance monitoring
    await perf().setPerformanceCollectionEnabled(true);
  }

  static trackDeploymentMetrics() {
    // Track app version
    Analytics.track("App Launched", {
      version: Constants.manifest?.version,
      buildNumber: Constants.manifest?.ios?.buildNumber,
      platform: Platform.OS,
      device: Device.modelName,
    });

    // Monitor startup time
    const startupTrace = perf().newTrace("app_startup");
    startupTrace.start();

    // Stop trace when app is ready
    InteractionManager.runAfterInteractions(() => {
      startupTrace.stop();
    });
  }
}
```

### 6. Release Management Script (scripts/release.sh)

```bash
#!/bin/bash

# Release automation script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get release type
echo "Select release type:"
echo "1) Patch (bug fixes)"
echo "2) Minor (new features)"
echo "3) Major (breaking changes)"
read -p "Enter choice [1-3]: " choice

case $choice in
    1) VERSION_TYPE="patch";;
    2) VERSION_TYPE="minor";;
    3) VERSION_TYPE="major";;
    *) echo "Invalid choice"; exit 1;;
esac

# Update version
echo -e "${YELLOW}Updating version...${NC}"
npm version $VERSION_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")

# Update native versions
echo -e "${YELLOW}Updating native versions...${NC}"
# iOS
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $NEW_VERSION" ios/CaregivingCompanion/Info.plist
# Android
sed -i "" "s/versionName \".*\"/versionName \"$NEW_VERSION\"/" android/app/build.gradle

# Generate changelog
echo -e "${YELLOW}Generating changelog...${NC}"
conventional-changelog -p angular -i CHANGELOG.md -s

# Run tests
echo -e "${YELLOW}Running tests...${NC}"
npm test
npm run test:e2e

# Build apps
echo -e "${YELLOW}Building apps...${NC}"
eas build --platform all --profile production --non-interactive

# Create git tag
echo -e "${YELLOW}Creating git tag...${NC}"
git add .
git commit -m "chore: release v$NEW_VERSION"
git tag -a "v$NEW_VERSION" -m "Release version $NEW_VERSION"

# Push to repository
echo -e "${YELLOW}Pushing to repository...${NC}"
git push origin main
git push origin "v$NEW_VERSION"

# Submit to stores
echo -e "${YELLOW}Submitting to stores...${NC}"
eas submit --platform all --profile production

echo -e "${GREEN}✓ Release v$NEW_VERSION completed successfully!${NC}"
```

## Task Checklist

### Store Setup

- [ ] Create Apple Developer account
- [ ] Create Google Play Developer account
- [ ] Configure App Store Connect
- [ ] Set up Play Console
- [ ] Generate signing certificates

### CI/CD Pipeline

- [ ] Configure GitHub Actions
- [ ] Set up EAS Build
- [ ] Configure Fastlane
- [ ] Set up environment secrets
- [ ] Create build workflows

### App Store Submission

- [ ] Create app listing
- [ ] Upload screenshots
- [ ] Write app description
- [ ] Submit privacy policy
- [ ] Configure in-app purchases

### Google Play Submission

- [ ] Create app listing
- [ ] Complete data safety form
- [ ] Upload screenshots
- [ ] Configure release tracks
- [ ] Set up staged rollout

### Testing Programs

- [ ] Configure TestFlight
- [ ] Set up Play Console testing
- [ ] Create beta tester groups
- [ ] Implement feedback collection
- [ ] Set up crash reporting

### Post-Launch

- [ ] Monitor crash reports
- [ ] Track analytics
- [ ] Respond to reviews
- [ ] Plan update schedule
- [ ] A/B test features

## Validation Loop

### Level 1: Pre-submission

```bash
# Validate build
eas build --platform all --profile preview

# Test on devices
eas build:run --platform ios --device
eas build:run --platform android --device
```

### Level 2: Beta Testing

```bash
# Deploy to TestFlight
fastlane ios beta

# Deploy to Play Console Internal
fastlane android beta
```

### Level 3: Production Release

```bash
# Submit to App Store
fastlane ios release

# Submit to Play Store
fastlane android release
```

## Success Metrics

- [ ] < 1% crash rate
- [ ] > 4.5 star rating
- [ ] < 24 hour review approval
- [ ] 90% successful deployment rate
- [ ] < 2 hour deployment time
- [ ] 95% OTA update success

## Common Gotchas

- App Store review can take 24-48 hours
- Google Play review is usually faster (2-3 hours)
- HIPAA compliance requires additional documentation
- Screenshots must be exact dimensions
- Version numbers must increment properly
- Certificates expire and need renewal
- Beta testing limits vary by platform
- Store policies change frequently
