import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Transcrição de voz via Groq Whisper (free tier). O áudio chega do
// navegador como multipart/form-data (gravado com MediaRecorder) e a gente
// só repassa pro endpoint da Groq com a mesma GROQ_API_KEY já usada no chat.
const TRANSCRIBE_MODEL = "whisper-large-v3-turbo";

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("GROQ_API_KEY não configurada");
  }
  return key;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = getApiKey();
    const incoming = await req.formData();
    const audio = incoming.get("audio");

    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json({ error: "áudio ausente" }, { status: 400 });
    }
    if (audio.size === 0) {
      return NextResponse.json({ error: "áudio vazio" }, { status: 400 });
    }
    // Cota de segurança: evita mandar áudios enormes pra Groq sem querer.
    if (audio.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "áudio muito grande" }, { status: 413 });
    }

    const outgoing = new FormData();
    outgoing.append("file", audio, "audio.webm");
    outgoing.append("model", TRANSCRIBE_MODEL);
    outgoing.append("language", "pt");
    outgoing.append("response_format", "json");

    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: outgoing,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[/api/transcribe] Groq ${res.status}: ${errText.slice(0, 300)}`);
      return NextResponse.json({ error: "falha na transcrição" }, { status: 502 });
    }

    const data = await res.json();
    const text = typeof data?.text === "string" ? data.text.trim() : "";
    if (!text) {
      return NextResponse.json({ error: "não entendi o áudio" }, { status: 422 });
    }

    return NextResponse.json({ text });
  } catch (err) {
    console.error("[/api/transcribe] erro:", err);
    return NextResponse.json({ error: "falha na transcrição" }, { status: 500 });
  }
}
