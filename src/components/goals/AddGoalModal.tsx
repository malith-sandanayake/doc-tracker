import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Goal } from '../../types';

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (goal: Omit<Goal, 'id' | 'current_count' | 'status'>) => void;
  availableProjects: string[];
  availableTags: string[];
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  visible,
  onClose,
  onAdd,
  availableProjects,
  availableTags,
}) => {
  const { colors, isDark } = useTheme();

  const [title, setTitle] = useState('');
  const [targetCount, setTargetCount] = useState('3');
  const [deadline, setDeadline] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a goal title.');
      return;
    }

    const count = parseInt(targetCount, 10);
    if (isNaN(count) || count <= 0) {
      Alert.alert('Invalid Target', 'Please enter a valid target number (at least 1).');
      return;
    }

    onAdd({
      title: title.trim(),
      target_count: count,
      deadline: deadline.trim() || undefined,
      linked_project: selectedProject ? selectedProject : undefined,
      linked_tag: selectedTag ? selectedTag : undefined,
    });

    // Reset fields
    setTitle('');
    setTargetCount('3');
    setDeadline('');
    setSelectedProject('');
    setSelectedTag('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Create Reading Goal
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
            {/* Title */}
            <Text style={[styles.label, { color: colors.text }]}>Goal Title *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9',
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. Read 5 papers before 3YP proposal"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Target Count */}
            <Text style={[styles.label, { color: colors.text }]}>
              Target Document Count *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9',
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Number of documents to read"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={targetCount}
              onChangeText={setTargetCount}
            />

            {/* Deadline */}
            <Text style={[styles.label, { color: colors.text }]}>
              Deadline (Optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9',
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="YYYY-MM-DD (e.g. 2026-10-15)"
              placeholderTextColor={colors.textMuted}
              value={deadline}
              onChangeText={setDeadline}
            />

            {/* Scope to Project */}
            <Text style={[styles.label, { color: colors.text }]}>
              Scope to Project (Optional)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              <TouchableOpacity
                onPress={() => setSelectedProject('')}
                style={[
                  styles.chip,
                  {
                    backgroundColor: !selectedProject
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
                    { color: !selectedProject ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  Any Project
                </Text>
              </TouchableOpacity>
              {availableProjects.map((proj) => (
                <TouchableOpacity
                  key={proj}
                  onPress={() => setSelectedProject(selectedProject === proj ? '' : proj)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        selectedProject === proj
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
                      {
                        color: selectedProject === proj ? '#FFFFFF' : colors.textSecondary,
                      },
                    ]}
                  >
                    {proj}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Scope to Tag */}
            <Text style={[styles.label, { color: colors.text }]}>
              Scope to Tag / Course (Optional)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              <TouchableOpacity
                onPress={() => setSelectedTag('')}
                style={[
                  styles.chip,
                  {
                    backgroundColor: !selectedTag
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
                    { color: !selectedTag ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  Any Tag
                </Text>
              </TouchableOpacity>
              {availableTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        selectedTag === tag
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
                      {
                        color: selectedTag === tag ? '#FFFFFF' : colors.textSecondary,
                      },
                    ]}
                  >
                    #{tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="flag-outline" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Set Goal</Text>
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
  modalContent: {
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  chipScroll: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 10,
    marginTop: 24,
    gap: 6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
