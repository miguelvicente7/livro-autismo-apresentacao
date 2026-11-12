import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME =
  process.env.AUTH_COOKIE_NAME?.trim() || "livro_session";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const shouldUseSecureCookie = () => {
  if (process.env.AUTH_COOKIE_SECURE === "true") return true;
  if (process.env.AUTH_COOKIE_SECURE === "false") return false;
  // Em production via HTTP (Docker/local), force AUTH_COOKIE_SECURE=false
  return process.env.NODE_ENV === "production";
};

const cookiePath = () =>
  process.env.AUTH_COOKIE_PATH?.trim() ||
  process.env.NEXT_PUBLIC_BASE_PATH?.trim() ||
  "/";

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: shouldUseSecureCookie(),
  path: cookiePath(),
  maxAge,
});

export const getSessionToken = async () => {
  const store = await cookies();
  return store.get(AUTH_COOKIE_NAME)?.value || null;
};

export const setSessionToken = async (token: string) => {
  const store = await cookies();
  store.set(AUTH_COOKIE_NAME, token, cookieOptions(COOKIE_MAX_AGE));
};

export const clearSessionToken = async () => {
  const store = await cookies();
  store.set(AUTH_COOKIE_NAME, "", cookieOptions(0));
};
