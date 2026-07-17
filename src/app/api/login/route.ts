import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  const expectedPassword = process.env.DASHBOARD_PASSWORD;
  const sessionSecret = process.env.DASHBOARD_SESSION_SECRET;

  if (!expectedPassword || !sessionSecret) {
    return NextResponse.json(
      { error: "DASHBOARD_PASSWORD / DASHBOARD_SESSION_SECRET não configurados no .env.local" },
      { status: 500 }
    );
  }

  if (password !== expectedPassword) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("calead_session", sessionSecret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });
  return res;
}
