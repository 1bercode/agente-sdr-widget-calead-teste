import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/prompt";
import { generateReply, extractQualification } from "@/lib/llm";
import { getOrCreateConversation, insertMessage, updateQualification, getAgentBySlug } from "@/lib/db";
import type { ChatMessage } from "@/lib/types";

export const runtime = "nodejs";

interface ChatRequestBody {
  messages: ChatMessage[];
  agentId: string;
  conversationId?: string | null;
  visitorSessionId?: string | null;
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

    // O agente é a fonte da verdade pra nome da empresa, instruções
    // customizadas e conhecimento do site — nunca confiamos nisso vindo do
    // client, pra não dar pra ninguém spoofar o comportamento de outro
    // agente.
    const agent = await getAgentBySlug(agentId);
    const companyName = agent?.company_name || "nossa empresa";

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
      customPrompt: agent?.custom_prompt,
      siteKnowledge: agent?.site_knowledge,
    });
    const reply = await generateReply({ systemPrompt, history: messages });

    if (conversation) {
      await insertMessage(conversation.id, "assistant", reply);

      // Extração de qualificação é *awaited* (não fire-and-forget) porque
      // em serverless (Vercel) o processo pode ser encerrado assim que a
      // resposta é enviada — aceitamos um pouco mais de latência em troca
      // de garantir que a qualificação é salva.
      const fullHistory: ChatMessage[] = [
        ...messages,
        { id: "tmp", role: "assistant", content: reply, createdAt: Date.now() },
      ];
      try {
        const extraction = await extractQualification(fullHistory);
        if (extraction) {
          await updateQualification(
            conversation.id,
            {
              empresa_ou_papel: extraction.empresa_ou_papel,
              o_que_busca: extraction.o_que_busca,
              momento: extraction.momento,
              fit: extraction.fit,
              resumo_para_humano: extraction.resumo_para_humano,
            },
            extraction.quer_falar_com_humano ? { wantsHuman: true } : {}
          );
        }
      } catch (err) {
        console.error("[/api/chat] extração de qualificação falhou:", err);
      }
    }

    return NextResponse.json({ reply, conversationId: conversation?.id ?? conversationId ?? null });
  } catch (err) {
    console.error("[/api/chat] erro:", err);
    // Falha honesta: não inventamos resposta, oferecemos o caminho humano.
    return NextResponse.json(
      {
        reply:
          "Desculpa, tive um problema técnico agora e não quero te dar uma resposta chutada. Quer falar direto com uma pessoa da equipe?",
        degraded: true,
        conversationId: conversationId ?? null,
      },
      { status: 200 }
    );
  }
}
