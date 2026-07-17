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
      <Button variant="ghost" size="sm" onClick={handleCopy} className="mt-3">
        {copied ? "Copiado ✓" : "Copiar snippet"}
      </Button>
      <p className="mt-2 text-[11.5px] text-white/35">
        Cola isso antes do <code className="rounded bg-black/30 px-1">&lt;/body&gt;</code> do site onde quer
        que o agente apareça.
        {!origin && " (o domínio real aparece aqui quando a página carregar no navegador)"}
      </p>
    </div>
  );
}
