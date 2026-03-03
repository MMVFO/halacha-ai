type LLMProvider = "anthropic" | "openai" | "perplexity";

const LLM_PROVIDER = (process.env.LLM_PROVIDER || "perplexity") as LLMProvider;
const LLM_MODEL = process.env.LLM_MODEL || "sonar-pro";

interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface LLMResponse {
  content: string;
  model: string;
  usage?: { input_tokens: number; output_tokens: number };
  citations?: Array<{ url: string; title: string }>;
}

async function callAnthropic(messages: LLMMessage[]): Promise<LLMResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const systemMsg = messages.find((m) => m.role === "system");
  const nonSystemMsgs = messages.filter((m) => m.role !== "system");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      max_tokens: 8192,
      system: systemMsg?.content || "",
      messages: nonSystemMsgs.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return {
    content: data.content[0].text,
    model: data.model,
    usage: data.usage ? { input_tokens: data.usage.input_tokens, output_tokens: data.usage.output_tokens } : undefined,
  };
}

async function callOpenAI(messages: LLMMessage[]): Promise<LLMResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages,
      max_tokens: 8192,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return {
    content: data.choices[0].message.content,
    model: data.model,
    usage: data.usage ? { input_tokens: data.usage.prompt_tokens, output_tokens: data.usage.completion_tokens } : undefined,
  };
}

async function callPerplexity(messages: LLMMessage[]): Promise<LLMResponse> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error("PERPLEXITY_API_KEY not set");

  // Perplexity uses OpenAI-compatible API
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages,
      max_tokens: 8192,
      temperature: 0.2, // Lower temp for factual halakhic responses
      top_p: 0.9,
      return_citations: true, // Enable web citations
      return_images: false,
      search_recency_filter: "month", // Recent responsa and discussions
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Perplexity API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return {
    content: data.choices[0].message.content,
    model: data.model,
    usage: data.usage ? { input_tokens: data.usage.prompt_tokens, output_tokens: data.usage.completion_tokens } : undefined,
    citations: data.citations || [],
  };
}

export async function generate(messages: LLMMessage[]): Promise<LLMResponse> {
  try {
    switch (LLM_PROVIDER) {
      case "openai":
        return await callOpenAI(messages);
      case "perplexity":
        return await callPerplexity(messages);
      case "anthropic":
      default:
        return await callAnthropic(messages);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    
    // Provide helpful error messages with fallback suggestions
    if (msg.includes("not set")) {
      throw new Error(
        `${LLM_PROVIDER.toUpperCase()} API key not configured. ` +
        `Set ${LLM_PROVIDER.toUpperCase()}_API_KEY in .env or switch providers with LLM_PROVIDER env var. ` +
        `Available providers: anthropic, openai, perplexity`
      );
    }
    
    if (msg.includes("credit") || msg.includes("balance") || msg.includes("insufficient")) {
      throw new Error(
        `${LLM_PROVIDER} account has insufficient credits. ` +
        `Add credits or switch to another provider (perplexity recommended for cost and features). ` +
        `Set LLM_PROVIDER=perplexity in .env`
      );
    }
    
    throw err;
  }
}

// Export provider info for debugging
export function getLLMInfo() {
  return {
    provider: LLM_PROVIDER,
    model: LLM_MODEL,
    configured: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      perplexity: !!process.env.PERPLEXITY_API_KEY,
    },
  };
}
