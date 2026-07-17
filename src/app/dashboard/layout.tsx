"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@calead/ui";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <AppShell
      brand={
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-gradient-to-br from-white/90 to-white/55 font-display text-sm font-bold text-[#111]">
            C
          </span>
          <span className="font-display text-base font-bold tracking-[-0.01em] text-white/92">Calead</span>
        </Link>
      }
      onLogout={handleLogout}
    >
      {children}
    </AppShell>
  );
}
