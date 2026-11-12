import { NextResponse } from "next/server";
import { clearSessionToken, getSessionToken } from "@/lib/authSession";
import { revokeSessionToken } from "@/lib/revokedSessions";

export async function POST() {
  const token = await getSessionToken();
  if (token) {
    revokeSessionToken(token);
  }
  await clearSessionToken();
  return NextResponse.json({ ok: true });
}
