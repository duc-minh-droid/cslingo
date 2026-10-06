/* CSLingo explainer videos: a tiny deterministic timeline engine.

   A video is a list of scenes. Every scene is a PURE FUNCTION OF ITS LOCAL TIME (seconds since the scene started), so a
   frame can be drawn at any moment: preview scrubbing, and frame-by-frame recording by tools/render-video.mjs.
   Never use CSS transitions/animations, timers or Math.random() in a scene: set styles from `t` only.

     VID.scene({
       kicker: "ENCODING",                 // small label above the headline
       title: ["Standard mutation", "can break a tour"],   // headline, one or two lines
       dur: 10,                            // seconds
       caps: [[0.6, 4.5, "A plain-English sentence."], ...],   // captions: [from, to, text] in local seconds
       build(stage) {                      // draw once into `stage` (936 x 640 px, origin top-left)
         ...create elements, absolutely positioned...
         return (t) => { ...set styles from local time t... };
       },
     });
     VID.scene({ bare: true, dur: 4, build(stage) {...} })   // title/recap cards: no chrome, stage is the full 1080 x 1080

   Helpers: ramp/ease/lerp/clamp (maths), h/s (HTML/SVG element factories), place (position + scale + opacity),
   show (visibility), type (typewriter slice), mascot (Sprout and friends), pageSetup (see lecture pages). */
(function () {
  const V = (window.VID = { W: 1080, H: 1080, FPS: 30, FADE: 0.3, scenes: [], total: 0 });
  const SVGNS = "http://www.w3.org/2000/svg";
  const SVG_TAGS = /^(svg|g|path|line|circle|ellipse|rect|polygon|polyline|text|tspan|defs|marker|clipPath|use|mask)$/;

  /* the figure area under the headline (stage coordinates start at its top-left corner) */
  V.STAGE = { x: 72, y: 262, w: 936, h: 640 };

  // ---------- maths ----------
  V.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  V.lerp = (a, b, k) => a + (b - a) * k;
  const E = (V.ease = {
    lin: (x) => x,
    in: (x) => x * x * x,
    out: (x) => 1 - Math.pow(1 - x, 3),
    inOut: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    back: (x) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2), // small overshoot (appear)
    pop: (x) => {
      // springy scale-in: overshoots then settles
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      return 1 - Math.exp(-6.5 * x) * Math.cos(x * 9.5);
    },
  });
  /** 0..1 progress of t between a and b, shaped by an easing (default ease-out). */
  V.ramp = (t, a, b, ease = E.out) => ease(V.clamp((t - a) / (b - a)));
  /** 0 -> 1 -> 0 between a and b (a short flash). */
  V.flash = (t, a, b) => Math.sin(Math.PI * V.clamp((t - a) / (b - a)));

  // ---------- DOM ----------
  function setAttrs(e, attrs) {
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "class") e.setAttribute("class", v);
      else if (k === "style" && typeof v === "object") Object.assign(e.style, v);
      else if (k === "text") e.textContent = v;
      else if (k === "html") e.innerHTML = v;
      else e.setAttribute(k, v);
    }
  }
  function kids(e, list) {
    list.flat().forEach((c) => {
      if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
    });
    return e;
  }
  /** HTML element: V.h("div", {class: "v-card", style: {left: "10px"}, text: "hi"}, ...children). */
  V.h = (tag, attrs, ...children) => {
    const e = document.createElement(tag);
    setAttrs(e, attrs);
    return kids(e, children);
  };
  /** SVG element (svg, g, path, line, circle, rect, text, ...). */
  V.s = (tag, attrs, ...children) => {
    if (!SVG_TAGS.test(tag)) throw new Error(`VID.s: unknown SVG tag ${tag}`);
    const e = document.createElementNS(SVGNS, tag);
    setAttrs(e, attrs);
    return kids(e, children);
  };

  /** Position, scale, rotate and fade one element (HTML with position:absolute, or any SVG element) in a single call.
      x, y in px (offset from the element's own left/top for HTML, from its drawn position for SVG), s scale, r degrees, o opacity.
      Scale and rotation pivot on the element's centre. o <= 0 hides it completely. */
  V.place = (e, { x = 0, y = 0, s = 1, r = 0, o = 1 } = {}) => {
    const st = e.style;
    st.opacity = o >= 1 ? "" : String(Math.max(0, o));
    st.visibility = o <= 0.001 ? "hidden" : "";
    st.transformOrigin = "50% 50%";
    if (e instanceof SVGElement) st.transformBox = "fill-box";
    st.transform = `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`;
    return e;
  };
  /** Show (k > 0) or hide an element, optionally fading with k in 0..1. */
  V.show = (e, k = 1) => {
    e.style.visibility = k <= 0.001 ? "hidden" : "";
    e.style.opacity = k >= 1 ? "" : String(Math.max(0, k));
    return e;
  };
  /** Typewriter: the first k (0..1) of a string. */
  V.type = (str, k) => str.slice(0, Math.round(str.length * V.clamp(k)));
  /** A character mascot (Sprout, Pebble, Byte, Blaze, Chip, Berry) as an HTML box; needs the cast scripts on the page. */
  V.mascot = (who = "sprout", { size = 160, mood = "happy", act = "" } = {}) => {
    const box = V.h("div", { class: "v-mascot", style: { width: `${size}px`, height: `${size}px` } });
    if (window.NIC && NIC.mascot) box.innerHTML = NIC.mascot({ who, size, mood, act, poke: false });
    return box;
  };

  // ---------- scenes ----------
  V.scene = (def) => {
    V.scenes.push(def);
    return def;
  };

  let root, bar, capEl, capNow;
  function buildScene(def, i) {
    const sc = V.h("div", { class: `v-scene${def.bare ? " v-bare" : ""}` });
    const stage = V.h("div", { class: "v-stage" });
    def.__el = sc;
    def.__lines = [];
    if (!def.bare) {
      def.__kicker = V.h("div", { class: "v-kicker", text: def.kicker || "" });
      sc.append(def.__kicker);
      (Array.isArray(def.title) ? def.title : [def.title || ""]).forEach((line) => {
        const l = V.h("div", { class: "v-title-line", text: line });
        def.__lines.push(l);
      });
      sc.append(V.h("div", { class: "v-title" }, ...def.__lines));
    }
    sc.append(stage);
    root.append(sc);
    def.__update = def.build(stage, V) || (() => {});
    def.__i = i;
  }

  function startOf(i) {
    let a = 0;
    for (let k = 0; k < i; k++) a += V.scenes[k].dur;
    return a;
  }

  /** Draw the frame at time t (seconds from the start of the video). */
  V.seek = (t) => {
    t = V.clamp(t, 0, V.total - 1e-3);
    let i = 0;
    while (i < V.scenes.length - 1 && t >= startOf(i + 1)) i++;
    const def = V.scenes[i];
    const lt = t - startOf(i);
    V.scenes.forEach((d) => (d.__el.style.display = d === def ? "block" : "none"));
    const fadeIn = i === 0 && def.bare ? 1 : V.ramp(lt, 0, V.FADE, E.lin);
    const fadeOut = i === V.scenes.length - 1 ? 1 : V.ramp(def.dur - lt, 0, V.FADE, E.lin);
    def.__el.style.opacity = String(Math.min(fadeIn, fadeOut));
    if (!def.bare) {
      V.place(def.__kicker, { y: (1 - V.ramp(lt, 0.05, 0.45)) * 10, o: V.ramp(lt, 0.05, 0.45) });
      def.__lines.forEach((l, k) => {
        const p = V.ramp(lt, 0.15 + k * 0.12, 0.65 + k * 0.12);
        V.place(l, { y: (1 - p) * 22, o: p });
      });
    }
    def.__update(lt);
    // caption: one plain-English sentence at a time, fading in and out
    const cap = (def.caps || []).find(([a, b]) => lt >= a && lt < b);
    if (cap) {
      if (capNow !== cap[2]) {
        capEl.textContent = cap[2];
        capNow = cap[2];
      }
      const k = Math.min(V.ramp(lt, cap[0], cap[0] + 0.25, E.lin), V.ramp(cap[1] - lt, 0, 0.25, E.lin));
      V.place(capEl, { y: (1 - k) * 8, o: k });
    } else V.show(capEl, 0);
    bar.style.width = `${(t / V.total) * 100}%`;
    return { scene: i, t: lt };
  };

  // ---------- page ----------
  function controls() {
    const ui = V.h("div", { class: "v-ui" });
    const play = V.h("button", { class: "v-btn", text: "Play" });
    const seek = V.h("input", { type: "range", min: "0", max: String(V.total), step: "0.01", value: "0" });
    const time = V.h("span", { class: "v-time", text: "0:00" });
    ui.append(play, seek, time);
    document.body.append(ui);
    let playing = false,
      t0 = 0,
      from = 0;
    const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
    const draw = (t) => {
      V.seek(t);
      seek.value = String(t);
      time.textContent = `${fmt(t)} / ${fmt(V.total)}`;
    };
    const tick = (now) => {
      if (!playing) return;
      const t = from + (now - t0) / 1000;
      if (t >= V.total) {
        playing = false;
        play.textContent = "Replay";
        draw(V.total - 0.001);
        return;
      }
      draw(t);
      requestAnimationFrame(tick);
    };
    const go = (at) => {
      playing = true;
      from = at;
      t0 = performance.now();
      play.textContent = "Pause";
      requestAnimationFrame(tick);
    };
    play.onclick = () => {
      if (playing) {
        playing = false;
        play.textContent = "Play";
      } else go(+seek.value >= V.total - 0.05 ? 0 : +seek.value);
    };
    seek.oninput = () => {
      playing = false;
      play.textContent = "Play";
      draw(+seek.value);
    };
    addEventListener("keydown", (e) => {
      if (e.key === " ") play.click();
      else if (e.key === "ArrowRight")
        (draw(Math.min(V.total - 0.01, +seek.value + 1)), (seek.value = +seek.value + 1));
      else if (e.key === "ArrowLeft") (draw(Math.max(0, +seek.value - 1)), (seek.value = Math.max(0, +seek.value - 1)));
      else if (e.key === "]" || e.key === "[") {
        const cur = V.seek(+seek.value).scene;
        const next = Math.max(0, Math.min(V.scenes.length - 1, cur + (e.key === "]" ? 1 : -1)));
        draw(startOf(next));
      }
    });
    return draw;
  }

  function fit() {
    const k = Math.min(innerWidth / V.W, (innerHeight - (document.body.classList.contains("rec") ? 0 : 56)) / V.H);
    root.style.transform = document.body.classList.contains("rec") ? "none" : `scale(${Math.min(k, 1.5)})`;
  }

  /** Called once by a lecture page after every scene file has loaded. ?rec=1 hides the controls; ?t=12.5 seeks and pauses. */
  V.start = (opts = {}) => {
    const q = new URLSearchParams(location.search);
    if (q.has("rec")) document.body.classList.add("rec");
    document.documentElement.dataset.theme = "light";
    document.documentElement.dataset.themeNow = "light";
    document.title = opts.title || document.title;
    root = V.h("div", { class: "v-root" });
    const track = V.h("div", { class: "v-progress" }, (bar = V.h("i")));
    capEl = V.h("div", { class: "v-caption" });
    root.append(track, capEl);
    document.body.prepend(root);
    V.scenes.forEach(buildScene);
    root.append(track, capEl); // above the scenes
    V.total = V.scenes.reduce((a, d) => a + d.dur, 0);
    let draw = (t) => V.seek(t);
    if (!document.body.classList.contains("rec")) draw = controls();
    addEventListener("resize", fit);
    fit();
    const ready = () => {
      draw(q.has("t") ? +q.get("t") : 0);
      window.__vidReady = true;
    };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(ready);
  };
})();
