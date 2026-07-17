"use client";

import { useEffect, useState } from "react";

export default function CopySnippet({ agentId }: { agentId: string }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const snippet = `<script
  src="${origin || "https://SEU-DOMINIO"}/embed.js"
  data-agent-id="${agentId}"
  async
></script>`;

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <pre className="overflow-x-auto rounded-lg bg-slate-900 px-4 py-3 text-xs text-slate-100">
        <code>{snippet}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="mt-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:border-calead-accent"
      >
        {copied ? "Copiado ✓" : "Copiar snippet"}
      </button>
      <p className="mt-2 text-xs text-slate-400">
        Cola isso antes do <code>&lt;/body&gt;</code> do site onde quer que o agente apareça.
        {!origin && " (o domínio real aparece aqui quando a página carregar no navegador)"}
      </p>
    </div>
  );
}
