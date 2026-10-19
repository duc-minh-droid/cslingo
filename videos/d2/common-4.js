/* Data Science · Lecture 2 (ds-2): the property graph and the four family icons (VID.d2, short name D2). Needs l5/common.js and
   d2/common.js .. common-3.js. Positions are the parent's pixels. EVERY CALL IS PURE: call update() each frame from update(t) with
   everything you want to see; anything you leave out falls back to its default and nothing is remembered between frames.

   1. GRAPH  (vertices are sticker pills with an icon, edges are arrows between the pill borders; every text is 28 px)
        const g = D2.graph(parent, {nodes, edges, directed: true, ew: 7, base: ...});
          nodes   {id: {x, y, kind: "person" | "city" | "company" | "plain", text}}   x, y = the pill's CENTRE; text defaults to the id;
                  kind picks the icon (person = head and shoulders, city = map pin, company = office block, plain = none) and the
                  corner shape (person = full pill, city = rounded, company = squarer). Use D2.LAYOUT for the lesson's seven vertices,
                  or build it:  Object.fromEntries(D2.GRAPH.nodes.map((n) => [n.id, {...pos, kind: n.kind}])).
                  The pill is 60 px high and about 16 px per character + 44 px (+ 42 px with an icon) wide: g.size(id) -> {w, h}.
          edges   [[a, b, label], ...] (or the objects of D2.GRAPH.edges); the arrow runs from a (the tail) to b (the head); key "a>b".
          directed false draws plain lines without heads.
        g.update({
          nodes: {Ana: "blue" | {tone, solid, s, o, dx, dy, k, ring, ringK, ringDash}, ...},   the state of the vertices you list
          edges: {"Ana>Ben": "purple" | {tone, k, o, w, dash, label, labelTone, labelText}, ...},   the state of the edges you list
          base:  {node: {...}, edge: {...}},    the state of everything you do NOT list (default: node {tone: "grey", k: 1}, edge {tone: "grey", k: 1, label: 0})
          o: 1,                                 opacity of the whole graph })
          NODE: tone one of D2.TONES (grey = panel face with a grey rim); solid = filled in the tone (text in its -on shade); k 0..1 pops it in
                (0 hides it); s scale; o opacity; dx, dy offset in px; ring = a tone name draws a ring round it (ringK 0..1 its pop-in, ringDash dashed).
          EDGE: tone (grey = pale grey line); k 0..1 how much of the arrow is drawn, growing from the tail (the head appears at k 1);
                o opacity; w width multiplier (1; 1.4 = emphasised); dash true = dashed; label 0..1 pops the label pill in (text = the edge's
                label, or labelText), labelTone default "orange"; labelAt 0..1 where along the arrow the pill sits (default 0.5, the middle);
                labelSide 0 = on the arrow (default), 1 = beside it on the right-hand side of its direction (below a left-to-right arrow),
                -1 = on the left-hand side (above it): the pill is then moved just far enough to leave the arrow visible.
                A pill is about 118 (FRIEND) to 150 (WORKS_AT) px wide and 48 high: on an arrow shorter than that, use labelSide.
        g.pt(id) -> {x, y} centre of a vertex;   g.size(id) -> {w, h};   g.keys -> the edge keys, in order
        g.edgePt(key, f) -> {x, y} the point at fraction f (0..1) along the arrow from tail border to head border (use 1 - f to walk it backwards)
        g.edgeMid(key) -> the middle point of the arrow;   g.el -> the <svg>
   2. FAMILY ICONS  (small pictograms of the four NoSQL families, SVG <g> drawn around (0, 0): place them with V.place(g, {x: cx, y: cy, s, o}))
        D2.fam("doc" | "kv" | "wide" | "graph", size = 96, tone = "grey") -> <g>
          doc = a card with braces and lines;   kv = a key chip, an arrow and a value box;   wide = three rows of cells with different lengths;
          graph = three round vertices and their edges.   Append it to your own L5.svg(parent) layer. tone tints it ("grey" neutral, "green" matched). */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  const L5 = V.l5;
  const { clamp, ease: E } = V;
  const { f1, tn } = D2.u;

  const PAD = { person: [22, 56], city: [22, 56], company: [22, 56], plain: [22, 22] };
  const HEIGHT = 60;
  const RADIUS = { person: 30, city: 16, company: 8, plain: 16 };
  const sizeOf = (n) => ({
    w: Math.max(96, Math.round(String(n.text).length * 16 + PAD[n.kind][0] + PAD[n.kind][1])),
    h: HEIGHT,
  });

  function graph(parent, o = {}) {
    const { directed = true, ew = 7 } = o;
    const nodes = Object.fromEntries(
      Object.entries(o.nodes).map(([id, n]) => {
        const nn = { kind: "plain", text: id, ...n };
        return [id, { ...nn, ...sizeOf(nn) }];
      }),
    );
    const edges = (o.edges || []).map((e) => {
      const [a, b, label] = Array.isArray(e) ? e : [e.a, e.b, e.label];
      if (!nodes[a] || !nodes[b]) throw new Error(`VID.d2.graph: edge ${a}>${b} names a vertex that is not in nodes`);
      return { a, b, label: label || "", key: `${a}>${b}` };
    });
    const svg = L5.svg(parent, 936, 640);
    svg.style.overflow = "visible";
    const HEAD = 24;
    const GAP = 8;

    /* where the arrow of an edge starts and ends: the pill borders along the line between the two centres */
    const geom = (e) => {
      const [A, B] = [nodes[e.a], nodes[e.b]];
      const [dx, dy] = [B.x - A.x, B.y - A.y];
      const len = Math.hypot(dx, dy) || 1;
      const [ux, uy] = [dx / len, dy / len];
      const exit = (n) => Math.min(n.w / 2 / Math.abs(ux || 1e-9), n.h / 2 / Math.abs(uy || 1e-9)) + GAP;
      const [t0, t1] = [exit(A), len - exit(B)];
      const p = (f) => ({ x: A.x + ux * (t0 + (t1 - t0) * f), y: A.y + uy * (t0 + (t1 - t0) * f) });
      return { u: [ux, uy], t0, t1, len: t1 - t0, p, a: p(0), b: p(1) };
    };
    edges.forEach((e) => (e.g = geom(e)));
    const edgeEls = edges.map((e) => {
      const line = V.s("line", { "stroke-linecap": "round" });
      const headEl = V.s("path", { "stroke-linejoin": "round", "stroke-width": 3 });
      svg.append(line, headEl);
      return { line, head: headEl };
    });
    const nodeEls = Object.entries(nodes).map(([id, n]) => {
      const rx = RADIUS[n.kind];
      const g = V.s("g", {});
      const ringEl = V.s("rect", {
        x: f1(n.x - n.w / 2 - 9),
        y: f1(n.y - n.h / 2 - 9),
        width: f1(n.w + 18),
        height: f1(n.h + 18),
        rx: f1(rx + 9),
        fill: "none",
        "stroke-width": 5,
      });
      const lip = V.s("rect", {
        x: f1(n.x - n.w / 2),
        y: f1(n.y - n.h / 2 + 6),
        width: f1(n.w),
        height: f1(n.h),
        rx: f1(rx),
      });
      const face = V.s("rect", {
        x: f1(n.x - n.w / 2),
        y: f1(n.y - n.h / 2),
        width: f1(n.w),
        height: f1(n.h),
        rx: f1(rx),
        "stroke-width": 3,
      });
      const hasIcon = n.kind !== "plain";
      const icons = hasIcon
        ? [
            D2.icon[{ person: "person", city: "pin", company: "building" }[n.kind]](
              n.x - n.w / 2 + 34,
              n.y,
              38,
              "grey",
              { fill: "var(--ic)", hole: "var(--hole)" },
            ),
          ]
        : [];
      const label = V.s("text", {
        x: f1(n.x + (hasIcon ? 20 : 0)),
        y: f1(n.y),
        dy: ".36em",
        "text-anchor": "middle",
        style: { fontFamily: "var(--sans)", fontWeight: "900", fontSize: "28px" },
        text: n.text,
      });
      g.append(ringEl, lip, face, ...icons, label);
      svg.append(g);
      return { id, g, ringEl, lip, face, label };
    });
    const labelEls = edges.map((e) => {
      const g = V.s("g", {});
      const text = e.label;
      const w = D2.tagW(text);
      const rect = V.s("rect", { x: f1(-w / 2), y: -24, width: f1(w), height: 48, rx: 24, "stroke-width": 3 });
      const t = V.s("text", {
        x: 0,
        y: 0,
        dy: ".36em",
        "text-anchor": "middle",
        style: { fontFamily: "var(--sans)", fontWeight: "900", fontSize: "28px" },
        text,
      });
      g.append(rect, t);
      svg.append(g);
      return { g, rect, t, w };
    });

    const dfl = (v, d) => (v == null ? d : v);
    const spec = (v) => (typeof v === "string" ? { tone: v } : v || {});
    function update(s = {}) {
      const bn = { tone: "grey", k: 1, ...(s.base && s.base.node) };
      const be = { tone: "grey", k: 1, label: 0, ...(s.base && s.base.edge) };
      edges.forEach((e, i) => {
        const st = { ...be, ...spec(s.edges && s.edges[e.key]) };
        const { line, head: hd } = edgeEls[i];
        const k = clamp(st.k);
        const t = D2.tone(tn(st.tone));
        const colour = st.tone === "grey" ? "var(--line-2)" : t.c;
        const w = ew * (st.w || 1);
        const o = dfl(st.o, 1);
        const showHead = directed && k >= 0.999;
        const tipK = directed ? Math.min(1, Math.max(0, (e.g.len - HEAD * 0.8) / e.g.len)) : 1;
        const [p0, p1] = [e.g.a, e.g.p(k * tipK)];
        line.setAttribute("x1", f1(p0.x));
        line.setAttribute("y1", f1(p0.y));
        line.setAttribute("x2", f1(p1.x));
        line.setAttribute("y2", f1(p1.y));
        line.setAttribute("stroke-width", f1(w));
        line.style.stroke = colour;
        line.style.strokeDasharray = st.dash ? "16 14" : "";
        line.style.opacity = o >= 1 ? "" : String(Math.max(0, o));
        line.style.visibility = k <= 0.002 || o <= 0.001 ? "hidden" : "";
        const [ux, uy] = e.g.u;
        const tip = e.g.b;
        const base = { x: tip.x - ux * HEAD, y: tip.y - uy * HEAD };
        hd.setAttribute(
          "d",
          `M ${f1(tip.x)} ${f1(tip.y)} L ${f1(base.x - uy * HEAD * 0.5)} ${f1(base.y + ux * HEAD * 0.5)} L ${f1(base.x + uy * HEAD * 0.5)} ${f1(base.y - ux * HEAD * 0.5)} Z`,
        );
        hd.style.fill = hd.style.stroke = colour;
        hd.style.opacity = o >= 1 ? "" : String(Math.max(0, o));
        hd.style.visibility = showHead && o > 0.001 ? "" : "hidden";
        const lk = clamp(st.label);
        const lab = labelEls[i];
        const lt = D2.tone(tn(st.labelTone || "orange"));
        lab.rect.style.fill = lt.dim;
        lab.rect.style.stroke = lt.edge;
        lab.t.style.fill = lt.ink;
        if (st.labelText != null && lab.t.textContent !== st.labelText) lab.t.textContent = st.labelText;
        const m = e.g.p(dfl(st.labelAt, 0.5));
        const side = st.labelSide || 0;
        if (side) {
          const [nx, ny] = [-e.g.u[1] * side, e.g.u[0] * side];
          const off = Math.abs(nx) * (lab.w / 2) + Math.abs(ny) * 24 + 8;
          [m.x, m.y] = [m.x + nx * off, m.y + ny * off];
        }
        V.place(lab.g, { x: m.x, y: m.y, s: 0.8 + 0.2 * E.pop(lk), o: Math.min(1, lk * 4) * o });
      });
      nodeEls.forEach(({ id, g, ringEl, lip, face, label }) => {
        const st = { ...bn, ...spec(s.nodes && s.nodes[id]) };
        const t = D2.tone(tn(st.tone));
        const solid = !!st.solid;
        const k = clamp(st.k);
        face.style.fill = solid ? t.c : "var(--panel)";
        face.style.stroke = solid ? t.lip : st.tone === "grey" ? "var(--line-2)" : t.edge;
        lip.style.fill = solid ? t.lip : st.tone === "grey" ? "var(--line-2)" : t.edge;
        label.style.fill = solid ? t.on : "var(--ink)";
        g.style.setProperty("--ic", solid ? t.on : st.tone === "grey" ? "var(--text-dim)" : t.ink);
        g.style.setProperty("--hole", solid ? t.c : "var(--panel)");
        const rk = clamp(st.ringK ?? (st.ring ? 1 : 0));
        if (st.ring && rk > 0.002) {
          ringEl.style.stroke = D2.tone(tn(st.ring)).c;
          ringEl.style.strokeDasharray = st.ringDash ? "14 10" : "";
          ringEl.style.visibility = "";
          ringEl.style.opacity = String(Math.min(1, rk * 3));
        } else ringEl.style.visibility = "hidden";
        V.place(g, {
          x: st.dx || 0,
          y: st.dy || 0,
          s: (st.s ?? 1) * (0.55 + 0.45 * E.pop(k)),
          o: Math.min(1, k * 4) * dfl(st.o, 1),
        });
      });
      V.show(svg, dfl(s.o, 1));
    }
    return {
      el: svg,
      update,
      keys: edges.map((e) => e.key),
      pt: (id) => ({ x: nodes[id].x, y: nodes[id].y }),
      size: (id) => ({ w: nodes[id].w, h: nodes[id].h }),
      edgePt: (key, f) => edges.find((e) => e.key === key).g.p(f),
      edgeMid: (key) => edges.find((e) => e.key === key).g.p(0.5),
    };
  }

  // ---------- 2. family icons ----------
  function fam(kind, size = 96, tone = "grey") {
    const t = D2.tone(tn(tone));
    const u = size / 100;
    const face = (x, y, w, h, r = 12, fill = "var(--panel)") =>
      V.s("rect", {
        x: f1(x * u),
        y: f1(y * u),
        width: f1(w * u),
        height: f1(h * u),
        rx: f1(r * u),
        "stroke-width": f1(4 * u),
        style: { fill, stroke: t.edge },
      });
    const bar = (x, y, w, fill = t.c) =>
      V.s("rect", {
        x: f1(x * u),
        y: f1((y - 5) * u),
        width: f1(w * u),
        height: f1(10 * u),
        rx: f1(5 * u),
        style: { fill },
      });
    const g = V.s("g", {});
    if (kind === "doc") {
      g.append(
        face(-34, -44, 68, 88),
        D2.icon.braces(0, -22, 34 * 1, tone),
        bar(-22, 4, 44, t.edge),
        bar(-22, 20, 30, t.edge),
      );
    } else if (kind === "kv") {
      g.append(
        face(-48, -14, 36, 28, 8, t.dim),
        V.s("path", {
          d: `M ${f1(-8 * u)} 0 L ${f1(14 * u)} 0`,
          "stroke-width": f1(6 * u),
          "stroke-linecap": "round",
          style: { stroke: t.c, fill: "none" },
        }),
        V.s("path", {
          d: `M ${f1(8 * u)} ${f1(-9 * u)} L ${f1(18 * u)} 0 L ${f1(8 * u)} ${f1(9 * u)} Z`,
          style: { fill: t.c },
        }),
        face(20, -22, 30, 44, 8),
      );
    } else if (kind === "wide") {
      const rows = [
        [-46, 3],
        [-14, 3],
        [18, 2],
      ];
      rows.forEach(([y, n]) => {
        const w = n === 3 ? 28 : 28;
        for (let i = 0; i < n; i++) g.append(face(-46 + i * 33, y, w, 24, 6, i === 0 ? t.dim : "var(--panel)"));
      });
    } else if (kind === "graph") {
      const P = [
        [-30, 24],
        [0, -30],
        [32, 20],
      ];
      [
        [0, 1],
        [1, 2],
        [0, 2],
      ].forEach(([a, b]) =>
        g.append(
          V.s("line", {
            x1: f1(P[a][0] * u),
            y1: f1(P[a][1] * u),
            x2: f1(P[b][0] * u),
            y2: f1(P[b][1] * u),
            "stroke-width": f1(5 * u),
            "stroke-linecap": "round",
            style: { stroke: t.edge },
          }),
        ),
      );
      P.forEach(([x, y], i) =>
        g.append(
          V.s("circle", {
            cx: f1(x * u),
            cy: f1(y * u),
            r: f1(14 * u),
            "stroke-width": f1(4 * u),
            style: { fill: i === 1 ? t.dim : "var(--panel)", stroke: t.edge },
          }),
        ),
      );
    } else throw new Error(`VID.d2.fam: unknown family "${kind}" (use doc, kv, wide, graph)`);
    return g;
  }
  Object.assign(D2, { graph, fam });
})();
