const EMBEDDING_API_URL = process.env.EMBEDDING_API_URL || "https://api-inference.huggingface.co/models/BAAI/bge-m3";
const EMBEDDING_API_KEY = process.env.EMBEDDING_API_KEY || "";
const EMBEDDING_DIM = parseInt(process.env.EMBEDDING_DIM || "1024", 10);

interface EmbeddingResponse {
  embeddings?: number[][];
  // HuggingFace inference API returns array directly
  [index: number]: number;
}

async function callEmbeddingAPI(texts: string[]): Promise<number[][]> {
  const res = await fetch(EMBEDDING_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${EMBEDDING_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: texts,
      options: { wait_for_model: true },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Embedding API error ${res.status}: ${body}`);
  }

  const data = await res.json();

  // Handle various response formats
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data as number[][];
  }
  if (data.embeddings) {
    return data.embeddings;
  }

  throw new Error(`Unexpected embedding response format: ${JSON.stringify(data).slice(0, 200)}`);
}

export async function embedText(text: string): Promise<number[]> {
  const results = await callEmbeddingAPI([text]);
  return results[0].slice(0, EMBEDDING_DIM);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  // Process in batches of 32 to avoid API limits
  const batchSize = 32;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const embeddings = await callEmbeddingAPI(batch);
    results.push(...embeddings.map((e) => e.slice(0, EMBEDDING_DIM)));
  }

  return results;
}

export async function embedQuestion(question: string): Promise<number[]> {
  // BGE-M3 recommends prefixing queries for retrieval
  const prefixed = `Represent this sentence for searching relevant passages: ${question}`;
  return embedText(prefixed);
}
