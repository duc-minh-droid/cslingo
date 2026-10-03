(function () {
  const fx = (NIC.shared.engineFx = NIC.shared.engineFx || {});
  const {
    DUR,
    EASE,
    EASE_IN,
    EASE_IO,
    SPRING,
    SPRING_POP,
    SPRING_UI,
    bounce,
    bump,
    celebrate,
    clean,
    count,
    enter,
    exit,
    floatText,
    ok,
    onView,
    play,
    pop,
    reduce,
    reveal,
    run,
    shake,
    springIn,
    step,
    swap,
    tq,
  } = fx;

  let tCur = null,
    tWatch = null;
  const tHeld = () =>
    !!document.body && document.body.classList.contains("in-lesson") && !document.querySelector(".pd-title");
  function toast(html, { tone = "orange", ms = 1800, live = false } = {}) {
    if (tCur && !tCur.leaving && tCur.html === html) {
      clearTimeout(tCur.timer);
      tCur.timer = setTimeout(toastOut, ms);
      return;
    } // same one again: keep it up
    if (tq.some((q) => q.html === html)) return;
    tq.push({ html, tone, ms, live });
    toastNext();
  }
  function toastNext() {
    if (tCur || !tq.length) return;
    const k = tHeld() ? tq.findIndex((q) => q.live) : 0;
    if (k < 0) {
      toastWatch();
      return;
    }
    const q = tq.splice(k, 1)[0];
    const t = document.createElement("div");
    t.className = `toast t-${q.tone}`;
    t.innerHTML = q.html;
    t.setAttribute("role", "status");
    document.body.appendChild(t);
    tCur = { html: q.html, el: t, leaving: false, timer: 0 };
    if (ok)
      clean(
        t,
        run(
          t,
          reduce()
            ? { opacity: [0, 1] }
            : { opacity: [0, 1], transform: ["translate(-50%, -30px) scale(0.8)", "translate(-50%, 0px) scale(1)"] },
          reduce() ? { duration: DUR.s } : { ...SPRING_POP, bounce: 0.4 },
        ),
      );
    tCur.timer = setTimeout(toastOut, q.ms);
  }
  function toastOut() {
    const c = tCur;
    if (!c || c.leaving) return;
    c.leaving = true;
    clearTimeout(c.timer);
    const done = () => {
      c.el.remove();
      if (tCur === c) tCur = null;
      toastNext();
    };
    const a = ok
      ? run(
          c.el,
          reduce()
            ? { opacity: [1, 0] }
            : { opacity: [1, 0], transform: ["translate(-50%, 0px)", "translate(-50%, -16px)"] },
          { duration: DUR.s, ease: EASE_IN },
        )
      : null;
    a ? a.finished.then(done, done) : done();
  }
  // Held toasts: watch for the lesson ending (body class) or its complete screen appearing, then release them.
  function toastWatch() {
    if (tWatch || !window.MutationObserver || !document.body) return;
    let pend = false;
    tWatch = new MutationObserver(() => {
      if (pend) return;
      pend = true;
      requestAnimationFrame(() => {
        pend = false;
        if (tHeld()) return;
        if (tWatch) {
          tWatch.disconnect();
          tWatch = null;
        }
        // let the complete screen land first
        setTimeout(toastNext, document.body.classList.contains("in-lesson") ? 700 : 250);
      });
    });
    tWatch.observe(document.body, { attributes: true, attributeFilter: ["class"], childList: true, subtree: true });
  }

  /** Numbers inside stat tiles bump when they change (throttled so live simulations don't jitter). */
  function watchStats(root) {
    if (!ok || !window.MutationObserver) return () => {};
    const last = new WeakMap();
    const mo = new MutationObserver((recs) => {
      if (reduce()) return;
      const seen = new Set();
      recs.forEach((r) => {
        const b = r.target.nodeType === 3 ? r.target.parentElement : r.target;
        const s = b && b.closest && b.closest(".stat b, .fb-v, .boss-meta b");
        if (s) seen.add(s);
      });
      const now = performance.now();
      seen.forEach((b) => {
        const prev = last.get(b) || 0;
        last.set(b, now);
        if (now - prev < 450) return; // changing every frame: leave it still
        clean(b, run(b, { transform: ["scale(1)", "scale(1.22)", "scale(1)"] }, { duration: DUR.l, ease: EASE }), [
          "transform",
        ]);
        b.classList.remove("flash");
        void b.offsetWidth;
        b.classList.add("flash");
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
    return NIC.lazy("vendor/lottie_light.min.js")
      .then(() => {
        if (!el.isConnected || !window.lottie) return null;
        const box = document.createElement("div");
        box.className = "lottie " + cls;
        el.appendChild(box);
        const a = window.lottie.loadAnimation({
          container: box,
          renderer: "svg",
          loop,
          autoplay: true,
          animationData: JSON.parse(JSON.stringify(data)),
        });
        a.setSpeed(speed);
        if (!loop) a.addEventListener("complete", () => box.classList.add("done"));
        return a;
      })
      .catch(() => null);
  }

  /** Warm the Lottie player (e.g. when a lesson opens) so the first celebration doesn't wait on the download.
      Idempotent: NIC.lazy loads each file once. Skipped under reduced motion, where Lottie never plays. */
  let lottieWarm = null;
  function preloadLottie() {
    if (reduce() || !window.NIC || !NIC.lazy) return Promise.resolve(false);
    if (!lottieWarm)
      lottieWarm = NIC.lazy("vendor/lottie_light.min.js").then(
        () => true,
        () => {
          lottieWarm = null;
          return false;
        },
      );
    return lottieWarm;
  }

  /** Play a one-shot Lottie in a floating layer centred on anchor (it isn't clipped by the anchor's box). */
  function lottieAt(anchor, name, { size = 150, dy = 0 } = {}) {
    if (!anchor || reduce()) return;
    const r = anchor.getBoundingClientRect();
    const layer = document.createElement("div");
    layer.className = "lottie-at";
    layer.style.cssText = `left:${r.left + r.width / 2 - size / 2}px;top:${r.top + r.height / 2 - size / 2 + dy}px;width:${size}px;height:${size}px`;
    document.body.appendChild(layer);
    lottie(layer, name).then((a) => {
      if (!a) return layer.remove();
      a.addEventListener("complete", () => layer.remove());
      setTimeout(() => layer.remove(), 4000);
    });
  }

  NIC.fx = {
    lottie,
    lottieAt,
    preloadLottie,
    ok,
    reduce,
    EASE,
    EASE_IO,
    EASE_IN,
    DUR,
    SPRING,
    SPRING_UI,
    SPRING_POP,
    clean,
    enter,
    step,
    pop,
    bounce,
    bump,
    springIn,
    exit,
    swap,
    shake,
    reveal,
    count,
    play,
    onView,
    celebrate,
    floatText,
    toast,
    watchStats,
    animate: run,
  };
})();
