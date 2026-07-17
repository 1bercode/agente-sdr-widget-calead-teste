import { NextRequest, NextResponse } from "next/server";
import { fetchSiteKnowledge } from "@/lib/crawler";
import { getAgentById, updateAgentKnowledge } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agent = await getAgentById(params.id);
    if (!agent) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 });
    }
    if (!agent.site_url) {
      return NextResponse.json({ error: "Agente não tem URL de site configurada" }, { status: 400 });
    }

    const crawl = await fetchSiteKnowledge(agent.site_url);
    await updateAgentKnowledge(agent.id, crawl.text, crawl.status);

    return NextResponse.json({
      ok: true,
      crawl_status: crawl.status,
      chars: crawl.text.length,
    });
  } catch (err) {
    console.error("[/api/agents/recrawl] erro:", err);
    return NextResponse.json({ error: "Falha ao reler o site" }, { status: 500 });
  }
}
