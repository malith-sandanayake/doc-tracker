import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDocuments } from '../context/DocumentContext';
import { Header } from '../components/common/Header';
import { SearchBar } from '../components/common/SearchBar';
import { StatusBadge, PriorityBadge, TagBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { EmptyState } from '../components/common/EmptyState';
import { openDocument } from '../services/fileService';
import { Document, RootStackParamList } from '../types';

export const ResearchPapersScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { documents, updateDocumentStatus } = useDocuments();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const papers = useMemo(() => {
    return documents.filter((d) => d.type === 'research_paper');
  }, [documents]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    papers.forEach((p) => {
      if (p.year) years.add(p.year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [papers]);

  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      if (selectedYear && p.year !== selectedYear) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchAuthors = p.authors?.toLowerCase().includes(q) ?? false;
        const matchVenue = p.venue?.toLowerCase().includes(q) ?? false;
        const matchDoi = p.doi?.toLowerCase().includes(q) ?? false;
        const matchProject = p.linked_project?.toLowerCase().includes(q) ?? false;
        const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchAuthors && !matchVenue && !matchDoi && !matchProject && !matchTags) {
          return false;
        }
      }
      return true;
    });
  }, [papers, selectedYear, searchQuery]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Header
        title="Research Papers"
        subtitle={`${filteredPapers.length} papers indexed`}
        showBackButton={navigation.canGoBack()}
        rightAction={{
          icon: 'add',
          label: 'Add Paper',
          onPress: () => navigation.navigate('AddDocument'),
        }}
      />

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search title, authors, venue, DOI..."
      />

      {/* Year Filter Chips */}
      {availableYears.length > 0 && (
        <View style={styles.yearScroll}>
          <TouchableOpacity
            onPress={() => setSelectedYear(null)}
            style={[
              styles.yearChip,
              {
                backgroundColor:
                  selectedYear === null
                    ? colors.primary
                    : isDark
                    ? colors.surfaceSecondary
                    : '#F1F5F9',
              },
            ]}
          >
            <Text
              style={[
                styles.yearText,
                { color: selectedYear === null ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              All Years
            </Text>
          </TouchableOpacity>
          {availableYears.map((yr) => {
            const isSelected = selectedYear === yr;
            return (
              <TouchableOpacity
                key={yr}
                onPress={() => setSelectedYear(isSelected ? null : yr)}
                style={[
                  styles.yearChip,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : isDark
                      ? colors.surfaceSecondary
                      : '#F1F5F9',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.yearText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {yr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Papers List */}
      <FlatList
        data={filteredPapers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24, paddingVertical: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('DocumentDetail', { documentId: item.id })}
            activeOpacity={0.7}
            style={[
              styles.paperCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {/* Top row */}
            <View style={styles.topRow}>
              <View style={styles.badgeGroup}>
                <StatusBadge status={item.status} />
                <PriorityBadge priority={item.priority} />
              </View>
              {item.year && (
                <View style={[styles.yearBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.yearBadgeText, { color: colors.primary }]}>{item.year}</Text>
                </View>
              )}
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>

            {/* Authors */}
            {item.authors && (
              <View style={styles.metaRow}>
                <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.authorsText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.authors}
                </Text>
              </View>
            )}

            {/* Venue / Conference */}
            {item.venue && (
              <View style={styles.metaRow}>
                <Ionicons name="school-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.venueText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.venue}
                </Text>
              </View>
            )}

            {/* Linked Project */}
            {item.linked_project && (
              <View style={styles.projectRow}>
                <Ionicons name="folder-outline" size={13} color={colors.primary} />
                <Text style={[styles.projectText, { color: colors.primary }]}>
                  {item.linked_project}
                </Text>
              </View>
            )}

            {/* Tags */}
            <View style={styles.tagRow}>
              {item.tags.map((t, idx) => (
                <TagBadge key={idx} tag={t} />
              ))}
            </View>

            {/* Progress */}
            <View style={{ marginTop: 6 }}>
              <ProgressBar progress={item.progress} height={4} showPercentage />
            </View>

            {/* Bottom Actions */}
            <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => openDocument(item.source)}
                style={[styles.actionBtn, { backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9' }]}
              >
                <Ionicons name="open-outline" size={14} color={colors.text} />
                <Text style={[styles.actionBtnText, { color: colors.text }]}>Open Paper</Text>
              </TouchableOpacity>

              {item.status === 'to_read' && (
                <TouchableOpacity
                  onPress={() => updateDocumentStatus(item.id, 'in_progress')}
                  style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}
                >
                  <Ionicons name="play-outline" size={14} color={colors.primary} />
                  <Text style={[styles.actionBtnText, { color: colors.primary }]}>Start Reading</Text>
                </TouchableOpacity>
              )}

              {item.status === 'in_progress' && (
                <TouchableOpacity
                  onPress={() => updateDocumentStatus(item.id, 'read')}
                  style={[styles.actionBtn, { backgroundColor: colors.successLight }]}
                >
                  <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
                  <Text style={[styles.actionBtnText, { color: colors.success }]}>Mark Read</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="No Research Papers"
            description="Add your first research paper or import arXiv / DOI links."
            actionLabel="Add Paper"
            onAction={() => navigation.navigate('AddDocument')}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  yearScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 8,
  },
  yearChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  yearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paperCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  yearBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  yearBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  authorsText: {
    fontSize: 12,
    flex: 1,
  },
  venueText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    marginBottom: 6,
  },
  projectText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
