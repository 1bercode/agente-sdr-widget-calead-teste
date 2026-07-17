import Script from "next/script";

// Página de teste: simula um site de cliente com o widget embutido via
// snippet, exatamente como ficaria em produção. Passa o agentId de um
// agente real, criado no dashboard: /test-site?agentId=abcd1234
export default function TestSitePage({
  searchParams,
}: {
  searchParams: { agentId?: string };
}) {
  const agentId = searchParams.agentId;

  return (
    <>
      <main className="min-h-screen bg-[#f0f0f0]" data-calead-preview>
        <header className="flex items-center justify-between border-b px-8 py-4">
          <span className="text-lg font-bold text-slate-900">Empresa Exemplo</span>
          <nav className="flex gap-6 text-sm text-slate-600">
            <span>Produto</span>
            <span>Preços</span>
            <span>Contato</span>
          </nav>
        </header>
        <section className="mx-auto max-w-3xl px-8 py-24 text-center">
          <h1 className="text-4xl font-semibold text-slate-900">
            Este é um site de teste
          </h1>
          {agentId ? (
            <p className="mt-4 text-slate-600">
              O widget do Calead está embutido na barra de baixo via o snippet{" "}
              <code className="rounded bg-slate-100 px-1">/embed.js</code>, usando o agente{" "}
              <code className="rounded bg-slate-100 px-1">{agentId}</code>.
            </p>
          ) : (
            <p className="mt-4 text-slate-600">
              Cria um agente em{" "}
              <a href="/dashboard/new" className="text-calead-accent underline">
                /dashboard/new
              </a>{" "}
              e volta aqui com{" "}
              <code className="rounded bg-slate-100 px-1">/test-site?agentId=SEU_ID</code> pra ver o
              widget funcionando.
            </p>
          )}
        </section>
      </main>

      {agentId && <Script src="/embed.js" data-agent-id={agentId} strategy="afterInteractive" />}
    </>
  );
}
