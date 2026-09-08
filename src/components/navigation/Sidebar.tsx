import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  Alert,
  TouchableWithoutFeedback,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useDocuments } from '../../context/DocumentContext';
import { useSidebar } from '../../context/SidebarContext';
import {
  navigateToDashboard,
  navigateToLibrary,
  navigateToResearchPapers,
  navigateToBooks,
  navigateToGoals,
  navigateToAddDocument,
} from '../../navigation/navigationRef';
import { DocumentType, DocumentStatus } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 330);

export const Sidebar: React.FC = () => {
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const { documents, goals, stats, refreshData, resetToSeedData } = useDocuments();
  const insets = useSafeAreaInsets();

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSidebarOpen) {
      Animated.timing(anim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isSidebarOpen, anim]);

  // PanResponder to allow swiping left to close
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dx < -15 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50 || gestureState.vx < -0.5) {
          handleClose();
        }
      },
    })
  ).current;

  const handleClose = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      closeSidebar();
    });
  };

  // Safe navigation handlers that close the sidebar first
  const handleNav = (action: () => void) => {
    handleClose();
    // Short delay to let drawer animation finish smoothly
    setTimeout(() => {
      action();
    }, 150);
  };

  // Derive unique projects with count
  const projectList = useMemo(() => {
    const map = new Map<string, number>();
    documents.forEach((d) => {
      if (d.linked_project) {
        map.set(d.linked_project, (map.get(d.linked_project) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [documents]);

  const completionRate = useMemo(() => {
    if (stats.totalCount === 0) return 0;
    return Math.round((stats.readCount / stats.totalCount) * 100);
  }, [stats.totalCount, stats.readCount]);

  const handleResetConfirm = () => {
    handleClose();
    setTimeout(() => {
      Alert.alert(
        'Reset Demo Data',
        'Reset library to original Year 3 Computer Engineering sample documents, notes, and reading goals?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset Library',
            style: 'destructive',
            onPress: async () => {
              await resetToSeedData();
              Alert.alert('Reset Complete', 'Library has been reset to default curriculum data.');
            },
          },
        ]
      );
    }, 200);
  };

  const handleRefresh = async () => {
    handleClose();
    try {
      await refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const drawerTranslateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  const backdropOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={isSidebarOpen}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlayContainer}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Drawer content */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.drawer,
            {
              width: DRAWER_WIDTH,
              backgroundColor: colors.surface,
              borderRightColor: colors.border,
              transform: [{ translateX: drawerTranslateX }],
              paddingTop: Math.max(insets.top, 16),
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={[styles.brandIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="folder-open" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={[styles.brandTitle, { color: colors.text }]}>DocTrack</Text>
                  <View style={[styles.proBadge, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.proBadgeText, { color: colors.primary }]}>Y3 • CE</Text>
                  </View>
                </View>
                <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
                  Engineering Workspace
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
                accessibilityLabel="Close sidebar"
              >
                <Ionicons name="close" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Quick Progress Banner */}
            <View
              style={[
                styles.statsBanner,
                { backgroundColor: isDark ? colors.surfaceSecondary : '#F8FAFC', borderColor: colors.border },
              ]}
            >
              <View style={styles.statsBannerTop}>
                <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                  Library Completion
                </Text>
                <Text style={[styles.progressPercent, { color: colors.primary }]}>
                  {completionRate}% ({stats.readCount}/{stats.totalCount})
                </Text>
              </View>
              <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(completionRate, 100)}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>

              {/* Counters */}
              <View style={styles.miniStatsRow}>
                <TouchableOpacity
                  onPress={() => handleNav(() => navigateToLibrary({ initialStatusFilter: 'to_read' }))}
                  style={styles.miniStatItem}
                >
                  <Text style={[styles.miniStatVal, { color: colors.text }]}>{stats.toReadCount}</Text>
                  <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>To Read</Text>
                </TouchableOpacity>

                <View style={[styles.miniStatDivider, { backgroundColor: colors.border }]} />

                <TouchableOpacity
                  onPress={() =>
                    handleNav(() => navigateToLibrary({ initialStatusFilter: 'in_progress' }))
                  }
                  style={styles.miniStatItem}
                >
                  <Text style={[styles.miniStatVal, { color: colors.primary }]}>
                    {stats.inProgressCount}
                  </Text>
                  <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>Reading</Text>
                </TouchableOpacity>

                <View style={[styles.miniStatDivider, { backgroundColor: colors.border }]} />

                <TouchableOpacity
                  onPress={() => handleNav(() => navigateToLibrary({ initialStatusFilter: 'read' }))}
                  style={styles.miniStatItem}
                >
                  <Text style={[styles.miniStatVal, { color: colors.success }]}>
                    {stats.readCount}
                  </Text>
                  <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>Finished</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Scrollable Navigation Options */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Main Navigation Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>NAVIGATION</Text>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleNav(() => navigateToDashboard())}
              >
                <View style={[styles.navIconBox, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="grid-outline" size={17} color={colors.primary} />
                </View>
                <Text style={[styles.navItemLabel, { color: colors.text }]}>Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() =>
                  handleNav(() =>
                    navigateToLibrary({ initialTypeFilter: 'all', initialStatusFilter: 'all' })
                  )
                }
              >
                <View style={[styles.navIconBox, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="library-outline" size={17} color={colors.text} />
                </View>
                <Text style={[styles.navItemLabel, { color: colors.text }]}>Library</Text>
                <View style={[styles.badge, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                    {stats.totalCount}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleNav(() => navigateToResearchPapers())}
              >
                <View style={[styles.navIconBox, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="document-text-outline" size={17} color={colors.text} />
                </View>
                <Text style={[styles.navItemLabel, { color: colors.text }]}>Research Papers</Text>
                <View style={[styles.badge, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                    {stats.researchPapersCount}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleNav(() => navigateToBooks())}
              >
                <View style={[styles.navIconBox, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="book-outline" size={17} color="#A21CAF" />
                </View>
                <Text style={[styles.navItemLabel, { color: colors.text }]}>Books & Textbooks</Text>
                <View style={[styles.badge, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                    {stats.booksCount}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleNav(() => navigateToGoals())}
              >
                <View style={[styles.navIconBox, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="trophy-outline" size={17} color={colors.text} />
                </View>
                <Text style={[styles.navItemLabel, { color: colors.text }]}>Goals & Targets</Text>
                <View style={[styles.badge, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                    {goals.filter((g) => g.status === 'active').length}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleNav(() => navigateToAddDocument())}
              >
                <View style={[styles.navIconBox, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="add-circle-outline" size={17} color={colors.primary} />
                </View>
                <Text style={[styles.navItemLabel, { color: colors.primary, fontWeight: '700' }]}>
                  Add Document
                </Text>
              </TouchableOpacity>
            </View>

            {/* Document Categories Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>CATEGORIES</Text>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() =>
                  handleNav(() => navigateToLibrary({ initialTypeFilter: 'research_paper' }))
                }
              >
                <View style={[styles.navIconBox, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="newspaper-outline" size={17} color={colors.primary} />
                </View>
                <Text style={[styles.navItemLabel, { color: colors.text }]}>Research Papers</Text>
                <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
                  {stats.researchPapersCount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleNav(() => navigateToBooks())}
              >
                <View style={[styles.navIconBox, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="book-outline" size={17} color="#A21CAF" />
                </View>
                <Text style={[styles.navItemLabel, { color: colors.text }]}>Books & Textbooks</Text>
                <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
                  {stats.booksCount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() =>
                  handleNav(() => navigateToLibrary({ initialTypeFilter: 'course_material' }))
                }
              >
                <View style={[styles.navIconBox, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="school-outline" size={17} color="#0E7490" />
                </View>
                <Text style={[styles.navItemLabel, { color: colors.text }]}>Course Materials</Text>
                <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
                  {stats.coursesCount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleNav(() => navigateToLibrary({ initialTypeFilter: 'other' }))}
              >
                <View style={[styles.navIconBox, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="folder-outline" size={17} color={colors.textSecondary} />
                </View>
                <Text style={[styles.navItemLabel, { color: colors.text }]}>Other Documents</Text>
                <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
                  {Math.max(
                    0,
                    stats.totalCount -
                      (stats.researchPapersCount + stats.booksCount + stats.coursesCount)
                  )}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Reading Status Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>READING STATUS</Text>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() =>
                  handleNav(() => navigateToLibrary({ initialStatusFilter: 'to_read' }))
                }
              >
                <View style={[styles.statusDot, { backgroundColor: colors.textMuted }]} />
                <Text style={[styles.navItemLabel, { color: colors.text }]}>To Read</Text>
                <View style={[styles.badge, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                    {stats.toReadCount}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() =>
                  handleNav(() => navigateToLibrary({ initialStatusFilter: 'in_progress' }))
                }
              >
                <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.navItemLabel, { color: colors.text }]}>In Progress</Text>
                <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>
                    {stats.inProgressCount}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleNav(() => navigateToLibrary({ initialStatusFilter: 'read' }))}
              >
                <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.navItemLabel, { color: colors.text }]}>Completed</Text>
                <View style={[styles.badge, { backgroundColor: colors.successLight }]}>
                  <Text style={[styles.badgeText, { color: colors.success }]}>
                    {stats.readCount}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Projects & Subjects Section */}
            {projectList.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                  PROJECTS & MODULES
                </Text>
                {projectList.map((p) => (
                  <TouchableOpacity
                    key={p.name}
                    style={styles.navItem}
                    onPress={() => handleNav(() => navigateToLibrary({ initialProject: p.name }))}
                  >
                    <View style={[styles.navIconBox, { backgroundColor: colors.surfaceSecondary }]}>
                      <Ionicons name="folder-open-outline" size={15} color={colors.primary} />
                    </View>
                    <Text
                      style={[styles.navItemLabel, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {p.name}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: colors.surfaceSecondary }]}>
                      <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                        {p.count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ACTIONS</Text>

              <TouchableOpacity style={styles.navItem} onPress={handleRefresh}>
                <View style={[styles.navIconBox, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="sync-outline" size={17} color={colors.text} />
                </View>
                <Text style={[styles.navItemLabel, { color: colors.text }]}>Refresh Library</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navItem}
                onPress={() => handleNav(() => navigateToGoals())}
              >
                <View style={[styles.navIconBox, { backgroundColor: colors.surfaceSecondary }]}>
                  <Ionicons name="flag-outline" size={17} color={colors.text} />
                </View>
                <Text style={[styles.navItemLabel, { color: colors.text }]}>Track New Milestone</Text>
              </TouchableOpacity>
            </View>

            {/* Appearance / Theme Selector */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>APPEARANCE</Text>
              <View
                style={[
                  styles.themeSelector,
                  { backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9' },
                ]}
              >
                <TouchableOpacity
                  onPress={() => setThemeMode('light')}
                  style={[
                    styles.themeOption,
                    themeMode === 'light' && {
                      backgroundColor: colors.surface,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    },
                  ]}
                >
                  <Ionicons
                    name="sunny-outline"
                    size={16}
                    color={themeMode === 'light' ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.themeText,
                      { color: themeMode === 'light' ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    Light
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setThemeMode('system')}
                  style={[
                    styles.themeOption,
                    themeMode === 'system' && {
                      backgroundColor: colors.surface,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    },
                  ]}
                >
                  <Ionicons
                    name="phone-portrait-outline"
                    size={16}
                    color={themeMode === 'system' ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.themeText,
                      { color: themeMode === 'system' ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    System
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setThemeMode('dark')}
                  style={[
                    styles.themeOption,
                    themeMode === 'dark' && {
                      backgroundColor: colors.surface,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    },
                  ]}
                >
                  <Ionicons
                    name="moon-outline"
                    size={16}
                    color={themeMode === 'dark' ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.themeText,
                      { color: themeMode === 'dark' ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    Dark
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reset Demo Data Action */}
            <View style={styles.section}>
              <TouchableOpacity
                onPress={handleResetConfirm}
                style={[styles.resetButton, { backgroundColor: isDark ? '#451a1a' : '#FEF2F2' }]}
              >
                <Ionicons name="refresh-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.resetButtonText}>Reset Demo Data</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer App Info */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <View style={styles.footerRow}>
              <View style={[styles.statusIndicator, { backgroundColor: colors.success }]} />
              <Text style={[styles.footerStatus, { color: colors.textSecondary }]}>
                Offline Storage Active
              </Text>
            </View>
            <Text style={[styles.footerVersion, { color: colors.textMuted }]}>
              DocTrack v1.0.0 • Expo 54
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  drawer: {
    height: '100%',
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 16,
    zIndex: 9999,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  proBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBanner: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  statsBannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  miniStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  miniStatDivider: {
    width: 1,
    height: 18,
  },
  miniStatVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  miniStatLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 10,
  },
  navIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 10,
    marginRight: 10,
  },
  themeSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 3,
    gap: 4,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  themeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusIndicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  footerStatus: {
    fontSize: 11,
    fontWeight: '500',
  },
  footerVersion: {
    fontSize: 10,
    fontWeight: '500',
  },
});
