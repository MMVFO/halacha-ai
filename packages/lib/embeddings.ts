const EMBEDDING_API_URL = process.env.EMBEDDING_API_URL || "";
const EMBEDDING_API_KEY = process.env.EMBEDDING_API_KEY || "";
const EMBEDDING_DIM = parseInt(process.env.EMBEDDING_DIM || "1024", 10);

// Detect if we're talking to a TEI server (URL ends with /embed or /v1/embeddings)
const IS_TEI = EMBEDDING_API_URL.includes("/embed");

// Check if embeddings are available
const HAS_EMBEDDING_API = !!EMBEDDING_API_URL && !EMBEDDING_API_URL.includes("not_needed");

async function callEmbeddingAPI(texts: string[]): Promise<number[][]> {
  if (!HAS_EMBEDDING_API) {
    // Return null embeddings — search will fall back to keyword-only
    return texts.map(() => []);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Only add auth header for non-TEI endpoints with a real API key
  if (!IS_TEI && EMBEDDING_API_KEY && !EMBEDDING_API_KEY.includes("placeholder") && !EMBEDDING_API_KEY.includes("not_needed")) {
    headers["Authorization"] = `Bearer ${EMBEDDING_API_KEY}`;
  }

  const body = IS_TEI
    ? { inputs: texts, truncate: true }
    : { inputs: texts, options: { wait_for_model: true } };

  const res = await fetch(EMBEDDING_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const respBody = await res.text();
    console.warn(`Embedding API error ${res.status}: ${respBody.slice(0, 200)}`);
    // Return empty embeddings on failure — search falls back to keyword-only
    return texts.map(() => []);
  }

  const data = await res.json();

  // Handle various response formats (TEI returns [[...]], HF may wrap in object)
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data as number[][];
  }
  if (data.embeddings) {
    return data.embeddings;
  }
  // OpenAI-compatible format
  if (data.data && Array.isArray(data.data)) {
    return data.data.map((d: { embedding: number[] }) => d.embedding);
  }

  console.warn(`Unexpected embedding response format: ${JSON.stringify(data).slice(0, 200)}`);
  return texts.map(() => []);
}

export async function embedText(text: string): Promise<number[]> {
  const results = await callEmbeddingAPI([text]);
  const vec = results[0];
  return vec.length > 0 ? vec.slice(0, EMBEDDING_DIM) : vec;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  // Process in batches of 32 to avoid API limits
  const batchSize = 32;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const embeddings = await callEmbeddingAPI(batch);
    results.push(...embeddings.map((e) => e.length > 0 ? e.slice(0, EMBEDDING_DIM) : e));
  }

  return results;
}

export async function embedQuestion(question: string): Promise<number[]> {
  // BGE-M3 recommends prefixing queries for retrieval
  const prefixed = `Represent this sentence for searching relevant passages: ${question}`;
  return embedText(prefixed);
}
