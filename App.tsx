import 'react-native-get-random-values';
import './global.css';
import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { DocumentProvider } from './src/context/DocumentContext';
import { SidebarProvider } from './src/context/SidebarContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Sidebar } from './src/components/navigation/Sidebar';
import { navigationRef } from './src/navigation/navigationRef';

function MainApp() {
  const { isDark, colors } = useTheme();

  const navigationTheme = {
    dark: isDark,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
    fonts: DefaultTheme.fonts,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NavigationContainer ref={navigationRef} theme={navigationTheme}>
        <RootNavigator />
        <Sidebar />
      </NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DocumentProvider>
          <SidebarProvider>
            <MainApp />
          </SidebarProvider>
        </DocumentProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
