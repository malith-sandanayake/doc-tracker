import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Linking from 'expo-linking';
import { Platform, Alert } from 'react-native';
import { DocumentSource } from '../types';

export interface PickedFileResult {
  uri: string;
  fileName: string;
  mimeType?: string;
  suggestedTitle: string;
  size?: number;
}

/**
 * Derives a clean human-readable title from a filename.
 * E.g., "vaswani2017_attention_is_all_you_need.pdf" -> "Vaswani2017 Attention Is All You Need"
 */
export function cleanFileNameToTitle(fileName: string): string {
  if (!fileName) return '';
  // Remove extension
  const withoutExt = fileName.replace(/\.[^/.]+$/, '');
  // Replace underscores, hyphens, and multiple dots with spaces
  const spaced = withoutExt.replace(/[_\-.]+/g, ' ').trim();
  // Capitalize first letter of words
  return spaced.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Opens document picker to let the user select a file from local storage / downloads.
 */
export async function pickDocument(): Promise<PickedFileResult | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/epub+zip', 'text/*', '*/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    const fileName = asset.name || 'document.pdf';
    const suggestedTitle = cleanFileNameToTitle(fileName);

    return {
      uri: asset.uri,
      fileName,
      mimeType: asset.mimeType || 'application/pdf',
      suggestedTitle,
      size: asset.size,
    };
  } catch (error) {
    console.error('Error picking document:', error);
    Alert.alert('Error', 'Unable to pick document. Please try again.');
    return null;
  }
}

/**
 * Opens a document based on its source (File URI, Drive link, Web URL, or Physical location).
 */
export async function openDocument(source: DocumentSource): Promise<boolean> {
  try {
    if (source.type === 'physical') {
      Alert.alert(
        'Physical Copy',
        source.location ? `Location: ${source.location}` : 'This is recorded as a physical document.'
      );
      return true;
    }

    if (!source.uri) {
      Alert.alert('Missing Location', 'No URL or file link is attached to this document.');
      return false;
    }

    const uri = source.uri.trim();

    // Handling Web URLs & Google Drive links
    if (source.type === 'url' || source.type === 'google_drive' || uri.startsWith('http://') || uri.startsWith('https://')) {
      const canOpen = await Linking.canOpenURL(uri);
      if (canOpen) {
        await Linking.openURL(uri);
        return true;
      } else {
        Alert.alert('Cannot Open Link', `Unable to open link: ${uri}`);
        return false;
      }
    }

    // Handling Local File URIs
    if (source.type === 'file_uri' || uri.startsWith('file://') || uri.startsWith('content://')) {
      if (Platform.OS === 'android') {
        try {
          // Convert file:// URI to content:// URI via FileSystem if possible
          let contentUri = uri;
          if (uri.startsWith('file://')) {
            contentUri = await FileSystem.getContentUriAsync(uri);
          }
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
            type: source.mimeType || 'application/pdf',
          });
          return true;
        } catch (intentErr) {
          console.warn('IntentLauncher failed, falling back to Sharing/Linking:', intentErr);
        }
      }

      // Fallback: Sharing dialog (allows user to open with Acrobat, Drive, etc.)
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: source.mimeType || 'application/pdf',
          dialogTitle: 'Open Document With...',
        });
        return true;
      }

      // Final fallback to Linking
      await Linking.openURL(uri);
      return true;
    }

    Alert.alert('Unsupported Source', 'Unable to recognize document location format.');
    return false;
  } catch (error: any) {
    console.error('Error opening document:', error);
    Alert.alert(
      'Cannot Open Document',
      error?.message || 'Failed to open file or link. The file may have been moved or removed.'
    );
    return false;
  }
}
