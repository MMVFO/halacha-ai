# Halacha AI — Database Schema Reference

## Overview

Postgres 16+ with **pgvector** extension for vector similarity search. All embeddings use **1024 dimensions** (BGE-M3 model).

## Entity Relationship Diagram

```
┌──────────┐       ┌──────────────────┐       ┌────────────────────┐
│ corpora   │──1:N──│ halacha_chunks   │──M:N──│ halacha_relations  │
│           │       │                  │       │ (from_chunk_id,    │
│           │       │                  │       │  to_chunk_id)      │
└──────────┘       └────────┬─────────┘       └────────────────────┘
                            │
                            │ cited by
                            ▼
                   ┌──────────────────┐
                   │ halacha_answers   │
                   │                  │──N:1──┌──────────────────┐
                   │                  │       │ user_profiles     │
                   └──────────────────┘       └──────────────────┘
```

## Tables

### 1. `corpora`

Tracks each imported corpus/source collection.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-increment ID |
| `name` | TEXT | NOT NULL | e.g. "Shulchan Arukh Orach Chaim" |
| `corpus_tier` | TEXT | NOT NULL | `'canonical'`, `'apocrypha'`, `'pseudepigrapha'`, `'academic'`, `'private'` |
| `source_url` | TEXT | | URL of the source data |
| `license` | TEXT | | License information |
| `ingested_at` | TIMESTAMP | DEFAULT now() | When the corpus was imported |

### 2. `halacha_chunks`

The core content table. Each row is a searchable unit of halakhic text.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-increment ID |
| `corpus_id` | INT | REFERENCES corpora(id) | Which corpus this belongs to |
| `work` | TEXT | NOT NULL | e.g. "Shulchan Arukh Orach Chaim", "Rambam Hilchot Shabbat" |
| `section_ref` | TEXT | NOT NULL | e.g. "OC 253:1", "Enoch 6:1" |
| `parent_ref` | TEXT | | e.g. "OC 253" — used for context loading |
| `language` | TEXT | NOT NULL | `'he'`, `'en'`, `'arc'` (Aramaic) |
| `text` | TEXT | NOT NULL | The actual text content |
| `author` | TEXT | | e.g. "Yosef Karo", "Moshe Isserles" |
| `era` | TEXT | | `'Tanna'`, `'Amora'`, `'Gaon'`, `'Rishon'`, `'Acharon'`, `'Modern'`, `'Second Temple'` |
| `community` | TEXT | DEFAULT 'General' | `'Ashkenazi'`, `'Sephardi'`, `'Chabad'`, `'Yemenite'`, `'Ethiopian'`, `'General'` |
| `minhag_scope` | TEXT | DEFAULT 'global' | `'global'`, `'regional'`, `'local'`, `'family'`, `'chassidic'` |
| `authority_weight` | REAL | DEFAULT 1.0 | 0.0 for non-canonical, varies for canonical |
| `corpus_tier` | TEXT | NOT NULL | Denormalized from corpora for fast filtering |
| `tags` | TEXT[] | DEFAULT '{}' | Freeform tags |
| `topics` | TEXT[] | DEFAULT '{}' | Topic classifications |
| `embedding` | VECTOR(1024) | | BGE-M3 embedding, NULL until worker processes |
| `search_tsv` | TSVECTOR | GENERATED ALWAYS | Auto-generated from `text` for full-text search |
| `created_at` | TIMESTAMP | DEFAULT now() | |

### 3. `halacha_relations`

Tracks relationships between chunks (arguments, supports, overrides, etc.).

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | |
| `from_chunk_id` | INT | REFERENCES halacha_chunks(id) | Source chunk |
| `to_chunk_id` | INT | REFERENCES halacha_chunks(id) | Target chunk |
| `relation_type` | TEXT | NOT NULL | See relation types below |
| `direction` | TEXT | DEFAULT 'directed' | `'directed'` or `'bidirectional'` |
| `confidence` | REAL | DEFAULT 1.0 | 1.0 = human-verified, <1.0 = AI-inferred |
| `notes` | TEXT | | Explanation of the relationship |
| `created_by` | TEXT | | Who created this relation |
| `created_at` | TIMESTAMP | DEFAULT now() | |

**Relation types:**
- `argues_with` — disagrees or presents counter-opinion
- `supports` — agrees or provides additional evidence
- `quotes` — directly quotes the target
- `based_on` — derives ruling from the target
- `minhag_override` — local custom overrides general ruling
- `supersedes` — later authority overrules earlier
- `contextualizes` — provides historical/conceptual context

### 4. `user_profiles`

User preferences and role configuration.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | |
| `display_name` | TEXT | | User's display name |
| `primary_community` | TEXT | DEFAULT 'General' | Primary halakhic community |
| `secondary_customs` | TEXT[] | DEFAULT '{}' | Additional customs observed |
| `preferred_poskim` | TEXT[] | DEFAULT '{}' | Preferred decisors |
| `corpus_tiers` | TEXT[] | DEFAULT '{canonical}' | Which corpus tiers the user can access |
| `language_pref` | TEXT | DEFAULT 'en' | Preferred output language |
| `role` | TEXT | DEFAULT 'learner' | `'learner'`, `'advanced'`, `'posek'`, `'researcher'` |
| `created_at` | TIMESTAMP | DEFAULT now() | |

### 5. `halacha_answers`

Logged answers for review, learning loop, and similarity search.

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `id` | SERIAL | PRIMARY KEY | |
| `question` | TEXT | NOT NULL | Original user question |
| `question_embedding` | VECTOR(1024) | | Embedding for similarity search |
| `answer` | TEXT | NOT NULL | Generated answer |
| `cited_chunk_ids` | INT[] | DEFAULT '{}' | IDs of chunks used in generation |
| `user_id` | INT | REFERENCES user_profiles(id) | Who asked |
| `user_community` | TEXT | | Community at time of query |
| `corpus_tiers_used` | TEXT[] | | Which tiers were searched |
| `mode` | TEXT | | `'practical'`, `'deep_research'`, `'posek_view'` |
| `reviewed_by` | TEXT | | Reviewer identifier |
| `review_status` | TEXT | DEFAULT 'unreviewed' | `'unreviewed'`, `'approved'`, `'corrected'`, `'rejected'` |
| `review_notes` | TEXT | | Reviewer comments |
| `correction` | TEXT | | Corrected answer if applicable |
| `created_at` | TIMESTAMP | DEFAULT now() | |

## Indexes

### halacha_chunks

```sql
-- Vector similarity search (HNSW for fast approximate nearest neighbor)
CREATE INDEX idx_chunks_embedding ON halacha_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Full-text search
CREATE INDEX idx_chunks_search_tsv ON halacha_chunks USING gin (search_tsv);

-- Filtering indexes
CREATE INDEX idx_chunks_corpus_tier ON halacha_chunks USING btree (corpus_tier);
CREATE INDEX idx_chunks_community ON halacha_chunks USING btree (community);
CREATE INDEX idx_chunks_tags ON halacha_chunks USING gin (tags);
CREATE INDEX idx_chunks_parent_ref ON halacha_chunks USING btree (parent_ref);
```

### halacha_answers

```sql
-- Similar question search
CREATE INDEX idx_answers_question_embedding ON halacha_answers
  USING hnsw (question_embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Review workflow
CREATE INDEX idx_answers_review_status ON halacha_answers USING btree (review_status);
```

## Hybrid Search Algorithm

The search combines vector similarity and keyword matching using Reciprocal Rank Fusion:

```
1. question → embedQuestion() → 1024-dim vector

2. Semantic search:
   SELECT id, embedding <=> $questionEmbedding AS distance
   FROM halacha_chunks
   WHERE corpus_tier = ANY($tiers)
   ORDER BY distance ASC
   LIMIT 60

3. Keyword search:
   SELECT id, ts_rank(search_tsv, plainto_tsquery('simple', $question)) AS rank
   FROM halacha_chunks
   WHERE search_tsv @@ plainto_tsquery('simple', $question)
     AND corpus_tier = ANY($tiers)
   ORDER BY rank DESC
   LIMIT 60

4. Reciprocal Rank Fusion (k=60):
   rrfScore = 1/(60 + semantic_rank) + 1/(60 + keyword_rank)

5. Community/tier boosting:
   +0.15 if community matches user
   +0.05 if community = 'General'
   +0.10 if corpus_tier = 'canonical'

6. Take top 40 → load parent chunks + related chunks
```

## Data Integrity Rules

- Non-canonical chunks (`corpus_tier != 'canonical'`) MUST have `authority_weight = 0.0`
- `corpus_tier` in halacha_chunks must match the parent corpus record
- `section_ref` should follow consistent format per work type
- `parent_ref` should match another chunk's `section_ref` or be NULL for top-level entries
