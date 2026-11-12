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

const getCmsApiKey = () => process.env.CMS_API_KEY?.trim() || "";

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
  if (typeof data.msg === "string" && data.msg.trim()) return data.msg;
  if (data.error && typeof data.error === "object") {
    const nested = data.error as Record<string, unknown>;
    if (typeof nested.message === "string" && nested.message.trim()) {
      return nested.message;
    }
  }
  return fallback;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : null;

const unwrapData = (payload: unknown): Record<string, unknown> | null => {
  const root = asRecord(payload);
  if (!root) return null;
  const nested = asRecord(root.data);
  return nested ?? root;
};

const normalizeUser = (raw: unknown, fallbackEmail?: string): CmsUser => {
  const root = asRecord(raw);
  if (!root) {
    return {
      id: "unknown",
      email: fallbackEmail || "",
    };
  }

  // ControleEstoque CMS: { session: { customer } } ou { customer }
  const session = asRecord(root.session);
  const customer = asRecord(root.customer) ?? asRecord(session?.customer);
  const source = customer ?? root;

  const idValue = source.id ?? source.uuid ?? source._id;
  const emailValue = source.email ?? fallbackEmail ?? "";
  const nameValue = source.name ?? source.nome ?? source.username;

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

  const data = unwrapData(payload) ?? (payload as Record<string, unknown>);
  let token = "";

  if (typeof data.token === "string") token = data.token;
  else if (typeof data.accessToken === "string") token = data.accessToken;
  else if (typeof data.access_token === "string") token = data.access_token;

  if (!token) {
    throw new CmsAuthError("CMS não retornou token de sessão.", 502);
  }

  const userRaw = data.user ?? data.session ?? data;

  return {
    token,
    user: normalizeUser(userRaw, fallbackEmail),
  };
};

type PostCredentialsOptions = {
  includeName?: boolean;
};

const postCredentials = async (
  path: string,
  email: string,
  password: string,
  fallbackError: string,
  options: PostCredentialsOptions = {}
): Promise<CmsAuthResult> => {
  const apiKey = getCmsApiKey();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  // CMS ControleEstoque exige Bearer com API key em /api/v1/auth/*
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const body: Record<string, string> = { email, password };
  if (options.includeName) {
    body.name = email.split("@")[0] || email;
  }

  const response = await fetch(`${getCmsBaseUrl()}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
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
    getPath("CMS_LOGIN_PATH", "/api/v1/auth/login"),
    email,
    password,
    "Não foi possível entrar. Verifique e-mail e senha."
  );

export const registerWithCms = (email: string, password: string) =>
  postCredentials(
    getPath("CMS_REGISTER_PATH", "/api/v1/auth/register"),
    email,
    password,
    "Não foi possível criar a conta.",
    { includeName: true }
  );

export const fetchCmsUser = async (token: string): Promise<CmsUser> => {
  const response = await fetch(
    `${getCmsBaseUrl()}${getPath("CMS_ME_PATH", "/api/v1/auth/session")}`,
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

  const data = unwrapData(payload) ?? asRecord(payload);
  return normalizeUser(data, undefined);
};
