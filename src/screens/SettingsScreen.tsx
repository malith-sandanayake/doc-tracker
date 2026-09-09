import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useDocuments } from '../context/DocumentContext';
import { Header } from '../components/common/Header';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { isFirebaseConfigured } from '../config/firebase';
import { showAlert } from '../utils/alert';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { themeMode, setThemeMode, colors, isDark } = useTheme();
  const { stats, notes, goals, refreshData, resetToSeedData } = useDocuments();

  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshData();
      setSuccessBanner('Library data refreshed successfully.');
      setTimeout(() => setSuccessBanner(null), 3500);
    } catch (e) {
      showAlert('Refresh Failed', 'Unable to refresh library data.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConfirmReset = async () => {
    try {
      setIsResetting(true);
      await resetToSeedData();
      setIsResetModalVisible(false);
      setSuccessBanner('Library restored to Year 3 Computer Engineering sample data.');
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (e) {
      setIsResetModalVisible(false);
      showAlert('Reset Failed', 'Unable to reset data. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Header
        title="Settings"
        subtitle="Preferences & Data Management"
        showBackButton={true}
        showMenuButton={false}
        showThemeToggle={false}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {successBanner && (
          <View style={[styles.successBanner, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: colors.success }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.successBannerText, { color: isDark ? '#A7F3D0' : '#065F46' }]}>
              {successBanner}
            </Text>
          </View>
        )}

        {/* Section: Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>APPEARANCE</Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.themeRow}>
              {[
                { key: 'light', label: 'Light', icon: 'sunny-outline' as const },
                { key: 'system', label: 'System', icon: 'phone-portrait-outline' as const },
                { key: 'dark', label: 'Dark', icon: 'moon-outline' as const },
              ].map((item) => {
                const isSelected = themeMode === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => setThemeMode(item.key as any)}
                    style={[
                      styles.themeTab,
                      {
                        backgroundColor: isSelected
                          ? colors.primaryLight
                          : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.themeTabText,
                        {
                          color: isSelected ? colors.primary : colors.text,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Section: Data Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>DATA MANAGEMENT</Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Quick Stats Summary */}
            <View style={styles.statsSummaryRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: colors.text }]}>{stats.totalCount}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Documents</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: colors.primary }]}>{notes.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Notes</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: colors.success }]}>{goals.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Goals</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Refresh Library Item */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleRefresh}
              disabled={isRefreshing}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: colors.primaryLight }]}>
                {isRefreshing ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="sync-outline" size={20} color={colors.primary} />
                )}
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Refresh Library</Text>
                <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
                  Re-read local storage and re-calculate goal milestones
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Reset Demo Data Button */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => setIsResetModalVisible(true)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconWrap,
                  { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2' },
                ]}
              >
                <Ionicons name="refresh-circle-outline" size={22} color="#EF4444" />
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: '#EF4444' }]}>Reset Demo Data</Text>
                <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
                  Restore Year 3 Computer Engineering sample documents, notes, and milestones
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Storage & Cloud Sync */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>STORAGE & SYNC</Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.statusRow}>
              <View style={styles.statusLeft}>
                <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                <View>
                  <Text style={[styles.statusTitle, { color: colors.text }]}>
                    Local Storage Active
                  </Text>
                  <Text style={[styles.statusDesc, { color: colors.textSecondary }]}>
                    AsyncStorage persisting data offline on device
                  </Text>
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Offline</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.statusRow}>
              <View style={styles.statusLeft}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isFirebaseConfigured ? colors.success : '#94A3B8' },
                  ]}
                />
                <View>
                  <Text style={[styles.statusTitle, { color: colors.text }]}>Cloud Sync</Text>
                  <Text style={[styles.statusDesc, { color: colors.textSecondary }]}>
                    {isFirebaseConfigured
                      ? 'Connected to Firebase Firestore'
                      : 'Offline-First Mode (Firebase unconfigured)'}
                  </Text>
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                  {isFirebaseConfigured ? 'Connected' : 'Standalone'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section: About */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>ABOUT</Text>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>App Name</Text>
              <Text style={[styles.aboutVal, { color: colors.text }]}>DocTrack</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Version</Text>
              <Text style={[styles.aboutVal, { color: colors.text }]}>1.0.0 • Expo 54</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Curriculum</Text>
              <Text style={[styles.aboutVal, { color: colors.text }]}>
                Year 3 Computer Engineering
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Confirmation Modal for Resetting Demo Data */}
      <ConfirmModal
        visible={isResetModalVisible}
        title="Reset Demo Data"
        message="This will restore your library, notes, and reading goals back to the original Year 3 Computer Engineering curriculum sample dataset. Custom documents and notes will be cleared."
        confirmText="Reset Library"
        cancelText="Cancel"
        isDestructive={true}
        icon="alert-circle-outline"
        isLoading={isResetting}
        onConfirm={handleConfirmReset}
        onCancel={() => {
          if (!isResetting) setIsResetModalVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 20,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  successBannerText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  themeRow: {
    flexDirection: 'row',
    padding: 10,
    gap: 10,
  },
  themeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeTabText: {
    fontSize: 13,
  },
  statsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  aboutLabel: {
    fontSize: 14,
  },
  aboutVal: {
    fontSize: 14,
    fontWeight: '600',
  },
});
