import { NextResponse } from "next/server";

export const parseRequestJson = async <T = unknown>(
  request: Request
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> => {
  try {
    const data = (await request.json()) as T;
    return { ok: true, data };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Corpo da requisição inválido. Envie JSON válido." },
        { status: 400 }
      ),
    };
  }
};
