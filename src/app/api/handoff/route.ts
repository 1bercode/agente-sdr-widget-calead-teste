import { NextResponse } from "next/server";

export const runtime = "nodejs";

// DEPRECATED: agente-wazai não usa handoff pra humano/reunião — o agente
// conduz a compra direto no chat. Essa rota não é mais chamada por nenhum
// código do widget. Não consegui apagar o arquivo por uma limitação do
// filesystem montado, mas pode ser apagado manualmente com segurança.
export async function POST() {
  return NextResponse.json({ ok: false, error: "Rota desativada" }, { status: 410 });
}
