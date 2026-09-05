import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Document, Note, Goal, GoalStatus, DocumentStatus, Priority, DocumentType } from '../types';
import { storageService } from '../services/storageService';

export interface DashboardStats {
  toReadCount: number;
  inProgressCount: number;
  readCount: number;
  readThisMonthCount: number;
  totalCount: number;
  researchPapersCount: number;
  booksCount: number;
  coursesCount: number;
}

interface DocumentContextType {
  documents: Document[];
  notes: Note[];
  goals: Goal[];
  isLoading: boolean;
  stats: DashboardStats;
  addDocument: (docData: Partial<Document> & { title: string; type: DocumentType }) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  updateDocumentStatus: (id: string, status: DocumentStatus) => Promise<void>;
  updateDocumentProgress: (
    id: string,
    progress: number,
    currentPage?: number,
    totalPages?: number
  ) => Promise<void>;
  addNote: (documentId: string, content: string) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  getNotesForDocument: (documentId: string) => Note[];
  addGoal: (goalData: Omit<Goal, 'id' | 'current_count' | 'status'> & { status?: GoalStatus }) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  resetToSeedData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await storageService.initialize();
      setDocuments(data.documents);
      setNotes(data.notes);
      setGoals(data.goals);
    } catch (error) {
      console.error('Error loading DocTrack data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived Dashboard Stats
  const stats: DashboardStats = useMemo(() => {
    const toRead = documents.filter((d) => d.status === 'to_read').length;
    const inProgress = documents.filter((d) => d.status === 'in_progress').length;
    const read = documents.filter((d) => d.status === 'read').length;

    // Read this month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const readThisMonth = documents.filter((d) => {
      if (d.status !== 'read' || !d.completed_date) return false;
      const date = new Date(d.completed_date);
      return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
    }).length;

    return {
      toReadCount: toRead,
      inProgressCount: inProgress,
      readCount: read,
      readThisMonthCount: readThisMonth,
      totalCount: documents.length,
      researchPapersCount: documents.filter((d) => d.type === 'research_paper').length,
      booksCount: documents.filter((d) => d.type === 'book').length,
      coursesCount: documents.filter((d) => d.type === 'course_material').length,
    };
  }, [documents]);

  const addDocument = async (
    docData: Partial<Document> & { title: string; type: DocumentType }
  ): Promise<Document> => {
    const newDoc: Document = {
      id: 'doc-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      title: docData.title,
      type: docData.type,
      status: docData.status || 'to_read',
      source: docData.source || { type: 'url' },
      tags: docData.tags || [],
      linked_project: docData.linked_project || undefined,
      priority: (docData.priority as Priority) || 'medium',
      added_date: new Date().toISOString(),
      progress: docData.progress || 0,
      current_page: docData.current_page,
      total_pages: docData.total_pages,
      authors: docData.authors,
      year: docData.year,
      venue: docData.venue,
      doi: docData.doi,
      started_date: docData.status === 'in_progress' ? new Date().toISOString() : undefined,
      completed_date: docData.status === 'read' ? new Date().toISOString() : undefined,
    };

    const res = await storageService.addDocument(newDoc);
    setDocuments(res.documents);
    setGoals(res.goals);
    return newDoc;
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    // If status updated to read, auto-set completed_date
    let finalUpdates = { ...updates };
    if (updates.status === 'read' && !updates.completed_date) {
      finalUpdates.completed_date = new Date().toISOString();
      finalUpdates.progress = 100;
    } else if (updates.status === 'in_progress' && !updates.started_date) {
      finalUpdates.started_date = new Date().toISOString();
    }

    const res = await storageService.updateDocument(id, finalUpdates);
    setDocuments(res.documents);
    setGoals(res.goals);
  };

  const deleteDocument = async (id: string) => {
    const res = await storageService.deleteDocument(id);
    setDocuments(res.documents);
    setGoals(res.goals);
    setNotes((prev) => prev.filter((n) => n.document_id !== id));
  };

  const updateDocumentStatus = async (id: string, status: DocumentStatus) => {
    const updates: Partial<Document> = { status };
    if (status === 'read') {
      updates.progress = 100;
      updates.completed_date = new Date().toISOString();
    } else if (status === 'in_progress') {
      updates.started_date = new Date().toISOString();
      // If was 0% progress, bump to 5% or 10%
      const doc = documents.find((d) => d.id === id);
      if (doc && doc.progress === 0) {
        updates.progress = 10;
      }
    }
    await updateDocument(id, updates);
  };

  const updateDocumentProgress = async (
    id: string,
    progress: number,
    currentPage?: number,
    totalPages?: number
  ) => {
    const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));
    const updates: Partial<Document> = {
      progress: clampedProgress,
      current_page: currentPage,
      total_pages: totalPages,
    };

    if (clampedProgress >= 100) {
      updates.status = 'read';
      updates.completed_date = new Date().toISOString();
    } else if (clampedProgress > 0) {
      const doc = documents.find((d) => d.id === id);
      if (doc?.status === 'to_read') {
        updates.status = 'in_progress';
        updates.started_date = new Date().toISOString();
      }
    }

    await updateDocument(id, updates);
  };

  // Notes
  const addNote = async (documentId: string, content: string): Promise<Note> => {
    const newNote: Note = {
      id: 'note-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      document_id: documentId,
      content: content.trim(),
      created_at: new Date().toISOString(),
    };
    const updatedNotes = await storageService.addNote(newNote);
    setNotes(updatedNotes);
    return newNote;
  };

  const deleteNote = async (id: string) => {
    const updatedNotes = await storageService.deleteNote(id);
    setNotes(updatedNotes);
  };

  const getNotesForDocument = useCallback(
    (documentId: string): Note[] => {
      return notes
        .filter((n) => n.document_id === documentId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    [notes]
  );

  const addGoal = async (
    goalData: Omit<Goal, 'id' | 'current_count' | 'status'> & { status?: GoalStatus }
  ): Promise<Goal> => {
    const newGoal: Goal = {
      ...goalData,
      id: 'goal-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      current_count: 0,
      status: goalData.status || 'active',
    };
    const updatedGoals = await storageService.addGoal(newGoal);
    setGoals(updatedGoals);
    return newGoal;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const updatedGoals = await storageService.updateGoal(id, updates);
    setGoals(updatedGoals);
  };

  const deleteGoal = async (id: string) => {
    const updatedGoals = await storageService.deleteGoal(id);
    setGoals(updatedGoals);
  };

  const resetToSeedData = async () => {
    setIsLoading(true);
    const data = await storageService.resetToSeed();
    setDocuments(data.documents);
    setNotes(data.notes);
    setGoals(data.goals);
    setIsLoading(false);
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        notes,
        goals,
        isLoading,
        stats,
        addDocument,
        updateDocument,
        deleteDocument,
        updateDocumentStatus,
        updateDocumentProgress,
        addNote,
        deleteNote,
        getNotesForDocument,
        addGoal,
        updateGoal,
        deleteGoal,
        resetToSeedData,
        refreshData,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = (): DocumentContextType => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
