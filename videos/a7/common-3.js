/* Phase 7 · Information Theory & Compression: the code tree (VID.a7, short name A7). Needs videos/l5/common.js, a7/common.js and
   a7/common-2.js loaded first (see videos/algo-7.html). One drawer serves scene 5 (the small prefix-free tree and its decoding walk),
   scene 6 (the Huffman forest growing) and scene 7 (the finished tree with its 0 and 1 branches). Positions are stage pixels (936 x 640).
   EVERY CALL IS PURE: create the tree once in build(stage), call T.update({...}) every frame with everything you want to see.

   LAYOUT
   A7.treePos(tree, {x0 = 20, slot = 120, top = 80, dy = 140, flat = 0}) -> {id: [x, y]}
       node centres. tree = A7.HUFF or a tree from A7.codeTree(codes) (A7.PREFIX.tree). Leaves sit left to right in tree order, one
       slot (px) apart, the first leaf centred in [x0, x0 + slot]; an inner node is centred between its first and last kid; y = top
       + dy * depth. flat 0..1 slides every leaf down to the deepest row (1 = all leaves on one baseline, like the growing forest of
       scene 6; 0 = each leaf at its own depth, like a code tree). Because the leaves never move, a node keeps its place while the
       forest grows, so the same pos serves every step; animate flat (or pass pos overrides to update) to move leaves.
       Good sizes: the Huffman tree  A7.treePos(A7.HUFF, {x0: 20, slot: 120, top: 70, dy: 140, flat: 1})  (leaf centres y 490, root y 70,
       the five leaves fill x 20..620); the prefix tree (4 leaves, depth 3)  A7.treePos(A7.PREFIX.tree, {x0: 120, slot: 140, top: 50, dy: 130}).

   THE DRAWER
   const T = A7.tree(parent, {tree, pos, r = 38, leafW = 100, leafH = 92, ew = 8, label});
       tree, pos   as above (pos fixes the home position of every node);  r  radius of a merged-node circle;  leafW, leafH  size of a
       leaf tile;  ew  branch width.   label (id, node) -> {text, sub, kind} overrides the default labels. Defaults: A7.HUFF: a leaf is
       a tile with its letter and weight (A / .16), an inner node a circle with its weight (.20); a code tree (A7.codeTree): a leaf
       tile with its letter and, below it, its codeword, an inner node a small empty dot. kind = "leaf" | "node" | "dot".
   T.update({
       nodes: { id: "green" | {tone, solid, k, o, s, dx, dy, ring, ringK, ringDash, text, sub}, ... },
       edges: { "CEDA>CE": "green" | {tone, k, o, w, bit, bitTone, bitSolid, dash}, ... },       // key: A7.ek(parent, child)
       pos:   { id: [x, y] },          // this frame's absolute centre for a node that moves (a leaf sliding, a merged node arriving);
                                        // its branches follow
       base:  { node: {...}, edge: {...} },   // the state of every node / edge you do NOT list. Default: hidden (k 0), so a growing
                                              // tree lists only what has appeared. base: {node: {tone: "grey"}, edge: {tone: "grey"}} shows all.
       o: 1,                           // opacity of the whole tree
   })
       NODE  tone (grey = white tile / circle with a grey rim, the rest tinted), solid (filled with the tone: in the tree, chosen),
             k 0..1 pop-in, o opacity, s scale, dx dy offset in px (a hop or shake), ring a tone name = a ring round it, ringK its pop-in,
             ringDash a dashed ring, text / sub override the label.
       EDGE  tone (default grey), k 0..1 how much of the branch is drawn, growing from the parent, w width multiplier, dash dashed,
             bit 0..1 pops in the 0 / 1 label that sits at the middle of the branch (a round sticker; the digit comes from the tree),
             bitTone its tone (default the branch's), bitSolid a solid sticker.
   T.pt(id) -> {x, y} the home centre of a node (use it to place tokens, tags, flying weights);  T.mid(parent, child, f = 0.5) -> {x, y} a
       point along a branch;  T.size(id) -> {w, h};  T.ids  all node ids;  T.keys  all branch keys;  T.el  the <svg>. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  const { clamp, ease: E } = V;
  const f1 = (n) => n.toFixed(1);
  const TONE_INK = { grey: "text-dim", green: "teal-ink", red: "rose-ink", orange: "amber-ink", blue: "blue-ink", purple: "violet-ink" };
  const tn = (t) => {
    if (!A7.TONES.includes(t)) throw new Error(`VID.a7: unknown tone "${t}" (use ${A7.TONES.join(", ")})`);
    return t;
  };
  const spec = (v) => (typeof v === "string" ? { tone: v } : v || {});
  const css = (e, o) => (Object.assign(e.style, o), e);
  const kidsOf = (n) => (n.kids || []).filter(Boolean);
  const isLeaf = (n) => kidsOf(n).length === 0;

  // ---------- layout ----------
  function treePos(tree, o = {}) {
    const { x0 = 20, slot = 120, top = 80, dy = 140, flat = 0 } = o;
    const pos = {};
    let li = 0;
    const maxD = Math.max(...Object.values(tree.nodes).map((n) => n.depth));
    (function walk(id) {
      const n = tree.nodes[id];
      if (isLeaf(n)) {
        const y = top + dy * (n.depth + (maxD - n.depth) * clamp(flat));
        pos[id] = [x0 + slot * (li++ + 0.5), y];
        return;
      }
      kidsOf(n).forEach(walk);
      const ks = kidsOf(n);
      pos[id] = [(pos[ks[0]][0] + pos[ks[ks.length - 1]][0]) / 2, top + dy * n.depth];
    })(tree.root);
    return pos;
  }

  // ---------- default labels ----------
  function defaultLabel(tree) {
    if (tree.merges)
      return (id, n) => (n.leaf ? { text: id, sub: A7.fmtW(n.w), kind: "leaf" } : { text: A7.fmtW(n.w), kind: "node" });
    return (id, n) => (n.leaf ? { text: n.leaf, sub: n.path, kind: "leaf" } : { text: "", kind: "dot" });
  }

  // ---------- the drawer ----------
  function tree(parent, o = {}) {
    const T = o.tree;
    const pos = o.pos;
    if (!T || !pos) throw new Error("VID.a7.tree: pass {tree, pos} (pos from A7.treePos)");
    const R = o.r ?? 38;
    const [LW, LH] = [o.leafW ?? 100, o.leafH ?? 92];
    const EW = o.ew ?? 8;
    const label = o.label || defaultLabel(T);
    const svg = V.s("svg", { width: 936, height: 640 });
    css(svg, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
    const [gEdges, gBits, gRings, gNodes] = [0, 1, 2, 3].map(() => svg.appendChild(V.s("g")));
    parent.append(svg);

    const P = (id) => {
      if (!pos[id]) throw new Error(`VID.a7.tree: unknown node "${id}"`);
      return { x: pos[id][0], y: pos[id][1] };
    };
    const N_ = {};
    Object.keys(T.nodes).forEach((id) => {
      const n = T.nodes[id];
      const lab = { kind: isLeaf(n) ? "leaf" : "dot", ...label(id, n) };
      const { x, y } = P(id);
      const leaf = lab.kind === "leaf";
      const rr = lab.kind === "dot" ? 18 : R;
      const [w, h] = leaf ? [LW, LH] : [rr * 2, rr * 2];
      const shape = (dy, ex) =>
        leaf
          ? V.s("rect", { x: f1(-w / 2), y: f1(-h / 2 + dy), width: w, height: h, rx: 22, ...ex })
          : V.s("circle", { cx: 0, cy: f1(dy), r: rr, ...ex });
      const lip = shape(5, {});
      const face = shape(0, { "stroke-width": 4 });
      const text = css(V.s("text", { "text-anchor": "middle", dy: ".36em", text: lab.text || "" }), { fontSize: `${leaf ? 40 : 30}px`, fontWeight: "900" });
      const sub = css(V.s("text", { "text-anchor": "middle", dy: ".36em", text: lab.sub || "" }), { fontSize: "28px", fontWeight: "800" });
      const ring = css(
        leaf ? V.s("rect", { x: f1(-w / 2 - 9), y: f1(-h / 2 - 9), width: w + 18, height: h + 18, rx: 30, fill: "none", "stroke-width": 6 }) : V.s("circle", { cx: 0, cy: 0, r: rr + 13, fill: "none", "stroke-width": 6 }),
        { stroke: "var(--c)" },
      );
      const g = V.s("g", { class: "c-grey" }, lip, face, text, sub);
      const rg = V.s("g", {}, ring);
      gNodes.append(g);
      gRings.append(rg);
      N_[id] = { id, x, y, w, h, leaf, lab, lip, face, text, sub, g, rg, ring };
    });
    const E_ = {};
    T.edges.forEach(([p, c, bit]) => {
      const key = A7.ek(p, c);
      const line = css(V.s("path", { fill: "none", "stroke-linecap": "round" }), { stroke: "var(--c)" });
      const face = V.s("circle", { r: 22, "stroke-width": 3 });
      const lip = V.s("circle", { r: 22, cy: 3 });
      const txt = css(V.s("text", { "text-anchor": "middle", dy: ".36em", text: String(bit) }), { fontSize: "28px", fontWeight: "900", fontFamily: "var(--mono)" });
      const bg = V.s("g", {}, lip, face, txt);
      gEdges.append(line);
      gBits.append(bg);
      E_[key] = { key, p, c, bit, line, bg, face, lip, txt };
    });
    const node = (id) => {
      if (!N_[id]) throw new Error(`VID.a7.tree: unknown node "${id}" (ids: ${Object.keys(N_).join(", ")})`);
      return N_[id];
    };
    const edge = (key) => {
      if (!E_[key]) throw new Error(`VID.a7.tree: no branch "${key}" (keys: ${Object.keys(E_).join(", ")})`);
      return E_[key];
    };

    function update(st = {}) {
      Object.keys(st.nodes || {}).forEach(node);
      Object.keys(st.edges || {}).forEach(edge);
      const base = st.base || {};
      const at = {};
      Object.values(N_).forEach((n) => {
        const ov = (st.pos || {})[n.id];
        at[n.id] = ov ? { x: ov[0], y: ov[1] } : { x: n.x, y: n.y };
        const s = { k: 0, ...base.node, ...spec((st.nodes || {})[n.id]) };
        const tone = tn(s.tone || "grey");
        const solid = !!s.solid;
        n.g.setAttribute("class", `c-${tone}`);
        css(n.face, { fill: solid ? "var(--c)" : tone === "grey" ? "var(--panel)" : "var(--c-dim)", stroke: solid ? "var(--c-lip)" : "var(--c-edge)" });
        n.lip.style.fill = solid ? "var(--c-lip)" : "var(--c-edge)";
        const [tx, sb] = [s.text ?? n.lab.text ?? "", s.sub ?? n.lab.sub ?? ""];
        if (n.text.textContent !== tx) n.text.textContent = tx;
        if (n.sub.textContent !== sb) n.sub.textContent = sb;
        n.text.style.fill = solid ? "var(--c-on)" : "var(--ink)";
        n.sub.style.fill = solid ? "var(--c-on)" : "var(--ink)";
        n.text.setAttribute("y", sb ? "-12" : "0");
        n.sub.setAttribute("y", "26");
        const k = clamp(s.k ?? 1);
        V.place(n.g, { x: at[n.id].x + (s.dx || 0), y: at[n.id].y + (s.dy || 0), s: (s.s ?? 1) * (0.6 + 0.4 * E.pop(k)), o: Math.min(1, k * 4) * (s.o ?? 1) * (st.o ?? 1) });
        const rk = s.ring ? clamp(s.ringK ?? 1) : 0;
        if (s.ring) n.rg.setAttribute("class", `c-${tn(s.ring)}`);
        n.ring.style.strokeDasharray = s.ringDash ? "14 10" : "";
        V.place(n.rg, { x: at[n.id].x + (s.dx || 0), y: at[n.id].y + (s.dy || 0), s: 0.92 + 0.08 * E.out(rk), o: Math.min(1, rk * 3) * (s.o ?? 1) * (st.o ?? 1) });
      });
      Object.values(E_).forEach((e) => {
        const s = { k: 0, ...base.edge, ...spec((st.edges || {})[e.key]) };
        const tone = tn(s.tone || "grey");
        const [a, b] = [at[e.p], at[e.c]];
        const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const k = clamp(s.k ?? 1);
        e.line.setAttribute("class", `c-${tone}`);
        e.line.setAttribute("d", `M${f1(a.x)} ${f1(a.y)}L${f1(b.x)} ${f1(b.y)}`);
        e.line.style.strokeWidth = `${f1(EW * (s.w ?? 1))}px`;
        if (s.dash) {
          e.line.style.strokeDasharray = `${f1(EW * 1.8)} ${f1(EW * 1.4)}`;
          V.show(e.line, k < 0.003 ? 0 : (s.o ?? 1) * (st.o ?? 1));
        } else {
          e.line.style.strokeDasharray = k >= 0.999 ? "" : `${f1(k * len)} ${f1(len * 2)}`;
          V.show(e.line, k < 0.003 ? 0 : (s.o ?? 1) * (st.o ?? 1));
        }
        const bk = clamp(s.bit ?? 0);
        const bt = tn(s.bitTone || tone);
        const solid = !!s.bitSolid;
        e.bg.setAttribute("class", `c-${bt}`);
        css(e.face, { fill: solid ? "var(--c)" : bt === "grey" ? "var(--panel)" : "var(--c-dim)", stroke: solid ? "var(--c-lip)" : "var(--c-edge)" });
        e.lip.style.fill = solid ? "var(--c-lip)" : "var(--c-edge)";
        e.txt.style.fill = solid ? "var(--c-on)" : bt === "grey" ? "var(--ink)" : `var(--${TONE_INK[bt]})`;
        const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        V.place(e.bg, { x: m.x, y: m.y, s: 0.6 + 0.4 * E.pop(bk), o: Math.min(1, bk * 4) * (s.o ?? 1) * (st.o ?? 1) });
      });
      V.show(svg, 1);
    }

    return {
      el: svg,
      update,
      ids: Object.keys(N_),
      keys: Object.keys(E_),
      pt: (id) => ({ x: node(id).x, y: node(id).y }),
      size: (id) => ({ w: node(id).w, h: node(id).h }),
      mid: (p, c, f = 0.5) => {
        const [a, b] = [node(p), node(c)];
        return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
      },
    };
  }

  Object.assign(A7, { treePos, tree });
})();
