import Link from "next/link";
import { Alert, Badge, Button, Card, EmptyState, PageHeader } from "@calead/ui";
import { listAgents } from "@/lib/db";

export default async function DashboardPage() {
  let agents: Awaited<ReturnType<typeof listAgents>> = [];
  let loadError = false;
  try {
    agents = await listAgents();
  } catch {
    loadError = true;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seus agentes"
        action={
          <Link href="/dashboard/new">
            <Button>+ Novo agente</Button>
          </Link>
        }
      />

      {loadError && (
        <Alert variant="warning">
          Não consegui carregar os agentes agora. Confere se as variáveis do Supabase estão certas em
          <code className="mx-1 rounded bg-amber-100 px-1">.env.local</code>
          e se a migration <code className="mx-1 rounded bg-amber-100 px-1">0002_agents.sql</code> já rodou.
        </Alert>
      )}

      {!loadError && agents.length === 0 && (
        <EmptyState>Nenhum agente ainda. Clica em &ldquo;Novo agente&rdquo; pra criar o primeiro.</EmptyState>
      )}

      <div className="space-y-2">
        {agents.map((agent) => (
          <Link key={agent.id} href={`/dashboard/${agent.id}`}>
            <Card padding="sm" className="hover:border-calead-accent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{agent.name}</p>
                  <p className="text-sm text-slate-500">{agent.site_url || "sem site definido"}</p>
                </div>
                <Badge
                  variant={
                    agent.crawl_status === "done"
                      ? "success"
                      : agent.crawl_status === "failed"
                      ? "error"
                      : "neutral"
                  }
                >
                  {agent.crawl_status === "done"
                    ? "site lido"
                    : agent.crawl_status === "failed"
                    ? "falha ao ler site"
                    : "pendente"}
                </Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
