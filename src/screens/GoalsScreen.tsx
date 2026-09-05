import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDocuments } from '../context/DocumentContext';
import { Header } from '../components/common/Header';
import { GoalCard } from '../components/goals/GoalCard';
import { AddGoalModal } from '../components/goals/AddGoalModal';
import { EmptyState } from '../components/common/EmptyState';

export const GoalsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { goals, documents, addGoal, deleteGoal } = useDocuments();

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [modalVisible, setModalVisible] = useState(false);

  // Derive unique projects and tags from documents
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

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter(
    (g) => g.status === 'completed' || g.current_count >= g.target_count
  );

  const displayedGoals = activeTab === 'active' ? activeGoals : completedGoals;

  const handleDeleteGoal = (goalId: string, title: string) => {
    Alert.alert('Delete Goal', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteGoal(goalId) },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Header
        title="Reading Goals"
        subtitle="Track target papers & course milestones"
        rightAction={{
          icon: 'add',
          label: 'New Goal',
          onPress: () => setModalVisible(true),
        }}
      />

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('active')}
          style={[
            styles.tabBtn,
            {
              borderBottomColor: activeTab === 'active' ? colors.primary : 'transparent',
              borderBottomWidth: 2,
            },
          ]}
        >
          <Ionicons
            name="flame-outline"
            size={16}
            color={activeTab === 'active' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'active' ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === 'active' ? '700' : '500',
              },
            ]}
          >
            Active ({activeGoals.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('completed')}
          style={[
            styles.tabBtn,
            {
              borderBottomColor: activeTab === 'completed' ? colors.success : 'transparent',
              borderBottomWidth: 2,
            },
          ]}
        >
          <Ionicons
            name="checkmark-done-circle-outline"
            size={16}
            color={activeTab === 'completed' ? colors.success : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'completed' ? colors.success : colors.textSecondary,
                fontWeight: activeTab === 'completed' ? '700' : '500',
              },
            ]}
          >
            Completed ({completedGoals.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Goals List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {displayedGoals.length === 0 ? (
          <EmptyState
            icon={activeTab === 'active' ? 'flag-outline' : 'trophy-outline'}
            title={activeTab === 'active' ? 'No Active Goals' : 'No Completed Goals Yet'}
            description={
              activeTab === 'active'
                ? 'Create a reading goal to track papers for your 3YP or course readings.'
                : 'Keep reading! Goals automatically complete as you mark matching documents read.'
            }
            actionLabel={activeTab === 'active' ? 'Create First Goal' : undefined}
            onAction={activeTab === 'active' ? () => setModalVisible(true) : undefined}
          />
        ) : (
          displayedGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={() => handleDeleteGoal(goal.id, goal.title)}
            />
          ))
        )}
      </ScrollView>

      {/* Add Goal Modal */}
      <AddGoalModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={(goalData) => addGoal(goalData)}
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
  },
  scrollContent: {
    paddingVertical: 10,
    paddingBottom: 32,
  },
});
