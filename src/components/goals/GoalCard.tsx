import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Goal } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { ProgressBar } from '../common/ProgressBar';

interface GoalCardProps {
  goal: Goal;
  onDelete?: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onDelete }) => {
  const { colors, isDark } = useTheme();

  const progressPercent = Math.min(
    100,
    Math.round((goal.current_count / Math.max(1, goal.target_count)) * 100)
  );

  const isCompleted = goal.status === 'completed' || goal.current_count >= goal.target_count;

  // Format deadline if present
  const getDeadlineText = () => {
    if (!goal.deadline) return null;
    try {
      const d = new Date(goal.deadline);
      const today = new Date();
      const diffTime = d.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'Deadline passed';
      if (diffDays === 0) return 'Due today';
      if (diffDays === 1) return 'Due tomorrow';
      return `${diffDays} days left`;
    } catch {
      return goal.deadline;
    }
  };

  const deadlineText = getDeadlineText();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isCompleted ? colors.success : colors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{goal.title}</Text>
        </View>

        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Scope info (Project or Tag) */}
      <View style={styles.scopeRow}>
        {goal.linked_project && (
          <View style={[styles.scopeBadge, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="folder-outline" size={12} color={colors.primary} />
            <Text style={[styles.scopeText, { color: colors.primary }]}>
              {goal.linked_project}
            </Text>
          </View>
        )}

        {goal.linked_tag && (
          <View style={[styles.scopeBadge, { backgroundColor: isDark ? colors.surfaceSecondary : '#F1F5F9' }]}>
            <Ionicons name="pricetag-outline" size={12} color={colors.textSecondary} />
            <Text style={[styles.scopeText, { color: colors.textSecondary }]}>
              #{goal.linked_tag}
            </Text>
          </View>
        )}

        {deadlineText && (
          <View style={[styles.scopeBadge, { backgroundColor: isDark ? '#78350F' : '#FEF3C7' }]}>
            <Ionicons name="calendar-outline" size={12} color={isDark ? '#FCD34D' : '#B45309'} />
            <Text style={[styles.scopeText, { color: isDark ? '#FCD34D' : '#B45309' }]}>
              {deadlineText}
            </Text>
          </View>
        )}
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.counterRow}>
          <Text style={[styles.counterText, { color: colors.textSecondary }]}>
            {goal.current_count} of {goal.target_count} read
          </Text>
          <Text
            style={[
              styles.percentText,
              { color: isCompleted ? colors.success : colors.primary },
            ]}
          >
            {progressPercent}%
          </Text>
        </View>

        <ProgressBar
          progress={progressPercent}
          height={7}
          color={isCompleted ? colors.success : colors.primary}
        />
      </View>

      {isCompleted && (
        <View style={[styles.completedBanner, { backgroundColor: colors.successLight }]}>
          <Ionicons name="checkmark-circle" size={14} color={colors.success} />
          <Text style={[styles.completedText, { color: colors.success }]}>
            Goal Completed!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  deleteBtn: {
    padding: 4,
  },
  scopeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  scopeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  scopeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 2,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    gap: 6,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
