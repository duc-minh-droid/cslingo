/* Lecture 7 · Swarm intelligence: the small drawing pieces every scene shares (VID.l7, short name L7). Needs videos/l5/common.js
   and l7/common.js loaded first (see videos/lecture-7.html). Positions are the parent's pixels (the stage is 936 x 640, origin
   top-left). EVERY CALL IS PURE: call set()/update() each frame from your scene's update(t) with everything you want to see;
   anything you leave out falls back to its default and nothing is remembered between frames.

   COLOUR ROLES OF THIS VIDEO (tone names, the same as VID.l5.tone):
     "blue"   PHEROMONE: a trail, its thickness, the numbers that count pheromone, what ants add (deposit, gain)
     "green"  good: the short branch / the short tour, a right vote, a tick, the winner
     "red"    bad: a wrong vote, a cross, "no leader", a colony locked onto the long branch
     "orange" chance and choice: dice, chance pills, the town or road the ant picked, the leader tour
     "purple" the rule that FADES or REWRITES: evaporation (x 1/2, -20%), "sematonic" stigmergy, the stigmergy banner
     "grey"   the ground: roads, the nest, the food, towns, neutral labels.   ANTS themselves are drawn in ink (dark), never blue.
     L7.tone("red") -> {c, ink, dim, edge, lip, on} (CSS var() strings, as VID.l5.tone); L7.TONES lists the six names.

   1. TAGS, CARDS, COUNTERS  (HTML stickers; sizes are px, text is never below 28 px)
        const t = L7.tag(parent, {x, y, text, tone: "grey", solid: false, h, fs: 28});  a pill sticker (x, y = top-left)
            t.set({text, tone, solid, k: 1, x, y, s, o})   k 0..1 pops it in (0 hides it); x, y = offset from where it was placed
            L7.tagW(text, fs) estimates a tag's width (about 13 px per character + 40); a tag is about 58 px high.
        const c = L7.card(parent, {x, y, w, h, text, tone: "grey", plain: true, fs: 28});  a sticker box with centred text
            c.set({text, tone, plain, k, x, y, s, o});   c.el
        const n = L7.stat(parent, {x, y, w: 270, h: 80, label: "step", tone: "blue"});  label on the left, a big number on the right
            n.set({text, tone, solid, bump: 0..1 (a pulse: V.flash(t, a, b)), k, x, y, o})
        const d = L7.disc(parent, {x, y, size: 64, text, tone: "orange"});  a round solid sticker (x, y = its CENTRE)
            d.set({text, tone, solid: true, k, x, y, s, o})
        const m = L7.token(parent, {tone: "grey", size: 30});  a round marker (x, y = its CENTRE)   m.set({x, y, s, o, tone, ring})
        const b = L7.bar(parent, {x, y, w: 316, h: 56, tone: "green"});  a sticker bar that fills from the left, text inside it
            b.set({k: 0..1 (fraction of the bar), text, tone, o, x, y})
        const l = L7.text(parent, {x, y, w, text, fs: 32, tone: "ink", bold, align: "left"});  plain text (x, y = top-left; w makes it wrap
            and lets align work; fs at least 28). tone "ink" (default), "dim" (grey) or a tone name (its -ink shade).
            l.set({text, tone, k: 1, o, x, y, s})   k 0..1 rises 8 px and fades in;  l.el
        A card is also a positioned box: append your own absolutely placed children to c.el (a row with a town letter, an equation and a
        pill, for example), and fade or move the whole row with c.set({k, o, x, y}).
   2. SVG PICTOGRAMS  (append to an L5.svg(parent) layer, or to the layer a helper gives you; drawn at ABSOLUTE coordinates so
      V.place(g, {x, y, s, r, o}) moves, scales and rotates them from where they are drawn; x, y = centre)
        L7.ant(x, y, size = 60, {tone: "ink"})   a top-down ant FACING RIGHT (size = body length: abdomen, thorax, head, six legs, two
            antennae). tone "ink" is the dark default; a tone name tints it. Turn it with V.place(g, {r: degrees}).
        L7.crown(x, y, size = 90, tone = "orange")   a crown (the leader that ants do not have: cross it out with L5.cross)
        L7.spot(x, y, text, r = 40)   a round grey sticker with a word in it (the "Nest" and the "Food"), centre x, y; text is 28 px
        VID.l5.tick / cross / arrow / drawOn / dice / badge / svg  come from l5 (see l5/common.js)
   3. WIDTHS AND TIMING
        L7.trailW(tau, k = 0.4, max = 26) -> px width of a pheromone trail: 3 + tau x k, never above 3 + max - 3 (0 when tau is 0)
        L7.seq(t, t0, step, dur, i) -> 0..1: the ramp of the i-th item of a staggered list starting at t0 (item i runs from t0 + i x step
            for dur seconds). Ease it yourself (E.out, E.pop, ...). */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  const L5 = V.l5;
  const { clamp, ease: E } = V;

  const f1 = (n) => n.toFixed(1);
  const D = (...a) =>
    a.map((q) => (Array.isArray(q) ? `${f1(q[0])} ${f1(q[1])}` : typeof q === "number" ? f1(q) : q)).join(" ");
  L7.TONES = ["green", "red", "orange", "blue", "purple", "grey"];
  const tn = (t) => {
    if (!L7.TONES.includes(t)) throw new Error(`VID.l7: unknown tone "${t}" (use ${L7.TONES.join(", ")})`);
    return t;
  };
  L7.tone = (name) => L5.tone(tn(name));
  const abs = (x, y, w, h) => {
    const st = { position: "absolute", left: `${f1(x)}px`, top: `${f1(y)}px` };
    if (w != null) st.width = `${f1(w)}px`;
    if (h != null) st.height = `${f1(h)}px`;
    return st;
  };
  const flex = { display: "flex", alignItems: "center", justifyContent: "center" };
  const fsOk = (fs, who) => {
    if (fs < 28) throw new Error(`VID.l7.${who}: text must be at least 28 px (got ${fs})`);
    return fs;
  };
  const setText = (el, text) => {
    if (text != null && el.textContent !== String(text)) el.textContent = String(text);
  };
  const setClass = (el, cls) => {
    if (el.className !== cls) el.className = cls;
  };
  const solidStyle = (on) => ({
    background: on ? "var(--c)" : "",
    borderColor: on ? "var(--c-lip)" : "",
    boxShadow: on ? "0 6px 0 var(--c-lip)" : "",
    color: on ? "var(--c-on)" : "",
  });
  L7.seq = (t, t0, step, dur, i) => clamp((t - t0 - i * step) / dur);
  L7.tagW = (text, fs = 28) => Math.round(String(text).length * fs * 0.465 + 40);
  L7.trailW = (tau, k = 0.4, max = 26) => (tau <= 0.001 ? 0 : Math.min(max, 3 + tau * k));

  // ---------- 1. tags, cards, counters ----------
  function tag(parent, o = {}) {
    const el = V.h("div", {
      class: "v-tag",
      text: o.text || "",
      style: {
        ...abs(o.x || 0, o.y || 0),
        ...flex,
        fontSize: `${fsOk(o.fs || 28, "tag")}px`,
        ...(o.h ? { height: `${o.h}px` } : {}),
      },
    });
    parent.append(el);
    const base = { tone: o.tone || "grey", solid: !!o.solid };
    return {
      el,
      set(st = {}) {
        const solid = st.solid ?? base.solid;
        setClass(el, `v-tag c-${tn(st.tone || base.tone)}${solid ? " solid" : ""}`);
        setText(el, st.text);
        const k = clamp(st.k ?? 1);
        V.place(el, {
          x: st.x || 0,
          y: st.y || 0,
          s: (st.s ?? 1) * (0.8 + 0.2 * E.pop(k)),
          o: Math.min(1, k * 4) * (st.o ?? 1),
        });
      },
    };
  }
  function card(parent, o = {}) {
    const { x = 0, y = 0, w = 130, h = 100, tone: base = "grey", plain = true, fs = 28 } = o;
    const el = V.h("div", {
      class: `v-card${plain ? " plain" : ""} c-${tn(base)}`,
      text: o.text || "",
      style: {
        ...abs(x, y, w, h),
        ...flex,
        fontSize: `${fsOk(fs, "card")}px`,
        borderRadius: "22px",
        textAlign: "center",
      },
    });
    parent.append(el);
    return {
      el,
      set(st = {}) {
        setClass(el, `v-card${(st.plain ?? plain) ? " plain" : ""} c-${tn(st.tone || base)}`);
        setText(el, st.text);
        const k = clamp(st.k ?? 1);
        V.place(el, {
          x: st.x || 0,
          y: st.y || 0,
          s: (st.s ?? 1) * (0.9 + 0.1 * E.pop(k)),
          o: Math.min(1, k * 4) * (st.o ?? 1),
        });
      },
    };
  }
  function stat(parent, o = {}) {
    const { x = 0, y = 0, w = 270, h = 80, label = "total", tone: base = "blue" } = o;
    const el = V.h("div", {
      class: `v-card c-${tn(base)}`,
      style: { ...abs(x, y, w, h), ...flex, justifyContent: "space-between", padding: "0 24px", borderRadius: "22px" },
    });
    const lab = V.h("span", { text: label, style: { fontSize: "28px", fontWeight: "800" } });
    const val = V.h("span", { text: "0", style: { fontSize: "50px", fontWeight: "900", lineHeight: "1" } });
    el.append(lab, val);
    parent.append(el);
    return {
      el,
      set(st = {}) {
        setClass(el, `v-card c-${tn(st.tone || base)}`);
        Object.assign(el.style, solidStyle(!!st.solid));
        setText(val, st.text);
        const k = clamp(st.k ?? 1);
        V.place(el, {
          x: st.x || 0,
          y: st.y || 0,
          s: (0.8 + 0.2 * E.pop(k)) * (1 + 0.1 * (st.bump || 0)),
          o: Math.min(1, k * 4) * (st.o ?? 1),
        });
      },
    };
  }
  function disc(parent, o = {}) {
    const { x = 0, y = 0, size = 64, tone: base = "orange" } = o;
    const el = V.h("div", {
      class: `v-gene solid c-${tn(base)}`,
      text: o.text || "",
      style: {
        ...abs(x - size / 2, y - size / 2, size, size),
        borderRadius: "50%",
        fontSize: `${Math.round(size * 0.55)}px`,
      },
    });
    parent.append(el);
    return {
      el,
      set(st = {}) {
        setClass(el, `v-gene c-${tn(st.tone || base)}${st.solid === false ? "" : " solid"}`);
        setText(el, st.text);
        const k = clamp(st.k ?? 1);
        V.place(el, {
          x: st.x || 0,
          y: st.y || 0,
          s: (st.s ?? 1) * (0.7 + 0.3 * E.pop(k)),
          o: Math.min(1, k * 4) * (st.o ?? 1),
        });
      },
    };
  }
  function token(parent, o = {}) {
    const { tone: base = "grey", size = 30 } = o;
    const pad = Math.max(5, Math.round(size * 0.22));
    const ring = V.h("div", {
      style: {
        ...abs(0, 0, size + 2 * pad, size + 2 * pad),
        boxSizing: "border-box",
        border: `${Math.max(4, Math.round(size * 0.12))}px solid var(--violet)`,
        borderRadius: "50%",
        visibility: "hidden",
      },
    });
    const el = V.h("div", {
      class: `v-gene solid c-${tn(base)}`,
      style: { ...abs(0, 0, size, size), borderRadius: "50%", boxShadow: `0 ${Math.round(size / 8)}px 0 var(--c-lip)` },
    });
    parent.append(ring, el);
    return {
      el,
      set(st = {}) {
        setClass(el, `v-gene solid c-${tn(st.tone || base)}`);
        el.style.left = `${f1((st.x || 0) - size / 2)}px`;
        el.style.top = `${f1((st.y || 0) - size / 2)}px`;
        V.place(el, { s: st.s ?? 1, o: st.o ?? 1 });
        if (st.ring) {
          ring.style.borderColor = L7.tone(st.ring).c;
          ring.style.left = `${f1((st.x || 0) - size / 2 - pad)}px`;
          ring.style.top = `${f1((st.y || 0) - size / 2 - pad)}px`;
          V.place(ring, { s: st.s ?? 1, o: st.o ?? 1 });
        } else ring.style.visibility = "hidden";
      },
    };
  }
  function bar(parent, o = {}) {
    const { x = 0, y = 0, w = 316, h = 56, tone: base = "green" } = o;
    const el = V.h("div", {
      class: `v-card c-${tn(base)}`,
      style: {
        ...abs(x, y, w, h),
        borderRadius: `${h / 2}px`,
        background: "var(--panel-2)",
        borderColor: "var(--line-2)",
        boxShadow: "0 5px 0 var(--line-2)",
        overflow: "hidden",
      },
    });
    const fill = V.h("div", {
      style: {
        position: "absolute",
        left: "0",
        top: "0",
        bottom: "0",
        width: "0",
        borderRadius: `${h / 2}px`,
        background: "var(--c)",
      },
    });
    const label = V.h("div", {
      style: {
        position: "absolute",
        left: "20px",
        top: "0",
        bottom: "0",
        ...flex,
        fontSize: "34px",
        fontWeight: "900",
        color: "var(--c-on)",
      },
    });
    el.append(fill, label);
    parent.append(el);
    return {
      el,
      set(st = {}) {
        setClass(el, `v-card c-${tn(st.tone || base)}`);
        setText(label, st.text);
        fill.style.width = `${f1(clamp(st.k ?? 0) * (w - 6))}px`;
        fill.style.minWidth = (st.k ?? 0) > 0.001 ? `${h - 6}px` : "0";
        fill.style.visibility = (st.k ?? 0) > 0.001 ? "" : "hidden";
        V.place(el, { x: st.x || 0, y: st.y || 0, o: st.o ?? 1 });
      },
    };
  }

  function text(parent, o = {}) {
    const { x = 0, y = 0, w, fs = 32, tone: base = "ink", bold = true, align = "left" } = o;
    const el = V.h("div", {
      class: "v-text",
      text: o.text || "",
      style: {
        ...abs(x, y, w),
        fontSize: `${fsOk(fs, "text")}px`,
        fontWeight: bold ? "900" : "800",
        textAlign: align,
        ...(w ? { whiteSpace: "normal" } : {}),
      },
    });
    parent.append(el);
    const colour = (t) => (t === "ink" ? "var(--ink)" : t === "dim" ? "var(--text-dim)" : L7.tone(t).ink);
    return {
      el,
      set(st = {}) {
        setText(el, st.text);
        el.style.color = colour(st.tone || base);
        const k = clamp(st.k ?? 1);
        V.place(el, { x: st.x || 0, y: (st.y || 0) + (1 - k) * 8, s: st.s ?? 1, o: k * (st.o ?? 1) });
      },
    };
  }

  // ---------- 2. svg pictograms ----------
  function spot(x, y, label, r = 40) {
    const grey = L7.tone("grey");
    const mk = (dy, a) => V.s("circle", { cx: f1(x), cy: f1(y + dy), r, "stroke-width": "4", style: a });
    return V.s(
      "g",
      {},
      mk(5, { fill: grey.edge, stroke: grey.edge }),
      mk(0, { fill: "var(--panel)", stroke: grey.edge }),
      V.s("text", {
        x: f1(x),
        y: f1(y),
        dy: ".36em",
        "text-anchor": "middle",
        style: { fontFamily: "var(--sans)", fontWeight: "900", fontSize: "28px", fill: "var(--ink)" },
        text: label,
      }),
    );
  }
  function ant(x, y, size = 60, opt = {}) {
    const name = opt.tone || "ink";
    const s = size;
    const [fill, edge] = name === "ink" ? ["var(--ink)", "var(--ink)"] : [L7.tone(name).c, L7.tone(name).lip];
    const w = f1(Math.max(2.5, s * 0.055));
    const body = (cx, rx, ry) =>
      V.s("ellipse", {
        cx: f1(x + cx * s),
        cy: f1(y),
        rx: f1(rx * s),
        ry: f1(ry * s),
        "stroke-width": w,
        style: { fill, stroke: edge },
      });
    const limb = (d) =>
      V.s("path", {
        d,
        fill: "none",
        "stroke-width": w,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        style: { stroke: edge },
      });
    const legs = [-0.1, 0, 0.1].flatMap((j, i) =>
      [-1, 1].map((sd) =>
        limb(
          D("M", [x + j * s, y], "L", [x + (j + [-0.08, 0.04, 0.16][i]) * s, y + sd * 0.2 * s], "L", [
            x + (j + [-0.2, 0.04, 0.26][i]) * s,
            y + sd * 0.36 * s,
          ]),
        ),
      ),
    );
    const feel = [-1, 1].map((sd) =>
      limb(
        D("M", [x + 0.28 * s, y + sd * 0.04 * s], "L", [x + 0.4 * s, y + sd * 0.14 * s], "L", [
          x + 0.5 * s,
          y + sd * 0.1 * s,
        ]),
      ),
    );
    return V.s("g", {}, ...legs, ...feel, body(-0.3, 0.21, 0.15), body(-0.02, 0.13, 0.1), body(0.2, 0.11, 0.1));
  }
  function crown(x, y, size = 90, tone = "orange") {
    const t = L7.tone(tone);
    const s = size;
    const pts = [
      [-0.5, 0.3],
      [-0.5, -0.25],
      [-0.25, 0.02],
      [0, -0.35],
      [0.25, 0.02],
      [0.5, -0.25],
      [0.5, 0.3],
    ];
    const d = D(
      "M",
      [x + pts[0][0] * s, y + pts[0][1] * s],
      ...pts.slice(1).flatMap((p) => ["L", [x + p[0] * s, y + p[1] * s]]),
      "Z",
    );
    return V.s("path", {
      d,
      "stroke-width": f1(Math.max(4, s * 0.06)),
      "stroke-linejoin": "round",
      style: { fill: t.c, stroke: t.lip },
    });
  }

  Object.assign(L7, { tag, card, stat, disc, token, bar, text, ant, crown, spot, abs, flex });
})();
