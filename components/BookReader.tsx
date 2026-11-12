"use client";

import { useEffect, useRef, useState } from "react";
import BookPages from "./BookPages";
import AuthModal, { type AuthMode } from "./AuthModal";
import PaywallGate from "./PaywallGate";
import { fetchMe, logoutRequest } from "@/lib/authClient";
import type { CmsUser } from "@/lib/cmsAuth";
import "@/styles/paywall.css";

const FREE_PAGE_LIMIT = 1;
const SWIPE_MIN = 40;
const SWIPE_RATIO = 1.2;
const FLIP_STATE_CLASSES = [
  "active",
  "next-ready",
  "flipping-forward",
  "flipping-back",
  "is-leaving",
  "is-entering",
];

export default function BookReader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const isAuthenticatedRef = useRef(false);
  const authReadyRef = useRef(false);
  const authOpenRef = useRef(false);
  const pendingPageRef = useRef<number | null>(null);
  const requireAuthRef = useRef<() => void>(() => undefined);
  const goToCoverRef = useRef<() => void>(() => undefined);
  const goToPageRef = useRef<(index: number, options?: { instant?: boolean }) => void>(
    () => undefined
  );
  const refreshTocLockRef = useRef<() => void>(() => undefined);

  const [user, setUser] = useState<CmsUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [authNotice, setAuthNotice] = useState("");

  isAuthenticatedRef.current = Boolean(user);
  authReadyRef.current = authReady;
  authOpenRef.current = authOpen;

  requireAuthRef.current = () => {
    setPaywallOpen(true);
    setAuthMode("login");
    setAuthOpen(true);
  };

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      try {
        const me = await fetchMe();
        if (cancelled) return;

        if (me.authenticated && me.user) {
          setUser(me.user);
          setAuthNotice("");
        } else if (me.transient) {
          setAuthNotice(
            me.error ||
              "Não foi possível validar a sessão agora. Tente novamente em instantes."
          );
        }
      } catch {
        if (!cancelled) {
          setAuthNotice("Falha ao verificar login. Tente novamente.");
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    };

    void loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;

    refreshTocLockRef.current();

    const pending = pendingPageRef.current;
    if (pending == null) {
      if (user) {
        setAuthOpen(false);
        setPaywallOpen(false);
      }
      return;
    }

    if (user) {
      pendingPageRef.current = null;
      setAuthOpen(false);
      setPaywallOpen(false);
      goToPageRef.current(pending, { instant: true });
      return;
    }

    requireAuthRef.current();
  }, [authReady, user]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const pages = Array.from(root.querySelectorAll<HTMLElement>(".page"));
    const bookShell = root.querySelector<HTMLElement>("#book-shell");
    const tocNav = root.querySelector<HTMLElement>("#toc-nav");
    const toc = root.querySelector<HTMLElement>("#toc");
    const tocOverlay = root.querySelector<HTMLElement>("#toc-overlay");
    const tocToggle = root.querySelector<HTMLButtonElement>("#toc-toggle");
    const tocClose = root.querySelector<HTMLButtonElement>("#toc-close");
    const prevBtn = root.querySelector<HTMLButtonElement>("#prev-btn");
    const nextBtn = root.querySelector<HTMLButtonElement>("#next-btn");
    const edgePrev = root.querySelector<HTMLButtonElement>("#edge-prev");
    const edgeNext = root.querySelector<HTMLButtonElement>("#edge-next");
    const progressBar = root.querySelector<HTMLElement>("#progress-bar");
    const pageIndicator = root.querySelector<HTMLElement>("#page-indicator");
    const btnStart = root.querySelector<HTMLButtonElement>("#btn-start");
    const btnToc = root.querySelector<HTMLButtonElement>("#btn-toc");
    const stage = root.querySelector<HTMLElement>(".stage");

    if (
      !bookShell ||
      !tocNav ||
      !toc ||
      !tocOverlay ||
      !tocToggle ||
      !tocClose ||
      !prevBtn ||
      !nextBtn ||
      !edgePrev ||
      !edgeNext ||
      !progressBar ||
      !pageIndicator
    ) {
      return;
    }

    let current = 0;
    let flipping = false;
    let flipTimer: number | null = null;
    let flipTarget: number | null = null;
    let suppressClickUntil = 0;
    let swipeStartX = 0;
    let swipeStartY = 0;
    let swipeActive = false;
    let swipeLocked: "x" | "y" | null = null;

    const canAccessPage = (index: number) =>
      index < FREE_PAGE_LIMIT || isAuthenticatedRef.current;

    const guardAccess = (index: number) => {
      if (canAccessPage(index)) return true;

      pendingPageRef.current = index;

      // Evita abrir paywall antes de saber se já existe sessão
      if (!authReadyRef.current) return false;

      requireAuthRef.current();
      return false;
    };

    const prefersReducedMotion = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const getFlipMs = () => {
      if (prefersReducedMotion()) return 0;
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--flip-ms")
        .trim();
      if (!raw) return 650;
      if (raw.endsWith("ms")) return parseFloat(raw) || 650;
      if (raw.endsWith("s")) return (parseFloat(raw) || 0.65) * 1000;
      return parseFloat(raw) || 650;
    };

    pages.forEach((page) => {
      if (!page.querySelector(".fold-shade")) {
        const fold = document.createElement("div");
        fold.className = "fold-shade";
        fold.setAttribute("aria-hidden", "true");
        page.appendChild(fold);
      }
      if (!page.querySelector(".under-dim")) {
        const dim = document.createElement("div");
        dim.className = "under-dim";
        dim.setAttribute("aria-hidden", "true");
        page.appendChild(dim);
      }
    });

    const tocButtons = pages.map((page, index) => {
      const title = page.dataset.title || `Página ${index + 1}`;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = title;
      if (index >= FREE_PAGE_LIMIT) {
        btn.dataset.locked = "true";
      }
      btn.addEventListener("click", () => {
        goTo(index, { instant: true });
        closeToc();
      });
      tocNav.appendChild(btn);
      return btn;
    });

    const updateTocLock = () => {
      tocButtons.forEach((btn, i) => {
        const locked = i >= FREE_PAGE_LIMIT && !isAuthenticatedRef.current;
        btn.classList.toggle("toc-locked", locked);
      });
    };

    refreshTocLockRef.current = updateTocLock;

    const updateUI = () => {
      const total = pages.length;
      progressBar.style.width = `${((current + 1) / total) * 100}%`;
      pageIndicator.textContent = pages[current].dataset.title || "";
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === total - 1;
      edgePrev.disabled = current === 0;
      edgeNext.disabled = current === total - 1;
      nextBtn.textContent = current === total - 1 ? "Fim" : "Virar página →";

      tocButtons.forEach((btn, i) => {
        btn.classList.toggle("active", i === current);
      });
      updateTocLock();
    };

    const scrollPageToTop = (page: HTMLElement) => {
      if (page.scrollTop) page.scrollTop = 0;
      const face = page.querySelector<HTMLElement>(".page-face");
      if (face?.scrollTop) face.scrollTop = 0;
    };

    const clearPageMotion = (page: HTMLElement) => {
      page.classList.remove(...FLIP_STATE_CLASSES);
      page.style.transform = "";
      page.style.transition = "";
      page.style.animation = "";
      page.style.opacity = "";
      page.style.zIndex = "";
      page.style.pointerEvents = "";
    };

    const cancelFlipTimer = () => {
      if (flipTimer) {
        window.clearTimeout(flipTimer);
        flipTimer = null;
      }
    };

    const settle = (index: number) => {
      cancelFlipTimer();
      const safeIndex = Math.max(0, Math.min(index, pages.length - 1));
      const target = pages[safeIndex];

      target.classList.add("active");
      target.classList.remove(
        "next-ready",
        "flipping-forward",
        "flipping-back",
        "is-leaving",
        "is-entering"
      );
      target.style.transform = "";
      target.style.transition = "";
      target.style.animation = "";

      pages.forEach((page, i) => {
        if (i !== safeIndex) clearPageMotion(page);
      });

      current = safeIndex;
      flipping = false;
      flipTarget = null;
      bookShell.classList.remove("is-flipping");
      scrollPageToTop(target);
      updateUI();
    };

    goToCoverRef.current = () => {
      pendingPageRef.current = null;
      settle(0);
    };

    const finishFlip = (index: number) => {
      settle(index);
    };

    const flipForward = () => {
      if (current >= pages.length - 1) return;
      if (flipping) settle(flipTarget ?? current);
      if (current >= pages.length - 1) return;

      const fromIndex = current;
      const toIndex = fromIndex + 1;
      if (!guardAccess(toIndex)) return;

      const from = pages[fromIndex];
      const to = pages[toIndex];
      const duration = getFlipMs();

      if (duration <= 0) {
        settle(toIndex);
        return;
      }

      flipping = true;
      flipTarget = toIndex;
      bookShell.classList.add("is-flipping");

      clearPageMotion(to);
      to.classList.add("next-ready");

      pages.forEach((page, i) => {
        if (i !== fromIndex && i !== toIndex) clearPageMotion(page);
      });

      from.classList.remove("next-ready", "flipping-back", "flipping-forward");
      from.classList.add("active");
      void from.offsetWidth;
      from.classList.remove("active");
      from.classList.add("flipping-forward");

      cancelFlipTimer();
      flipTimer = window.setTimeout(() => finishFlip(toIndex), duration + 40);
    };

    const flipBack = () => {
      if (current <= 0) return;
      if (flipping) settle(flipTarget ?? current);
      if (current <= 0) return;

      const fromIndex = current;
      const toIndex = fromIndex - 1;
      const from = pages[fromIndex];
      const to = pages[toIndex];
      const duration = getFlipMs();

      if (duration <= 0) {
        settle(toIndex);
        return;
      }

      flipping = true;
      flipTarget = toIndex;
      bookShell.classList.add("is-flipping");

      from.classList.remove("next-ready", "flipping-forward", "flipping-back");
      from.style.transform = "";
      from.style.animation = "";
      from.classList.add("active");

      pages.forEach((page, i) => {
        if (i !== fromIndex && i !== toIndex) clearPageMotion(page);
      });

      clearPageMotion(to);
      to.style.transform = "rotateY(-180deg)";
      void to.offsetWidth;
      to.classList.add("flipping-back");

      cancelFlipTimer();
      flipTimer = window.setTimeout(() => finishFlip(toIndex), duration + 40);
    };

    const goTo = (index: number, options: { instant?: boolean } = {}) => {
      const { instant = false } = options;
      if (index < 0 || index >= pages.length) return;
      if (!guardAccess(index)) return;

      if (flipping) settle(flipTarget ?? current);
      if (index === current) return;

      const distance = Math.abs(index - current);
      if (instant || distance > 1 || prefersReducedMotion()) {
        settle(index);
        return;
      }

      if (index > current) flipForward();
      else flipBack();
    };

    goToPageRef.current = goTo;

    const goNext = () => {
      if (current >= pages.length - 1) return;
      if (flipping) settle(flipTarget ?? current);
      if (current >= pages.length - 1) return;
      flipForward();
    };

    const goPrev = () => {
      if (current <= 0) return;
      if (flipping) settle(flipTarget ?? current);
      if (current <= 0) return;
      flipBack();
    };

    const openToc = () => {
      toc.classList.add("open");
      tocOverlay.classList.add("open");
      tocToggle.setAttribute("aria-expanded", "true");
      updateUI();
    };

    const closeToc = () => {
      toc.classList.remove("open");
      tocOverlay.classList.remove("open");
      tocToggle.setAttribute("aria-expanded", "false");
    };

    tocToggle.setAttribute("aria-expanded", "false");
    tocToggle.setAttribute("aria-controls", "toc");

    const handleTocToggle = () => openToc();
    const handleTocClose = () => closeToc();
    const handleTocOverlay = () => closeToc();

    const handlePrev = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      goPrev();
    };

    const handleNext = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      goNext();
    };

    const handleStart = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      if (Date.now() < suppressClickUntil) return;
      goNext();
    };

    const handleBtnToc = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      if (Date.now() < suppressClickUntil) return;
      openToc();
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (authOpenRef.current) return;
      if (document.querySelector(".auth-overlay")) return;

      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        goNext();
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "Escape") closeToc();
    };

    const isSwipeBlockedTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return true;
      return Boolean(
        target.closest(
          ".book-nav, .book-header, .toc, .toc-overlay, .auth-overlay, .paywall-banner, a, input, textarea"
        )
      );
    };

    const onSwipeStart = (x: number, y: number, target: EventTarget | null) => {
      if (authOpenRef.current || isSwipeBlockedTarget(target)) {
        swipeActive = false;
        return;
      }
      swipeActive = true;
      swipeLocked = null;
      swipeStartX = x;
      swipeStartY = y;
    };

    const onSwipeMove = (x: number, y: number, event: Event) => {
      if (!swipeActive) return;
      const dx = x - swipeStartX;
      const dy = y - swipeStartY;
      if (!swipeLocked) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        swipeLocked = Math.abs(dx) > Math.abs(dy) * 0.85 ? "x" : "y";
      }
      if (swipeLocked === "x") event.preventDefault();
    };

    const onSwipeEnd = (x: number, y: number) => {
      if (!swipeActive) return;
      const dx = x - swipeStartX;
      const dy = y - swipeStartY;
      const wasHorizontal =
        swipeLocked === "x" || Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO;

      swipeActive = false;
      swipeLocked = null;

      if (authOpenRef.current) return;
      if (!wasHorizontal || Math.abs(dx) < SWIPE_MIN) return;

      suppressClickUntil = Date.now() + 350;
      if (dx < 0) goNext();
      else goPrev();
    };

    const swipeRoot = stage || bookShell;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      onSwipeStart(t.clientX, t.clientY, e.target);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!swipeActive) return;
      const t = e.changedTouches[0];
      onSwipeMove(t.clientX, t.clientY, e);
    };

    const onTouchEnd = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      onSwipeEnd(t.clientX, t.clientY);
    };

    const onTouchCancel = () => {
      swipeActive = false;
      swipeLocked = null;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (isSwipeBlockedTarget(e.target)) return;
      onSwipeStart(e.clientX, e.clientY, e.target);
      bookShell.setPointerCapture?.(e.pointerId);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      onSwipeEnd(e.clientX, e.clientY);
    };

    const onPointerCancel = () => {
      swipeActive = false;
      swipeLocked = null;
    };

    tocToggle.addEventListener("click", handleTocToggle);
    tocClose.addEventListener("click", handleTocClose);
    tocOverlay.addEventListener("click", handleTocOverlay);
    prevBtn.addEventListener("click", handlePrev);
    nextBtn.addEventListener("click", handleNext);
    edgePrev.addEventListener("click", handlePrev);
    edgeNext.addEventListener("click", handleNext);
    btnStart?.addEventListener("click", handleStart);
    btnToc?.addEventListener("click", handleBtnToc);
    document.addEventListener("keydown", handleKeydown);

    swipeRoot.addEventListener("touchstart", onTouchStart, {
      passive: true,
      capture: true,
    });
    swipeRoot.addEventListener("touchmove", onTouchMove, {
      passive: false,
      capture: true,
    });
    swipeRoot.addEventListener("touchend", onTouchEnd, {
      passive: true,
      capture: true,
    });
    swipeRoot.addEventListener("touchcancel", onTouchCancel, { capture: true });
    bookShell.addEventListener("pointerdown", onPointerDown);
    bookShell.addEventListener("pointerup", onPointerUp);
    bookShell.addEventListener("pointercancel", onPointerCancel);

    settle(0);

    return () => {
      cancelFlipTimer();
      tocButtons.forEach((btn) => btn.remove());
      tocToggle.removeEventListener("click", handleTocToggle);
      tocClose.removeEventListener("click", handleTocClose);
      tocOverlay.removeEventListener("click", handleTocOverlay);
      prevBtn.removeEventListener("click", handlePrev);
      nextBtn.removeEventListener("click", handleNext);
      edgePrev.removeEventListener("click", handlePrev);
      edgeNext.removeEventListener("click", handleNext);
      btnStart?.removeEventListener("click", handleStart);
      btnToc?.removeEventListener("click", handleBtnToc);
      document.removeEventListener("keydown", handleKeydown);
      swipeRoot.removeEventListener("touchstart", onTouchStart, true);
      swipeRoot.removeEventListener("touchmove", onTouchMove, true);
      swipeRoot.removeEventListener("touchend", onTouchEnd, true);
      swipeRoot.removeEventListener("touchcancel", onTouchCancel, true);
      bookShell.removeEventListener("pointerdown", onPointerDown);
      bookShell.removeEventListener("pointerup", onPointerUp);
      bookShell.removeEventListener("pointercancel", onPointerCancel);
    };
  }, []);

  const handleOpenLogin = () => {
    setAuthNotice("");
    setAuthMode("login");
    setAuthOpen(true);
  };

  const handleAuthSuccess = (nextUser: CmsUser) => {
    setUser(nextUser);
    setAuthNotice("");
    setAuthOpen(false);
    setPaywallOpen(false);
    refreshTocLockRef.current();

    const pending = pendingPageRef.current;
    if (pending != null) {
      pendingPageRef.current = null;
      goToPageRef.current(pending, { instant: true });
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    setAuthNotice("");
    try {
      await logoutRequest();
      setUser(null);
      setPaywallOpen(false);
      pendingPageRef.current = null;
      goToCoverRef.current();
      refreshTocLockRef.current();
    } catch (err) {
      setAuthNotice(
        err instanceof Error ? err.message : "Não foi possível sair. Tente de novo."
      );
    } finally {
      setLogoutLoading(false);
    }
  };

  const handlePaywallDismiss = () => {
    setPaywallOpen(false);
    pendingPageRef.current = null;
    goToCoverRef.current();
  };

  return (
    <div ref={rootRef} className="book-root">
      <aside className="toc" id="toc">
        <div className="toc-header">
          <span className="toc-brand">Livro Digital</span>
          <button className="toc-close" id="toc-close" aria-label="Fechar sumário">
            &times;
          </button>
        </div>
        <h2>Sumário</h2>
        <nav className="toc-nav" id="toc-nav" />
        <div className="toc-auth">
          <div className="toc-author">
            <span className="toc-author-label">Autor</span>
            <span className="toc-author-name">Miguel Vicente</span>
          </div>
          {user ? (
            <>
              <p className="toc-auth-user">{user.email}</p>
              <button
                type="button"
                className="toc-auth-btn secondary"
                onClick={handleLogout}
                disabled={logoutLoading || !authReady}
              >
                {logoutLoading ? "Saindo…" : "Sair"}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="toc-auth-btn"
              onClick={handleOpenLogin}
              disabled={!authReady}
            >
              {authReady ? "Entrar" : "Carregando…"}
            </button>
          )}
          {authNotice ? <p className="toc-auth-notice">{authNotice}</p> : null}
        </div>
      </aside>

      <div className="toc-overlay" id="toc-overlay" />

      <header className="book-header">
        <button className="toc-toggle" id="toc-toggle" aria-label="Abrir sumário">
          <span />
          <span />
          <span />
        </button>
        <div className="progress-wrap">
          <div className="progress-bar" id="progress-bar" />
        </div>
        <span className="page-indicator" id="page-indicator">
          Capa
        </span>
      </header>

      <div className="stage">
        <div className="book-shell" id="book-shell">
          <div className="book-spine" />
          <main className="book" id="book">
            <BookPages />
          </main>
          <button
            className="edge-btn edge-prev"
            id="edge-prev"
            aria-label="Página anterior"
          />
          <button
            className="edge-btn edge-next"
            id="edge-next"
            aria-label="Próxima página"
          />
          <p className="flip-hint">Arraste ou clique nas bordas para virar a página</p>
        </div>
      </div>

      <nav className="book-nav">
        <button className="nav-btn" id="prev-btn" disabled>
          ← Anterior
        </button>
        <button className="nav-btn primary" id="next-btn">
          Virar página →
        </button>
      </nav>

      <PaywallGate
        open={paywallOpen && !user}
        onLogin={handleOpenLogin}
        onClose={handlePaywallDismiss}
      />

      <AuthModal
        open={authOpen}
        initialMode={authMode}
        onClose={() => {
          setAuthOpen(false);
          if (!user) pendingPageRef.current = null;
        }}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
