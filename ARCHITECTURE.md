# Halacha AI — Architecture Overview

## System Purpose

A Retrieval-Augmented Generation (RAG) system specialized for halakhic research. The system retrieves and synthesizes sources from the Jewish legal canon (and optionally non-canonical texts) to support learners and poskim in their study and decision-making.

**Critical constraint:** The system NEVER issues psak halacha. It provides research, sources, and structured analysis only.

## High-Level Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  Next.js App Router (/apps/web)                             │
│  ┌─────────┐  ┌──────────┐  ┌─────────────┐                │
│  │ /halacha │  │ Settings │  │ Admin/Review│                │
│  │ (chat)   │  │ (profile)│  │ (answers)   │                │
│  └────┬─────┘  └──────────┘  └──────┬──────┘                │
│       │                             │                        │
│  ─────┴─────────────────────────────┴────── API Routes ──── │
│  POST /api/halacha/query                                     │
│  GET  /api/admin/answers                                     │
│  POST /api/admin/answers/:id/review                          │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────┐    ┌──────────────────┐
│  Hybrid Search │    │  LLM Generation  │
│  (pgvector +   │    │  (Claude/GPT-4o) │
│   full-text)   │    │  + Prompt Engine  │
│  /packages/lib │    │  /packages/lib   │
└───────┬────────┘    └──────────────────┘
        │
        ▼
┌────────────────────────────────────────────┐
│              POSTGRES + pgvector            │
│  ┌──────────┐ ┌──────────────┐             │
│  │ corpora   │ │halacha_chunks│ ◄── HNSW   │
│  └──────────┘ │  + embedding │     index   │
│               │  + search_tsv│ ◄── GIN     │
│               └──────────────┘     index   │
│  ┌──────────────────┐ ┌──────────────────┐ │
│  │halacha_relations  │ │ halacha_answers  │ │
│  └──────────────────┘ └──────────────────┘ │
│  ┌──────────────────┐                      │
│  │ user_profiles     │                      │
│  └──────────────────┘                      │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│           BACKGROUND WORKER                 │
│  BullMQ + Redis (/apps/worker)              │
│  ┌─────────────────────────────┐            │
│  │ embed-chunks queue          │            │
│  │ → fetch NULL-embedding rows │            │
│  │ → call BGE-M3 API           │            │
│  │ → update embedding column   │            │
│  └─────────────────────────────┘            │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│         INGESTION PIPELINE                  │
│  /scripts                                   │
│  ┌──────────────────────────────────────┐   │
│  │ Sefaria-Export JSON → parse →        │   │
│  │ chunk → insert corpora + chunks      │   │
│  │ → enqueue embedding jobs             │   │
│  └──────────────────────────────────────┘   │
└────────────────────────────────────────────┘
```

## Monorepo Structure

```
halacha-ai/
├── apps/
│   ├── web/                    # Next.js 15 App Router
│   │   ├── app/
│   │   │   ├── halacha/        # Main research chat UI
│   │   │   └── api/
│   │   │       ├── halacha/
│   │   │       │   └── query/  # POST — main query endpoint
│   │   │       └── admin/
│   │   │           └── answers/# GET list, POST review
│   │   └── ...
│   └── worker/                 # BullMQ embedding worker
│       ├── index.ts
│       └── processors/
├── packages/
│   ├── db/                     # Postgres client + migrations
│   │   ├── migrations/
│   │   ├── schema.ts           # Type definitions
│   │   └── client.ts           # DB connection
│   └── lib/                    # Shared business logic
│       ├── sefaria.ts          # Sefaria-Export parser
│       ├── embeddings.ts       # BGE-M3 wrapper
│       ├── search.ts           # Hybrid search (RRF)
│       ├── llm.ts              # LLM client wrapper
│       ├── prompts.ts          # Mode-specific prompt templates
│       └── review.ts           # Answer review utilities
├── scripts/                    # One-off ingestion
│   ├── ingest_shulchan_arukh.ts
│   ├── ingest_mishnah_berurah.ts
│   ├── ingest_responsa.ts
│   └── ingest_apocrypha.ts
├── docker-compose.yml          # Postgres+pgvector, Redis
├── package.json                # Workspace root
├── tsconfig.json
├── .env.example
└── README.md
```

## Data Flow

### Query Pipeline

```
User Question
    │
    ├─1─► embedQuestion(question) → 1024-dim vector
    │
    ├─2─► Hybrid Search
    │     ├── Semantic: pgvector cosine similarity (top 60)
    │     ├── Keyword: tsvector full-text search (top 60)
    │     ├── Merge: Reciprocal Rank Fusion (RRF, k=60)
    │     ├── Boost: community match (+0.15), general (+0.05), canonical (+0.10)
    │     └── Select: top 40 with parent + related chunks
    │
    ├─3─► LLM Generation
    │     ├── System prompt selected by mode (practical/deep/posek)
    │     ├── User prompt with question + structured sources
    │     └── Response with citations
    │
    └─4─► Log to halacha_answers (with embeddings for similarity search)
```

### Ingestion Pipeline

```
Sefaria-Export (JSON)
    │
    ├── Parse with sefaria.ts utilities
    ├── Chunk by hierarchical rules (siman/se'if, chapter/halakha, etc.)
    ├── Assign metadata (author, era, community, corpus_tier, authority_weight)
    ├── Insert into corpora + halacha_chunks
    └── Enqueue embedding jobs → worker processes in batches
```

## Research Modes

| Mode | Audience | Output Style |
|------|----------|-------------|
| **Practical** | Learners | Opinion-by-sefer, conflicts noted, minhagim mentioned, non-canonical separated |
| **Deep Analytic** | Advanced learners | Sugya map, opinion matrix, machloket analysis, conditional frameworks |
| **Posek View** | Poskim | Mar'ei mekomot, shittot table, unresolved tensions, precedent analogies |

All modes end with explicit disclaimers that output is not psak halacha.

## Corpus Tier System

| Tier | Examples | Default Access | Authority Weight |
|------|----------|---------------|-----------------|
| `canonical` | Shulchan Arukh, Mishneh Torah, Mishnah Berurah | All users | 1.0 (varies by source) |
| `apocrypha` | Sefaria Apocrypha collection | Posek/Researcher only | **0.0 always** |
| `pseudepigrapha` | 1 Enoch, Jubilees | Posek/Researcher only | **0.0 always** |
| `academic` | Modern scholarly works | Posek/Researcher only | **0.0 always** |
| `private` | User-uploaded texts | Per-user | **0.0 always** |

Non-canonical sources are never used as basis for normative rulings and are always clearly labeled in output.

## Key Technology Choices

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Framework | Next.js 15 (App Router) | Full-stack TypeScript, API routes + SSR |
| Database | Postgres + pgvector | Hybrid search (vector + full-text) in one DB |
| Embeddings | BGE-M3 (1024-dim) | Multilingual (Hebrew/Aramaic/English) |
| Job Queue | BullMQ + Redis | Reliable background embedding processing |
| LLM | Claude / GPT-4o | Configurable via env vars |
| Monorepo | pnpm workspaces | Shared packages, clean dependency management |

## Security & Ethics

- **No psak halacha** — enforced at prompt level and in all mode outputs.
- **Non-canonical isolation** — authority_weight=0, no scoring boosts, labeled in output.
- **Review loop** — all answers logged with embeddings for human review.
- **Role-based access** — corpus tier toggles gated by user role.
