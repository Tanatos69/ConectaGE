import { NextResponse } from "next/server";

// Built-in demo accounts (always available)
const BASE_ACCOUNTS = [
  { email: "usuario@demo.com", password: "demo1234", role: "user" },
  { email: "admin@conectage.com", password: "admin2024", role: "admin" },
];

// Extra accounts via env var: "email:password:role,email2:password2:role2"
function extraAccounts() {
  const raw = process.env.DEMO_ACCOUNTS ?? "";
  return raw
    .split(",")
    .map((entry) => {
      const [email, password, role] = entry.trim().split(":");
      return email && password && role ? { email, password, role } : null;
    })
    .filter(Boolean) as { email: string; password: string; role: string }[];
}

function getAllAccounts() {
  return [...BASE_ACCOUNTS, ...extraAccounts()];
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = body?.email?.toLowerCase().trim();
  const password = body?.password;

  const account = getAllAccounts().find(
    (a) => a.email === email && a.password === password,
  );

  if (!account) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const res = NextResponse.json({ role: account.role });

  // httpOnly — read by middleware to protect routes
  res.cookies.set("conectage-session", account.role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  // readable by JS — used by the header to show Sign out vs Sign in
  res.cookies.set("conectage-role", account.role, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return res;
}
