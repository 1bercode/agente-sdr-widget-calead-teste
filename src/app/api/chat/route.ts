import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { buildSystemPrompt } from "@/lib/prompt";
import { generateReply, extractQualification } from "@/lib/llm";
import { getOrCreateConversation, insertMessage, updateQualification, getAgentBySlug } from "@/lib/db";
import type { ChatMessage } from "@/lib/types";

export const runtime = "nodejs";

const DEGRADED_REPLY =
  "Desculpa, demorei um pouco aqui. Pode mandar de novo? Quero te ajudar da melhor forma.";

interface ChatRequestBody {
  messages: ChatMessage[];
  agentId: string;
  conversationId?: string | null;
  visitorSessionId?: string | null;
}

async function runQualificationExtraction(
  conversationId: string,
  fullHistory: ChatMessage[]
) {
  try {
    const extraction = await extractQualification(fullHistory);
    if (!extraction) return;

    await updateQualification(
      conversationId,
      {
        empresa_ou_papel: extraction.empresa_ou_papel,
        o_que_busca: extraction.o_que_busca,
        momento: extraction.momento,
        fit: extraction.fit,
        resumo_para_humano: extraction.resumo_para_humano,
      },
      extraction.quer_falar_com_humano ? { wantsHuman: true } : {}
    );
  } catch (err) {
    console.error("[/api/chat] extração de qualificação falhou:", err);
  }
}

export async function POST(req: NextRequest) {
  let conversationId: string | undefined;

  try {
    const body = (await req.json()) as ChatRequestBody;
    const { messages, agentId, visitorSessionId } = body;
    conversationId = body.conversationId ?? undefined;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages vazio" }, { status: 400 });
    }
    if (!agentId) {
      return NextResponse.json({ error: "agentId é obrigatório" }, { status: 400 });
    }

    const agent = await getAgentBySlug(agentId);
    if (!agent) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 });
    }

    const companyName = agent.company_name;

    let conversation: { id: string } | null = null;
    try {
      conversation = await getOrCreateConversation({
        conversationId,
        agentId,
        companyName,
        visitorSessionId,
      });
    } catch (dbErr) {
      console.error("[/api/chat] falha ao criar/achar conversa:", dbErr);
    }

    const lastUserMessage = messages[messages.length - 1];
    if (conversation && lastUserMessage?.role === "user") {
      await insertMessage(conversation.id, "user", lastUserMessage.content);
    }

    const systemPrompt = buildSystemPrompt({
      companyName,
      customPrompt: agent.custom_prompt,
      siteKnowledge: agent.site_knowledge,
    });
    const reply = await generateReply({ systemPrompt, history: messages });

    if (conversation) {
      await insertMessage(conversation.id, "assistant", reply);

      const fullHistory: ChatMessage[] = [
        ...messages,
        { id: "tmp", role: "assistant", content: reply, createdAt: Date.now() },
      ];

      // Qualificação em background — não bloqueia a resposta ao visitante.
      const convId = conversation.id;
      waitUntil(runQualificationExtraction(convId, fullHistory));
    }

    return NextResponse.json({ reply, conversationId: conversation?.id ?? conversationId ?? null });
  } catch (err) {
    console.error("[/api/chat] erro:", err);
    return NextResponse.json(
      {
        reply: DEGRADED_REPLY,
        degraded: true,
        conversationId: conversationId ?? null,
      },
      { status: 200 }
    );
  }
}
