import Link from "next/link";
import { Button } from "@calead/ui";

export default function Home() {
  return (
    <main className="calead-bg flex min-h-screen items-center justify-center p-8">
      <div className="max-w-xl space-y-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-white/90 to-white/55 font-display text-xl font-bold text-[#111]">
          C
        </div>
        <h1 className="font-display text-3xl font-bold tracking-[-0.02em] text-white/92">Calead</h1>
        <p className="text-[15px] leading-relaxed text-white/55">
          Crie um agente SDR consultivo pro seu site: lê seu site, conversa com visitantes, qualifica
          de forma natural e convida pra reunião no momento certo.
        </p>
        <Link href="/login">
          <Button>Entrar no dashboard</Button>
        </Link>
      </div>
    </main>
  );
}
