/* Lecture 6 · Genetic programming, scene 07-crossover: subtree crossover swaps two pieces, so the sizes change.
   Two parent cards side by side (parent 1 blue, parent 2 purple). Under each, a row of dots: one dot per node.
   1. GROW: both parents grow in, with their sizes (7 and 11 nodes) and their dots.
   2. PICK: a subtree in each parent turns orange and gets a size tag (3 nodes, 5 nodes); its dots turn orange too.
   3. SWAP: the two subtrees lift off, their edges let go, and they fly across on arcs (one over, one under) into each other's
      dashed hole. The rest of each tree slides into its child layout and the edges grow back at the landing. The orange dots
      fly across the same way.
   4. SIZES: the headers become Child 1 / Child 2 with 9 nodes each, and the sums 7 - 3 + 5 and 11 - 5 + 3 appear.
      The dots still total 18.
   Every tree, size and sum is computed from the real helpers (L.parse, L.swapSubtrees, L.size) and checked when the scene is
   built. Each frame draws the parents before the swap and the children after it; each node is positioned from t only. */
(function () {
  const V = window.VID;
  const L = V.l6;
  const { h, s, show, ramp, ease, lerp, flash } = V;
  const lin = ease.lin;
  const pop = (t, a, d = 0.45) => ease.pop(ramp(t, a, a + d, lin));
  const MINUS = "−";

  // ---------- the programs ----------
  const P1 = L.parse("(+#a1 (*#a2 X#a3 X#a4) (-#s1 X#s2 1#s3))"); // size 7
  const P2 = L.parse("(*#b1 (+#t1 X#t2 (*#t3 X#t4 2#t5)) (+#b2 (-#b3 X#b4 2#b5) 3#b6))"); // size 11
  const SUB1 = L.subtreeAt(P1, "s1"); // (- X 1), 3 nodes
  const SUB2 = L.subtreeAt(P2, "t1"); // (+ X (x X 2)), 5 nodes
  const [C1, C2] = L.swapSubtrees(P1, "s1", P2, "t1");
  const N = { p1: L.size(P1), p2: L.size(P2), s1: L.size(SUB1), s2: L.size(SUB2), c1: L.size(C1), c2: L.size(C2) };
  if (N.p1 !== 7 || N.p2 !== 11 || N.s1 !== 3 || N.s2 !== 5) throw new Error("scene 07: wrong parent sizes");
  if (N.c1 !== N.p1 - N.s1 + N.s2 || N.c2 !== N.p2 - N.s2 + N.s1 || N.c1 !== 9 || N.c2 !== 9)
    throw new Error("scene 07: wrong child sizes");
  if (N.p1 + N.p2 !== N.c1 + N.c2 || N.c1 + N.c2 !== 18) throw new Error("scene 07: nodes are not conserved");
  const KEEP1 = N.p1 - N.s1; // 4 nodes stay in parent 1
  const KEEP2 = N.p2 - N.s2; // 6 nodes stay in parent 2
  const IDS = {};
  const idsOf = (n) => {
    const out = [];
    L.walk(n, (x) => out.push(x.id));
    return out;
  };
  IDS.s1 = idsOf(SUB1);
  IDS.s2 = idsOf(SUB2);

  // ---------- timeline (local seconds) ----------
  const GROW1 = 0.3; // parent 1 grows in
  const GROW2 = 0.55; // parent 2 grows in
  const DOTS_AT = 1.9;
  const PICK1 = 2.1;
  const PICK2 = 2.6;
  const LIFT = 3.6; // the subtrees lift and their edges let go
  const SWITCH = 3.95; // from here the children are drawn (they sit exactly where the parents were)
  const FLY = [4.2, 6.0];
  const LAND = 6.0; // the edges grow back
  const SIZES = 6.7; // headers and counts change
  const SUMS = 7.3;

  // ---------- layout (stage px, 936 x 640) ----------
  const NODE = 46;
  const ROWS = 1.8;
  const CARD_H = 428;
  const CARD1 = { x: 0, w: 440 };
  const CARD2 = { x: 476, w: 460 };
  const TREE_Y = 72;
  const HEAD_Y = 34;
  const SUM_Y = 470;
  const DOT_Y = 528;
  const DOT_GAP = 34;
  const DOT_R = 11;
  const TOTAL_Y = 596;
  const ARC1 = -72; // subtree 1 flies over
  const ARC2 = 62; // subtree 2 flies under
  const DARC1 = -36;
  const DARC2 = 28;

  function build(stage) {
    const card = (c, tone) =>
      stage.append(
        h("div", {
          class: `v-card plain c-${tone}`,
          style: { left: `${c.x}px`, top: "0px", width: `${c.w}px`, height: `${CARD_H}px` },
        }),
      );
    card(CARD1, "blue");
    card(CARD2, "purple");

    const mk = (root, c) =>
      L.tree(stage, {
        root,
        x: c.x,
        y: TREE_Y,
        w: c.w,
        h: CARD_H - TREE_Y,
        node: NODE,
        rows: ROWS,
        room: 0,
        hidden: true,
      });
    const tP1 = mk(P1, CARD1);
    const tP2 = mk(P2, CARD2);
    const tC1 = mk(C1, CARD1);
    const tC2 = mk(C2, CARD2);
    if (Math.min(tP1.scale, tP2.scale, tC1.scale, tC2.scale) < 0.85) throw new Error("scene 07: trees too big");
    const pitch = tP1.row(1) - tP1.row(0);
    const holeA = L.tile(stage, "", { size: NODE, tone: "grey", look: "ghost" });
    const holeB = L.tile(stage, "", { size: NODE, tone: "grey", look: "ghost" });

    // header and size pills
    const mid = (c) => c.x + c.w / 2;
    // a pill that remembers its tone and look, so every frame passes them again
    const pill = (text, o) => {
      const p = L.pill(stage, text, { ...o });
      return { apply: (st) => p.apply({ tone: o.tone, look: o.look, text, ...st }) };
    };
    const headL = pill("Parent 1", { tone: "blue" });
    const headR = pill("Parent 2", { tone: "purple" });
    const cntL = pill("7 nodes", { tone: "blue", look: "soft" });
    const cntR = pill("11 nodes", { tone: "purple", look: "soft" });
    const tag1 = pill("3 nodes", { tone: "orange" });
    const tag2 = pill("5 nodes", { tone: "orange" });
    const sum1 = pill("", { tone: "blue" });
    const sum2 = pill("", { tone: "purple" });
    const total = pill("18 nodes in total, before and after", { tone: "grey", look: "soft" });

    // dots: one per node. kind: keep1 / keep2 / sub1 / sub2. Slots in the two rows before and after the swap.
    const dots = [];
    const x1 = CARD1.x + 24;
    const x2 = CARD2.x + 24;
    const slot = (row0, i) => [(row0 ? x2 : x1) + i * DOT_GAP, DOT_Y];
    for (let i = 0; i < KEEP1; i++) dots.push({ kind: "keep1", from: slot(0, i), to: slot(0, i) });
    for (let i = 0; i < N.s1; i++) dots.push({ kind: "sub1", from: slot(0, KEEP1 + i), to: slot(1, KEEP2 + i) });
    for (let i = 0; i < KEEP2; i++) dots.push({ kind: "keep2", from: slot(1, i), to: slot(1, i) });
    for (let i = 0; i < N.s2; i++) dots.push({ kind: "sub2", from: slot(1, KEEP2 + i), to: slot(0, KEEP1 + i) });
    const svg = s("svg", { width: 936, height: 640, viewBox: "0 0 936 640" });
    Object.assign(svg.style, {
      position: "absolute",
      left: "0px",
      top: "0px",
      overflow: "visible",
      pointerEvents: "none",
    });
    dots.forEach((d, i) => {
      d.el = s("circle", { r: DOT_R, "stroke-width": 3 });
      d.i = i;
      svg.append(d.el);
    });
    stage.append(svg);
    const DOT_COL = { keep1: "blue", keep2: "violet", sub1: "blue", sub2: "violet" };

    const allNodes = [tP1, tP2, tC1, tC2];
    const origin = (id) => (tP1.nodes.some((n) => n.id === id) ? tP1 : tP2);
    const isIn = (ids, id) => ids.includes(id);

    /* where a node is drawn at time t in a child tree: its parent-layout position slid into its child-layout position,
       plus an arc for the nodes of the subtree that crosses over */
    function childState(tr, id, k, arc, moving) {
      const o = origin(id).pos(id);
      const c = tr.pos(id);
      const dx = (o.x - c.x) * (1 - k);
      const dy = (o.y - c.y) * (1 - k) + (moving ? arc * Math.sin(Math.PI * k) : 0);
      return { dx, dy, x: c.x + dx, y: c.y + dy };
    }

    return (t) => {
      const k = ramp(t, FLY[0], FLY[1], ease.inOut);
      const inChild = t >= SWITCH;
      allNodes.forEach((tr) => tr.set(tr.all(), { o: 0 }));
      const roots = { 1: null, 2: null }; // current centre of each subtree's root

      if (!inChild) {
        [
          [tP1, GROW1, IDS.s1, PICK1, "s1"],
          [tP2, GROW2, IDS.s2, PICK2, "t1"],
        ].forEach(([tr, g0, subIds, pick, rootId], which) => {
          tr.nodes.forEach((n, i) => {
            const rv = ramp(t, g0 + i * 0.1, g0 + i * 0.1 + 0.6, lin);
            tr.reveal(n.id, rv);
            if (isIn(subIds, n.id)) {
              const on = t >= pick;
              tr.set(n.id, {
                tone: on ? "orange" : undefined,
                halo: on ? 0.9 * flash(t, pick, pick + 0.7) : 0,
                pulse: on ? 0.5 * flash(t, pick, pick + 0.5) : 0,
              });
              if (n.id === rootId) tr.set(n.id, { eo: 1 - ramp(t, LIFT, SWITCH, lin) });
            }
          });
          roots[which + 1] = tr.pos(rootId);
        });
      } else {
        [
          [tC1, IDS.s2, "t1", ARC2, 2],
          [tC2, IDS.s1, "s1", ARC1, 1],
        ].forEach(([tr, subIds, rootId, arc, which]) => {
          tr.nodes.forEach((n) => {
            const moving = isIn(subIds, n.id);
            const st = childState(tr, n.id, k, arc, moving);
            const props = { o: 1, dx: st.dx, dy: st.dy };
            if (moving) {
              props.tone = "orange";
              props.lift = t < LAND + 0.6;
              props.pulse = 0.5 * ramp(t, LIFT, SWITCH + 0.2) * (1 - ramp(t, LAND - 0.1, LAND + 0.4));
              if (n.id === rootId) props.ek = ramp(t, LAND, LAND + 0.5);
            }
            tr.set(n.id, props);
          });
          roots[which] = childState(tr, rootId, k, arc, true);
        });
      }
      allNodes.forEach((tr) => tr.draw());

      // dashed holes where the subtrees were
      const hole = (tile, a, b, o) => {
        tile.apply({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), o });
      };
      const holeO = ramp(t, SWITCH - 0.05, SWITCH + 0.3, lin) * (1 - ramp(t, LAND - 0.35, LAND + 0.05, lin));
      hole(holeA, tP1.pos("s1"), tC1.pos("t1"), holeO);
      hole(holeB, tP2.pos("t1"), tC2.pos("s1"), holeO);

      // headers and counts
      const kid = t >= SIZES;
      const hp = (pill, text, x, a) => {
        const p = kid ? pop(t, SIZES) : 1;
        pill.apply({
          x,
          y: HEAD_Y,
          text,
          s: kid ? 0.85 + 0.15 * p : 1,
          o: pop(t, a, 0.4) > 0 ? Math.min(1, pop(t, a, 0.4)) : 0,
        });
      };
      hp(headL, kid ? "Child 1" : "Parent 1", CARD1.x + 100, GROW1);
      hp(headR, kid ? "Child 2" : "Parent 2", CARD2.x + 100, GROW2);
      const cp = (pill, text, x, a) => {
        const p = kid ? ease.pop(ramp(t, SIZES + 0.1, SIZES + 0.55, lin)) : pop(t, a, 0.4);
        pill.apply({ x, y: HEAD_Y, text, s: Math.max(0, kid ? 0.8 + 0.2 * p : p), o: t >= a ? 1 : 0 });
      };
      cp(cntL, kid ? `${N.c1} nodes` : `${N.p1} nodes`, CARD1.x + CARD1.w - 90, 1.7);
      cp(cntR, kid ? `${N.c2} nodes` : `${N.p2} nodes`, CARD2.x + CARD2.w - 90, 1.9);

      // size tags that ride under each chosen subtree
      const tagO = (a) => Math.min(pop(t, a, 0.4), 1) * (1 - ramp(t, LAND - 0.3, LAND, lin));
      const subLeafRows = (n) => (L.depth(n) + 0) * pitch;
      if (roots[1])
        tag1.apply({
          x: roots[1].x,
          y: roots[1].y + subLeafRows(SUB1) + 54,
          o: tagO(PICK1 + 0.2),
          s: Math.min(1, pop(t, PICK1 + 0.2, 0.4)),
        });
      if (roots[2])
        tag2.apply({
          x: roots[2].x,
          y: roots[2].y + subLeafRows(SUB2) + 54,
          o: tagO(PICK2 + 0.2),
          s: Math.min(1, pop(t, PICK2 + 0.2, 0.4)),
        });

      // sums
      const sp = (pill, text, x) => {
        const p = pop(t, SUMS, 0.45);
        pill.apply({ x, y: SUM_Y, text, s: Math.max(0, p), o: t >= SUMS ? 1 : 0 });
      };
      sp(sum1, `${N.p1} ${MINUS} ${N.s1} + ${N.s2} = ${N.c1}`, mid(CARD1));
      sp(sum2, `${N.p2} ${MINUS} ${N.s2} + ${N.s1} = ${N.c2}`, mid(CARD2));

      // dots
      dots.forEach((d) => {
        const sub = d.kind.startsWith("sub");
        const kk = sub ? k : 0;
        const arc = d.kind === "sub1" ? DARC1 : DARC2;
        const x = lerp(d.from[0], d.to[0], kk);
        const y = lerp(d.from[1], d.to[1], kk) + (sub ? arc * Math.sin(Math.PI * kk) : 0);
        const picked = sub && t >= (d.kind === "sub1" ? PICK1 : PICK2);
        const col = picked ? "amber" : DOT_COL[d.kind];
        d.el.style.fill = `var(--${col === "amber" ? "amber" : col === "violet" ? "violet" : "blue"})`;
        d.el.style.stroke = `var(--${col}-lip)`;
        d.el.setAttribute("cx", x.toFixed(1));
        d.el.setAttribute("cy", y.toFixed(1));
        d.el.setAttribute(
          "r",
          (DOT_R * ease.pop(ramp(t, DOTS_AT + d.i * 0.04, DOTS_AT + d.i * 0.04 + 0.4, lin))).toFixed(2),
        );
        show(d.el, t >= DOTS_AT + d.i * 0.04 ? 1 : 0);
      });
      total.apply({
        x: 468,
        y: TOTAL_Y,
        s: Math.max(0, pop(t, DOTS_AT + 0.4, 0.45)) * (1 + 0.06 * flash(t, 8.8, 9.4)),
        o: t >= DOTS_AT + 0.4 ? 1 : 0,
      });
    };
  }

  V.scene({
    kicker: "CROSSOVER",
    title: ["Crossover: swap subtrees", "between two parents"],
    dur: 12,
    caps: [
      [0.4, 3, "Pick a point in each parent."],
      [3.5, 7.2, "Swap the two subtrees."],
      [7.3, 12, "Same nodes, but the children have new sizes."],
    ],
    build,
  });
})();
