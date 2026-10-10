/* Phase 8 · Cryptography & Blockchain (video algo-8): basic drawing pieces (VID.a8, short name A8): tags and tiles, people,
   icons, the open wire, paint pots and drops, arrows with corners. Needs videos/l5/common.js and a8/common.js loaded first (see
   videos/algo-8.html). Positions are the parent's pixels (stage 936 x 640, origin top-left). EVERY set() CALL IS PURE: call it
   each frame from your scene's update(t) with everything you want to see; anything you leave out falls back to its default;
   nothing is remembered between frames.

   TONES (colour roles of THIS video): "blue" PUBLIC (anything Eve can see: public numbers, the public lock, what crosses the wire,
   fingerprints), "purple" SECRET (private numbers and keys, secret paint: always with a lock icon or a dashed purple frame),
   "green" agreed / valid / unlocked / sealed, "red" Eve and everything broken (her disc and copies, a link that no longer
   matches, a failed guess), "orange" attention (the thing that changed, the guesses being tried), "grey" neutral.

   Every handle below takes x, y in set(): where it is DRAWN (default = where it was built); dx, dy = an extra offset from that.
   s = scale, r = rotation in degrees, o = opacity, k = 0..1 pop-in (scale 0.8 -> 1 with a little spring, fades in).
   Tags, icons, people and pots are placed by their CENTRE (tags also with anchor "l" = x is the left edge, "r" = right edge,
   "tl" = top-left corner); blocks, tables, grids and bars (common-3.js) by their top-left corner.

   A8.tag(parent, {x, y, text, html, tone = "grey", solid = false, fs = 28, mono = false, box = false, w, h, anchor = "c"}) -> t
       a pill sticker (.v-tag); box = a rounded rectangle instead of a pill (use it for two-line tiles: text may contain "\n");
       w, h fix the size (the text is centred), otherwise it fits the text. Keep every label at fs >= 28.
       t.set({text, html, tone, solid, ghost, x, y, dx, dy, s, r, o, k})     ghost = dashed outline, no fill.   t.el the element.
   A8.pow(base, exp, fs = 44) -> html for "5 to the power 6" with the exponent raised and at least 28 px (pass it as {html}).
   A8.textW(text, fs = 28, mono = false) -> a rough width in px (to lay out a row of tags: there is no DOM measuring).
   A8.person(parent, {x, y, who = "alice" | "bob" | "eve", r = 38, name = "right" | "left" | "below" | "none"}) -> p
       a round letter sticker (A, B or E) with the name (28 px) beside it. Alice and Bob are grey, Eve is solid red.
       p.set({x, y, dx, dy, s, o, k, tone}).   x, y = the disc centre.   p.r the radius.
   A8.icon(parent, name, {x, y, size = 56, tone = "grey", disc = false}) -> i
       names: "lock" "key" "eye" "qmark" "plus" "equals" "tick" "cross" "arrow" (points right; rotate with r).
       disc: true puts the glyph on a round white-free sticker (panel fill, tone rim), good for badges.
       i.set({x, y, dx, dy, s, r, o, tone, k, draw, open})   k 0..1 pops it in; draw 0..1 draws a tick / cross / arrow on
       (default 1); open 0..1 opens a "lock" (0 closed, 1 open: the shackle lifts and swings).   i.el the <svg>.
   A8.wire(parent, {x, y, w, h = 34}) -> wi      the open channel: a pale rounded band with a dashed middle line, left end at x,
       centred on y.   wi.set({k = 1 (how much of its length is drawn, growing from the left), o}).
   A8.pot(parent, {x, y, r = 44}) -> p            a paint pot: a round sticker filled with the average of its paints.
       p.set({drops: ["P", "A"], x, y, dx, dy, s, o, k, frame: null | "purple" | "blue" | ..., frameK = 1, ghost})
       drops = paint keys of A8.PAINT.paints (P public gold, A Alice's secret rose, B Bob's secret blue); the colour is the
       average of the drops (a pot of P and A is orange, P and B green, P, A and B tan: the same for every order). frame = a
       dashed rounded frame round the pot (purple = kept secret, blue = public). ghost = dashed empty pot.   p.r the radius.
   A8.drop(parent, {x, y, r = 18, paint = "A"}) -> d      a small round blob of one paint to fly into a pot: d.set({x, y, dx, dy, s, o, paint}).
   A8.paintRgb(drops) -> {fill, edge} CSS colours for a list of paint keys.
   A8.link(parent, {pts: [[x, y], ...], tone = "blue", w = 6, head = 18}) -> l   an arrow along a polyline with corners.
       l.set({k = 1 (0..1 how much is drawn; the head appears at the end), tone, o, dash}).   l.len its length in px.
   A8.pt(x, y) -> {x, y} (just for readability). */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const f1 = (n) => n.toFixed(1);
  const px = (n) => `${f1(n)}px`;
  const TONES = ["grey", "green", "blue", "red", "orange", "purple"];
  const tn = (t) => {
    if (!TONES.includes(t)) throw new Error(`VID.a8: unknown tone "${t}" (use ${TONES.join(", ")})`);
    return t;
  };
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = (s) => String(s).split("\n").map(esc).join("<br>");
  const flex = { display: "flex", alignItems: "center", justifyContent: "center" };
  const appear = (k) => ({ s: 0.8 + 0.2 * E.pop(clamp(k)), o: clamp(k * 4) });

  /* a 0 x 0 anchor at (x, y): everything is drawn around it, and V.place on it moves / scales / fades the whole handle */
  function anchor(parent, x, y) {
    const outer = V.h("div", { style: { position: "absolute", left: px(x), top: px(y), width: "0px", height: "0px" } });
    parent.append(outer);
    const home = { x, y };
    const place = (st) => {
      const k = st.k == null ? 1 : st.k;
      const a = appear(k);
      V.place(outer, {
        x: (st.x == null ? home.x : st.x) - home.x + (st.dx || 0),
        y: (st.y == null ? home.y : st.y) - home.y + (st.dy || 0),
        s: (st.s == null ? 1 : st.s) * a.s,
        r: st.r || 0,
        o: (st.o == null ? 1 : st.o) * a.o,
      });
    };
    return { outer, place };
  }
  const SHIFT = { c: "translate(-50%, -50%)", l: "translate(0, -50%)", r: "translate(-100%, -50%)", tl: "none" };

  // ---------- a rough text width ----------
  const textW = (text, fs = 28, mono = false) => {
    if (mono) return String(text).length * fs * 0.62;
    let w = 0;
    for (const c of String(text))
      w += /[A-Z]/.test(c) ? 0.68 : /[0-9]/.test(c) ? 0.62 : c === " " ? 0.3 : /[il.,:|!']/.test(c) ? 0.3 : 0.56;
    return w * fs;
  };
  /* base^exp as html, the exponent raised and 28 px at least */
  const pow = (base, exp, fs = 44) =>
    `${esc(base)}<span style="font-size:${Math.max(28, Math.round(fs * 0.64))}px;vertical-align:${Math.round(fs * 0.42)}px;line-height:0">${esc(exp)}</span>`;

  // ---------- tag ----------
  function tag(parent, o = {}) {
    const { outer, place } = anchor(parent, o.x || 0, o.y || 0);
    const fs = o.fs || 28;
    const el = V.h("div", {
      class: "v-tag",
      style: {
        left: "0px",
        top: "0px",
        transform: SHIFT[o.anchor || "c"],
        fontSize: px(fs),
        lineHeight: "1.12",
        textAlign: "center",
        ...flex,
        ...(o.mono ? { fontFamily: "var(--mono)", fontWeight: "700" } : {}),
        ...(o.box ? { borderRadius: "22px", padding: "8px 20px 9px" } : {}),
        ...(o.w ? { width: px(o.w) } : {}),
        ...(o.h ? { height: px(o.h) } : {}),
      },
    });
    outer.append(el);
    const mem = {};
    const base = { tone: o.tone || "grey", solid: !!o.solid };
    const put = (html) => {
      if (mem.html !== html) el.innerHTML = mem.html = html;
    };
    put(o.html != null ? o.html : lines(o.text || ""));
    return {
      el,
      outer,
      set(st = {}) {
        const tone = tn(st.tone || base.tone);
        const solid = st.solid == null ? base.solid : st.solid;
        const cls = `v-tag c-${tone}${solid && !st.ghost ? " solid" : ""}`;
        if (el.className !== cls) el.className = cls;
        el.style.boxShadow = st.ghost ? "none" : `0 4px 0 var(--${solid ? "c-lip" : "c-edge"})`;
        el.style.background = st.ghost ? "transparent" : "";
        el.style.borderStyle = st.ghost ? "dashed" : "";
        if (st.html != null) put(st.html);
        else if (st.text != null) put(lines(st.text));
        place(st);
      },
    };
  }

  // ---------- person ----------
  const WHO = {
    alice: ["A", "Alice", "grey", false],
    bob: ["B", "Bob", "grey", false],
    eve: ["E", "Eve", "red", true],
  };
  function person(parent, o = {}) {
    const [letter, name, tone0, solid0] = WHO[o.who || "alice"];
    const r = o.r || 38;
    const { outer, place } = anchor(parent, o.x || 0, o.y || 0);
    const disc = V.h("div", {
      class: `v-gene c-${tone0}${solid0 ? " solid" : ""}`,
      text: letter,
      style: {
        left: px(-r),
        top: px(-r),
        width: px(2 * r),
        height: px(2 * r),
        borderRadius: "50%",
        fontSize: px(r * 1.05),
      },
    });
    const at = o.name || "right";
    const pos = {
      right: { left: px(r + 14), top: "-19px" },
      left: { right: px(r + 14), top: "-19px" },
      below: { left: "0px", top: px(r + 14), transform: "translateX(-50%)" },
    }[at];
    const label = at === "none" ? null : V.h("div", { class: "v-text", text: name, style: pos });
    outer.append(disc);
    if (label) outer.append(label);
    return {
      el: outer,
      r,
      set(st = {}) {
        if (st.tone || st.solid != null) {
          const tone = tn(st.tone || tone0);
          disc.className = `v-gene c-${tone}${(st.solid == null ? solid0 : st.solid) ? " solid" : ""}`;
        }
        place(st);
      },
    };
  }

  // ---------- icons ----------
  const T = (name) => L5.tone(name);
  const css = (e, o) => (Object.assign(e.style, o), e);
  const SHAPES = {
    lock(svg) {
      const shackle = V.s("path", {
        d: "M15 23 V16 a9 9 0 0 1 18 0 V23",
        fill: "none",
        "stroke-width": 5.5,
        "stroke-linecap": "round",
      });
      const lip = V.s("rect", { x: 8, y: 25.5, width: 32, height: 20, rx: 7 });
      const body = V.s("rect", { x: 8, y: 22, width: 32, height: 20, rx: 7, "stroke-width": 3 });
      const hole = V.s("circle", { cx: 24, cy: 30.5, r: 3.4 });
      const stem = V.s("path", { d: "M24 32 V37", "stroke-width": 3.6, "stroke-linecap": "round" });
      svg.append(shackle, lip, body, hole, stem);
      css(shackle, { transformOrigin: "15px 23px" });
      return {
        colour(t) {
          css(shackle, { stroke: t.lip });
          css(lip, { fill: t.lip });
          css(body, { fill: t.c, stroke: t.lip });
          css(hole, { fill: t.on });
          css(stem, { stroke: t.on });
        },
        k(k) {
          shackle.style.transform = `translate(0px, ${f1(-6 * k)}px) rotate(${f1(-38 * k)}deg)`;
        },
      };
    },
    key(svg) {
      const d = ["M22.5 24 H43", "M35 24 V31", "M42 24 V29"];
      const bowLip = V.s("circle", { cx: 14, cy: 26.5, r: 8.5, fill: "none", "stroke-width": 5.5 });
      const lipPath = V.s("path", {
        d: d.map((s) => s.replace(/(\d+) (\d+)/g, (m, a, b) => `${a} ${+b + 2.5}`)).join(" "),
        fill: "none",
        "stroke-width": 5.5,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      });
      const bow = V.s("circle", { cx: 14, cy: 24, r: 8.5, fill: "none", "stroke-width": 5.5 });
      const shaft = V.s("path", {
        d: d.join(" "),
        fill: "none",
        "stroke-width": 5.5,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      });
      svg.append(bowLip, lipPath, bow, shaft);
      return {
        colour(t) {
          [bowLip, lipPath].forEach((e) => css(e, { stroke: t.lip }));
          [bow, shaft].forEach((e) => css(e, { stroke: t.c }));
        },
      };
    },
    eye(svg) {
      const out = V.s("path", {
        d: "M4 24 C12 9 36 9 44 24 C36 39 12 39 4 24 Z",
        "stroke-width": 3.5,
        "stroke-linejoin": "round",
      });
      const iris = V.s("circle", { cx: 24, cy: 24, r: 8.5, "stroke-width": 3 });
      const pupil = V.s("circle", { cx: 24, cy: 24, r: 3.6 });
      svg.append(out, iris, pupil);
      return {
        colour(t) {
          css(out, { fill: t.dim, stroke: t.lip });
          css(iris, { fill: t.c, stroke: t.lip });
          css(pupil, { fill: "var(--ink)" });
        },
      };
    },
    qmark(svg) {
      const q = V.s("path", {
        d: "M16 17 a8.5 8.5 0 1 1 13.5 6.8 c-3.2 2.4 -5.5 4 -5.5 8",
        fill: "none",
        "stroke-width": 6,
        "stroke-linecap": "round",
      });
      const dot = V.s("circle", { cx: 24, cy: 40.5, r: 3.8 });
      svg.append(q, dot);
      return { colour: (t) => (css(q, { stroke: t.c }), css(dot, { fill: t.c })) };
    },
    plus(svg) {
      const p = V.s("path", { d: "M24 10 V38 M10 24 H38", fill: "none", "stroke-width": 7, "stroke-linecap": "round" });
      svg.append(p);
      return { colour: (t) => css(p, { stroke: t.c }) };
    },
    equals(svg) {
      const p = V.s("path", { d: "M10 17 H38 M10 31 H38", fill: "none", "stroke-width": 7, "stroke-linecap": "round" });
      svg.append(p);
      return { colour: (t) => css(p, { stroke: t.c }) };
    },
  };
  /* tick, cross and arrow come from the l5 pictograms (they draw on with k) */
  const DRAWN = {
    tick: (n) => L5.tick(24, 24, 40, n, { w: 7 }),
    cross: (n) => L5.cross(24, 24, 40, n, { w: 7 }),
    arrow: (n) => L5.arrow(5, 24, 43, 24, n, 1, { w: 7, head: 17 }),
  };
  function icon(parent, name, o = {}) {
    if (!SHAPES[name] && !DRAWN[name]) throw new Error(`VID.a8.icon: unknown icon "${name}"`);
    const size = o.size || 56;
    const { outer, place } = anchor(parent, o.x || 0, o.y || 0);
    const svg = V.s("svg", {
      width: size,
      height: size,
      viewBox: "0 0 48 48",
      style: { position: "absolute", left: px(-size / 2), top: px(-size / 2), overflow: "visible" },
    });
    outer.append(svg);
    let ring = null;
    if (o.disc) {
      ring = V.s("circle", { cx: 24, cy: 24, r: 23, "stroke-width": 3, style: { fill: "var(--panel)" } });
      svg.append(ring);
    }
    const shape = SHAPES[name] ? SHAPES[name](svg) : null;
    const mem = {};
    let g = null;
    return {
      el: svg,
      set(s = {}) {
        const tone = tn(s.tone || o.tone || "grey");
        if (mem.tone !== tone) {
          mem.tone = tone;
          if (ring) css(ring, { stroke: T(tone).edge });
          if (shape) shape.colour(T(tone));
          else {
            if (g) g.remove();
            g = svg.appendChild(DRAWN[name](tone));
          }
        }
        if (shape && shape.k) shape.k(clamp(s.open || 0));
        if (g) L5.drawOn(g, s.draw == null ? 1 : s.draw);
        place(s);
      },
    };
  }

  // ---------- the open wire ----------
  function wire(parent, o = {}) {
    const h = o.h || 34;
    const band = V.h("div", {
      style: {
        position: "absolute",
        left: px(o.x || 0),
        top: px((o.y || 0) - h / 2),
        width: px(o.w || 600),
        height: px(h),
        boxSizing: "border-box",
        border: "3px solid var(--line-2)",
        borderRadius: px(h / 2),
        background: "var(--panel-2)",
      },
    });
    const dash = V.h("div", {
      style: {
        position: "absolute",
        left: "16px",
        right: "16px",
        top: "50%",
        height: "0px",
        marginTop: "-2px",
        borderTop: "4px dashed var(--line-2)",
      },
    });
    band.append(dash);
    parent.append(band);
    return {
      el: band,
      set(s = {}) {
        const k = s.k == null ? 1 : clamp(s.k);
        band.style.width = px(Math.max(h, (o.w || 600) * k));
        V.show(band, (s.o == null ? 1 : s.o) * (k > 0.001 ? 1 : 0));
      },
    };
  }

  // ---------- paint ----------
  let rgbCache = null;
  const tokenRgb = (name) => {
    if (!rgbCache) {
      const cs = getComputedStyle(document.documentElement);
      rgbCache = {};
      ["gold", "rose", "blue", "teal", "amber", "violet"].forEach((n) => {
        const hex = cs.getPropertyValue(`--${n}`).trim().replace("#", "");
        rgbCache[n] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
      });
    }
    return rgbCache[name];
  };
  const paintRgb = (drops) => {
    const rgbs = drops.map((d) => tokenRgb(A8.PAINT.paints[d]));
    const avg = [0, 1, 2].map((i) => rgbs.reduce((a, c) => a + c[i], 0) / rgbs.length);
    const edge = avg.map((v) => Math.round(v * 0.74));
    return { fill: `rgb(${avg.map(Math.round).join(",")})`, edge: `rgb(${edge.join(",")})` };
  };
  function pot(parent, o = {}) {
    const r = o.r || 44;
    const { outer, place } = anchor(parent, o.x || 0, o.y || 0);
    const fr = 2 * r + 34;
    const frame = V.h("div", {
      style: {
        position: "absolute",
        left: px(-fr / 2),
        top: px(-fr / 2),
        width: px(fr),
        height: px(fr),
        boxSizing: "border-box",
        borderRadius: "30px",
        border: "4px dashed var(--c)",
      },
    });
    const body = V.h("div", {
      style: {
        position: "absolute",
        left: px(-r),
        top: px(-r),
        width: px(2 * r),
        height: px(2 * r),
        boxSizing: "border-box",
        borderRadius: "50%",
        border: "4px solid",
      },
    });
    outer.append(frame, body);
    return {
      el: outer,
      r,
      set(s = {}) {
        const ghost = !!s.ghost || !s.drops || !s.drops.length;
        if (ghost) {
          css(body, {
            background: "transparent",
            borderStyle: "dashed",
            borderColor: "var(--line-2)",
            boxShadow: "none",
          });
        } else {
          const c = paintRgb(s.drops);
          css(body, { background: c.fill, borderStyle: "solid", borderColor: c.edge, boxShadow: `0 6px 0 ${c.edge}` });
        }
        const fk = s.frame ? clamp(s.frameK == null ? 1 : s.frameK) : 0;
        if (s.frame) frame.className = `c-${tn(s.frame)}`;
        V.place(frame, { s: 0.85 + 0.15 * E.pop(fk), o: fk });
        place(s);
      },
    };
  }
  function drop(parent, o = {}) {
    const r = o.r || 18;
    const { outer, place } = anchor(parent, o.x || 0, o.y || 0);
    const body = V.h("div", {
      style: {
        position: "absolute",
        left: px(-r),
        top: px(-r),
        width: px(2 * r),
        height: px(2 * r),
        boxSizing: "border-box",
        borderRadius: "50%",
        border: "3px solid",
      },
    });
    outer.append(body);
    return {
      el: outer,
      set(s = {}) {
        const c = paintRgb([s.paint || o.paint || "A"]);
        css(body, { background: c.fill, borderColor: c.edge });
        place(s);
      },
    };
  }

  // ---------- arrow along a polyline ----------
  function link(parent, o = {}) {
    const pts = o.pts;
    const [w, head] = [o.w || 6, o.head || 18];
    const svg = L5.svg(parent);
    const seg = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]);
    const len = seg.reduce((a, d) => a + Math.hypot(d[0], d[1]), 0);
    const last = seg[seg.length - 1];
    const ll = Math.hypot(last[0], last[1]) || 1;
    const u = [last[0] / ll, last[1] / ll];
    const tip = pts[pts.length - 1];
    const stop = [tip[0] - u[0] * head * 0.7, tip[1] - u[1] * head * 0.7];
    const body = pts.slice(0, -1).concat([stop]);
    const path = V.s("path", {
      d: `M${body.map((p) => `${f1(p[0])} ${f1(p[1])}`).join("L")}`,
      fill: "none",
      pathLength: "1",
      "stroke-width": w,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    });
    const n = [-u[1], u[0]];
    const hp = (a, b) => `${f1(tip[0] - u[0] * a + n[0] * b)} ${f1(tip[1] - u[1] * a + n[1] * b)}`;
    const tri = V.s("path", {
      d: `M${f1(tip[0])} ${f1(tip[1])}L${hp(head, head * 0.48)}L${hp(head, -head * 0.48)}Z`,
      "stroke-width": 3,
      "stroke-linejoin": "round",
    });
    svg.append(path, tri);
    return {
      el: svg,
      len,
      set(s = {}) {
        const k = clamp(s.k == null ? 1 : s.k);
        const col = T(tn(s.tone || o.tone || "blue")).c;
        const op = s.o == null ? 1 : s.o;
        css(path, {
          stroke: col,
          strokeDasharray: s.dash ? "0.03 0.03" : "1 1",
          strokeDashoffset: s.dash ? "0" : String(1 - k),
        });
        css(tri, { fill: col, stroke: col });
        V.show(path, k > 0.002 ? op : 0);
        V.show(tri, V.ramp(k, 0.82, 1, E.lin) * op);
      },
    };
  }

  Object.assign(A8, {
    TONES,
    tag,
    person,
    icon,
    wire,
    pot,
    drop,
    link,
    paintRgb,
    pow,
    textW,
    esc,
    pt: (x, y) => ({ x, y }),
  });
})();
