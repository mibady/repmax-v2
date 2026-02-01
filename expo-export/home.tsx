/**
 * Athlete Home Screen - Mobile (Expo)
 *
 * This is the React Native/Expo version of the athlete home screen.
 * Convert this to your Expo project's app/(tabs)/home.tsx
 *
 * Dependencies needed:
 * - expo-router
 * - react-native-reanimated
 * - @expo/vector-icons
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Color palette
const colors = {
  primary: '#D4AF37',
  primaryHover: '#E5C158',
  backgroundDark: '#050505',
  surfaceDark: '#1F1F22',
  cardDark: '#1A1A1D',
  textWhite: '#FFFFFF',
  textGrey: '#9CA3AF',
  purple: '#8B5CF6',
  green: '#22C55E',
  red: '#EF4444',
};

interface AthleteData {
  name: string;
  height: string;
  weight: string;
  fortyYard: string;
  profileCompletion: number;
  zoneActivity: {
    transferPortal: number;
    coachViews: number;
    shortlists: number;
  };
  upcomingEvent: {
    title: string;
    date: string;
  };
}

// Mock data - replace with Supabase fetch
const athleteData: AthleteData = {
  name: 'Jaylen',
  height: '6\'1"',
  weight: '185lbs',
  fortyYard: '4.52s',
  profileCompletion: 85,
  zoneActivity: {
    transferPortal: 23,
    coachViews: 3,
    shortlists: 5,
  },
  upcomingEvent: {
    title: 'National Signing Day',
    date: 'Feb 07',
  },
};

export default function AthleteHomeScreen() {
  return (
    <View style={styles.container}>
      {/* Status Bar Spacer */}
      <View style={styles.statusBarSpacer} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpFOEUz_rfWWSVZf8V8mFWpvSX0XbEvnGhfEPVxD3mYrqKA6J94E78iBa_bR1caG28xt4BCjjnmdpZ8gfWL2lqcqVjfRncL7V0MxJBJxQQLl315vZyu2h6k9L5D4eNTwqVSBKB6cji7NJkO3WIoWyV4PeQrLPwNIgFa36RdDTOOR035pkGUVlwoADx0noxixr0W7lVDf9paHXe5l3fXR4SoKoRwegF0Uejyfdrq-vkbtjy7k-3snSTmQeCc6x5BHmksTTT1Aer9Qo' }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.greeting}>Hey {athleteData.name} 👋</Text>
            <Text style={styles.stats}>
              {athleteData.height} {athleteData.weight} {athleteData.fortyYard}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications" size={24} color={colors.textWhite} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Completion */}
        <View style={styles.completionCard}>
          <View style={styles.completionHeader}>
            <Text style={styles.completionTitle}>Profile Completion</Text>
            <Text style={styles.completionPercent}>{athleteData.profileCompletion}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${athleteData.profileCompletion}%` }]} />
          </View>
          <TouchableOpacity style={styles.completeButton}>
            <Text style={styles.completeButtonText}>Complete Profile</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Zone Pulse */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.05)']}
          style={styles.zonePulseCard}
        >
          <View style={styles.zonePulseHeader}>
            <MaterialIcons name="wifi-tethering" size={20} color={colors.purple} />
            <Text style={styles.zonePulseTitle}>Zone Pulse: West</Text>
          </View>
          <View style={styles.zoneActivityRow}>
            <View style={styles.zoneActivityItem}>
              <Text style={styles.zoneActivityValue}>{athleteData.zoneActivity.transferPortal}</Text>
              <Text style={styles.zoneActivityLabel}>Transfer Portal</Text>
            </View>
            <View style={styles.zoneActivityDivider} />
            <View style={styles.zoneActivityItem}>
              <Text style={styles.zoneActivityValue}>{athleteData.zoneActivity.coachViews}</Text>
              <Text style={styles.zoneActivityLabel}>Coach Views</Text>
            </View>
            <View style={styles.zoneActivityDivider} />
            <View style={styles.zoneActivityItem}>
              <Text style={styles.zoneActivityValue}>{athleteData.zoneActivity.shortlists}</Text>
              <Text style={styles.zoneActivityLabel}>Shortlists</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Upcoming Event */}
        <View style={styles.eventCard}>
          <View style={styles.eventIcon}>
            <MaterialIcons name="event" size={24} color={colors.primary} />
          </View>
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>{athleteData.upcomingEvent.title}</Text>
            <Text style={styles.eventDate}>{athleteData.upcomingEvent.date}</Text>
          </View>
          <TouchableOpacity>
            <MaterialIcons name="chevron-right" size={24} color={colors.textGrey} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionButton}>
            <MaterialIcons name="trending-up" size={28} color={colors.primary} />
            <Text style={styles.quickActionText}>Update Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <MaterialIcons name="videocam" size={28} color={colors.primary} />
            <Text style={styles.quickActionText}>Add Film</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <MaterialIcons name="share" size={28} color={colors.primary} />
            <Text style={styles.quickActionText}>Share Card</Text>
          </TouchableOpacity>
        </View>

        {/* Spacer for bottom nav */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <MaterialIcons name="home" size={24} color={colors.primary} />
          <Text style={[styles.tabLabel, { color: colors.primary }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <MaterialIcons name="badge" size={24} color={colors.textGrey} />
          <Text style={styles.tabLabel}>Card</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <MaterialIcons name="bar-chart" size={24} color={colors.textGrey} />
          <Text style={styles.tabLabel}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <MaterialIcons name="play-circle" size={24} color={colors.textGrey} />
          <Text style={styles.tabLabel}>Film</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <MaterialIcons name="more-horiz" size={24} color={colors.textGrey} />
          <Text style={styles.tabLabel}>More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  statusBarSpacer: {
    height: 44, // Adjust based on device
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textWhite,
  },
  stats: {
    fontSize: 12,
    color: colors.textGrey,
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  completionCard: {
    backgroundColor: colors.surfaceDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 14,
    color: colors.textGrey,
  },
  completionPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  zonePulseCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  zonePulseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  zonePulseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textWhite,
  },
  zoneActivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  zoneActivityItem: {
    alignItems: 'center',
  },
  zoneActivityValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textWhite,
    fontFamily: 'monospace',
  },
  zoneActivityLabel: {
    fontSize: 10,
    color: colors.textGrey,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  zoneActivityDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceDark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textWhite,
  },
  eventDate: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textWhite,
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.textWhite,
    textAlign: 'center',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 26, 29, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 24, // Safe area
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.textGrey,
  },
});
