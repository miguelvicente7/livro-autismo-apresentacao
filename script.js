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
let current = 0;
let suppressClickUntil = 0;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Remove resíduos das viradas 3D antigas */
pages.forEach((page) => {
  page.classList.remove(
    "next-ready",
    "prev-ready",
    "flipping-forward",
    "flipping-back",
    "under-flip"
  );
  page.style.transform = "";
  page.style.transition = "";
  page.style.animation = "";
  page.querySelector(".fold-shade")?.remove();
  page.querySelector(".under-dim")?.remove();
});

const tocButtons = pages.map((page, index) => {
  const title = page.dataset.title || `Página ${index + 1}`;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = title;
  btn.addEventListener("click", () => {
    goTo(index);
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

/**
 * Troca de página sem flip 3D — evita tela marrom.
 * Fade curto opcional; reduced-motion = instantâneo.
 */
const showPage = (index) => {
  const safeIndex = Math.max(0, Math.min(index, pages.length - 1));
  if (safeIndex === current && pages[safeIndex].classList.contains("active")) {
    updateUI();
    return;
  }

  const nextPage = pages[safeIndex];
  const prevPage = pages[current];
  const useFade = !prefersReducedMotion() && safeIndex !== current;

  bookShell.classList.remove("is-flipping");

  pages.forEach((page, i) => {
    page.classList.remove("active", "is-leaving", "is-entering");
    if (i !== safeIndex) {
      page.style.opacity = "";
      page.style.pointerEvents = "";
      page.style.zIndex = "";
    }
  });

  if (useFade && prevPage && prevPage !== nextPage) {
    prevPage.classList.add("is-leaving");
    nextPage.classList.add("is-entering", "active");
    window.setTimeout(() => {
      prevPage.classList.remove("is-leaving");
      nextPage.classList.remove("is-entering");
    }, 220);
  } else {
    nextPage.classList.add("active");
  }

  current = safeIndex;
  scrollPageToTop(nextPage);
  updateUI();
};

const goTo = (index) => {
  if (index < 0 || index >= pages.length) return;
  showPage(index);
};

const goNext = () => {
  if (current >= pages.length - 1) return;
  showPage(current + 1);
};

const goPrev = () => {
  if (current <= 0) return;
  showPage(current - 1);
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

showPage(0);
