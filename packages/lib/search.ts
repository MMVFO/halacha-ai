import type { CorpusTier, SearchMode, Community } from "@halacha-ai/db";
import {
  semanticSearch, keywordSearch, getChunksByIds,
  getChunksByParentRef, getRelationsForChunks,
} from "@halacha-ai/db";
import { embedQuestion } from "./embeddings.js";

export interface SearchOptions {
  question: string;
  community?: Community;
  corpusTiers?: CorpusTier[];
  mode?: SearchMode;
}

export interface RetrievedSource {
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

export interface SearchResult {
  sources: RetrievedSource[];
}

const RRF_K = 60;

export async function search(options: SearchOptions): Promise<SearchResult> {
  const {
    question,
    community = "General",
    corpusTiers = ["canonical"],
    mode = "practical",
  } = options;

  // 1. Embed the question
  const questionEmbedding = await embedQuestion(question);

  // 2 & 3. Run semantic and keyword searches in parallel
  const [semResults, kwResults] = await Promise.all([
    semanticSearch(questionEmbedding, corpusTiers, 60),
    keywordSearch(question, corpusTiers, 60),
  ]);

  // 4. Build rank maps
  const semRankMap = new Map<number, number>();
  semResults.forEach((r, i) => semRankMap.set(r.id, i + 1));

  const kwRankMap = new Map<number, number>();
  kwResults.forEach((r, i) => kwRankMap.set(r.id, i + 1));

  // Collect all unique IDs
  const allIds = new Set<number>([
    ...semResults.map((r) => r.id),
    ...kwResults.map((r) => r.id),
  ]);

  // 5. RRF scoring
  interface ScoredChunk {
    id: number;
    rrfScore: number;
  }

  const scored: ScoredChunk[] = [];
  for (const id of allIds) {
    const semRank = semRankMap.get(id) ?? semResults.length + 1;
    const kwRank = kwRankMap.get(id) ?? kwResults.length + 1;
    const rrfScore = 1 / (RRF_K + semRank) + 1 / (RRF_K + kwRank);
    scored.push({ id, rrfScore });
  }

  // Load chunk metadata for boosting
  const scoredIds = scored.map((s) => s.id);
  const chunks = await getChunksByIds(scoredIds);
  const chunkMap = new Map(chunks.map((c) => [c.id, c]));

  // 6. Apply scoring boosts
  const boosted = scored.map((s) => {
    const chunk = chunkMap.get(s.id);
    let boost = 0;
    if (chunk) {
      if (chunk.community === community) boost += 0.15;
      if (chunk.community === "General") boost += 0.05;
      if (chunk.corpus_tier === "canonical") boost += 0.10;
    }
    return { ...s, finalScore: s.rrfScore + boost };
  });

  // 7. Sort and pick top 40
  boosted.sort((a, b) => b.finalScore - a.finalScore);
  const topIds = boosted.slice(0, 40).map((s) => s.id);

  // 8. Load full chunks + parent + relations
  const topChunks = await getChunksByIds(topIds);

  // Load parent chunks
  const parentRefs = [...new Set(
    topChunks.map((c) => c.parent_ref).filter((p): p is string => p !== null)
  )];
  const parentChunksArrays = await Promise.all(parentRefs.map(getChunksByParentRef));
  // (Parent context is available for LLM but we return the direct matches as sources)

  // Load related chunks
  const relations = await getRelationsForChunks(topIds);
  const relatedIds = new Set<number>();
  for (const rel of relations) {
    relatedIds.add(rel.from_chunk_id);
    relatedIds.add(rel.to_chunk_id);
  }
  // Remove IDs already in topIds
  for (const id of topIds) relatedIds.delete(id);
  const relatedChunks = relatedIds.size > 0 ? await getChunksByIds([...relatedIds]) : [];

  // Build final source list: top chunks first, then related
  const allSourceChunks = [...topChunks, ...relatedChunks];

  const sources: RetrievedSource[] = allSourceChunks.map((c) => ({
    id: c.id,
    work: c.work,
    sectionRef: c.section_ref,
    parentRef: c.parent_ref,
    community: c.community,
    corpusTier: c.corpus_tier,
    author: c.author,
    era: c.era,
    text: c.text,
  }));

  return { sources };
}
