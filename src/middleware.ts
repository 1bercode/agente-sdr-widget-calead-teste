import { NextRequest, NextResponse } from "next/server";

// Gate simples de acesso ao dashboard: um usuário único, senha única,
// checada por igualdade de cookie. Não é auth multi-usuário de verdade —
// é o suficiente pra uma demonstração com uma pessoa só usando. Quando o
// Calead virar multi-tenant de fato, isso é substituído por Supabase Auth
// com conta por usuário.
export function middleware(req: NextRequest) {
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  if (!isDashboard) return NextResponse.next();

  const session = req.cookies.get("calead_session")?.value;
  const expected = process.env.DASHBOARD_SESSION_SECRET;

  if (!expected || session !== expected) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
