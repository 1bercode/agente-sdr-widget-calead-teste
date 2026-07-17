import { NextRequest, NextResponse } from "next/server";
import { deleteAgent, getAgentById } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agent = await getAgentById(params.id);
    if (!agent) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 });
    }

    await deleteAgent(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/agents] DELETE erro:", err);
    return NextResponse.json({ error: "Falha ao apagar agente" }, { status: 500 });
  }
}
