import type { ChatMessage } from "@/lib/types";

interface GenerateReplyParams {
  systemPrompt: string;
  history: ChatMessage[];
}

const HISTORY_LIMIT = 12;
const MAX_RETRIES = 2;

// Fallback: 70b primeiro (qualidade), 8b se falhar (rate limit / indisponibilidade).
const MODEL_CANDIDATES = [
  process.env.GROQ_MODEL,
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
].filter(Boolean) as string[];

const EXTRACTION_MODEL = "llama-3.1-8b-instant";

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("GROQ_API_KEY não configurada");
  }
  return key;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toGroqMessages(systemPrompt: string, history: ChatMessage[]) {
  const filtered = history.filter((m) => m.role === "user" || m.role === "assistant");
  const recent = filtered.slice(-HISTORY_LIMIT);
  return [
    { role: "system" as const, content: systemPrompt },
    ...recent.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];
}

function isRetryableStatus(status: number) {
  return status === 429 || status === 503;
}

async function callGroqChat(
  model: string,
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  options: { temperature: number; max_tokens: number; response_format?: { type: string } }
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
        ...(options.response_format ? { response_format: options.response_format } : {}),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error(`Groq ${model} resposta vazia`);
      }
      return text.trim();
    }

    const errText = await res.text();
    lastError = new Error(`Groq ${model} ${res.status}: ${errText.slice(0, 300)}`);

    if (isRetryableStatus(res.status) && attempt < MAX_RETRIES) {
      await sleep(1000 * (attempt + 1));
      continue;
    }

    throw lastError;
  }

  throw lastError ?? new Error(`Groq ${model} falhou após retries`);
}

async function callGroqModel(
  model: string,
  apiKey: string,
  { systemPrompt, history }: GenerateReplyParams
): Promise<string> {
  const messages = toGroqMessages(systemPrompt, history);
  return callGroqChat(model, apiKey, messages, {
    temperature: 0.6,
    max_tokens: 260,
  });
}

export async function generateReply(params: GenerateReplyParams): Promise<string> {
  const apiKey = getApiKey();
  const models = [...new Set(MODEL_CANDIDATES)];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      return await callGroqModel(model, apiKey, params);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`[llm] falha com modelo ${model}:`, lastError.message);
    }
  }

  throw lastError ?? new Error("Nenhum modelo Groq disponível");
}

export interface QualificationExtraction {
  produto_interesse: string | null;
  o_que_busca: string | null;
  estagio_compra: "descobrindo" | "comparando" | "pronto_para_comprar" | "indefinido";
  fit: "alto" | "medio" | "baixo" | "indefinido";
  objecoes: string | null;
  resumo: string;
}

const EXTRACTION_SYSTEM_PROMPT = `Você lê uma conversa entre visitante e assistente de vendas de IA num site. Organize o que já se sabe em JSON pro dono do site acompanhar no painel.

Regras:
- Só preencha campos com informação que apareceu na conversa. Se não apareceu, use null.
- Nunca invente dados.
- "estagio_compra": "descobrindo" (ainda entendendo o que precisa), "comparando" (avaliando opções/preço), "pronto_para_comprar" (decidido, faltando só finalizar) ou "indefinido".
- "fit": "alto", "medio", "baixo" ou "indefinido" — o quanto o que a empresa oferece parece resolver o que o visitante busca.
- "objecoes": principais hesitações/barreiras que a pessoa levantou (preço, prazo, dúvida técnica etc.), ou null se não houve.
- "resumo": 1–3 frases objetivas resumindo o interesse do visitante.

Responda só JSON, sem markdown.`;

export async function extractQualification(
  history: ChatMessage[]
): Promise<QualificationExtraction | null> {
  let apiKey: string;
  try {
    apiKey = getApiKey();
  } catch {
    return null;
  }

  const recent = history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-HISTORY_LIMIT);

  const transcript = recent
    .map((m) => `${m.role === "user" ? "Visitante" : "Consultor"}: ${m.content}`)
    .join("\n");

  try {
    const text = await callGroqChat(
      EXTRACTION_MODEL,
      apiKey,
      [
        { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
        { role: "user", content: transcript },
      ],
      {
        temperature: 0.2,
        max_tokens: 300,
        response_format: { type: "json_object" },
      }
    );
    return JSON.parse(text) as QualificationExtraction;
  } catch (err) {
    console.error("[llm] extractQualification falhou:", err);
    return null;
  }
}
