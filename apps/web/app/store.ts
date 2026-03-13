import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  // Reader preferences (persisted)
  fontSize: number;
  setFontSize: (size: number) => void;
  languageFilter: 'all' | 'he' | 'en' | 'arc';
  setLanguageFilter: (lang: 'all' | 'he' | 'en' | 'arc') => void;

  // Command palette
  cmdkOpen: boolean;
  setCmdkOpen: (open: boolean) => void;

  // AI panel
  aiPanelOpen: boolean;
  setAiPanelOpen: (open: boolean) => void;
  aiContext: { work?: string; section?: string; text?: string } | null;
  setAiContext: (ctx: { work?: string; section?: string; text?: string } | null) => void;

  // Dictionary
  dictionaryWord: string | null;
  setDictionaryWord: (word: string | null) => void;

  // Pinned definitions sidebar
  pinnedDefinitions: { word: string; definition: string; root?: string | null; language?: string }[];
  pinDefinition: (entry: { word: string; definition: string; root?: string | null; language?: string }) => void;
  unpinDefinition: (word: string) => void;
  clearPinnedDefinitions: () => void;

  // Commentary
  activeCommentators: string[];
  setActiveCommentators: (commentators: string[]) => void;
  commentarySidebarOpen: boolean;
  setCommentarySidebarOpen: (open: boolean) => void;

  // Layout mode
  layoutMode: 'modern' | 'traditional' | 'research';
  setLayoutMode: (mode: 'modern' | 'traditional' | 'research') => void;

  // User
  userId: number | null;
  setUserId: (id: number | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      fontSize: 1.0,
      setFontSize: (size) => set({ fontSize: size }),
      languageFilter: 'all',
      setLanguageFilter: (lang) => set({ languageFilter: lang }),

      cmdkOpen: false,
      setCmdkOpen: (open) => set({ cmdkOpen: open }),

      aiPanelOpen: false,
      setAiPanelOpen: (open) => set({ aiPanelOpen: open }),
      aiContext: null,
      setAiContext: (ctx) => set({ aiContext: ctx }),

      dictionaryWord: null,
      setDictionaryWord: (word) => set({ dictionaryWord: word }),

      pinnedDefinitions: [],
      pinDefinition: (entry) =>
        set((state) => ({
          pinnedDefinitions: state.pinnedDefinitions.some((p) => p.word === entry.word)
            ? state.pinnedDefinitions
            : [...state.pinnedDefinitions, entry],
        })),
      unpinDefinition: (word) =>
        set((state) => ({
          pinnedDefinitions: state.pinnedDefinitions.filter((p) => p.word !== word),
        })),
      clearPinnedDefinitions: () => set({ pinnedDefinitions: [] }),

      activeCommentators: [],
      setActiveCommentators: (commentators) => set({ activeCommentators: commentators }),
      commentarySidebarOpen: false,
      setCommentarySidebarOpen: (open) => set({ commentarySidebarOpen: open }),

      layoutMode: 'modern',
      setLayoutMode: (mode) => set({ layoutMode: mode }),

      userId: null,
      setUserId: (id) => set({ userId: id }),
    }),
    {
      name: 'halacha-ai-preferences',
      partialize: (state) => ({
        fontSize: state.fontSize,
        languageFilter: state.languageFilter,
        layoutMode: state.layoutMode,
        activeCommentators: state.activeCommentators,
      }),
    }
  )
);
