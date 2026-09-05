import AsyncStorage from '@react-native-async-storage/async-storage';
import { Document, Note, Goal } from '../types';
import { SEED_DOCUMENTS, SEED_NOTES, SEED_GOALS } from '../constants/seedData';
import { firestoreService } from './firestoreService';
import { isFirebaseConfigured } from '../config/firebase';

const STORAGE_KEYS = {
  DOCUMENTS: '@doctrack_documents_v1',
  NOTES: '@doctrack_notes_v1',
  GOALS: '@doctrack_goals_v1',
  INITIALIZED: '@doctrack_initialized_v1',
  USER_ID: '@doctrack_local_user_id_v1',
};

// Generate or fetch a consistent local device/user ID
export async function getLocalUserId(): Promise<string> {
  let userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!userId) {
    userId = 'local-user-' + Math.random().toString(36).substring(2, 10);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }
  return userId;
}

/**
 * Calculates derived goal progress based on read documents matching linked_tag or linked_project.
 */
export function recalculateGoals(goals: Goal[], documents: Document[]): Goal[] {
  const readDocs = documents.filter((d) => d.status === 'read');

  return goals.map((goal) => {
    let matchingReadCount = 0;

    if (goal.linked_project && goal.linked_tag) {
      // Must match both or either? Usually if both are specified, docs that match project OR tag
      matchingReadCount = readDocs.filter(
        (d) =>
          d.linked_project?.toLowerCase() === goal.linked_project?.toLowerCase() ||
          d.tags.some((t) => t.toLowerCase() === goal.linked_tag?.toLowerCase())
      ).length;
    } else if (goal.linked_project) {
      matchingReadCount = readDocs.filter(
        (d) => d.linked_project?.toLowerCase() === goal.linked_project?.toLowerCase()
      ).length;
    } else if (goal.linked_tag) {
      matchingReadCount = readDocs.filter((d) =>
        d.tags.some((t) => t.toLowerCase() === goal.linked_tag?.toLowerCase())
      ).length;
    } else {
      // General goal - all read docs
      matchingReadCount = readDocs.length;
    }

    const currentCount = matchingReadCount;
    let status = goal.status;
    if (currentCount >= goal.target_count && status === 'active') {
      status = 'completed';
    } else if (currentCount < goal.target_count && status === 'completed') {
      status = 'active';
    }

    return {
      ...goal,
      current_count: currentCount,
      status,
    };
  });
}

export const storageService = {
  /**
   * Initializes local storage with seed data if this is the first launch.
   */
  async initialize(): Promise<{
    documents: Document[];
    notes: Note[];
    goals: Goal[];
  }> {
    const initialized = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);
    const userId = await getLocalUserId();

    if (!initialized) {
      // First run: save seed data
      const calculatedGoals = recalculateGoals(SEED_GOALS, SEED_DOCUMENTS);
      await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(SEED_DOCUMENTS));
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(SEED_NOTES));
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(calculatedGoals));
      await AsyncStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

      // Attempt background Firestore sync if configured
      if (isFirebaseConfigured) {
        SEED_DOCUMENTS.forEach((doc) => firestoreService.saveDocument(userId, doc));
        SEED_NOTES.forEach((n) => firestoreService.saveNote(userId, n));
        calculatedGoals.forEach((g) => firestoreService.saveGoal(userId, g));
      }

      return {
        documents: SEED_DOCUMENTS,
        notes: SEED_NOTES,
        goals: calculatedGoals,
      };
    }

    // Load from local AsyncStorage
    const docsJson = await AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    const notesJson = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
    const goalsJson = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);

    let documents: Document[] = docsJson ? JSON.parse(docsJson) : [];
    let notes: Note[] = notesJson ? JSON.parse(notesJson) : [];
    let rawGoals: Goal[] = goalsJson ? JSON.parse(goalsJson) : [];

    // Recalculate goals dynamically to ensure consistency
    const goals = recalculateGoals(rawGoals, documents);

    return { documents, notes, goals };
  },

  /**
   * Resets local data back to initial Year 3 CompEng seed data.
   */
  async resetToSeed(): Promise<{
    documents: Document[];
    notes: Note[];
    goals: Goal[];
  }> {
    const calculatedGoals = recalculateGoals(SEED_GOALS, SEED_DOCUMENTS);
    await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(SEED_DOCUMENTS));
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(SEED_NOTES));
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(calculatedGoals));

    const userId = await getLocalUserId();
    if (isFirebaseConfigured) {
      SEED_DOCUMENTS.forEach((doc) => firestoreService.saveDocument(userId, doc));
      SEED_NOTES.forEach((n) => firestoreService.saveNote(userId, n));
      calculatedGoals.forEach((g) => firestoreService.saveGoal(userId, g));
    }

    return {
      documents: SEED_DOCUMENTS,
      notes: SEED_NOTES,
      goals: calculatedGoals,
    };
  },

  // --- DOCUMENTS ---
  async getDocuments(): Promise<Document[]> {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return json ? JSON.parse(json) : [];
  },

  async saveDocuments(documents: Document[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  },

  async addDocument(document: Document): Promise<{ documents: Document[]; goals: Goal[] }> {
    const documents = await this.getDocuments();
    const updatedDocs = [document, ...documents];
    await this.saveDocuments(updatedDocs);

    // Update goals
    const goals = await this.getGoals();
    const updatedGoals = recalculateGoals(goals, updatedDocs);
    await this.saveGoals(updatedGoals);

    // Background cloud sync
    getLocalUserId().then((userId) => {
      firestoreService.saveDocument(userId, document);
    });

    return { documents: updatedDocs, goals: updatedGoals };
  },

  async updateDocument(
    id: string,
    updates: Partial<Document>
  ): Promise<{ documents: Document[]; goals: Goal[] }> {
    const documents = await this.getDocuments();
    const updatedDocs = documents.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc));
    await this.saveDocuments(updatedDocs);

    // Update goals
    const goals = await this.getGoals();
    const updatedGoals = recalculateGoals(goals, updatedDocs);
    await this.saveGoals(updatedGoals);

    // Background cloud sync
    getLocalUserId().then((userId) => {
      firestoreService.updateDocument(userId, id, updates);
    });

    return { documents: updatedDocs, goals: updatedGoals };
  },

  async deleteDocument(id: string): Promise<{ documents: Document[]; goals: Goal[] }> {
    const documents = await this.getDocuments();
    const updatedDocs = documents.filter((doc) => doc.id !== id);
    await this.saveDocuments(updatedDocs);

    // Also delete notes attached to this document
    const notes = await this.getNotes();
    const updatedNotes = notes.filter((n) => n.document_id !== id);
    await this.saveNotes(updatedNotes);

    // Update goals
    const goals = await this.getGoals();
    const updatedGoals = recalculateGoals(goals, updatedDocs);
    await this.saveGoals(updatedGoals);

    // Background cloud sync
    getLocalUserId().then((userId) => {
      firestoreService.deleteDocument(userId, id);
    });

    return { documents: updatedDocs, goals: updatedGoals };
  },

  // --- NOTES ---
  async getNotes(): Promise<Note[]> {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
    return json ? JSON.parse(json) : [];
  },

  async saveNotes(notes: Note[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  async addNote(note: Note): Promise<Note[]> {
    const notes = await this.getNotes();
    const updatedNotes = [note, ...notes];
    await this.saveNotes(updatedNotes);

    getLocalUserId().then((userId) => {
      firestoreService.saveNote(userId, note);
    });

    return updatedNotes;
  },

  async deleteNote(id: string): Promise<Note[]> {
    const notes = await this.getNotes();
    const updatedNotes = notes.filter((n) => n.id !== id);
    await this.saveNotes(updatedNotes);

    getLocalUserId().then((userId) => {
      firestoreService.deleteNote(userId, id);
    });

    return updatedNotes;
  },

  // --- GOALS ---
  async getGoals(): Promise<Goal[]> {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
    return json ? JSON.parse(json) : [];
  },

  async saveGoals(goals: Goal[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  async addGoal(goal: Goal): Promise<Goal[]> {
    const goals = await this.getGoals();
    const documents = await this.getDocuments();
    const updatedGoals = recalculateGoals([goal, ...goals], documents);
    await this.saveGoals(updatedGoals);

    getLocalUserId().then((userId) => {
      firestoreService.saveGoal(userId, goal);
    });

    return updatedGoals;
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal[]> {
    const goals = await this.getGoals();
    const documents = await this.getDocuments();
    const mapped = goals.map((g) => (g.id === id ? { ...g, ...updates } : g));
    const updatedGoals = recalculateGoals(mapped, documents);
    await this.saveGoals(updatedGoals);

    getLocalUserId().then((userId) => {
      firestoreService.updateGoal(userId, id, updates);
    });

    return updatedGoals;
  },

  async deleteGoal(id: string): Promise<Goal[]> {
    const goals = await this.getGoals();
    const updatedGoals = goals.filter((g) => g.id !== id);
    await this.saveGoals(updatedGoals);

    getLocalUserId().then((userId) => {
      firestoreService.deleteGoal(userId, id);
    });

    return updatedGoals;
  },
};
