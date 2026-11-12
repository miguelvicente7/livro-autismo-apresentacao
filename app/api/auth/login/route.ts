import { NextResponse } from "next/server";
import { CmsAuthError, loginWithCms } from "@/lib/cmsAuth";
import { setSessionToken } from "@/lib/authSession";
import { parseRequestJson } from "@/lib/parseRequestJson";

type Body = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const parsed = await parseRequestJson<Body>(request);
    if (!parsed.ok) return parsed.response;

    const email = parsed.data.email?.trim().toLowerCase() || "";
    const password = parsed.data.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Informe e-mail e senha." },
        { status: 400 }
      );
    }

    const result = await loginWithCms(email, password);
    await setSessionToken(result.token);

    return NextResponse.json({ user: result.user });
  } catch (error) {
    if (error instanceof CmsAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Erro interno ao autenticar." },
      { status: 500 }
    );
  }
}
