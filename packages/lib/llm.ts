type LLMProvider = "anthropic" | "openai" | "perplexity";
type TaskType = "practical" | "deep_analysis" | "posek_view" | "research" | "general";

// Default providers per task (can be overridden)
const LLM_PROVIDER = (process.env.LLM_PROVIDER || "auto") as LLMProvider | "auto";
const LLM_MODEL = process.env.LLM_MODEL || "auto";

interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  usage?: { input_tokens: number; output_tokens: number };
  citations?: Array<{ url: string; title: string }>;
}

// Task-specific model configuration
const TASK_CONFIG: Record<TaskType, { provider: LLMProvider; model: string; description: string }[]> = {
  practical: [
    { provider: "perplexity", model: "sonar-pro", description: "Web-grounded practical rulings with recent responsa" },
    { provider: "openai", model: "gpt-4o", description: "Fast practical guidance" },
    { provider: "anthropic", model: "claude-sonnet-4-20250514", description: "Nuanced practical analysis" },
  ],
  deep_analysis: [
    { provider: "anthropic", model: "claude-sonnet-4-20250514", description: "Deep analytical reasoning" },
    { provider: "perplexity", model: "sonar-reasoning", description: "Analytical reasoning with web research" },
    { provider: "openai", model: "gpt-4o", description: "Comprehensive analysis" },
  ],
  posek_view: [
    { provider: "anthropic", model: "claude-sonnet-4-20250514", description: "Authoritative posek perspective" },
    { provider: "perplexity", model: "sonar-pro", description: "Contemporary posek rulings with citations" },
    { provider: "openai", model: "gpt-4o", description: "Balanced halakhic view" },
  ],
  research: [
    { provider: "perplexity", model: "sonar-pro", description: "Web research with automatic citations" },
    { provider: "openai", model: "gpt-4o", description: "Research synthesis" },
    { provider: "anthropic", model: "claude-sonnet-4-20250514", description: "Deep research analysis" },
  ],
  general: [
    { provider: "perplexity", model: "sonar", description: "Fast general responses" },
    { provider: "openai", model: "gpt-4o", description: "Balanced general AI" },
    { provider: "anthropic", model: "claude-sonnet-4-20250514", description: "Thoughtful responses" },
  ],
};

async function callAnthropic(messages: LLMMessage[], model: string): Promise<LLMResponse> {
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
      model,
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
    provider: "anthropic",
    usage: data.usage ? { input_tokens: data.usage.input_tokens, output_tokens: data.usage.output_tokens } : undefined,
  };
}

async function callOpenAI(messages: LLMMessage[], model: string): Promise<LLMResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
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
    provider: "openai",
    usage: data.usage ? { input_tokens: data.usage.prompt_tokens, output_tokens: data.usage.completion_tokens } : undefined,
  };
}

async function callPerplexity(messages: LLMMessage[], model: string): Promise<LLMResponse> {
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
      model,
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
    provider: "perplexity",
    usage: data.usage ? { input_tokens: data.usage.prompt_tokens, output_tokens: data.usage.completion_tokens } : undefined,
    citations: data.citations || [],
  };
}

// Intelligent model selection based on task
function selectModel(taskType: TaskType): { provider: LLMProvider; model: string } {
  // Manual override mode
  if (LLM_PROVIDER !== "auto" && LLM_MODEL !== "auto") {
    return { provider: LLM_PROVIDER as LLMProvider, model: LLM_MODEL };
  }

  const configs = TASK_CONFIG[taskType];
  
  // Try each configured provider in priority order
  for (const config of configs) {
    const keyName = `${config.provider.toUpperCase()}_API_KEY`;
    if (process.env[keyName]) {
      return { provider: config.provider, model: config.model };
    }
  }

  // Fallback to any available provider
  if (process.env.PERPLEXITY_API_KEY) return { provider: "perplexity", model: "sonar-pro" };
  if (process.env.OPENAI_API_KEY) return { provider: "openai", model: "gpt-4o" };
  if (process.env.ANTHROPIC_API_KEY) return { provider: "anthropic", model: "claude-sonnet-4-20250514" };

  throw new Error("No LLM API key configured. Set PERPLEXITY_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY");
}

export async function generate(
  messages: LLMMessage[],
  options?: { taskType?: TaskType; forceProvider?: LLMProvider; forceModel?: string }
): Promise<LLMResponse> {
  const taskType = options?.taskType || "general";
  
  // Determine which model to use
  let provider: LLMProvider;
  let model: string;
  
  if (options?.forceProvider && options?.forceModel) {
    provider = options.forceProvider;
    model = options.forceModel;
  } else {
    const selected = selectModel(taskType);
    provider = selected.provider;
    model = selected.model;
  }

  console.log(`[LLM] Using ${provider}/${model} for task: ${taskType}`);

  try {
    switch (provider) {
      case "openai":
        return await callOpenAI(messages, model);
      case "perplexity":
        return await callPerplexity(messages, model);
      case "anthropic":
      default:
        return await callAnthropic(messages, model);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    
    // Try fallback to next available provider
    if (msg.includes("not set") || msg.includes("credit") || msg.includes("balance") || msg.includes("401")) {
      console.warn(`[LLM] ${provider} failed, trying fallback...`);
      
      const configs = TASK_CONFIG[taskType];
      for (const config of configs) {
        if (config.provider === provider) continue; // Skip failed provider
        
        const keyName = `${config.provider.toUpperCase()}_API_KEY`;
        if (process.env[keyName]) {
          try {
            console.log(`[LLM] Fallback to ${config.provider}/${config.model}`);
            switch (config.provider) {
              case "openai":
                return await callOpenAI(messages, config.model);
              case "perplexity":
                return await callPerplexity(messages, config.model);
              case "anthropic":
                return await callAnthropic(messages, config.model);
            }
          } catch (fallbackErr) {
            console.warn(`[LLM] Fallback ${config.provider} also failed`);
            continue;
          }
        }
      }
    }
    
    // All providers failed, throw detailed error
    throw new Error(
      `All LLM providers failed for task '${taskType}'. ` +
      `Primary error: ${msg}. ` +
      `Configure at least one API key: PERPLEXITY_API_KEY (recommended), OPENAI_API_KEY, or ANTHROPIC_API_KEY`
    );
  }
}

// Export provider info for debugging
export function getLLMInfo() {
  const configured: Record<string, boolean> = {
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    perplexity: !!process.env.PERPLEXITY_API_KEY,
  };

  const mode = LLM_PROVIDER === "auto" ? "auto" : "manual";
  let activeProvider = LLM_PROVIDER;
  
  if (mode === "auto") {
    // Detect which provider would be used
    if (configured.perplexity) activeProvider = "perplexity";
    else if (configured.openai) activeProvider = "openai";
    else if (configured.anthropic) activeProvider = "anthropic";
    else activeProvider = "anthropic"; // fallback
  }

  return {
    mode,
    provider: activeProvider,
    model: LLM_MODEL,
    configured,
    taskConfig: TASK_CONFIG,
  };
}

// Get recommended model for a specific task
export function getRecommendedModel(taskType: TaskType) {
  return selectModel(taskType);
}
