import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteAgent, getAgentById } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agent = await getAgentById(params.id);
    if (!agent) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 });
    }

    const removed = await deleteAgent(params.id);
    if (!removed) {
      return NextResponse.json({ error: "Agente não encontrado" }, { status: 404 });
    }

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/${params.id}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/agents] DELETE erro:", err);
    const message = err instanceof Error ? err.message : "Falha ao apagar agente";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
