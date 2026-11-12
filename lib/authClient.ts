import type { CmsUser } from "./cmsAuth";

export type AuthMeResponse = {
  authenticated: boolean;
  user: CmsUser | null;
  error?: string;
  transient?: boolean;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

const parseError = async (response: Response) => {
  try {
    const data = await response.json();
    if (data && typeof data.error === "string") return data.error;
    if (data && typeof data.message === "string") return data.message;
  } catch {
    // ignore
  }
  return "Não foi possível concluir a solicitação.";
};

export const fetchMe = async (): Promise<AuthMeResponse> => {
  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    const data = (await response.json().catch(() => null)) as AuthMeResponse | null;

    if (!response.ok) {
      return {
        authenticated: false,
        user: null,
        error: data?.error,
        transient: data?.transient === true || response.status >= 500,
      };
    }

    return {
      authenticated: Boolean(data?.authenticated && data.user),
      user: data?.user ?? null,
      error: data?.error,
      transient: data?.transient,
    };
  } catch {
    return {
      authenticated: false,
      user: null,
      error: "Falha de rede ao validar sessão.",
      transient: true,
    };
  }
};

export const loginRequest = async (credentials: AuthCredentials) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json() as Promise<{ user: CmsUser }>;
};

export const registerRequest = async (credentials: AuthCredentials) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json() as Promise<{ user: CmsUser }>;
};

export const logoutRequest = async () => {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
};
