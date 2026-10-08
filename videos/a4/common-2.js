/* Phase 4 · Minimum Spanning Trees: the graph drawing every scene shares (VID.a4, short name A4). Needs videos/l5/common.js and
   a4/common.js to be loaded first (see videos/algo-4.html). Positions are the parent's pixels (the stage is 936 x 640, origin
   top-left). EVERY CALL IS PURE: call update() each frame from your scene's update(t) with everything you want to see; anything
   you leave out falls back to its default, and nothing is remembered between frames.

   TONES (colour roles of this video): "green" in the tree / kept / safe, "red" rejected / loop / dearer swapped-out, "orange"
   the candidates under test and the one chosen to look at, "blue" a tree or tour being looked at, "purple" the cut (one side X),
   "grey" neutral (a cable not in play, a town not reached). A4.TONES lists them.

   POSITIONS
     A4.netPos({x, y, s})   the five towns A..E of the example network at stage px: {A: [x, y], ...}. The reference box is
                            600 x 440 (A left, B top, C bottom, D top right, E right); s scales it (default 1, x = y = 0).
                            Towns: A (40,230) B (190,40) C (240,400) D (430,80) E (560,310) times s, plus x, y.
     A4.tspPos({x = -40, y = -20, s = 1.5})   the seven towns A..G of lesson 4.9 (lesson coordinates times s, plus x, y). The
                            default fills x 50..605, y 55..347 of the stage and leaves the right-hand column free.

   THE GRAPH
     const g = A4.graph(parent, {nodes, edges, r: 34, ew: 9, font, pills: true, fmt: String, pillAt: {AB: 0.5}, blobs: 3,
                                 hidden: false, letters: true, edgeBase: {}, townBase: {}});
       nodes   {A: [x, y], ...} town centres (default A4.netPos());  edges  [[a, b, w], ...] (default A4.EDGES)
       r       town radius (34; use 22-26 for small graphs);  ew  cable width (9);  font  letter size (max(28, 1.1 r))
       pills   weight pills on the cables (28 px bold; they do not shrink, so use false on graphs smaller than about scale 0.7)
       fmt     weight -> text.   pillAt  {key: 0..1} where the pill sits along the cable from its first letter (default 0.5)
       blobs   how many blobs can be shown at once (default 3).   edgeBase / townBase  defaults for every cable / town (below)
       letters false = towns without their letter (tiny pictograms with r 10-14; the letter needs r >= 20)
       hidden  true = a cable you do not list in update({edges}) is not drawn at all (default false: unlisted cables are grey)
     g.update({
       edges: { AC: "green" | {tone, k, o, w, dash, from, halo, pill, pillTone, solid, pillO} , ... },   // keyed by A4.key
       towns: { A: "green" | {tone, solid, s, o, dx, dy, ring, ringK, ringDash} , ... },
       blobs: [{set: ["A", "B"], tone: "purple", k: 1, dash: true, fill: true, pad}, ...],
       base:  {edge: {...}, town: {...}},    // the state of every cable / town you do NOT list (beats edgeBase / townBase; a
                                              // cable or town you do list gets only its own fields on top of edgeBase / townBase)
       o: 1,                                  // opacity of the whole graph
     })
       CABLE state (defaults in brackets)
         tone   one of A4.TONES (grey: a pale grey line)         k  0..1 how much of the cable is drawn, growing from town
         from   the town it grows from (the first letter of its key)    o  opacity (1; use 0.35-0.45 to dim cables not in play)
         w      width multiplier (1; 1.35 = emphasised)           dash  true = dashed (k is ignored, it fades with o)
         halo   0..1 a pale band in the tone behind the cable (a highlight)
         pill   0..1 pop-in of the weight pill (default follows k: it pops in as the cable passes its midpoint; 0 hides it)
         pillTone  colour of the pill (the cable's tone)
         solid  true = a solid sticker pill (tone fill, dark text), false = tinted;  pillO  opacity of the pill (the cable's o)
       TOWN state
         tone   A4.TONES (grey: white town with a grey rim);  solid  true = filled in the tone (use for "in the tree")
         s  scale (1)   o  opacity (1)   dx, dy  offset in px (hop / shake)
         ring   a tone name: a ring round the town (e.g. "orange" = attention);  ringK  0..1 its pop-in (1);  ringDash  dashed ring
       BLOB (one side X of a cut, or a group): a rounded outline round the towns in `set`, behind everything. tone default
         "purple", k 0..1 pop-in/fade (1), dash (true), fill (true), pad px beyond the town circle (r + 18).
     g.pt("A")        -> {x, y} town centre          g.mid("AC", f = 0.5) -> {x, y} point along a cable from its first letter
     g.len("AC")      -> cable length in px          g.keys -> the cable keys          g.r -> town radius       g.el -> the <svg>
     g.pillSize(key)  -> {w, h} of a cable's pill

   CONVENIENCE
     A4.net(parent, {x, y, s, ...opts})       the example network: A4.graph with A4.netPos({x, y, s}), r = max(22, 34 s),
                                              ew = max(5, 9 s) and pills on.
     A4.tspMap(parent, {x, y, s, ...opts})    the seven towns of lesson 4.9 with ALL 21 straight cables as edges, every one
                                              hidden until you list it in update({edges}); no pills; r = 28 s / 1.5.
     A4.blobPath(points, R) -> SVG path data of the rounded outline round [[x, y], ...] at distance R (for your own SVG).
     A4.hull(points) -> the convex hull of [[x, y], ...]. */
(function () {
  const V = window.VID;
  const A4 = V.a4;
  const { s, clamp, ease: E } = V;
  const f1 = (n) => n.toFixed(1);
  const TONES = ["grey", "green", "red", "orange", "blue", "purple"];
  const cls = (t) => {
    if (!TONES.includes(t)) throw new Error(`VID.a4: unknown tone "${t}" (use ${TONES.join(", ")})`);
    return `c-${t}`;
  };
  const css = (e, o) => (Object.assign(e.style, o), e);
  const spec = (v) => (typeof v === "string" ? { tone: v } : v || {});

  // ---------- positions ----------
  const NET_REF = { A: [40, 230], B: [190, 40], C: [240, 400], D: [430, 80], E: [560, 310] };
  const netPos = ({ x = 0, y = 0, s: k = 1 } = {}) =>
    Object.fromEntries(Object.entries(NET_REF).map(([t, [px, py]]) => [t, [x + px * k, y + py * k]]));
  const tspPos = ({ x = -40, y = -20, s: k = 1.5 } = {}) =>
    Object.fromEntries(Object.entries(A4.TSP.ref).map(([t, [px, py]]) => [t, [x + px * k, y + py * k]]));

  // ---------- convex hull and its rounded outline (a cut side, or a group of towns) ----------
  function hull(pts) {
    if (pts.length < 3) return pts.slice();
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const half = (list) => {
      const out = [];
      list.forEach((q) => {
        while (out.length >= 2 && cr(out[out.length - 2], out[out.length - 1], q) <= 0) out.pop();
        out.push(q);
      });
      out.pop();
      return out;
    };
    return half(p).concat(half(p.slice().reverse()));
  }
  function blobPath(points, R) {
    const h = hull(points);
    if (h.length === 1) {
      const [cx, cy] = h[0];
      return `M${f1(cx - R)} ${f1(cy)}A${f1(R)} ${f1(R)} 0 1 1 ${f1(cx + R)} ${f1(cy)}A${f1(R)} ${f1(R)} 0 1 1 ${f1(cx - R)} ${f1(cy)}Z`;
    }
    const n = h.length;
    const nor = h.map((p, i) => {
      const q = h[(i + 1) % n];
      const d = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
      return [(q[1] - p[1]) / d, -(q[0] - p[0]) / d]; // outward normal of the edge p -> q
    });
    const pt = (p, m) => `${f1(p[0] + R * m[0])} ${f1(p[1] + R * m[1])}`;
    let d = `M${pt(h[0], nor[0])}`;
    for (let i = 0; i < n; i++) {
      d += `L${pt(h[(i + 1) % n], nor[i])}A${f1(R)} ${f1(R)} 0 0 1 ${pt(h[(i + 1) % n], nor[(i + 1) % n])}`;
    }
    return `${d}Z`;
  }

  // ---------- the graph ----------
  function graph(parent, opts = {}) {
    const nodes = opts.nodes || netPos();
    const edges = opts.edges || A4.EDGES;
    const R = opts.r ?? 34;
    const EW = opts.ew ?? 9;
    const font = opts.font ?? Math.max(28, Math.round(R * 1.1));
    const pills = opts.pills !== false;
    const fmt = opts.fmt || String;
    const svg = s("svg", { width: 936, height: 640 });
    css(svg, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
    const layers = ["blobs", "edges", "rings", "towns", "pills"].map(() => svg.appendChild(s("g")));
    const [gBlobs, gEdges, gRings, gTowns, gPills] = layers;
    parent.append(svg);
    const pt = (t) => {
      if (!nodes[t]) throw new Error(`VID.a4.graph: unknown town "${t}"`);
      return { x: nodes[t][0], y: nodes[t][1] };
    };

    // blobs (cut sides, groups)
    const blobs = Array.from({ length: opts.blobs ?? 3 }, () => {
      const path = css(s("path", { "stroke-width": 4, "stroke-linejoin": "round" }), { stroke: "var(--c)" });
      gBlobs.append(path);
      return path;
    });

    // cables and their weight pills
    const E_ = {};
    edges.forEach(([a, b, w]) => {
      const k = a < b ? a + b : b + a;
      const [p0, p1] = [pt(a), pt(b)];
      const e = { k, a, b, w, p0, p1, len: Math.hypot(p1.x - p0.x, p1.y - p0.y) };
      e.halo = css(s("path", { fill: "none", "stroke-linecap": "round" }), { stroke: "var(--c-dim)" });
      e.line = css(s("path", { fill: "none", "stroke-linecap": "round" }), { stroke: "var(--c)" });
      gEdges.append(e.halo, e.line);
      if (pills) {
        const text = fmt(w);
        e.pw = Math.max(54, 18 * text.length + 24);
        const rect = (dy, ex) => s("rect", { x: -e.pw / 2, y: -20 + dy, width: e.pw, height: 40, rx: 20, ...ex });
        e.lip = rect(3, {});
        e.face = rect(0, { "stroke-width": 3 });
        e.txt = css(s("text", { "text-anchor": "middle", dy: ".36em", text }), { fontSize: "28px", fontWeight: "900" });
        const at = (opts.pillAt || {})[k] ?? 0.5;
        e.pos = { x: p0.x + (p1.x - p0.x) * at, y: p0.y + (p1.y - p0.y) * at };
        e.pill = s("g", {}, e.lip, e.face, e.txt);
        gPills.append(e.pill);
      }
      E_[k] = e;
    });
    const edge = (k) => {
      if (!E_[k]) throw new Error(`VID.a4.graph: no cable "${k}" (keys: ${Object.keys(E_).join(", ")})`);
      return E_[k];
    };

    // towns and rings
    const T_ = {};
    Object.keys(nodes).forEach((t) => {
      const { x, y } = pt(t);
      const circ = (dy, r, ex) => s("circle", { cx: f1(x), cy: f1(y + dy), r, ...ex });
      const ring = css(circ(0, R + 13, { fill: "none", "stroke-width": 6 }), { stroke: "var(--c)" });
      gRings.append(ring);
      const lip = circ(5, R, {});
      const face = circ(0, R, { "stroke-width": 4 });
      const txt = css(
        s("text", { x: f1(x), y: f1(y), "text-anchor": "middle", dy: ".36em", text: opts.letters === false ? "" : t }),
        {
          fontSize: `${font}px`,
          fontWeight: "900",
        },
      );
      const g = s("g", {}, lip, face, txt);
      gTowns.append(g);
      T_[t] = { t, ring, lip, face, txt, g };
    });

    function paintEdge(e, st) {
      const tone = st.tone || "grey";
      const wd = EW * (st.w ?? 1);
      const k = clamp(st.k ?? 1);
      const [p, q] = st.from && st.from === e.b ? [e.p1, e.p0] : [e.p0, e.p1];
      const d = `M${f1(p.x)} ${f1(p.y)}L${f1(q.x)} ${f1(q.y)}`;
      const op = st.o ?? 1;
      [e.line, e.halo].forEach((el) => {
        el.setAttribute("d", d);
        el.setAttribute("class", cls(tone));
      });
      e.line.style.strokeWidth = `${f1(wd)}px`;
      if (st.dash) {
        e.line.style.strokeDasharray = `${f1(wd * 1.8)} ${f1(wd * 1.4)}`;
        V.show(e.line, op);
      } else {
        e.line.style.strokeDasharray = k >= 0.999 ? "" : `${f1(k * e.len)} ${f1(e.len * 2)}`;
        V.show(e.line, k < 0.003 ? 0 : op);
      }
      const halo = clamp(st.halo || 0);
      e.halo.style.strokeWidth = `${f1(wd * 2.7)}px`;
      V.show(e.halo, halo < 0.003 || k < 0.003 ? 0 : halo * op);
      if (!pills) return;
      const pk = clamp(st.pill ?? (k - 0.5) * 2);
      const pt_ = st.pillTone || tone;
      const solid = !!st.solid;
      e.pill.setAttribute("class", cls(pt_));
      css(e.face, {
        fill: solid ? "var(--c)" : pt_ === "grey" ? "var(--panel)" : "var(--c-dim)",
        stroke: solid ? "var(--c-lip)" : "var(--c-edge)",
      });
      e.lip.style.fill = solid ? "var(--c-lip)" : "var(--c-edge)";
      e.txt.style.fill = solid ? "var(--c-on)" : pt_ === "grey" ? "var(--ink)" : "var(--c-ink)";
      V.place(e.pill, { x: e.pos.x, y: e.pos.y, s: 0.6 + 0.4 * E.pop(pk), o: Math.min(1, pk * 4) * (st.pillO ?? op) });
    }
    function paintTown(t, st) {
      const tone = st.tone || "grey";
      const solid = !!st.solid;
      t.g.setAttribute("class", cls(tone));
      css(t.face, {
        fill: solid ? "var(--c)" : tone === "grey" ? "var(--panel)" : "var(--c-dim)",
        stroke: solid ? "var(--c-lip)" : "var(--c-edge)",
      });
      t.lip.style.fill = solid ? "var(--c-lip)" : "var(--c-edge)";
      t.txt.style.fill = solid ? "var(--c-on)" : "var(--ink)";
      V.place(t.g, { x: st.dx || 0, y: st.dy || 0, s: st.s ?? 1, o: st.o ?? 1 });
      const rk = st.ring ? clamp(st.ringK ?? 1) : 0;
      if (st.ring) t.ring.setAttribute("class", cls(st.ring));
      t.ring.style.strokeDasharray = st.ringDash ? "14 10" : "";
      t.ring.setAttribute("r", f1(R + 13 + (1 - E.out(rk)) * 14));
      V.place(t.ring, { x: st.dx || 0, y: st.dy || 0, o: Math.min(1, rk * 3) * (st.o ?? 1) });
    }

    function update(st = {}) {
      const base = st.base || {};
      Object.keys(st.edges || {}).forEach(edge); // throws on a mistyped cable key
      Object.keys(st.towns || {}).forEach(pt); // throws on a mistyped town
      const o = st.o ?? 1;
      Object.values(E_).forEach((e) => {
        const own = (st.edges || {})[e.k];
        const unlisted = { ...base.edge, ...(opts.hidden ? { o: 0 } : {}) };
        paintEdge(e, { ...opts.edgeBase, ...(own ? spec(own) : unlisted) });
      });
      Object.values(T_).forEach((t) => {
        const own = (st.towns || {})[t.t];
        paintTown(t, { ...opts.townBase, ...(own ? spec(own) : base.town) });
      });
      V.show(svg, o);
      blobs.forEach((path, i) => {
        const b = (st.blobs || [])[i];
        const k = b ? clamp(b.k ?? 1) : 0;
        if (!b || k < 0.003) return V.show(path, 0);
        path.setAttribute("class", cls(b.tone || "purple"));
        path.setAttribute(
          "d",
          blobPath(
            b.set.map((t) => [pt(t).x, pt(t).y]),
            b.pad ?? R + 18,
          ),
        );
        path.style.fill = b.fill === false ? "none" : "var(--c-dim)";
        path.style.strokeDasharray = b.dash === false ? "" : "14 10";
        V.place(path, { s: 0.92 + 0.08 * E.out(k), o: Math.min(1, k * 2.5) });
      });
    }

    return {
      el: svg,
      update,
      pt,
      r: R,
      nodes,
      keys: Object.keys(E_),
      len: (k) => edge(k).len,
      mid: (k, f = 0.5) => {
        const e = edge(k);
        return { x: e.p0.x + (e.p1.x - e.p0.x) * f, y: e.p0.y + (e.p1.y - e.p0.y) * f };
      },
      pillSize: (k) => ({ w: edge(k).pw || 0, h: pills ? 40 : 0 }),
    };
  }

  const net = (parent, o = {}) => {
    const { x = 0, y = 0, s: k = 1, ...rest } = o;
    return graph(parent, { nodes: netPos({ x, y, s: k }), r: Math.max(22, 34 * k), ew: Math.max(5, 9 * k), ...rest });
  };
  const tspMap = (parent, o = {}) => {
    const { x = -40, y = -20, s: k = 1.5, ...rest } = o;
    return graph(parent, {
      nodes: tspPos({ x, y, s: k }),
      edges: A4.TSP.edges,
      pills: false,
      r: (28 * k) / 1.5,
      ew: Math.max(5, (9 * k) / 1.5),
      hidden: true,
      ...rest,
    });
  };

  Object.assign(A4, { TONES, netPos, tspPos, hull, blobPath, graph, net, tspMap });
})();
