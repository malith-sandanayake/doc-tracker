import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList, DocumentType, DocumentStatus } from '../types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const navigateToDashboard = () => {
  if (navigationRef.isReady()) {
    navigationRef.navigate('MainTabs');
  }
};

export const navigateToLibrary = (filters?: {
  initialTypeFilter?: DocumentType | 'all';
  initialStatusFilter?: DocumentStatus | 'all';
  initialProject?: string;
  initialTag?: string;
}) => {
  if (navigationRef.isReady()) {
    // Navigate to MainTabs, selecting the Library screen with optional params
    navigationRef.navigate('MainTabs', {
      screen: 'Library',
      params: filters,
    } as any);
  }
};

export const navigateToGoals = () => {
  if (navigationRef.isReady()) {
    navigationRef.navigate('MainTabs', {
      screen: 'Goals',
    } as any);
  }
};

export const navigateToAddDocument = (prefillType?: DocumentType) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate('AddDocument', prefillType ? { prefillType } : undefined);
  }
};

export const navigateToResearchPapers = () => {
  if (navigationRef.isReady()) {
    navigationRef.navigate('ResearchPapers');
  }
};

export const navigateToBooks = () => {
  if (navigationRef.isReady()) {
    navigationRef.navigate('Books');
  }
};

export const navigateToDocumentDetail = (documentId: string) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate('DocumentDetail', { documentId });
  }
};

