export type DocumentType = 'research_paper' | 'book' | 'course_material' | 'other';

export type DocumentStatus = 'to_read' | 'in_progress' | 'read';

export type Priority = 'high' | 'medium' | 'low';

export type SourceType = 'file_uri' | 'google_drive' | 'url' | 'physical';

export interface DocumentSource {
  type: SourceType;
  uri?: string;
  fileName?: string;
  mimeType?: string;
  location?: string; // For physical copy, e.g., "Library Desk / Shelf B3"
}

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  source: DocumentSource;
  tags: string[];
  linked_project?: string;
  priority: Priority;
  added_date: string; // ISO string
  started_date?: string; // ISO string
  completed_date?: string; // ISO string
  progress: number; // 0-100
  current_page?: number;
  total_pages?: number;
  rating?: number; // 1-5
  // Research paper specific metadata
  authors?: string;
  year?: number;
  venue?: string;
  doi?: string;
}

export interface Note {
  id: string;
  document_id: string;
  content: string;
  created_at: string; // ISO string
}

export type GoalStatus = 'active' | 'completed' | 'missed';

export interface Goal {
  id: string;
  title: string;
  target_count: number;
  current_count: number; // auto-derived from linked documents marked "read"
  deadline?: string; // ISO string or YYYY-MM-DD
  linked_tag?: string;
  linked_project?: string;
  status: GoalStatus;
}

export type SortOption = 'recently_added' | 'priority' | 'title' | 'progress';

export interface DocumentFilter {
  type?: DocumentType | 'all';
  status?: DocumentStatus | 'all';
  priority?: Priority | 'all';
  project?: string;
  tag?: string;
  searchQuery?: string;
  sortBy?: SortOption;
}

export type RootStackParamList = {
  MainTabs: undefined;
  DocumentDetail: { documentId: string };
  AddDocument: { prefillType?: DocumentType } | undefined;
  EditDocument: { documentId: string };
  ResearchPapers: undefined;
  Books: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Library:
    | {
        initialTypeFilter?: DocumentType | 'all';
        initialStatusFilter?: DocumentStatus | 'all';
        initialTag?: string;
        initialProject?: string;
      }
    | undefined;
  Add: undefined;
  Goals: undefined;
};
