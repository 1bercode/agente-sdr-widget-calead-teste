import Script from "next/script";

// Página de teste: simula um site de cliente com o widget embutido via
// snippet, exatamente como ficaria em produção.
export default function TestSitePage() {
  return (
    <>
      <main className="min-h-screen bg-white">
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
          <p className="mt-4 text-slate-600">
            O widget do Calead está embutido no canto inferior direito via o
            snippet <code className="rounded bg-slate-100 px-1">/embed.js</code>.
            Clique na bolha pra abrir o chat.
          </p>
        </section>
      </main>

      <Script
        src="/embed.js"
        data-agent-id="demo-empresa-exemplo"
        data-company-name="Empresa Exemplo"
        strategy="afterInteractive"
      />
    </>
  );
}
