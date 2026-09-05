import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDocuments } from '../context/DocumentContext';
import { Header } from '../components/common/Header';
import { SearchBar } from '../components/common/SearchBar';
import { DocumentCard } from '../components/document/DocumentCard';
import { DocumentFilterModal } from '../components/document/DocumentFilterModal';
import { EmptyState } from '../components/common/EmptyState';
import {
  Document,
  DocumentFilter,
  DocumentType,
  DocumentStatus,
  RootStackParamList,
  MainTabParamList,
} from '../types';

export const LibraryScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<MainTabParamList, 'Library'>>();
  const { documents, notes, updateDocumentStatus } = useDocuments();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeTab, setActiveTypeTab] = useState<DocumentType | 'all'>(
    route.params?.initialTypeFilter || 'all'
  );
  const [activeStatusTab, setActiveStatusTab] = useState<DocumentStatus | 'all'>('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [advancedFilters, setAdvancedFilters] = useState<DocumentFilter>({
    type: route.params?.initialTypeFilter || 'all',
    status: 'all',
    priority: 'all',
    project: route.params?.initialProject,
    tag: route.params?.initialTag,
    sortBy: 'recently_added',
  });

  // Extract unique projects and tags from existing documents
  const availableProjects = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => {
      if (d.linked_project) set.add(d.linked_project);
    });
    return Array.from(set).sort();
  }, [documents]);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => {
      d.tags.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [documents]);

  // Primary filtering and search algorithm
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // 1. Type filter
      const typeMatches =
        activeTypeTab === 'all'
          ? advancedFilters.type === 'all' || !advancedFilters.type || doc.type === advancedFilters.type
          : doc.type === activeTypeTab;
      if (!typeMatches) return false;

      // 2. Status filter
      const statusMatches =
        activeStatusTab === 'all'
          ? advancedFilters.status === 'all' || !advancedFilters.status || doc.status === advancedFilters.status
          : doc.status === activeStatusTab;
      if (!statusMatches) return false;

      // 3. Priority filter
      if (advancedFilters.priority && advancedFilters.priority !== 'all') {
        if (doc.priority !== advancedFilters.priority) return false;
      }

      // 4. Project filter
      if (advancedFilters.project) {
        if (doc.linked_project?.toLowerCase() !== advancedFilters.project.toLowerCase()) return false;
      }

      // 5. Tag filter
      if (advancedFilters.tag) {
        if (!doc.tags.some((t) => t.toLowerCase() === advancedFilters.tag?.toLowerCase())) return false;
      }

      // 6. Search Query (matches title, tags, authors, project, AND notes content)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = doc.title.toLowerCase().includes(query);
        const matchesTags = doc.tags.some((t) => t.toLowerCase().includes(query));
        const matchesAuthors = doc.authors?.toLowerCase().includes(query) ?? false;
        const matchesProject = doc.linked_project?.toLowerCase().includes(query) ?? false;

        // Search in linked notes
        const docNotes = notes.filter((n) => n.document_id === doc.id);
        const matchesNotes = docNotes.some((n) => n.content.toLowerCase().includes(query));

        if (!matchesTitle && !matchesTags && !matchesAuthors && !matchesProject && !matchesNotes) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const sortBy = advancedFilters.sortBy || 'recently_added';
      if (sortBy === 'priority') {
        const order = { high: 3, medium: 2, low: 1 };
        return order[b.priority] - order[a.priority];
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'progress') {
        return b.progress - a.progress;
      }
      // Default: recently added
      return new Date(b.added_date).getTime() - new Date(a.added_date).getTime();
    });
  }, [documents, notes, activeTypeTab, activeStatusTab, advancedFilters, searchQuery]);

  const hasActiveFilters = Boolean(
    advancedFilters.priority !== 'all' ||
      advancedFilters.project ||
      advancedFilters.tag ||
      (advancedFilters.sortBy && advancedFilters.sortBy !== 'recently_added')
  );

  const typeTabs: { label: string; value: DocumentType | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Papers', value: 'research_paper' },
    { label: 'Books', value: 'book' },
    { label: 'Course Notes', value: 'course_material' },
    { label: 'Other', value: 'other' },
  ];

  const statusPills: { label: string; value: DocumentStatus | 'all' }[] = [
    { label: 'All Status', value: 'all' },
    { label: 'To Read', value: 'to_read' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Read', value: 'read' },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Header
        title="Library"
        subtitle={`${filteredDocuments.length} of ${documents.length} documents`}
        rightAction={{
          icon: 'add',
          label: 'Add',
          onPress: () => navigation.navigate('AddDocument'),
        }}
      />

      {/* Search Input with Filter Trigger */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFilterPress={() => setFilterModalVisible(true)}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Type Tabs Bar */}
      <View style={{ backgroundColor: colors.surface }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeTabsScroll}
        >
          {typeTabs.map((tab) => {
            const isSelected = activeTypeTab === tab.value;
            const count =
              tab.value === 'all'
                ? documents.length
                : documents.filter((d) => d.type === tab.value).length;

            return (
              <TouchableOpacity
                key={tab.value}
                onPress={() => setActiveTypeTab(tab.value)}
                style={[
                  styles.typeTab,
                  {
                    borderBottomColor: isSelected ? colors.primary : 'transparent',
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.typeTabText,
                    {
                      color: isSelected ? colors.primary : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: isSelected
                        ? colors.primaryLight
                        : isDark
                        ? colors.surfaceSecondary
                        : '#F1F5F9',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      { color: isSelected ? colors.primary : colors.textMuted },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Status Filter Pills */}
      <View style={styles.statusPillsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}
        >
          {statusPills.map((pill) => {
            const isSelected = activeStatusTab === pill.value;
            return (
              <TouchableOpacity
                key={pill.value}
                onPress={() => setActiveStatusTab(pill.value)}
                style={[
                  styles.statusPill,
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
                    styles.statusPillText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {pill.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Active project / tag filters pill with dismiss */}
          {advancedFilters.project && (
            <TouchableOpacity
              onPress={() => setAdvancedFilters({ ...advancedFilters, project: undefined })}
              style={[styles.statusPill, { backgroundColor: colors.primaryLight }]}
            >
              <Text style={[styles.statusPillText, { color: colors.primary }]}>
                🎯 {advancedFilters.project} ✕
              </Text>
            </TouchableOpacity>
          )}

          {advancedFilters.tag && (
            <TouchableOpacity
              onPress={() => setAdvancedFilters({ ...advancedFilters, tag: undefined })}
              style={[styles.statusPill, { backgroundColor: colors.primaryLight }]}
            >
              <Text style={[styles.statusPillText, { color: colors.primary }]}>
                #{advancedFilters.tag} ✕
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Document List */}
      <FlatList
        data={filteredDocuments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DocumentCard
            document={item}
            onPress={() => navigation.navigate('DocumentDetail', { documentId: item.id })}
            onStatusChange={(newStatus) => updateDocumentStatus(item.id, newStatus)}
          />
        )}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 24 }}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No Documents Found"
            description={
              searchQuery || hasActiveFilters
                ? 'No documents matched your search or filters. Try adjusting your query.'
                : 'Your library is empty. Add your first research paper or document!'
            }
            actionLabel={
              searchQuery || hasActiveFilters ? 'Clear Filters' : 'Add Document'
            }
            onAction={() => {
              if (searchQuery || hasActiveFilters) {
                setSearchQuery('');
                setActiveTypeTab('all');
                setActiveStatusTab('all');
                setAdvancedFilters({
                  type: 'all',
                  status: 'all',
                  priority: 'all',
                  sortBy: 'recently_added',
                });
              } else {
                navigation.navigate('AddDocument');
              }
            }}
          />
        }
      />

      {/* Filter Modal */}
      <DocumentFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={advancedFilters}
        onApplyFilters={(newFilters) => setAdvancedFilters(newFilters)}
        availableProjects={availableProjects}
        availableTags={availableTags}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  typeTabsScroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  typeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  typeTabText: {
    fontSize: 13,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusPillsContainer: {
    paddingVertical: 8,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
