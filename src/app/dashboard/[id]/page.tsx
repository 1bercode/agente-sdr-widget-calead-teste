import { getAgentById, listConversationsByAgent } from "@/lib/db";
import { Badge, Card, CardTitle } from "@calead/ui";
import CopySnippet from "@/components/CopySnippet";
import RecrawlButton from "@/components/RecrawlButton";
import Link from "next/link";

export default async function AgentDetailPage({ params }: { params: { id: string } }) {
  const agent = await getAgentById(params.id);

  if (!agent) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-500">Agente não encontrado.</p>
        <Link href="/dashboard" className="text-sm text-calead-accent">
          ← Voltar
        </Link>
      </div>
    );
  }

  const conversations = await listConversationsByAgent(agent.slug);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-700">
          ← Todos os agentes
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">{agent.name}</h1>
        <p className="text-sm text-slate-500">Aparece pro visitante como &ldquo;{agent.company_name}&rdquo;</p>
      </div>

      <Card>
        <CardTitle className="mb-3">Snippet de embed</CardTitle>
        <CopySnippet agentId={agent.slug} />
      </Card>

      <Card>
        <CardTitle className="mb-3">Base de conhecimento (site)</CardTitle>
        <p className="text-sm text-slate-500">
          Site: {agent.site_url || "—"} ·{" "}
          <span
            className={
              agent.crawl_status === "done"
                ? "text-emerald-600"
                : agent.crawl_status === "failed"
                ? "text-red-600"
                : "text-slate-500"
            }
          >
            {agent.crawl_status === "done" ? "lido com sucesso" : agent.crawl_status === "failed" ? "falha ao ler" : "pendente"}
          </span>
        </p>
        <RecrawlButton agentId={agent.id} />
        {agent.site_knowledge && (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm text-calead-accent">Ver o que foi extraído</summary>
            <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              {agent.site_knowledge}
            </p>
          </details>
        )}
      </Card>

      <Card>
        <CardTitle className="mb-3">Instruções específicas</CardTitle>
        <p className="whitespace-pre-wrap text-sm text-slate-600">
          {agent.custom_prompt || "Nenhuma instrução extra definida."}
        </p>
      </Card>

      <Card>
        <CardTitle className="mb-3">Conversas recentes</CardTitle>
        {conversations.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhuma conversa ainda. Testa o widget pra ver aparecer aqui.</p>
        ) : (
          <div className="space-y-2">
            {conversations.map((c: any) => (
              <div key={c.id} className="rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700">
                    {c.qualification?.empresa_ou_papel || "Visitante"}
                  </span>
                  <div className="flex items-center gap-2">
                    {c.wants_human && <Badge variant="warning">quer reunião</Badge>}
                    <span className="text-xs text-slate-400">{c.status}</span>
                  </div>
                </div>
                {c.context_summary && <p className="mt-1 text-xs text-slate-500">{c.context_summary}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
