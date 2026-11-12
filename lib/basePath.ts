const configured =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_BASE_PATH?.trim() : "";

/** Prefixo público da app (ex.: /livro-autismo). Vazio só se next.config não definir. */
export const BASE_PATH = configured || "";

export const withBasePath = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!BASE_PATH) return normalized;
  return `${BASE_PATH}${normalized}`;
};
