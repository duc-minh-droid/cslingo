/* Motion layer — thin wrappers over motion.dev (vendor/motion.js, global `Motion`).
   Rules: transform + opacity only, strong ease-out, UI motion < 300ms,
   reduced motion keeps opacity fades and drops movement. Everything no-ops safely without Motion. */
(function () {
  const M = window.Motion;
  const ok = !!(M && M.animate);
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reduce = () => mq.matches;
  const EASE = [0.23, 1, 0.32, 1];
  const EASE_IO = [0.77, 0, 0.175, 1];
  const list = (t) => (!t ? [] : t instanceof Element ? [t] : Array.from(t));
  const run = (el, kf, opts) => (ok ? M.animate(el, kf, opts) : null);

  /** Staggered entrance: fade + small rise. Used for page assembly and freshly inserted content. */
  function enter(targets, { y = 8, delay = 0, stagger = 0.045, dur = 0.3 } = {}) {
    const els = list(targets).filter(Boolean);
    if (!ok || !els.length) return;
    const kf = reduce() ? { opacity: [0, 1] } : { opacity: [0, 1], transform: [`translateY(${y}px)`, "translateY(0px)"] };
    els.forEach((el, i) => {
      const a = run(el, kf, { duration: reduce() ? 0.2 : dur, delay: delay + i * stagger, ease: EASE });
      // leave no inline transform behind (sticky children, tooltips and z-stacking stay sane)
      if (a) a.finished.then(() => { el.style.transform = ""; el.style.opacity = ""; }).catch(() => {});
    });
  }

  /** Lesson step change — slides in the direction of travel. */
  function step(el, dir = 1) {
    if (!ok) return;
    const kf = reduce() ? { opacity: [0, 1] } : { opacity: [0, 1], transform: [`translateX(${18 * dir}px)`, "translateX(0px)"] };
    const a = run(el, kf, { duration: 0.26, ease: EASE });
    if (a) a.finished.then(() => { el.style.transform = ""; }).catch(() => {});
    if (reduce()) return;
    // then the step's parts arrive one after another: title, paragraphs, figure, check
    const parts = Array.from(el.querySelectorAll(":scope > *, :scope > .lesson-body > *")).filter((p) => !p.classList.contains("lesson-body"));
    parts.forEach((p, i) => {
      const b = run(p, { opacity: [0, 1], transform: ["translateY(10px)", "translateY(0px)"] }, { duration: 0.32, delay: 0.04 + i * 0.05, ease: EASE });
      if (b) b.finished.then(() => { p.style.transform = ""; p.style.opacity = ""; }).catch(() => {});
    });
  }

  /** Positive feedback: a small spring settle. */
  function pop(el) {
    if (!ok || !el || reduce()) return;
    run(el, { transform: ["scale(0.96)", "scale(1)"] }, { type: "spring", duration: 0.4, bounce: 0.25 });
  }

  /** Negative feedback: short horizontal shake (element is disabled afterwards, so it can't be re-triggered rapidly). */
  function shake(el) {
    if (!ok || !el || reduce()) return;
    run(el, { transform: ["translateX(0px)", "translateX(-5px)", "translateX(5px)", "translateX(-3px)", "translateX(2px)", "translateX(0px)"] }, { duration: 0.32, ease: "easeOut" });
  }

  /** Reveal content that was just unhidden (explanations, feedback). */
  function reveal(el) {
    if (!ok || !el) return;
    const kf = reduce() ? { opacity: [0, 1] } : { opacity: [0, 1], transform: ["translateY(-4px)", "translateY(0px)"] };
    const a = run(el, kf, { duration: 0.24, ease: EASE });
    if (a) a.finished.then(() => { el.style.transform = ""; }).catch(() => {});
  }

  /** Tween a number shown in `el`. */
  function count(el, to, { from, dur = 0.5, fmt = (v) => Math.round(v).toLocaleString() } = {}) {
    if (!el) return;
    const start = from ?? (parseFloat(String(el.dataset.v ?? el.textContent).replace(/[^\d.-]/g, "")) || 0);
    el.dataset.v = to;
    if (!ok || reduce() || !Number.isFinite(start) || start === to) { el.textContent = fmt(to); return; }
    M.animate(start, to, { duration: dur, ease: EASE, onUpdate: (v) => (el.textContent = fmt(v)) });
  }

  /** Draw-on for SVG strokes marked `.draw`, then pop in items marked `.fi` (figure items) in document order. */
  function play(root, { delay = 0.05 } = {}) {
    if (!root) return;
    const strokes = Array.from(root.querySelectorAll(".draw"));
    const items = Array.from(root.querySelectorAll(".fi"));
    if (!ok || reduce()) { if (ok) enter(items, { y: 0, stagger: 0.02, dur: 0.2 }); return; }
    strokes.forEach((p, i) => {
      let len = 0;
      try { len = p.getTotalLength(); } catch { return; }
      if (!len) return;
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
      const a = M.animate(p, { strokeDashoffset: [len, 0] }, { duration: 0.55, delay: delay + i * 0.06, ease: EASE_IO });
      a.finished.then(() => { p.style.strokeDasharray = ""; p.style.strokeDashoffset = ""; }).catch(() => {});
    });
    items.forEach((it, i) => {
      M.animate(it, { opacity: [0, 1], transform: ["scale(0.9)", "scale(1)"] }, { duration: 0.28, delay: delay + 0.08 + i * 0.05, ease: EASE })
        .finished.then(() => { it.style.transform = ""; }).catch(() => {});
    });
  }

  /** Scroll-reveal for cards below the fold. Fires once; content is never left hidden if Motion is missing. */
  function onView(targets) {
    const els = list(targets), stops = [];
    if (!ok || !M.inView) return () => {};
    const vh = window.innerHeight;
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.92) return; // already on screen — the page entrance covers it
      el.style.opacity = "0";
      let stop = null;
      stop = M.inView(el, () => { enter(el, { y: 12 }); if (stop) stop(); }, { margin: "0px 0px -8% 0px" });
      stops.push(stop);
    });
    return () => stops.forEach((s) => s && s());
  }

  /** Rare moment (lesson finished, perfect boss): confetti from `el` via canvas-confetti, with a hand-rolled fallback. */
  function celebrate(el, { big = false, silent = false } = {}) {
    if (el && !silent && NIC.sfx) NIC.sfx.play(big ? "fanfare" : "complete");
    if (!el || reduce()) return;
    const r = el.getBoundingClientRect();
    const origin = { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight };
    const colors = ["#58cc02", "#1cb0f6", "#ffc800", "#ff4b4b", "#ce82ff", "#ff9600"];
    if (window.confetti) {
      confetti({ particleCount: big ? 140 : 70, spread: big ? 100 : 70, startVelocity: big ? 48 : 36, origin, colors, scalar: 1.05, ticks: 220, zIndex: 200, disableForReducedMotion: true });
      if (big) setTimeout(() => {
        confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors, zIndex: 200 });
        confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors, zIndex: 200 });
      }, 220);
      return;
    }
    if (!ok) return;
    for (let i = 0; i < 28; i++) {
      const d = document.createElement("i");
      d.className = "spark" + (i % 3 ? " rib" : "");
      d.style.left = r.left + r.width / 2 + "px"; d.style.top = r.top + r.height / 2 + "px";
      d.style.background = colors[i % colors.length];
      document.body.appendChild(d);
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3, dist = 70 + Math.random() * 90, dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist;
      M.animate(d, { opacity: [1, 1, 0], transform: ["translate(-50%,-50%) scale(0.6)", `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(200deg)`, `translate(calc(-50% + ${dx * 1.25}px), calc(-50% + ${dy + 120}px)) rotate(400deg)`] },
        { duration: 1.2, ease: [0.2, 0.7, 0.4, 1], times: [0, 0.35, 1] }).finished.then(() => d.remove()).catch(() => d.remove());
    }
  }

  /** "+1" that floats up from an element (a correct answer). */
  function floatText(el, text = "+1", color = "#58cc02") {
    if (!ok || !el || reduce()) return;
    const r = el.getBoundingClientRect();
    const t = document.createElement("span");
    t.className = "float-xp"; t.textContent = text; t.style.color = color;
    t.style.left = r.right - 24 + "px"; t.style.top = r.top + 4 + "px";
    document.body.appendChild(t);
    M.animate(t, { opacity: [0, 1, 1, 0], transform: ["translateY(6px) scale(0.6)", "translateY(-10px) scale(1.15)", "translateY(-34px) scale(1)", "translateY(-52px) scale(0.9)"] },
      { duration: 1, ease: EASE, times: [0, 0.2, 0.7, 1] }).finished.then(() => t.remove()).catch(() => t.remove());
  }

  /** Toast that springs in from the top (streaks, milestones). */
  let toastEl = null, toastT = 0;
  function toast(html, { tone = "orange", ms = 1800 } = {}) {
    if (toastEl) toastEl.remove();
    const t = document.createElement("div");
    t.className = `toast t-${tone}`; t.innerHTML = html; t.setAttribute("role", "status");
    document.body.appendChild(t); toastEl = t;
    if (ok) run(t, reduce() ? { opacity: [0, 1] } : { opacity: [0, 1], transform: ["translate(-50%, -30px) scale(0.8)", "translate(-50%, 0px) scale(1)"] }, { type: "spring", duration: 0.5, bounce: 0.4 });
    clearTimeout(toastT);
    toastT = setTimeout(() => {
      const done = () => { t.remove(); if (toastEl === t) toastEl = null; };
      const a = ok ? run(t, { opacity: [1, 0], transform: ["translate(-50%, 0px)", "translate(-50%, -16px)"] }, { duration: 0.22, ease: EASE }) : null;
      a ? a.finished.then(done).catch(done) : done();
    }, ms);
  }

  /** Numbers inside stat tiles bump when they change (throttled so live simulations don't jitter). */
  function watchStats(root) {
    if (!ok || !window.MutationObserver) return () => {};
    const last = new WeakMap();
    const mo = new MutationObserver((recs) => {
      if (reduce()) return;
      const seen = new Set();
      recs.forEach((r) => { const b = (r.target.nodeType === 3 ? r.target.parentElement : r.target); const s = b && b.closest && b.closest(".stat b, .fb-v, .boss-meta b"); if (s) seen.add(s); });
      const now = performance.now();
      seen.forEach((b) => {
        const prev = last.get(b) || 0;
        last.set(b, now);
        if (now - prev < 450) return; // changing every frame: leave it still
        run(b, { transform: ["scale(1)", "scale(1.22)", "scale(1)"] }, { duration: 0.36, ease: EASE });
        b.classList.remove("flash"); void b.offsetWidth; b.classList.add("flash");
      });
    });
    mo.observe(root, { subtree: true, childList: true, characterData: true });
    return () => mo.disconnect();
  }

  /**
   * Play an in-house Lottie animation (assets/lottie.js) inside el. Loads lottie-web on first use.
   * Resolves to the animation, or null (reduced motion, or the player failed to load); callers keep their static fallback.
   */
  function lottie(el, name, { loop = false, speed = 1, cls = "" } = {}) {
    const data = window.CSL_LOTTIE && window.CSL_LOTTIE[name];
    if (!el || !data || reduce() || !NIC.lazy) return Promise.resolve(null);
    return NIC.lazy("vendor/lottie_light.min.js").then(() => {
      if (!el.isConnected || !window.lottie) return null;
      const box = document.createElement("div");
      box.className = "lottie " + cls;
      el.appendChild(box);
      const a = window.lottie.loadAnimation({ container: box, renderer: "svg", loop, autoplay: true, animationData: JSON.parse(JSON.stringify(data)) });
      a.setSpeed(speed);
      if (!loop) a.addEventListener("complete", () => box.classList.add("done"));
      return a;
    }).catch(() => null);
  }

  /** Play a one-shot Lottie in a floating layer centred on anchor (it isn't clipped by the anchor's box). */
  function lottieAt(anchor, name, { size = 150, dy = 0 } = {}) {
    if (!anchor || reduce()) return;
    const r = anchor.getBoundingClientRect();
    const layer = document.createElement("div");
    layer.className = "lottie-at";
    layer.style.cssText = `left:${r.left + r.width / 2 - size / 2}px;top:${r.top + r.height / 2 - size / 2 + dy}px;width:${size}px;height:${size}px`;
    document.body.appendChild(layer);
    lottie(layer, name).then((a) => { if (!a) return layer.remove(); a.addEventListener("complete", () => layer.remove()); setTimeout(() => layer.remove(), 4000); });
  }

  NIC.fx = { lottie, lottieAt, ok, reduce, EASE, EASE_IO, enter, step, pop, shake, reveal, count, play, onView, celebrate, floatText, toast, watchStats, animate: run };
})();
