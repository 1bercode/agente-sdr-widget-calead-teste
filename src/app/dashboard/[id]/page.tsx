import { getAgentById, listConversationsByAgent } from "@/lib/db";
import { Badge, Card, CardTitle, StatusDot } from "@calead/ui";
import CopySnippet from "@/components/CopySnippet";
import DeleteAgentButton from "@/components/DeleteAgentButton";
import RecrawlButton from "@/components/RecrawlButton";
import Link from "next/link";

export default async function AgentDetailPage({ params }: { params: { id: string } }) {
  const agent = await getAgentById(params.id);

  if (!agent) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-white/50">Agente não encontrado.</p>
        <Link href="/dashboard" className="text-sm text-white/70 hover:text-white">
          ← Voltar
        </Link>
      </div>
    );
  }

  const conversations = await listConversationsByAgent(agent.slug);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="mb-3.5 block text-[13px] text-white/42 hover:text-white/70">
          ← Todos os agentes
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[26px] font-bold tracking-[-0.02em] text-white/92">
              {agent.name}
            </h1>
            <p className="mt-[5px] text-[13.5px] text-white/42">
              Aparece pro visitante como &ldquo;{agent.company_name}&rdquo;
            </p>
          </div>
          <span className="inline-flex items-center gap-[7px] rounded-full border border-white/10 px-[13px] py-[7px] text-[12.5px] text-white/65">
            <StatusDot status="online" glow />
            ativo
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardTitle>Snippet de embed</CardTitle>
          <div className="mt-3">
            <CopySnippet agentId={agent.slug} />
          </div>
        </Card>

        <Card>
          <CardTitle>Base de conhecimento</CardTitle>
          <p className="mt-3 text-[13px] text-white/65">{agent.site_url || "sem site definido"}</p>
          <div className="mt-2 inline-flex items-center gap-[7px] text-[12.5px] text-white/65">
            <StatusDot
              status={agent.crawl_status === "done" ? "online" : agent.crawl_status === "failed" ? "busy" : "offline"}
            />
            {agent.crawl_status === "done"
              ? "lido com sucesso"
              : agent.crawl_status === "failed"
              ? "falha ao ler"
              : "pendente"}
          </div>
          <RecrawlButton agentId={agent.id} />
          {agent.site_knowledge && (
            <details className="mt-3">
              <summary className="cursor-pointer text-[12.5px] text-white/55 hover:text-white/80">
                Ver o que foi extraído
              </summary>
              <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-[11px] border border-white/[0.08] bg-black/[0.25] p-3 text-xs text-white/55">
                {agent.site_knowledge}
              </p>
            </details>
          )}
        </Card>

        <Card className="md:col-span-2">
          <CardTitle>Instruções específicas</CardTitle>
          <p className="mt-3 whitespace-pre-wrap text-sm text-white/65">
            {agent.custom_prompt || "Nenhuma instrução extra definida."}
          </p>
        </Card>

        <Card className="md:col-span-2">
          <CardTitle>Conversas recentes</CardTitle>
          {conversations.length === 0 ? (
            <p className="mt-3 text-sm text-white/35">Nenhuma conversa ainda. Testa o widget pra ver aparecer aqui.</p>
          ) : (
            <div className="mt-3.5 space-y-2">
              {conversations.map((c: any) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.09] bg-white/[0.025] px-[15px] py-[13px]"
                >
                  <div>
                    <span className="text-[13.5px] font-medium text-white/90">
                      {c.qualification?.empresa_ou_papel || "Visitante"}
                    </span>
                    {c.context_summary && (
                      <p className="mt-0.5 text-xs text-white/42">{c.context_summary}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {c.wants_human && <Badge variant="success">handoff registrado</Badge>}
                    <span className="text-xs text-white/35">{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="border-red-500/20">
        <CardTitle>Zona de perigo</CardTitle>
        <p className="mt-2 text-[13px] text-white/42">
          Apagar remove o agente, todas as conversas e invalida o snippet de embed.
        </p>
        <div className="mt-3">
          <DeleteAgentButton agentId={agent.id} agentName={agent.name} />
        </div>
      </Card>
    </div>
  );
}
