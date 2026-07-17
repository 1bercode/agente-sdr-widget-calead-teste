import Link from "next/link";
import { Alert, Button, EmptyState, PageHeader } from "@calead/ui";
import AgentListItem from "@/components/AgentListItem";
import { listAgents } from "@/lib/db";

export const dynamic = "force-dynamic";

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
        description="Cada agente lê um site e gera um snippet único de embed."
        action={
          <Link href="/dashboard/new">
            <Button>+ Novo agente</Button>
          </Link>
        }
      />

      {loadError && (
        <Alert variant="warning">
          Não consegui carregar os agentes agora. Confere se as variáveis do Supabase estão certas em{" "}
          <code className="rounded bg-black/30 px-1">.env.local</code> e se a migration{" "}
          <code className="rounded bg-black/30 px-1">0002_agents.sql</code> já rodou.
        </Alert>
      )}

      {!loadError && agents.length === 0 && (
        <EmptyState>Nenhum agente ainda. Clica em &ldquo;Novo agente&rdquo; pra criar o primeiro.</EmptyState>
      )}

      <div className="space-y-2.5">
        {agents.map((agent) => (
          <AgentListItem key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
