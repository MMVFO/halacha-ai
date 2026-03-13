# Halacha AI: Master Features Roadmap

**Project:** Talmud 2.0 — The Ultimate Torah & Jewish Studies Platform
**Version:** 0.2.0 (pre-alpha)
**Last Updated:** March 2, 2026

---

## Current Status

| Metric | Value |
|--------|-------|
| Total chunks ingested | 4,605,541 |
| Total works (unique entries) | 8,038 |
| Database size | ~10 GB |
| Sources | Sefaria-Export (4.09M), Otzaria (463K+) |
| Chunks with embeddings | ~1.1M / 4.6M (embedding in progress via 6× RTX 4090 GPUs) |
| Embedding model | BAAI/bge-m3 (1024-dim, float16, multilingual) |
| Corpus completeness | ~35-40% |
| Reader UI | **Live** — Library + TOC + Reader with cross-refs |
| Research UI | **Live** — RAG search + LLM (Claude Sonnet 4) |
| Search | Hybrid semantic + keyword, working (sequential scan, HNSW pending) |
| AI Assistant | Working via Anthropic API (Claude Sonnet 4) |
| Infrastructure | PostgreSQL + pgvector, TEI on Vast.ai, Redis |

**Last Updated:** March 2, 2026

---

## PHASE 0: Infrastructure ✅ MOSTLY COMPLETE

### 0.1 Embedding Pipeline
- [x] Set up Vast.ai GPU rental (6× RTX 4090, TEI server)
- [x] Drop HNSW index before bulk embed
- [x] Multi-GPU bulk embedder (`embed-bulk.ts` with round-robin load balancing)
- [ ] **IN PROGRESS**: Embedding 4.6M chunks (~660 chunks/s, ETA ~1.5h)
- [ ] Rebuild HNSW index after completion
- [ ] Verify semantic search returns relevant results across all categories
- [ ] Destroy Vast.ai GPU instances when done

### 0.2 LLM Integration ✅
- [x] Anthropic API key configured (Claude Sonnet 4)
- [x] Multi-provider LLM support (Anthropic + OpenAI)
- [x] Full query pipeline working: question → embed → search → LLM → answer
- [x] Graceful error handling for billing/quota issues

### 0.3 Sefaria Links Import
- [ ] Parse Sefaria-Export `links/` directory (~420K text-to-text links)
- [ ] Create `text_links` table (source_ref, target_ref, link_type)
- [ ] Ingest all links with types: commentary, quotation, reference, parallel, allusion
- [ ] Index for fast lookup by source_ref and target_ref

---

## PHASE 1: Core Reader (PARTIALLY COMPLETE)

### 1.1 Data Layer
- [x] Works derived from chunks table (work, language, community, corpus_tier, author, era)
- [x] Build `/api/reader/works` — list works with search, pagination, total count
- [x] Build `/api/reader/works?work=X` — table of contents for a work
- [x] Build `/api/reader/text?work=X&section=Y` — serve text segments
- [ ] Create dedicated `works` table (slug, title_he, title_en, category, subcategory, structure)
- [ ] Create `work_categories` table (hierarchical category tree)
- [ ] Build `/api/torah/autocomplete` — reference autocomplete

### 1.2 Browse Page (`/reader`) ✅ LIVE
- [x] Library home page with paginated work cards (8,038 works)
- [x] Search bar with debounced filtering
- [x] Language filter (Hebrew, English, Aramaic)
- [x] Tier color coding (canonical, apocrypha, pseudepigrapha, academic)
- [x] "Load more" pagination with total count
- [ ] Category grid navigation
- [ ] Alphabetical / Era sorting options

### 1.3 Modern Reader Layout (`/reader`) ✅ LIVE
- [x] Text rendering with Hebrew RTL + English LTR support
- [x] Breadcrumb navigation (Library > Work > Section)
- [x] Table of Contents with grouped sections
- [x] Side panel with work metadata
- [x] Cross-reference tooltips (click section to see other texts citing it)
- [x] "Load more" pagination within texts
- [ ] Language toggle: HE / EN / HE+EN
- [ ] Font size controls
- [ ] Virtualized scrolling via `@tanstack/react-virtual`
- [ ] Previous / Next section navigation
- [ ] Reference jumper command palette (Cmd+K via `cmdk`)

### 1.4 Dependencies to Install
- [ ] `@tanstack/react-virtual` — virtualized lists
- [ ] `react-resizable-panels` — resizable pane layouts
- [ ] `@floating-ui/react` — popovers and tooltips
- [ ] `cmdk` — command palette
- [ ] `zustand` — state management
- [ ] `react-hotkeys-hook` — keyboard shortcuts
- [ ] Frank Ruhl Libre + Source Serif 4 fonts

---

## PHASE 2: Commentary & Cross-References (Weeks 4-5)

### 2.1 Commentary Sidebar
- [ ] Load commentaries for active/hovered segment
- [ ] `CommentarySelector` — multi-select which commentators to show
- [ ] `CommentaryBlock` component — header + collapsible text
- [ ] Highlight which main text segment each commentary references
- [ ] Font hierarchy: commentary at 85% of main text size

### 2.2 Cross-Reference System
- [ ] Inline footnote indicators (gold links with dotted underline)
- [ ] `CrossRefTooltip` — hover preview showing referenced text
- [ ] "Referenced by" panel — what other texts cite this passage
- [ ] Click-through navigation to referenced texts

### 2.3 Search Integration
- [ ] Full search page at `/torah/search`
- [ ] Hybrid search (semantic + keyword) with existing pipeline
- [ ] Filter by: work, category, commentary, era, community
- [ ] "Find similar passages" from highlighted text
- [ ] Search within current work

---

## PHASE 3: Dictionary & AI Intelligence (Weeks 6-7)

### 3.1 Dictionary Popover
- [ ] Click any Hebrew/Aramaic word for instant definition
- [ ] `DictionaryPopover` component with Floating UI
- [ ] Integrate Jastrow dictionary (public domain)
- [ ] Morphological breakdown: root (shoresh), binyan, tense, person, gender, number
- [ ] Word frequency across corpus (mini bar chart)
- [ ] Related terms (synonyms, derived forms)
- [ ] Pin to sidebar option

### 3.2 Dictionary Data
- [ ] Create `dictionary_entries` table
- [ ] Create `word_occurrences` table
- [ ] Ingest Jastrow dictionary (Aramaic-English, public domain)
- [ ] Ingest Arukh dictionary (R. Natan of Rome, public domain)
- [ ] Build `/api/torah/dictionary/[word]` endpoint

### 3.3 AI Research Assistant
- [ ] `AIResearchPanel` component (drawer or modal)
- [ ] Three modes: Practical, Deep Analytic, Posek View (prompts already built)
- [ ] "Ask about this passage" — contextual AI queries
- [ ] Inline citations in AI responses (clickable refs that navigate reader)
- [ ] Quick action buttons: "Explain", "Compare opinions", "Trace concept"
- [ ] Save conversation as study sheet

### 3.4 Topic Browser
- [ ] Create `topics` table with embeddings
- [ ] Create `topic_links` table
- [ ] Topic browse page at `/torah/topics`
- [ ] Semantic topic matching from search queries

---

## PHASE 4: Traditional Talmud Layout (Weeks 8-9)

### 4.1 Three-Column Layout
- [ ] `TraditionalLayout` — 25% / 50% / 25% columns
- [ ] Rashi on left (start), main text center, Tosafot on right (end)
- [ ] Resizable columns via drag handles
- [ ] RTL-aware (Rashi on right in RTL, Tosafot on left)

### 4.2 Vertical Alignment Engine
- [ ] Measure main text segment positions (offsetTop + height)
- [ ] Position commentary blocks to align with their anchor segments
- [ ] Push-down algorithm when commentary blocks overlap
- [ ] Gradient fade for oversized commentary blocks
- [ ] Recalculate on resize / font change / scroll

### 4.3 Commentary Connections
- [ ] Visual indicators showing which commentary maps to which text
- [ ] Hover on commentary highlights anchor segment (gold border)
- [ ] Hover on main text highlights associated commentaries

---

## PHASE 5: User Features (Weeks 10-11)

### 5.1 Bookmarks & Highlights
- [ ] Create `bookmarks` table
- [ ] Create `annotations` table (highlights, notes, tags)
- [ ] Bookmark any segment with optional label + color
- [ ] Highlight text with color coding
- [ ] Bookmarks page at `/torah/bookmarks`

### 5.2 Annotations & Notes
- [ ] Margin note indicators
- [ ] Expandable note editor attached to segments
- [ ] Tag system for organizing annotations

### 5.3 Reading History & Progress
- [ ] Create `reading_history` table
- [ ] Create `study_progress` table
- [ ] Track time spent per section
- [ ] Completion percentage per work
- [ ] History page at `/torah/history`
- [ ] "Continue where you left off" quick link

### 5.4 Study Sheets
- [ ] Create `study_sheets` table
- [ ] Curate collections of passages with notes
- [ ] Public/private toggle
- [ ] Share via URL
- [ ] Study sheets page at `/torah/sheets`

---

## PHASE 6: Research Workbench (Weeks 12-13)

### 6.1 Multi-Pane Layout
- [ ] `ResearchLayout` — 2-4 independent text panes in configurable grid
- [ ] Each pane has its own reference selector, language toggle, scroll
- [ ] "+" button to add panes
- [ ] Save/restore layout configurations

### 6.2 Sync-Scroll
- [ ] Lock two panes together (e.g., Bavli + commentary)
- [ ] Optional independent scrolling per pane

### 6.3 Cross-Reference Graph
- [ ] Visual node diagram of connections between texts
- [ ] "Trace this concept" renders as a timeline
- [ ] Interactive: click nodes to navigate

### 6.4 AI Research Sessions
- [ ] Create `research_sessions` table
- [ ] Multi-turn conversations with context
- [ ] Session history and search

---

## PHASE 7: Polish & Mobile (Weeks 14-16)

### 7.1 Mobile Optimization
- [ ] Bottom sheet system for commentary, dictionary, AI
- [ ] Swipe left/right for prev/next section
- [ ] Bottom tab bar: Commentary | Dictionary | AI | TOC
- [ ] Responsive breakpoints: mobile (<640px), tablet (640-1024px), desktop (>1024px)

### 7.2 Offline & Performance
- [ ] Service worker for recently viewed texts
- [ ] Prefetch next section (IntersectionObserver)
- [ ] React Server Components for initial page load
- [ ] Bundle analysis and code splitting
- [ ] Lazy-load AI panel, research layout, graph viz via `next/dynamic`

### 7.3 Export & Print
- [ ] Print-friendly CSS view
- [ ] Export to PDF
- [ ] Share specific passages via URL
- [ ] Native share sheet integration (mobile)

### 7.4 Accessibility
- [ ] Screen reader support (ARIA labels)
- [ ] Focus management for keyboard navigation
- [ ] High contrast mode
- [ ] Reduced motion support

---

## NEW FEATURE IDEAS (User Requested)

### N1. Tzadik / Posek Profiles
Look up famous rabbis, poseks, tzadikim, and saints. Each profile shows:
- [ ] Create `rabbis` table (name_he, name_en, era, generation, community, birth_year, death_year, location, bio)
- [ ] Create `rabbi_works` join table (rabbi_id, work_name) — books they authored
- [ ] Create `rabbi_mentions` table (rabbi_id, chunk_id) — passages that mention them
- [ ] Auto-populate from existing corpus metadata (author field in chunks)
- [ ] Profile page at `/tzadikim/[name]` with bio, works list, mention count
- [ ] Browse page at `/tzadikim` with search, filter by era/community
- [ ] "What did [rabbi] say about [topic]?" — AI-powered queries scoped to a rabbi's works
- [ ] Teacher-student relationship graph (network visualization)
- [ ] Geographic mapping (born in X, lived in Y, died in Z)
- [ ] Timeline view showing rabbis across Jewish history
- Example profiles: Baba Yehuda, Reuven Wizman, Rambam, Rashi, Baal Shem Tov, etc.

### N2. Internationalization (i18n)
- [ ] English/Hebrew language selector in header
- [ ] UI string translations (all labels, buttons, placeholders)
- [ ] Auto-detect browser language preference
- [ ] RTL layout switching for Hebrew UI mode
- [ ] Persist preference in localStorage
- [ ] Consider: Arabic, French, Yiddish UI translations

### N3. Corpus Tracking Dashboard
- [ ] Library inventory: what we have vs. what we need
- [ ] Cross-reference against Otzar HaChochmah catalog (156K+ books in tora.pdf)
- [ ] Coverage percentage by category (Tanakh, Mishnah, Talmud, Rishonim, etc.)
- [ ] Gap analysis: most-needed missing texts
- [ ] Source attribution (Sefaria, Otzaria, HebrewBooks, etc.)
- [ ] Dashboard at `/admin/corpus` showing stats and gaps

### N4. Historical Accuracy Analysis & Error Detection
Leverage the massive cross-referenced corpus to identify cases where historical rabbinical commentary may have been based on incomplete information, mistaken assumptions, or later-corrected premises. This is a groundbreaking analytical feature enabled by our comprehensive cross-reference system.
- [ ] **"Where History Was Wrong"** mode — AI-assisted analysis that cross-references claims across eras, identifying where a later authority corrected or contradicted an earlier one based on new evidence
- [ ] Flag passages where a posek relied on a premise that was later proven incorrect (e.g., scientific understanding, geographic knowledge, textual variants)
- [ ] Track "correction chains" — when Acharon X corrects Rishon Y who misunderstood Gaon Z
- [ ] Side-by-side comparison view: original claim vs. correction with historical context
- [ ] Confidence scoring: how established is the correction vs. still debated
- [ ] Filter by era/community to see patterns in how knowledge evolved
- [ ] Respect for tradition: present findings as scholarly analysis, not as criticism — "building upon" framing

### N5. AI-Powered Novel Discovery & Insight Generation
Use the unprecedented scale of our cross-referenced corpus (4.6M+ chunks, 6,500+ works) to discover new connections, answer previously unanswerable questions, and generate novel scholarly insights.
- [ ] **"Undiscovered Connections"** — AI scans for thematic parallels across distant works that no human scholar has likely compared (e.g., a Yemenite responsum and a Lithuanian commentary making the same novel argument independently)
- [ ] **"Answer the Unanswerable"** — Feed long-standing open questions (teku, unresolved machloket) through the full corpus to see if any combination of sources provides a resolution
- [ ] **Pattern Detection** — Identify recurring halakhic reasoning patterns across centuries and communities
- [ ] **Consensus Mapping** — For any given question, automatically map the spectrum of opinions across all available sources, weighted by era and authority
- [ ] **"What if?"** analysis — Given a new technology/situation, trace all relevant precedents and predict how different authorities would rule
- [ ] **Lost Context Recovery** — Use surrounding sources to reconstruct the likely context or reasoning behind cryptic/terse passages
- [ ] **Cross-Community Synthesis** — Automatically identify where Ashkenazi and Sephardi traditions converge or diverge on specific topics, with the full chain of reasoning
- [ ] Research paper generation: AI-assisted drafts of novel Torah scholarship with full citations

### N6. Advanced Search Features
- [ ] Search within a specific work or category
- [ ] Search by author or era
- [ ] "Find similar passages" from any selected text
- [ ] Save searches as alerts (notify when new matching content is added)
- [ ] Search history

---

## CORPUS EXPANSION: Tier 1 — Critical Gaps

### C1. Shulchan Arukh Commentaries (Public Domain)
- [ ] Taz (Turei Zahav) — all 4 sections
- [ ] Shakh (Siftei Kohen) — Yoreh Deah, Choshen Mishpat
- [ ] Beur HaGra — all 4 sections
- [ ] Ba'er Hetev — all 4 sections
- [ ] Ba'er HaGolah — Choshen Mishpat
- [ ] Pitchei Teshuvah — Yoreh Deah, Even HaEzer, Choshen Mishpat
- [ ] Chelkat Mechokek — Even HaEzer
- [ ] Beit Shmuel — Even HaEzer
- [ ] Netivot HaMishpat — Choshen Mishpat
- [ ] Ketzot HaChoshen — Choshen Mishpat
- [ ] Sma (Sefer Meirat Einayim) — Choshen Mishpat

### C2. Complete Rishonim on Talmud
- [ ] Ran (Rabbenu Nissim) — complete coverage
- [ ] Rosh (Rabbenu Asher) — complete all tractates
- [ ] Rashba — fill missing tractates
- [ ] Ritva — fill missing tractates
- [ ] Meiri (Bet HaBechira) — fill missing tractates
- [ ] Chiddushei HaRamban — fill missing tractates
- [ ] Acharonim: Maharsha, Maharam, Pnei Yehoshua

### C3. Mishneh Torah Commentaries
- [ ] Maggid Mishneh — complete (only 6/14 books present)
- [ ] Radbaz (R. David ben Zimra)
- [ ] Mishneh LaMelekh
- [ ] Or Sameach
- [ ] Hagahot Maimoniyot

### C4. Pre-1900 Responsa (Public Domain)
- [ ] Chatam Sofer (7 volumes)
- [ ] Teshuvot HaRashba (7+ volumes)
- [ ] Teshuvot HaRosh
- [ ] Teshuvot HaRambam
- [ ] Noda BiYhudah (2 volumes)
- [ ] Teshuvot Maharil
- [ ] Teshuvot Maharam of Rothenburg
- [ ] Teshuvot Rivash
- [ ] Geonic Responsa (various collections)

### C5. Geonic Literature
- [ ] She'iltot of Rav Achai Gaon
- [ ] Halakhot Gedolot
- [ ] Halakhot Pesukot
- [ ] Seder Rav Amram Gaon (earliest complete siddur)
- [ ] Teshuvot HaGeonim collections
- [ ] Saadia Gaon's works (beyond philosophy)
- [ ] Hai Gaon's works
- [ ] Sherira Gaon's Iggeret

### C6. Jastrow Dictionary (for Dictionary Popover)
- [ ] Acquire Jastrow text (public domain)
- [ ] Parse into `dictionary_entries` table
- [ ] Map entries to corpus word occurrences
- [ ] Build frequency data per work/category

### C7. Manuscript Variants (Friedberg Hachi Garsinan — Free)
- [ ] Register for Friedberg Hachi Garsinan API
- [ ] Import Bavli manuscript variant data
- [ ] Build synoptic text display (side-by-side manuscripts)
- [ ] Link variants to main text chunks

### C8. Cross-Reference System
- [ ] Import Sefaria's ~420K text links
- [ ] Build exhaustive Bavli-Mishnah citation mapping
- [ ] Map Bavli-Yerushalmi parallel sugyot
- [ ] Map Bavli-Tosefta parallels (Baraita identification)
- [ ] Build halakhic derivation chains: Gemara -> Rif -> Rambam -> Tur -> SA -> Acharonim
- [ ] AI-assisted intertextual quotation detection

### C9. Rabbi Biographical Database (see also N1: Tzadik Profiles)
- [ ] Build Talmudic rabbi database (name, generation, location, teacher-student)
- [ ] Rishon/Acharon biographies (dates, locations, works)
- [ ] Teacher-student graph (network visualization)
- [ ] Geographic mapping data

### C10. Additional Rishonim
- [ ] Sefer HaChinukh (613 commandments)
- [ ] Sefer Mitzvot Gadol (Semag)
- [ ] Sha'arei Teshuvah (Rabbenu Yonah)
- [ ] Mordechai — complete coverage
- [ ] Kol Bo
- [ ] Sefer HaRokeach

---

## CORPUS EXPANSION: Tier 2 — High Priority

### C11. Complete Targumim
- [ ] Targum Pseudo-Jonathan (full Palestinian Targum on Torah)
- [ ] Targum to Ketuvim (Psalms, Proverbs, Job, Megillot, Chronicles)
- [ ] Fragment Targum
- [ ] Targum Sheni to Esther
- [ ] Saadia Gaon's Tafsir (Judeo-Arabic Torah)

### C12. Second Temple & Ancient Texts
- [ ] Dead Sea Scrolls complete transcriptions
- [ ] Complete Apocrypha (Ben Sira, Jubilees, 1 Enoch)
- [ ] Pseudepigrapha (Testaments of 12 Patriarchs)
- [ ] Josephus complete (Wars, Antiquities — Whiston PD translation)
- [ ] Philo of Alexandria complete (Yonge PD translation)
- [ ] Maccabees 1-4

### C13. HebrewBooks.org Pipeline
- [ ] Build PDF download + OCR pipeline
- [ ] Target rare responsa and commentaries not in Sefaria/Otzaria
- [ ] Quality assurance for OCR output
- [ ] Structural markup for ingestion

### C14. Bavli-Yerushalmi Synoptic Parallels
- [ ] Map parallel sugyot between Bavli and Yerushalmi
- [ ] Build synoptic view component
- [ ] Highlight textual differences

### C15. Learning Schedules
- [ ] Daf Yomi (Bavli) — cycle position tracking
- [ ] Daf Yomi (Yerushalmi)
- [ ] Nach Yomi
- [ ] Mishnah Yomit
- [ ] Rambam Yomi (3 chapters/day and 1 chapter/day cycles)
- [ ] Chok LeYisrael (Sephardic daily study)
- [ ] 929 Tanakh study
- [ ] Custom learning schedules

### C16. Word-by-Word Translation Layer
- [ ] Hover/tap for individual word meanings
- [ ] Grammatical parsing (verb forms, construct chains)
- [ ] Cantillation mark analysis for Tanakh

### C17. Open Siddur Project Integration
- [ ] Import TEI XML liturgical data (open license)
- [ ] Multi-rite siddur support (Ashkenaz, Sefard, Edot HaMizrach, Nusach Ari)

---

## CORPUS EXPANSION: Tier 3 — Enrichment

### C18. Modern Responsa (Copyright Barriers)
- [ ] Negotiate with Igrot Moshe estate
- [ ] Negotiate with Yabia Omer estate
- [ ] Negotiate for Tzitz Eliezer
- [ ] Negotiate for Shevet HaLevi
- [ ] Consider "fair use" scholarly citation approach

### C19. English Translation Expansion
- [ ] Track Sefaria's ongoing translation projects
- [ ] Community translation program
- [ ] AI draft translations with human review
- [ ] Priority: Shulchan Arukh in English (biggest gap)

### C20. Kabbalistic Corpus Expansion
- [ ] 21 texts identified in KABBALAH-RESOURCES.md
- [ ] Kitvei HaArizal expansion
- [ ] Ramchal works expansion
- [ ] Baal HaSulam additions

### C21. Chasidic Texts Expansion
- [ ] Complete Likutey Moharan
- [ ] Sefat Emet
- [ ] Mei HaShiloach
- [ ] Piaseczno Rebbe works

### C22. Minority Tradition Texts
- [ ] Karaite literature (Anan ben David, Yefet ben Ali)
- [ ] Samaritan Pentateuch
- [ ] Ethiopian Jewish texts

### C23. Multilingual Expansion
- [ ] Yiddish literary corpus (Universal Yiddish Library — 18K+ books, free)
- [ ] Ladino texts (UW Sephardic Studies — 403 digitized books, free)
- [ ] Judeo-Arabic originals
- [ ] French, Spanish, Russian translations

---

## INFRASTRUCTURE & TOOLS

### I1. OCR Pipeline (for HebrewBooks.org)
- [ ] Hebrew/Aramaic OCR model (Tesseract or custom)
- [ ] PDF -> text extraction pipeline
- [ ] Structural markup detection (headers, paragraphs, footnotes)
- [ ] Quality scoring and correction workflow
- [ ] AI-assisted error correction

### I2. Update Monitoring
- [x] `scripts/check-updates.ts` — monitors Sefaria-Export and Otzaria repos
- [ ] Automated delta ingestion (new/changed files only)
- [ ] Notification system for new content

### I3. Deduplication
- [ ] Sefaria + Otzaria overlap detection
- [ ] Merge strategy for duplicate texts (prefer higher quality source)
- [ ] Hash-based dedup for identical chunks

### I4. Embedding Infrastructure
- [x] `embed-bulk.ts` — high-throughput bulk embedder with multi-GPU round-robin
- [x] `updateChunkEmbeddingsBatch()` — batch UPDATE with unnest()
- [x] `getChunksForEmbedding()` — cursor-based pagination
- [x] TEI (Text Embeddings Inference) self-hosted on Vast.ai GPUs
- [x] Web app TEI integration (`packages/lib/embeddings.ts` with TEI mode detection)
- [ ] OpenVINO adapter for Intel Arc GPU (optional)
- [ ] ONNX local CPU fallback embedder
- [ ] Embedding quality validation tests

### I5. CI/CD
- [ ] GitHub Actions for lint + typecheck
- [ ] Automated tests for search pipeline
- [ ] Database migration checks
- [ ] Docker build pipeline

---

## KEYBOARD SHORTCUTS (for Reader)

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open reference jumper |
| `Cmd/Ctrl + F` | Search within current work |
| `Cmd/Ctrl + Shift + F` | Global search |
| `Cmd/Ctrl + B` | Toggle bookmark |
| `Cmd/Ctrl + /` | Open AI assistant |
| `1` / `2` / `3` | Switch layout (Modern / Traditional / Research) |
| `H` / `E` / `B` | Hebrew only / English only / Both |
| `[` / `]` | Previous / Next section |
| `T` | Toggle Table of Contents |
| `C` | Toggle commentary sidebar |
| `N` | Add note on selected text |
| `D` | Open dictionary for selected word |
| `Escape` | Close any open panel |

---

## DESIGN SYSTEM EXTENSIONS

### New Color Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `--color-parchment-50` | `#fefcf5` | Light text backgrounds |
| `--color-parchment-100` | `#fdf8e8` | Card backgrounds |
| `--color-rashi` | `#b8860b` | Rashi commentary accent |
| `--color-tosafot` | `#4a7c59` | Tosafot commentary accent |
| `--color-ramban` | `#6b4c8a` | Ramban commentary accent |
| `--color-rambam` | `#2e5fa1` | Rambam commentary accent |
| `--color-rashbam` | `#a0522d` | Rashbam commentary accent |
| `--color-meiri` | `#4a8b8b` | Meiri commentary accent |

### Typography
| Class | Font | Size | Line Height |
|-------|------|------|-------------|
| Main text (Hebrew) | Frank Ruhl Libre | 1.25rem | 2.0 |
| Main text (English) | Source Serif 4 | 1.0rem | 1.75 |
| Commentary (Hebrew) | Frank Ruhl Libre | 1.0rem | 1.8 |
| Commentary (English) | Source Serif 4 | 0.9rem | 1.6 |
| Dictionary | System | 0.85rem | 1.5 |
| Footnote | System | 0.8rem | 1.4 |

---

## EXTERNAL DATA SOURCES

| Source | Content | Access | Status |
|--------|---------|--------|--------|
| **Sefaria-Export** | 4.09M chunks, 14 categories | Open source | Ingested |
| **Otzaria** | 463K chunks (partial) | Open source | Partial ingest |
| **HebrewBooks.org** | 65,000+ PDF seforim | Free | Not started |
| **Friedberg Hachi Garsinan** | Bavli manuscript variants | Free (register) | Not started |
| **Friedberg Genizah Project** | 229K+ Genizah fragments | Free | Not started |
| **Ktiv (NLI)** | 86K+ Hebrew manuscripts | Free | Not started |
| **Open Siddur Project** | Liturgical TEI XML | Open license | Not started |
| **Universal Yiddish Library** | 18K+ Yiddish books | Free | Not started |
| **Cambridge Genizah** | ~200K Genizah fragments | Free | Not started |
| **Sephardic Studies (UW)** | 403 Ladino books | Free | Not started |
| **Dead Sea Scrolls Digital Library** | DSS images | Free (images) | Not started |
| **Internet Archive** | Various Hebrew books | Free (PD) | Not started |
| **Bar-Ilan Responsa** | 100K+ responsa | Subscription ($300-500/yr) | Cannot acquire |
| **Otzar HaChochma** | 156K scanned books | Subscription ($200-400/yr) | Cannot acquire |

---

## COMPETITIVE POSITIONING

### What No Competitor Has (Our Differentiators)
1. Traditional Talmud page layout + AI semantic search
2. Instant Aramaic morphology (click any word)
3. Multiple simultaneous commentary layers
4. Community-aware search ranking (35+ communities)
5. Halakhic derivation chain visualization
6. Manuscript variant integration with readable text
7. Three AI research modes (Practical, Deep Analytic, Posek View)
8. Open source + free + modern web UI

### Completeness Targets
| Milestone | Completeness | Timeline |
|-----------|-------------|----------|
| **MVP** (search + reader) | Current ~35-40% | 4-6 weeks |
| **v1.0** (Tier 1 gaps filled) | ~60-65% | 3-6 months |
| **v2.0** (Tier 1 + 2 gaps filled) | ~80% | 12-18 months |
| **v3.0** (Tier 1-3, partnerships) | ~95% | 2-3 years |
| **Ultimate** (99%+) | ~99% | 5+ years |

---

*Generated from research by three specialized agents: Embedding Strategist, Data Completeness Researcher, and Talmud 2.0 UI Designer. Full reports in `docs/corpus-completeness-report.md` and `docs/talmud-reader-design.md`.*
