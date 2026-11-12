import { NextResponse } from "next/server";
import { clearSessionToken } from "@/lib/authSession";

export async function POST() {
  await clearSessionToken();
  return NextResponse.json({ ok: true });
}
