const pages = Array.from(document.querySelectorAll(".page"));
const bookShell = document.getElementById("book-shell");
const tocNav = document.getElementById("toc-nav");
const toc = document.getElementById("toc");
const tocOverlay = document.getElementById("toc-overlay");
const tocToggle = document.getElementById("toc-toggle");
const tocClose = document.getElementById("toc-close");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const edgePrev = document.getElementById("edge-prev");
const edgeNext = document.getElementById("edge-next");
const progressBar = document.getElementById("progress-bar");
const pageIndicator = document.getElementById("page-indicator");
const btnStart = document.getElementById("btn-start");
const btnToc = document.getElementById("btn-toc");

const SWIPE_MIN = 35;
const FLIP_CLASSES = [
  "active",
  "next-ready",
  "prev-ready",
  "flipping-forward",
  "flipping-back",
];

let current = 0;
let flipping = false;
let flipTimer = null;
let flipTargetIndex = null;
let flipAnimEl = null;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getFlipMs = () => {
  if (prefersReducedMotion()) return 0;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--flip-ms")
    .trim();
  if (!raw) return 700;
  if (raw.endsWith("ms")) return parseFloat(raw) || 700;
  if (raw.endsWith("s")) return (parseFloat(raw) || 0.7) * 1000;
  return parseFloat(raw) || 700;
};

const clearInlineFlipStyles = (page) => {
  page.style.transform = "";
  page.style.transition = "";
  page.style.animation = "";
};

const clearFlipClasses = (page) => {
  page.classList.remove(...FLIP_CLASSES);
  clearInlineFlipStyles(page);
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
  btn.addEventListener("click", () => {
    goTo(index, { fromToc: true });
    closeToc();
  });
  tocNav.appendChild(btn);
  return btn;
});

const updateUI = () => {
  const total = pages.length;
  progressBar.style.width = `${((current + 1) / total) * 100}%`;
  pageIndicator.textContent = pages[current].dataset.title || "";
  prevBtn.disabled = current === 0 || flipping;
  nextBtn.disabled = current === total - 1 || flipping;
  edgePrev.disabled = current === 0 || flipping;
  edgeNext.disabled = current === total - 1 || flipping;
  nextBtn.textContent = current === total - 1 ? "Fim" : "Virar página →";

  tocButtons.forEach((btn, i) => {
    btn.classList.toggle("active", i === current);
  });
};

const scrollPageToTop = (page) => {
  if (page.scrollTop) page.scrollTop = 0;
  const face = page.querySelector(".page-face");
  if (face?.scrollTop) face.scrollTop = 0;
};

const cancelPendingFlip = () => {
  if (flipTimer) {
    window.clearTimeout(flipTimer);
    flipTimer = null;
  }
  if (flipAnimEl) {
    flipAnimEl.removeEventListener("animationend", onFlipAnimationEnd);
    flipAnimEl = null;
  }
  flipTargetIndex = null;
};

const onFlipAnimationEnd = (event) => {
  if (event.target !== flipAnimEl) return;
  if (event.animationName !== "flipForward" && event.animationName !== "flipBack") {
    return;
  }
  const target = flipTargetIndex;
  cancelPendingFlip();
  if (target == null) return;
  settle(target);
};

const settle = (index) => {
  cancelPendingFlip();

  const safeIndex = Math.max(0, Math.min(index, pages.length - 1));
  const nextPage = pages[safeIndex];

  // Mostra a página destino ANTES de limpar as outras — evita flash marrom
  nextPage.classList.add("active");
  nextPage.classList.remove(
    "next-ready",
    "prev-ready",
    "flipping-forward",
    "flipping-back"
  );
  clearInlineFlipStyles(nextPage);

  pages.forEach((page, i) => {
    if (i !== safeIndex) clearFlipClasses(page);
  });

  current = safeIndex;
  flipping = false;
  bookShell.classList.remove("is-flipping");
  scrollPageToTop(nextPage);
  updateUI();
};

const afterFlip = (nextIndex, animEl) => {
  cancelPendingFlip();
  flipTargetIndex = nextIndex;
  flipAnimEl = animEl || null;

  const duration = getFlipMs();
  if (duration <= 0 || !animEl) {
    settle(nextIndex);
    return;
  }

  animEl.addEventListener("animationend", onFlipAnimationEnd);
  // Fallback se animationend não disparar (aba em background, etc.)
  flipTimer = window.setTimeout(() => settle(nextIndex), duration + 80);
};

const preparePair = (fromIndex, toIndex) => {
  pages.forEach((page, i) => {
    if (i !== fromIndex && i !== toIndex) clearFlipClasses(page);
  });
};

const flipForward = () => {
  if (current >= pages.length - 1) return;
  if (flipping) settle(flipTargetIndex ?? current);

  const fromIndex = current;
  const toIndex = fromIndex + 1;
  const from = pages[fromIndex];
  const to = pages[toIndex];
  const duration = getFlipMs();

  if (duration <= 0) {
    settle(toIndex);
    return;
  }

  flipping = true;
  bookShell.classList.add("is-flipping");
  updateUI();

  // Destino visível por baixo antes de tirar a página atual
  to.classList.remove(...FLIP_CLASSES);
  clearInlineFlipStyles(to);
  to.classList.add("next-ready");
  preparePair(fromIndex, toIndex);

  from.classList.remove("next-ready", "prev-ready", "flipping-back");
  from.classList.add("active");
  void from.offsetWidth;
  from.classList.remove("active");
  from.classList.add("flipping-forward");

  afterFlip(toIndex, from);
};

const flipBack = () => {
  if (current <= 0) return;
  if (flipping) settle(flipTargetIndex ?? current);

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
  bookShell.classList.add("is-flipping");
  updateUI();

  from.classList.remove(...FLIP_CLASSES);
  clearInlineFlipStyles(from);
  from.classList.add("active");

  to.classList.remove(...FLIP_CLASSES);
  clearInlineFlipStyles(to);
  preparePair(fromIndex, toIndex);

  void to.offsetWidth;
  to.classList.add("flipping-back");

  afterFlip(toIndex, to);
};

const goTo = (index, options = {}) => {
  const { fromToc = false } = options;
  if (index < 0 || index >= pages.length) return;
  if (index === current && !flipping) return;

  // Interrompe virada em andamento em vez de ignorar o clique
  if (flipping) settle(flipTargetIndex ?? current);
  if (index === current) return;

  const distance = Math.abs(index - current);

  // Sumário / salto longo: troca instantânea (sem 3D) — evita lag e tela marrom
  if (fromToc || distance > 1 || prefersReducedMotion()) {
    settle(index);
    return;
  }

  if (index > current) flipForward();
  else flipBack();
};

const openToc = () => {
  toc.classList.add("open");
  tocOverlay.classList.add("open");
  tocToggle.setAttribute("aria-expanded", "true");
};

const closeToc = () => {
  toc.classList.remove("open");
  tocOverlay.classList.remove("open");
  tocToggle.setAttribute("aria-expanded", "false");
};

tocToggle.setAttribute("aria-expanded", "false");
tocToggle.setAttribute("aria-controls", "toc");
toc.id = toc.id || "toc";

tocToggle.addEventListener("click", openToc);
tocClose.addEventListener("click", closeToc);
tocOverlay.addEventListener("click", closeToc);

prevBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  flipBack();
});

nextBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  flipForward();
});

edgePrev.addEventListener("click", (e) => {
  e.stopPropagation();
  flipBack();
});

edgeNext.addEventListener("click", (e) => {
  e.stopPropagation();
  flipForward();
});

btnStart?.addEventListener("click", (e) => {
  e.stopPropagation();
  flipForward();
});

btnToc?.addEventListener("click", openToc);

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "PageDown") {
    e.preventDefault();
    flipForward();
  }
  if (e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    flipBack();
  }
  if (e.key === "Escape") closeToc();
});

/* ===== Swipe horizontal (celular) ===== */
const stage = document.querySelector(".stage");
const SWIPE_RATIO = 1.2;
let swipeStartX = 0;
let swipeStartY = 0;
let swipeActive = false;
let swipeLocked = null;

const isSwipeBlockedTarget = (target) => {
  if (!(target instanceof Element)) return true;
  return Boolean(
    target.closest(
      ".book-nav, .book-header, .toc, .toc-overlay, .btn-start, #btn-toc, a, input, textarea"
    )
  );
};

const onSwipeStart = (x, y, target) => {
  if (isSwipeBlockedTarget(target)) {
    swipeActive = false;
    return;
  }
  swipeActive = true;
  swipeLocked = null;
  swipeStartX = x;
  swipeStartY = y;
};

const onSwipeMove = (x, y, event) => {
  if (!swipeActive) return;

  const dx = x - swipeStartX;
  const dy = y - swipeStartY;

  if (!swipeLocked) {
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    swipeLocked = Math.abs(dx) > Math.abs(dy) * 0.85 ? "x" : "y";
  }

  if (swipeLocked === "x") {
    event.preventDefault();
  }
};

const onSwipeEnd = (x, y) => {
  if (!swipeActive) return;

  const dx = x - swipeStartX;
  const dy = y - swipeStartY;
  const wasHorizontal =
    swipeLocked === "x" || Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO;

  swipeActive = false;
  swipeLocked = null;

  if (!wasHorizontal) return;
  if (Math.abs(dx) < SWIPE_MIN) return;

  if (dx < 0) flipForward();
  else flipBack();
};

const swipeRoot = stage || bookShell;

swipeRoot.addEventListener(
  "touchstart",
  (e) => {
    const t = e.changedTouches[0];
    onSwipeStart(t.clientX, t.clientY, e.target);
  },
  { passive: true, capture: true }
);

swipeRoot.addEventListener(
  "touchmove",
  (e) => {
    if (!swipeActive) return;
    const t = e.changedTouches[0];
    onSwipeMove(t.clientX, t.clientY, e);
  },
  { passive: false, capture: true }
);

swipeRoot.addEventListener(
  "touchend",
  (e) => {
    const t = e.changedTouches[0];
    onSwipeEnd(t.clientX, t.clientY);
  },
  { passive: true, capture: true }
);

swipeRoot.addEventListener(
  "touchcancel",
  () => {
    swipeActive = false;
    swipeLocked = null;
  },
  { capture: true }
);

bookShell.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "touch") return;
  if (isSwipeBlockedTarget(e.target)) return;
  onSwipeStart(e.clientX, e.clientY, e.target);
  bookShell.setPointerCapture?.(e.pointerId);
});

bookShell.addEventListener("pointerup", (e) => {
  if (e.pointerType === "touch") return;
  onSwipeEnd(e.clientX, e.clientY);
});

bookShell.addEventListener("pointercancel", () => {
  swipeActive = false;
  swipeLocked = null;
});

settle(0);
