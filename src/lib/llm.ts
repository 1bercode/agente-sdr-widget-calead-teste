import type { ChatMessage } from "@/lib/types";

interface GenerateReplyParams {
  systemPrompt: string;
  history: ChatMessage[];
}

const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
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
  const filtered = history.filter((m) => m.role === "user" || m.role === "assistant");

  // Gemini exige que contents comece com role "user" — a mensagem de abertura
  // do assistente fica só na UI; o system prompt já cobre o contexto inicial.
  const firstUserIdx = filtered.findIndex((m) => m.role === "user");
  const slice = firstUserIdx >= 0 ? filtered.slice(firstUserIdx) : filtered;

  const contents = slice.map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: m.content }],
  }));

  if (contents.length === 0) {
    return [{ role: "user" as const, parts: [{ text: "Olá" }] }];
  }

  if (contents[0].role !== "user") {
    contents.unshift({ role: "user" as const, parts: [{ text: "Olá" }] });
  }

  return contents;
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

  const payload = JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 600,
    },
  });

  const headers = {
    "Content-Type": "application/json",
    "x-goog-api-key": apiKey,
  };

  let res = await fetch(url, { method: "POST", headers, body: payload });

  // Fallback: algumas chaves AQ.* falham no header e funcionam via query string.
  if (!res.ok && (res.status === 401 || res.status === 403 || res.status === 400)) {
    const fallback = await fetch(`${url}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });
    if (fallback.ok) res = fallback;
  }

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
