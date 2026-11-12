import { createHash } from "crypto";

type RevokedEntry = {
  expiresAt: number;
};

/** Denylist em memória: tokens após logout local (CMS não tem revoke de JWT). */
const revoked = new Map<string, RevokedEntry>();

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const pruneExpired = (now = Date.now()) => {
  for (const [key, entry] of revoked) {
    if (entry.expiresAt <= now) revoked.delete(key);
  }
};

const readJwtExpMs = (token: string): number | null => {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const json = Buffer.from(
      payloadPart.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf8");
    const payload = JSON.parse(json) as { exp?: unknown };
    if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) {
      return null;
    }
    return payload.exp * 1000;
  } catch {
    return null;
  }
};

export const revokeSessionToken = (token: string) => {
  const trimmed = token.trim();
  if (!trimmed) return;

  pruneExpired();
  const jwtExp = readJwtExpMs(trimmed);
  const fallback = Date.now() + 60 * 60 * 24 * 7 * 1000;
  revoked.set(hashToken(trimmed), {
    expiresAt: jwtExp && jwtExp > Date.now() ? jwtExp : fallback,
  });
};

export const isSessionTokenRevoked = (token: string) => {
  const trimmed = token.trim();
  if (!trimmed) return false;

  pruneExpired();
  return revoked.has(hashToken(trimmed));
};
