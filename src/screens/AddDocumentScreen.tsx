import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDocuments } from '../context/DocumentContext';
import { Header } from '../components/common/Header';
import { pickDocument } from '../services/fileService';
import {
  DocumentType,
  Priority,
  DocumentStatus,
  SourceType,
  DocumentSource,
  RootStackParamList,
} from '../types';

export const AddDocumentScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { addDocument, documents } = useDocuments();

  // Source selection
  const [sourceType, setSourceType] = useState<SourceType>('file_uri');
  const [pickedFile, setPickedFile] = useState<{
    uri: string;
    fileName: string;
    mimeType?: string;
  } | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [physicalLocation, setPhysicalLocation] = useState('');

  // Core Metadata
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DocumentType>('research_paper');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<DocumentStatus>('to_read');
  const [linkedProject, setLinkedProject] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Research Paper Metadata
  const [authors, setAuthors] = useState('');
  const [year, setYear] = useState('');
  const [venue, setVenue] = useState('');
  const [doi, setDoi] = useState('');

  // Book Metadata
  const [totalPages, setTotalPages] = useState('');

  // Suggestions from existing documents
  const existingProjects = Array.from(
    new Set(documents.map((d) => d.linked_project).filter(Boolean))
  ) as string[];

  const handlePickFile = async () => {
    const res = await pickDocument();
    if (res) {
      setPickedFile({
        uri: res.uri,
        fileName: res.fileName,
        mimeType: res.mimeType,
      });
      // Auto-populate title if empty or current title was auto-filled
      if (!title.trim() || title === res.suggestedTitle) {
        setTitle(res.suggestedTitle);
      }
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a document title.');
      return;
    }

    let source: DocumentSource;
    if (sourceType === 'file_uri') {
      if (!pickedFile) {
        Alert.alert('Missing File', 'Please pick a file from your device, or switch source mode.');
        return;
      }
      source = {
        type: 'file_uri',
        uri: pickedFile.uri,
        fileName: pickedFile.fileName,
        mimeType: pickedFile.mimeType,
      };
    } else if (sourceType === 'google_drive' || sourceType === 'url') {
      if (!urlInput.trim()) {
        Alert.alert('Missing Link', 'Please enter the URL or Drive link.');
        return;
      }
      source = {
        type: sourceType,
        uri: urlInput.trim(),
      };
    } else {
      source = {
        type: 'physical',
        location: physicalLocation.trim() || 'Physical Copy',
      };
    }

    // Process tags
    const parsedTags = tagsInput
      .split(/[,#\s]+/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const parsedYear = year ? parseInt(year, 10) : undefined;
    const parsedPages = totalPages ? parseInt(totalPages, 10) : undefined;

    try {
      const created = await addDocument({
        title: title.trim(),
        type,
        priority,
        status,
        source,
        linked_project: linkedProject.trim() || undefined,
        tags: parsedTags,
        authors: authors.trim() || undefined,
        year: !isNaN(parsedYear as number) ? parsedYear : undefined,
        venue: venue.trim() || undefined,
        doi: doi.trim() || undefined,
        total_pages: !isNaN(parsedPages as number) ? parsedPages : undefined,
        current_page: status === 'read' ? parsedPages : 0,
        progress: status === 'read' ? 100 : 0,
      });

      Alert.alert('Document Added', `"${created.title}" was saved to your library.`);
      navigation.navigate('DocumentDetail', { documentId: created.id });
    } catch (error) {
      console.error('Error adding document:', error);
      Alert.alert('Error', 'Failed to save document. Please check your inputs.');
    }
  };

  const typeChoices: { label: string; value: DocumentType; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'Paper', value: 'research_paper', icon: 'document-text-outline' },
    { label: 'Book', value: 'book', icon: 'book-outline' },
    { label: 'Course', value: 'course_material', icon: 'school-outline' },
    { label: 'Other', value: 'other', icon: 'newspaper-outline' },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Header title="Add Document" subtitle="Index paper, book, or learning notes" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Source Mode Tabs */}
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Document Source</Text>
        <View style={styles.sourceTabs}>
          <TouchableOpacity
            onPress={() => setSourceType('file_uri')}
            style={[
              styles.sourceTab,
              {
                backgroundColor:
                  sourceType === 'file_uri'
                    ? colors.primary
                    : isDark
                    ? colors.surfaceSecondary
                    : '#F1F5F9',
              },
            ]}
          >
            <Ionicons
              name="document-attach-outline"
              size={16}
              color={sourceType === 'file_uri' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.sourceTabText,
                { color: sourceType === 'file_uri' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Local File
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSourceType('url')}
            style={[
              styles.sourceTab,
              {
                backgroundColor:
                  sourceType === 'url'
                    ? colors.primary
                    : isDark
                    ? colors.surfaceSecondary
                    : '#F1F5F9',
              },
            ]}
          >
            <Ionicons
              name="link-outline"
              size={16}
              color={sourceType === 'url' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.sourceTabText,
                { color: sourceType === 'url' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              URL / Drive
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSourceType('physical')}
            style={[
              styles.sourceTab,
              {
                backgroundColor:
                  sourceType === 'physical'
                    ? colors.primary
                    : isDark
                    ? colors.surfaceSecondary
                    : '#F1F5F9',
              },
            ]}
          >
            <Ionicons
              name="location-outline"
              size={16}
              color={sourceType === 'physical' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.sourceTabText,
                { color: sourceType === 'physical' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Physical
            </Text>
          </TouchableOpacity>
        </View>

        {/* Source Inputs */}
        {sourceType === 'file_uri' && (
          <View
            style={[
              styles.pickerContainer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {pickedFile ? (
              <View style={styles.pickedFileBox}>
                <Ionicons name="document-text" size={28} color={colors.primary} />
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <Text style={[styles.pickedFileName, { color: colors.text }]} numberOfLines={1}>
                    {pickedFile.fileName}
                  </Text>
                  <Text style={[styles.pickedFileDetail, { color: colors.textSecondary }]}>
                    Ready to attach • Auto-populated title
                  </Text>
                </View>
                <TouchableOpacity onPress={handlePickFile} style={styles.repickBtn}>
                  <Text style={[styles.repickText, { color: colors.primary }]}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={handlePickFile} style={styles.pickFileBtn}>
                <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
                <Text style={[styles.pickFilePrompt, { color: colors.text }]}>
                  Select PDF or Document from Phone
                </Text>
                <Text style={[styles.pickFileHint, { color: colors.textSecondary }]}>
                  Title will be automatically extracted from filename
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {sourceType === 'url' && (
          <View style={styles.inputGroup}>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9',
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Paste Google Drive link, arXiv URL, or DOI..."
              placeholderTextColor={colors.textMuted}
              value={urlInput}
              onChangeText={setUrlInput}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        )}

        {sourceType === 'physical' && (
          <View style={styles.inputGroup}>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9',
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Location reminder: e.g. 'Desk Shelf 2', 'Library Binder'..."
              placeholderTextColor={colors.textMuted}
              value={physicalLocation}
              onChangeText={setPhysicalLocation}
            />
          </View>
        )}

        {/* Title */}
        <Text style={[styles.sectionLabel, { color: colors.text, marginTop: 14 }]}>
          Document Title *
        </Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9',
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="e.g. Attention Is All You Need"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        {/* Document Type */}
        <Text style={[styles.sectionLabel, { color: colors.text, marginTop: 14 }]}>
          Category / Type
        </Text>
        <View style={styles.typeRow}>
          {typeChoices.map((item) => {
            const isSelected = type === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                onPress={() => setType(item.value)}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : isDark
                      ? colors.surfaceSecondary
                      : '#F1F5F9',
                  },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Priority & Initial Status */}
        <View style={styles.twoColumnRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionLabel, { color: colors.text, marginTop: 14 }]}>
              Priority
            </Text>
            <View style={styles.priorityRow}>
              {(['high', 'medium', 'low'] as Priority[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPriority(p)}
                    style={[
                      styles.smallChoiceBtn,
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
                        styles.smallChoiceText,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {p.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionLabel, { color: colors.text, marginTop: 14 }]}>
              Status
            </Text>
            <View style={styles.priorityRow}>
              {(['to_read', 'in_progress', 'read'] as DocumentStatus[]).map((s) => {
                const isSelected = status === s;
                const label = s === 'to_read' ? 'To Read' : s === 'in_progress' ? 'Reading' : 'Read';
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStatus(s)}
                    style={[
                      styles.smallChoiceBtn,
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
                        styles.smallChoiceText,
                        { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Linked Project */}
        <Text style={[styles.sectionLabel, { color: colors.text, marginTop: 14 }]}>
          Linked Project (Optional)
        </Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9',
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="e.g. 3YP Swarm Robotics, CV Stereo Disparity Project"
          placeholderTextColor={colors.textMuted}
          value={linkedProject}
          onChangeText={setLinkedProject}
        />

        {existingProjects.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionScroll}>
            {existingProjects.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setLinkedProject(p)}
                style={[
                  styles.suggestionChip,
                  {
                    backgroundColor:
                      linkedProject === p
                        ? colors.primaryLight
                        : isDark
                        ? colors.surfaceSecondary
                        : '#F1F5F9',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.suggestionText,
                    { color: linkedProject === p ? colors.primary : colors.textSecondary },
                  ]}
                >
                  🎯 {p}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Tags */}
        <Text style={[styles.sectionLabel, { color: colors.text, marginTop: 14 }]}>
          Tags (Comma-separated)
        </Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9',
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="e.g. CO5430, stereo-vision, embedded-systems"
          placeholderTextColor={colors.textMuted}
          value={tagsInput}
          onChangeText={setTagsInput}
        />

        {/* Research Paper Specific Fields */}
        {type === 'research_paper' && (
          <View
            style={[
              styles.extraFieldsBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.boxTitle, { color: colors.primary }]}>
              Research Paper Details
            </Text>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Authors</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9',
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. Vaswani et al. / Mayer, Ilg..."
              placeholderTextColor={colors.textMuted}
              value={authors}
              onChangeText={setAuthors}
            />

            <View style={styles.twoColumnRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Year</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9',
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="2024"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  value={year}
                  onChangeText={setYear}
                />
              </View>

              <View style={{ flex: 1.5 }}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Venue / Conference</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9',
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="e.g. CVPR, NeurIPS"
                  placeholderTextColor={colors.textMuted}
                  value={venue}
                  onChangeText={setVenue}
                />
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>DOI / arXiv ID</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9',
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. 10.1109/CVPR.2016.438"
              placeholderTextColor={colors.textMuted}
              value={doi}
              onChangeText={setDoi}
            />
          </View>
        )}

        {/* Book / Course Material Pages */}
        {(type === 'book' || type === 'course_material') && (
          <View style={styles.inputGroup}>
            <Text style={[styles.sectionLabel, { color: colors.text, marginTop: 14 }]}>
              Total Pages (For progress calculation)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9',
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. 560"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={totalPages}
              onChangeText={setTotalPages}
            />
          </View>
        )}

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.8}
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Add to Library</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  sourceTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sourceTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  sourceTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pickerContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickFileBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  pickFilePrompt: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  pickFileHint: {
    fontSize: 12,
    marginTop: 4,
  },
  pickedFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  pickedFileName: {
    fontSize: 14,
    fontWeight: '700',
  },
  pickedFileDetail: {
    fontSize: 11,
    marginTop: 2,
  },
  repickBtn: {
    padding: 6,
  },
  repickText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputGroup: {
    marginVertical: 4,
  },
  textInput: {
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 4,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 6,
  },
  smallChoiceBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  smallChoiceText: {
    fontSize: 11,
    fontWeight: '700',
  },
  suggestionScroll: {
    marginTop: 6,
    flexDirection: 'row',
  },
  suggestionChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginRight: 6,
  },
  suggestionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  extraFieldsBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  boxTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 10,
    marginTop: 24,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
