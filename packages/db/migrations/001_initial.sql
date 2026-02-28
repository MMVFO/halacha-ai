-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- Corpora table
CREATE TABLE IF NOT EXISTS corpora (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  corpus_tier TEXT NOT NULL CHECK (corpus_tier IN ('canonical','apocrypha','pseudepigrapha','academic','private')),
  source_url TEXT,
  license TEXT,
  ingested_at TIMESTAMP DEFAULT now()
);

-- Halacha chunks table
CREATE TABLE IF NOT EXISTS halacha_chunks (
  id SERIAL PRIMARY KEY,
  corpus_id INT REFERENCES corpora(id) ON DELETE CASCADE,
  work TEXT NOT NULL,
  section_ref TEXT NOT NULL,
  parent_ref TEXT,
  language TEXT NOT NULL CHECK (language IN ('he','en','arc')),
  text TEXT NOT NULL,
  author TEXT,
  era TEXT CHECK (era IN ('Tanna','Amora','Gaon','Rishon','Acharon','Modern','Second Temple')),
  community TEXT DEFAULT 'General' CHECK (community IN ('Ashkenazi','Sephardi','Chabad','Yemenite','Ethiopian','General','Qumran')),
  minhag_scope TEXT DEFAULT 'global' CHECK (minhag_scope IN ('global','regional','local','family','chassidic')),
  authority_weight REAL DEFAULT 1.0,
  corpus_tier TEXT NOT NULL CHECK (corpus_tier IN ('canonical','apocrypha','pseudepigrapha','academic','private')),
  tags TEXT[] DEFAULT '{}',
  topics TEXT[] DEFAULT '{}',
  embedding vector(1024),
  search_tsv TSVECTOR GENERATED ALWAYS AS (to_tsvector('simple', text)) STORED,
  created_at TIMESTAMP DEFAULT now()
);

-- Halacha chunks indexes
CREATE INDEX idx_chunks_embedding ON halacha_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_chunks_search_tsv ON halacha_chunks USING gin (search_tsv);
CREATE INDEX idx_chunks_corpus_tier ON halacha_chunks USING btree (corpus_tier);
CREATE INDEX idx_chunks_community ON halacha_chunks USING btree (community);
CREATE INDEX idx_chunks_tags ON halacha_chunks USING gin (tags);
CREATE INDEX idx_chunks_parent_ref ON halacha_chunks USING btree (parent_ref);
CREATE INDEX idx_chunks_corpus_id ON halacha_chunks USING btree (corpus_id);
CREATE INDEX idx_chunks_work ON halacha_chunks USING btree (work);
CREATE INDEX idx_chunks_section_ref ON halacha_chunks USING btree (section_ref);

-- Halacha relations table
CREATE TABLE IF NOT EXISTS halacha_relations (
  id SERIAL PRIMARY KEY,
  from_chunk_id INT REFERENCES halacha_chunks(id) ON DELETE CASCADE,
  to_chunk_id INT REFERENCES halacha_chunks(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL CHECK (relation_type IN ('argues_with','supports','quotes','based_on','minhag_override','supersedes','contextualizes')),
  direction TEXT DEFAULT 'directed' CHECK (direction IN ('directed','bidirectional')),
  confidence REAL DEFAULT 1.0,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_relations_from ON halacha_relations USING btree (from_chunk_id);
CREATE INDEX idx_relations_to ON halacha_relations USING btree (to_chunk_id);
CREATE INDEX idx_relations_type ON halacha_relations USING btree (relation_type);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  display_name TEXT,
  primary_community TEXT DEFAULT 'General',
  secondary_customs TEXT[] DEFAULT '{}',
  preferred_poskim TEXT[] DEFAULT '{}',
  corpus_tiers TEXT[] DEFAULT '{canonical}',
  language_pref TEXT DEFAULT 'en',
  role TEXT DEFAULT 'learner' CHECK (role IN ('learner','advanced','posek','researcher')),
  created_at TIMESTAMP DEFAULT now()
);

-- Halacha answers table
CREATE TABLE IF NOT EXISTS halacha_answers (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  question_embedding vector(1024),
  answer TEXT NOT NULL,
  cited_chunk_ids INT[] DEFAULT '{}',
  user_id INT REFERENCES user_profiles(id) ON DELETE SET NULL,
  user_community TEXT,
  corpus_tiers_used TEXT[],
  mode TEXT CHECK (mode IN ('practical','deep_research','posek_view')),
  reviewed_by TEXT,
  review_status TEXT DEFAULT 'unreviewed' CHECK (review_status IN ('unreviewed','approved','corrected','rejected')),
  review_notes TEXT,
  correction TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_answers_question_embedding ON halacha_answers
  USING hnsw (question_embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_answers_review_status ON halacha_answers USING btree (review_status);
CREATE INDEX idx_answers_user_id ON halacha_answers USING btree (user_id);
CREATE INDEX idx_answers_created_at ON halacha_answers USING btree (created_at DESC);
