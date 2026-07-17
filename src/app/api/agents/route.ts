import { NextRequest, NextResponse } from "next/server";
import { createAgent, listAgents, updateAgentKnowledge } from "@/lib/db";
import { fetchSiteKnowledge } from "@/lib/crawler";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

function generateSlug() {
  return randomBytes(5).toString("hex");
}

export async function GET() {
  try {
    const agents = await listAgents();
    return NextResponse.json({ agents });
  } catch (err) {
    console.error("[/api/agents] GET erro:", err);
    return NextResponse.json({ error: "Falha ao listar agentes" }, { status: 500 });
  }
}

interface CreateAgentBody {
  name: string;
  companyName: string;
  siteUrl?: string;
  customPrompt?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateAgentBody;
    if (!body.name || !body.companyName) {
      return NextResponse.json({ error: "name e companyName são obrigatórios" }, { status: 400 });
    }

    const agent = await createAgent({
      slug: generateSlug(),
      name: body.name,
      companyName: body.companyName,
      siteUrl: body.siteUrl,
      customPrompt: body.customPrompt,
    });

    // Lê o site na hora da criação (RAG simplificado v1). É síncrono aqui
    // de propósito: pra demo, é melhor a pessoa esperar alguns segundos e
    // já ver o agente pronto do que criar um sistema de fila só pra isso.
    if (body.siteUrl) {
      const crawl = await fetchSiteKnowledge(body.siteUrl);
      await updateAgentKnowledge(agent.id, crawl.text, crawl.status);
      agent.site_knowledge = crawl.text;
      agent.crawl_status = crawl.status;
    }

    return NextResponse.json({ agent });
  } catch (err) {
    console.error("[/api/agents] POST erro:", err);
    return NextResponse.json({ error: "Falha ao criar agente" }, { status: 500 });
  }
}
