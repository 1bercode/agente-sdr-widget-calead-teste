"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Input } from "@calead/ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Não deu pra entrar.");
        return;
      }
      router.push(searchParams.get("next") || "/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="calead-bg flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-[390px]">
        <Card padding="lg" className="space-y-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px] bg-gradient-to-br from-white/90 to-white/55 font-display text-[17px] font-bold text-[#111]">
              C
            </span>
            <span className="font-display text-lg font-bold tracking-[-0.01em] text-white/92">Calead</span>
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-white/92">Entrar no dashboard</h1>
            <p className="mt-1 text-[13.5px] text-white/42">Plataforma de agentes SDR qualificadores.</p>
          </div>
          <div className="space-y-3">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              autoFocus
            />
            {error && <p className="text-sm text-red-300">{error}</p>}
            <Button type="submit" disabled={loading} fullWidth>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </div>
          <p className="text-center text-[11.5px] text-white/35">
            Sessão única · protegido por cookie assinado
          </p>
        </Card>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
