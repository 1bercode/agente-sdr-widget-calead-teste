import { NextRequest, NextResponse } from "next/server";
import { verifySessionCookieValue } from "@/lib/auth";

// Gate simples de acesso ao dashboard e APIs administrativas: um usuário
// único, senha única, cookie assinado com HMAC. Não é auth multi-usuário
// de verdade — é o suficiente pra uma demonstração com uma pessoa só.
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isDashboard = path.startsWith("/dashboard");
  const isAgentsApi = path.startsWith("/api/agents");
  if (!isDashboard && !isAgentsApi) return NextResponse.next();

  const session = req.cookies.get("calead_session")?.value;
  const secret = process.env.DASHBOARD_SESSION_SECRET;

  if (!secret || !(await verifySessionCookieValue(session, secret))) {
    if (isAgentsApi) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/agents"],
};
