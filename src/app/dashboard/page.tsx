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
          <Link key={agent.id} href={`/dashboard/${agent.id}`}>
            <Card padding="sm" className="cursor-pointer">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3.5">
                  <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.07] font-display text-[16px] font-semibold text-white/65">
                    {agent.name.trim().charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-semibold text-white/92">{agent.name}</p>
                    <p className="truncate text-[12.5px] text-white/42">{agent.site_url || "sem site definido"}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    agent.crawl_status === "done"
                      ? "success"
                      : agent.crawl_status === "failed"
                      ? "error"
                      : "neutral"
                  }
                  className="shrink-0"
                >
                  {agent.crawl_status === "done"
                    ? "site lido"
                    : agent.crawl_status === "failed"
                    ? "falha ao ler"
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
