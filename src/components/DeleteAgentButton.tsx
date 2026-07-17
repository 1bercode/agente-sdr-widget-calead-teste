"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@calead/ui";

export default function DeleteAgentButton({
  agentId,
  agentName,
}: {
  agentId: string;
  agentName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/agents/${agentId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Não deu pra apagar o agente.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-red-400/90 hover:bg-red-500/10 hover:text-red-300"
        onClick={() => setConfirming(true)}
      >
        Apagar agente
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/55">
        Tem certeza? Isso apaga <span className="font-medium text-white/80">{agentName}</span>, todas
        as conversas e o snippet para de funcionar.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Apagando..." : "Sim, apagar"}
        </Button>
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
