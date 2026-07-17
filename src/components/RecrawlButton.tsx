"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@calead/ui";

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
    <div className="mt-3.5 flex flex-wrap items-center gap-3">
      <Button variant="ghost" size="sm" onClick={handleRecrawl} disabled={loading}>
        {loading ? "Relendo site..." : "Reler site agora"}
      </Button>
      {message && <span className="text-xs text-white/42">{message}</span>}
    </div>
  );
}
