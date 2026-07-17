import type { ChatMessage } from "@/lib/types";

// Abstração do provider de LLM. Hoje só tem Gemini implementado (free tier),
// mas a assinatura é a mesma pra qualquer provider — trocar pra Claude ou
// OpenAI depois é só escrever uma outra função com essa cara e trocar a
// chamada em generateReply().

interface GenerateReplyParams {
  systemPrompt: string;
  history: ChatMessage[];
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

async function callGemini({ systemPrompt, history }: GenerateReplyParams): Promise<string> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY não configurada");
  }

  const contents = history
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 400,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Resposta do Gemini veio vazia");
  }
  return text.trim();
}

export async function generateReply(params: GenerateReplyParams): Promise<string> {
  return callGemini(params);
}

// --- Extração de qualificação --------------------------------------------
// Chamada separada, "silenciosa": não aparece pro visitante, só lê a
// conversa até agora e organiza o que já deu pra entender. Se falhar, a
// conversa continua normalmente — isso é só enriquecimento pro humano.

export interface QualificationExtraction {
  empresa_ou_papel: string | null;
  o_que_busca: string | null;
  momento: string | null;
  fit: "alto" | "medio" | "baixo" | "indefinido";
  quer_falar_com_humano: boolean;
  resumo_para_humano: string;
}

const EXTRACTION_SYSTEM_PROMPT = `Você lê uma conversa entre um visitante de site e um assistente de IA de qualificação. Sua única tarefa é organizar o que já se sabe sobre o visitante, em JSON, pra um humano da equipe de vendas ler antes de uma reunião.

Regras:
- Só preencha um campo se a informação apareceu de verdade na conversa. Se não apareceu, use null.
- Nunca invente dado que não foi dito.
- "fit" é seu julgamento de encaixe com base no que foi dito (não em suposições): "alto", "medio", "baixo" ou "indefinido" se ainda não dá pra saber.
- "quer_falar_com_humano" é true se em algum momento o visitante pediu, aceitou, ou demonstrou clara vontade de falar com uma pessoa.
- "resumo_para_humano" é 1 a 3 frases, direto, tipo um repasse de recepcionista pra vendedor — não repita a conversa inteira.

Responda só o JSON, sem texto antes ou depois.`;

export async function extractQualification(
  history: ChatMessage[]
): Promise<QualificationExtraction | null> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;

  const transcript = history
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? "Visitante" : "Assistente"}: ${m.content}`)
    .join("\n");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
