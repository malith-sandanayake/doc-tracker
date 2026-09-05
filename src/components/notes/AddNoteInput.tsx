import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface AddNoteInputProps {
  onAddNote: (content: string) => void;
}

export const AddNoteInput: React.FC<AddNoteInputProps> = ({ onAddNote }) => {
  const { colors, isDark } = useTheme();
  const [content, setContent] = useState('');

  const handleSend = () => {
    if (!content.trim()) return;
    onAddNote(content.trim());
    setContent('');
  };

  const isEnabled = content.trim().length > 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9',
          borderColor: colors.border,
        },
      ]}
    >
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder="Add reading takeaway, thought, or session notes..."
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={3}
        value={content}
        onChangeText={setContent}
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={handleSend}
          disabled={!isEnabled}
          style={[
            styles.sendButton,
            {
              backgroundColor: isEnabled ? colors.primary : colors.border,
            },
          ]}
        >
          <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
          <Text style={styles.sendText}>Save Note</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginVertical: 8,
  },
  input: {
    fontSize: 13,
    minHeight: 56,
    textAlignVertical: 'top',
    padding: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  sendText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
