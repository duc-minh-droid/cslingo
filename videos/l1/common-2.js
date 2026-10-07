/* Lecture 1 · What is NIC?: drawing blocks shared by several scenes (window.VID.l1, short name L1; needs l1/common.js and
   l5/common.js first). All coordinates are stage pixels (936 x 640, origin top-left). Every update/set call is a PURE function
   of its arguments: call it each frame from update(t), pass everything you want to see, keep no state of your own.
   Tones: "green" "red" "blue" "purple" "orange" "grey" (L5.tone(name) gives the CSS colour roles).

   1. LANDSCAPE  (scenes 5, 8, 10)
        const ls = L1.landscape(stage, { x: 0, w: 936, base: 280, peak: 50, star: 44 });
            Draws the lecture's landscape (L1.land) into one full-stage SVG: grey baseline at stage y = base, the best point (the
            star's hill, f = max) at y = peak, x(i) = x + 18 + i / 239 * (w - 36). Green curve (6 px) with a flat light green fill.
        ls.set({ k: 1, star: 1, starPulse: 0, o: 1 })   k = draw progress 0..1 left to right (fill follows), star = pop-in 0..1
                                                          (spring), starPulse 0..1 = one pulse of the star (V.flash it), o = opacity
        ls.px(i) -> [x, y]     point on the curve (fractional i interpolates); ls.x(i); ls.y(fitnessValue); ls.base; ls.peak
        ls.dot({ tone: "blue", r: 14, hollow: false, dashed: false, id }) -> d, a dot that stands on the curve (sticker lip), or a
            hollow ring (candidate / ghost). Dots are created once at build time, hidden until you set them:
            d.set({ i, lift: 0, s: 1, o: 1, tone, hollow, ring: 0, dx: 0, dy: 0 })
              i = index on the landscape (fractional ok), lift = px above the curve, s = scale, o = opacity (0 hides),
              tone/hollow override what the dot was created with, ring 0..1 = one expanding pulse ring in the dot's tone,
              dx/dy = extra pixel offset (wiggles, jiggles). Omitted fields fall back to their defaults.
        ls.under / ls.over   empty SVG <g>s below / above the dots: build stalks, arcs, crosses, rings into them (they are in stage
                             coordinates; V.s("line", ...), L5.cross(...) etc.); ls.svg is the whole SVG, ls.dots the dots group.
        L1.sprout(oldIdx[], newIdx[], parentOf[], u) -> { kids: [{i, o}], olds: [{i, o}] }
            One generation of a population (u 0..1): child k starts on top of its parent's old index oldIdx[parentOf[k]], travels
            (inOut, first 80% of u) to newIdx[k]; old dot j fades out in the second half. Feed kids[k] to child dots, olds[j] to
            old dots: dot.set({ i: kids[k].i, o: kids[k].o }). parentOf[k] = L1.popRun(...)[g].info[k].p1.
        L1.star(size, tone = "orange") -> SVG <g> five-point star with lip, centred at (0, 0) (V.place moves it).

   2. LETTERS AND COUNTERS
        const g = L1.letterGrid(stage, { text, cols: 14, size: 52, gap: 8, x, y, rowGap: 10, tone: "grey" })
            g.set(i, { tone, text, s, o, solid, x, y, r, sx, ghost })   one tile (a space shows as a dim dot); same fields as L5.chromosome
            g.all((i) => state | undefined)   g.tile(i) -> the tile element   g.el wrapper (V.place / V.show it)   g.rows (L5 rows)
            g.pos(i) -> {x, y} centre of tile i in stage coordinates.   g.width, g.height
        const pips = L1.pips(stage, { n: 3, size: 24, gap: 10, x, y });   pips(flags, k = 1)
            flags[i]: false/0 hollow grey, true/1 solid green, a number in between pops (0 -> 1 over ~0.3 s = a pop). k = whole-set pop-in.
        const dg = L1.digits(stage, { n: 41, tone: "red", x, y, w: 10, h: 22, pitch: 13 });   dg(k)   k 0..1 squares popped, left to right
        const wf = L1.waffle(stage, { flags: [...200], cols: 20, cell: 16, pitch: 18, x, y });   wf(k)   k 0..1 cells revealed in run
            order (row by row); green where flag, grey otherwise. wf.width / wf.height.
        L1.chip(stage, "tries 3,037", "grey", { x, y, solid: false, width, html }) -> element (a v-tag; change el.textContent / use
            { html } for superscripts; width centres the text). Use V.place(el, ...) to animate.
        const gg = L1.gauge(stage, { x, y, w: 160, on: false });   gg.set(needle 0..1, { s, o, x, y })   half-circle dial (red, orange,
            green arcs, needle, hub); on: true draws it in orange-on only, for use on an orange sticker. gg.el, gg.w, gg.h.

   3. L1.ingredientBar(stage, { y: 588 }) -> update(states, k = 1)
        Three tags, centred: (1) Population, (2) Selection + mutation, (3) Recombination (dashed outline = optional), each with a
        number disc. states = ["off" | "active" | "done", x3]: off soft grey, active solid blue, done soft green with a tick.
        k 0..1 pops the bar in. update.el is the wrapper. */
(function () {
  const V = window.VID;
  const L1 = V.l1;
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const T = L5.tone;
  const px1 = (n) => `${n.toFixed(1)}px`;
  const abs = (x, y, w, h) => ({ position: "absolute", left: px1(x), top: px1(y), width: px1(w), height: px1(h) });
  const land = L1.land;
  let uid = 0;

  // ---------- star ----------
  function star(size, tone = "orange") {
    const R = size / 2;
    const pts = Array.from({ length: 10 }, (_, k) => {
      const [a, r] = [(-90 + k * 36) * (Math.PI / 180), k % 2 ? R * 0.46 : R];
      return [r * Math.cos(a), r * Math.sin(a) + R * 0.06];
    });
    const d = (dy) => `M ${pts.map(([x, y]) => `${x.toFixed(1)} ${(y + dy).toFixed(1)}`).join(" L ")} Z`;
    const t = T(tone);
    const common = { "stroke-width": "4", "stroke-linejoin": "round" };
    return V.s(
      "g",
      {},
      V.s("path", { d: d(5), ...common, style: { fill: t.lip, stroke: t.lip } }),
      V.s("path", { d: d(0), ...common, style: { fill: t.c, stroke: t.lip } }),
    );
  }

  // ---------- landscape ----------
  function landscape(parent, opt = {}) {
    const { x: x0 = 0, w = 936, base = 280, peak = 50, star: starSize = 44 } = opt;
    const scale = (base - peak) / land.max;
    const X = (i) => x0 + 18 + (clamp(i, 0, land.N - 1) / (land.N - 1)) * (w - 36);
    const Yf = (v) => base - v * scale;
    const px = (i) => {
      const [lo, hi] = [Math.floor(clamp(i, 0, land.N - 1)), Math.ceil(clamp(i, 0, land.N - 1))];
      const v = land.vals[lo] + (land.vals[hi] - land.vals[lo]) * (clamp(i, 0, land.N - 1) - lo);
      return [X(i), Yf(v)];
    };
    const svg = L5.svg(parent);
    const id = `l1-clip-${uid++}`;
    const clipRect = V.s("rect", { x: px1(x0), y: "-20", width: "0", height: "700" });
    svg.append(V.s("defs", {}, V.s("clipPath", { id }, clipRect)));
    const line = land.vals.map((v, i) => `${i ? "L" : "M"} ${X(i).toFixed(1)} ${Yf(v).toFixed(1)}`).join(" ");
    const green = T("green");
    const root = V.s("g", {});
    const lands = V.s(
      "g",
      { "clip-path": `url(#${id})` },
      V.s("path", {
        d: `${line} L ${X(land.N - 1).toFixed(1)} ${base} L ${X(0).toFixed(1)} ${base} Z`,
        style: { fill: green.dim },
      }),
      V.s("path", {
        d: line,
        fill: "none",
        "stroke-width": "6",
        "stroke-linejoin": "round",
        style: { stroke: green.c },
      }),
    );
    const baseLine = V.s("line", {
      x1: px1(x0 + 6),
      x2: px1(x0 + w - 6),
      y1: px1(base + 2),
      y2: px1(base + 2),
      "stroke-width": "4",
      "stroke-linecap": "round",
      style: { stroke: T("grey").edge },
    });
    const [under, dots, over] = [V.s("g", {}), V.s("g", {}), V.s("g", {})];
    const starG = star(starSize);
    const starTop = px(land.star)[1] - starSize / 2 - 10;
    root.append(baseLine, lands, under, dots, over, starG);
    svg.append(root);
    const set = ({ k = 1, star: sk = 1, starPulse = 0, o = 1 } = {}) => {
      clipRect.setAttribute("width", px1(clamp(k) * (w + 40)));
      V.show(root, o);
      V.place(starG, {
        x: px(land.star)[0],
        y: starTop,
        s: Math.max(0, E.pop(sk)) * (1 + 0.28 * starPulse),
        o: clamp(sk * 6),
      });
    };
    set({ k: 0, star: 0 });

    const dot = (dopt = {}) => {
      const { r = 14 } = dopt;
      const g = V.s("g", {});
      const lip = V.s("circle", { r: String(r), cy: "5" });
      const body = V.s("circle", { r: String(r), "stroke-width": "4" });
      const ring = V.s("circle", { r: String(r), fill: "none", "stroke-width": "4" });
      g.append(lip, body, ring);
      dots.append(g);
      const d = {
        g,
        set(st = {}) {
          const {
            i = 0,
            lift = 0,
            s = 1,
            o = 1,
            tone = dopt.tone || "blue",
            hollow = !!dopt.hollow,
            ring: rk = 0,
            dx = 0,
            dy = 0,
          } = st;
          const t = T(tone);
          const [cx, cy] = px(i);
          g.setAttribute(
            "transform",
            `translate(${(cx + dx).toFixed(1)} ${(cy - r - 2 - lift + dy).toFixed(1)}) scale(${s.toFixed(3)})`,
          );
          V.show(g, o);
          lip.style.fill = hollow ? "none" : t.lip;
          body.style.fill = hollow ? "none" : t.c;
          body.style.stroke = hollow ? t.c : t.lip;
          body.setAttribute("stroke-dasharray", dopt.dashed ? "7 6" : "");
          ring.style.stroke = t.c;
          ring.setAttribute("r", (r * (1 + 1.2 * rk)).toFixed(1));
          ring.style.opacity = rk <= 0 || rk >= 1 ? "0" : String(0.9 * (1 - rk));
        },
      };
      d.set({ o: 0 });
      return d;
    };
    return { svg, set, px, x: X, y: Yf, base, peak, dot, under, over, dots, root };
  }

  function sprout(oldIdx, newIdx, parentOf, u) {
    const move = V.ramp(u, 0, 0.8, E.inOut);
    return {
      kids: newIdx.map((n, k) => ({ i: oldIdx[parentOf[k]] + (n - oldIdx[parentOf[k]]) * move, o: 1 })),
      olds: oldIdx.map((i) => ({ i, o: 1 - V.ramp(u, 0.5, 1, (x) => x) })),
    };
  }

  // ---------- letter grid ----------
  function letterGrid(parent, opt = {}) {
    const { text = "", cols = 14, size = 52, gap = 8, x = 0, y = 0, rowGap = 10, tone = "grey" } = opt;
    const genes = [...text].map((c) => (c === " " ? "·" : c));
    const nRows = Math.ceil(genes.length / cols);
    const width = Math.min(cols, genes.length) * (size + gap) - gap;
    const height = nRows * size + (nRows - 1) * rowGap;
    const el = V.h("div", { style: abs(x, y, width, height) });
    parent.append(el);
    const rows = Array.from({ length: nRows }, (_, r) =>
      L5.chromosome(el, {
        x: 0,
        y: r * (size + rowGap),
        genes: genes.slice(r * cols, (r + 1) * cols),
        size,
        gap,
        tone,
      }),
    );
    const rc = (i) => [rows[Math.floor(i / cols)], i % cols];
    const set = (i, st = {}) => {
      const [row, c] = rc(i);
      row.set(c, st.text === " " ? { ...st, text: "·" } : st);
    };
    return {
      el,
      rows,
      width,
      height,
      set,
      all: (fn) => genes.forEach((_, i) => set(i, fn(i) || {})),
      tile: (i) => rc(i)[0].tiles[rc(i)[1]],
      pos: (i) => ({ x: x + rc(i)[0].mid(rc(i)[1]).x, y: y + rc(i)[0].mid(rc(i)[1]).y }),
    };
  }

  // ---------- counters ----------
  function pips(parent, opt = {}) {
    const { n = 3, size = 24, gap = 10, x = 0, y = 0 } = opt;
    const el = V.h("div", { style: abs(x, y, n * (size + gap) - gap, size) });
    const list = Array.from({ length: n }, (_, i) =>
      V.h("div", {
        style: {
          ...abs(i * (size + gap), 0, size, size),
          boxSizing: "border-box",
          borderRadius: "50%",
          borderWidth: "3px",
          borderStyle: "solid",
        },
      }),
    );
    el.append(...list);
    parent.append(el);
    const update = (flags = [], k = 1) => {
      list.forEach((p, i) => {
        const f = Number(flags[i] || 0);
        const on = f >= 0.5;
        const t = T(on ? "green" : "grey");
        p.style.background = on ? t.c : "var(--panel)";
        p.style.borderColor = on ? t.lip : t.edge;
        p.style.boxShadow = on ? `0 3px 0 ${t.lip}` : "none";
        const pop = f > 0 && f < 1 ? 1 + 0.35 * Math.sin(Math.PI * f) : 1;
        V.place(p, { s: pop * Math.max(0, E.pop(clamp(k * 1.3 - 0.1 * i))), o: clamp(k * 5) });
      });
    };
    update.el = el;
    return update;
  }

  function digits(parent, opt = {}) {
    const { n = 10, tone = "red", x = 0, y = 0, w = 10, h = 22, pitch = 13 } = opt;
    const el = V.h("div", { style: abs(x, y, (n - 1) * pitch + w, h) });
    const t = T(tone);
    const list = Array.from({ length: n }, (_, i) =>
      V.h("div", {
        style: {
          ...abs(i * pitch, 0, w, h),
          boxSizing: "border-box",
          borderRadius: "4px",
          background: t.c,
          border: `2px solid ${t.lip}`,
        },
      }),
    );
    el.append(...list);
    parent.append(el);
    const update = (k = 1) => {
      list.forEach((q, i) => {
        const l = clamp(clamp(k) * n - i);
        V.place(q, { s: Math.max(0, E.pop(l)), o: clamp(l * 6) });
      });
    };
    update.el = el;
    update.width = (n - 1) * pitch + w;
    return update;
  }

  function waffle(parent, opt = {}) {
    const { flags = [], cols = 20, cell = 16, pitch = 18, x = 0, y = 0 } = opt;
    const n = flags.length;
    const rowsN = Math.ceil(n / cols);
    const [width, height] = [(cols - 1) * pitch + cell, (rowsN - 1) * pitch + cell];
    const el = V.h("div", { style: abs(x, y, width, height) });
    const [g, grey] = [T("green"), T("grey")];
    const list = flags.map((f, i) =>
      V.h("div", {
        style: {
          ...abs((i % cols) * pitch, Math.floor(i / cols) * pitch, cell, cell),
          boxSizing: "border-box",
          borderRadius: "4px",
          background: f ? g.c : grey.dim,
          border: `2px solid ${f ? g.lip : grey.edge}`,
        },
      }),
    );
    el.append(...list);
    parent.append(el);
    const update = (k = 1) => {
      list.forEach((q, i) => {
        const l = clamp(clamp(k) * n - i);
        V.place(q, { s: 0.4 + 0.6 * Math.max(0, E.pop(l)), o: clamp(l * 8) });
      });
    };
    return Object.assign(update, { el, width, height });
  }

  function chip(parent, text, tone = "grey", opt = {}) {
    const { x = 0, y = 0, solid = false, width, html } = opt;
    const e = V.h("div", { class: `v-tag${solid ? " solid" : ""} c-${tone}`, style: { left: px1(x), top: px1(y) } });
    if (html != null) e.innerHTML = html;
    else e.textContent = text;
    if (width) Object.assign(e.style, { width: px1(width), textAlign: "center", paddingLeft: "0", paddingRight: "0" });
    parent.append(e);
    return e;
  }

  function gauge(parent, opt = {}) {
    const { x = 0, y = 0, w = 160, on = false } = opt;
    const [cx, cy, R] = [w / 2, w / 2 + 4, w / 2 - 14];
    const h = w / 2 + 22;
    const svg = V.s("svg", { width: w, height: h, style: { ...abs(x, y, w, h), overflow: "visible" } });
    const arc = (a0, a1) => {
      const p = (a) => `${(cx + R * Math.cos(a)).toFixed(1)} ${(cy - R * Math.sin(a)).toFixed(1)}`;
      return `M ${p(Math.PI - a0)} A ${R} ${R} 0 0 1 ${p(Math.PI - a1)}`;
    };
    const ink = "var(--amber-on)";
    const arcs = ["red", "orange", "green"].map((tn, k) =>
      V.s("path", {
        d: arc((k * Math.PI) / 3 + 0.03, ((k + 1) * Math.PI) / 3 - 0.03),
        fill: "none",
        "stroke-width": "14",
        "stroke-linecap": "round",
        style: { stroke: on ? ink : T(tn).c, opacity: on ? [0.3, 0.6, 1][k] : 1 },
      }),
    );
    const needle = V.s("line", {
      x1: cx,
      y1: cy,
      "stroke-width": "7",
      "stroke-linecap": "round",
      style: { stroke: on ? ink : "var(--ink)" },
    });
    const hub = V.s("circle", { cx, cy, r: "10", style: { fill: on ? ink : "var(--ink)" } });
    svg.append(...arcs, needle, hub);
    parent.append(svg);
    const set = (k = 0, st = {}) => {
      const a = Math.PI * (1 - clamp(k));
      needle.setAttribute("x2", (cx + (R - 8) * Math.cos(a)).toFixed(1));
      needle.setAttribute("y2", (cy - (R - 8) * Math.sin(a)).toFixed(1));
      V.place(svg, st);
    };
    set(0);
    return { el: svg, set, w, h };
  }

  // ---------- ingredient bar ----------
  function ingredientBar(parent, opt = {}) {
    const {
      y = 588,
      labels = ["Population", "Selection + mutation", "Recombination"],
      widths = [225, 350, 285],
      gap = 14,
    } = opt;
    const total = widths.reduce((a, b) => a + b, 0) + gap * 2;
    const el = V.h("div", { style: abs(0, y, 936, 56) });
    let left = (936 - total) / 2;
    const tick = V.s(
      "svg",
      { width: 26, height: 26, viewBox: "0 0 26 26" },
      L5.tick(13, 13, 20, "green", { on: true, w: 4 }),
    );
    const tags = labels.map((lab, i) => {
      const num = V.h("span", { class: "l1-num", text: String(i + 1) });
      Object.assign(num.style, {
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      });
      const tag = V.h(
        "div",
        {
          class: "v-tag c-grey",
          style: {
            ...abs(left, 0, widths[i], 56),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "0 10px",
          },
        },
        num,
        V.h("span", { text: lab }),
      );
      if (i === 2) tag.style.borderStyle = "dashed";
      left += widths[i] + gap;
      return { tag, num, tick: i === 0 ? tick : tick.cloneNode(true) };
    });
    tags.forEach((q) => {
      q.num.append(q.tick);
      el.append(q.tag);
    });
    parent.append(el);
    const update = (states = [], k = 1) => {
      tags.forEach((q, i) => {
        const st = states[i] || "off";
        const cls = `v-tag${st === "active" ? " solid" : ""} c-${st === "active" ? "blue" : st === "done" ? "green" : "grey"}`;
        if (q.tag.className !== cls) q.tag.className = cls;
        const [bg, fg] =
          st === "active"
            ? ["var(--bg)", "var(--blue-ink)"]
            : st === "done"
              ? ["var(--teal)", "var(--teal-on)"]
              : ["var(--line-2)", "var(--text-dim)"];
        Object.assign(q.num.style, { background: bg, color: fg, fontSize: "24px", fontWeight: "900" });
        q.tick.style.display = st === "done" ? "block" : "none";
        q.num.firstChild.nodeType === 3 && (q.num.firstChild.textContent = st === "done" ? "" : String(i + 1));
        V.place(q.tag, { s: 0.7 + 0.3 * Math.max(0, E.pop(clamp(k * 1.5 - 0.15 * i))), o: clamp(k * 5 - 0.3 * i) });
      });
    };
    update.el = el;
    return update;
  }

  Object.assign(L1, { star, landscape, sprout, letterGrid, pips, digits, waffle, chip, gauge, ingredientBar });
})();
