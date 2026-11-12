export type CmsUser = {
  id: string;
  email: string;
  name?: string;
};

export type CmsAuthResult = {
  token: string;
  user: CmsUser;
};

export class CmsAuthError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "CmsAuthError";
    this.status = status;
  }
}

const getCmsBaseUrl = () => {
  const base = process.env.CMS_API_URL?.replace(/\/$/, "");
  if (!base) {
    throw new CmsAuthError("CMS_API_URL não configurada no servidor.", 500);
  }
  return base;
};

const getPath = (envKey: string, fallback: string) => {
  const value = process.env[envKey]?.trim();
  if (!value) return fallback;
  return value.startsWith("/") ? value : `/${value}`;
};

const parseJsonSafe = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const extractErrorMessage = (payload: unknown, fallback: string) => {
  if (!payload || typeof payload !== "object") return fallback;
  const data = payload as Record<string, unknown>;
  if (typeof data.message === "string" && data.message.trim()) return data.message;
  if (typeof data.error === "string" && data.error.trim()) return data.error;
  if (data.error && typeof data.error === "object") {
    const nested = data.error as Record<string, unknown>;
    if (typeof nested.message === "string" && nested.message.trim()) {
      return nested.message;
    }
  }
  return fallback;
};

const normalizeUser = (raw: unknown, fallbackEmail?: string): CmsUser => {
  if (!raw || typeof raw !== "object") {
    return {
      id: "unknown",
      email: fallbackEmail || "",
    };
  }

  const data = raw as Record<string, unknown>;
  const idValue = data.id ?? data.uuid ?? data._id;
  const emailValue = data.email ?? fallbackEmail ?? "";
  const nameValue = data.name ?? data.nome ?? data.username;

  return {
    id: idValue != null ? String(idValue) : "unknown",
    email: String(emailValue),
    name: typeof nameValue === "string" ? nameValue : undefined,
  };
};

const normalizeAuthResult = (
  payload: unknown,
  fallbackEmail?: string
): CmsAuthResult => {
  if (!payload || typeof payload !== "object") {
    throw new CmsAuthError("Resposta inválida do CMS.", 502);
  }

  const data = payload as Record<string, unknown>;
  let token = "";

  if (typeof data.token === "string") token = data.token;
  else if (typeof data.accessToken === "string") token = data.accessToken;
  else if (typeof data.access_token === "string") token = data.access_token;
  else if (data.data && typeof data.data === "object") {
    const nested = data.data as Record<string, unknown>;
    if (typeof nested.token === "string") token = nested.token;
    else if (typeof nested.accessToken === "string") token = nested.accessToken;
  }

  if (!token) {
    throw new CmsAuthError("CMS não retornou token de sessão.", 502);
  }

  const userRaw =
    data.user ??
    (data.data && typeof data.data === "object"
      ? (data.data as Record<string, unknown>).user
      : undefined) ??
    data;

  return {
    token,
    user: normalizeUser(userRaw, fallbackEmail),
  };
};

const postCredentials = async (
  path: string,
  email: string,
  password: string,
  fallbackError: string
): Promise<CmsAuthResult> => {
  const response = await fetch(`${getCmsBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    throw new CmsAuthError(
      extractErrorMessage(payload, fallbackError),
      response.status
    );
  }

  return normalizeAuthResult(payload, email);
};

export const loginWithCms = (email: string, password: string) =>
  postCredentials(
    getPath("CMS_LOGIN_PATH", "/auth/login"),
    email,
    password,
    "Não foi possível entrar. Verifique e-mail e senha."
  );

export const registerWithCms = (email: string, password: string) =>
  postCredentials(
    getPath("CMS_REGISTER_PATH", "/auth/register"),
    email,
    password,
    "Não foi possível criar a conta."
  );

export const fetchCmsUser = async (token: string): Promise<CmsUser> => {
  const response = await fetch(
    `${getCmsBaseUrl()}${getPath("CMS_ME_PATH", "/auth/me")}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    throw new CmsAuthError(
      extractErrorMessage(payload, "Sessão inválida ou expirada."),
      response.status
    );
  }

  const userRaw =
    payload && typeof payload === "object"
      ? ((payload as Record<string, unknown>).user ?? payload)
      : payload;

  return normalizeUser(userRaw);
};
