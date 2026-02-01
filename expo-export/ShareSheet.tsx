/**
 * Share Bottom Sheet Component - Mobile (Expo)
 *
 * This is the React Native/Expo version of the share bottom sheet.
 * Add this to your Expo project's components/ShareSheet.tsx
 *
 * Dependencies needed:
 * - react-native-reanimated
 * - react-native-gesture-handler
 * - @gorhom/bottom-sheet (recommended)
 * - @expo/vector-icons
 * - react-native-qrcode-svg (for QR code)
 */

import React, { forwardRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Linking,
  Clipboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
// import QRCode from 'react-native-qrcode-svg'; // Uncomment when installed

// Color palette
const colors = {
  primary: '#D4AF37',
  primaryHover: '#E5C158',
  backgroundDark: '#050505',
  surfaceDark: '#1A1A1A',
  cardDark: '#1A1A1D',
  textWhite: '#FFFFFF',
  textGrey: '#9CA3AF',
  border: 'rgba(255,255,255,0.1)',
};

interface ShareSheetProps {
  athleteId: string;
  athleteName: string;
  cardUrl: string;
  shareCount?: number;
  onClose?: () => void;
}

export interface ShareSheetRef {
  open: () => void;
  close: () => void;
}

const ShareSheet = forwardRef<ShareSheetRef, ShareSheetProps>(
  ({ athleteId, athleteName, cardUrl, shareCount = 12, onClose }, ref) => {
    const snapPoints = useMemo(() => ['50%', '70%'], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.7}
        />
      ),
      []
    );

    // Share handlers
    const handleCopyLink = async () => {
      await Clipboard.setString(cardUrl);
      // Show toast or feedback
    };

    const handleShareMessage = async () => {
      try {
        await Share.share({
          message: `Check out ${athleteName}'s RepMax Card: ${cardUrl}`,
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    };

    const handleShareEmail = () => {
      const subject = encodeURIComponent(`Check out ${athleteName}'s RepMax Card`);
      const body = encodeURIComponent(`Hey,\n\nI wanted to share ${athleteName}'s recruiting profile with you.\n\n${cardUrl}\n\nPowered by RepMax`);
      Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
    };

    const handleShareWhatsApp = () => {
      const message = encodeURIComponent(`Check out ${athleteName}'s RepMax Card: ${cardUrl}`);
      Linking.openURL(`whatsapp://send?text=${message}`);
    };

    const handleShareInstagram = () => {
      // Instagram doesn't support direct sharing of links, but we can open the app
      Linking.openURL('instagram://app');
    };

    const handleDownloadQR = () => {
      // Implement QR code download logic
      console.log('Download QR code');
    };

    return (
      <BottomSheet
        ref={ref as any}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        onClose={onClose}
      >
        <BottomSheetView style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Share Your Card</Text>
            <Text style={styles.subtitle}>
              Invite friends to track your progress.
            </Text>
          </View>

          {/* Share Options */}
          <View style={styles.shareOptionsContainer}>
            <View style={styles.shareOptionsRow}>
              <TouchableOpacity style={styles.shareOption} onPress={handleCopyLink}>
                <View style={styles.shareIconContainer}>
                  <MaterialIcons name="content-copy" size={24} color={colors.primary} />
                </View>
                <Text style={styles.shareOptionLabel}>Copy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={handleShareMessage}>
                <View style={styles.shareIconContainer}>
                  <MaterialIcons name="sms" size={24} color={colors.primary} />
                </View>
                <Text style={styles.shareOptionLabel}>Message</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={handleShareEmail}>
                <View style={styles.shareIconContainer}>
                  <MaterialIcons name="mail" size={24} color={colors.primary} />
                </View>
                <Text style={styles.shareOptionLabel}>Email</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={handleShareInstagram}>
                <View style={styles.shareIconContainer}>
                  <MaterialIcons name="photo-camera" size={24} color={colors.primary} />
                </View>
                <Text style={styles.shareOptionLabel}>Stories</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={handleShareWhatsApp}>
                <View style={styles.shareIconContainer}>
                  <MaterialIcons name="chat" size={24} color={colors.primary} />
                </View>
                <Text style={styles.shareOptionLabel}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* QR Code Section */}
          <View style={styles.qrSection}>
            <View style={styles.qrCodeContainer}>
              {/* Replace with actual QR code component */}
              <View style={styles.qrPlaceholder}>
                <MaterialIcons name="qr-code-2" size={120} color={colors.textWhite} />
              </View>
              {/*
              <QRCode
                value={cardUrl}
                size={150}
                color={colors.textWhite}
                backgroundColor="transparent"
              />
              */}
            </View>

            <View style={styles.qrInfo}>
              <View style={styles.brandRow}>
                <MaterialIcons name="sports-football" size={16} color={colors.primary} />
                <Text style={styles.brandText}>REP MAX</Text>
              </View>

              <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadQR}>
                <MaterialIcons name="download" size={18} color={colors.primary} />
                <Text style={styles.downloadText}>Download QR Code</Text>
              </TouchableOpacity>

              <Text style={styles.shareStats}>
                Shared {shareCount} times this month
              </Text>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

ShareSheet.displayName = 'ShareSheet';

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.surfaceDark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textGrey,
  },
  shareOptionsContainer: {
    marginBottom: 24,
  },
  shareOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareOption: {
    alignItems: 'center',
    gap: 8,
  },
  shareIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareOptionLabel: {
    fontSize: 11,
    color: colors.textGrey,
  },
  qrSection: {
    alignItems: 'center',
    paddingTop: 16,
  },
  qrCodeContainer: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrInfo: {
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  brandText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textWhite,
    letterSpacing: 1,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  downloadText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  shareStats: {
    fontSize: 12,
    color: colors.textGrey,
  },
});

export default ShareSheet;

/**
 * Usage Example:
 *
 * import ShareSheet, { ShareSheetRef } from '@/components/ShareSheet';
 *
 * export default function MyScreen() {
 *   const shareSheetRef = useRef<ShareSheetRef>(null);
 *
 *   return (
 *     <GestureHandlerRootView style={{ flex: 1 }}>
 *       <View>
 *         <TouchableOpacity onPress={() => shareSheetRef.current?.open()}>
 *           <Text>Share</Text>
 *         </TouchableOpacity>
 *       </View>
 *
 *       <ShareSheet
 *         ref={shareSheetRef}
 *         athleteId="123"
 *         athleteName="Marcus Sterling"
 *         cardUrl="https://repmax.app/card/123"
 *       />
 *     </GestureHandlerRootView>
 *   );
 * }
 */
