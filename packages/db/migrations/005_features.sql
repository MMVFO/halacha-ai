-- Migration 005: Feature sprint tables
-- Text links, dictionary, topics, bookmarks, annotations,
-- reading history, study progress, study sheets, research sessions, rabbis

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

-- Topics
CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_he TEXT,
  description TEXT,
  embedding VECTOR(1024),
  created_at TIMESTAMP DEFAULT now()
);

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
