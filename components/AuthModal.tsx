"use client";

import { FormEvent, useEffect, useState } from "react";
import { loginRequest, registerRequest } from "@/lib/authClient";
import type { CmsUser } from "@/lib/cmsAuth";

export type AuthMode = "login" | "register";

type AuthModalProps = {
  open: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccess: (user: CmsUser) => void;
};

export default function AuthModal({
  open,
  initialMode = "login",
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setPassword("");
      setError("");
      setLoading(false);
      return;
    }
    setMode(initialMode);
    setError("");
    setLoading(false);
  }, [open, initialMode]);

  useEffect(() => {
    if (!open) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const credentials = {
        email: email.trim(),
        password,
      };
      const result =
        mode === "login"
          ? await loginRequest(credentials)
          : await registerRequest(credentials);
      onSuccess(result.user);
      setPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível continuar."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" role="presentation" onClick={onClose}>
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="auth-close"
          aria-label="Fechar"
          onClick={onClose}
        >
          &times;
        </button>

        <p className="auth-eyebrow">Acesso ao livro</p>
        <h2 id="auth-modal-title">
          {mode === "login" ? "Entrar para continuar" : "Criar sua conta"}
        </h2>
        <p className="auth-subtitle">
          A capa é gratuita. Faça login ou cadastre-se para ler os capítulos.
        </p>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              setError("");
            }}
          >
            Criar conta
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="auth-email">E-mail</label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="auth-password">Senha</label>
            <input
              id="auth-password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Sua senha"
              minLength={mode === "register" ? 6 : undefined}
              required
            />
          </div>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? "Aguarde…"
              : mode === "login"
                ? "Entrar"
                : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
