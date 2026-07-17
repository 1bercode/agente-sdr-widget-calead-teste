"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RecrawlButton({ agentId }: { agentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRecrawl() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/agents/${agentId}/recrawl`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Não deu pra reler o site.");
        return;
      }
      setMessage(
        data.crawl_status === "done"
          ? `Site relido (${data.chars} caracteres indexados).`
          : "Falha ao ler o site — confere a URL."
      );
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleRecrawl}
        disabled={loading}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        {loading ? "Relendo site..." : "Reler site agora"}
      </button>
      {message && <span className="text-xs text-slate-500">{message}</span>}
    </div>
  );
}
