import type { ChatMessage } from "@/lib/types";

interface GenerateReplyParams {
  systemPrompt: string;
  history: ChatMessage[];
}

// Groq: free tier bem mais folgado que o Gemini (30 req/min, 1000 req/dia),
// sem cartão de crédito, API compatível com o formato OpenAI. Trocamos o
// Gemini pelo Groq porque o free tier do Gemini caiu pra ~20 req/dia e os
// modelos 1.5 foram desligados de vez pelo Google.
const MODEL_CANDIDATES = [
  process.env.GROQ_MODEL,
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
].filter(Boolean) as string[];

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("GROQ_API_KEY não configurada");
  }
  return key;
}

function toGroqMessages(systemPrompt: string, history: ChatMessage[]) {
  const filtered = history.filter((m) => m.role === "user" || m.role === "assistant");
  return [
    { role: "system" as const, content: systemPrompt },
    ...filtered.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];
}

async function callGroqModel(
  model: string,
  apiKey: string,
  { systemPrompt, history }: GenerateReplyParams
): Promise<string> {
  const messages = toGroqMessages(systemPrompt, history);

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq ${model} ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error(`Groq ${model} resposta vazia`);
  }
  return text.trim();
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
  empresa_ou_papel: string | null;
  o_que_busca: string | null;
  momento: string | null;
  fit: "alto" | "medio" | "baixo" | "indefinido";
  quer_falar_com_humano: boolean;
  resumo_para_humano: string;
}

const EXTRACTION_SYSTEM_PROMPT = `Você lê uma conversa entre visitante e consultor comercial de IA. Organize o que já se sabe em JSON para o time de vendas.

Regras:
- Só preencha campos com informação que apareceu na conversa. Se não apareceu, use null.
- Nunca invente dados.
- "fit": "alto", "medio", "baixo" ou "indefinido".
- "quer_falar_com_humano": true se pediu reunião, especialista, ou aceitou agendar.
- "resumo_para_humano": 1–3 frases objetivas para o vendedor antes da call.

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

  const transcript = history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => `${m.role === "user" ? "Visitante" : "Consultor"}: ${m.content}`)
    .join("\n");

  const model = MODEL_CANDIDATES.find(Boolean) ?? "llama-3.3-70b-versatile";

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
          { role: "user", content: transcript },
        ],
        temperature: 0.2,
        max_tokens: 300,
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) return null;
    return JSON.parse(text) as QualificationExtraction;
  } catch (err) {
    console.error("[llm] extractQualification falhou:", err);
    return null;
  }
}
