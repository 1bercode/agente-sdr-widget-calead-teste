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
        <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
          Calead
        </Link>
      }
      onLogout={handleLogout}
    >
      {children}
    </AppShell>
  );
}
