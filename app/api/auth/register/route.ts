import { NextResponse } from "next/server";
import { CmsAuthError, registerWithCms } from "@/lib/cmsAuth";
import { setSessionToken } from "@/lib/authSession";

type Body = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const email = body.email?.trim().toLowerCase() || "";
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Informe e-mail e senha." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const result = await registerWithCms(email, password);
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
      { error: "Erro interno ao criar conta." },
      { status: 500 }
    );
  }
}
