import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface NoteItemProps {
  note: Note;
  onDelete?: () => void;
}

export const NoteItem: React.FC<NoteItemProps> = ({ note, onDelete }) => {
  const { colors, isDark } = useTheme();

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surfaceSecondary : '#F8FAFC',
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.dateRow}>
          <Ionicons name="time-outline" size={13} color={colors.textMuted} />
          <Text style={[styles.dateText, { color: colors.textMuted }]}>
            {formatDate(note.created_at)}
          </Text>
        </View>

        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.content, { color: colors.text }]}>{note.content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 2,
  },
  content: {
    fontSize: 13,
    lineHeight: 19,
  },
});
