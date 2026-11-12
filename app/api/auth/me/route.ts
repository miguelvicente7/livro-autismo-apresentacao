import { NextResponse } from "next/server";
import { CmsAuthError, fetchCmsUser } from "@/lib/cmsAuth";
import { clearSessionToken, getSessionToken } from "@/lib/authSession";

export async function GET() {
  try {
    const token = await getSessionToken();
    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = await fetchCmsUser(token);
    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    if (error instanceof CmsAuthError) {
      // Sessão inválida: limpa cookie
      if (error.status === 401 || error.status === 403) {
        await clearSessionToken();
        return NextResponse.json({ authenticated: false, user: null });
      }

      // CMS fora / misconfigured: preserva cookie para retry
      const status = error.status >= 500 ? 503 : error.status;
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
          error: error.message,
          transient: true,
        },
        { status }
      );
    }

    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        error: "Erro ao validar sessão.",
        transient: true,
      },
      { status: 503 }
    );
  }
}
