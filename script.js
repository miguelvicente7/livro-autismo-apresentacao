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

const SWIPE_MIN = 40;
const FLIP_STATE_CLASSES = [
  "active",
  "next-ready",
  "flipping-forward",
  "flipping-back",
  "is-leaving",
  "is-entering",
];

let current = 0;
let flipping = false;
let flipTimer = null;
let flipTarget = null;
let suppressClickUntil = 0;

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
  btn.addEventListener("click", () => {
    goTo(index, { instant: true });
    closeToc();
  });
  tocNav.appendChild(btn);
  return btn;
});

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
};

const scrollPageToTop = (page) => {
  if (page.scrollTop) page.scrollTop = 0;
  const face = page.querySelector(".page-face");
  if (face?.scrollTop) face.scrollTop = 0;
};

const clearPageMotion = (page) => {
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

/** Mostra só a página alvo — papel do .book cobre qualquer gap */
const settle = (index) => {
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

const finishFlip = (index) => {
  settle(index);
};

const flipForward = () => {
  if (current >= pages.length - 1) return;
  if (flipping) settle(flipTarget ?? current);
  if (current >= pages.length - 1) return;

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
  flipTarget = toIndex;
  bookShell.classList.add("is-flipping");

  // Destino visível POR BAIXO antes de virar a atual
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

  // Página atual permanece visível por baixo
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

const goTo = (index, options = {}) => {
  const { instant = false } = options;
  if (index < 0 || index >= pages.length) return;

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
};

const closeToc = () => {
  toc.classList.remove("open");
  tocOverlay.classList.remove("open");
  tocToggle.setAttribute("aria-expanded", "false");
};

tocToggle.setAttribute("aria-expanded", "false");
tocToggle.setAttribute("aria-controls", "toc");

tocToggle.addEventListener("click", openToc);
tocClose.addEventListener("click", closeToc);
tocOverlay.addEventListener("click", closeToc);

prevBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  goPrev();
});

nextBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  goNext();
});

edgePrev.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  goPrev();
});

edgeNext.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  goNext();
});

btnStart?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (Date.now() < suppressClickUntil) return;
  goNext();
});

btnToc?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (Date.now() < suppressClickUntil) return;
  openToc();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "PageDown") {
    e.preventDefault();
    goNext();
  }
  if (e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    goPrev();
  }
  if (e.key === "Escape") closeToc();
});

/* ===== Swipe ===== */
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
      ".book-nav, .book-header, .toc, .toc-overlay, a, input, textarea"
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
  if (swipeLocked === "x") event.preventDefault();
};

const onSwipeEnd = (x, y) => {
  if (!swipeActive) return;
  const dx = x - swipeStartX;
  const dy = y - swipeStartY;
  const wasHorizontal =
    swipeLocked === "x" || Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO;

  swipeActive = false;
  swipeLocked = null;

  if (!wasHorizontal || Math.abs(dx) < SWIPE_MIN) return;

  suppressClickUntil = Date.now() + 350;
  if (dx < 0) goNext();
  else goPrev();
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
