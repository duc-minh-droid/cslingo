/* Lecture 11 · Distributed machine learning: the drawing pieces (VID.d11, short name D11). Needs videos/l5/common.js,
   videos/d4/common*.js and d11/common.js first. Positions are stage pixels (936 x 640, origin top-left).
   EVERY CALL IS PURE: call set() each frame from update(t) with everything you want to see; anything you leave out falls back
   to its default and nothing is remembered between frames. Tones are the video's colour roles (see common.js): grey machines,
   blue a machine's own data / computing (k-means: cluster 0), purple communication (scene 8: cluster 2), green the result,
   red idle / wrong, orange the sync point (k-means: cluster 1). All text is 28 px or more.
   Stickers come from VID.d4 (headers of videos/d4/common-2.js and common-3.js): D4.tag, D4.packet, D4.label, D4.disc, D4.card,
   D4.chips, D4.wire, D4.svg, D4.node (a server card with a name and a value: the video's machines), D4.at, D4.seq, D4.tagW;
   ticks, crosses and arrows from VID.l5 (L5.tick, L5.cross, L5.arrow, L5.drawOn): never glyphs.

   1. TIMELINE LANES  (scenes 4, 5 and 7: who computes, who talks, who waits; time runs left to right)
        const ln = D11.lanes(stage, {x: 12, y, w: 912, rows: ["A", "B"], T: 10, ticks: [0, 2, 4, 6, 8, 10], rowH: 60, gap: 14,
                                     nameW: 150, max: 24});
          names: plain 28 px text, right-aligned in the first nameW px; the time area runs from x + nameW + 14 to x + w - 20;
          the axis sits under the last row with 28 px tick labels ("0" ... "10 s": the last tick carries the unit).
          Total height ln.h = rows * (rowH + gap) + 48.
        ln.set({k: 1 (pops the whole thing), axes: 1 (0..1 fades the axis and tick labels in), names: 1,
                now: Infinity (sim seconds: every bar is drawn only up to `now`, so sweep it to play the timeline),
                cursor: false (true = a thin grey line at `now`),
                bars: [{row, a, b, kind: "work" | "comm" | "idle", text: "", tone (default work blue, comm purple, idle red),
                        k: 1 (0..1 pops this bar), o: 1}]   (D11.WAIT.rows / BAR / OVER / IDLE give rows of bars: flatten them
                        with D11.flat(rows) -> [{row, ...bar}]),
                marks: [{t, tone: "orange", text: "", k: 1, top: true (label above the rows; false = under the axis)}]})
            work and comm bars are solid stickers (fill, lip) with their text in the -on shade; idle bars are dashed red
            outlines with red ink text. A bar's text shows only once the bar is fully drawn and wide enough for it.
        ln.X(t) -> stage x of time t;  ln.rowY(i) -> stage y of row i's centre;  ln.top, ln.bottom (of the rows), ln.axisY
   2. SCATTER PLANE  (scene 8: the 45 points and three centres; coordinates 0..1 as in D11.KM)
        const pl = D11.plane(stage, {x, y, w, h, xr: [0.08, 0.9], yr: [0.2, 0.95], n: 45});   a framed panel
        pl.set({k: 1, pts: [{at: [x, y], tone: "grey", r: 11, s: 1, o: 1}], centres: [{at, tone, k: 1, s: 1}] (crosses with
                a panel halo, size 26), trails: [{pts: [[x, y] ...], tone, k: 1, o: 1}] (dashed paths, k 0..1 draws them on)})
        pl.pt(vx, vy) -> {x, y} stage px
   3. NUMBER LINE  (scenes 9 to 11: the 1-D MapReduce example)
        const nl = D11.numline(stage, {x, y, w, lo: 0, hi: 15, ticks: [0, 5, 10, 15], labels: true});  y = the line's height;
          ticks get 28 px labels 44 px under the line unless labels: false (then spans can use that room). Samples one unit
          apart need about 38 px per unit (w 600 for 0..15) so that two r 19 dots do not overlap.
        nl.set({k: 1, axis: 1, dots: [{v, tone: "grey", r: 19, text: String(v), s: 1, o: 1, dy: 0}] (samples on the line,
                their value inside in 28 px), centres: [{v, tone, text: "c0 = 2", k: 1, s: 1}] (a triangle pointing down at
                the line from 34 px above it, the text above that: the whole marker reaches about 92 px above the line),
                spans: [{a, b, tone: "grey", dy: 44, text: "", k: 1, o: 1, dash: false}] (a bracket from a to b, dy px BELOW
                the line, its text 30 px under it (baseline): a distance; k draws it from a towards b, the text shows at k 1)})
        nl.X(v) -> stage x;  nl.y
   4. FLIGHTS  (packets between machines)
        D11.edge(f, w = 6) -> 0..1: opacity of a packet at fraction f of its trip (fades in over the first 1/w and out over
            the last 1/w, so it never sits on the card it leaves or reaches).
        D11.fly(pk, a, b, k, {bow: 0, keep: false, s: 1}) moves a D4.packet / D4.tag made WITHOUT x, y along a -> b ({x, y}
            stage px) at k 0..1 (ease it yourself) with the edge fade; outside 0 < k < 1 it is hidden, unless keep: true
            (then it rests at b once k >= 1). Returns the {x, y} it used.
        D11.flat(rows) -> [{row: i, a, b, kind, text}] every bar of D11.*.rows with its row index. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D11 = V.d11;
  const { clamp, ease: E } = V;
  const T = D4.tone;
  const f1 = (n) => (+n).toFixed(1);
  const KIND = { work: "blue", comm: "purple", idle: "red" };

  D11.flat = (rows) => rows.flatMap((r, i) => r.bars.map((b) => ({ row: i, ...b })));
  D11.edge = (f, w = 6) => clamp(Math.min(f, 1 - f) * w);
  D11.fly = (pk, a, b, k, o = {}) => {
    const p = D4.at(a, b, k, o.bow || 0);
    const live = k > 0 && k < 1;
    const rest = o.keep && k >= 1;
    pk.set({ x: p.x, y: p.y, s: o.s ?? 1, k: live || rest ? 1 : 0, o: live ? D11.edge(k) : rest ? 1 : 0 });
    return p;
  };

  const absBox = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(Math.max(0, w))}px`,
    height: `${f1(h)}px`,
  });

  // ---------- 1. timeline lanes ----------
  function lanes(stage, o = {}) {
    const { x = 12, y = 12, w = 912, rows = [], T: Tmax = 10, rowH = 60, gap = 14, nameW = 150, max = 24 } = o;
    const ticks = o.ticks || [0, Tmax];
    const x0 = x + nameW + 14;
    const x1 = x + w - 20;
    const X = (t) => x0 + (clamp(t, 0, Tmax) / Tmax) * (x1 - x0);
    const rowTop = (i) => y + i * (rowH + gap);
    const rowY = (i) => rowTop(i) + rowH / 2;
    const bottom = rowTop(rows.length) - gap;
    const axisY = bottom + 10;
    const root = V.h("div", { style: { position: "absolute", left: "0px", top: "0px" } });
    stage.append(root);
    const names = rows.map((n, i) => {
      const el = V.h("div", {
        class: "v-text",
        text: n,
        style: { ...absBox(x, rowY(i) - 20, nameW, 40), fontSize: "30px", lineHeight: "40px", textAlign: "right" },
      });
      el.style.fontWeight = "900";
      el.style.color = "var(--text-dim)";
      root.append(el);
      return el;
    });
    const axis = V.h("div", {
      style: { ...absBox(x0, axisY, x1 - x0, 4), background: "var(--line-2)", borderRadius: "2px" },
    });
    root.append(axis);
    const tickEls = ticks.map((t, i) => {
      const el = V.h("div", {
        class: "v-text",
        text: i === ticks.length - 1 ? `${t} s` : `${t}`,
        style: { ...absBox(X(t) - 60, axisY + 6, 120, 36), fontSize: "28px", lineHeight: "36px", textAlign: "center" },
      });
      el.style.color = "var(--text-dim)";
      root.append(el);
      return el;
    });
    const barEls = Array.from({ length: max }, () => {
      const el = V.h("div", {
        class: "c-blue",
        style: {
          position: "absolute",
          boxSizing: "border-box",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "28px",
          fontWeight: "900",
          whiteSpace: "nowrap",
          overflow: "hidden",
        },
      });
      root.append(el);
      return el;
    });
    const markEls = Array.from({ length: 4 }, () => {
      const line = V.h("div", { style: { position: "absolute", borderRadius: "3px" } });
      const tag = D4.tag(root, { tone: "orange", solid: true });
      root.append(line);
      return { line, tag };
    });
    const cursor = V.h("div", { style: { position: "absolute", width: "4px", background: "var(--text-dim)" } });
    root.append(cursor);

    return {
      el: root,
      X,
      rowY,
      top: y,
      bottom,
      axisY,
      h: bottom - y + 58,
      set(st = {}) {
        const k = clamp(st.k ?? 1);
        V.place(root, { o: k, y: (1 - k) * 12 });
        const ax = clamp(st.axes ?? 1);
        axis.style.opacity = f1(ax);
        tickEls.forEach((el) => (el.style.opacity = f1(ax)));
        names.forEach((el) => (el.style.opacity = f1(clamp(st.names ?? 1))));
        const now = st.now ?? Infinity;
        const bars = st.bars || [];
        if (bars.length > max) throw new Error(`VID.d11.lanes: ${bars.length} bars, made for ${max} (raise max)`);
        barEls.forEach((el, i) => {
          const b = bars[i];
          const bk = b ? clamp(b.k ?? 1) : 0;
          const end = b ? Math.min(b.b, now) : 0;
          if (!b || bk <= 0 || end <= b.a) {
            el.style.display = "none";
            return;
          }
          el.style.display = "flex";
          const kind = b.kind || "work";
          const tone = b.tone || KIND[kind];
          const idle = kind === "idle";
          const cls = `c-${tone}`;
          if (el.className !== cls) el.className = cls;
          const left = X(b.a);
          const wpx = X(end) - left;
          const hpx = rowH - 8;
          Object.assign(el.style, absBox(left + 2, rowY(b.row) - hpx / 2, wpx - 4, hpx));
          el.style.background = idle ? "transparent" : "var(--c)";
          el.style.border = idle ? "3px dashed var(--c)" : "3px solid var(--c-lip)";
          el.style.boxShadow = idle ? "none" : "0 4px 0 var(--c-lip)";
          el.style.color = idle ? "var(--c-ink)" : "var(--c-on)";
          const full = now >= b.b;
          const txt = b.text || "";
          const fits = txt && D4.tagW(txt, 28) - 30 <= wpx - 8;
          el.textContent = full && fits ? txt : "";
          el.style.opacity = f1(Math.min(1, bk * 3) * (b.o ?? 1));
          el.style.transform = `scaleY(${f1(0.6 + 0.4 * E.out(bk))})`;
        });
        const marks = st.marks || [];
        markEls.forEach((m, i) => {
          const mk = marks[i];
          const mkK = mk ? clamp(mk.k ?? 1) : 0;
          if (!mk || mkK <= 0) {
            m.line.style.display = "none";
            m.tag.set({ k: 0, text: "" });
            return;
          }
          const tone = mk.tone || "orange";
          const mx = X(mk.t);
          const top = y - 8;
          const len = (axisY + 4 - top) * E.out(mkK);
          m.line.style.display = "block";
          Object.assign(m.line.style, absBox(mx - 3, top, 6, len));
          m.line.style.background = T(tone).c;
          const above = mk.top !== false;
          if (mk.text) m.tag.set({ text: mk.text, tone, solid: true, x: mx, y: above ? top - 26 : axisY + 66, k: mkK });
          else m.tag.set({ k: 0, text: "" });
        });
        const showCur = st.cursor && Number.isFinite(now) && now > 0 && now < Tmax;
        cursor.style.display = showCur ? "block" : "none";
        if (showCur) Object.assign(cursor.style, absBox(X(now) - 2, y - 6, 4, axisY - y + 10));
      },
    };
  }
  D11.lanes = lanes;

  // ---------- 2. scatter plane (2-D k-means) ----------
  function plane(stage, o = {}) {
    const { x = 12, y = 12, w = 600, h = 600, xr = [0.08, 0.9], yr = [0.2, 0.95], n = 45 } = o;
    const pad = 18;
    const pt = (vx, vy) => ({
      x: x + pad + ((vx - xr[0]) / (xr[1] - xr[0])) * (w - 2 * pad),
      y: y + h - pad - ((vy - yr[0]) / (yr[1] - yr[0])) * (h - 2 * pad),
    });
    const svg = D4.svg(stage);
    const frame = V.s("rect", {
      x: f1(x),
      y: f1(y),
      width: f1(w),
      height: f1(h),
      rx: "26",
      fill: "var(--panel-2)",
      stroke: "var(--line-2)",
      "stroke-width": "3",
    });
    const trails = [0, 1, 2].map(() =>
      V.s("path", { fill: "none", "stroke-width": "5", "stroke-dasharray": "10 9", "stroke-linecap": "round" }),
    );
    const dots = Array.from({ length: n }, () => V.s("circle", { "stroke-width": "3" }));
    const crosses = [0, 1, 2].map(() => {
      const halo = V.s("path", {
        stroke: "var(--panel)",
        "stroke-width": "16",
        "stroke-linecap": "round",
        fill: "none",
      });
      const body = V.s("path", { "stroke-width": "9", "stroke-linecap": "round", fill: "none" });
      return { g: V.s("g", {}, halo, body), halo, body };
    });
    const g = V.s("g", {}, frame, ...trails, ...dots, ...crosses.map((c) => c.g));
    svg.append(g);
    return {
      svg,
      pt,
      set(st = {}) {
        const k = clamp(st.k ?? 1);
        g.style.opacity = f1(k);
        const ps = st.pts || [];
        dots.forEach((d, i) => {
          const p = ps[i];
          if (!p || (p.o ?? 1) <= 0 || (p.s ?? 1) <= 0) {
            d.style.display = "none";
            return;
          }
          d.style.display = "";
          const q = pt(p.at[0], p.at[1]);
          const tone = T(p.tone || "grey");
          d.setAttribute("cx", f1(q.x));
          d.setAttribute("cy", f1(q.y));
          d.setAttribute("r", f1((p.r || 11) * (p.s ?? 1)));
          d.style.fill = tone.c;
          d.style.stroke = "var(--panel)";
          d.style.opacity = f1(p.o ?? 1);
        });
        const tr = st.trails || [];
        trails.forEach((path, i) => {
          const t = tr[i];
          if (!t || !t.pts || t.pts.length < 2 || (t.k ?? 1) <= 0) {
            path.style.display = "none";
            return;
          }
          path.style.display = "";
          path.setAttribute("d", t.pts.map((p, j) => `${j ? "L" : "M"}${f1(pt(...p).x)} ${f1(pt(...p).y)}`).join(""));
          path.style.stroke = T(t.tone || "grey").c;
          path.style.opacity = f1(clamp(t.k ?? 1) * (t.o ?? 1));
        });
        const cs = st.centres || [];
        crosses.forEach((c, i) => {
          const cc = cs[i];
          const ck = cc ? clamp(cc.k ?? 1) : 0;
          if (!cc || ck <= 0) {
            c.g.style.display = "none";
            return;
          }
          c.g.style.display = "";
          const q = pt(cc.at[0], cc.at[1]);
          const r = 15 * (cc.s ?? 1) * (0.6 + 0.4 * E.pop(ck));
          const d = `M${f1(q.x - r)} ${f1(q.y - r)}L${f1(q.x + r)} ${f1(q.y + r)}M${f1(q.x + r)} ${f1(q.y - r)}L${f1(q.x - r)} ${f1(q.y + r)}`;
          c.halo.setAttribute("d", d);
          c.body.setAttribute("d", d);
          c.body.style.stroke = T(cc.tone || "grey").c;
          c.g.style.opacity = f1(Math.min(1, ck * 3));
        });
      },
    };
  }
  D11.plane = plane;

  // ---------- 3. number line (1-D MapReduce example) ----------
  function numline(stage, o = {}) {
    const { x = 12, y = 320, w = 600, lo = 0, hi = 15, labels = true } = o;
    const ticks = o.ticks || [lo, hi];
    const X = (v) => x + 24 + ((v - lo) / (hi - lo)) * (w - 48);
    const svg = D4.svg(stage);
    const axis = V.s("line", {
      x1: f1(x),
      x2: f1(x + w),
      y1: f1(y),
      y2: f1(y),
      stroke: "var(--line-2)",
      "stroke-width": "5",
      "stroke-linecap": "round",
    });
    const tickG = ticks.map((v) =>
      V.s(
        "g",
        {},
        V.s("line", {
          x1: f1(X(v)),
          x2: f1(X(v)),
          y1: f1(y - 9),
          y2: f1(y + 9),
          stroke: "var(--line-2)",
          "stroke-width": "4",
        }),
        V.s("text", {
          x: f1(X(v)),
          y: f1(y + 44),
          "text-anchor": "middle",
          style: "font: 800 28px var(--sans, Nunito); fill: var(--text-dim)",
          text: String(v),
        }),
      ),
    );
    tickG.forEach((g, i) => {
      g.lastChild.textContent = String(ticks[i]);
      if (!labels) g.lastChild.style.display = "none";
    });
    const spans = Array.from({ length: 8 }, () => {
      const line = V.s("path", { fill: "none", "stroke-width": "4", "stroke-linecap": "round" });
      const text = V.s("text", { "text-anchor": "middle", style: "font: 900 28px var(--sans, Nunito)" });
      return { g: V.s("g", {}, line, text), line, text };
    });
    const centres = Array.from({ length: 4 }, () => {
      const tri = V.s("path", { "stroke-width": "3", "stroke-linejoin": "round" });
      const text = V.s("text", { "text-anchor": "middle", style: "font: 900 28px var(--sans, Nunito)" });
      return { g: V.s("g", {}, tri, text), tri, text };
    });
    const dots = Array.from({ length: 8 }, () => {
      const c = V.s("circle", { "stroke-width": "3" });
      const text = V.s("text", {
        "text-anchor": "middle",
        "dominant-baseline": "central",
        style: "font: 900 28px var(--sans, Nunito)",
      });
      return { g: V.s("g", {}, c, text), c, text };
    });
    const axisG = V.s("g", {}, axis, ...tickG);
    const g = V.s("g", {}, axisG, ...spans.map((s) => s.g), ...centres.map((c) => c.g), ...dots.map((d) => d.g));
    svg.append(g);
    const setText = (el, s) => {
      if (el.textContent !== s) el.textContent = s;
    };
    return {
      svg,
      X,
      y,
      set(st = {}) {
        g.style.opacity = f1(clamp(st.k ?? 1));
        axisG.style.opacity = f1(clamp(st.axis ?? 1));
        const ds = st.dots || [];
        dots.forEach((d, i) => {
          const p = ds[i];
          const s = p ? (p.s ?? 1) : 0;
          if (!p || s <= 0 || (p.o ?? 1) <= 0) {
            d.g.style.display = "none";
            return;
          }
          d.g.style.display = "";
          const tone = T(p.tone || "grey");
          const cx = X(p.v);
          const cy = y + (p.dy || 0);
          const r = (p.r || 19) * s;
          d.c.setAttribute("cx", f1(cx));
          d.c.setAttribute("cy", f1(cy));
          d.c.setAttribute("r", f1(r));
          d.c.style.fill = p.tone && p.tone !== "grey" ? tone.c : "var(--panel)";
          d.c.style.stroke = p.tone && p.tone !== "grey" ? tone.lip : "var(--line-2)";
          d.text.setAttribute("x", f1(cx));
          d.text.setAttribute("y", f1(cy + 1));
          d.text.style.fill = p.tone && p.tone !== "grey" ? tone.on : "var(--ink)";
          d.text.style.fontSize = `${f1(28 * Math.max(1, s))}px`;
          setText(d.text, p.text ?? String(p.v));
          d.g.style.opacity = f1(p.o ?? 1);
        });
        const cs = st.centres || [];
        centres.forEach((c, i) => {
          const m = cs[i];
          const k = m ? clamp(m.k ?? 1) : 0;
          if (!m || k <= 0) {
            c.g.style.display = "none";
            return;
          }
          c.g.style.display = "";
          const tone = T(m.tone || "grey");
          const cx = X(m.v);
          const tip = y - 34;
          const sz = 18 * (m.s ?? 1) * (0.6 + 0.4 * E.pop(k));
          c.tri.setAttribute(
            "d",
            `M${f1(cx)} ${f1(tip)}L${f1(cx - sz)} ${f1(tip - 1.6 * sz)}L${f1(cx + sz)} ${f1(tip - 1.6 * sz)}Z`,
          );
          c.tri.style.fill = tone.c;
          c.tri.style.stroke = tone.lip;
          c.text.setAttribute("x", f1(cx));
          c.text.setAttribute("y", f1(tip - 1.6 * sz - 12));
          c.text.style.fill = tone.ink;
          setText(c.text, m.text || "");
          c.g.style.opacity = f1(Math.min(1, k * 3));
        });
        const ss = st.spans || [];
        spans.forEach((s, i) => {
          const m = ss[i];
          const k = m ? clamp(m.k ?? 1) : 0;
          if (!m || k <= 0) {
            s.g.style.display = "none";
            return;
          }
          s.g.style.display = "";
          const tone = T(m.tone || "grey");
          const yy = y + (m.dy ?? 44);
          const a = X(m.a);
          const b = a + (X(m.b) - a) * E.out(k);
          s.line.setAttribute("d", `M${f1(a)} ${f1(yy - 10)}V${f1(yy)}H${f1(b)}V${f1(yy - 10)}`);
          s.line.style.stroke = m.tone === "grey" || !m.tone ? "var(--line-2)" : tone.c;
          s.line.style.strokeDasharray = m.dash ? "8 7" : "none";
          s.text.setAttribute("x", f1((a + X(m.b)) / 2));
          s.text.setAttribute("y", f1(yy + 30));
          s.text.style.fill = m.tone === "grey" || !m.tone ? "var(--text-dim)" : tone.ink;
          setText(s.text, k >= 1 ? m.text || "" : "");
          s.g.style.opacity = f1(m.o ?? 1);
        });
      },
    };
  }
  D11.numline = numline;
})();
