import pg from "pg";
import pgvector from "pgvector/pg";
import type {
  Corpus, InsertCorpus, HalachaChunk, InsertChunk,
  HalachaAnswer, InsertAnswer, HalachaRelation, UserProfile,
  CorpusTier, ReviewStatus,
} from "./schema.js";

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
  limit: number = 60
): Promise<{ id: number; rank: number }[]> {
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

// --- Relations ---

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
