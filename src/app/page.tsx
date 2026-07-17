import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="max-w-xl space-y-4 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Calead</h1>
        <p className="text-slate-600">
          Crie um agente qualificador de IA pro seu site: ele lê seu site, conversa com o
          visitante, qualifica de forma leve e te conecta com um humano no momento certo.
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-lg bg-calead-accent px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          Entrar no dashboard
        </Link>
      </div>
    </main>
  );
}
