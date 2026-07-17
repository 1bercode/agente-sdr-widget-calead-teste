import Link from "next/link";
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Seus agentes</h1>
        <Link
          href="/dashboard/new"
          className="rounded-lg bg-calead-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          + Novo agente
        </Link>
      </div>

      {loadError && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Não consegui carregar os agentes agora. Confere se as variáveis do Supabase estão certas em
          <code className="mx-1 rounded bg-amber-100 px-1">.env.local</code>
          e se a migration <code className="mx-1 rounded bg-amber-100 px-1">0002_agents.sql</code> já rodou.
        </p>
      )}

      {!loadError && agents.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
          Nenhum agente ainda. Clica em &ldquo;Novo agente&rdquo; pra criar o primeiro.
        </p>
      )}

      <div className="space-y-2">
        {agents.map((agent) => (
          <Link
            key={agent.id}
            href={`/dashboard/${agent.id}`}
            className="block rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-calead-accent"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{agent.name}</p>
                <p className="text-sm text-slate-500">{agent.site_url || "sem site definido"}</p>
              </div>
              <span
                className={
                  agent.crawl_status === "done"
                    ? "rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700"
                    : agent.crawl_status === "failed"
                    ? "rounded-full bg-red-100 px-2 py-1 text-xs text-red-700"
                    : "rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                }
              >
                {agent.crawl_status === "done"
                  ? "site lido"
                  : agent.crawl_status === "failed"
                  ? "falha ao ler site"
                  : "pendente"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
