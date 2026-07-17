"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Input, Textarea } from "@calead/ui";

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
    <div>
      <Link href="/dashboard" className="mb-3.5 block text-[13px] text-white/42 hover:text-white/70">
        ← Todos os agentes
      </Link>
      <h1 className="mb-[22px] font-display text-[26px] font-bold tracking-[-0.02em] text-white/92">
        Novo agente
      </h1>

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-[7px] block text-[12.5px] font-semibold text-white/65">Nome interno</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Widget site principal"
            />
            <p className="mt-[7px] text-[11.5px] text-white/42">Só aparece aqui no dashboard, não pro visitante.</p>
          </div>

          <div>
            <label className="mb-[7px] block text-[12.5px] font-semibold text-white/65">
              Nome da empresa <span className="text-white/42">(mostrado no widget)</span>
            </label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              placeholder="Ex: Acme Inc"
            />
          </div>

          <div>
            <label className="mb-[7px] block text-[12.5px] font-semibold text-white/65">Site da empresa</label>
            <Input
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://empresa.com"
            />
            <p className="mt-[7px] text-[11.5px] text-white/42">
              Lemos a home desse site na hora de criar o agente, pra ele já responder dúvidas sobre o produto.
            </p>
          </div>

          <div>
            <label className="mb-[7px] block text-[12.5px] font-semibold text-white/65">
              Como esse agente deve agir <span className="text-white/42">(opcional)</span>
            </label>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={5}
              className="resize-none"
              placeholder="Ex: Somos uma consultoria B2B. Foque em entender o tamanho da empresa e a dor principal antes de oferecer reunião."
            />
            <p className="mt-[7px] text-[11.5px] text-white/42">
              Atua como SDR consultivo: qualifica, responde dúvidas e convida pra reunião no momento certo.
            </p>
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <div className="flex gap-2.5">
            <Button type="submit" disabled={loading}>
              {loading ? "Criando e lendo o site..." : "Criar e ler o site"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.push("/dashboard")}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
