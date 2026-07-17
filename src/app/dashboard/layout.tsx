"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
          Calead
        </Link>
        <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-slate-800">
          Sair
        </button>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
