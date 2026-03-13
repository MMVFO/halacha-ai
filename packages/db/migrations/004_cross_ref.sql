-- Cross-reference infrastructure: unique constraints, indexes, and sync tables

-- Prevent duplicate relations
CREATE UNIQUE INDEX IF NOT EXISTS idx_relations_unique
  ON halacha_relations (from_chunk_id, to_chunk_id, relation_type);

-- Track which system created each relation
CREATE INDEX IF NOT EXISTS idx_relations_created_by
  ON halacha_relations USING btree (created_by);

-- Sefaria ref mapping: maps Sefaria-format refs to our chunk IDs
CREATE TABLE IF NOT EXISTS sefaria_ref_map (
  id SERIAL PRIMARY KEY,
  sefaria_ref TEXT NOT NULL,
  chunk_id INT REFERENCES halacha_chunks(id) ON DELETE CASCADE,
  work TEXT NOT NULL,
  UNIQUE(sefaria_ref)
);

CREATE INDEX IF NOT EXISTS idx_sefaria_ref ON sefaria_ref_map USING btree (sefaria_ref);
CREATE INDEX IF NOT EXISTS idx_sefaria_ref_work ON sefaria_ref_map USING btree (work);

-- Materialized view for fast work search (8K rows instead of 4.6M)
CREATE MATERIALIZED VIEW IF NOT EXISTS works_summary AS
SELECT
  work,
  language,
  community,
  corpus_tier,
  MIN(author) as author,
  MIN(era) as era,
  COUNT(*)::int as chunk_count
FROM halacha_chunks
GROUP BY work, language, community, corpus_tier
ORDER BY chunk_count DESC;

CREATE INDEX IF NOT EXISTS idx_works_summary_work_trgm ON works_summary USING gin (work gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_works_summary_language ON works_summary USING btree (language);

-- Sefaria sync log: tracks which works have been synced and when
CREATE TABLE IF NOT EXISTS sefaria_sync_log (
  id SERIAL PRIMARY KEY,
  work TEXT NOT NULL,
  sefaria_title TEXT NOT NULL,
  last_fetched_at TIMESTAMP,
  link_count INT DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','fetched','mapped','error')),
  UNIQUE(sefaria_title)
);
