import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { Document, Note, Goal } from '../types';

export const firestoreService = {
  // --- DOCUMENTS ---
  async getDocuments(userId: string): Promise<Document[]> {
    if (!isFirebaseConfigured || !db) return [];
    try {
      const q = query(
        collection(db, 'users', userId, 'documents'),
        orderBy('added_date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Document));
    } catch (error) {
      console.warn('[Firestore] Failed to fetch documents:', error);
      return [];
    }
  },

  async saveDocument(userId: string, document: Document): Promise<void> {
    if (!isFirebaseConfigured || !db) return;
    try {
      const docRef = doc(db, 'users', userId, 'documents', document.id);
      await setDoc(docRef, document);
    } catch (error) {
      console.warn('[Firestore] Failed to save document:', error);
    }
  },

  async updateDocument(userId: string, docId: string, updates: Partial<Document>): Promise<void> {
    if (!isFirebaseConfigured || !db) return;
    try {
      const docRef = doc(db, 'users', userId, 'documents', docId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.warn('[Firestore] Failed to update document:', error);
    }
  },

  async deleteDocument(userId: string, docId: string): Promise<void> {
    if (!isFirebaseConfigured || !db) return;
    try {
      const docRef = doc(db, 'users', userId, 'documents', docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn('[Firestore] Failed to delete document:', error);
    }
  },

  // --- NOTES ---
  async getNotes(userId: string): Promise<Note[]> {
    if (!isFirebaseConfigured || !db) return [];
    try {
      const q = query(
        collection(db, 'users', userId, 'notes'),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Note));
    } catch (error) {
      console.warn('[Firestore] Failed to fetch notes:', error);
      return [];
    }
  },

  async saveNote(userId: string, note: Note): Promise<void> {
    if (!isFirebaseConfigured || !db) return;
    try {
      const docRef = doc(db, 'users', userId, 'notes', note.id);
      await setDoc(docRef, note);
    } catch (error) {
      console.warn('[Firestore] Failed to save note:', error);
    }
  },

  async deleteNote(userId: string, noteId: string): Promise<void> {
    if (!isFirebaseConfigured || !db) return;
    try {
      const docRef = doc(db, 'users', userId, 'notes', noteId);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn('[Firestore] Failed to delete note:', error);
    }
  },

  // --- GOALS ---
  async getGoals(userId: string): Promise<Goal[]> {
    if (!isFirebaseConfigured || !db) return [];
    try {
      const snapshot = await getDocs(collection(db, 'users', userId, 'goals'));
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Goal));
    } catch (error) {
      console.warn('[Firestore] Failed to fetch goals:', error);
      return [];
    }
  },

  async saveGoal(userId: string, goal: Goal): Promise<void> {
    if (!isFirebaseConfigured || !db) return;
    try {
      const docRef = doc(db, 'users', userId, 'goals', goal.id);
      await setDoc(docRef, goal);
    } catch (error) {
      console.warn('[Firestore] Failed to save goal:', error);
    }
  },

  async updateGoal(userId: string, goalId: string, updates: Partial<Goal>): Promise<void> {
    if (!isFirebaseConfigured || !db) return;
    try {
      const docRef = doc(db, 'users', userId, 'goals', goalId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.warn('[Firestore] Failed to update goal:', error);
    }
  },

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    if (!isFirebaseConfigured || !db) return;
    try {
      const docRef = doc(db, 'users', userId, 'goals', goalId);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn('[Firestore] Failed to delete goal:', error);
    }
  },
};
