import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { DocumentFilter, DocumentStatus, DocumentType, Priority, SortOption } from '../../types';

interface DocumentFilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: DocumentFilter;
  onApplyFilters: (filters: DocumentFilter) => void;
  availableProjects: string[];
  availableTags: string[];
}

export const DocumentFilterModal: React.FC<DocumentFilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApplyFilters,
  availableProjects,
  availableTags,
}) => {
  const { colors, isDark } = useTheme();

  const [localFilters, setLocalFilters] = React.useState<DocumentFilter>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, visible]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const cleared: DocumentFilter = {
      type: 'all',
      status: 'all',
      priority: 'all',
      project: undefined,
      tag: undefined,
      sortBy: 'recently_added',
      searchQuery: localFilters.searchQuery,
    };
    setLocalFilters(cleared);
    onApplyFilters(cleared);
    onClose();
  };

  const statusOptions: { label: string; value: DocumentStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'To Read', value: 'to_read' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Read', value: 'read' },
  ];

  const typeOptions: { label: string; value: DocumentType | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Papers', value: 'research_paper' },
    { label: 'Books', value: 'book' },
    { label: 'Courses', value: 'course_material' },
    { label: 'Other', value: 'other' },
  ];

  const priorityOptions: { label: string; value: Priority | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ];

  const sortOptions: { label: string; value: SortOption }[] = [
    { label: 'Recently Added', value: 'recently_added' },
    { label: 'Priority', value: 'priority' },
    { label: 'Title (A-Z)', value: 'title' },
    { label: 'Progress', value: 'progress' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Filter & Sort</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                <Text style={[styles.resetText, { color: colors.primary }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Status */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Status</Text>
            <View style={styles.chipRow}>
              {statusOptions.map((opt) => {
                const isSelected = (localFilters.status || 'all') === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setLocalFilters({ ...localFilters, status: opt.value })}
                    style={[
                      styles.chip,
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
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Document Type */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Document Type</Text>
            <View style={styles.chipRow}>
              {typeOptions.map((opt) => {
                const isSelected = (localFilters.type || 'all') === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setLocalFilters({ ...localFilters, type: opt.value })}
                    style={[
                      styles.chip,
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
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Priority */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Priority</Text>
            <View style={styles.chipRow}>
              {priorityOptions.map((opt) => {
                const isSelected = (localFilters.priority || 'all') === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setLocalFilters({ ...localFilters, priority: opt.value })}
                    style={[
                      styles.chip,
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
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Sort By */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Sort By</Text>
            <View style={styles.chipRow}>
              {sortOptions.map((opt) => {
                const isSelected = (localFilters.sortBy || 'recently_added') === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setLocalFilters({ ...localFilters, sortBy: opt.value })}
                    style={[
                      styles.chip,
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
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Linked Project */}
            {availableProjects.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Linked Project
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
                  <TouchableOpacity
                    onPress={() => setLocalFilters({ ...localFilters, project: undefined })}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: !localFilters.project
                          ? colors.primary
                          : isDark
                          ? colors.surfaceSecondary
                          : '#F1F5F9',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: !localFilters.project ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      All Projects
                    </Text>
                  </TouchableOpacity>
                  {availableProjects.map((p) => {
                    const isSelected = localFilters.project === p;
                    return (
                      <TouchableOpacity
                        key={p}
                        onPress={() =>
                          setLocalFilters({
                            ...localFilters,
                            project: isSelected ? undefined : p,
                          })
                        }
                        style={[
                          styles.chip,
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
                            styles.chipText,
                            { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                          ]}
                        >
                          {p}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}

            {/* Tags */}
            {availableTags.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Tag / Course</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalChips}>
                  <TouchableOpacity
                    onPress={() => setLocalFilters({ ...localFilters, tag: undefined })}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: !localFilters.tag
                          ? colors.primary
                          : isDark
                          ? colors.surfaceSecondary
                          : '#F1F5F9',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: !localFilters.tag ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      All Tags
                    </Text>
                  </TouchableOpacity>
                  {availableTags.map((t) => {
                    const isSelected = localFilters.tag === t;
                    return (
                      <TouchableOpacity
                        key={t}
                        onPress={() =>
                          setLocalFilters({
                            ...localFilters,
                            tag: isSelected ? undefined : t,
                          })
                        }
                        style={[
                          styles.chip,
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
                            styles.chipText,
                            { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                          ]}
                        >
                          #{t}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}

            {/* Apply Button */}
            <TouchableOpacity
              onPress={handleApply}
              style={[styles.applyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resetBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  horizontalChips: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  applyBtn: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
