/* Motion layer — thin wrappers over motion.dev (vendor/motion.js, global `Motion`).
   Rules: transform + opacity only, strong ease-out, UI motion < 300ms,
   reduced motion keeps opacity fades and drops movement. Everything no-ops safely without Motion. */
(function () {
  const fx = (NIC.shared.engineFx = NIC.shared.engineFx || {});

  const M = window.Motion;
  const ok = !!(M && M.animate);
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reduce = () => mq.matches;
  const EASE = [0.23, 1, 0.32, 1];
  const EASE_IO = [0.77, 0, 0.175, 1];
  const EASE_IN = [0.4, 0, 1, 1]; // exits (mirrors --ease-in)
  const list = (t) => (!t ? [] : t instanceof Element ? [t] : Array.from(t));
  const run = (el, kf, opts) => (ok ? M.animate(el, kf, opts) : null);
  /* Motion tokens, in seconds. They mirror the --dur-* custom properties in css/motion.css.
     xl is for celebrations only (confetti fallback, floating "+1"); it is not UI motion. */
  const DUR = { press: 0.04, xs: 0.09, s: 0.16, m: 0.24, l: 0.32, bar: 0.42, xl: 1.2 };
  const SPRING = { type: "spring", duration: 0.4, bounce: 0.3 }; // feedback settle
  const SPRING_UI = { type: "spring", duration: 0.35, bounce: 0.2 }; // indicators, popovers
  const SPRING_POP = { type: "spring", duration: 0.5, bounce: 0.55 }; // badges, icons, check marks
  /** Drop the inline styles Motion leaves behind once `a` finishes, so CSS (:active, sticky, hover) keeps working. */
  // Motion can write the final frame one frame after `finished` resolves (seen on animations started during page load),
  // so clear once now and once more after the next frame.
  const clean = (el, a, props = ["transform", "opacity"]) => {
    const clear = () => props.forEach((p) => (el.style[p] = ""));
    if (a)
      a.finished
        .then(() => {
          clear();
          requestAnimationFrame(() => setTimeout(clear, 0));
        })
        .catch(() => {});
    return a;
  };

  /** Staggered entrance: fade + small rise (or slide, with x). Used for page assembly and freshly inserted content. */
  function enter(targets, { y = 8, x = 0, delay = 0, stagger = 0.045, dur = DUR.m } = {}) {
    const els = list(targets).filter(Boolean);
    if (!ok || !els.length) return;
    const kf = reduce()
      ? { opacity: [0, 1] }
      : { opacity: [0, 1], transform: [`translate(${x}px, ${y}px)`, "translate(0px, 0px)"] };
    // leave no inline transform behind (sticky children, tooltips and z-stacking stay sane)
    els.forEach((el, i) =>
      clean(el, run(el, kf, { duration: reduce() ? DUR.s : dur, delay: delay + i * stagger, ease: EASE })),
    );
  }

  /** Lesson step change — slides in the direction of travel. */
  function step(el, dir = 1) {
    if (!ok) return;
    const kf = reduce()
      ? { opacity: [0, 1] }
      : { opacity: [0, 1], transform: [`translateX(${18 * dir}px)`, "translateX(0px)"] };
    clean(el, run(el, kf, { duration: DUR.m, ease: EASE }));
    if (reduce()) return;
    // then the step's parts arrive one after another: title, paragraphs, figure, check
    const parts = Array.from(el.querySelectorAll(":scope > *, :scope > .lesson-body > *")).filter(
      (p) => !p.classList.contains("lesson-body"),
    );
    parts.forEach((p, i) =>
      clean(
        p,
        run(
          p,
          { opacity: [0, 1], transform: ["translateY(10px)", "translateY(0px)"] },
          { duration: DUR.m, delay: 0.04 + i * 0.05, ease: EASE },
        ),
      ),
    );
  }

  /** Positive feedback: a small spring settle. */
  function pop(el) {
    if (!ok || !el || reduce()) return;
    clean(el, run(el, { transform: ["scale(0.96)", "scale(1)"] }, SPRING), ["transform"]);
  }

  /** Correct answer: the tile hops up a touch and settles (Duolingo's happy bounce). */
  function bounce(el) {
    if (!ok || !el || reduce()) return null;
    return clean(
      el,
      run(
        el,
        { transform: ["scale(1)", "scale(1.05)", "scale(0.985)", "scale(1)"] },
        { duration: DUR.m, ease: EASE, times: [0, 0.3, 0.65, 1] },
      ),
      ["transform"],
    );
  }

  /** Something changed (a counter, a selected icon): quick springy scale bump, optionally with a hop. */
  function bump(el, { scale = 1.2, y = 0 } = {}) {
    if (!ok || !el || reduce()) return null;
    return clean(
      el,
      run(
        el,
        {
          transform: [
            "translateY(0px) scale(1)",
            `translateY(${y}px) scale(${scale})`,
            `translateY(0px) scale(${1 - (scale - 1) / 4})`,
            "translateY(0px) scale(1)",
          ],
        },
        { duration: DUR.m, ease: EASE, times: [0, 0.35, 0.7, 1] },
      ),
      ["transform"],
    );
  }

  /** Spring an element in from a small scale (path nodes, badges, check marks). Reduced motion: fade only. */
  function springIn(el, { delay = 0, from = 0.3, rot = 0, bounce: b = 0.45, dur = 0.55 } = {}) {
    if (!el) return null;
    if (!ok) {
      el.style.opacity = "";
      return null;
    }
    const a = reduce()
      ? run(el, { opacity: [0, 1] }, { duration: DUR.s, delay })
      : run(
          el,
          { opacity: [0, 1], transform: [`scale(${from}) rotate(${rot}deg)`, "scale(1) rotate(0deg)"] },
          { type: "spring", duration: dur, bounce: b, delay },
        );
    return clean(el, a);
  }

  /** Exit animation; resolves when done (at once without Motion) so the caller can remove the element.
      `base` keeps a transform the element already has in CSS (e.g. "translateX(-50%)"). */
  function exit(el, { x = 0, y = 0, scale = 0.96, dur = DUR.s, base = "" } = {}) {
    if (!ok || !el) return Promise.resolve();
    const kf =
      reduce() || (!x && !y && scale === 1)
        ? { opacity: [1, 0] }
        : {
            opacity: [1, 0],
            transform: [`${base} translate(0px, 0px) scale(1)`, `${base} translate(${x}px, ${y}px) scale(${scale})`],
          };
    const a = run(el, kf, { duration: dur, ease: EASE_IN });
    return a ? a.finished.catch(() => {}) : Promise.resolve();
  }

  /** Negative feedback: short horizontal shake (element is disabled afterwards, so it can't be re-triggered rapidly). */
  function shake(el) {
    if (!ok || !el || reduce()) return;
    clean(
      el,
      run(
        el,
        {
          transform: [
            "translateX(0px)",
            "translateX(-5px)",
            "translateX(5px)",
            "translateX(-3px)",
            "translateX(2px)",
            "translateX(0px)",
          ],
        },
        { duration: DUR.l, ease: "easeOut" },
      ),
      ["transform"],
    );
  }

  /**
   * Page change. Runs update() inside a View Transition when the browser has one, so the old page slides out
   * (dir 1 = forward/right, -1 = back/left, 0 = crossfade; see css/motion.css). update() then runs a frame later.
   * Without the API it runs update() at once and fades `el` in. Returns true when a transition started.
   */
  let vtCur = null;
  function swap(update, { dir = 0, el = null } = {}) {
    const d = document.documentElement;
    const safe = () => {
      try {
        update();
      } catch (e) {
        setTimeout(() => {
          throw e;
        });
      }
    }; // surface errors like a normal route would
    if (!document.startViewTransition) {
      update();
      if (el && ok) clean(el, run(el, { opacity: [0, 1] }, { duration: DUR.s, ease: EASE }), ["opacity"]);
      return false;
    }
    d.dataset.vt = reduce() || !dir ? "fade" : dir > 0 ? "fwd" : "back";
    let t;
    try {
      t = document.startViewTransition(safe);
    } catch {
      delete d.dataset.vt;
      update();
      return false;
    }
    vtCur = t;
    [t.ready, t.updateCallbackDone].forEach((p) => p && p.catch(() => {})); // a skipped transition rejects these
    const done = () => {
      if (vtCur === t) {
        vtCur = null;
        delete d.dataset.vt;
      }
    };
    t.finished.then(done, done);
    return true;
  }

  /** Reveal content that was just unhidden (explanations, feedback). */
  function reveal(el) {
    if (!ok || !el) return;
    const kf = reduce() ? { opacity: [0, 1] } : { opacity: [0, 1], transform: ["translateY(-4px)", "translateY(0px)"] };
    clean(el, run(el, kf, { duration: DUR.m, ease: EASE }));
  }

  /** Tween a number shown in `el`. */
  function count(el, to, { from, dur = DUR.bar, fmt = (v) => Math.round(v).toLocaleString() } = {}) {
    if (!el) return;
    const start = from ?? (parseFloat(String(el.dataset.v ?? el.textContent).replace(/[^\d.-]/g, "")) || 0);
    el.dataset.v = to;
    if (!ok || reduce() || !Number.isFinite(start) || start === to) {
      el.textContent = fmt(to);
      return;
    }
    M.animate(start, to, { duration: dur, ease: EASE, onUpdate: (v) => (el.textContent = fmt(v)) });
  }

  /** Draw-on for SVG strokes marked `.draw`, then pop in items marked `.fi` (figure items) in document order. */
  function play(root, { delay = 0.05 } = {}) {
    if (!root) return;
    const strokes = Array.from(root.querySelectorAll(".draw"));
    const items = Array.from(root.querySelectorAll(".fi"));
    if (!ok || reduce()) {
      if (ok) enter(items, { y: 0, stagger: 0.02, dur: DUR.s });
      return;
    }
    strokes.forEach((p, i) => {
      let len;
      try {
        len = p.getTotalLength();
      } catch {
        return;
      }
      if (!len) return;
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
      const a = M.animate(
        p,
        { strokeDashoffset: [len, 0] },
        { duration: 0.55, delay: delay + i * 0.06, ease: EASE_IO },
      );
      a.finished
        .then(() => {
          p.style.strokeDasharray = "";
          p.style.strokeDashoffset = "";
        })
        .catch(() => {});
    });
    items.forEach((it, i) =>
      clean(
        it,
        M.animate(
          it,
          { opacity: [0, 1], transform: ["scale(0.9)", "scale(1)"] },
          { duration: DUR.m, delay: delay + 0.08 + i * 0.05, ease: EASE },
        ),
      ),
    );
  }

  /** Scroll-reveal for cards below the fold. Fires once; content is never left hidden if Motion is missing.
      `run(el)` replaces the default fade-rise (it must restore opacity, as enter and springIn do). */
  function onView(targets, { run: show = (el) => enter(el, { y: 12 }) } = {}) {
    const els = list(targets),
      stops = [];
    if (!ok || !M.inView) return () => {};
    const vh = window.innerHeight;
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < vh * 0.92) return; // already on screen — the page entrance covers it
      el.style.opacity = "0";
      let stop = null;
      stop = M.inView(
        el,
        () => {
          show(el);
          if (stop) stop();
        },
        { margin: "0px 0px -8% 0px" },
      );
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
      confetti({
        particleCount: big ? 140 : 70,
        spread: big ? 100 : 70,
        startVelocity: big ? 48 : 36,
        origin,
        colors,
        scalar: 1.05,
        ticks: 220,
        zIndex: 200,
        disableForReducedMotion: true,
      });
      if (big)
        setTimeout(() => {
          confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, colors, zIndex: 200 });
          confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, colors, zIndex: 200 });
        }, 220);
      return;
    }
    if (!ok) return;
    for (let i = 0; i < 28; i++) {
      const d = document.createElement("i");
      d.className = "spark" + (i % 3 ? " rib" : "");
      d.style.left = r.left + r.width / 2 + "px";
      d.style.top = r.top + r.height / 2 + "px";
      d.style.background = colors[i % colors.length];
      document.body.appendChild(d);
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3,
        dist = 70 + Math.random() * 90,
        dx = Math.cos(ang) * dist,
        dy = Math.sin(ang) * dist;
      M.animate(
        d,
        {
          opacity: [1, 1, 0],
          transform: [
            "translate(-50%,-50%) scale(0.6)",
            `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(200deg)`,
            `translate(calc(-50% + ${dx * 1.25}px), calc(-50% + ${dy + 120}px)) rotate(400deg)`,
          ],
        },
        { duration: DUR.xl, ease: [0.2, 0.7, 0.4, 1], times: [0, 0.35, 1] },
      )
        .finished.then(() => d.remove())
        .catch(() => d.remove());
    }
  }

  /** "+1" that floats up from an element (a correct answer). Colour defaults to the theme's green. */
  function floatText(el, text = "+1", color) {
    if (!ok || !el || reduce()) return;
    if (!color) {
      try {
        color = NIC.colors().teal;
      } catch {
        /* colours not ready */
      }
    }
    const r = el.getBoundingClientRect();
    const t = document.createElement("span");
    t.className = "float-xp";
    t.textContent = text;
    t.style.color = color || "var(--teal)";
    t.style.textShadow = "0 1px 0 rgba(0, 0, 0, 0.18)";
    t.style.left = r.right - 24 + "px";
    t.style.top = r.top + 4 + "px";
    document.body.appendChild(t);
    M.animate(
      t,
      {
        opacity: [0, 1, 1, 0],
        transform: [
          "translateY(6px) scale(0.6)",
          "translateY(-10px) scale(1.15)",
          "translateY(-34px) scale(1)",
          "translateY(-52px) scale(0.9)",
        ],
      },
      { duration: DUR.xl, ease: EASE, times: [0, 0.2, 0.7, 1] },
    )
      .finished.then(() => t.remove())
      .catch(() => t.remove());
  }

  /**
   * Toast that springs in from the top (streaks, milestones). Toasts queue: each one leaves before the next arrives,
   * and a toast with the same html as one showing or waiting is dropped. While a lesson is open (body.in-lesson) queued
   * toasts wait for the complete screen (.pd-title) or for the player to close, so goal/quest/achievement toasts
   * don't cover the lesson. `live: true` shows one during a lesson anyway (feedback about something just done there).
   */
  const tq = [];
  Object.assign(fx, {
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
  });
})();
