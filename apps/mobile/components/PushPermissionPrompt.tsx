import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PushPermissionPromptProps {
  onEnableNotifications: () => void;
  onSkip: () => void;
}

const NOTIFICATION_REASONS = [
  {
    icon: 'eye-outline' as const,
    text: 'A recruiter views your card',
  },
  {
    icon: 'star-outline' as const,
    text: "You're added to a shortlist",
  },
  {
    icon: 'calendar-outline' as const,
    text: 'Deadlines are approaching',
  },
  {
    icon: 'chatbubble-outline' as const,
    text: 'You receive a message',
  },
];

export function PushPermissionPrompt({
  onEnableNotifications,
  onSkip,
}: PushPermissionPromptProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="notifications" size={48} color="#d4af35" />
          </View>
          <Text style={styles.title}>Stay in the Loop</Text>
          <Text style={styles.subtitle}>
            Get notified when something important happens
          </Text>
        </View>

        {/* Reasons List */}
        <View style={styles.reasonsList}>
          {NOTIFICATION_REASONS.map((reason, index) => (
            <View key={index} style={styles.reasonItem}>
              <View style={styles.reasonIconContainer}>
                <Ionicons name={reason.icon} size={24} color="#d4af35" />
              </View>
              <Text style={styles.reasonText}>{reason.text}</Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onEnableNotifications}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications" size={20} color="#201d12" />
            <Text style={styles.primaryButtonText}>Enable Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>Not now</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          You can change this anytime in Settings
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(212, 175, 53, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    maxWidth: 280,
  },
  reasonsList: {
    backgroundColor: '#1F1F22',
    borderRadius: 16,
    padding: 20,
    marginTop: 40,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  reasonIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reasonText: {
    fontSize: 16,
    color: '#e5e7eb',
    flex: 1,
  },
  buttons: {
    marginTop: 40,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d4af35',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#201d12',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6b7280',
    marginTop: 24,
  },
});

export default PushPermissionPrompt;
