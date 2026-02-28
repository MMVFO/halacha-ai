# IMPLEMENTATION_PROMPT.md (for Claude / Claude Code)

You are an expert AI coding assistant (Claude Code / Claude in Cursor or Windsurf) tasked with implementing a complete Halacha AI research system.

Your primary goals:
- Build a Retrieval-Augmented Generation (RAG) system specialized for halakhah (Jewish law).
- Respect strict boundaries: you NEVER give psak halacha; you only provide research, sources, and structured analysis.
- Support both canonical halakhic texts and non-canonical / Second Temple / apocryphal texts, behind an explicit toggle mechanism.
- Serve both poskim and serious learners, with different views/modes per audience.

You are collaborating with a human owner (the user) who will run commands, provide credentials, and deploy services. You do NOT run shell commands yourself; you only generate code and instructions.

====================================
HIGH-LEVEL ARCHITECTURE
====================================

Tech stack (target):
- Next.js (App Router, TypeScript) for frontend + API routes.
- Node.js/TypeScript backend.
- Postgres + pgvector for data, embeddings, and hybrid search.
- Redis + BullMQ for background jobs (ingestion and embeddings).
- Embedding model: BGE-M3 (or equivalent 1024-dim multilingual encoder) via API.
- LLM: Claude / GPT-4o (user will supply API keys).
- Primary corpus: Sefaria Export (JSON/text) for halakhah and responsa, plus additional non-canonical texts from public-domain sources.

You will build a monorepo with this structure:

- /apps/web           # Next.js app (UI + API routes)
- /apps/worker        # BullMQ job worker for embeddings and ingestion
- /packages/db        # Database client, migrations, schema (Prisma or Kysely)
- /packages/lib       # Shared utilities (Sefaria parsing, search, prompts)
- /scripts            # One-off ingestion scripts
- README.md           # Setup and run instructions

====================================
DATA MODEL REQUIREMENTS
====================================

Implement a Postgres schema equivalent to:

Tables:
- corpora
- halacha_chunks
- halacha_relations
- user_profiles
- halacha_answers

You may use raw SQL migrations or an ORM like Prisma/Kysely, but the resulting tables MUST contain at least these columns.

### corpora

```sql
id SERIAL PRIMARY KEY
name TEXT NOT NULL
corpus_tier TEXT NOT NULL  -- 'canonical','apocrypha','pseudepigrapha','academic','private'
source_url TEXT
license TEXT
ingested_at TIMESTAMP DEFAULT now()
```

### halacha_chunks

```sql
id SERIAL PRIMARY KEY
corpus_id INT REFERENCES corpora(id)
work TEXT NOT NULL                  -- e.g. 'Shulchan Arukh Orach Chaim'
section_ref TEXT NOT NULL           -- e.g. 'OC 253:1' or 'Enoch 6:1'
parent_ref TEXT                     -- e.g. 'OC 253'
language TEXT NOT NULL              -- 'he','en','arc'
text TEXT NOT NULL
author TEXT
era TEXT                            -- 'Tanna','Amora','Gaon','Rishon','Acharon','Modern','Second Temple'
community TEXT DEFAULT 'General'    -- 'Ashkenazi','Sephardi','Chabad','Yemenite','Ethiopian','General'
minhag_scope TEXT DEFAULT 'global'  -- 'global','regional','local','family','chassidic'
authority_weight REAL DEFAULT 1.0
corpus_tier TEXT NOT NULL           -- denormalized from corpora
tags TEXT[] DEFAULT '{}'
topics TEXT[] DEFAULT '{}'
embedding VECTOR(1024)              -- BGE-M3 sized
search_tsv TSVECTOR GENERATED ALWAYS AS (to_tsvector('simple', text)) STORED
created_at TIMESTAMP DEFAULT now()
```

**Indexes for halacha_chunks:**
- HNSW (or IVFFlat) index on embedding using vector_cosine_ops.
- GIN index on search_tsv.
- B-tree or GIN on corpus_tier.
- B-tree on community.
- GIN on tags.
- B-tree on parent_ref.

### halacha_relations

```sql
id SERIAL PRIMARY KEY
from_chunk_id INT REFERENCES halacha_chunks(id)
to_chunk_id INT REFERENCES halacha_chunks(id)
relation_type TEXT NOT NULL   -- 'argues_with','supports','quotes','based_on','minhag_override','supersedes','contextualizes'
direction TEXT DEFAULT 'directed'   -- 'directed' | 'bidirectional'
confidence REAL DEFAULT 1.0         -- 1.0 human-verified, <1.0 AI-inferred
notes TEXT
created_by TEXT
created_at TIMESTAMP DEFAULT now()
```

### user_profiles

```sql
id SERIAL PRIMARY KEY
display_name TEXT
primary_community TEXT DEFAULT 'General'
secondary_customs TEXT[] DEFAULT '{}'
preferred_poskim TEXT[] DEFAULT '{}'
corpus_tiers TEXT[] DEFAULT '{canonical}'
language_pref TEXT DEFAULT 'en'
role TEXT DEFAULT 'learner'         -- 'learner','advanced','posek','researcher'
created_at TIMESTAMP DEFAULT now()
```

### halacha_answers

```sql
id SERIAL PRIMARY KEY
question TEXT NOT NULL
question_embedding VECTOR(1024)
answer TEXT NOT NULL
cited_chunk_ids INT[] DEFAULT '{}'
user_id INT REFERENCES user_profiles(id)
user_community TEXT
corpus_tiers_used TEXT[]
mode TEXT                           -- 'practical','deep_research','posek_view'
reviewed_by TEXT
review_status TEXT DEFAULT 'unreviewed'  -- 'unreviewed','approved','corrected','rejected'
review_notes TEXT
correction TEXT
created_at TIMESTAMP DEFAULT now()
```

Add appropriate indexes for question_embedding (HNSW) and review_status.

====================================
CORPUS & INGESTION REQUIREMENTS
====================================

**Primary sources:**
- Sefaria Export (https://github.com/Sefaria/Sefaria-Export) for:
  - Shulchan Arukh (all 4 sections) + Rema & standard commentaries.
  - Mishnah Berurah.
  - Arukh HaShulchan.
  - Shulchan Arukh HaRav.
  - Rambam (Mishneh Torah).
  - Tur.
  - Responsa collections (https://www.sefaria.org/texts/Responsa).

**Non-canonical sources:**
- Sefaria Apocrypha / Second Temple (https://www.sefaria.org/texts/Second%20Temple/Apocrypha).
- Public-domain Enoch translations and related pseudepigrapha.
- Other Second Temple / DSS materials if available (but design must support them even if not fully implemented yet).

You must implement:
- Reusable ingestion utilities in `/packages/lib/sefaria.ts` (or similar) that can:
  - Read merged.json or merged.txt from Sefaria-Export.
  - Use Sefaria schemas to traverse hierarchy: book → section → chapter → verse OR siman → se'if.
- Scripts in `/scripts`:
  - `ingest_shulchan_arukh.ts`
  - `ingest_mishnah_berurah.ts`
  - `ingest_responsa.ts`
  - `ingest_apocrypha.ts` (can be stubbed with comments where data paths are needed).

**Chunking rules:**
- Shulchan Arukh and commentaries:
  - Parent: siman (e.g. 'OC 253').
  - Child: se'if (e.g. 'OC 253:1').
- Mishneh Torah:
  - Parent: chapter.
  - Child: individual halakha.
- Responsa:
  - Parent: entire teshuva.
  - Child: paragraph / logical section.
- Apocrypha / Enoch:
  - Parent: chapter.
  - Child: verse or small verse groups.

**Metadata rules:**
- For Mechaber (Shulchan Arukh base): community='Sephardi', era='Acharon', corpus_tier='canonical'.
- Rema: community='Ashkenazi', era='Acharon', corpus_tier='canonical'.
- Mishnah Berurah, Arukh HaShulchan, Shulchan Arukh HaRav: community='Ashkenazi' or 'Chabad'.
- Responsa: set author, era, community appropriately where possible.
- Apocrypha/Enoch:
  - corpus_tier in ('apocrypha','pseudepigrapha','academic').
  - era='Second Temple'.
  - community='General' or 'Qumran' (for DSS sectarian texts).
  - authority_weight=0.0 ALWAYS.

**Ingestion scripts should:**
- Insert a row into corpora for each source.
- Insert halacha_chunks rows with all required metadata.
- Be invokable via simple CLI (e.g. `pnpm ts-node scripts/ingest_shulchan_arukh.ts --path ./data/Sefaria-Export/...`).

====================================
EMBEDDINGS & WORKER
====================================

Implement:

**`/packages/lib/embeddings.ts`:**
- A function `embedText(text: string): Promise<number[]>` using BGE-M3 (or similar) via configured API.
- A function `embedQuestion(question: string): Promise<number[]>` (same model, may use different prompt).
- All key values (API URL, key, model name) from environment variables.

**`/apps/worker`:**
- BullMQ-based worker that:
  - Connects to Redis.
  - Has a queue for 'embed-chunks'.
  - Job processor that:
    - Fetches a batch of halacha_chunks with NULL embedding.
    - Calls embedText in batches.
    - Updates embedding column.
  - A simple script or command to enqueue jobs for all current NULL embeddings.

====================================
HYBRID SEARCH IMPLEMENTATION
====================================

Implement hybrid search inside Postgres using:
- pgvector for semantic similarity on embedding.
- Full-text search on search_tsv.

In `/packages/lib/search.ts` implement a function:

```ts
type SearchMode = 'practical' | 'deep_research' | 'posek_view';

interface SearchOptions {
  question: string;
  community?: string;         // user primary community
  corpusTiers?: string[];     // allowed corpus tiers
  mode?: SearchMode;
}

interface RetrievedSource {
  id: number;
  work: string;
  sectionRef: string;
  parentRef: string | null;
  community: string;
  corpusTier: string;
  author: string | null;
  era: string | null;
  text: string;
}

interface SearchResult {
  sources: RetrievedSource[];
}
```

**The algorithm:**

1. Embed the question → questionEmbedding.
2. Build tsquery from raw question (`plainto_tsquery` on 'simple' config is fine).
3. Semantic subquery:
   - Top K (e.g. 60) halacha_chunks by `embedding <=> questionEmbedding`, filtered by corpus_tier and any other metadata.
4. Keyword subquery:
   - Top K (e.g. 60) halacha_chunks by `ts_rank` on `search_tsv @@ tsquery`, filtered by same corpus_tier.
5. Merge results by id using Reciprocal Rank Fusion (RRF):
   - `rrfScore = 1/(k + sem_rank) + 1/(k + kw_rank)` with k ~ 60.
6. Apply additional scoring boosts:
   - +0.15 if community == user.community.
   - +0.05 if community == 'General'.
   - +0.10 if corpus_tier == 'canonical'.
7. Sort by final_score DESC, pick top 40.
8. For each selected chunk:
   - Load parent chunk (if parent_ref exists).
   - Load related chunks from halacha_relations for relation_type in ('argues_with','supports','minhag_override','contextualizes').

Return enough context for LLM generation.

====================================
API ROUTE: /api/halacha/query
====================================

Implement in `/apps/web`:

- **Method:** POST
- **URL:** `/api/halacha/query`
- **Request body:**
  - `question`: string (required)
  - `community?`: string (optional; default 'General')
  - `corpusTiers?`: string[] (optional; default ['canonical'])
  - `mode?`: 'practical' | 'deep_research' | 'posek_view' (optional; default 'practical')
  - `userId?`: number (optional; for logging)
- **Response:**
  - `answer`: string
  - `sources`: RetrievedSource[] (as defined above)

**Implementation steps:**

1. Validate input.
2. Look up user profile if userId provided; otherwise build a temporary profile from body.
3. Call `search()` with appropriate options.
4. Call LLM with:
   - A system prompt template based on mode (see below).
   - A user prompt containing:
     - The question.
     - A JSON or structured representation of sources (identified by id, work, sectionRef, community, corpusTier, author, text).
5. Receive answer from LLM.
6. Insert a row in halacha_answers with question, question_embedding, answer, cited_chunk_ids (the IDs you passed), user_community, corpus_tiers_used, and mode.
7. Return answer + sources.

====================================
PROMPT TEMPLATES & MODES
====================================

Implement prompt templates in `/packages/lib/prompts.ts`.

### Mode 1: Practical Research (default)

System prompt must enforce:
- Use ONLY provided sources.
- Separate opinions by sefer and community.
- Explicitly identify conflicts.
- Mention minhagim where relevant.
- NEVER issue psak; always end with: "For practical halacha, consult a competent rabbi who knows you and your community; this is for learning and research only."
- Non-canonical sources must be in a separate "Additional Context from Non-Canonical Sources" section, clearly labeled as such and explicitly marked as non-halachic authority.

### Mode 2: Deep Analytic

System prompt must enforce:
- Exhaustive source coverage from provided materials.
- Build a sugya map from earliest sources through modern responsa.
- Provide an opinion matrix with sevara, dependencies, community, and practical boundary conditions.
- Analyze machloket types and highlight syntheses.
- Present conditional decision frameworks ("If you weight X, you get A; if Y, you get B") without making final decisions.
- End with: "This analysis is a research aid for scholars and poskim, not psak halacha."

### Mode 3: Posek View

System prompt should:
- Assume the reader is a posek; minimal basic explanation.
- Produce:
  1. A flat mar'ei mekomot list.
  2. A shittot summary table with columns: Position | Primary Holders | Sevara | Community | Practical Outcome.
  3. Unresolved tensions.
  4. Precedent analogies.
  5. Minhag data.

====================================
NON-CANONICAL TOGGLE & SAFETY
====================================

Support corpus tiers:
- 'canonical'
- 'apocrypha'
- 'pseudepigrapha'
- 'academic'
- 'private'

**Rules:**
- Default corpusTiers for normal users: `['canonical']`.
- For roles 'posek' or 'researcher', allow enabling additional tiers via settings.
- Non-canonical chunks (tiers != 'canonical'):
  - ALWAYS authority_weight = 0.0.
  - NEVER get positive scoring boosts in retrieval.
  - MUST be labeled in outputs as non-canonical.
- Prompts must explicitly forbid using non-canonical sources as the basis for normative halachic rulings.

====================================
REVIEW & LEARNING LOOP
====================================

Implement:

- Logging for each answer in halacha_answers with question_embedding from `embedQuestion()`.
- In `/packages/lib/review.ts` (or similar):
  - A function to find similar answered questions via vector similarity on question_embedding.
  - Functions to update review_status, review_notes, and correction for a given answer.

You do NOT need a full UI for review yet, but implement minimal API routes to:
- `GET /api/admin/answers` (with filters).
- `POST /api/admin/answers/{id}/review` to update review_status and notes.

====================================
FRONTEND (MINIMUM)
====================================

In `/apps/web`:

- A basic chat-like page at e.g. `/halacha`:
  - Textarea for question.
  - Select for community (Ashkenazi, Sephardi, Chabad, Yemenite, General).
  - Toggles for corpus tiers (canonical, apocrypha, pseudepigrapha, academic).
  - Select for mode (practical, deep_research, posek_view).
  - Display of the answer from `/api/halacha/query`.
  - Display of sources (work, sectionRef, community, corpusTier).

Priority is correctness and clarity, not design.

====================================
IMPLEMENTATION ORDER
====================================

Follow this order:

1. Initialize repo structure and shared config (TypeScript, lint, tsconfig).
2. Set up Docker Compose for Postgres (with pgvector) + Redis; update README with setup commands.
3. Implement `/packages/db` with migrations for all tables and a type-safe DB client.
4. Implement embedding and LLM client wrappers with env-configurable keys.
5. Implement Sefaria parsing utilities and at least one ingestion script (Shulchan Arukh OC).
6. Implement the embedding worker using BullMQ.
7. Implement hybrid search function and wire into `/api/halacha/query`.
8. Implement prompt templates and mode selection.
9. Implement minimal frontend.
10. Implement review API endpoints.

====================================
STYLE & OUTPUT INSTRUCTIONS
====================================

- Use TypeScript wherever possible.
- Prefer clarity and explicit types over clever tricks.
- Include comments where human configuration is needed (e.g., actual paths, API keys).
- As you respond to this prompt, DO NOT write explanations or high-level prose.
- INSTEAD: create and show the files and code needed, as if you are editing a real repository:
  - e.g., "File: package.json", then content.
  - e.g., "File: apps/web/app/api/halacha/query/route.ts", then content.
- Keep responses chunked by files so the user can copy them into the repo.

**Begin by scaffolding the repo (folder structure, basic configs, README), then proceed according to the implementation order above.**
