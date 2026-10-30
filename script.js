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
let current = 0;
let flipping = false;
let flipTimer = null;

/* Mantém o settle alinhado com --flip-ms (ex.: 550ms no mobile) */
function getFlipMs() {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--flip-ms")
    .trim();
  if (!raw) return 900;
  if (raw.endsWith("ms")) return parseFloat(raw) || 900;
  if (raw.endsWith("s")) return (parseFloat(raw) || 0.9) * 1000;
  return parseFloat(raw) || 900;
}

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

pages.forEach((page, index) => {
  const title = page.dataset.title || `Página ${index + 1}`;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = title;
  btn.addEventListener("click", () => {
    goTo(index);
    closeToc();
  });
  tocNav.appendChild(btn);
});

function clearFlipClasses(page) {
  page.classList.remove(
    "active",
    "next-ready",
    "prev-ready",
    "flipping-forward",
    "flipping-back"
  );
  page.style.transform = "";
  page.style.transition = "";
}

function updateUI() {
  const total = pages.length;
  progressBar.style.width = `${((current + 1) / total) * 100}%`;
  pageIndicator.textContent = pages[current].dataset.title || "";
  prevBtn.disabled = current === 0 || flipping;
  nextBtn.disabled = current === total - 1 || flipping;
  edgePrev.disabled = current === 0 || flipping;
  edgeNext.disabled = current === total - 1 || flipping;
  nextBtn.textContent = current === total - 1 ? "Fim" : "Virar página →";

  Array.from(tocNav.children).forEach((btn, i) => {
    btn.classList.toggle("active", i === current);
  });
}

function settle(index) {
  if (flipTimer) {
    window.clearTimeout(flipTimer);
    flipTimer = null;
  }
  pages.forEach(clearFlipClasses);
  current = index;
  pages[current].classList.add("active");
  flipping = false;
  bookShell.classList.remove("is-flipping");
  updateUI();
}

function afterFlip(nextIndex) {
  if (flipTimer) window.clearTimeout(flipTimer);
  flipTimer = window.setTimeout(() => settle(nextIndex), getFlipMs());
}

function flipForward() {
  if (flipping || current >= pages.length - 1) return;
  flipping = true;
  bookShell.classList.add("is-flipping");
  updateUI();

  const fromIndex = current;
  const from = pages[fromIndex];
  const to = pages[fromIndex + 1];

  pages.forEach(clearFlipClasses);
  to.classList.add("next-ready");
  void from.offsetWidth;
  from.classList.add("flipping-forward");
  afterFlip(fromIndex + 1);
}

function flipBack() {
  if (flipping || current <= 0) return;
  flipping = true;
  bookShell.classList.add("is-flipping");
  updateUI();

  const fromIndex = current;
  const from = pages[fromIndex];
  const to = pages[fromIndex - 1];

  pages.forEach(clearFlipClasses);
  from.classList.add("active");
  void to.offsetWidth;
  to.classList.add("flipping-back");
  afterFlip(fromIndex - 1);
}

function goTo(index) {
  if (index < 0 || index >= pages.length || flipping) return;
  if (index === current) return;

  if (Math.abs(index - current) === 1) {
    if (index > current) flipForward();
    else flipBack();
    return;
  }

  // Salto no sumário: anima uma virada na direção correta
  flipping = true;
  bookShell.classList.add("is-flipping");
  updateUI();

  const fromIndex = current;
  const from = pages[fromIndex];
  const to = pages[index];

  pages.forEach(clearFlipClasses);

  if (index > fromIndex) {
    to.classList.add("next-ready");
    from.classList.add("active");
    void from.offsetWidth;
    from.classList.remove("active");
    from.classList.add("flipping-forward");
  } else {
    from.classList.add("active");
    void to.offsetWidth;
    to.classList.add("flipping-back");
  }

  afterFlip(index);
}

function openToc() {
  toc.classList.add("open");
  tocOverlay.classList.add("open");
}

function closeToc() {
  toc.classList.remove("open");
  tocOverlay.classList.remove("open");
}

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
let swipeLocked = null; // "x" | "y" | null

function isSwipeBlockedTarget(target) {
  if (!(target instanceof Element)) return true;
  // Bloqueia só controles reais — não as bordas do livro
  return Boolean(
    target.closest(
      ".book-nav, .book-header, .toc, .toc-overlay, .btn-start, #btn-toc, a, input, textarea"
    )
  );
}

function onSwipeStart(x, y, target) {
  if (flipping || isSwipeBlockedTarget(target)) {
    swipeActive = false;
    return;
  }
  swipeActive = true;
  swipeLocked = null;
  swipeStartX = x;
  swipeStartY = y;
}

function onSwipeMove(x, y, event) {
  if (!swipeActive || flipping) return;

  const dx = x - swipeStartX;
  const dy = y - swipeStartY;

  if (!swipeLocked) {
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
    swipeLocked = Math.abs(dx) > Math.abs(dy) * 0.85 ? "x" : "y";
  }

  // Gesto horizontal: impede o scroll e prepara a virada
  if (swipeLocked === "x") {
    event.preventDefault();
  }
}

function onSwipeEnd(x, y) {
  if (!swipeActive) return;

  const dx = x - swipeStartX;
  const dy = y - swipeStartY;
  const wasHorizontal = swipeLocked === "x" || Math.abs(dx) > Math.abs(dy) * SWIPE_RATIO;

  swipeActive = false;
  swipeLocked = null;

  if (flipping) return;
  if (!wasHorizontal) return;
  if (Math.abs(dx) < SWIPE_MIN) return;

  if (dx < 0) flipForward();
  else flipBack();
}

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

/* Mouse / trackpad no desktop */
bookShell.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "touch") return;
  if (flipping || isSwipeBlockedTarget(e.target)) return;
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
