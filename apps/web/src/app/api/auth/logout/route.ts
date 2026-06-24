import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("conectage-session");
  res.cookies.delete("conectage-role");
  res.cookies.delete("conectage-user");
  return res;
}
