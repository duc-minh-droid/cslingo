/* Data Science · Lecture 2 (ds-2): the small drawing pieces every scene shares (VID.d2, short name D2). Needs videos/l5/common.js and
   d2/common.js loaded first (see videos/ds-2.html). Positions are the parent's pixels (the stage is 936 x 640, origin top-left).
   EVERY CALL IS PURE: call set()/update() each frame from your scene's update(t) with everything you want to see; anything you
   leave out falls back to its default and nothing is remembered between frames.

   COLOUR ROLES OF THIS VIDEO (tones): "grey" neutral data (a record, a row, an untouched copy, things not in play); "blue" the thing
   being read or looked at (the profile page, the current vertex, a read arrow, the walker); "purple" a link between records (a
   foreign key, a join, an edge in use); "orange" an identifier or the thing that changes (a key chip, the company name, an edge label,
   attention); "green" a good result (one read, up to date, reached, done); "red" a bad result (a stale copy, wasted KB, waiting,
   not reachable).  D2.TONES lists them;  D2.tone("red") -> {c, ink, dim, edge, lip, on} (CSS var() strings, same as VID.l5.tone:
   c = fill/icon, ink = text on a tint, dim = tint fill, edge = tint border, lip = sticker edge, on = text on a c fill).

   1. TAGS, CARDS, COUNTERS  (HTML stickers; every text is 28 px or more)
        const t = D2.tag(parent, {x, y, text, tone: "grey", solid: false, h, fs: 28, mono: false});   a pill label (x, y = top-left)
            t.set({text, tone, solid, k: 1, x, y, s, o})   k 0..1 pops it in; x, y = offset from where it was placed
            t.el;  D2.tagW(text, fs = 28) -> width estimate (about 13 px per character plus 40; a tag is about 58 px high)
        const c = D2.card(parent, {x, y, w: 130, h: 100, text, tone: "grey", plain: true, fs: 28, mono: false});   a sticker box with centred
            text ("\n" = new line).  c.set({text, tone, plain, k, x, y, s, o})   plain = panel face with the tone's edge, false = the tone's tint,
            solid: true = filled in the tone
        const n = D2.stat(parent, {x, y, w: 300, h: 80, label: "lookups", tone: "blue"});   label on the left, a big number on the right
            n.set({text, tone, solid, bump: 0..1 (one pulse: V.flash(t, a, b)), k, o, x, y})
        const d = D2.disc(parent, {x, y, size: 64, text, tone});   a round sticker with text (x, y = its CENTRE).  d.set({text, tone, solid: true, k, x, y, s, o})
        const m = D2.token(parent, {tone: "blue", size: 30});   a round marker (a request flying about).  m.set({x, y, s, o, tone})  x, y = CENTRE
   2. PROGRESS BAR
        const b = D2.bar(parent, {x, y, w: 600, h: 56, tone: "orange"});   a track with a tone-coloured fill and a label inside on the left
            b.set({p: 0..1, tone, text: "62%", k, o, x, y})
   3. MOVING THINGS ALONG A BOWED ARROW
        D2.bez([x1, y1], [x2, y2], bow, f) -> {x, y}: the point at fraction f (0..1) of the curve VID.l5.arrow(x1, y1, x2, y2, tone, 1, {bow}) draws
        (bow = 0 is a straight line; the curve peaks at `bow` px to the left of the direction of travel). Use it to fly a D2.token
        along an arrow you drew with L5.arrow (the arrow's head is shortened a little, so end the token at f = 0.97).
        D2.lerp2(a, b, f) -> {x, y} the straight-line point between two [x, y]/{x, y} points.
   4. ICONS  (SVG <g>, append to your own L5.svg(parent) layer; drawn at absolute coordinates (x, y = centre), so V.place(g, {x, y, s, r, o})
      moves and scales them; opt.col is "ink" (default, for a tinted face), "on" (for a solid face) or "c" (the saturated fill);
      opt.fill = any CSS colour (e.g. "var(--ic)") overrides it, and opt.hole = the colour of the cut-outs (windows, the pin's hole), default var(--panel))
        D2.icon.person(x, y, size, tone = "grey", opt)    head and shoulders (a person, an avatar)
        D2.icon.pin(x, y, size, tone, opt)                a map pin (a city)
        D2.icon.building(x, y, size, tone, opt)           an office block with windows (a company)
        D2.icon.braces(x, y, size, tone, opt)             two curly braces (a document)
        VID.l5.tick / cross / arrow / drawOn / badge / svg  come from l5 (tick and cross are drawn on with L5.drawOn(g, k)).
   5. TIMING TOOLS
        D2.seq(t, t0, step, dur, i) -> 0..1: the ramp of the i-th item of a staggered list (item i runs from t0 + i * step for dur seconds). Ease it yourself.
        D2.pop(k) -> {s, o, y}: a pop-in (scale 0.5 -> 1 with E.pop, opacity, a small rise) to pass to V.place. */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  const L5 = V.l5;
  const { clamp, ease: E } = V;

  const f1 = (n) => n.toFixed(1);
  D2.TONES = ["green", "red", "orange", "blue", "purple", "grey"];
  const tn = (t) => {
    if (!D2.TONES.includes(t)) throw new Error(`VID.d2: unknown tone "${t}" (use ${D2.TONES.join(", ")})`);
    return t;
  };
  D2.tone = (name) => L5.tone(tn(name));
  const abs = (x, y, w, h) => {
    const st = { position: "absolute", left: `${f1(x)}px`, top: `${f1(y)}px` };
    if (w != null) st.width = `${f1(w)}px`;
    if (h != null) st.height = `${f1(h)}px`;
    return st;
  };
  const flex = { display: "flex", alignItems: "center", justifyContent: "center" };
  const setText = (el, text) => {
    if (text != null && el.textContent !== String(text)) el.textContent = String(text);
  };
  const setClass = (el, cls) => {
    if (el.className !== cls) el.className = cls;
  };
  const pt = (p) => (Array.isArray(p) ? { x: p[0], y: p[1] } : p);
  D2.seq = (t, t0, step, dur, i) => clamp((t - t0 - i * step) / dur);
  D2.tagW = (text, fs = 28) => Math.round(String(text).length * fs * 0.465 + 40);
  D2.pop = (k) => ({ s: 0.5 + 0.5 * E.pop(k), o: Math.min(1, k * 4), y: -(1 - E.out(k)) * 14 });
  D2.lerp2 = (a, b, f) => {
    const [p, q] = [pt(a), pt(b)];
    return { x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f };
  };
  D2.bez = (a, b, bow, f) => {
    const [p, q] = [pt(a), pt(b)];
    const len = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    const u = [(q.x - p.x) / len, (q.y - p.y) / len];
    const c = { x: (p.x + q.x) / 2 + u[1] * bow * 2, y: (p.y + q.y) / 2 - u[0] * bow * 2 };
    const g = 1 - f;
    return { x: g * g * p.x + 2 * g * f * c.x + f * f * q.x, y: g * g * p.y + 2 * g * f * c.y + f * f * q.y };
  };
  D2.u = { f1, abs, flex, setText, setClass, tn, pt };

  // ---------- 1. tags, cards, counters ----------
  const solidStyle = (on) => ({
    background: on ? "var(--c)" : "",
    borderColor: on ? "var(--c-lip)" : "",
    boxShadow: on ? "0 6px 0 var(--c-lip)" : "",
    color: on ? "var(--c-on)" : "",
  });
  function tag(parent, o = {}) {
    const el = V.h("div", {
      class: "v-tag",
      text: o.text || "",
      style: {
        ...abs(o.x || 0, o.y || 0),
        ...flex,
        fontSize: `${o.fs || 28}px`,
        ...(o.h ? { height: `${o.h}px` } : {}),
        ...(o.mono ? { fontFamily: "var(--mono)", fontWeight: "700" } : {}),
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
        fontSize: `${fs}px`,
        borderRadius: "22px",
        textAlign: "center",
        whiteSpace: "pre",
        lineHeight: "1.15",
        ...(o.mono ? { fontFamily: "var(--mono)", fontWeight: "700" } : {}),
      },
    });
    parent.append(el);
    return {
      el,
      set(st = {}) {
        const pl = st.plain ?? plain;
        setClass(el, `v-card${pl && !st.solid ? " plain" : ""} c-${tn(st.tone || base)}`);
        Object.assign(el.style, solidStyle(!!st.solid));
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
  function stat(parent, o = {}) {
    const { x = 0, y = 0, w = 300, h = 80, label = "total", tone: base = "blue" } = o;
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
        fontSize: `${Math.round(size * 0.5)}px`,
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
    const { tone: base = "blue", size = 30 } = o;
    const el = V.h("div", {
      class: `v-gene solid c-${tn(base)}`,
      style: { ...abs(0, 0, size, size), borderRadius: "50%", boxShadow: `0 ${Math.round(size / 8)}px 0 var(--c-lip)` },
    });
    parent.append(el);
    return {
      el,
      set(st = {}) {
        setClass(el, `v-gene solid c-${tn(st.tone || base)}`);
        el.style.left = `${f1((st.x || 0) - size / 2)}px`;
        el.style.top = `${f1((st.y || 0) - size / 2)}px`;
        V.place(el, { s: st.s ?? 1, o: st.o ?? 1 });
      },
    };
  }

  // ---------- 2. progress bar ----------
  function bar(parent, o = {}) {
    const { x = 0, y = 0, w = 600, h = 56, tone: base = "orange" } = o;
    const el = V.h("div", {
      class: `v-card plain c-${tn(base)}`,
      style: { ...abs(x, y, w, h), borderRadius: `${h / 2}px`, overflow: "hidden", boxShadow: "0 4px 0 var(--line-2)" },
    });
    const fill = V.h("div", {
      style: { ...abs(0, 0, 0, h - 6), background: "var(--c)", borderRadius: `${(h - 6) / 2}px` },
    });
    const label = V.h("div", {
      style: {
        ...abs(18, 0, w - 36, h - 6),
        ...flex,
        justifyContent: "flex-start",
        fontSize: "28px",
        fontWeight: "900",
      },
    });
    el.append(fill, label);
    parent.append(el);
    return {
      el,
      set(st = {}) {
        setClass(el, `v-card plain c-${tn(st.tone || base)}`);
        const p = clamp(st.p ?? 0);
        fill.style.width = `${f1(Math.max(0, (w - 6) * p))}px`;
        fill.style.visibility = p <= 0.002 ? "hidden" : "";
        label.style.color = p > 0.25 ? "var(--c-on)" : "var(--c-ink)";
        setText(label, st.text);
        const k = clamp(st.k ?? 1);
        V.place(el, { x: st.x || 0, y: st.y || 0, s: 0.9 + 0.1 * E.pop(k), o: Math.min(1, k * 4) * (st.o ?? 1) });
      },
    };
  }

  // ---------- 4. icons ----------
  const D = (...a) => a.map((q) => (typeof q === "number" ? f1(q) : q)).join(" ");
  const col = (tone, opt = {}) => {
    if (opt.fill) return opt.fill; // a CSS value or var(--x): lets one icon be recoloured from its parent's custom property
    const t = D2.tone(tone);
    return opt.col === "on" ? t.on : opt.col === "c" ? t.c : t.ink;
  };
  const icon = {
    person(x, y, s, tone = "grey", opt = {}) {
      const c = col(tone, opt);
      return V.s(
        "g",
        {},
        V.s("circle", { cx: f1(x), cy: f1(y - 0.2 * s), r: f1(0.2 * s), style: { fill: c } }),
        V.s("path", {
          d: D(
            "M",
            x - 0.38 * s,
            y + 0.42 * s,
            "Q",
            x - 0.38 * s,
            y + 0.1 * s,
            x,
            y + 0.1 * s,
            "Q",
            x + 0.38 * s,
            y + 0.1 * s,
            x + 0.38 * s,
            y + 0.42 * s,
            "Z",
          ),
          style: { fill: c },
        }),
      );
    },
    pin(x, y, s, tone = "grey", opt = {}) {
      const c = col(tone, opt);
      return V.s(
        "g",
        {},
        V.s("path", {
          d: D(
            "M",
            x,
            y + 0.46 * s,
            "C",
            x - 0.1 * s,
            y + 0.2 * s,
            x - 0.36 * s,
            y + 0.1 * s,
            x - 0.36 * s,
            y - 0.14 * s,
            "A",
            0.36 * s,
            0.36 * s,
            0,
            0,
            1,
            x + 0.36 * s,
            y - 0.14 * s,
            "C",
            x + 0.36 * s,
            y + 0.1 * s,
            x + 0.1 * s,
            y + 0.2 * s,
            x,
            y + 0.46 * s,
            "Z",
          ),
          style: { fill: c },
        }),
        V.s("circle", {
          cx: f1(x),
          cy: f1(y - 0.14 * s),
          r: f1(0.13 * s),
          style: { fill: opt.hole || "var(--panel)" },
        }),
      );
    },
    building(x, y, s, tone = "grey", opt = {}) {
      const c = col(tone, opt);
      const hole = opt.hole || "var(--panel)";
      const win = (dx, dy) =>
        V.s("rect", {
          x: f1(x + dx * s),
          y: f1(y + dy * s),
          width: f1(0.14 * s),
          height: f1(0.14 * s),
          rx: f1(0.03 * s),
          style: { fill: hole },
        });
      return V.s(
        "g",
        {},
        V.s("rect", {
          x: f1(x - 0.3 * s),
          y: f1(y - 0.44 * s),
          width: f1(0.6 * s),
          height: f1(0.9 * s),
          rx: f1(0.08 * s),
          style: { fill: c },
        }),
        win(-0.2, -0.32),
        win(0.06, -0.32),
        win(-0.2, -0.08),
        win(0.06, -0.08),
        V.s("rect", {
          x: f1(x - 0.08 * s),
          y: f1(y + 0.2 * s),
          width: f1(0.16 * s),
          height: f1(0.26 * s),
          rx: f1(0.03 * s),
          style: { fill: hole },
        }),
      );
    },
    braces(x, y, s, tone = "grey", opt = {}) {
      const c = col(tone, opt);
      const brace = (side) => {
        const [a, b] = [x + side * 0.12 * s, x + side * 0.3 * s];
        return V.s("path", {
          d: D(
            "M",
            a,
            y - 0.42 * s,
            "Q",
            b,
            y - 0.42 * s,
            b,
            y - 0.26 * s,
            "L",
            b,
            y - 0.1 * s,
            "Q",
            b,
            y,
            x + side * 0.4 * s,
            y,
            "Q",
            b,
            y,
            b,
            y + 0.1 * s,
            "L",
            b,
            y + 0.26 * s,
            "Q",
            b,
            y + 0.42 * s,
            a,
            y + 0.42 * s,
          ),
          fill: "none",
          "stroke-width": f1(0.1 * s),
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          style: { stroke: c },
        });
      };
      return V.s("g", {}, brace(-1), brace(1));
    },
  };
  D2.icon = icon;
  Object.assign(D2, { tag, card, stat, disc, token, bar });
})();
