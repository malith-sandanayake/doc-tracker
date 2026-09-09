import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert utility that safely alerts messages across Web, iOS, and Android.
 */
export function showAlert(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert([title, message].filter(Boolean).join('\n'));
    }
  } else {
    Alert.alert(title, message);
  }
}
