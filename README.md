# DocTrack — Personal Document & Reading Manager

DocTrack is an Android application built with **React Native**, **Expo (SDK 54)**, **TypeScript**, **NativeWind (Tailwind CSS)**, and an **Offline-First Storage Engine** (with Firebase Firestore synchronization support).

Designed specifically for undergraduate engineering students, it serves as a unified library to track research papers, textbooks, and course notes with attached lightweight reading goals—allowing direct opening of files in external viewers (Google Drive, Acrobat, browser) without acting as a heavyweight file storage replacement.

---

## 🚀 Features

- **Dashboard / Overview**:
  - Quick statistics: To-Read, In-Progress, Read this month, Total documents.
  - Category breakdown (Research Papers, Books, Course Notes).
  - **"Continue Reading"** shelf with progress bars and 1-tap **Open** shortcuts.
  - Active reading goals with live progress percentages.
  - "Reset Demo Data" button to restore sample Year 3 Computer Engineering papers & courses at any time.

- **Library (Search & Multi-Filter)**:
  - Fast client-side search across title, tags, authors, linked project, and **notes content**.
  - Type tabs: *All*, *Papers*, *Books*, *Course Notes*, *Other*.
  - Status filter pills: *To Read*, *In Progress*, *Read*.
  - Filter modal for sorting (Recently Added, Priority, Title, Progress) and filtering by linked project or tag.
  - Direct card quick actions: Start Reading, Mark as Read, Open File/Link.

- **Document Details**:
  - Full metadata: Type, Status, Priority, Tags, Linked Project, and Source location.
  - Dedicated Research Paper fields: Authors, Publication Year, Venue/Conference, and DOI.
  - 1-Tap **Open Document** via Android Intent Launcher (with graceful fallback to Expo Sharing / Linking).
  - Status switcher (`To Read` ➔ `In Progress` ➔ `Read`).
  - Interactive reading progress controls (-10%, +10%, -25%, +25%) and page counter (e.g. Page 355 of 940).
  - 5-Star rating system for completed readings.
  - **Notes Log**: Reverse-chronological feed of past notes with timestamps + inline note creation.

- **Add Document**:
  - **Local File**: Pick PDF / document using `expo-document-picker` with automatic title generation from filename.
  - **URL / Drive Link**: Paste Google Drive, arXiv, or DOI links.
  - **Physical Copy**: Record shelf or binder locations.
  - Category, priority, initial status, project, tags, and research paper specific metadata.

- **Reading Goals**:
  - Set target reading counts scoped to specific projects (e.g. `3YP Swarm Robotics`) or course tags (e.g. `CO5430`).
  - Automatic progress derivation: dynamically counts matching documents marked as `read`.
  - Automatic status updates (`active` ➔ `completed`).
  - Deadline countdown and badge alerts.

- **Research Papers View**:
  - Filtered view tailored specifically for research literature with author, year, and venue tags.

- **Dark Mode Support**:
  - Seamless system theme detection with manual light/dark toggle persisted across sessions.

---

## 🛠️ Project Structure

```
doc-tracker/
├── App.tsx                     # Main entrypoint with Theme, Document, and Navigation providers
├── app.json                    # Expo project configuration
├── babel.config.js             # Babel config with NativeWind & Reanimated plugins
├── metro.config.js             # Metro config integrated with NativeWind
├── tailwind.config.js          # Tailwind CSS configuration with dark mode support
├── global.css                  # Global Tailwind directives
├── src/
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces (Document, Note, Goal, Source, Filter)
│   ├── config/
│   │   └── firebase.ts         # Firebase initialization with automatic offline fallback
│   ├── constants/
│   │   ├── colors.ts           # Light & Dark theme color palettes and badge styles
│   │   └── seedData.ts         # Authentic Year 3 CompEng papers, books, notes, and goals
│   ├── services/
│   │   ├── fileService.ts      # DocumentPicker, title sanitization, IntentLauncher & Linking
│   │   ├── firestoreService.ts # Cloud Firestore CRUD operations
│   │   └── storageService.ts   # Unified AsyncStorage offline-first engine + auto-derived goals
│   ├── context/
│   │   ├── DocumentContext.tsx # Global document, notes, and goals state management
│   │   └── ThemeContext.tsx    # Theme provider with dark mode persistence
│   ├── navigation/
│   │   ├── RootNavigator.tsx   # Native Stack navigation (Tabs, Details, Add Modal)
│   │   └── TabNavigator.tsx    # Bottom tab bar (Home, Library, Add Doc, Goals)
│   ├── screens/
│   │   ├── DashboardScreen.tsx
│   │   ├── LibraryScreen.tsx
│   │   ├── DocumentDetailScreen.tsx
│   │   ├── AddDocumentScreen.tsx
│   │   ├── GoalsScreen.tsx
│   │   └── ResearchPapersScreen.tsx
│   └── components/
│       ├── common/
│       │   ├── Header.tsx
│       │   ├── Badge.tsx
│       │   ├── ProgressBar.tsx
│       │   ├── SearchBar.tsx
│       │   └── EmptyState.tsx
│       ├── document/
│       │   ├── DocumentCard.tsx
│       │   └── DocumentFilterModal.tsx
│       ├── notes/
│       │   ├── NoteItem.tsx
│       │   └── AddNoteInput.tsx
│       └── goals/
│           ├── GoalCard.tsx
│           └── AddGoalModal.tsx
```

---

## 🔌 Offline-First & Firebase Sync Architecture

DocTrack requires **no mandatory sign-up or cloud setup** to get started:
1. All documents, notes, and goals are stored locally via `@react-native-async-storage/async-storage`.
2. On first launch, the app automatically pre-populates with realistic Year 3 Computer Engineering sample readings (e.g., *Attention Is All You Need*, *DispNet Stereo Disparity*, *Szeliski Computer Vision*, *CO5430 RTOS Notes*).
3. **Optional Cloud Firestore Sync**: To sync data to your Firebase project, update `src/config/firebase.ts` or supply standard Expo environment variables:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

---

## 🏃 Running the App

1. **Install dependencies** (already installed in workspace):
   ```bash
   npm install
   ```

2. **Start the Expo development server**:
   ```bash
   npm start
   ```

3. **Run on Android device or emulator**:
   ```bash
   npm run android
   ```

4. **Run on Web**:
   ```bash
   npm run web
   ```
