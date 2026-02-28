type LLMProvider = "anthropic" | "openai";

const LLM_PROVIDER = (process.env.LLM_PROVIDER || "anthropic") as LLMProvider;
const LLM_MODEL = process.env.LLM_MODEL || "claude-sonnet-4-20250514";

interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface LLMResponse {
  content: string;
  model: string;
  usage?: { input_tokens: number; output_tokens: number };
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

export async function generate(messages: LLMMessage[]): Promise<LLMResponse> {
  if (LLM_PROVIDER === "openai") {
    return callOpenAI(messages);
  }
  return callAnthropic(messages);
}
