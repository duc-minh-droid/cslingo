/* Figure runner: a step-through player for algorithm figures inside lesson steps.

   NIC.fig.run(box, life, {
     build(stage, api)  → scene       // make the figure once (SVG/HTML inside stage); keep handles in `scene`
     frames(scene)      → iterable    // the real algorithm yields one frame per step (a generator is fine):
                                      //   {cap, line?, ask?: {q, pick, a, why}, ...your state}
     draw(scene, f, c)                // show frame f. c = {tl, instant, prev, i}; use NIC.fig.rn helpers with c
     code: ["line 0", …],             // optional pseudocode; f.line highlights one line
     speed: 1, autoplay: false, who: "byte"
   })

   Frames are computed up front, so stepping back and scrubbing are exact. A frame with `ask` pauses before it is
   shown: the learner clicks an element matching `ask.pick` whose data-k equals `ask.a` (or one of them, if an array).
   Direct manipulation: api.drag(el, {move(x, y), end()}) and api.edit(el, {get, set, min, max, step}); call
   api.recompute() after changing the model, and the run restarts from frame 0.
   Tests: the root element carries __rn = {n(), i(), runAll()}; runAll() plays to the end, answering every ask. */
(function () {
  const runner = (NIC.shared.engineRun = NIC.shared.engineRun || {});

  const N = NIC;
  const G = () => window.gsap;
  const regGsap = () => {
    if (window.gsap) window.gsap.registerPlugin(...[window.DrawSVGPlugin, window.MotionPathPlugin].filter(Boolean));
  };
  regGsap();
  // GSAP (about 25 KB gzipped) loads after startup; the runner and the roulette wheel animate with it once it arrives
  if (!window.gsap)
    N.lazy("vendor/gsap/gsap.min.js", "vendor/gsap/DrawSVGPlugin.min.js", "vendor/gsap/MotionPathPlugin.min.js").then(
      regGsap,
      () => {},
    );
  const reduce = () => N.fx && N.fx.reduce();
  const FX = () => (N.fx && N.fx.ok ? N.fx : null); // Motion helpers, or null without Motion
  const DUR = (N.fx && N.fx.DUR) || { xs: 0.09, s: 0.16, m: 0.24, l: 0.32 };
  const SVGNS = "http://www.w3.org/2000/svg";
  const I = {
    back: '<svg viewBox="0 0 24 24"><path d="M6 5v14M19 5.5v13L9 12z" fill="currentColor" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    pause:
      '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4.2" height="14" rx="1.4" fill="currentColor"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.4" fill="currentColor"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M18 5v14M5 5.5v13L15 12z" fill="currentColor" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    again:
      '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  const SPEEDS = [0.5, 1, 2];

  // ---------- tween helpers: animate on the frame's timeline, or set instantly when scrubbing ----------
  const rn = {
    /** Tween (or set) GSAP props on el: {attr:{…}, fill, opacity, x, y, scale…}. */
    to(c, el, props, at = 0, dur = 0.45) {
      if (!el) return;
      const g = G();
      if (!g) {
        applyPlain(el, props);
        return;
      }
      if (c.instant) g.set(el, props);
      else c.tl.to(el, { duration: dur, ease: "power2.out", ...props }, at);
    },
    /** Count a number up/down in el's text. Infinity shows as ∞. */
    num(c, el, to, at = 0) {
      if (!el) return;
      const show = (v) => (v === Infinity ? "∞" : Number.isInteger(to) ? String(Math.round(v)) : (+v).toFixed(1));
      const from = parseFloat(el.dataset.v);
      el.dataset.v = to;
      if (c.instant || !G() || !Number.isFinite(from) || !Number.isFinite(to) || from === to) {
        el.textContent = show(to);
        return;
      }
      const o = { v: from };
      c.tl.to(
        o,
        {
          v: to,
          duration: 0.5,
          ease: "power1.out",
          onUpdate: () => (el.textContent = show(o.v)),
          onComplete: () => (el.textContent = show(to)),
        },
        at,
      );
    },
    /** A quick scale bounce to draw the eye. */
    pulse(c, el, at = 0) {
      if (!el || c.instant || !G() || reduce()) return;
      c.tl.fromTo(
        el,
        { scale: 1 },
        { scale: 1.22, duration: DUR.s, yoyo: true, repeat: 1, ease: "power1.inOut", transformOrigin: "50% 50%" },
        at,
      );
    },
    /** Show or hide a stroke by drawing it along its length. */
    stroke(c, el, on, at = 0) {
      if (!el) return;
      const g = G(),
        wasOn = el.dataset.on === "1";
      el.dataset.on = on ? "1" : "0";
      if (!g || !window.DrawSVGPlugin || c.instant || reduce() || wasOn === on) {
        el.style.strokeDasharray = "";
        el.style.strokeDashoffset = "";
        el.style.opacity = on ? 1 : 0;
        if (g) g.set(el, { drawSVG: "0% 100%", opacity: on ? 1 : 0 });
        return;
      }
      if (on)
        c.tl.fromTo(
          el,
          { drawSVG: "0% 0%", opacity: 1 },
          { drawSVG: "0% 100%", duration: 0.5, ease: "power2.inOut" },
          at,
        );
      else c.tl.to(el, { opacity: 0, duration: DUR.m }, at);
    },
    /** Swap text with a small fade. */
    text(c, el, s, at = 0) {
      if (!el || el.textContent === String(s)) return;
      if (c.instant || !G() || reduce()) {
        el.textContent = s;
        return;
      }
      c.tl
        .to(el, { opacity: 0, duration: DUR.xs }, at)
        .call(() => (el.textContent = s), null, at + DUR.xs)
        .to(el, { opacity: 1, duration: DUR.s }, at + DUR.xs);
    },
    /** Toggle a class at the frame's start (for CSS-driven states). */
    cls(c, el, name, on) {
      if (el) el.classList.toggle(name, !!on);
    },
  };
  function applyPlain(el, p) {
    Object.entries(p).forEach(([k, v]) => {
      if (k === "attr") Object.entries(v).forEach(([a, b]) => el.setAttribute(a, b));
      else if (k === "x" || k === "y") el.style.transform = `translate(${p.x || 0}px, ${p.y || 0}px)`;
      else el.style[k] = v;
    });
  }

  /** A labelled graph scene for runners: nodes {A:[x,y]}, edges [[a,b,w]]. Returns handles for each node/edge. */
  function graphScene(stage, { nodes, edges, w = 460, h = 280, r = 20, directed = false, editable = false }) {
    const key = (a, b) => (directed ? `${a}>${b}` : [a, b].sort().join("-"));
    const mid = (a, b) => [(nodes[a][0] + nodes[b][0]) / 2, (nodes[a][1] + nodes[b][1]) / 2];
    const trim = (a, b, d) => {
      const [x1, y1] = nodes[a],
        [x2, y2] = nodes[b],
        L = Math.hypot(x2 - x1, y2 - y1) || 1;
      return [x1 + ((x2 - x1) / L) * d, y1 + ((y2 - y1) / L) * d, x2 - ((x2 - x1) / L) * d, y2 - ((y2 - y1) / L) * d];
    };
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("class", "fig rn-svg");
    svg.style.maxHeight = h + "px";
    svg.innerHTML = `<defs><marker id="rn-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--line-2)"/></marker></defs>
      <g class="rn-edges">${edges
        .map(([a, b, wt]) => {
          const [x1, y1, x2, y2] = trim(a, b, r + 2),
            [mx, my] = mid(a, b);
          return `<g class="rn-edge" data-e="${key(a, b)}"><line class="rn-base" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${directed ? 'marker-end="url(#rn-arr)"' : ""}/><line class="rn-hot" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="opacity:0"/>
        <g class="rn-wt ${editable ? "rn-editable" : ""}" transform="translate(${mx} ${my})"><rect x="-13" y="-11" width="26" height="22" rx="7"/><text y="5" data-v="${wt}">${wt}</text></g></g>`;
        })
        .join("")}</g>
      <g class="rn-nodes">${Object.entries(nodes)
        .map(
          ([k, [x, y]]) =>
            `<g class="rn-node" data-k="${k}" transform="translate(${x} ${y})"><g class="rn-nb"><circle class="rn-halo" r="${r + 7}"/><circle class="rn-c" r="${r}"/><text class="rn-l" y="6">${k}</text></g><g class="rn-tag" transform="translate(0 ${-r - 12})"><rect x="-17" y="-11" width="34" height="20" rx="8"/><text y="4" data-v="">·</text></g></g>`,
        )
        .join("")}</g>`;
    stage.appendChild(svg);
    const q = (s) => svg.querySelector(s);
    return {
      svg,
      node: (k) => {
        const g = q(`.rn-node[data-k="${k}"]`);
        return (
          g && {
            g,
            body: g.querySelector(".rn-nb"),
            c: g.querySelector(".rn-c"),
            tag: g.querySelector(".rn-tag text"),
            tagBox: g.querySelector(".rn-tag"),
          }
        );
      },
      edge: (a, b) => {
        const g = q(`.rn-edge[data-e="${key(a, b)}"]`);
        return (
          g && {
            g,
            hot: g.querySelector(".rn-hot"),
            wt: g.querySelector(".rn-wt text"),
            wbox: g.querySelector(".rn-wt"),
          }
        );
      },
      key,
    };
  }
  Object.assign(runner, { DUR, FX, G, I, SPEEDS, graphScene, reduce, rn });
})();
