import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useSidebar } from '../../context/SidebarContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showMenuButton?: boolean;
  onMenuPress?: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    label?: string;
  };
  showThemeToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showMenuButton = true,
  onMenuPress,
  showBackButton = false,
  onBackPress,
  rightAction,
  showThemeToggle = true,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { openSidebar } = useSidebar();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleMenu = () => {
    if (onMenuPress) {
      onMenuPress();
    } else {
      openSidebar();
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderBottomColor: colors.border,
        borderBottomWidth: 1,
        paddingHorizontal: 16,
        paddingTop: Math.max(insets.top, 12) + 8,
        paddingBottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12, marginRight: 8 }}>
        {showBackButton ? (
          <TouchableOpacity
            onPress={handleBack}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: colors.surfaceSecondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
        ) : showMenuButton ? (
          <TouchableOpacity
            onPress={handleMenu}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: colors.surfaceSecondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="Open sidebar menu"
          >
            <Ionicons name="menu-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        ) : null}

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 21,
              fontWeight: '700',
              color: colors.text,
              letterSpacing: -0.5,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {showThemeToggle && (
          <TouchableOpacity
            onPress={toggleTheme}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: colors.surfaceSecondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="Toggle Dark Mode"
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={18}
              color={isDark ? '#FBBF24' : colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {rightAction && (
          <TouchableOpacity
            onPress={rightAction.onPress}
            style={{
              height: 38,
              paddingHorizontal: rightAction.label ? 12 : 8,
              borderRadius: 19,
              backgroundColor: colors.primaryLight,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <Ionicons name={rightAction.icon} size={18} color={colors.primary} />
            {rightAction.label && (
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
                {rightAction.label}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
