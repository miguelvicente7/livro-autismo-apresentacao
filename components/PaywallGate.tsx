"use client";

type PaywallGateProps = {
  open: boolean;
  onLogin: () => void;
  onClose: () => void;
};

export default function PaywallGate({
  open,
  onLogin,
  onClose,
}: PaywallGateProps) {
  if (!open) return null;

  return (
    <div className="paywall-banner" role="status">
      <div className="paywall-banner-inner">
        <p>
          Conteúdo exclusivo. Entre na sua conta para continuar a leitura.
        </p>
        <div className="paywall-banner-actions">
          <button type="button" className="auth-submit" onClick={onLogin}>
            Entrar
          </button>
          <button type="button" className="paywall-dismiss" onClick={onClose}>
            Voltar à capa
          </button>
        </div>
      </div>
    </div>
  );
}
