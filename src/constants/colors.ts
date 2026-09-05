export const lightColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  border: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  primary: '#4F46E5', // Indigo 600
  primaryLight: '#EEF2FF',
  primaryDark: '#3730A3',
  accent: '#0D9488', // Teal
  success: '#10B981', // Emerald
  successLight: '#ECFDF5',
  warning: '#F59E0B', // Amber
  warningLight: '#FFFBEB',
  danger: '#EF4444', // Red
  dangerLight: '#FEF2F2',
  card: '#FFFFFF',
  tabBar: '#FFFFFF',
};

export const darkColors = {
  background: '#0F172A', // Slate 900
  surface: '#1E293B', // Slate 800
  surfaceSecondary: '#334155', // Slate 700
  border: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  primary: '#6366F1', // Indigo 500
  primaryLight: '#312E81',
  primaryDark: '#4338CA',
  accent: '#14B8A6',
  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#78350F',
  danger: '#F87171',
  dangerLight: '#7F1D1D',
  card: '#1E293B',
  tabBar: '#0F172A',
};

export type ThemeColors = typeof lightColors;

export const priorityColors = {
  high: {
    bg: '#FEE2E2',
    text: '#B91C1C',
    darkBg: '#7F1D1D',
    darkText: '#FCA5A5',
  },
  medium: {
    bg: '#FEF3C7',
    text: '#B45309',
    darkBg: '#78350F',
    darkText: '#FCD34D',
  },
  low: {
    bg: '#E0F2FE',
    text: '#0369A1',
    darkBg: '#0C4A6E',
    darkText: '#7DD3FC',
  },
};

export const statusColors = {
  to_read: {
    label: 'To Read',
    bg: '#F1F5F9',
    text: '#475569',
    darkBg: '#334155',
    darkText: '#CBD5E1',
  },
  in_progress: {
    label: 'In Progress',
    bg: '#EEF2FF',
    text: '#4338CA',
    darkBg: '#312E81',
    darkText: '#A5B4FC',
  },
  read: {
    label: 'Read',
    bg: '#ECFDF5',
    text: '#047857',
    darkBg: '#064E3B',
    darkText: '#6EE7B7',
  },
};

export const typeConfig = {
  research_paper: {
    label: 'Research Paper',
    icon: 'document-text-outline',
    bg: '#EEF2FF',
    text: '#4F46E5',
    darkBg: '#312E81',
    darkText: '#A5B4FC',
  },
  book: {
    label: 'Book',
    icon: 'book-outline',
    bg: '#FDF4FF',
    text: '#A21CAF',
    darkBg: '#581C87',
    darkText: '#F0ABFC',
  },
  course_material: {
    label: 'Course Material',
    icon: 'school-outline',
    bg: '#ECFEFF',
    text: '#0E7490',
    darkBg: '#164E63',
    darkText: '#67E8F9',
  },
  other: {
    label: 'Other',
    icon: 'newspaper-outline',
    bg: '#F3F4F6',
    text: '#374151',
    darkBg: '#374151',
    darkText: '#D1D5DB',
  },
};
