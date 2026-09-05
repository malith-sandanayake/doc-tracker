import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import {
  DocumentType,
  DocumentStatus,
  Priority,
} from '../../types';
import {
  typeConfig,
  statusColors,
  priorityColors,
} from '../../constants/colors';

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'small' | 'medium';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color,
  bgColor,
  icon,
  size = 'small',
}) => {
  const { colors, isDark } = useTheme();

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor || (isDark ? colors.surfaceSecondary : '#F1F5F9'),
          paddingHorizontal: isSmall ? 8 : 10,
          paddingVertical: isSmall ? 3 : 5,
        },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={isSmall ? 11 : 13}
          color={color || colors.textSecondary}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: color || colors.textSecondary,
            fontSize: isSmall ? 11 : 12,
            fontWeight: '600',
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

export const TypeBadge: React.FC<{ type: DocumentType; size?: 'small' | 'medium' }> = ({
  type,
  size = 'small',
}) => {
  const { isDark } = useTheme();
  const config = typeConfig[type] || typeConfig.other;

  return (
    <Badge
      label={config.label}
      icon={config.icon as keyof typeof Ionicons.glyphMap}
      bgColor={isDark ? config.darkBg : config.bg}
      color={isDark ? config.darkText : config.text}
      size={size}
    />
  );
};

export const StatusBadge: React.FC<{ status: DocumentStatus; size?: 'small' | 'medium' }> = ({
  status,
  size = 'small',
}) => {
  const { isDark } = useTheme();
  const config = statusColors[status] || statusColors.to_read;

  return (
    <Badge
      label={config.label}
      bgColor={isDark ? config.darkBg : config.bg}
      color={isDark ? config.darkText : config.text}
      size={size}
    />
  );
};

export const PriorityBadge: React.FC<{ priority: Priority; size?: 'small' | 'medium' }> = ({
  priority,
  size = 'small',
}) => {
  const { isDark } = useTheme();
  const config = priorityColors[priority] || priorityColors.medium;
  const label = priority.charAt(0).toUpperCase() + priority.slice(1);

  return (
    <Badge
      label={label}
      icon={priority === 'high' ? 'flame-outline' : undefined}
      bgColor={isDark ? config.darkBg : config.bg}
      color={isDark ? config.darkText : config.text}
      size={size}
    />
  );
};

export const TagBadge: React.FC<{
  tag: string;
  onPress?: () => void;
  size?: 'small' | 'medium';
}> = ({ tag, size = 'small' }) => {
  const { colors, isDark } = useTheme();

  return (
    <Badge
      label={`#${tag}`}
      bgColor={isDark ? '#1E293B' : '#F1F5F9'}
      color={isDark ? '#94A3B8' : '#64748B'}
      size={size}
    />
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    letterSpacing: 0.2,
  },
});
