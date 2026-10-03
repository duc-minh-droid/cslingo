(function () {
  const core = (NIC.shared.engineCore = NIC.shared.engineCore || {});
  const {
    LANDSCAPES,
    TSP,
    barChart,
    choice,
    clamp,
    colors,
    drawLandscape,
    el,
    esc,
    fmt,
    gauss,
    guide,
    header,
    lesson,
    lifecycle,
    lineChart,
    makeLandscape,
    matrixHTML,
    modules,
    predict,
    qs,
    qsa,
    randint,
    register,
    roundRect,
    seg,
    setupCanvas,
    shuffle,
    slider,
    store,
    takeaways,
    tspSVG,
    updateScore,
  } = core;
  const rnd = Math.random;
  /** Make everything behind a dialog unreachable (Tab, clicks, screen readers) and give focus back afterwards. */
  const shieldStack = [];
  function shield(on) {
    const els = ["#main", "#topbar", "#dock", "#pop"].map((s) => document.querySelector(s)).filter(Boolean);
    if (on) {
      shieldStack.push(document.activeElement);
      els.forEach((e) => e.setAttribute("inert", ""));
    } else {
      const back = shieldStack.pop();
      if (!shieldStack.length) els.forEach((e) => e.removeAttribute("inert"));
      if (back && back.isConnected && back.focus) back.focus({ preventScroll: true });
    }
  }

  // ---------- Lazy vendor loading (plain <script>/<link> tags, so it works over file:// too) ----------
  const base = (document.currentScript && document.currentScript.src.replace(/js\/[^?]*(\?.*)?$/, "")) || "";
  const BUILD = ((document.currentScript && document.currentScript.src.match(/[?&]v=([^&]+)/)) || [])[1] || "dev"; // set by tools/stamp.py
  const loading = {};
  /** Load vendor scripts/styles once, in order. lazy("vendor/three.min.js") → Promise. */
  function lazy(...srcs) {
    return srcs.reduce(
      (p, src) =>
        p.then(
          () =>
            loading[src] ||
            (loading[src] = new Promise((ok, bad) => {
              const css = src.endsWith(".css"),
                t = document.createElement(css ? "link" : "script");
              const url = base + src + (src.includes("?") ? "&" : "?") + "v=" + BUILD;
              if (css) {
                t.rel = "stylesheet";
                t.href = url;
              } else {
                t.src = url;
              }
              t.onload = () => ok();
              t.onerror = () => {
                delete loading[src];
                bad(new Error("failed to load " + src));
              };
              document.head.appendChild(t);
            })),
        ),
      Promise.resolve(),
    );
  }

  /** Typeset $…$ (inline) and $$…$$ (display) maths inside root with KaTeX. Loads KaTeX on first use. */
  const HAS_TEX = /\$\$[\s\S]+?\$\$|\$[^$\s][^$]*?\$/;
  function tex(root) {
    if (!root || !HAS_TEX.test(root.textContent)) return Promise.resolve(false);
    return lazy("vendor/katex/katex.min.css", "vendor/katex/katex.min.js", "vendor/katex/auto-render.min.js")
      .then(() => {
        const had = new Set(root.querySelectorAll(".katex"));
        window.renderMathInElement(root, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
          ],
          throwOnError: false,
          ignoredClasses: ["katex"],
        });
        // the raw $…$ text was on screen a moment ago: fade the typeset maths in (opacity only, so reduced motion keeps it)
        const fx = window.NIC && window.NIC.fx,
          fresh = [...root.querySelectorAll(".katex")].filter((k) => !had.has(k) && !k.parentElement.closest(".katex"));
        if (fx && fx.ok && fresh.length) {
          const a = fx.animate(fresh, { opacity: [0, 1] }, { duration: fx.DUR.s, ease: fx.EASE });
          fresh.forEach((k) => fx.clean(k, a, ["opacity"]));
        }
        return true;
      })
      .catch(() => false);
  }
  // Typeset anything added to the page later (lesson screens, feedback sheets, the guidebook…), like emoji.js does.
  {
    let q = new Set(),
      pend = false;
    const flush = () => {
      pend = false;
      const s = q;
      q = new Set();
      s.forEach((n) => n.isConnected && !n.closest(".katex") && tex(n));
    };
    const start = () =>
      new MutationObserver((recs) => {
        recs.forEach((r) =>
          r.addedNodes.forEach((n) => {
            if (n.nodeType === 1 && HAS_TEX.test(n.textContent)) q.add(n);
            else if (n.nodeType === 3 && n.parentElement && HAS_TEX.test(n.nodeValue)) q.add(n.parentElement);
          }),
        );
        if (q.size && !pend) {
          pend = true;
          setTimeout(flush, 0);
        }
      }).observe(document.body, { childList: true, subtree: true });
    document.body ? start() : document.addEventListener("DOMContentLoaded", start);
  }
  /** One maths string → HTML (sync once KaTeX is loaded; falls back to the raw text before that). */
  const texStr = (s, display = false) =>
    window.katex ? window.katex.renderToString(s, { throwOnError: false, displayMode: display }) : esc(s);

  Object.assign(window.NIC, {
    BUILD,
    lazy,
    asset: (src) => base + src + (src.includes("?") ? "&" : "?") + "v=" + BUILD,
    tex,
    texStr,
    shield,
    modules,
    register,
    qs,
    qsa,
    el,
    esc,
    rnd,
    randint,
    choice,
    shuffle,
    gauss,
    clamp,
    fmt,
    setupCanvas,
    colors,
    lineChart,
    barChart,
    roundRect,
    store,
    updateScore,
    predict,
    lesson,
    guide,
    takeaways,
    LESSONS: {},
    header,
    lifecycle,
    slider,
    seg,
    LANDSCAPES,
    makeLandscape,
    drawLandscape,
    TSP,
    tspSVG,
    matrixHTML,
  });
})();
