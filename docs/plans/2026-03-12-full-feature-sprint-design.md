# Halacha AI — Full Feature Sprint Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete Phases 0.3 through 7 of the Halacha AI features roadmap — turning the working MVP into a comprehensive Torah study platform.

**Architecture:** Monorepo with `apps/web` (Next.js 15), `packages/db` (Postgres+pgvector), `packages/lib` (shared logic). New features add React components in `apps/web/app/`, API routes in `apps/web/app/api/`, DB functions in `packages/db/client.ts`, and migrations in `packages/db/migrations/`.

**Tech Stack:** Next.js 15, React 19, TypeScript, PostgreSQL + pgvector, BullMQ + Redis, custom CSS (dark navy/gold glass-morphism). New deps: `cmdk`, `@tanstack/react-virtual`, `react-resizable-panels`, `@floating-ui/react`, `zustand`, `react-hotkeys-hook`.

---

## Task 1: Install Dependencies

**Files:**
- Modify: `apps/web/package.json`

**Step 1: Install new packages**

Run:
```bash
cd /c/Users/jazra/Claude/halacha-ai
pnpm add -F @halacha-ai/web cmdk @tanstack/react-virtual react-resizable-panels @floating-ui/react zustand react-hotkeys-hook
```

**Step 2: Commit**

```bash
git add apps/web/package.json pnpm-lock.yaml
git commit -m "deps: add cmdk, react-virtual, resizable-panels, floating-ui, zustand, hotkeys"
```

---

## Task 2: Database Migration — New Tables

**Files:**
- Create: `packages/db/migrations/005_features.sql`
- Modify: `packages/db/client.ts` (add new query functions)
- Modify: `packages/db/schema.ts` (add new types)

**Step 1: Write migration SQL**

```sql
-- 005_features.sql

-- Text links from Sefaria (420K cross-references)
CREATE TABLE IF NOT EXISTS text_links (
  id SERIAL PRIMARY KEY,
  source_ref TEXT NOT NULL,
  target_ref TEXT NOT NULL,
  link_type TEXT NOT NULL DEFAULT 'reference',
  source_work TEXT,
  target_work TEXT,
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_text_links_source ON text_links (source_ref);
CREATE INDEX idx_text_links_target ON text_links (target_ref);
CREATE INDEX idx_text_links_type ON text_links (link_type);

-- Dictionary entries (Jastrow)
CREATE TABLE IF NOT EXISTS dictionary_entries (
  id SERIAL PRIMARY KEY,
  word TEXT NOT NULL,
  word_normalized TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'arc',
  definition TEXT NOT NULL,
  root TEXT,
  part_of_speech TEXT,
  source TEXT DEFAULT 'jastrow',
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_dict_word ON dictionary_entries (word);
CREATE INDEX idx_dict_normalized ON dictionary_entries (word_normalized);
CREATE INDEX idx_dict_trgm ON dictionary_entries USING gin (word_normalized gin_trgm_ops);

-- Topics
CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_he TEXT,
  description TEXT,
  embedding VECTOR(1024),
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_topics_embedding ON topics USING hnsw (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS topic_links (
  id SERIAL PRIMARY KEY,
  topic_id INT REFERENCES topics(id) ON DELETE CASCADE,
  chunk_id INT REFERENCES halacha_chunks(id) ON DELETE CASCADE,
  relevance REAL DEFAULT 1.0,
  UNIQUE(topic_id, chunk_id)
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES user_profiles(id) ON DELETE CASCADE,
  chunk_id INT REFERENCES halacha_chunks(id) ON DELETE CASCADE,
  label TEXT,
  color TEXT DEFAULT '#d4af37',
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, chunk_id)
);
CREATE INDEX idx_bookmarks_user ON bookmarks (user_id);

-- Annotations (highlights + notes)
CREATE TABLE IF NOT EXISTS annotations (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES user_profiles(id) ON DELETE CASCADE,
  chunk_id INT REFERENCES halacha_chunks(id) ON DELETE CASCADE,
  annotation_type TEXT NOT NULL DEFAULT 'note',
  content TEXT,
  highlight_start INT,
  highlight_end INT,
  color TEXT DEFAULT '#d4af37',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_annotations_user ON annotations (user_id);
CREATE INDEX idx_annotations_chunk ON annotations (chunk_id);

-- Reading history
CREATE TABLE IF NOT EXISTS reading_history (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES user_profiles(id) ON DELETE CASCADE,
  work TEXT NOT NULL,
  section_ref TEXT NOT NULL,
  time_spent_seconds INT DEFAULT 0,
  last_read_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_history_user ON reading_history (user_id);
CREATE UNIQUE INDEX idx_history_unique ON reading_history (user_id, work, section_ref);

-- Study progress
CREATE TABLE IF NOT EXISTS study_progress (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES user_profiles(id) ON DELETE CASCADE,
  work TEXT NOT NULL,
  total_sections INT DEFAULT 0,
  completed_sections INT DEFAULT 0,
  last_section_ref TEXT,
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, work)
);

-- Study sheets
CREATE TABLE IF NOT EXISTS study_sheets (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  share_slug TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_sheet_items (
  id SERIAL PRIMARY KEY,
  sheet_id INT REFERENCES study_sheets(id) ON DELETE CASCADE,
  chunk_id INT REFERENCES halacha_chunks(id),
  note TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Research sessions (multi-turn AI conversations)
CREATE TABLE IF NOT EXISTS research_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT,
  context_work TEXT,
  context_section TEXT,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_sessions_user ON research_sessions (user_id);

-- Rabbis / Tzadikim profiles
CREATE TABLE IF NOT EXISTS rabbis (
  id SERIAL PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_he TEXT,
  era TEXT,
  generation TEXT,
  community TEXT DEFAULT 'General',
  birth_year TEXT,
  death_year TEXT,
  location TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rabbi_works (
  id SERIAL PRIMARY KEY,
  rabbi_id INT REFERENCES rabbis(id) ON DELETE CASCADE,
  work_name TEXT NOT NULL,
  UNIQUE(rabbi_id, work_name)
);

-- Extension for trigram (dictionary fuzzy search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

**Step 2: Add TypeScript types to schema.ts**

Add interfaces for all new tables: TextLink, DictionaryEntry, Topic, Bookmark, Annotation, ReadingHistory, StudyProgress, StudySheet, StudySheetItem, ResearchSession, Rabbi.

**Step 3: Add DB functions to client.ts**

Add CRUD functions for each new table. Key functions:
- `getTextLinks(ref)`, `insertTextLinksBatch(links[])`
- `searchDictionary(word)`, `insertDictionaryBatch(entries[])`
- `getBookmarks(userId)`, `toggleBookmark(userId, chunkId, label?, color?)`
- `getAnnotations(userId, chunkId?)`, `createAnnotation(...)`, `deleteAnnotation(id)`
- `recordReading(userId, work, sectionRef, seconds)`, `getReadingHistory(userId)`
- `getStudyProgress(userId, work?)`, `updateStudyProgress(...)`
- `createStudySheet(...)`, `getStudySheets(userId)`, `addSheetItem(...)`, `getSheetItems(sheetId)`
- `createResearchSession(...)`, `getResearchSessions(userId)`, `appendMessage(sessionId, msg)`

**Step 4: Run migration**

```bash
pnpm run migrate
```

**Step 5: Commit**

```bash
git add packages/db/
git commit -m "feat: add migration 005 with text_links, dictionary, bookmarks, annotations, history, study sheets, research sessions, rabbis tables"
```

---

## Task 3: Zustand Global Store

**Files:**
- Create: `apps/web/app/store.ts`

Create a zustand store for shared UI state across all pages:

```typescript
import { create } from 'zustand';

interface AppStore {
  // Reader preferences
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

  // Commentary
  activeCommentators: string[];
  setActiveCommentators: (commentators: string[]) => void;

  // Layout mode
  layoutMode: 'modern' | 'traditional' | 'research';
  setLayoutMode: (mode: 'modern' | 'traditional' | 'research') => void;
}
```

**Commit:** `feat: add zustand global store for reader preferences and UI state`

---

## Task 4: Reader Enhancements (Phase 1.3)

**Files:**
- Modify: `apps/web/app/reader/page.tsx`
- Modify: `apps/web/app/globals.css`

**4a. Language Toggle**
- Add HE / EN / Both toggle buttons above the text
- Filter displayed chunks by language (or show both side-by-side in "Both" mode)
- Use zustand store for persistence

**4b. Font Size Controls**
- Add a slider or +/- buttons (range: 0.8rem to 1.6rem)
- Apply via CSS variable `--reader-font-size` on the text container
- Persist in zustand store

**4c. Previous / Next Section Navigation**
- Query adjacent sections from the TOC
- Add ← → buttons at top and bottom of reader view
- Keyboard shortcuts: `[` and `]`

**4d. Virtualized Scrolling**
- Wrap the library work list with `@tanstack/react-virtual`
- Wrap the TOC section list
- Replace "Load more" with infinite virtual scroll

**Commit:** `feat: reader language toggle, font controls, prev/next nav, virtualized scrolling`

---

## Task 5: Command Palette (Cmd+K)

**Files:**
- Create: `apps/web/app/components/CommandPalette.tsx`
- Modify: `apps/web/app/layout.tsx` (mount CommandPalette globally)

Build a `cmdk`-based command palette:
- Cmd+K to open from any page
- Search works by name (hits `/api/reader/works?search=X`)
- Search sections within a work
- Quick actions: "Go to Reader", "AI Research", "Search"
- Navigate to selected result

Use `react-hotkeys-hook` for the Cmd+K binding.

**Commit:** `feat: add Cmd+K command palette for reference jumping`

---

## Task 6: Category Grid & Sorting (Phase 1.2)

**Files:**
- Create: `apps/web/app/api/reader/categories/route.ts`
- Modify: `apps/web/app/reader/page.tsx` (add category grid view)

**6a. Categories API**
- Query distinct categories from works (derived from work names or tags)
- Group by top-level category (Tanakh, Mishnah, Talmud, Halakhah, Kabbalah, etc.)
- Return counts per category

**6b. Category Grid UI**
- Grid of category cards on library home
- Click a category to filter works list
- Visual design: glass cards with gold accent borders

**6c. Sorting Options**
- Alphabetical (A-Z / Z-A)
- By era (earliest first / latest first)
- By chunk count (largest first)
- Toggle between grid and list view

**Commit:** `feat: add category grid navigation and sorting options to library`

---

## Task 7: Commentary Sidebar (Phase 2.1)

**Files:**
- Create: `apps/web/app/components/CommentarySidebar.tsx`
- Create: `apps/web/app/api/reader/commentaries/route.ts`
- Modify: `apps/web/app/reader/page.tsx`

**7a. Commentary API**
- Given a `section_ref` and `work`, find commentaries via:
  - `text_links` table (link_type = 'commentary')
  - Fallback: pattern match "X on Y" in work names
- Return grouped by commentator

**7b. CommentarySelector**
- Multi-select dropdown for choosing which commentators to show
- Persist selection in zustand

**7c. CommentaryBlock Component**
- Collapsible blocks with commentator header
- 85% font size of main text
- RTL support for Hebrew commentaries
- Highlight which main text segment the commentary references

**7d. Integration**
- Right sidebar panel (resizable with `react-resizable-panels`)
- Load commentaries when reader section changes
- Toggle with `C` keyboard shortcut

**Commit:** `feat: add commentary sidebar with multi-commentator selection`

---

## Task 8: Cross-Reference System (Phase 2.2)

**Files:**
- Create: `scripts/import-sefaria-links.ts`
- Modify: `apps/web/app/reader/page.tsx`
- Modify: `apps/web/app/globals.css`

**8a. Import Sefaria Links**
- Script to parse Sefaria-Export `links/` directory
- Insert into `text_links` table with source_ref, target_ref, link_type
- Handle ~420K links in batches

**8b. Inline Footnote Indicators**
- Gold links with dotted underline on section refs that have cross-references
- Count indicator showing number of references

**8c. CrossRefTooltip Enhancement**
- Hover preview showing referenced text (already partially built)
- "Referenced by" panel showing what other texts cite this passage
- Click-through navigation to referenced texts

**Commit:** `feat: import Sefaria links and enhance cross-reference UI`

---

## Task 9: Search Page (Phase 2.3)

**Files:**
- Create: `apps/web/app/search/page.tsx`
- Create: `apps/web/app/api/search/route.ts`
- Modify: `apps/web/app/layout.tsx` (add to nav)

**9a. Search API**
- Wrap existing hybrid search with additional filters
- Params: query, work, category, era, community, corpusTier, mode
- Pagination support

**9b. Search Page UI**
- Search bar with instant results
- Filter sidebar: work, category, era, community, corpus tier
- Result cards showing matched text with highlights
- "Find similar passages" button per result
- Search within specific work option

**Commit:** `feat: add dedicated search page with filters`

---

## Task 10: Dictionary Popover (Phase 3.1)

**Files:**
- Create: `apps/web/app/components/DictionaryPopover.tsx`
- Create: `apps/web/app/api/dictionary/route.ts`
- Create: `scripts/ingest-jastrow.ts`
- Modify: `apps/web/app/reader/page.tsx`

**10a. Jastrow Ingestion Script**
- Parse Jastrow dictionary data (public domain)
- Insert into `dictionary_entries` table
- Map words to normalized forms

**10b. Dictionary API**
- Lookup word (exact + fuzzy via trigram)
- Return definition, root, part of speech
- Query word frequency across corpus (COUNT of chunks containing the word)

**10c. DictionaryPopover Component**
- Click any Hebrew/Aramaic word in the reader
- `@floating-ui/react` positioned popover
- Shows: definition, root (shoresh), part of speech, frequency
- Related terms
- Pin to sidebar option
- Keyboard shortcut: `D` on selected text

**Commit:** `feat: add dictionary popover with Jastrow integration`

---

## Task 11: AI Research Panel (Phase 3.2)

**Files:**
- Create: `apps/web/app/components/AIPanel.tsx`
- Create: `apps/web/app/api/ai/chat/route.ts`
- Modify: `apps/web/app/layout.tsx`

**11a. Chat API**
- Streaming endpoint using existing LLM routing
- Accepts context (current work, section, text)
- Multi-turn conversation with message history
- Saves to `research_sessions` table

**11b. AIPanel Component**
- Slide-out drawer from right side (accessible from any page)
- Three modes (Practical, Deep, Posek) — reuse existing prompts
- "Ask about this passage" — pre-fills context
- Inline citations rendered as clickable links → navigate reader
- Quick action buttons: Explain, Compare opinions, Trace concept
- Chat history with message bubbles
- Toggle with `Cmd+/` shortcut

**Commit:** `feat: add AI research panel with streaming chat and contextual queries`

---

## Task 12: Topic Browser (Phase 3.3)

**Files:**
- Create: `apps/web/app/topics/page.tsx`
- Create: `apps/web/app/api/topics/route.ts`

**12a. Topics API**
- List topics with counts
- Search topics by name
- Get chunks linked to a topic

**12b. Topics Page**
- Browse topics as a tag cloud or grid
- Click topic → see all related passages
- Semantic topic matching from search queries

**Commit:** `feat: add topic browser page`

---

## Task 13: Traditional Talmud Layout (Phase 4)

**Files:**
- Create: `apps/web/app/components/TraditionalLayout.tsx`
- Modify: `apps/web/app/reader/page.tsx`

**13a. Three-Column Layout**
- Rashi on left (start), main text center, Tosafot on right (end)
- `react-resizable-panels` for drag handles (25% / 50% / 25%)
- RTL-aware (swap sides in RTL mode)

**13b. Vertical Alignment Engine**
- Measure main text segment positions
- Position commentary blocks to align with anchor segments
- Push-down algorithm when blocks overlap

**13c. Commentary Connections**
- Hover on commentary → gold border on anchor segment
- Hover on main text → highlight associated commentaries

**13d. Layout Switcher**
- Keyboard shortcuts: `1` Modern, `2` Traditional, `3` Research
- Toggle in reader toolbar

**Commit:** `feat: add traditional Talmud page layout with three-column view`

---

## Task 14: Bookmarks & Annotations (Phase 5.1-5.2)

**Files:**
- Create: `apps/web/app/components/BookmarkButton.tsx`
- Create: `apps/web/app/components/AnnotationEditor.tsx`
- Create: `apps/web/app/bookmarks/page.tsx`
- Create: `apps/web/app/api/bookmarks/route.ts`
- Create: `apps/web/app/api/annotations/route.ts`
- Modify: `apps/web/app/reader/page.tsx`

**14a. Bookmark System**
- Bookmark button on each chunk (gold star toggle)
- API: GET/POST/DELETE bookmarks
- Bookmarks page showing all saved passages
- `Cmd+B` keyboard shortcut

**14b. Annotation System**
- Highlight text → color picker + note input
- Margin note indicators on chunks with annotations
- Tag system for organizing notes
- API: CRUD annotations

**Commit:** `feat: add bookmarks and annotations with dedicated bookmarks page`

---

## Task 15: Reading History & Study Progress (Phase 5.3)

**Files:**
- Create: `apps/web/app/history/page.tsx`
- Create: `apps/web/app/api/history/route.ts`
- Create: `apps/web/app/api/progress/route.ts`
- Modify: `apps/web/app/reader/page.tsx` (track time spent)

**15a. Reading Tracking**
- Track time spent per section (IntersectionObserver + timer)
- Record to `reading_history` on section leave
- "Continue where you left off" on home page

**15b. Study Progress**
- Completion % per work (sections read / total)
- Progress bars on work cards in library
- History page with recent reads

**Commit:** `feat: add reading history tracking and study progress`

---

## Task 16: Study Sheets (Phase 5.4)

**Files:**
- Create: `apps/web/app/sheets/page.tsx`
- Create: `apps/web/app/sheets/[id]/page.tsx`
- Create: `apps/web/app/api/sheets/route.ts`
- Create: `apps/web/app/api/sheets/[id]/route.ts`

**16a. Study Sheet CRUD**
- Create sheets with title + description
- Add passages from reader (drag or "Add to sheet" button)
- Reorder items with drag-and-drop
- Add notes between passages
- Public/private toggle with share URL

**Commit:** `feat: add study sheets for curating passage collections`

---

## Task 17: Research Workbench (Phase 6)

**Files:**
- Create: `apps/web/app/research/page.tsx`
- Create: `apps/web/app/components/ResearchPane.tsx`

**17a. Multi-Pane Layout**
- 2-4 independent text panes using `react-resizable-panels`
- Each pane has own work/section selector
- "+" button to add panes
- Save/restore layout configurations

**17b. Sync-Scroll**
- Lock two panes together for parallel reading
- Toggle sync per pane pair

**17c. AI Research Sessions**
- Multi-turn AI conversations within research context
- Session history and search
- Link research to study sheets

**Commit:** `feat: add multi-pane research workbench with sync-scroll`

---

## Task 18: Tzadik / Posek Profiles (Novel Feature N1)

**Files:**
- Create: `apps/web/app/tzadikim/page.tsx`
- Create: `apps/web/app/tzadikim/[name]/page.tsx`
- Create: `apps/web/app/api/rabbis/route.ts`
- Create: `scripts/populate-rabbis.ts`

**18a. Rabbi Database Population**
- Extract authors from existing chunks (unique author values)
- Enrich with era, community, known works
- Insert into `rabbis` + `rabbi_works` tables

**18b. Browse Page**
- Grid/list of rabbis with search
- Filter by era, community
- Show works count

**18c. Profile Page**
- Bio, works list, mention count in corpus
- "What did [rabbi] say about [topic]?" AI query
- Timeline of life events

**Commit:** `feat: add Tzadik/Posek profiles with browse and detail pages`

---

## Task 19: Mobile & Responsive (Phase 7.1)

**Files:**
- Modify: `apps/web/app/globals.css`
- Modify: all page components (responsive breakpoints)

**19a. Responsive Breakpoints**
- Mobile: <640px
- Tablet: 640-1024px
- Desktop: >1024px

**19b. Mobile Navigation**
- Bottom tab bar: Reader | Search | AI | Profile
- Swipe left/right for prev/next section

**19c. Bottom Sheets**
- Commentary, dictionary, AI panels as bottom sheets on mobile
- Slide up from bottom instead of sidebar

**Commit:** `feat: add responsive mobile layout with bottom sheets`

---

## Task 20: Export & Accessibility (Phase 7.3-7.4)

**Files:**
- Create: `apps/web/app/components/ExportMenu.tsx`
- Modify: `apps/web/app/globals.css` (print styles, high contrast)
- Modify: all components (ARIA labels)

**20a. Export**
- Share passage via URL (encode work + section in URL params)
- Print-friendly CSS (`@media print`)

**20b. Accessibility**
- ARIA labels on all interactive elements
- Focus management for keyboard navigation
- High contrast mode toggle
- `prefers-reduced-motion` support

**Commit:** `feat: add export, sharing, and accessibility features`

---

## Execution Notes

- Tasks 1-3 are sequential prerequisites
- Tasks 4-6 can run in parallel (all reader enhancements)
- Tasks 7-9 can run in parallel (commentary, cross-refs, search)
- Tasks 10-12 can run in parallel (dictionary, AI panel, topics)
- Task 13 depends on Task 7 (needs commentary data)
- Tasks 14-16 can run in parallel (user features)
- Task 17 depends on Tasks 4, 7, 11 (combines reader, commentary, AI)
- Task 18 is independent
- Tasks 19-20 should run last (polish)

## Parallel Execution Groups

| Group | Tasks | Dependencies |
|-------|-------|-------------|
| **A: Foundation** | 1, 2, 3 | Sequential |
| **B: Reader** | 4, 5, 6 | After A |
| **C: Commentary** | 7, 8, 9 | After A |
| **D: Intelligence** | 10, 11, 12 | After A |
| **E: Layout** | 13 | After C |
| **F: User Features** | 14, 15, 16 | After A |
| **G: Advanced** | 17 | After B, C, D |
| **H: Profiles** | 18 | After A |
| **I: Polish** | 19, 20 | After all |
