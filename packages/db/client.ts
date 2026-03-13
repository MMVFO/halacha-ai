import pg from "pg";
import pgvector from "pgvector/pg";
import type {
  Corpus, InsertCorpus, HalachaChunk, InsertChunk,
  HalachaAnswer, InsertAnswer, HalachaRelation, UserProfile,
  CorpusTier, ReviewStatus,
  TextLink, InsertTextLink, DictionaryEntry, InsertDictionaryEntry,
  Bookmark, Annotation, ReadingHistoryEntry, StudyProgress,
  StudySheet, StudySheetItem, ResearchSession, Rabbi, RabbiWork,
} from "./schema";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

pool.on("connect", async (client) => {
  await pgvector.registerType(client);
});

export { pool };

// --- Corpora ---

export async function insertCorpus(c: InsertCorpus): Promise<Corpus> {
  const { rows } = await pool.query(
    `INSERT INTO corpora (name, corpus_tier, source_url, license)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [c.name, c.corpus_tier, c.source_url ?? null, c.license ?? null]
  );
  return rows[0];
}

export async function findCorpusByName(name: string): Promise<Corpus | null> {
  const { rows } = await pool.query(
    `SELECT * FROM corpora WHERE name = $1 LIMIT 1`,
    [name]
  );
  return rows[0] ?? null;
}

// --- Chunks ---

export async function insertChunk(c: InsertChunk): Promise<HalachaChunk> {
  const { rows } = await pool.query(
    `INSERT INTO halacha_chunks
       (corpus_id, work, section_ref, parent_ref, language, text, author, era,
        community, minhag_scope, authority_weight, corpus_tier, tags, topics)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING *`,
    [
      c.corpus_id, c.work, c.section_ref, c.parent_ref ?? null,
      c.language, c.text, c.author ?? null, c.era ?? null,
      c.community ?? "General", c.minhag_scope ?? "global",
      c.authority_weight ?? 1.0, c.corpus_tier,
      c.tags ?? [], c.topics ?? [],
    ]
  );
  return rows[0];
}

export async function insertChunksBatch(chunks: InsertChunk[]): Promise<number> {
  if (chunks.length === 0) return 0;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let count = 0;
    for (const c of chunks) {
      await client.query(
        `INSERT INTO halacha_chunks
           (corpus_id, work, section_ref, parent_ref, language, text, author, era,
            community, minhag_scope, authority_weight, corpus_tier, tags, topics)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          c.corpus_id, c.work, c.section_ref, c.parent_ref ?? null,
          c.language, c.text, c.author ?? null, c.era ?? null,
          c.community ?? "General", c.minhag_scope ?? "global",
          c.authority_weight ?? 1.0, c.corpus_tier,
          c.tags ?? [], c.topics ?? [],
        ]
      );
      count++;
    }
    await client.query("COMMIT");
    return count;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getChunksWithNullEmbedding(limit: number): Promise<HalachaChunk[]> {
  const { rows } = await pool.query(
    `SELECT * FROM halacha_chunks WHERE embedding IS NULL LIMIT $1`,
    [limit]
  );
  return rows;
}

export async function updateChunkEmbedding(id: number, embedding: number[]): Promise<void> {
  await pool.query(
    `UPDATE halacha_chunks SET embedding = $1 WHERE id = $2`,
    [pgvector.toSql(embedding), id]
  );
}

export async function getChunksByIds(ids: number[]): Promise<HalachaChunk[]> {
  if (ids.length === 0) return [];
  const { rows } = await pool.query(
    `SELECT * FROM halacha_chunks WHERE id = ANY($1)`,
    [ids]
  );
  return rows;
}

export async function getChunksByParentRef(parentRef: string): Promise<HalachaChunk[]> {
  const { rows } = await pool.query(
    `SELECT * FROM halacha_chunks WHERE parent_ref = $1 OR section_ref = $1`,
    [parentRef]
  );
  return rows;
}

// --- Semantic search ---

export async function semanticSearch(
  embedding: number[],
  corpusTiers: CorpusTier[],
  limit: number = 60
): Promise<{ id: number; distance: number }[]> {
  const { rows } = await pool.query(
    `SELECT id, embedding <=> $1 AS distance
     FROM halacha_chunks
     WHERE corpus_tier = ANY($2) AND embedding IS NOT NULL
     ORDER BY distance ASC
     LIMIT $3`,
    [pgvector.toSql(embedding), corpusTiers, limit]
  );
  return rows;
}

// --- Keyword search ---

export async function keywordSearch(
  question: string,
  corpusTiers: CorpusTier[],
  limit: number = 60,
  expandedTerms?: string[]
): Promise<{ id: number; rank: number }[]> {
  // When expanded terms provided, build an OR tsquery for fuzzy matching
  if (expandedTerms && expandedTerms.length > 0) {
    const tsTerms = expandedTerms
      .map((t) => t.replace(/[^a-zA-Z0-9\s\u0590-\u05FF]/g, "").trim())
      .filter((t) => t.length >= 2)
      .map((t) => t.split(/\s+/).join(" & "));
    const tsQueryStr = [...new Set(tsTerms)].join(" | ");

    if (tsQueryStr) {
      const { rows } = await pool.query(
        `SELECT id, ts_rank(search_tsv, to_tsquery('simple', $1)) AS rank
         FROM halacha_chunks
         WHERE search_tsv @@ to_tsquery('simple', $1)
           AND corpus_tier = ANY($2)
         ORDER BY rank DESC
         LIMIT $3`,
        [tsQueryStr, corpusTiers, limit]
      );
      return rows;
    }
  }

  // Original behavior (backward compatible)
  const { rows } = await pool.query(
    `SELECT id, ts_rank(search_tsv, plainto_tsquery('simple', $1)) AS rank
     FROM halacha_chunks
     WHERE search_tsv @@ plainto_tsquery('simple', $1)
       AND corpus_tier = ANY($2)
     ORDER BY rank DESC
     LIMIT $3`,
    [question, corpusTiers, limit]
  );
  return rows;
}

// --- Synonym expansion ---

export async function expandSynonyms(term: string): Promise<string[]> {
  const lower = term.toLowerCase().trim();
  if (!lower) return [term];

  // Exact match on canonical or alias
  const { rows } = await pool.query(
    `SELECT DISTINCT unnest(ARRAY[canonical, alias]) AS term
     FROM hebrew_synonyms
     WHERE lower(canonical) = $1 OR lower(alias) = $1`,
    [lower]
  );
  const terms = new Set<string>(rows.map((r: { term: string }) => r.term));

  // Also check if the term appears as a word within multi-word synonyms
  // e.g. "Shulhan" matches alias "Shulhan Aruch" → returns canonical "Shulchan Arukh"
  if (terms.size <= 1) {
    const { rows: partialRows } = await pool.query(
      `SELECT DISTINCT unnest(ARRAY[canonical, alias]) AS term
       FROM hebrew_synonyms
       WHERE lower(canonical) LIKE '%' || $1 || '%'
          OR lower(alias) LIKE '%' || $1 || '%'`,
      [lower]
    );
    for (const r of partialRows) {
      // Extract individual words from matched synonyms
      for (const word of (r as { term: string }).term.split(/\s+/)) {
        terms.add(word);
      }
    }
  }

  if (!Array.from(terms).some((t) => t.toLowerCase() === lower)) {
    terms.add(term);
  }
  return [...terms];
}

// --- Relations ---

export interface InsertRelation {
  from_chunk_id: number;
  to_chunk_id: number;
  relation_type: string;
  direction?: string;
  confidence?: number;
  notes?: string;
  created_by?: string;
}

/**
 * Batch insert relations using unnest() for high throughput.
 * Uses ON CONFLICT DO NOTHING to skip duplicates.
 * Returns the number of rows actually inserted.
 */
export async function insertRelationsBatch(relations: InsertRelation[]): Promise<number> {
  if (relations.length === 0) return 0;

  const fromIds = relations.map(r => r.from_chunk_id);
  const toIds = relations.map(r => r.to_chunk_id);
  const types = relations.map(r => r.relation_type);
  const directions = relations.map(r => r.direction ?? "bidirectional");
  const confidences = relations.map(r => r.confidence ?? 1.0);
  const notes = relations.map(r => r.notes ?? null);
  const createdBys = relations.map(r => r.created_by ?? null);

  const result = await pool.query(
    `INSERT INTO halacha_relations (from_chunk_id, to_chunk_id, relation_type, direction, confidence, notes, created_by)
     SELECT * FROM unnest(
       $1::int[], $2::int[], $3::text[], $4::text[], $5::real[], $6::text[], $7::text[]
     )
     ON CONFLICT (from_chunk_id, to_chunk_id, relation_type) DO NOTHING`,
    [fromIds, toIds, types, directions, confidences, notes, createdBys]
  );
  return result.rowCount ?? 0;
}

/**
 * Get all distinct work names from the chunks table.
 */
export async function getDistinctWorks(): Promise<string[]> {
  const { rows } = await pool.query(
    `SELECT DISTINCT work FROM halacha_chunks ORDER BY work`
  );
  return rows.map((r: { work: string }) => r.work);
}

/**
 * Get all chunk IDs and section_refs for a given work (for structural linking).
 * Returns minimal data to avoid loading full text into memory.
 */
export async function getChunkRefsForWork(work: string): Promise<{ id: number; section_ref: string; parent_ref: string | null }[]> {
  const { rows } = await pool.query(
    `SELECT id, section_ref, parent_ref FROM halacha_chunks WHERE work = $1 ORDER BY id`,
    [work]
  );
  return rows;
}

/**
 * Find chunk IDs matching a section_ref in a specific work.
 * Uses hierarchical matching: exact → parent_ref → prefix.
 */
export async function findChunksByRef(
  work: string,
  sectionRef: string,
): Promise<number[]> {
  // Try exact match first
  const { rows: exact } = await pool.query(
    `SELECT id FROM halacha_chunks WHERE work = $1 AND section_ref = $2 LIMIT 5`,
    [work, sectionRef]
  );
  if (exact.length > 0) return exact.map((r: { id: number }) => r.id);

  // Try parent_ref match
  const { rows: parent } = await pool.query(
    `SELECT id FROM halacha_chunks WHERE work = $1 AND parent_ref = $2 LIMIT 5`,
    [work, sectionRef]
  );
  if (parent.length > 0) return parent.map((r: { id: number }) => r.id);

  // Try prefix match on section_ref
  const { rows: prefix } = await pool.query(
    `SELECT id FROM halacha_chunks WHERE work = $1 AND section_ref LIKE $2 LIMIT 5`,
    [work, sectionRef + "%"]
  );
  return prefix.map((r: { id: number }) => r.id);
}

/**
 * Get relations for a specific section, looking up the chunk first.
 * Used by the Reader UI to show cross-references.
 */
export async function getRelationsForSection(
  sectionRef: string,
  work: string,
  limit: number = 20
): Promise<{ chunk: HalachaChunk; relation_type: string; confidence: number }[]> {
  const { rows } = await pool.query(
    `SELECT * FROM (
       SELECT DISTINCT ON (c.id)
         c.id, c.corpus_id, c.work, c.section_ref, c.parent_ref,
         c.language, c.text, c.author, c.era, c.community,
         c.minhag_scope, c.authority_weight, c.corpus_tier,
         c.tags, c.topics, c.created_at,
         r.relation_type, r.confidence
       FROM halacha_chunks src
       JOIN halacha_relations r ON (r.from_chunk_id = src.id OR r.to_chunk_id = src.id)
       JOIN halacha_chunks c ON c.id = CASE
         WHEN r.from_chunk_id = src.id THEN r.to_chunk_id
         ELSE r.from_chunk_id
       END
       WHERE src.section_ref = $1 AND src.work = $2
       ORDER BY c.id, r.confidence DESC
     ) sub
     ORDER BY sub.confidence DESC, sub.corpus_tier ASC
     LIMIT $3`,
    [sectionRef, work, limit]
  );
  // Reshape flat rows into { chunk, relation_type, confidence }
  return rows.map((row: any) => {
    const { relation_type, confidence, ...chunkData } = row;
    return { chunk: chunkData as HalachaChunk, relation_type, confidence };
  });
}

/**
 * Get relation statistics for admin dashboard.
 */
export async function getRelationStats(): Promise<{
  total: number;
  byType: Record<string, number>;
  byCreatedBy: Record<string, number>;
}> {
  const [totalRes, typeRes, creatorRes] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int as total FROM halacha_relations`),
    pool.query(`SELECT relation_type, COUNT(*)::int as count FROM halacha_relations GROUP BY relation_type`),
    pool.query(`SELECT created_by, COUNT(*)::int as count FROM halacha_relations GROUP BY created_by`),
  ]);
  const byType: Record<string, number> = {};
  for (const r of typeRes.rows) byType[r.relation_type] = r.count;
  const byCreatedBy: Record<string, number> = {};
  for (const r of creatorRes.rows) byCreatedBy[r.created_by ?? "unknown"] = r.count;
  return { total: totalRes.rows[0].total, byType, byCreatedBy };
}

export async function getRelationsForChunks(
  chunkIds: number[],
  types: string[] = ['argues_with', 'supports', 'minhag_override', 'contextualizes']
): Promise<HalachaRelation[]> {
  if (chunkIds.length === 0) return [];
  const { rows } = await pool.query(
    `SELECT * FROM halacha_relations
     WHERE (from_chunk_id = ANY($1) OR to_chunk_id = ANY($1))
       AND relation_type = ANY($2)`,
    [chunkIds, types]
  );
  return rows;
}

// --- User profiles ---

export async function getUserProfile(id: number): Promise<UserProfile | null> {
  const { rows } = await pool.query(
    `SELECT * FROM user_profiles WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

// --- Answers ---

export async function insertAnswer(a: InsertAnswer): Promise<HalachaAnswer> {
  const { rows } = await pool.query(
    `INSERT INTO halacha_answers
       (question, question_embedding, answer, cited_chunk_ids,
        user_id, user_community, corpus_tiers_used, mode)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      a.question,
      a.question_embedding ? pgvector.toSql(a.question_embedding) : null,
      a.answer,
      a.cited_chunk_ids ?? [],
      a.user_id ?? null,
      a.user_community ?? null,
      a.corpus_tiers_used ?? null,
      a.mode ?? null,
    ]
  );
  return rows[0];
}

export async function getAnswers(filters: {
  reviewStatus?: ReviewStatus;
  limit?: number;
  offset?: number;
}): Promise<HalachaAnswer[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (filters.reviewStatus) {
    conditions.push(`review_status = $${idx++}`);
    params.push(filters.reviewStatus);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  params.push(limit, offset);

  const { rows } = await pool.query(
    `SELECT * FROM halacha_answers ${where}
     ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
    params
  );
  return rows;
}

export async function updateAnswerReview(
  id: number,
  data: { review_status: ReviewStatus; reviewed_by: string; review_notes?: string; correction?: string }
): Promise<HalachaAnswer | null> {
  const { rows } = await pool.query(
    `UPDATE halacha_answers
     SET review_status = $1, reviewed_by = $2, review_notes = $3, correction = $4
     WHERE id = $5
     RETURNING *`,
    [data.review_status, data.reviewed_by, data.review_notes ?? null, data.correction ?? null, id]
  );
  return rows[0] ?? null;
}

export async function findSimilarAnswers(
  embedding: number[],
  limit: number = 5
): Promise<HalachaAnswer[]> {
  const { rows } = await pool.query(
    `SELECT *, question_embedding <=> $1 AS distance
     FROM halacha_answers
     WHERE question_embedding IS NOT NULL
     ORDER BY distance ASC
     LIMIT $2`,
    [pgvector.toSql(embedding), limit]
  );
  return rows;
}

export async function countNullEmbeddings(): Promise<number> {
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS count FROM halacha_chunks WHERE embedding IS NULL`
  );
  return parseInt(rows[0].count, 10);
}

/**
 * Batch-update embeddings for multiple chunks in a single transaction.
 * Uses unnest() for a single round-trip UPDATE instead of N individual queries.
 */
export async function updateChunkEmbeddingsBatch(
  updates: { id: number; embedding: number[] }[]
): Promise<number> {
  if (updates.length === 0) return 0;
  const client = await pool.connect();
  try {
    const ids = updates.map((u) => u.id);
    const vectors = updates.map((u) => pgvector.toSql(u.embedding));
    await client.query(
      `UPDATE halacha_chunks AS c
       SET embedding = v.vec::vector
       FROM unnest($1::int[], $2::text[]) AS v(id, vec)
       WHERE c.id = v.id`,
      [ids, vectors]
    );
    return updates.length;
  } finally {
    client.release();
  }
}

/**
 * Fetch chunk IDs and text (only) for chunks missing embeddings.
 * Lighter than SELECT * — avoids pulling all columns we don't need.
 */
export async function getChunksForEmbedding(
  limit: number,
  afterId: number = 0
): Promise<{ id: number; text: string }[]> {
  const { rows } = await pool.query(
    `SELECT id, text FROM halacha_chunks
     WHERE embedding IS NULL AND id > $1
     ORDER BY id ASC LIMIT $2`,
    [afterId, limit]
  );
  return rows;
}

// --- Reader (text browsing) ---

export interface WorkSummary {
  work: string;
  language: string;
  community: string;
  corpus_tier: string;
  author: string | null;
  era: string | null;
  chunk_count: number;
}

/**
 * List all distinct works with metadata. Optionally filter by search query.
 * Returns { works, total } for pagination.
 */
export async function getWorks(opts?: {
  search?: string;
  searchVariants?: string[];
  language?: string;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<{ works: WorkSummary[]; total: number }> {
  const { search, searchVariants, language, category, limit = 100, offset = 0 } = opts ?? {};
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let pIdx = 0;

  // Uses works_summary materialized view (8K rows) instead of halacha_chunks (4.6M rows)
  if (search) {
    if (searchVariants && searchVariants.length > 0) {
      const variantConds: string[] = [];
      for (const variant of searchVariants) {
        pIdx++;
        variantConds.push(`work ILIKE $${pIdx}`);
        params.push(`%${variant}%`);
      }
      // pg_trgm fallback using %> operator (index-friendly on materialized view)
      pIdx++;
      variantConds.push(`$${pIdx} %> work`);
      params.push(search.toLowerCase());
      conditions.push(`(${variantConds.join(" OR ")})`);
    } else {
      pIdx++;
      conditions.push(`work ILIKE $${pIdx}`);
      params.push(`%${search}%`);
    }
  }
  if (language) {
    pIdx++;
    conditions.push(`language = $${pIdx}`);
    params.push(language);
  }
  if (category) {
    pIdx++;
    conditions.push(`work IN (SELECT work_name FROM works WHERE category = $${pIdx})`);
    params.push(category);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await pool.query(
    `SELECT COUNT(*)::int as total FROM works_summary ${where}`,
    params.slice(0, pIdx)
  );
  const total = parseInt(countResult.rows[0].total, 10);

  pIdx++;
  const limitParam = pIdx;
  params.push(limit);
  pIdx++;
  const offsetParam = pIdx;
  params.push(offset);

  const { rows } = await pool.query(
    `SELECT work, language, community, corpus_tier, author, era, chunk_count
     FROM works_summary
     ${where}
     ORDER BY chunk_count DESC
     LIMIT $${limitParam} OFFSET $${offsetParam}`,
    params
  );
  return { works: rows, total };
}

/**
 * Get the table of contents for a work: distinct top-level section groupings.
 */
export async function getWorkTOC(work: string): Promise<{
  sections: { section_ref: string; parent_ref: string | null }[];
  total: number;
}> {
  const { rows } = await pool.query(
    `SELECT DISTINCT section_ref, parent_ref
     FROM halacha_chunks
     WHERE work = $1
     ORDER BY section_ref`,
    [work]
  );
  return { sections: rows, total: rows.length };
}

/**
 * Get chunks for a specific work, paginated by section ordering.
 */
export async function getWorkText(
  work: string,
  opts?: { sectionPrefix?: string; language?: string; limit?: number; offset?: number }
): Promise<{ chunks: HalachaChunk[]; total: number }> {
  const { sectionPrefix, language, limit = 50, offset = 0 } = opts ?? {};
  const conditions = ["work = $1"];
  const params: (string | number)[] = [work];
  let pIdx = 1;

  if (sectionPrefix) {
    pIdx++;
    conditions.push(`section_ref LIKE $${pIdx}`);
    params.push(`${sectionPrefix}%`);
  }
  if (language) {
    pIdx++;
    conditions.push(`language = $${pIdx}`);
    params.push(language);
  }

  const where = conditions.join(" AND ");

  const countResult = await pool.query(
    `SELECT COUNT(*)::int as total FROM halacha_chunks WHERE ${where}`,
    params
  );
  const total = countResult.rows[0].total;

  pIdx++;
  const limitP = pIdx;
  params.push(limit);
  pIdx++;
  const offsetP = pIdx;
  params.push(offset);

  const { rows } = await pool.query(
    `SELECT * FROM halacha_chunks WHERE ${where}
     ORDER BY id ASC
     LIMIT $${limitP} OFFSET $${offsetP}`,
    params
  );
  return { chunks: rows, total };
}

/**
 * Get a single chunk by ID with its relations.
 */
export async function getChunkWithRelations(chunkId: number): Promise<{
  chunk: HalachaChunk | null;
  related: { chunk: HalachaChunk; relation_type: string; direction: string }[];
}> {
  const { rows } = await pool.query(
    `SELECT * FROM halacha_chunks WHERE id = $1`,
    [chunkId]
  );
  const chunk = rows[0] ?? null;
  if (!chunk) return { chunk: null, related: [] };

  const relResult = await pool.query(
    `SELECT r.relation_type, r.direction, c.*
     FROM halacha_relations r
     JOIN halacha_chunks c ON c.id = CASE
       WHEN r.from_chunk_id = $1 THEN r.to_chunk_id
       ELSE r.from_chunk_id
     END
     WHERE r.from_chunk_id = $1 OR r.to_chunk_id = $1
     LIMIT 20`,
    [chunkId]
  );
  const related = relResult.rows.map((r: Record<string, unknown>) => ({
    chunk: r as unknown as HalachaChunk,
    relation_type: r.relation_type as string,
    direction: r.direction as string,
  }));

  return { chunk, related };
}

/**
 * Find cross-references: other chunks from different works with similar section refs.
 */
export async function findCrossReferences(
  sectionRef: string,
  work: string,
  limit: number = 10
): Promise<HalachaChunk[]> {
  const parts = sectionRef.split(",").map((p) => p.trim());
  const searchTerm = parts[parts.length - 2] || parts[0];

  const { rows } = await pool.query(
    `SELECT * FROM halacha_chunks
     WHERE work != $1
       AND (section_ref ILIKE $2 OR parent_ref ILIKE $2)
     ORDER BY corpus_tier ASC, authority_weight DESC
     LIMIT $3`,
    [work, `%${searchTerm}%`, limit]
  );
  return rows;
}

// --- Text Links ---

export async function insertTextLinksBatch(links: InsertTextLink[]): Promise<number> {
  if (links.length === 0) return 0;
  const sourceRefs = links.map(l => l.source_ref);
  const targetRefs = links.map(l => l.target_ref);
  const linkTypes = links.map(l => l.link_type ?? 'reference');
  const sourceWorks = links.map(l => l.source_work ?? null);
  const targetWorks = links.map(l => l.target_work ?? null);

  const result = await pool.query(
    `INSERT INTO text_links (source_ref, target_ref, link_type, source_work, target_work)
     SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[])`,
    [sourceRefs, targetRefs, linkTypes, sourceWorks, targetWorks]
  );
  return result.rowCount ?? 0;
}

export async function getTextLinksForRef(ref: string): Promise<TextLink[]> {
  const { rows } = await pool.query(
    `SELECT * FROM text_links WHERE source_ref = $1 OR target_ref = $1`,
    [ref]
  );
  return rows;
}

// --- Dictionary ---

export async function searchDictionary(word: string): Promise<DictionaryEntry[]> {
  const { rows } = await pool.query(
    `SELECT *, similarity(word_normalized, $1) AS sim
     FROM dictionary_entries
     WHERE word = $1 OR word_normalized = $1 OR word_normalized % $1
     ORDER BY sim DESC
     LIMIT 20`,
    [word]
  );
  return rows;
}

export async function insertDictionaryBatch(entries: InsertDictionaryEntry[]): Promise<number> {
  if (entries.length === 0) return 0;
  const words = entries.map(e => e.word);
  const normals = entries.map(e => e.word_normalized);
  const langs = entries.map(e => e.language ?? 'arc');
  const defs = entries.map(e => e.definition);
  const roots = entries.map(e => e.root ?? null);
  const pos = entries.map(e => e.part_of_speech ?? null);
  const sources = entries.map(e => e.source ?? 'jastrow');

  const result = await pool.query(
    `INSERT INTO dictionary_entries (word, word_normalized, language, definition, root, part_of_speech, source)
     SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::text[])`,
    [words, normals, langs, defs, roots, pos, sources]
  );
  return result.rowCount ?? 0;
}

// --- Bookmarks ---

export async function getBookmarks(userId: number): Promise<Bookmark[]> {
  const { rows } = await pool.query(
    `SELECT * FROM bookmarks WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

export async function toggleBookmark(
  userId: number,
  chunkId: number,
  label?: string,
  color?: string
): Promise<{ action: 'added' | 'removed'; bookmark?: Bookmark }> {
  const { rows: existing } = await pool.query(
    `SELECT * FROM bookmarks WHERE user_id = $1 AND chunk_id = $2`,
    [userId, chunkId]
  );
  if (existing.length > 0) {
    await pool.query(`DELETE FROM bookmarks WHERE id = $1`, [existing[0].id]);
    return { action: 'removed' };
  }
  const { rows } = await pool.query(
    `INSERT INTO bookmarks (user_id, chunk_id, label, color)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, chunkId, label ?? null, color ?? '#d4af37']
  );
  return { action: 'added', bookmark: rows[0] };
}

// --- Annotations ---

export async function getAnnotations(userId: number, chunkId?: number): Promise<Annotation[]> {
  if (chunkId) {
    const { rows } = await pool.query(
      `SELECT * FROM annotations WHERE user_id = $1 AND chunk_id = $2 ORDER BY created_at DESC`,
      [userId, chunkId]
    );
    return rows;
  }
  const { rows } = await pool.query(
    `SELECT * FROM annotations WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

export async function createAnnotation(data: {
  user_id: number;
  chunk_id: number;
  annotation_type?: string;
  content?: string;
  highlight_start?: number;
  highlight_end?: number;
  color?: string;
  tags?: string[];
}): Promise<Annotation> {
  const { rows } = await pool.query(
    `INSERT INTO annotations (user_id, chunk_id, annotation_type, content, highlight_start, highlight_end, color, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      data.user_id, data.chunk_id, data.annotation_type ?? 'note',
      data.content ?? null, data.highlight_start ?? null, data.highlight_end ?? null,
      data.color ?? '#d4af37', data.tags ?? [],
    ]
  );
  return rows[0];
}

export async function deleteAnnotation(id: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM annotations WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}

// --- Reading History ---

export async function recordReading(
  userId: number,
  work: string,
  sectionRef: string,
  seconds: number
): Promise<ReadingHistoryEntry> {
  const { rows } = await pool.query(
    `INSERT INTO reading_history (user_id, work, section_ref, time_spent_seconds, last_read_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (user_id, work, section_ref)
     DO UPDATE SET time_spent_seconds = reading_history.time_spent_seconds + $4, last_read_at = now()
     RETURNING *`,
    [userId, work, sectionRef, seconds]
  );
  return rows[0];
}

export async function getReadingHistory(userId: number, limit: number = 50): Promise<ReadingHistoryEntry[]> {
  const { rows } = await pool.query(
    `SELECT * FROM reading_history WHERE user_id = $1 ORDER BY last_read_at DESC LIMIT $2`,
    [userId, limit]
  );
  return rows;
}

// --- Study Progress ---

export async function getStudyProgress(userId: number, work?: string): Promise<StudyProgress[]> {
  if (work) {
    const { rows } = await pool.query(
      `SELECT * FROM study_progress WHERE user_id = $1 AND work = $2`,
      [userId, work]
    );
    return rows;
  }
  const { rows } = await pool.query(
    `SELECT * FROM study_progress WHERE user_id = $1 ORDER BY updated_at DESC`,
    [userId]
  );
  return rows;
}

export async function updateStudyProgress(
  userId: number,
  work: string,
  totalSections: number,
  completedSections: number,
  lastSectionRef: string
): Promise<StudyProgress> {
  const { rows } = await pool.query(
    `INSERT INTO study_progress (user_id, work, total_sections, completed_sections, last_section_ref, updated_at)
     VALUES ($1, $2, $3, $4, $5, now())
     ON CONFLICT (user_id, work)
     DO UPDATE SET total_sections = $3, completed_sections = $4, last_section_ref = $5, updated_at = now()
     RETURNING *`,
    [userId, work, totalSections, completedSections, lastSectionRef]
  );
  return rows[0];
}

// --- Study Sheets ---

export async function createStudySheet(
  userId: number,
  title: string,
  description?: string
): Promise<StudySheet> {
  const { rows } = await pool.query(
    `INSERT INTO study_sheets (user_id, title, description) VALUES ($1, $2, $3) RETURNING *`,
    [userId, title, description ?? null]
  );
  return rows[0];
}

export async function getStudySheets(userId: number): Promise<StudySheet[]> {
  const { rows } = await pool.query(
    `SELECT * FROM study_sheets WHERE user_id = $1 ORDER BY updated_at DESC`,
    [userId]
  );
  return rows;
}

export async function addSheetItem(
  sheetId: number,
  chunkId: number,
  note?: string,
  sortOrder?: number
): Promise<StudySheetItem> {
  const { rows } = await pool.query(
    `INSERT INTO study_sheet_items (sheet_id, chunk_id, note, sort_order) VALUES ($1, $2, $3, $4) RETURNING *`,
    [sheetId, chunkId, note ?? null, sortOrder ?? 0]
  );
  return rows[0];
}

export async function getSheetItems(sheetId: number): Promise<StudySheetItem[]> {
  const { rows } = await pool.query(
    `SELECT * FROM study_sheet_items WHERE sheet_id = $1 ORDER BY sort_order ASC, id ASC`,
    [sheetId]
  );
  return rows;
}

// --- Research Sessions ---

export async function createResearchSession(
  userId: number,
  title?: string,
  contextWork?: string,
  contextSection?: string
): Promise<ResearchSession> {
  const { rows } = await pool.query(
    `INSERT INTO research_sessions (user_id, title, context_work, context_section)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, title ?? null, contextWork ?? null, contextSection ?? null]
  );
  return rows[0];
}

export async function getResearchSessions(userId: number): Promise<ResearchSession[]> {
  const { rows } = await pool.query(
    `SELECT * FROM research_sessions WHERE user_id = $1 ORDER BY updated_at DESC`,
    [userId]
  );
  return rows;
}

export async function appendSessionMessage(
  sessionId: number,
  message: { role: string; content: string; [key: string]: unknown }
): Promise<ResearchSession> {
  const { rows } = await pool.query(
    `UPDATE research_sessions
     SET messages = messages || $1::jsonb, updated_at = now()
     WHERE id = $2 RETURNING *`,
    [JSON.stringify(message), sessionId]
  );
  return rows[0];
}

export async function getSession(sessionId: number): Promise<ResearchSession | null> {
  const { rows } = await pool.query(
    `SELECT * FROM research_sessions WHERE id = $1`,
    [sessionId]
  );
  return rows[0] ?? null;
}

// --- Rabbis ---

export async function getRabbis(opts?: {
  search?: string;
  era?: string;
  community?: string;
}): Promise<Rabbi[]> {
  const conditions: string[] = [];
  const params: string[] = [];
  let idx = 0;

  if (opts?.search) {
    idx++;
    conditions.push(`(name_en ILIKE $${idx} OR name_he ILIKE $${idx})`);
    params.push(`%${opts.search}%`);
  }
  if (opts?.era) {
    idx++;
    conditions.push(`era = $${idx}`);
    params.push(opts.era);
  }
  if (opts?.community) {
    idx++;
    conditions.push(`community = $${idx}`);
    params.push(opts.community);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT * FROM rabbis ${where} ORDER BY name_en`,
    params
  );
  return rows;
}

export async function getRabbi(id: number): Promise<Rabbi | null> {
  const { rows } = await pool.query(`SELECT * FROM rabbis WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function insertRabbi(data: {
  name_en: string;
  name_he?: string;
  era?: string;
  generation?: string;
  community?: string;
  birth_year?: string;
  death_year?: string;
  location?: string;
  bio?: string;
}): Promise<Rabbi> {
  const { rows } = await pool.query(
    `INSERT INTO rabbis (name_en, name_he, era, generation, community, birth_year, death_year, location, bio)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      data.name_en, data.name_he ?? null, data.era ?? null, data.generation ?? null,
      data.community ?? 'General', data.birth_year ?? null, data.death_year ?? null,
      data.location ?? null, data.bio ?? null,
    ]
  );
  return rows[0];
}

export async function getRabbiWorks(rabbiId: number): Promise<RabbiWork[]> {
  const { rows } = await pool.query(
    `SELECT * FROM rabbi_works WHERE rabbi_id = $1 ORDER BY work_name`,
    [rabbiId]
  );
  return rows;
}
