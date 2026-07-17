"use client";

import { useEffect, useState } from "react";
import { Button, CodeBlock } from "@calead/ui";

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
      <CodeBlock>{snippet}</CodeBlock>
      <Button variant="secondary" size="sm" onClick={handleCopy} className="mt-2">
        {copied ? "Copiado ✓" : "Copiar snippet"}
      </Button>
      <p className="mt-2 text-xs text-slate-400">
        Cola isso antes do <code>&lt;/body&gt;</code> do site onde quer que o agente apareça.
        {!origin && " (o domínio real aparece aqui quando a página carregar no navegador)"}
      </p>
    </div>
  );
}
