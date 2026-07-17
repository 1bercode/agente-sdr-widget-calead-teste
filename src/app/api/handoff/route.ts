import { NextRequest, NextResponse } from "next/server";
import { getOrCreateConversation, markHandoffRequested, getAgentBySlug } from "@/lib/db";

export const runtime = "nodejs";

interface HandoffRequestBody {
  conversationId?: string | null;
  agentId: string;
  visitorSessionId?: string | null;
}

// Chamado quando a pessoa clica em "falar com uma pessoa agora". Marca a
// conversa pra a equipe ver — o agendamento de verdade (Cal.com) entra no
// passo 5; por enquanto isso só deixa o pedido salvo e visível no banco.
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as HandoffRequestBody;
    if (!body.agentId) {
      return NextResponse.json({ ok: false, error: "agentId é obrigatório" }, { status: 400 });
    }

    const agent = await getAgentBySlug(body.agentId);
    const companyName = agent?.company_name || "nossa empresa";

    const conversation = await getOrCreateConversation({
      conversationId: body.conversationId,
      agentId: body.agentId,
      companyName,
      visitorSessionId: body.visitorSessionId,
    });

    await markHandoffRequested(conversation.id);

    return NextResponse.json({ ok: true, conversationId: conversation.id });
  } catch (err) {
    console.error("[/api/handoff] erro:", err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
