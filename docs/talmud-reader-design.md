# Talmud 2.0 Reader Interface -- Design Document

## 1. Competitive Landscape Analysis

### Sefaria.org
**Strengths:**
- Massive open-source library with 325,000+ texts interconnected via links
- "Resource Panel" paradigm: click any segment to reveal connections, commentaries, sheets
- Side-by-side text comparison ("Compare Text" mode)
- William Davidson Talmud with Steinsaltz translation (English + Modern Hebrew)
- Free API for developers; entire data model is public
- Topic-based navigation (new Topics landing page)
- Source sheets for collaborative study

**Weaknesses:**
- Resource panel is a single column -- can't see Rashi AND Tosafot simultaneously
- No traditional Talmud page layout (main text centered with commentaries wrapping)
- Search is keyword-only; no semantic/AI layer
- No word morphology or dictionary pop-ups for Aramaic
- Mobile experience is functional but cramped on phones
- Commentary navigation is linear (scroll through a list), not spatial

### Bar-Ilan Responsa Project
**Strengths:**
- Largest electronic collection: 100,000+ Responsa rulings across 1,000 years
- Sophisticated boolean search with variant forms
- Hypertext links across millennia of sources
- Professional typesetting and proofing

**Weaknesses:**
- Desktop-era UI (Windows-native feel, circa 2005)
- No modern web interface; subscription-only
- Multi-window paradigm feels dated
- No English translations
- No AI or semantic search

### AlHaTorah.org
**Strengths:**
- Verse-by-verse layout with commentaries in scrollable sub-sections per verse
- 40+ commentaries selectable via gear icon
- EN/HE toggle on title bars with audio cantillation
- Clean, focused UI for Tanakh study

**Weaknesses:**
- Tanakh-only (no Talmud, Midrash, Halacha)
- Commentaries are in scrollable boxes which gets small on complex passages
- No cross-reference network visualization
- No search or AI tools

### Otzaria Desktop App
**Strengths:**
- Dual-panel with synchronized scrolling
- Offline-first with downloadable text packs
- Free and open-source (Flutter-based)
- Cross-references between connected texts
- Supports TXT, DOCX, PDF import

**Weaknesses:**
- Desktop-only (no web version)
- Basic search (no semantic)
- Minimal commentary integration
- No translation layer
- UI is functional but not polished

### Koren/ArtScroll Digital
**Strengths:**
- Phrase-by-phrase elucidation (gold standard for English learners)
- Synchronized scrolling: English footnotes follow Hebrew text
- Tap-to-translate individual words
- Professional typography (Koren font is specifically designed for readability)
- Notes, bookmarks, highlights sync across devices

**Weaknesses:**
- Walled garden: subscription per title, no API
- No cross-reference to external sources
- Limited search (within purchased titles only)
- No AI or semantic tools
- Can't view multiple commentaries simultaneously

### Logos Bible Software (model for scholarly tools)
**Strengths:**
- "Passage Guide" aggregates all commentary on a passage instantly
- "Word Study Guide" with morphology, concordance, frequency data
- Parallel text viewer (multiple translations side-by-side)
- Timeline, atlas, and multimedia integration
- Powerful tagging and annotation system

**Weaknesses:**
- Expensive (Scholar's Library: $1000+)
- Christian-text focused; limited Jewish library
- Steep learning curve
- Desktop-heavy; web version is limited
- Overwhelming UI for casual users

### Summary: The Gap We Fill
No existing product combines:
1. Traditional Talmud page layout (spatial commentary positioning)
2. AI-powered semantic search across 4.5M chunks
3. Instant Aramaic/Hebrew morphology and definitions
4. Multiple commentary layers visible simultaneously
5. Research assistant with halakhic reasoning modes
6. Modern, responsive UI with glass-morphism aesthetics
7. Cross-reference network visualization
8. Community-aware ranking

---

## 2. Route / Page Structure (Next.js 15 App Router)

```
app/
  torah/                           # Root for Torah study module
    layout.tsx                     # Torah module layout (nav, breadcrumb, toolbar)
    page.tsx                       # Library home / browse page

    read/
      [ref]/                       # Dynamic reader route
        page.tsx                   # Main reader (e.g., /torah/read/Berakhot.2a)

    search/
      page.tsx                     # Full search page

    topics/
      page.tsx                     # Topic browser
      [topicSlug]/page.tsx         # Individual topic page

    bookmarks/
      page.tsx                     # Saved bookmarks & annotations

    history/
      page.tsx                     # Reading history

    sheets/
      page.tsx                     # Study sheets / collections
      [id]/page.tsx                # Individual study sheet

    assistant/
      page.tsx                     # Standalone AI research assistant

  api/
    torah/
      texts/[ref]/route.ts        # Get text by reference
      search/route.ts             # Hybrid search endpoint
      links/[ref]/route.ts        # Cross-references for a ref
      dictionary/[word]/route.ts  # Word lookup / morphology
      assistant/route.ts          # AI research assistant
      toc/[work]/route.ts         # Table of contents
      bookmarks/route.ts          # CRUD bookmarks
      annotations/route.ts        # CRUD annotations
      history/route.ts            # Reading history
      autocomplete/route.ts       # Reference autocomplete
```

---

## 3. Component Hierarchy (React Component Tree)

```
<TorahLayout>                              # Module-level layout
  <TorahNav>                               # Top nav bar
    <Breadcrumb />                         #   Category > Work > Section
    <ReferenceJumper />                    #   "Go to..." input (Berakhot 2a)
    <GlobalSearch trigger />               #   Search icon -> opens SearchModal
    <LayoutSwitcher />                     #   Toggle: Traditional | Modern | Research
    <ThemeToggle />                        #   Light/dark
    <UserMenu />                           #   Bookmarks, history, settings
  </TorahNav>

  <ReaderPage>                             # The main reader at /torah/read/[ref]
    <ReaderToolbar>                        #   Contextual toolbar
      <LanguageToggle />                   #     HE | EN | HE+EN
      <FontControls />                     #     Size, family
      <CommentarySelector />              #     Multi-select dropdown of commentaries
      <ViewModeToggle />                   #     Amud/Chapter/Continuous
      <AIButton />                         #     "Ask about this passage"
      <ShareButton />                      #     Export / share
      <PrintButton />                      #     Print-friendly
    </ReaderToolbar>

    {/* ─── Layout variants (only one renders) ─── */}

    <TraditionalLayout>                    # Talmud-page style
      <CommentaryColumn side="left">       #   Left commentary column
        <CommentaryBlock                   #     e.g., Rashi
          commentator="Rashi"
          segments={[...]}
          onHoverSegment={highlightMain}
        />
        <CommentaryBlock ... />            #     Additional left-side
      </CommentaryColumn>
      <MainTextColumn>                     #   Center: primary text
        <TextSegment                       #     Individual segment (verse, line)
          hebrew={...}
          english={...}
          segmentRef="Berakhot.2a.1"
          isActive={boolean}
          onWordClick={openDictionary}
          linkedCommentaries={[...]}
        />
        ...virtualized list of segments
      </MainTextColumn>
      <CommentaryColumn side="right">      #   Right commentary column
        <CommentaryBlock                   #     e.g., Tosafot
          commentator="Tosafot"
          segments={[...]}
          onHoverSegment={highlightMain}
        />
      </CommentaryColumn>
    </TraditionalLayout>

    <ModernLayout>                         # Clean single-column
      <MainTextPanel>                      #   Full-width text
        <TextSegment ... />
      </MainTextPanel>
      <ResourceSidebar>                    #   Slide-out right panel
        <SidebarTabs>                      #     Tabs for different content
          <Tab label="Commentary">
            <CommentaryList />
          </Tab>
          <Tab label="Cross-References">
            <CrossReferenceList />
          </Tab>
          <Tab label="Dictionary">
            <DictionaryPanel />
          </Tab>
          <Tab label="Notes">
            <NotesPanel />
          </Tab>
          <Tab label="AI">
            <AIAssistantPanel />
          </Tab>
        </SidebarTabs>
      </ResourceSidebar>
    </ModernLayout>

    <ResearchLayout>                       # Multi-pane workbench
      <PaneManager>                        #   Manages split panes
        <TextPane id={1}>                  #     Each pane is independent
          <PaneToolbar />                  #       Has its own ref selector
          <TextSegment ... />
        </TextPane>
        <TextPane id={2}>
          <PaneToolbar />
          <TextSegment ... />
        </TextPane>
        <AddPaneButton />                  #     "+" to add another pane
      </PaneManager>
      <ResearchSidebar>                    #   Shared sidebar
        <CrossReferenceGraph />            #     Visual link network
        <AIAssistantPanel />
        <NotesPanel />
      </ResearchSidebar>
    </ResearchLayout>

    {/* ─── Shared overlays & panels ─── */}

    <DictionaryPopover>                    # Floating word definition
      <WordHeader />                       #   Word + transliteration
      <MorphologyBreakdown />              #   Root, binyan, tense, person
      <DefinitionList />                   #   Meanings with sources
      <UsageFrequency />                   #   Bar chart across corpus
      <RelatedTerms />                     #   Linked synonyms/antonyms
    </DictionaryPopover>

    <CrossRefTooltip>                      # Hover preview for links
      <RefPreviewHeader />                 #   Source title + ref
      <RefPreviewText />                   #   First few lines
      <OpenInNewPaneButton />
    </CrossRefTooltip>

    <SearchModal>                          # Full search overlay
      <SearchInput />                      #   With mode tabs
      <SearchFilters>                      #   Work, commentary, date range
        <FilterByWork />
        <FilterByCommentary />
        <FilterByTopic />
        <SemanticToggle />                 #   Keyword vs Semantic vs Hybrid
      </SearchFilters>
      <SearchResults>                      #   Virtualized result list
        <SearchResultCard />
      </SearchResults>
    </SearchModal>

    <AIResearchPanel>                      # AI assistant (drawer or modal)
      <ModeSelector>                       #   Practical | Deep Analytic | Posek View
        <ModeButton mode="practical" />
        <ModeButton mode="analytic" />
        <ModeButton mode="posek" />
      </ModeSelector>
      <ConversationThread>
        <AIMessage />
        <UserMessage />
      </ConversationThread>
      <AIInput>
        <ContextBadge />                   #   Shows current passage context
        <TextArea />
        <SendButton />
      </AIInput>
    </AIResearchPanel>

    <NavigationDrawer>                     # Table of Contents
      <TOCTree>                            #   Collapsible tree
        <TOCNode />
      </TOCTree>
      <PrevNextButtons />                  #   Sequential navigation
    </NavigationDrawer>

    <AnnotationLayer>                      # User annotations overlay
      <Highlight />                        #   Colored highlight on text
      <MarginNote />                       #   Note indicator in margin
      <BookmarkIndicator />                #   Bookmark flag
    </AnnotationLayer>
  </ReaderPage>
</TorahLayout>
```

---

## 4. ASCII Wireframes

### Layout A: Traditional Talmud Layout

```
+==============================================================================+
|  [<] Berakhot > Chapter 1 > Daf 2a          [Go to...______] [Q] [|||] [::] |
|  [HE+EN] [Aa+] [Commentaries v] [Chapter v] [AI] [Share] [Print]            |
+==============================================================================+
|                    |                              |                           |
|   R A S H I        |     M A I N   T E X T       |   T O S A F O T          |
|   (Left Column)    |     (Center Column)          |   (Right Column)         |
|                    |                              |                           |
|  .---------------. | .------------------------. | .-----------------------.  |
|  | Rashi on 2a:1 | | |                        | | | Tosafot on 2a:1       |  |
|  | .............. | | |  [1] Hebrew text line  | | | ..................... |  |
|  | Commentary in  | | |       one here         | | | Commentary text here  |  |
|  | Hebrew with    |<--| [highlighted segment]  |-->| goes in this column   |  |
|  | smaller font   | | |                        | | | with connection lines |  |
|  | size than the  | | |  English translation   | | |                       |  |
|  | main text.     | | |  appears below or      | | '----------------------'  |
|  '---------------' | |  beside the Hebrew.     | |                           |
|                    | |                        | | .-----------------------.  |
|  .---------------. | '------------------------' | | Tosafot on 2a:2       |  |
|  | Rashi on 2a:2 | |                            | | ..................... |  |
|  | .............. | | .------------------------. | | More commentary...    |  |
|  | Next comment   | | |                        | | |                       |  |
|  | aligned with   |<--| [2] Next segment of    |-->|                       |  |
|  | its referent   | | |     the main text      | | '----------------------'  |
|  | in the main    | | |                        | |                           |
|  | text column.   | | |  English below...      | |                           |
|  '---------------' | |                        | |                           |
|                    | '------------------------' |                           |
|        [more...]   |       [more segments...]    |         [more...]         |
+--------------------+----------------------------+---------------------------+
|  [<< Prev: 1b]                                              [Next: 2b >>]   |
+==============================================================================+

Column widths: ~25% | ~50% | ~25%  (resizable via drag handles)
Commentary blocks VERTICALLY ALIGN with their referenced main text segment.
Dotted lines (<-- -->) show which commentary maps to which main text.
```

### Layout B: Modern Reader Layout

```
+==============================================================================+
|  [<] Berakhot > Chapter 1 > Daf 2a          [Go to...______] [Q] [|||] [::] |
|  [HE+EN] [Aa+] [Commentaries v] [Chapter v] [AI] [Share] [Print]            |
+==============================================================================+
|                                                  |                           |
|   M A I N   T E X T   A R E A                   | R E S O U R C E          |
|   (Full width minus sidebar)                     | S I D E B A R            |
|                                                  |                           |
|  .---------------------------------------------. | [Commentary|Refs|Dict|AI] |
|  |                                             | |                           |
|  | [1]  Hebrew text segment one                | | .-----------------------.  |
|  |      ....................................   | | | Rashi                 |  |
|  |      English translation of segment one     | | | ..................... |  |
|  |                                             | | | Commentary on the    |  |
|  |  [footnote 1] [footnote 2] [cross-ref]      | | | currently selected   |  |
|  |                                             | | | or hovered segment.  |  |
|  '---------------------------------------------' | '----------------------'  |
|                                                  |                           |
|  .---------------------------------------------. | .-----------------------.  |
|  |                                             | | | Tosafot               |  |
|  | [2]  Hebrew text segment two                | | | ..................... |  |
|  |      ....................................   | | | Corresponding Tosafot |  |
|  |      English translation                    | | | for this segment.    |  |
|  |                                             | | '----------------------'  |
|  |  [footnote 3] [cross-ref]                   | |                           |
|  |                                             | | .-----------------------.  |
|  '---------------------------------------------' | | Ramban                |  |
|                                                  | | ..................... |  |
|  .---------------------------------------------. | | Additional commentary |  |
|  | [3]  Next segment...                        | | '----------------------'  |
|  '---------------------------------------------' |                           |
|                                                  | [Show 3 more...]          |
|  [<< Prev: 1b]              [Next: 2b >>]       |                           |
+--------------------------------------------------+---------------------------+

Text area: ~65% | Sidebar: ~35%  (sidebar collapsible)
Clicking a segment highlights it and loads commentaries in sidebar.
Footnotes are inline blue-linked text.
```

### Layout C: Research Workbench Layout

```
+==============================================================================+
|  [<] Research Workbench                      [Go to...______] [Q] [|||] [::] |
|  [+ Add Pane] [Save Layout] [AI Assistant]                                   |
+==============================================================================+
|                              |                              |                |
| P A N E  1                   | P A N E  2                   | SIDEBAR       |
| [Berakhot 2a_____v] [HE+EN] | [Rashi on Berakhot 2a v][HE] |               |
|                              |                              | [Graph|AI|    |
| .---------------------------. | .---------------------------. |  Notes]      |
| |                           | | |                           | |              |
| | [1] Main Talmud text      | | | Rashi's commentary on    | | .----------. |
| |     in Hebrew with        | | | the passage, scrolling   | | |  Cross-  | |
| |     English below.        | | | in sync or independently | | |  Ref     | |
| |                           | | | with Pane 1.             | | |  Graph   | |
| | [2] Second segment        | | |                           | | |          | |
| |     continues here        | | | Next Rashi comment       | | | (node    | |
| |     with translation.     | | | aligned to segment 2.    | | |  diagram | |
| |                           | | |                           | | |  showing | |
| | [3] Third segment...      | | | Rashi on segment 3...    | | |  links)  | |
| |                           | | |                           | | |          | |
| |  [click word for defn]    | | |                           | | '----------' |
| |                           | | |                           | |              |
| '------- scroll -------- --' | '------- scroll -----------' | .----------. |
|                              |                              | | AI Chat  | |
|  [<< 1b]        [2b >>]     |                              | | ........ | |
+------------------------------+------------------------------+ | Ask about| |
|                              |                              | | passage  | |
| P A N E  3 (optional)       | P A N E  4 (optional)       | |          | |
| [Shulchan Arukh OC 1 v]     | [Mishneh Torah, Tefillah v] | '----------' |
| .---------------------------. | .---------------------------. |              |
| | Related halakhic text     | | | Parallel source for      | | .----------. |
| | displayed here            | | | comparison                | | |  Notes   | |
| '---------------------------' | '---------------------------' | '----------' |
+------------------------------+------------------------------+----------------+

Panes: 2-4 panes in a grid (user-configurable)
Sidebar: ~20% width, collapsible
Each pane has its own ref selector, language toggle, scroll.
Optional sync-scroll between panes.
```

### Mobile Layout (all modes collapse to this)

```
+================================+
| [=] Berakhot 2a    [Q] [...]  |
+================================+
|                                |
| [HE+EN] [Aa] [Commentary v]   |
|                                |
| .----------------------------. |
| |                            | |
| | [1] Hebrew text segment    | |
| |     ...................... | |
| |     English translation    | |
| |                            | |
| |  [2 commentaries] [3 refs] | |
| |                            | |
| '----------------------------' |
|                                |
| .----------------------------. |
| | [2] Next segment...        | |
| '----------------------------' |
|                                |
+================================+
| [Commentary] [Dict] [AI] [TOC]|
+================================+

Commentary count badges are tappable.
Tapping opens a bottom sheet with commentary list.
Bottom tab bar for quick access to panels.
Dictionary opens as bottom sheet on word tap.
AI assistant opens as full-screen drawer.
```

---

## 5. Data Requirements

### New PostgreSQL Tables

```sql
-- ════════════════════════════════════════════════════════
-- CORE TEXT STORAGE
-- ════════════════════════════════════════════════════════

-- Already exists (from your 4.5M chunks):
-- text_chunks: id, ref, hebrew, english, embedding (pgvector)

-- Additional columns needed on text_chunks:
ALTER TABLE text_chunks ADD COLUMN IF NOT EXISTS
  work_id         INTEGER REFERENCES works(id),
  section_ref     TEXT,          -- e.g., "Berakhot.2a"
  segment_index   INTEGER,       -- ordering within a section
  language        TEXT DEFAULT 'he',  -- 'he', 'en', 'ar' (Aramaic)
  version_title   TEXT,          -- e.g., "William Davidson", "Steinsaltz"
  has_vowels      BOOLEAN DEFAULT false,
  has_cantillation BOOLEAN DEFAULT false;

-- ════════════════════════════════════════════════════════
-- WORKS & STRUCTURE
-- ════════════════════════════════════════════════════════

CREATE TABLE works (
  id              SERIAL PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,     -- "berakhot", "rashi-on-berakhot"
  title_en        TEXT NOT NULL,
  title_he        TEXT NOT NULL,
  category        TEXT NOT NULL,            -- "Talmud", "Tanakh", "Midrash", etc.
  subcategory     TEXT,                     -- "Bavli", "Yerushalmi"
  author_en       TEXT,
  author_he       TEXT,
  era             TEXT,                     -- "Rishonim", "Achronim", "Tanaim"
  year_composed   INTEGER,
  description_en  TEXT,
  description_he  TEXT,
  structure       JSONB NOT NULL,           -- section depth info
  -- e.g., {"depth": 2, "sectionNames": ["Daf", "Line"],
  --        "addressTypes": ["Talmud", "Integer"]}
  is_commentary   BOOLEAN DEFAULT false,
  base_work_id    INTEGER REFERENCES works(id),  -- if commentary, what it comments on
  text_direction  TEXT DEFAULT 'rtl',       -- 'rtl' or 'ltr'
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE work_categories (
  id              SERIAL PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,
  name_en         TEXT NOT NULL,
  name_he         TEXT NOT NULL,
  parent_id       INTEGER REFERENCES work_categories(id),
  sort_order      INTEGER DEFAULT 0,
  icon            TEXT                      -- icon identifier
);

-- ════════════════════════════════════════════════════════
-- CROSS-REFERENCES & LINKS
-- ════════════════════════════════════════════════════════

CREATE TABLE text_links (
  id              SERIAL PRIMARY KEY,
  source_ref      TEXT NOT NULL,            -- "Berakhot.2a.5"
  target_ref      TEXT NOT NULL,            -- "Genesis.1.1"
  link_type       TEXT NOT NULL,            -- "commentary", "quotation", "reference",
                                            -- "parallel", "allusion", "ein_mishpat"
  source_work_id  INTEGER REFERENCES works(id),
  target_work_id  INTEGER REFERENCES works(id),
  confidence      REAL DEFAULT 1.0,         -- AI-detected links may have < 1.0
  created_by      TEXT DEFAULT 'import',    -- "import", "ai", "user"
  metadata        JSONB,                    -- additional context
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_links_source ON text_links(source_ref);
CREATE INDEX idx_links_target ON text_links(target_ref);
CREATE INDEX idx_links_type   ON text_links(link_type);

-- ════════════════════════════════════════════════════════
-- DICTIONARY & MORPHOLOGY
-- ════════════════════════════════════════════════════════

CREATE TABLE dictionary_entries (
  id              SERIAL PRIMARY KEY,
  word            TEXT NOT NULL,            -- exact form
  root            TEXT,                     -- shoresh (3-letter root)
  language        TEXT NOT NULL,            -- 'he', 'ar' (Aramaic)
  part_of_speech  TEXT,                     -- "verb", "noun", "adjective"
  binyan          TEXT,                     -- for verbs: "pa'al", "nif'al", etc.
  definition_en   TEXT NOT NULL,
  definition_he   TEXT,
  transliteration TEXT,
  gender          TEXT,                     -- "masculine", "feminine"
  number          TEXT,                     -- "singular", "plural"
  tense           TEXT,                     -- for verbs
  person          TEXT,                     -- "1st", "2nd", "3rd"
  source          TEXT,                     -- "jastrow", "bdb", "klein"
  related_entries INTEGER[],               -- links to related dictionary entries
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_dict_word ON dictionary_entries(word);
CREATE INDEX idx_dict_root ON dictionary_entries(root);

CREATE TABLE word_occurrences (
  id              SERIAL PRIMARY KEY,
  dictionary_id   INTEGER REFERENCES dictionary_entries(id),
  text_ref        TEXT NOT NULL,
  work_id         INTEGER REFERENCES works(id),
  position        INTEGER                  -- word position in segment
);

CREATE INDEX idx_occur_dict ON word_occurrences(dictionary_id);
CREATE INDEX idx_occur_ref  ON word_occurrences(text_ref);

-- ════════════════════════════════════════════════════════
-- USER DATA
-- ════════════════════════════════════════════════════════

CREATE TABLE bookmarks (
  id              SERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL,
  text_ref        TEXT NOT NULL,
  work_id         INTEGER REFERENCES works(id),
  label           TEXT,
  color           TEXT DEFAULT 'gold',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE annotations (
  id              SERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL,
  text_ref        TEXT NOT NULL,
  work_id         INTEGER REFERENCES works(id),
  type            TEXT NOT NULL,            -- "highlight", "note", "tag"
  content         TEXT,                     -- note text or tag name
  color           TEXT DEFAULT 'gold',
  start_offset    INTEGER,                  -- character offset within segment
  end_offset      INTEGER,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reading_history (
  id              SERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL,
  text_ref        TEXT NOT NULL,
  work_id         INTEGER REFERENCES works(id),
  duration_sec    INTEGER,                  -- time spent on this ref
  visited_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE study_progress (
  id              SERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL,
  work_id         INTEGER REFERENCES works(id),
  last_ref        TEXT NOT NULL,            -- where they left off
  completion_pct  REAL DEFAULT 0,
  total_segments  INTEGER,
  read_segments   INTEGER DEFAULT 0,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════
-- TOPICS & TAGS
-- ════════════════════════════════════════════════════════

CREATE TABLE topics (
  id              SERIAL PRIMARY KEY,
  slug            TEXT UNIQUE NOT NULL,
  name_en         TEXT NOT NULL,
  name_he         TEXT NOT NULL,
  description_en  TEXT,
  description_he  TEXT,
  parent_id       INTEGER REFERENCES topics(id),
  embedding       vector(1536)              -- for semantic topic matching
);

CREATE TABLE topic_links (
  id              SERIAL PRIMARY KEY,
  topic_id        INTEGER REFERENCES topics(id),
  text_ref        TEXT NOT NULL,
  relevance       REAL DEFAULT 1.0
);

-- ════════════════════════════════════════════════════════
-- AI RESEARCH SESSIONS
-- ════════════════════════════════════════════════════════

CREATE TABLE research_sessions (
  id              SERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL,
  mode            TEXT NOT NULL,            -- "practical", "analytic", "posek"
  context_ref     TEXT,                     -- passage being studied
  title           TEXT,
  messages        JSONB NOT NULL DEFAULT '[]',
  sources_cited   TEXT[],                   -- refs mentioned in AI responses
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ════════════════════════════════════════════════════════
-- STUDY SHEETS (user-curated collections)
-- ════════════════════════════════════════════════════════

CREATE TABLE study_sheets (
  id              SERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  is_public       BOOLEAN DEFAULT false,
  items           JSONB NOT NULL DEFAULT '[]',
  -- items: [{type: "text", ref: "...", comment: "..."},
  --         {type: "note", content: "..."}]
  tags            TEXT[],
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

### Indexes for Performance

```sql
-- Full-text search on Hebrew/English
CREATE INDEX idx_chunks_fts_he ON text_chunks
  USING GIN (to_tsvector('simple', hebrew));
CREATE INDEX idx_chunks_fts_en ON text_chunks
  USING GIN (to_tsvector('english', english));

-- Vector similarity search (already exists, confirm index type)
CREATE INDEX idx_chunks_embedding ON text_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 1000);

-- Composite for reader queries
CREATE INDEX idx_chunks_work_section ON text_chunks(work_id, section_ref, segment_index);
```

---

## 6. Detailed Component Specifications

### 6.1 TextSegment Component

The atomic unit of the reader. Each segment represents one logical unit of text (a verse, a Talmud line, a Mishnah clause).

```
Props:
  segmentRef:  string          -- "Berakhot.2a.3"
  hebrew:      string          -- Hebrew/Aramaic source text
  english:     string          -- English translation
  language:    "he" | "en" | "both"
  isActive:    boolean         -- currently selected/focused
  highlights:  Highlight[]     -- user annotations
  linkCount:   number          -- number of cross-references
  commentaryCount: number      -- number of commentaries
  onWordClick: (word, position, lang) => void
  onSegmentClick: (ref) => void
  onSegmentHover: (ref) => void

Behavior:
  - Hebrew text renders RTL with dir="rtl" and lang="he"
  - English renders LTR below or beside (based on language prop)
  - Each word is wrapped in <span> for click-to-define
  - Active segment gets a left/right gold border highlight
  - Commentary count shows as a small badge: [R] [T] [Ra] etc.
  - Cross-ref links render as gold-colored text with dotted underline
  - Hover on cross-ref shows CrossRefTooltip
```

### 6.2 CommentaryBlock Component

Displays one commentator's text in the Traditional Layout margins.

```
Props:
  commentator:    string       -- "Rashi", "Tosafot", etc.
  commentatorHe:  string       -- Hebrew name
  segments:       CommentarySegment[]
  anchorRefs:     string[]     -- which main text segments this maps to
  isCollapsed:    boolean
  onToggle:       () => void
  onHoverSegment: (ref) => void

Behavior:
  - Header bar with commentator name (HE primary, EN secondary)
  - Collapse/expand toggle (chevron icon)
  - Each sub-segment vertically aligns with its anchor in the main column
  - On hover, corresponding main text segment highlights with a colored border
  - Font is 85% of main text size (traditional sizing hierarchy)
  - Scroll independently within the column
```

### 6.3 DictionaryPopover Component

Floating panel triggered by clicking any word.

```
Props:
  word:        string
  position:    { x, y }       -- anchor position
  language:    "he" | "ar"

Sections:
  1. Header: word in large font + transliteration + audio pronunciation
  2. Root: 3-letter root displayed with root-letter highlighting
  3. Morphology: binyan, tense, person, gender, number (table format)
  4. Definitions: numbered list with source attribution (Jastrow, BDB)
  5. Frequency: "Appears 347 times across corpus"
     - mini bar chart: Tanakh(120), Talmud(180), Midrash(47)
  6. Related: clickable chips for synonyms, antonyms, derived forms

Behavior:
  - Appears as floating card anchored to clicked word
  - Closes on click outside or Escape
  - Can be "pinned" to sidebar by clicking pin icon
  - Loading state shows skeleton while fetching
```

### 6.4 AI Research Assistant Panel

```
Props:
  contextRef:  string | null   -- current passage being studied
  mode:        "practical" | "analytic" | "posek"

Modes:
  Practical:  "How does this apply today?" -- focuses on modern application
  Analytic:   "Trace this concept through sources" -- academic deep-dive
  Posek View: "What do the poskim say?" -- halakhic ruling perspective

Quick Actions (contextual buttons):
  - "Explain this passage"
  - "Compare opinions on this topic"
  - "What are the practical implications?"
  - "Trace this concept to its source"
  - "Find contradicting opinions"
  - "Summarize the sugya"

Behavior:
  - Context badge shows current ref: [Berakhot 2a:3]
  - AI responses include inline citations rendered as clickable refs
  - Clicking a citation in AI response navigates reader to that ref
  - Sources panel shows all refs cited in the conversation
  - Can save entire conversation as a study sheet
```

---

## 7. Technology Recommendations

### Core Libraries

| Library | Purpose | Why |
|---------|---------|-----|
| `@tanstack/react-virtual` | Virtualized scrolling | 4.5M segments need windowed rendering; headless, 15kb |
| `react-resizable-panels` | Resizable pane layouts | For Traditional layout columns and Research workbench |
| `@floating-ui/react` | Popovers & tooltips | Dictionary popover, cross-ref tooltips, positioned precisely |
| `cmdk` | Command palette | "Go to reference" jumper (Cmd+K style) |
| `zustand` | State management | Reader state (current ref, layout, language, active commentaries) |
| `react-hotkeys-hook` | Keyboard shortcuts | Navigation, search, layout switching |
| `@internationalized/date` | RTL-aware date formatting | Calendar integration |

### Text & RTL

| Library | Purpose | Why |
|---------|---------|-----|
| CSS `dir="rtl"` + logical properties | Bidirectional layout | Native browser support, no library needed |
| `Intl.Segmenter` | Word segmentation | Click-to-define needs word boundaries in Hebrew/Aramaic |
| Custom `<BidiText>` wrapper | Mixed-direction segments | Isolate RTL/LTR runs using `<bdi>` elements |

### Typography

| Font | Usage |
|------|-------|
| **Frank Ruhl Libre** (Google Fonts) | Hebrew body text -- clear serif, designed for readability |
| **SBL Hebrew** (fallback) | Academic Hebrew -- excellent for pointed text with cantillation |
| **Noto Serif Hebrew** (fallback) | Full Unicode coverage for Hebrew |
| **Source Serif 4** | English body text -- pairs well with Hebrew serif |
| **Inter** | UI elements, buttons, labels (already in your design system) |

### Search & AI

| Technology | Purpose |
|------------|---------|
| `pgvector` | Semantic similarity search (already in stack) |
| `pg_trgm` | Fuzzy keyword matching for Hebrew typo tolerance |
| OpenAI / Claude API | AI research assistant (already in stack) |
| Debounced search input | Autocomplete with 200ms debounce |

### Performance

| Strategy | Application |
|----------|-------------|
| React Server Components | Initial page load: TOC, work metadata, first segments |
| Streaming | AI responses stream token-by-token |
| `@tanstack/react-virtual` | Only render visible segments (viewport + 5 overscan) |
| `Suspense` boundaries | Commentary sidebar loads independently |
| `IntersectionObserver` | Reading progress tracking, lazy-load commentary |
| Service Worker | Offline caching for recently viewed texts |
| `next/dynamic` | Lazy-load AI panel, research layout, graph viz |

---

## 8. Design System Extensions

### New Color Tokens (Torah Module)

```css
/* Extend the existing navy/gold theme */
@theme {
  /* Parchment tones for text backgrounds */
  --color-parchment-50:  #fefcf5;
  --color-parchment-100: #fdf8e8;
  --color-parchment-200: #f9efc8;

  /* Commentary accent colors */
  --color-rashi:    #b8860b;    /* dark goldenrod */
  --color-tosafot:  #4a7c59;    /* forest green */
  --color-ramban:   #6b4c8a;    /* royal purple */
  --color-rambam:   #2e5fa1;    /* deep blue */
  --color-rashbam:  #a0522d;    /* sienna */
  --color-meiri:    #4a8b8b;    /* teal */

  /* Link colors */
  --color-ref-link: var(--color-gold-400);
  --color-ref-hover: var(--color-gold-300);

  /* Active segment indicator */
  --color-active-segment: var(--color-gold-500);
}
```

### Typography Scale for Reader

```css
.reader-main-text-he   { font-size: 1.25rem; line-height: 2.0; font-family: 'Frank Ruhl Libre', serif; }
.reader-main-text-en   { font-size: 1.0rem;  line-height: 1.75; font-family: 'Source Serif 4', serif; }
.reader-commentary-he  { font-size: 1.0rem;  line-height: 1.8;  font-family: 'Frank Ruhl Libre', serif; }
.reader-commentary-en  { font-size: 0.9rem;  line-height: 1.6;  font-family: 'Source Serif 4', serif; }
.reader-dictionary     { font-size: 0.85rem; line-height: 1.5; }
.reader-footnote       { font-size: 0.8rem;  line-height: 1.4; }
```

---

## 9. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open reference jumper ("Go to...") |
| `Cmd/Ctrl + F` | Search within current work |
| `Cmd/Ctrl + Shift + F` | Global search |
| `Cmd/Ctrl + B` | Toggle bookmark on current segment |
| `Cmd/Ctrl + /` | Open AI assistant |
| `1`, `2`, `3` | Switch layout (Traditional, Modern, Research) |
| `H` | Toggle Hebrew only |
| `E` | Toggle English only |
| `B` | Toggle both languages |
| `[` / `]` | Previous / Next section |
| `T` | Toggle Table of Contents |
| `C` | Toggle commentary sidebar |
| `Escape` | Close any open panel/popover |
| `N` | Add note on selected text |
| `D` | Open dictionary for selected word |

---

## 10. Mobile Adaptation Strategy

### What Adapts

| Feature | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Traditional Layout | 3-column | 2-column (main + 1 commentary) | Single column + bottom sheet |
| Modern Layout | Text + sidebar | Text + collapsible sidebar | Text + bottom sheet |
| Research Layout | Multi-pane | 2 panes | Not available (redirect to Modern) |
| Dictionary | Floating popover | Floating popover | Bottom sheet |
| AI Assistant | Side drawer | Side drawer | Full-screen drawer |
| TOC | Left drawer | Left drawer | Full-screen drawer |
| Commentary | Margin columns | Sidebar | Bottom sheet with swipe tabs |
| Search | Modal overlay | Modal overlay | Full-screen page |
| Cross-ref tooltip | Hover tooltip | Long-press tooltip | Tap -> bottom sheet |

### Mobile-Specific Features
- **Swipe navigation**: Swipe left/right for prev/next section
- **Bottom tab bar**: Commentary | Dictionary | AI | TOC
- **Pull-to-refresh**: Sync bookmarks/annotations
- **Share sheet integration**: Native OS share for passages
- **Offline mode**: Service worker caches recent texts

### Breakpoints
```
Mobile:  < 640px   -- single column, bottom sheets
Tablet:  640-1024px -- two columns, collapsible sidebar
Desktop: > 1024px  -- full layout options
```

---

## 11. Priority Ranking -- Build Order

### Phase 1: Core Reader (Weeks 1-3)
Must-have for MVP. This is the foundation everything else builds on.

1. **Works & Text API** -- `/api/torah/texts/[ref]` serving text segments
2. **Modern Layout** (single column + sidebar) -- simplest to build, most universally useful
3. **TextSegment component** -- Hebrew/English rendering with RTL/LTR
4. **Navigation** -- breadcrumb, TOC drawer, prev/next, reference jumper (Cmd+K)
5. **Language toggle** -- HE / EN / HE+EN
6. **Font controls** -- size adjustment
7. **Virtualized scrolling** -- TanStack Virtual for segment list

### Phase 2: Commentary & Links (Weeks 4-5)
What makes it a *study* tool rather than just a reader.

8. **Commentary sidebar** (Modern Layout) -- load commentaries for active segment
9. **CommentarySelector** -- multi-select which commentators to show
10. **Cross-reference links** -- inline gold links with CrossRefTooltip on hover
11. **"Referenced by" panel** -- what other texts cite this passage
12. **Search integration** -- hybrid search page with filters

### Phase 3: Dictionary & Intelligence (Weeks 6-7)
The differentiators that make this "2.0."

13. **DictionaryPopover** -- click any word for definition/morphology
14. **AI Research Assistant** -- 3 modes, contextual queries, inline citations
15. **Topic browser** -- explore by topic with semantic matching

### Phase 4: Traditional Layout (Weeks 8-9)
The signature layout that mirrors a physical Talmud page.

16. **Traditional 3-column layout** -- main text centered, commentaries on margins
17. **Vertical alignment engine** -- commentary blocks align with their anchor segments
18. **Resizable columns** -- drag handles between columns
19. **Commentary connection indicators** -- visual lines showing what maps to what

### Phase 5: User Features (Weeks 10-11)
Personalization and retention.

20. **Bookmarks & highlights** -- save, color-code, label
21. **Annotations / notes** -- margin notes attached to segments
22. **Reading history** -- recently viewed, time tracking
23. **Study progress** -- completion percentage per work
24. **Study sheets** -- curate collections of passages with notes

### Phase 6: Research Workbench (Weeks 12-13)
Power-user features for serious scholars.

25. **Research multi-pane layout** -- 2-4 independent text panes
26. **Sync-scroll option** -- lock two panes together
27. **Cross-reference graph** -- visual node diagram of connections
28. **Source chain visualization** -- "Trace this concept" renders as a timeline

### Phase 7: Polish & Mobile (Weeks 14-16)
Production readiness.

29. **Mobile bottom sheet system** -- commentary, dictionary, AI as sheets
30. **Offline caching** -- service worker for recently viewed texts
31. **Print-friendly view** -- clean CSS for printing passages
32. **Share/export** -- generate shareable links, export to PDF
33. **Performance optimization** -- prefetching, caching, bundle analysis
34. **Accessibility audit** -- screen reader support, ARIA labels, focus management

---

## 12. Key Architectural Decisions

### 1. Reference System
Use Sefaria-compatible ref strings (`"Berakhot.2a.3"`) as the universal identifier. This makes it possible to:
- Deep-link to any passage: `/torah/read/Berakhot.2a.3`
- Share refs across API calls, bookmarks, links, and AI responses
- Potentially integrate with Sefaria's API as a data fallback

### 2. State Management
Use **Zustand** with slices:

```typescript
interface ReaderStore {
  // Navigation
  currentRef: string;
  currentWork: Work;

  // Display
  layout: 'traditional' | 'modern' | 'research';
  language: 'he' | 'en' | 'both';
  fontSize: number;
  activeCommentaries: string[];

  // Interaction
  activeSegment: string | null;
  selectedWord: { word: string; position: DOMRect; lang: string } | null;

  // Panels
  sidebarOpen: boolean;
  sidebarTab: 'commentary' | 'refs' | 'dictionary' | 'notes' | 'ai';
  tocOpen: boolean;
  aiPanelOpen: boolean;

  // Actions
  navigateTo: (ref: string) => void;
  setActiveSegment: (ref: string | null) => void;
  toggleCommentary: (name: string) => void;
  // ...
}
```

### 3. Data Fetching Pattern
- **React Server Components** for initial page load (work metadata, TOC, first batch of segments)
- **Client-side fetch** for commentary (loaded on segment click/hover)
- **SWR / React Query** for dictionary lookups (cached aggressively -- word definitions rarely change)
- **Streaming** for AI responses
- **Prefetch** next section when user is near the bottom (IntersectionObserver)

### 4. Commentary Alignment Algorithm (Traditional Layout)
The key technical challenge is vertically aligning commentary blocks with their anchor segments in the main text:

```
Algorithm:
1. Render main text segments, measure each segment's offsetTop + height
2. For each commentary block, find its anchor segment(s) in the main text
3. Position commentary block so its top aligns with anchor segment's top
4. If two commentary blocks would overlap, push the lower one down
5. If commentary is taller than the gap to the next anchor, allow overflow
   with a subtle gradient fade
6. Recalculate on: window resize, font size change, scroll
```

This is similar to how traditional Talmud page typesetters work -- Rashi and Tosafot are positioned to align with the Gemara text they reference.

### 5. RTL Architecture
- `<html lang="he" dir="rtl">` for the Torah module (swap from main app's LTR)
- Use CSS logical properties everywhere (`margin-inline-start` not `margin-left`)
- `<bdi>` elements to isolate English text within Hebrew contexts
- Flexbox `direction: rtl` for the Traditional Layout (Rashi on the "start" side = right in RTL)
- The Modern Layout sidebar stays on the `inline-end` side (left in RTL, right in LTR)

---

## 13. Integration with Existing Dashboard

The Torah reader module lives under `/torah/*` and shares:
- **ThemeProvider** -- the same dark navy/gold theme with parchment extensions
- **Auth system** -- same NextAuth session for bookmarks/annotations
- **AI infrastructure** -- same LLM provider, extended with Torah-specific system prompts
- **Sidebar navigation** -- new "Torah Study" item in the main dashboard sidebar

The module is architecturally independent and could be extracted into a standalone app later.

---

## Sources

- [Sefaria Developer Portal](https://developers.sefaria.org/)
- [Sefaria GitHub - New Interfaces for Jewish Texts](https://github.com/Sefaria/Sefaria-Project)
- [Sefaria Resource Panel Guide](https://help.sefaria.org/hc/en-us/articles/18472472138652-Quick-Guide-Meet-the-Sefaria-Library-Resource-Panel)
- [William Davidson Talmud on Sefaria](https://www.sefaria.org/william-davidson-talmud)
- [Bar-Ilan Responsa Project](https://www.biu.ac.il/en/about-bar-ilan/jewish-heritage/responsa-project)
- [AlHaTorah.org User Guide](https://alhatorah.org/About:User_Guide)
- [Torah Access Reimagined: AlHaTorah.org -- Jewish Action](https://jewishaction.com/books/reviews/torah-access-reimagined-al-hatorah-org/)
- [Otzaria on GitHub](https://github.com/Sivan22/otzaria)
- [ArtScroll Digital Library Features](https://blog.artscroll.com/2014/09/23/the-newly-expanded-artscroll-digital-library-exciting-new-features/)
- [Logos Bible Software Word Study Guide](https://www.logos.com/features/bible-word-study-guide)
- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [RTL in React: The Developer's Guide](https://leancode.co/blog/right-to-left-in-react)
