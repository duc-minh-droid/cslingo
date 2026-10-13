/* Algorithms Phase 1 (video algo-1): drawing helpers for webs and bars. Loaded right after common.js (see videos/algo-1.html).
   All coordinates are STAGE pixels (936 x 640, origin top-left). Every update call is PURE: call it every frame from your
   scene's update(t) with everything you want to see; anything you leave out falls back to its default; nothing is remembered.
   Tones: "green" "blue" "red" "orange" "purple" "grey" (the colour roles of the video, see the storyboard outline).

   A1.textW(text, fs = 28) -> estimated px width of bold Nunito text (used for pills and tags; there is no DOM measuring).
   A1.svgPill(parent, fs = 28) -> p   a small sticker pill inside an SVG <g> (28 px text by default, centred on x, y)
        p.set({ x, y, text, tone: "grey", look: "soft" | "solid", s: 1, o: 1 })    p.w(text) -> its width, p.g the <g>

   1. WEB  (a directed link graph: the leaky web, the trap web, the five-page web)
        const g = A1.web(stage, { web: A1.WEBS.leaky, x: 0, y: 10, w: 560, h: 440, r: 34,
                                  extra: [["D", "A"], ["D", "B"], ["D", "C"], ["D", "D"]],
                                  labels: { A: "below", B: "right" }, tags: { D: "below" } })
          web     one of A1.WEBS (names, edges, positions in a ref box web.ref, e.g. 560 x 440 for leaky)
          x y w h the box the web is fitted into (default: its ref size at 0, 0): positions are scaled uniformly (never up
                  by more than the box allows) and centred; the node RADIUS r (default 34) is not scaled
          extra   more edges, drawn only when you show them (see update), e.g. the dead end's pour edges. [a, a] is a self loop
                  (a small loop above the node; the packet runs round it)
          labels  where a node's value pill sits: "below" (default) | "above" | "left" | "right"   tags: same for its tag (default "above")
          loops   where a self-loop edge sits: { D: "below" } (default above the node)
        g.update({
          o: 1,                                    opacity of the whole web
          node: { A: { tone: "grey", look: "soft" | "solid", o: 1, s: 1,   s scales the CIRCLE only (letter stays 36 px)
                       dy: 0, pulse: 0..1,         a small bump (pass V.flash(t, a, b))
                       halo: 0..1,                 solid ring in the node's tone (attention)
                       ring: "red", rk: 0..1,      dashed ring in that tone, pops in with rk (the "dead end" look)
                       val: "12.5", valTone: "blue", valLook: "soft", valK: 0..1,     value pill (28 px) pops in with valK
                       tag: "dead end", tagTone: "red", tagK: 0..1 } },                 solid tag under/over the node
          edge: { AB: { o: 1, k: 1, tone: "grey", dash: false, w: 1 } },   key = from + to; k 0..1 draws the arrow on;
                                                   extra edges have o 0 unless you give them o; w is a width multiplier
          packets: [{ from: "A", to: "B", f: 0..1, tone: "blue", text: "12.5", size: 20, o: 1, s: 1 }],
                   a token travelling along edge from->to at fraction f (0 = leaving the node, 1 = arriving). With text it is a
                   solid pill (28 px) instead of a dot of diameter size. Up to 16 at once. The edge must exist (or throw).
        })
        g.pt(name) -> { x, y } node centre.   g.edgePt(a, b, f) -> { x, y } point of an edge (to put labels or pills on it).
        g.hasEdge(a, b) -> boolean (declared base or extra edge).
        g.r (radius), g.names, g.under (an SVG <g> below the arrows), g.overlay (an SVG <g> above everything: draw ring
        shapes, brackets, your own pills here), g.svg (the whole <svg>, full stage, overflow visible).
        Edges are straight and stop just outside the circles; when both directions exist (A->C and C->A) they run in two lanes.

   2. BARS  (horizontal bars with a name on the left and a number on the right)
        const b = A1.bars(stage, { x: 580, y: 30, w: 356, names: ["A", "B", "C", "D"], rowH: 62, max: 1,
                                   labelW: 50, valueW: 104, trackH: 30 })
        b.update({ vals: { A: 0.25 }, text: { A: "12.5" } (default: the value with 2 decimals), tone: "blue" | { A: "red" },
                   hi: ["C"] (these rows turn orange), ticks: { A: 0.49 }, tickTone: "green" (a mark across the track at that
                   value, e.g. the settled value), rowO: { A: 1 } (per row opacity), o: 1 })
        b.rowY(name) -> centre y of a row, b.xAt(value) -> stage x of a value on the track, b.trackW, b.left (x of the track start),
        b.height. The bar fill is a sticker (a fill plus a lip); a value of 0 draws no bar. Values are in 0..max. */
(function () {
  const V = window.VID;
  const A1 = V.a1;
  const T = V.l5.tone;
  const S = V.s;
  const { clamp } = V;
  const f1 = (n) => n.toFixed(1);
  const css = (e, o) => (Object.assign(e.style, o), e);
  const unit = (v) => [v[0] / (Math.hypot(v[0], v[1]) || 1), v[1] / (Math.hypot(v[0], v[1]) || 1)];

  /* rough width of bold Nunito text in px (uppercase and digits are wider than lower case) */
  function textW(text, fs = 28) {
    let em = 0;
    for (const ch of String(text)) {
      if (ch === " ") em += 0.28;
      else if ("ilj.,:;!|'’".includes(ch)) em += 0.3;
      else if ("mwMW".includes(ch)) em += 0.88;
      else if (/[A-Z0-9]/.test(ch)) em += 0.66;
      else if ("()+−×÷=<>→%".includes(ch)) em += 0.6;
      else em += 0.56;
    }
    return em * fs;
  }
  const pillW = (text, fs) => Math.max(fs + 22, textW(text, fs) + 30);

  function look(tn, lk) {
    const c = T(tn);
    if (lk === "solid") return { fill: c.c, stroke: c.lip, lip: c.lip, ink: c.on };
    return {
      fill: tn === "grey" ? "var(--panel)" : c.dim,
      stroke: c.edge,
      lip: c.edge,
      ink: tn === "grey" ? "var(--ink)" : c.ink,
    };
  }

  function svgPill(parent, fs = 28) {
    const hh = fs + 14;
    const lip = S("rect", { height: hh, rx: hh / 2 });
    const face = S("rect", { height: hh, rx: hh / 2, "stroke-width": 3 });
    const text = S("text", { "text-anchor": "middle", y: f1(fs * 0.35) });
    css(text, { fontSize: `${fs}px`, fontWeight: "900" });
    const g = S("g", {}, lip, face, text);
    parent.append(g);
    return {
      g,
      w: (t) => pillW(t, fs),
      set({ x = 0, y = 0, text: t = "", tone = "grey", look: lk = "soft", s = 1, o = 1 } = {}) {
        const w = pillW(t, fs);
        const l = look(tone, lk);
        for (const [e, dy] of [[lip, 3], [face, 0]]) {
          e.setAttribute("x", f1(-w / 2));
          e.setAttribute("y", f1(-hh / 2 + dy));
          e.setAttribute("width", f1(w));
        } // prettier-ignore
        css(face, { fill: l.fill, stroke: l.stroke });
        css(lip, { fill: l.lip });
        css(text, { fill: l.ink });
        if (text.textContent !== t) text.textContent = t;
        g.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(3)})`);
        V.show(g, o);
      },
    };
  }

  // ================= 1. web =================
  function web(parent, opt) {
    const def = opt.web;
    A1.must(def && def.names, "web: pass { web: A1.WEBS.leaky } (or trap, web5)");
    const box = { x: opt.x ?? 0, y: opt.y ?? 0, w: opt.w ?? def.ref[0], h: opt.h ?? def.ref[1] };
    const sc = Math.min(box.w / def.ref[0], box.h / def.ref[1]);
    const [ox, oy] = [box.x + (box.w - def.ref[0] * sc) / 2, box.y + (box.h - def.ref[1] * sc) / 2];
    const P = Object.fromEntries(def.names.map((k) => [k, [ox + def.pos[k][0] * sc, oy + def.pos[k][1] * sc]]));
    const r = opt.r ?? 34;
    const k0 = r / 34;
    const [HEAD, HW, SW, GAP, LANE, FS] = [20 * k0, 9 * k0, 6 * k0, 6 * k0, 22 * k0, 36 * k0];
    const edges = [...def.edges, ...(opt.extra || []).map((e) => [...e, true])].map(([a, b, hidden]) => ({
      a,
      b,
      key: a + b,
      hidden: !!hidden,
    }));
    edges.forEach((e) => A1.must(P[e.a] && P[e.b], `web: edge ${e.key} names a page that is not in the web`));
    const byKey = Object.fromEntries(edges.map((e) => [e.key, e]));

    const svg = S("svg", { width: 936, height: 640, viewBox: "0 0 936 640" });
    css(svg, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
    const [under, gEdges, gNodes, gLabels, gPackets, overlay] = [
      "under",
      "edges",
      "nodes",
      "labels",
      "packets",
      "overlay",
    ].map(() => svg.appendChild(S("g")));
    parent.append(svg);

    // ---- edge geometry: { len, pt(f), dir(f), line(f) }
    function geometry(e) {
      const [A, B] = [P[e.a], P[e.b]];
      if (e.a === e.b) {
        const rl = 22 * k0;
        const sgn = (opt.loops || {})[e.a] === "below" ? 1 : -1;
        const C = [A[0], A[1] + sgn * (r + rl - 8 * k0)];
        const th0 = (sgn < 0 ? Math.PI / 2 : -Math.PI / 2) + 0.75;
        const sweep = 2 * Math.PI - 1.5;
        const ang = (f) => th0 + f * sweep;
        const pt = (f) => [C[0] + rl * Math.cos(ang(f)), C[1] + rl * Math.sin(ang(f))];
        const line = (f) =>
          `M${pt(0).map(f1).join(" ")}A${f1(rl)} ${f1(rl)} 0 ${f * sweep > Math.PI ? 1 : 0} 1 ${pt(f).map(f1).join(" ")}`;
        return { len: rl * sweep, pt, dir: (f) => [-Math.sin(ang(f)), Math.cos(ang(f))], line };
      }
      const u = unit([B[0] - A[0], B[1] - A[1]]);
      const lane = byKey[e.b + e.a] ? LANE : 0;
      const nrm = [u[1] * lane, -u[0] * lane];
      const p0 = [A[0] + u[0] * (r + GAP) + nrm[0], A[1] + u[1] * (r + GAP) + nrm[1]];
      const p3 = [B[0] - u[0] * (r + GAP) + nrm[0], B[1] - u[1] * (r + GAP) + nrm[1]];
      const pt = (f) => [p0[0] + (p3[0] - p0[0]) * f, p0[1] + (p3[1] - p0[1]) * f];
      return {
        len: Math.hypot(p3[0] - p0[0], p3[1] - p0[1]),
        pt,
        dir: () => u,
        line: (f) => `M${p0.map(f1).join(" ")}L${pt(f).map(f1).join(" ")}`,
      };
    }
    edges.forEach((e) => {
      e.geo = geometry(e);
      e.line = gEdges.appendChild(S("path", { fill: "none", "stroke-linecap": "round" }));
      e.head = gEdges.appendChild(S("path", { "stroke-width": f1(3 * k0), "stroke-linejoin": "round" }));
    });
    const geoOf = (a, b) => {
      A1.must(byKey[a + b], `web.edgePt: the web has no edge ${a}${b} (declare it with extra: [["${a}", "${b}"]])`);
      return byKey[a + b].geo;
    };
    function paintEdge(e, f, colour, op, dash, wm) {
      const g = e.geo;
      const on = f > 0.001 && op > 0.001;
      V.show(e.head, on ? op : 0);
      if (!on) return V.show(e.line, 0);
      const hs = clamp((f * g.len) / (HEAD * 1.3));
      const [tip, dir] = [g.pt(f), g.dir(f)];
      const base = [tip[0] - dir[0] * HEAD * hs, tip[1] - dir[1] * HEAD * hs];
      const nrm = [-dir[1] * HW * hs, dir[0] * HW * hs];
      e.head.setAttribute(
        "d",
        `M${tip.map(f1).join(" ")}L${f1(base[0] + nrm[0])} ${f1(base[1] + nrm[1])}L${f1(base[0] - nrm[0])} ${f1(base[1] - nrm[1])}Z`,
      );
      css(e.head, { fill: colour, stroke: colour });
      const tl = f - (HEAD * 0.75 * hs) / g.len;
      e.line.setAttribute("d", g.line(Math.max(0.0001, tl)));
      e.line.setAttribute("stroke-width", f1(SW * wm));
      e.line.style.stroke = colour;
      e.line.style.strokeDasharray = dash ? `${f1(10 * k0)} ${f1(9 * k0)}` : "";
      V.show(e.line, tl > 0.003 ? op : 0);
    }

    // ---- nodes
    const nodes = {};
    def.names.forEach((k) => {
      const [x, y] = P[k];
      const halo = S("circle", { cx: x, cy: y, fill: "none" });
      const ring = S("circle", { cx: x, cy: y, fill: "none", "stroke-width": f1(5 * k0) });
      const lip = S("circle", { cx: x, cy: y + 4 * k0 });
      const face = S("circle", { cx: x, cy: y, "stroke-width": f1(4 * k0) });
      const text = S("text", { x, y: f1(y + FS * 0.36), "text-anchor": "middle" }, k);
      css(text, { fontSize: `${f1(FS)}px`, fontWeight: "900" });
      const g = gNodes.appendChild(S("g", {}, halo, ring, lip, face, text));
      nodes[k] = { g, halo, ring, lip, face, text, val: svgPill(gLabels), tag: svgPill(gLabels) };
    });
    const side = (at, x, y, rr, w, h) => {
      const gap = 10 * k0;
      if (at === "above") return [x, y - rr - gap - h / 2];
      if (at === "left") return [x - rr - gap - w / 2, y];
      if (at === "right") return [x + rr + gap + w / 2, y];
      return [x, y + rr + gap + h / 2];
    };

    function update(st = {}) {
      const ns = st.node || {};
      const es = st.edge || {};
      const whole = st.o ?? 1;
      V.show(svg, whole);
      edges.forEach((e) => {
        const s = es[e.key] || {};
        paintEdge(e, s.k ?? 1, T(s.tone || "grey").c, s.o ?? (e.hidden ? 0 : 1), !!s.dash, s.w ?? 1);
      });
      def.names.forEach((k) => {
        const s = ns[k] || {};
        const n = nodes[k];
        const [x, y] = P[k];
        const tn = s.tone || "grey";
        const l = look(tn, s.look || "soft");
        const rr = r * (s.s ?? 1) * (1 + 0.14 * (s.pulse || 0));
        const dy = s.dy || 0;
        css(n.face, { fill: l.fill, stroke: l.stroke });
        css(n.lip, { fill: l.lip });
        css(n.text, { fill: l.ink });
        n.face.setAttribute("r", f1(rr));
        n.lip.setAttribute("r", f1(rr));
        const hk = s.halo || 0;
        n.halo.setAttribute("r", f1(rr + 5 * k0 + 9 * k0 * hk));
        n.halo.setAttribute("stroke-width", f1(6 * k0 * (0.6 + 0.6 * hk)));
        css(n.halo, { stroke: T(tn).c, opacity: String(hk), visibility: hk > 0.001 ? "" : "hidden" });
        const rk = clamp(s.rk ?? 0);
        n.ring.setAttribute("r", f1(rr + 12 * k0 + (1 - rk) * 14 * k0));
        css(n.ring, {
          stroke: T(s.ring || "red").c,
          strokeDasharray: `${f1(9 * k0)} ${f1(8 * k0)}`,
          opacity: String(clamp(rk * 3)),
          visibility: rk > 0.001 ? "" : "hidden",
        });
        n.g.setAttribute("transform", `translate(0 ${f1(dy)})`);
        V.show(n.g, s.o ?? 1);
        const label = (pill, text, at, pk, tone, lk, def2) => {
          const w = pill.w(text || "");
          const [px, py] = side(at, x, y + dy, rr + (at === "below" || at === "above" ? 6 * k0 : 0), w, 42);
          const kk = clamp(pk ?? (text ? 1 : 0));
          pill.set({
            x: px,
            y: py,
            text: text || "",
            tone: tone || def2,
            look: lk,
            s: 0.7 + 0.3 * V.ease.pop(kk),
            o: text ? Math.min(1, kk * 4) * (s.o ?? 1) : 0,
          });
        };
        label(n.val, s.val, (opt.labels || {})[k] || "below", s.valK, s.valTone, s.valLook || "soft", "blue");
        label(n.tag, s.tag, (opt.tags || {})[k] || "above", s.tagK, s.tagTone, "solid", "red");
      });
      // packets
      slots.forEach((slot, i) => {
        const p = (st.packets || [])[i];
        if (!p) {
          slot.pill.set({ o: 0 });
          return V.show(slot.dot, 0);
        }
        const [px, py] = geoOf(p.from, p.to).pt(clamp(p.f ?? 0));
        const o = (p.o ?? 1) * whole;
        if (p.text) {
          V.show(slot.dot, 0);
          slot.pill.set({ x: px, y: py, text: p.text, tone: p.tone || "blue", look: "solid", s: p.s ?? 1, o });
        } else {
          slot.pill.set({ o: 0 });
          const rr = ((p.size ?? 20) / 2) * (p.s ?? 1);
          const l = look(p.tone || "blue", "solid");
          slot.face.setAttribute("r", f1(rr));
          slot.lip.setAttribute("r", f1(rr));
          for (const e of [slot.face, slot.lip]) e.setAttribute("cx", f1(px));
          slot.face.setAttribute("cy", f1(py));
          slot.lip.setAttribute("cy", f1(py + 3));
          css(slot.face, { fill: l.fill, stroke: l.stroke });
          css(slot.lip, { fill: l.lip });
          V.show(slot.dot, o);
        }
      });
    }
    const slots = Array.from({ length: 16 }, () => {
      const lip = S("circle");
      const face = S("circle", { "stroke-width": 3 });
      const dot = gPackets.appendChild(S("g", {}, lip, face));
      return { dot, lip, face, pill: svgPill(gPackets) };
    });

    return {
      svg, update, r, names: def.names, under, overlay,
      hasEdge: (a, b) => !!byKey[a + b],
      pt: (k) => ({ x: P[k][0], y: P[k][1] }),
      edgePt: (a, b, f) => {
        const [x, y] = geoOf(a, b).pt(clamp(f));
        return { x, y };
      },
    }; // prettier-ignore
  }

  // ================= 2. bars =================
  function bars(parent, opt) {
    const { x = 0, y = 0, w = 356, names, rowH = 62, labelW = 50, valueW = 104, max = 1, trackH = 30 } = opt;
    const trackW = w - labelW - valueW;
    const left = x + labelW;
    const svg = S("svg", { width: 936, height: 640, viewBox: "0 0 936 640" });
    css(svg, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
    const rowY = (k) => y + names.indexOf(k) * rowH + rowH / 2;
    const rows = names.map((k) => {
      const cy = rowY(k);
      const label = S("text", { x: f1(x + labelW / 2 - 4), y: f1(cy + 11), "text-anchor": "middle" }, k);
      css(label, { fontSize: "32px", fontWeight: "900", fill: "var(--ink)" });
      const track = S("rect", {
        x: left,
        y: f1(cy - trackH / 2),
        width: trackW,
        height: trackH,
        rx: trackH / 2,
        "stroke-width": 3,
      });
      css(track, { fill: "var(--panel-2)", stroke: "var(--line-2)" });
      const lip = S("rect", { y: f1(cy - trackH / 2 + 4), height: trackH, x: left });
      const face = S("rect", { y: f1(cy - trackH / 2), height: trackH, x: left, "stroke-width": 3 });
      const val = S("text", { x: f1(left + trackW + 14), y: f1(cy + 10), "text-anchor": "start" });
      css(val, { fontSize: "28px", fontWeight: "800" });
      const tick = S("rect", { y: f1(cy - trackH / 2 - 7), width: 7, height: trackH + 14, rx: 3 });
      const g = S("g", {}, label, track, lip, face, val, tick);
      svg.append(g);
      return { k, g, lip, face, val, tick };
    });
    parent.append(svg);
    const xAt = (v) => left + clamp(v / max) * trackW;
    function update(st = {}) {
      V.show(svg, st.o ?? 1);
      rows.forEach((row) => {
        const v = (st.vals || {})[row.k] ?? 0;
        const tn = typeof st.tone === "object" ? st.tone[row.k] || "blue" : st.tone || "blue";
        const l = look((st.hi || []).includes(row.k) ? "orange" : tn, "solid");
        const bw = clamp(v / max) * trackW;
        for (const [e, f] of [[row.face, l.fill], [row.lip, l.lip]]) {
          e.setAttribute("width", f1(Math.max(0, bw)));
          e.setAttribute("rx", f1(Math.min(trackH / 2, bw / 2)));
          css(e, { fill: f });
        } // prettier-ignore
        css(row.face, { stroke: l.stroke });
        V.show(row.face, bw > 0.5 ? 1 : 0);
        V.show(row.lip, bw > 0.5 ? 1 : 0);
        const txt = (st.text || {})[row.k] ?? A1.fmt(v, 2);
        if (row.val.textContent !== txt) row.val.textContent = txt;
        css(row.val, { fill: look((st.hi || []).includes(row.k) ? "orange" : tn, "soft").ink });
        const tv = (st.ticks || {})[row.k];
        row.tick.setAttribute("x", f1(tv == null ? left : xAt(tv) - 3.5));
        css(row.tick, { fill: T(st.tickTone || "green").c });
        V.show(row.tick, tv == null ? 0 : 1);
        V.show(row.g, (st.rowO || {})[row.k] ?? 1);
      });
    }
    return { svg, update, rowY, xAt, trackW, left, height: names.length * rowH };
  }

  Object.assign(A1, { textW, svgPill, web, bars });
})();
