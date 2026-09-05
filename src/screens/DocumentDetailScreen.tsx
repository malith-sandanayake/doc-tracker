import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDocuments } from '../context/DocumentContext';
import { TypeBadge, StatusBadge, PriorityBadge, TagBadge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { NoteItem } from '../components/notes/NoteItem';
import { AddNoteInput } from '../components/notes/AddNoteInput';
import { openDocument } from '../services/fileService';
import { RootStackParamList, DocumentStatus } from '../types';

export const DocumentDetailScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'DocumentDetail'>>();
  const { documentId } = route.params;

  const {
    documents,
    updateDocument,
    deleteDocument,
    updateDocumentStatus,
    updateDocumentProgress,
    addNote,
    deleteNote,
    getNotesForDocument,
  } = useDocuments();

  const doc = documents.find((d) => d.id === documentId);
  const notes = getNotesForDocument(documentId);

  const [pageInput, setPageInput] = useState(doc?.current_page?.toString() || '');
  const [isEditingPages, setIsEditingPages] = useState(false);

  if (!doc) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.notFoundTitle, { color: colors.text }]}>Document Not Found</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleOpenSource = async () => {
    await openDocument(doc.source);
  };

  const handleStatusChange = (status: DocumentStatus) => {
    updateDocumentStatus(doc.id, status);
  };

  const handleRatingChange = (rating: number) => {
    updateDocument(doc.id, { rating });
  };

  const handleSavePageProgress = () => {
    const pageNum = parseInt(pageInput, 10);
    if (!isNaN(pageNum) && doc.total_pages && doc.total_pages > 0) {
      const calculatedProgress = Math.min(100, Math.round((pageNum / doc.total_pages) * 100));
      updateDocumentProgress(doc.id, calculatedProgress, pageNum, doc.total_pages);
    }
    setIsEditingPages(false);
  };

  const handleAdjustProgress = (delta: number) => {
    const newProgress = Math.min(100, Math.max(0, doc.progress + delta));
    let newPage = doc.current_page;
    if (doc.total_pages) {
      newPage = Math.round((newProgress / 100) * doc.total_pages);
      setPageInput(newPage.toString());
    }
    updateDocumentProgress(doc.id, newProgress, newPage, doc.total_pages);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to remove "${doc.title}" and its notes from DocTrack?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteDocument(doc.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const getSourceDisplay = () => {
    switch (doc.source.type) {
      case 'file_uri':
        return {
          icon: 'document-attach-outline' as const,
          label: 'Local File',
          detail: doc.source.fileName || doc.source.uri || 'Local Storage',
        };
      case 'google_drive':
        return {
          icon: 'logo-google' as const,
          label: 'Google Drive',
          detail: doc.source.uri || 'Cloud Storage',
        };
      case 'url':
        return {
          icon: 'globe-outline' as const,
          label: 'Web / DOI Link',
          detail: doc.source.uri || doc.doi || 'Web Reference',
        };
      case 'physical':
        return {
          icon: 'library-outline' as const,
          label: 'Physical Document',
          detail: doc.source.location || 'Physical Library Shelf',
        };
    }
  };

  const sourceInfo = getSourceDisplay();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Custom Top Navigation Bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.navBackBtn}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.topBarTitle, { color: colors.text }]} numberOfLines={1}>
          Document Details
        </Text>

        <TouchableOpacity onPress={handleDelete} style={styles.deleteNavBtn}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Badges Row */}
        <View style={styles.badgesRow}>
          <TypeBadge type={doc.type} size="medium" />
          <StatusBadge status={doc.status} size="medium" />
          <PriorityBadge priority={doc.priority} size="medium" />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>{doc.title}</Text>

        {/* Primary Open Button */}
        <TouchableOpacity
          onPress={handleOpenSource}
          activeOpacity={0.8}
          style={[styles.openButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="open-outline" size={20} color="#FFFFFF" />
          <Text style={styles.openButtonText}>
            Open {sourceInfo.label}
          </Text>
        </TouchableOpacity>

        {/* Source Location Details Card */}
        <View
          style={[
            styles.sourceCard,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9',
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name={sourceInfo.icon} size={18} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.sourceLabel, { color: colors.textSecondary }]}>
              {sourceInfo.label}
            </Text>
            <Text style={[styles.sourceDetail, { color: colors.text }]} numberOfLines={2}>
              {sourceInfo.detail}
            </Text>
          </View>
        </View>

        {/* Research Paper Specific Metadata Box */}
        {doc.type === 'research_paper' && (
          <View
            style={[
              styles.infoBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionHeader, { color: colors.text }]}>
              Paper Information
            </Text>

            {doc.authors && (
              <View style={styles.metaRow}>
                <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.metaValue, { color: colors.text }]}>{doc.authors}</Text>
              </View>
            )}

            {doc.venue && (
              <View style={styles.metaRow}>
                <Ionicons name="school-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.metaValue, { color: colors.text }]}>
                  {doc.venue} {doc.year ? `(${doc.year})` : ''}
                </Text>
              </View>
            )}

            {doc.doi && (
              <View style={styles.metaRow}>
                <Ionicons name="finger-print-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.metaValue, { color: colors.primary }]}>DOI: {doc.doi}</Text>
              </View>
            )}
          </View>
        )}

        {/* Linked Project & Tags */}
        <View
          style={[
            styles.infoBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionHeader, { color: colors.text }]}>
            Organization & Tags
          </Text>

          {doc.linked_project ? (
            <View style={styles.metaRow}>
              <Ionicons name="folder-outline" size={16} color={colors.primary} />
              <Text style={[styles.metaValue, { color: colors.primary, fontWeight: '700' }]}>
                {doc.linked_project}
              </Text>
            </View>
          ) : (
            <Text style={[styles.noProjectText, { color: colors.textMuted }]}>
              No linked project assigned
            </Text>
          )}

          <View style={styles.tagsContainer}>
            {doc.tags.map((tag, idx) => (
              <TagBadge key={idx} tag={tag} size="medium" />
            ))}
          </View>
        </View>

        {/* Status Switcher Section */}
        <View
          style={[
            styles.infoBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionHeader, { color: colors.text }]}>
            Reading Status
          </Text>

          <View style={styles.statusButtonsRow}>
            <TouchableOpacity
              onPress={() => handleStatusChange('to_read')}
              style={[
                styles.statusBtn,
                {
                  backgroundColor:
                    doc.status === 'to_read'
                      ? isDark
                        ? '#334155'
                        : '#475569'
                      : isDark
                      ? colors.surfaceSecondary
                      : '#F1F5F9',
                },
              ]}
            >
              <Ionicons
                name="bookmark-outline"
                size={16}
                color={doc.status === 'to_read' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.statusBtnText,
                  {
                    color: doc.status === 'to_read' ? '#FFFFFF' : colors.textSecondary,
                  },
                ]}
              >
                To Read
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStatusChange('in_progress')}
              style={[
                styles.statusBtn,
                {
                  backgroundColor:
                    doc.status === 'in_progress'
                      ? colors.primary
                      : isDark
                      ? colors.surfaceSecondary
                      : '#F1F5F9',
                },
              ]}
            >
              <Ionicons
                name="book-outline"
                size={16}
                color={doc.status === 'in_progress' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.statusBtnText,
                  {
                    color: doc.status === 'in_progress' ? '#FFFFFF' : colors.textSecondary,
                  },
                ]}
              >
                In Progress
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStatusChange('read')}
              style={[
                styles.statusBtn,
                {
                  backgroundColor:
                    doc.status === 'read'
                      ? colors.success
                      : isDark
                      ? colors.surfaceSecondary
                      : '#F1F5F9',
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={doc.status === 'read' ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.statusBtnText,
                  {
                    color: doc.status === 'read' ? '#FFFFFF' : colors.textSecondary,
                  },
                ]}
              >
                Read
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reading Progress Section */}
        <View
          style={[
            styles.infoBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.progressHeaderRow}>
            <Text style={[styles.sectionHeader, { color: colors.text, marginBottom: 0 }]}>
              Reading Progress
            </Text>
            <Text style={[styles.progressValue, { color: colors.primary }]}>
              {doc.progress}%
            </Text>
          </View>

          <ProgressBar progress={doc.progress} height={8} />

          {/* Stepper Buttons (-10%, +10%) */}
          <View style={styles.stepperRow}>
            <TouchableOpacity
              onPress={() => handleAdjustProgress(-10)}
              style={[styles.stepperBtn, { backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9' }]}
            >
              <Text style={[styles.stepperText, { color: colors.text }]}>-10%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleAdjustProgress(-25)}
              style={[styles.stepperBtn, { backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9' }]}
            >
              <Text style={[styles.stepperText, { color: colors.text }]}>-25%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleAdjustProgress(25)}
              style={[styles.stepperBtn, { backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9' }]}
            >
              <Text style={[styles.stepperText, { color: colors.text }]}>+25%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleAdjustProgress(10)}
              style={[styles.stepperBtn, { backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9' }]}
            >
              <Text style={[styles.stepperText, { color: colors.text }]}>+10%</Text>
            </TouchableOpacity>
          </View>

          {/* Page Counter for Books or Paged Docs */}
          {doc.total_pages && doc.total_pages > 0 && (
            <View style={[styles.pageTrackerRow, { borderTopColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.pageLabel, { color: colors.textSecondary }]}>
                  Pages read: {doc.current_page || 0} of {doc.total_pages}
                </Text>
              </View>

              {isEditingPages ? (
                <View style={styles.pageInputRow}>
                  <TextInput
                    style={[
                      styles.pageTextInput,
                      {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9',
                      },
                    ]}
                    keyboardType="number-pad"
                    value={pageInput}
                    onChangeText={setPageInput}
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={handleSavePageProgress}
                    style={[styles.savePageBtn, { backgroundColor: colors.primary }]}
                  >
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsEditingPages(true)}
                  style={[styles.editPageBtn, { backgroundColor: colors.primaryLight }]}
                >
                  <Ionicons name="create-outline" size={14} color={colors.primary} />
                  <Text style={[styles.editPageText, { color: colors.primary }]}>Update Page</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Rating Stars (Post-Read) */}
        {doc.status === 'read' && (
          <View
            style={[
              styles.infoBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionHeader, { color: colors.text }]}>
              Rating
            </Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRatingChange(star)}
                  style={styles.starTouch}
                >
                  <Ionicons
                    name={star <= (doc.rating || 0) ? 'star' : 'star-outline'}
                    size={28}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Notes Log Section */}
        <View
          style={[
            styles.infoBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.notesHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="reader-outline" size={18} color={colors.primary} />
              <Text style={[styles.sectionHeader, { color: colors.text, marginBottom: 0 }]}>
                Reading Notes ({notes.length})
              </Text>
            </View>
          </View>

          {/* Add New Note Box */}
          <AddNoteInput onAddNote={(content) => addNote(doc.id, content)} />

          {/* Notes List */}
          {notes.length === 0 ? (
            <Text style={[styles.emptyNotesText, { color: colors.textMuted }]}>
              No notes recorded yet. Write down takeaways or important equations from your reading session!
            </Text>
          ) : (
            notes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onDelete={() => deleteNote(note.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  topBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  navBackBtn: {
    padding: 8,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  deleteNavBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 16,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 10,
    gap: 8,
    marginBottom: 14,
  },
  openButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    marginBottom: 14,
  },
  sourceLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sourceDetail: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  infoBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  metaValue: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  noProjectText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  stepperBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  stepperText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pageTrackerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  pageLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  pageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageTextInput: {
    width: 60,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  savePageBtn: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editPageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  editPageText: {
    fontSize: 12,
    fontWeight: '600',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  starTouch: {
    padding: 2,
  },
  notesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyNotesText: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 14,
  },
});
