import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDocuments } from '../context/DocumentContext';
import { Header } from '../components/common/Header';
import { ProgressBar } from '../components/common/ProgressBar';
import { GoalCard } from '../components/goals/GoalCard';
import { openDocument } from '../services/fileService';
import { RootStackParamList } from '../types';

export const DashboardScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { documents, goals, stats, isLoading, refreshData, resetToSeedData, updateDocumentStatus } =
    useDocuments();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const inProgressDocs = documents.filter((d) => d.status === 'in_progress');
  const activeGoals = goals.filter((g) => g.status === 'active');

  const handleResetConfirm = () => {
    Alert.alert(
      'Reset Demo Data',
      'Reset library to Year 3 Computer Engineering sample documents, notes, and goals?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetToSeedData() },
      ]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Header
        title="DocTrack"
        subtitle="Year 3 • Computer Engineering Library"
        rightAction={{
          icon: 'refresh-circle-outline',
          onPress: handleResetConfirm,
          label: 'Reset Demo',
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Quick Stats Grid */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
            {stats.totalCount} Documents
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {/* To Read */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('MainTabs') // or library filter
            }
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.statIconBox, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
              <Ionicons name="bookmark-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={[styles.statNumber, { color: colors.text }]}>{stats.toReadCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>To Read</Text>
          </TouchableOpacity>

          {/* In Progress */}
          <View
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.statIconBox, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="book-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.inProgressCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>In Progress</Text>
          </View>

          {/* Read This Month */}
          <View
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.statIconBox, { backgroundColor: colors.successLight }]}>
              <Ionicons name="checkmark-done-outline" size={18} color={colors.success} />
            </View>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {stats.readThisMonthCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Read this Month</Text>
          </View>
        </View>

        {/* Quick Category Chips */}
        <View style={styles.categoryBar}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ResearchPapers')}
            style={[
              styles.categoryPill,
              { backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9' },
            ]}
          >
            <Ionicons name="document-text" size={13} color={colors.primary} />
            <Text style={[styles.categoryPillText, { color: colors.text }]}>
              {stats.researchPapersCount} Papers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Books')}
            style={[
              styles.categoryPill,
              { backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9' },
            ]}
          >
            <Ionicons name="book" size={13} color="#A21CAF" />
            <Text style={[styles.categoryPillText, { color: colors.text }]}>
              {stats.booksCount} Books
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MainTabs' as any, {
                screen: 'Library',
                params: { initialTypeFilter: 'course_material' },
              } as any)
            }
            style={[
              styles.categoryPill,
              { backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9' },
            ]}
          >
            <Ionicons name="school" size={13} color="#0E7490" />
            <Text style={[styles.categoryPillText, { color: colors.text }]}>
              {stats.coursesCount} Courses
            </Text>
          </TouchableOpacity>
        </View>

        {/* Continue Reading Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="flame" size={18} color="#F59E0B" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Continue Reading</Text>
          </View>
          <Text style={[styles.badgeCount, { color: colors.textSecondary }]}>
            {inProgressDocs.length} Active
          </Text>
        </View>

        {inProgressDocs.length === 0 ? (
          <View
            style={[
              styles.emptyContinue,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons name="sparkles-outline" size={24} color={colors.textMuted} />
            <Text style={[styles.emptyContinueText, { color: colors.textSecondary }]}>
              No documents currently in progress. Start reading from your Library!
            </Text>
          </View>
        ) : (
          inProgressDocs.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('DocumentDetail', { documentId: doc.id })}
              style={[
                styles.continueCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.continueCardTop}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.continueTitle, { color: colors.text }]} numberOfLines={2}>
                    {doc.title}
                  </Text>
                  {doc.linked_project && (
                    <Text style={[styles.continueProject, { color: colors.primary }]}>
                      🎯 {doc.linked_project}
                    </Text>
                  )}
                </View>

                {/* 1-Tap Open Button */}
                <TouchableOpacity
                  onPress={() => openDocument(doc.source)}
                  style={[styles.openShortcutBtn, { backgroundColor: colors.primaryLight }]}
                >
                  <Ionicons name="open-outline" size={16} color={colors.primary} />
                  <Text style={[styles.openShortcutText, { color: colors.primary }]}>Open</Text>
                </TouchableOpacity>
              </View>

              <ProgressBar
                progress={doc.progress}
                height={6}
                showPercentage
                label={
                  doc.current_page && doc.total_pages
                    ? `Page ${doc.current_page} / ${doc.total_pages}`
                    : 'Progress'
                }
              />

              <View style={styles.continueFooter}>
                <TouchableOpacity
                  onPress={() => updateDocumentStatus(doc.id, 'read')}
                  style={[styles.markReadBtn, { backgroundColor: colors.successLight }]}
                >
                  <Ionicons name="checkmark-circle-outline" size={13} color={colors.success} />
                  <Text style={[styles.markReadText, { color: colors.success }]}>
                    Mark Completed
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Active Goals Section */}
        <View style={[styles.sectionHeader, { marginTop: 22 }]}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="trophy-outline" size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Goals</Text>
          </View>
          <Text style={[styles.badgeCount, { color: colors.textSecondary }]}>
            {activeGoals.length} Goals
          </Text>
        </View>

        {activeGoals.length === 0 ? (
          <View
            style={[
              styles.emptyContinue,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons name="flag-outline" size={24} color={colors.textMuted} />
            <Text style={[styles.emptyContinueText, { color: colors.textSecondary }]}>
              No active goals set. Create one in the Goals tab!
            </Text>
          </View>
        ) : (
          activeGoals.map((goal) => <GoalCard key={goal.id} goal={goal} />)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  badgeCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContinue: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyContinueText: {
    fontSize: 13,
    textAlign: 'center',
  },
  continueCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 5,
  },
  continueCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  continueTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  continueProject: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  openShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  openShortcutText: {
    fontSize: 12,
    fontWeight: '600',
  },
  continueFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  markReadText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
