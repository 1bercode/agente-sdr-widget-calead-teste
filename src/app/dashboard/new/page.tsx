"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewAgentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, companyName, siteUrl, customPrompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não deu pra criar o agente.");
        return;
      }
      router.push(`/dashboard/${data.agent.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Novo agente</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nome interno</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ex: Widget site principal"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-calead-accent"
          />
          <p className="mt-1 text-xs text-slate-400">Só aparece aqui no dashboard, não pro visitante.</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nome da empresa (mostrado no widget)</label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            placeholder="Ex: Acme Inc"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-calead-accent"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Site da empresa</label>
          <input
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://empresa.com"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-calead-accent"
          />
          <p className="mt-1 text-xs text-slate-400">
            A gente lê a home desse site na hora de criar o agente, pra ele já responder dúvidas sobre o produto.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Como esse agente deve agir (opcional)
          </label>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={5}
            placeholder="Ex: Somos uma consultoria B2B. Foque em entender o tamanho da empresa e a dor principal antes de oferecer reunião. Fale de forma direta, sem enrolação."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-calead-accent"
          />
          <p className="mt-1 text-xs text-slate-400">
            As regras Human First (nunca fingir ser humano, nunca pressionar, sempre oferecer um humano) valem
            sempre, independente do que for escrito aqui.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-calead-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Criando e lendo o site..." : "Criar agente"}
        </button>
      </form>
    </div>
  );
}
