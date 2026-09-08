import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
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
import { openDocument, pickDocument } from '../services/fileService';
import { Document, RootStackParamList, DocumentStatus } from '../types';

export const BooksScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { documents, updateDocumentProgress, updateDocumentStatus, updateDocument } =
    useDocuments();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
  const [editingPageDocId, setEditingPageDocId] = useState<string | null>(null);
  const [pageInputValue, setPageInputValue] = useState('');

  // Extract all books
  const books = useMemo(() => {
    return documents.filter((d) => d.type === 'book');
  }, [documents]);

  // Currently reading books
  const currentlyReading = useMemo(() => {
    return books.filter(
      (b) => b.status === 'in_progress' || (b.progress > 0 && b.status !== 'read')
    );
  }, [books]);

  // Derived statistics
  const totalPagesRead = useMemo(() => {
    return books.reduce((acc, b) => acc + (b.current_page || 0), 0);
  }, [books]);

  const completedBooks = useMemo(() => {
    return books.filter((b) => b.status === 'read');
  }, [books]);

  const toReadBooks = useMemo(() => {
    return books.filter((b) => b.status === 'to_read');
  }, [books]);

  // Filtered books list
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchAuthors = b.authors?.toLowerCase().includes(q) ?? false;
        const matchProject = b.linked_project?.toLowerCase().includes(q) ?? false;
        const matchTags = b.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchAuthors && !matchProject && !matchTags) return false;
      }
      return true;
    });
  }, [books, statusFilter, searchQuery]);

  // Quick page step update for a book
  const handleQuickPageStep = async (book: Document, delta: number) => {
    const totalPages = book.total_pages || 100;
    const current = book.current_page || 0;
    const newPage = Math.max(0, Math.min(totalPages, current + delta));
    const newProgress = Math.round((newPage / totalPages) * 100);

    await updateDocumentProgress(book.id, newProgress, newPage, totalPages);

    if (newPage >= totalPages && book.status !== 'read') {
      await updateDocumentStatus(book.id, 'read');
      Alert.alert('Congratulations! 🎉', `You finished reading "${book.title}"!`);
    } else if (newPage > 0 && book.status === 'to_read') {
      await updateDocumentStatus(book.id, 'in_progress');
    }
  };

  // Save manual page input
  const handleSaveCustomPage = async (book: Document) => {
    const pageNum = parseInt(pageInputValue, 10);
    const totalPages = book.total_pages || 100;
    if (!isNaN(pageNum) && pageNum >= 0) {
      const clampedPage = Math.min(totalPages, pageNum);
      const newProgress = Math.round((clampedPage / totalPages) * 100);
      await updateDocumentProgress(book.id, newProgress, clampedPage, totalPages);
      if (clampedPage >= totalPages) {
        await updateDocumentStatus(book.id, 'read');
      } else if (clampedPage > 0 && book.status === 'to_read') {
        await updateDocumentStatus(book.id, 'in_progress');
      }
    }
    setEditingPageDocId(null);
    setPageInputValue('');
  };

  // Open linked PDF or trigger picker if missing
  const handleOpenPdf = async (book: Document) => {
    if (book.source.uri || book.source.type === 'file_uri') {
      await openDocument(book.source);
    } else {
      Alert.alert(
        'No PDF Attached',
        'This book does not have a linked local PDF file. Would you like to select one now?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Choose PDF',
            onPress: async () => {
              const file = await pickDocument();
              if (file) {
                await updateDocument(book.id, {
                  source: {
                    type: 'file_uri',
                    uri: file.uri,
                    fileName: file.fileName,
                    mimeType: file.mimeType,
                  },
                });
                Alert.alert('PDF Linked', `Linked "${file.fileName}" to ${book.title}.`);
              }
            },
          },
        ]
      );
    }
  };

  // Attach/change PDF file
  const handleLinkLocalPdf = async (book: Document) => {
    const file = await pickDocument();
    if (file) {
      await updateDocument(book.id, {
        source: {
          type: 'file_uri',
          uri: file.uri,
          fileName: file.fileName,
          mimeType: file.mimeType,
        },
      });
      Alert.alert('PDF Linked', `"${file.fileName}" has been attached to ${book.title}.`);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Header
        title="Books & Textbooks"
        subtitle={`${books.length} books • ${currentlyReading.length} currently reading`}
        showBackButton={navigation.canGoBack()}
        rightAction={{
          icon: 'add',
          label: 'Add Book',
          onPress: () => navigation.navigate('AddDocument', { prefillType: 'book' }),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Quick Statistics Banner */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="book" size={18} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{books.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Books</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="flame" size={18} color="#F59E0B" />
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{currentlyReading.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>In Progress</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="document-text" size={18} color="#0EA5E9" />
            <Text style={[styles.statNumber, { color: colors.text }]}>{totalPagesRead}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pages Read</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={[styles.statNumber, { color: colors.success }]}>{completedBooks.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
          </View>
        </View>

        {/* ======================================================== */}
        {/* HERO SECTION: Currently Reading Showcase with Progress */}
        {/* ======================================================== */}
        <View style={styles.sectionHeader}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="flame" size={20} color="#F59E0B" />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Currently Reading</Text>
          </View>
          <Text style={[styles.badgeCount, { color: colors.textSecondary }]}>
            {currentlyReading.length} active
          </Text>
        </View>

        {currentlyReading.length === 0 ? (
          <View style={[styles.emptyHero, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="book-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyHeroTitle, { color: colors.text }]}>
              No Books In Progress
            </Text>
            <Text style={[styles.emptyHeroSub, { color: colors.textSecondary }]}>
              Pick a textbook from your list below to start reading with page-by-page progress tracking.
            </Text>
          </View>
        ) : (
          currentlyReading.map((book) => {
            const isEditingThisPage = editingPageDocId === book.id;
            const hasPdf = !!book.source.uri || book.source.type === 'file_uri';

            return (
              <View
                key={book.id}
                style={[
                  styles.readingHeroCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                {/* Book Card Top Banner - Tappable to navigate to details */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('DocumentDetail', { documentId: book.id })}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={[styles.bookIconPill, { backgroundColor: colors.primaryLight }]}>
                      <Ionicons name="book" size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={2}>
                        {book.title}
                      </Text>
                      {book.authors && (
                        <Text style={[styles.bookAuthors, { color: colors.textSecondary }]}>
                          by {book.authors}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </View>

                  {/* Project / Tags Row */}
                  <View style={styles.tagRow}>
                    {book.linked_project && (
                      <View style={[styles.projectPill, { backgroundColor: colors.surfaceSecondary }]}>
                        <Text style={[styles.projectPillText, { color: colors.primary }]}>
                          🎯 {book.linked_project}
                        </Text>
                      </View>
                    )}
                    {book.tags.slice(0, 2).map((t) => (
                      <TagBadge key={t} tag={t} />
                    ))}
                  </View>
                </TouchableOpacity>

                {/* Progress Bar & Page Stats */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressLabelRow}>
                    <View style={styles.pageTextRow}>
                      <Text style={[styles.pageIndicator, { color: colors.text }]}>
                        Page {book.current_page || 0}
                      </Text>
                      <Text style={[styles.pageTotal, { color: colors.textSecondary }]}>
                        {' '}
                        of {book.total_pages || '?'} pages
                      </Text>
                    </View>
                    <Text style={[styles.progressPercent, { color: colors.primary }]}>
                      {book.progress}%
                    </Text>
                  </View>

                  <ProgressBar
                    progress={book.progress}
                    height={8}
                    color={book.progress > 80 ? colors.success : colors.primary}
                  />
                </View>

                {/* Inline Page Quick-Adjust Stepper */}
                {isEditingThisPage ? (
                  <View style={styles.pageEditRow}>
                    <TextInput
                      style={[
                        styles.pageInput,
                        {
                          backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9',
                          color: colors.text,
                          borderColor: colors.border,
                        },
                      ]}
                      keyboardType="number-pad"
                      placeholder={`0 - ${book.total_pages || 100}`}
                      placeholderTextColor={colors.textMuted}
                      value={pageInputValue}
                      onChangeText={setPageInputValue}
                      autoFocus
                    />
                    <TouchableOpacity
                      onPress={() => handleSaveCustomPage(book)}
                      style={[styles.pageSaveBtn, { backgroundColor: colors.primary }]}
                    >
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      <Text style={styles.pageSaveBtnText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setEditingPageDocId(null)}
                      style={[styles.pageCancelBtn, { backgroundColor: colors.surfaceSecondary }]}
                    >
                      <Text style={[styles.pageCancelBtnText, { color: colors.textSecondary }]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.stepperControlRow}>
                    <View style={styles.stepButtons}>
                      <TouchableOpacity
                        onPress={() => handleQuickPageStep(book, -5)}
                        style={[styles.stepBtn, { backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9' }]}
                      >
                        <Text style={[styles.stepBtnText, { color: colors.textSecondary }]}>-5</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleQuickPageStep(book, -1)}
                        style={[styles.stepBtn, { backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9' }]}
                      >
                        <Text style={[styles.stepBtnText, { color: colors.textSecondary }]}>-1</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleQuickPageStep(book, 1)}
                        style={[styles.stepBtn, { backgroundColor: colors.primaryLight }]}
                      >
                        <Text style={[styles.stepBtnText, { color: colors.primary }]}>+1</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleQuickPageStep(book, 5)}
                        style={[styles.stepBtn, { backgroundColor: colors.primaryLight }]}
                      >
                        <Text style={[styles.stepBtnText, { color: colors.primary }]}>+5</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        setEditingPageDocId(book.id);
                        setPageInputValue((book.current_page || 0).toString());
                      }}
                      style={[styles.setPageTrigger, { borderColor: colors.border }]}
                    >
                      <Ionicons name="create-outline" size={13} color={colors.textSecondary} />
                      <Text style={[styles.setPageTriggerText, { color: colors.textSecondary }]}>
                        Set Page
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Primary Card Actions: 1-Tap Open PDF Button & Details */}
                <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    onPress={() => handleOpenPdf(book)}
                    activeOpacity={0.8}
                    style={[
                      styles.openPdfBtn,
                      { backgroundColor: hasPdf ? colors.primary : '#0284C7' },
                    ]}
                  >
                    <Ionicons name="document-text" size={16} color="#FFFFFF" />
                    <Text style={styles.openPdfBtnText}>
                      {hasPdf ? 'Open PDF' : 'Link & Open PDF'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('DocumentDetail', { documentId: book.id })}
                    style={[
                      styles.detailsBtn,
                      { backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9' },
                    ]}
                  >
                    <Ionicons name="information-circle-outline" size={16} color={colors.text} />
                    <Text style={[styles.detailsBtnText, { color: colors.text }]}>Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* ======================================================== */}
        {/* AI Summarizer Hook & Insights Preview */}
        {/* ======================================================== */}
        <View
          style={[
            styles.aiCard,
            { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF', borderColor: isDark ? '#3730A3' : '#C7D2FE' },
          ]}
        >
          <View style={styles.aiCardTop}>
            <View style={[styles.aiBadge, { backgroundColor: isDark ? '#312E81' : '#E0E7FF' }]}>
              <Ionicons name="sparkles" size={14} color="#6366F1" />
              <Text style={styles.aiBadgeText}>AI Assistant</Text>
            </View>
            <Text style={[styles.aiNotice, { color: isDark ? '#A5B4FC' : '#4F46E5' }]}>
              LLM Integration Ready
            </Text>
          </View>
          <Text style={[styles.aiTitle, { color: colors.text }]}>
            AI Chapter Summarizer & Concept Explainer
          </Text>
          <Text style={[styles.aiDescription, { color: colors.textSecondary }]}>
            Connect your local or cloud LLM model to auto-generate chapter summaries, extract definitions,
            and create flashcards directly from your linked PDF textbooks.
          </Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                'AI Summarizer',
                'LLM Summarization Engine will be enabled in the upcoming update. You will be able to plug in your API key or local model to summarize any book chapter!'
              )
            }
            style={[styles.aiButton, { backgroundColor: '#6366F1' }]}
          >
            <Ionicons name="sparkles-outline" size={15} color="#FFFFFF" />
            <Text style={styles.aiButtonText}>Generate Summary (Coming Soon)</Text>
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* ALL BOOKS CATALOG SECTION */}
        {/* ======================================================== */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="library" size={19} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>All Books & Textbooks</Text>
          </View>
          <Text style={[styles.badgeCount, { color: colors.textSecondary }]}>
            {filteredBooks.length} items
          </Text>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search book title, author, project..."
        />

        {/* Status Filter Chips */}
        <View style={styles.filterScroll}>
          {(['all', 'in_progress', 'to_read', 'read'] as const).map((st) => {
            const isSelected = statusFilter === st;
            const labels: Record<string, string> = {
              all: 'All Books',
              in_progress: 'Reading',
              to_read: 'To Read',
              read: 'Completed',
            };
            return (
              <TouchableOpacity
                key={st}
                onPress={() => setStatusFilter(st)}
                style={[
                  styles.filterChip,
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
                    styles.filterChipText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {labels[st]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Books List */}
        {filteredBooks.length === 0 ? (
          <EmptyState
            title="No Books Found"
            description={
              searchQuery.trim()
                ? 'No books matched your search terms.'
                : 'No books indexed in this category yet. Tap "+ Add Book" to get started!'
            }
            icon="book-outline"
            actionLabel="+ Add New Book"
            onAction={() => navigation.navigate('AddDocument', { prefillType: 'book' })}
          />
        ) : (
          filteredBooks.map((book) => {
            const hasPdf = !!book.source.uri || book.source.type === 'file_uri';

            return (
              <TouchableOpacity
                key={book.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('DocumentDetail', { documentId: book.id })}
                style={[
                  styles.catalogCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.catalogTop}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.catalogTitle, { color: colors.text }]} numberOfLines={2}>
                      {book.title}
                    </Text>
                    {book.authors && (
                      <Text style={[styles.catalogAuthor, { color: colors.textSecondary }]}>
                        {book.authors} {book.year ? `(${book.year})` : ''}
                      </Text>
                    )}
                  </View>
                  <StatusBadge status={book.status} size="small" />
                </View>

                {/* Progress */}
                <View style={styles.catalogProgress}>
                  <ProgressBar
                    progress={book.progress}
                    height={5}
                    label={`Page ${book.current_page || 0} / ${book.total_pages || '?'}`}
                    showPercentage
                  />
                </View>

                {/* Bottom Row with Actions */}
                <View style={[styles.catalogBottomRow, { borderTopColor: colors.border }]}>
                  {/* PDF Status indicator */}
                  <View style={styles.pdfStatusRow}>
                    <Ionicons
                      name={hasPdf ? 'document-attach' : 'alert-circle-outline'}
                      size={14}
                      color={hasPdf ? colors.success : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.pdfStatusText,
                        { color: hasPdf ? colors.textSecondary : colors.textMuted },
                      ]}
                      numberOfLines={1}
                    >
                      {hasPdf
                        ? book.source.fileName || 'PDF Linked'
                        : 'No PDF linked'}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionBtnGroup}>
                    {hasPdf ? (
                      <TouchableOpacity
                        onPress={() => openDocument(book.source)}
                        style={[styles.catalogOpenBtn, { backgroundColor: colors.primaryLight }]}
                      >
                        <Ionicons name="document-text-outline" size={14} color={colors.primary} />
                        <Text style={[styles.catalogOpenText, { color: colors.primary }]}>
                          Open PDF
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleLinkLocalPdf(book)}
                        style={[styles.catalogOpenBtn, { backgroundColor: colors.surfaceSecondary }]}
                      >
                        <Ionicons name="attach-outline" size={14} color={colors.text} />
                        <Text style={[styles.catalogOpenText, { color: colors.text }]}>
                          Attach PDF
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => navigation.navigate('DocumentDetail', { documentId: book.id })}
                      style={[styles.catalogOpenBtn, { backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9' }]}
                    >
                      <Ionicons name="information-circle-outline" size={14} color={colors.textSecondary} />
                      <Text style={[styles.catalogOpenText, { color: colors.textSecondary }]}>
                        Details
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
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
  badgeCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyHero: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyHeroTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyHeroSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
  readingHeroCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  bookIconPill: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  bookAuthors: {
    fontSize: 12,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  projectPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  projectPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pageTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pageIndicator: {
    fontSize: 13,
    fontWeight: '700',
  },
  pageTotal: {
    fontSize: 12,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepperControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  stepBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 32,
    alignItems: 'center',
  },
  stepBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  setPageTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  setPageTriggerText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pageEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pageInput: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  pageSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
  },
  pageSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  pageCancelBtn: {
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageCancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  openPdfBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  openPdfBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 4,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  aiCard: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  aiCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366F1',
  },
  aiNotice: {
    fontSize: 10,
    fontWeight: '600',
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  aiDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  filterScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  catalogCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  catalogTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  catalogTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  catalogAuthor: {
    fontSize: 11,
    marginTop: 2,
  },
  catalogProgress: {
    marginBottom: 8,
  },
  catalogBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  pdfStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  pdfStatusText: {
    fontSize: 11,
  },
  actionBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catalogOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  catalogOpenText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
