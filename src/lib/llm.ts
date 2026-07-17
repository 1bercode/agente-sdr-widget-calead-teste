import type { ChatMessage } from "@/lib/types";

interface GenerateReplyParams {
  systemPrompt: string;
  history: ChatMessage[];
}

const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
].filter(Boolean) as string[];

function getApiKey(): string {
  const key =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY não configurada");
  }
  return key;
}

function toGeminiContents(history: ChatMessage[]) {
  return history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    }));
}

async function callGeminiModel(
  model: string,
  apiKey: string,
  { systemPrompt, history }: GenerateReplyParams
): Promise<string> {
  const contents = toGeminiContents(history);
  if (contents.length === 0) {
    throw new Error("Histórico vazio para o Gemini");
  }

  // Auth keys (AQ.*) funcionam melhor no header — query string pode falhar
  // com caracteres especiais e algumas configs da Vercel.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini ${model} ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error(`Gemini ${model} resposta vazia`);
  }
  return text.trim();
}

export async function generateReply(params: GenerateReplyParams): Promise<string> {
  const apiKey = getApiKey();
  const models = [...new Set(MODEL_CANDIDATES)];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      return await callGeminiModel(model, apiKey, params);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`[llm] falha com modelo ${model}:`, lastError.message);
    }
  }

  throw lastError ?? new Error("Nenhum modelo Gemini disponível");
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

  const model = MODEL_CANDIDATES[0] ?? "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: EXTRACTION_SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: transcript }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 300,
          responseMimeType: "application/json",
        },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;
    return JSON.parse(text) as QualificationExtraction;
  } catch (err) {
    console.error("[llm] extractQualification falhou:", err);
    return null;
  }
}
