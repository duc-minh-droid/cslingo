/* Lecture 6 · Genetic programming, scene 06-mutation: subtree mutation in three moves.
   Left: the parent x² + 1 = (+ (x X X) 1). Right: its child, a copy that gets edited. The picture is a "diff": grey = unchanged,
   orange = the piece that is different.
   1. PICK: the parent grows in, centred. A pointer hops over the nodes and lands on the leaf 1 (it turns orange). The parent slides
      left, a copy slides out to the right, and every node except the chosen one turns grey.
   2. CUT: scissors snip the edge above the chosen subtree, it drops away and leaves a dashed hole.
   3. GROW: a dice rolls in the hole, then a fresh random subtree (+ X 1) pops in (orange), one node after another.
   The formulas appear last: x² + 1 for the parent and x² + (x + 1) = x² + x + 1 for the child, the new part in orange.
   Both trees are drawn from ONE layout (the child's), so the unchanged part sits exactly where it sat in the parent; the parent
   just hides the two nodes of the new subtree and shows its leaf 1 where the child has its new root. Every formula and size is
   computed from the real trees (L.parse, L.replaceSubtree, L.formula) and checked when the scene is built. */
(function () {
  const V = window.VID;
  const L = V.l6;
  const { h, s, place, show, ramp, ease, lerp, clamp, flash } = V;
  const lin = ease.lin;
  const pop = (t, a, d = 0.45) => ease.pop(ramp(t, a, a + d, lin));
  const fade = (t, a, d = 0.2) => ramp(t, a, a + d, lin);
  const f1 = (v) => v.toFixed(1);
  const pillW = (text) => Math.max(44, text.length * 16.8 + 26); // the width of a 28 px pill

  // ---------- the programs, built and checked with the real helpers ----------
  const PARENT = L.parse("(+#root (*#mul X#xa X#xb) 1#one)");
  const NEW_SUB = L.parse("(+ X 1)"); // the freshly grown random subtree
  const CHILD = L.replaceSubtree(PARENT, "one", NEW_SUB);
  const NEW_ROOT = CHILD.kids[1];
  const ID = {
    root: CHILD.id,
    mul: CHILD.kids[0].id,
    xa: CHILD.kids[0].kids[0].id,
    xb: CHILD.kids[0].kids[1].id,
    nw: NEW_ROOT.id, // the leaf 1 of the parent / the root of the new subtree
    nx: NEW_ROOT.kids[0].id,
    n1: NEW_ROOT.kids[1].id,
  };
  const KEPT = L.formula(CHILD.kids[0]); // x²
  const F_NEW = L.formula(NEW_SUB); // x + 1
  const F_PARENT = L.formula(PARENT);
  const F_CHILD = L.formula(CHILD);
  const SAME = [ID.root, ID.mul, ID.xa, ID.xb]; // the nodes that do not change
  if (F_PARENT !== `${KEPT} + 1` || F_NEW !== "x + 1" || F_CHILD !== `${KEPT} + ${F_NEW}`)
    throw new Error(`scene 06: formulas changed: ${F_PARENT} -> ${F_CHILD}`);
  // nodes are conserved except for the swapped piece: size(child) = size(parent) - size(cut) + size(new)
  if (L.size(CHILD) !== L.size(PARENT) - L.size(L.subtreeAt(PARENT, "one")) + L.size(NEW_SUB))
    throw new Error("scene 06: the child has the wrong size");
  if (L.POINTS.some(([x, y]) => Math.abs(L.fn(CHILD)(x) - y) > 1e-9))
    throw new Error("scene 06: the child should be x² + x + 1, the lecture's target");

  // ---------- timeline (local seconds) ----------
  const TREE_AT = 0.2; // the parent grows in, node by node, in the middle of the stage
  const PFORM_AT = 1; // the parent's formula
  const HOPS = [ID.mul, ID.xa, ID.root, ID.xb, ID.nw]; // the pointer visits these, the last one is the pick
  const HOP0 = 1.1;
  const HOP = 0.36; // seconds per node
  const MOVE = 0.2; // ... of which the pointer travels this long
  const ARR = HOPS.map((_, i) => HOP0 + i * HOP);
  const PICK = ARR[ARR.length - 1]; // 2.54: the leaf 1 is chosen
  const SLIDE = [2.95, 3.45]; // the parent slides to the left
  const COPY = [3.4, 4]; // the child slides out of the parent
  const GREY = 4.1; // everything but the chosen node turns grey
  const SCIS_IN = [4.2, 4.65]; // the scissors fly to the edge
  const SNIP = [4.75, 5.05]; // a first, open-and-shut snip
  const CUT = 5.3; // the second snip shuts: the subtree is cut off
  const FALL = 0.55; // ... and drops away
  const HOLE_AT = CUT + 0.35; // the dashed hole
  const DICE = [6.15, 6.85]; // the dice rolls in the hole
  const NEW_AT = { nw: 6.9, nx: 7.25, n1: 7.55 }; // the new subtree pops in
  const NEW_D = 0.55;
  const NEW_PILL = 7.9;
  const FORM_AT = [8.1, 8.7]; // the child's formula, then its simplified form

  // ---------- layout (stage px, 936 x 640) ----------
  const NODE = 68;
  const ROWS = 1.8;
  const TOP = 92;
  const PX = 222; // the parent's visible centre once it has slid left
  const MID = 468; // ... and before: the middle of the stage
  const CX = 706; // the child's centre
  const TAG_Y = 4;
  const CARD_Y = 456;
  const INK = "var(--ink)";
  const DIM = "var(--text-dim)";
  const ORG = "var(--amber-ink)";

  /** A neutral sticker dice with up to six pips; draw(x, y, scale, degrees, faces) shows that many pips. */
  function makeDice(parent) {
    const PIPS = {
      1: [[0, 0]],
      2: [[-1, -1], [1, 1]],
      3: [[-1, -1], [0, 0], [1, 1]],
      4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
      5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
      6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
    }; // prettier-ignore
    const lip = s("rect", { x: -22, y: -18, width: 44, height: 44, rx: 12 });
    const face = s("rect", { x: -22, y: -22, width: 44, height: 44, rx: 12, "stroke-width": 3 });
    lip.style.fill = "var(--line-2)";
    Object.assign(face.style, { fill: "var(--panel)", stroke: "var(--line-2)" });
    const pips = Array.from({ length: 6 }, () => {
      const c = s("circle", { r: 4.6 });
      c.style.fill = "var(--ink)";
      return c;
    });
    const g = s("g", {}, lip, face, ...pips);
    parent.append(g);
    return {
      draw(x, y, sc, r, n) {
        pips.forEach((c, i) => {
          const p = PIPS[n][i]; // an unused pip is hidden and parked at the centre
          c.setAttribute("cx", String(p ? p[0] * 11 : 0));
          c.setAttribute("cy", String(p ? p[1] * 11 : 0));
          show(c, p ? 1 : 0);
        });
        g.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(r)}) scale(${Math.max(0, sc).toFixed(3)})`);
        show(g, sc > 0.01 ? 1 : 0);
      },
    };
  }

  /** The pointer: an orange arrow whose tip is at (0, 0). */
  function makeCursor(parent) {
    const d = "M0 0L0 34L9 26L15 40L22 37L16 24L28 24Z";
    const attrs = { d, "stroke-width": 4, "stroke-linejoin": "round" };
    const lip = s("path", { ...attrs, transform: "translate(0 4)" });
    const face = s("path", attrs);
    lip.style.fill = lip.style.stroke = "var(--c-lip)";
    face.style.fill = "var(--c)";
    face.style.stroke = "var(--c-lip)";
    const g = s("g", { class: "c-orange" }, lip, face);
    parent.append(g);
    return {
      draw(x, y, o) {
        g.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) scale(1.3)`);
        show(g, o);
      },
    };
  }

  /** The hole the cut leaves: a dashed orange outline with a question mark. */
  function makeHole(parent) {
    const rect = s("rect", {
      x: -NODE / 2,
      y: -NODE / 2,
      width: NODE,
      height: NODE,
      rx: NODE * 0.3,
      "stroke-width": 5,
      "stroke-dasharray": "13 9",
    });
    Object.assign(rect.style, { fill: "var(--amber-dim)", stroke: "var(--amber)" });
    const q = s("text", { "text-anchor": "middle", y: f1(NODE * 0.2) }, "?");
    Object.assign(q.style, { fontSize: `${f1(NODE * 0.56)}px`, fontWeight: "900", fill: "var(--amber-ink)" });
    const g = s("g", {}, rect, q);
    parent.insertBefore(g, parent.firstChild); // behind the tiles
    return {
      draw(x, y, sc, o) {
        g.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) scale(${Math.max(0, sc).toFixed(3)})`);
        show(g, o);
      },
    };
  }

  V.scene({
    kicker: "MUTATION",
    title: ["Mutation: swap in", "a new subtree"],
    dur: 10,
    caps: [
      [0.4, 3, "Pick a node at random."],
      [3.5, 6, "Cut off its subtree."],
      [6.3, 9.5, "Grow a new random subtree in its place."],
    ],
    build(stage) {
      // ----- HTML under the shared SVG layer: the two tags and the two formula cards -----
      const tagBox = (cx, tag) =>
        h(
          "div",
          {
            style: {
              position: "absolute",
              left: `${cx - 120}px`,
              top: `${TAG_Y}px`,
              width: "240px",
              display: "flex",
              justifyContent: "center",
            },
          },
          tag,
        );
      const parentTag = h("div", { class: "v-tag c-grey", text: "parent", style: { position: "relative" } });
      const childTag = h("div", { class: "v-tag solid c-blue", text: "child", style: { position: "relative" } });
      const tagP = tagBox(PX, parentTag);
      const tagC = tagBox(CX, childTag);

      const tok = (text) => h("span", { text, style: { whiteSpace: "pre" } });
      const row = (size, ...spans) =>
        h(
          "div",
          { style: { fontSize: `${size}px`, fontWeight: "900", lineHeight: "1.12", whiteSpace: "pre" } },
          ...spans,
        );
      const card = (cx, w, hgt, ...rows) =>
        h(
          "div",
          {
            class: "v-card plain",
            style: {
              left: `${cx - w / 2}px`,
              top: `${CARD_Y}px`,
              width: `${w}px`,
              height: `${hgt}px`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            },
          },
          ...rows,
        );
      const pToks = [tok(KEPT), tok(" + "), tok("1")];
      const pCard = card(PX, 300, 100, row(56, ...pToks));
      const c1 = [tok(KEPT), tok(" + "), tok("("), tok(F_NEW), tok(")")];
      const c2 = [tok("= "), tok(KEPT), tok(" + "), tok(F_NEW)];
      const line2 = row(46, ...c2);
      const cCard = card(CX, 420, 168, row(56, ...c1), line2);
      stage.append(tagP, tagC, pCard, cCard);

      // ----- SVG: two trees from one layout, the hole, pills, pointer, dice -----
      const treeBox = { root: CHILD, x: CX - 200, y: TOP, w: 400, h: 380, node: NODE, rows: ROWS, room: 0, hidden: true };
      const trP = L.tree(stage, treeBox); // the parent (the new subtree's two nodes stay hidden, its leaf 1 sits at the new root)
      const trC = L.tree(stage, treeBox); // the child
      if (trC.scale !== 1) throw new Error("scene 06: the tree does not fit its box");
      const vis = trP.nodes.filter((n) => n.id !== ID.nx && n.id !== ID.n1);
      const visL = Math.min(...vis.map((n) => n.cx - n.w / 2));
      const visR = Math.max(...vis.map((n) => n.cx + n.w / 2));
      const PDX = [MID, PX].map((c) => c - (visL + visR) / 2); // shift of the parent: centred, then slid left
      const pdx = (t) => lerp(PDX[0], PDX[1], ease.inOut(ramp(t, SLIDE[0], SLIDE[1], lin)));
      const pp = (id, t = SLIDE[1]) => ({ x: trP.pos(id).x + pdx(t), y: trP.pos(id).y }); // where the parent's node is drawn
      [...vis.map((n) => [n.cx + PDX[0], n]), ...vis.map((n) => [n.cx + PDX[1], n]), ...trC.nodes.map((n) => [n.cx, n])].forEach(
        ([x, n]) => {
          if (x - n.w / 2 < 12 || x + n.w / 2 > 924 || n.cy + n.h / 2 + 8 > 628) throw new Error(`scene 06: ${n.id} is off the stage`);
        },
      );
      const lay = L.layer(stage);
      const holeEdge = s("path", { fill: "none", "stroke-width": 6, "stroke-dasharray": "10 9", "stroke-linecap": "round" });
      holeEdge.style.stroke = "var(--amber)";
      lay.edges.append(holeEdge);
      const hole = makeHole(lay.nodes);
      const copyPill = L.pill(stage, "copy", { tone: "grey", look: "soft", o: 0 });
      const sameText = "same";
      const samePill = L.pill(stage, sameText, { tone: "grey", look: "soft", o: 0 });
      const newText = "new";
      const newPill = L.pill(stage, newText, { tone: "orange", o: 0 });
      const ripple = s("circle", { class: "c-orange", fill: "none", "stroke-width": 5 });
      ripple.style.stroke = "var(--c)";
      lay.badges.append(ripple);
      const cursor = makeCursor(lay.badges);
      const dice = makeDice(lay.badges);
      // HTML drawn above the layer: the copy arrow and the scissors
      const arrow = L.arrow(48, "grey");
      const SCIS = 72;
      const scissors = L.scissors(SCIS, "orange");
      stage.append(arrow, scissors);

      const TIP = HOPS.map((id) => ({ x: pp(id, 0).x + 16, y: pp(id, 0).y + 20 })); // where the pointer's tip rests on each node
      const START = { x: TIP[0].x - 70, y: TIP[0].y + 110 };
      // the edge that gets cut: the curve from the root to the new root, and a point on it for the scissors
      const [ex1, ey1] = trC.anchor(ID.root);
      const hp = trC.pos(ID.nw);
      const ey2 = hp.y - NODE / 2;
      const eym = (ey1 + ey2) / 2;
      const bez = (u) => {
        const m = 1 - u;
        return [
          m * m * m * ex1 + 3 * m * m * u * ex1 + 3 * m * u * u * hp.x + u * u * u * hp.x,
          m * m * m * ey1 + 3 * m * m * u * eym + 3 * m * u * u * eym + u * u * u * ey2,
        ];
      };
      holeEdge.setAttribute("d", `M${f1(ex1)} ${f1(ey1)}C${f1(ex1)} ${f1(eym)} ${f1(hp.x)} ${f1(eym)} ${f1(hp.x)} ${f1(ey2)}`);
      const [cutX, cutY] = bez(0.55);
      const JAW = { x: cutX + 18, y: cutY }; // the scissors' pivot while cutting
      const AWAY = { x: JAW.x + 150, y: JAW.y - 90 };

      // ----- the parent tree -----
      function drawParent(t) {
        [ID.root, ID.mul, ID.nw, ID.xa, ID.xb].forEach((id, i) =>
          trP.reveal(id, ramp(t, TREE_AT + i * 0.15, TREE_AT + i * 0.15 + 0.55, lin)),
        );
        trP.set([ID.nx, ID.n1], { o: 0 });
        trP.set(trP.all(), { dx: pdx(t) });
        trP.set(ID.nw, { label: "1", tone: "blue" });
        HOPS.slice(0, -1).forEach((id, i) => {
          // the pointer sits on a node: a ring and a small bump
          const on = fade(t, ARR[i] - 0.04, 0.04) * (1 - fade(t, ARR[i + 1] - MOVE, 0.06));
          if (on > 0) trP.set(id, { halo: 0.7 * on, pulse: 0.45 * on });
        });
        if (t >= GREY) trP.set(SAME, { tone: "grey", look: "soft" });
        if (t >= PICK) trP.set(ID.nw, { tone: "orange", halo: 1, pulse: 0.8 * flash(t, PICK, PICK + 0.35) });
        trP.draw();
      }

      // ----- the child tree: copy, cut, grow -----
      function drawChild(t) {
        const ck = ramp(t, COPY[0], COPY[1], ease.out);
        const seen = fade(t, COPY[0], 0.2);
        [ID.root, ID.mul, ID.xa, ID.xb, ID.nw].forEach((id) => {
          const a = pp(id);
          const b = trC.pos(id);
          trC.set(id, { dx: (1 - ck) * (a.x - b.x), dy: (1 - ck) * (a.y - b.y), o: seen });
        });
        if (t >= GREY) trC.set(SAME, { tone: "grey", look: "soft" });
        if (t < CUT) trC.set(ID.nw, { label: "1", tone: "orange", halo: 1 });
        else if (t < NEW_AT.nw) {
          // cut off: the leaf drops away; the real edge is gone, the dashed one marks the hole
          const u = clamp((t - CUT) / FALL);
          trC.set(ID.nw, {
            label: "1",
            tone: "orange",
            halo: 1 - u,
            dx: 40 * u,
            dy: 150 * ease.in(u),
            r: 30 * u,
            o: 1 - ramp(u, 0.45, 1, lin),
            ek: 1,
            eo: 0,
          });
        } else {
          trC.set(ID.nw, {
            tone: "orange",
            o: fade(t, NEW_AT.nw, 0.1),
            s: pop(t, NEW_AT.nw),
            pulse: 0.6 * flash(t, NEW_AT.nw + 0.1, NEW_AT.nw + 0.5),
          });
        }
        [ID.nx, ID.n1].forEach((id) => {
          const a = NEW_AT[id === ID.nx ? "nx" : "n1"];
          trC.reveal(id, ramp(t, a, a + NEW_D, lin));
          trC.set(id, { tone: "orange", pulse: 0.6 * flash(t, a + 0.15, a + 0.55) });
        });
        trC.draw();

        // the dashed hole and its edge
        const holeO = t >= HOLE_AT ? 1 - ramp(t, NEW_AT.nw, NEW_AT.nw + 0.12, lin) : 0;
        hole.draw(hp.x, hp.y, pop(t, HOLE_AT, 0.4), holeO);
        show(holeEdge, holeO);
      }

      // ----- the extras: pointer, ripple, copy arrow, scissors, dice, pills -----
      function drawPointer(t) {
        let p = START;
        let prev = START;
        TIP.forEach((to, i) => {
          const u = ease.inOut(ramp(t, ARR[i] - MOVE, ARR[i], lin));
          if (u > 0) p = { x: lerp(prev.x, to.x, u), y: lerp(prev.y, to.y, u) };
          prev = to;
        });
        cursor.draw(p.x, p.y, fade(t, ARR[0] - MOVE - 0.3, 0.2) * (1 - fade(t, SLIDE[0] - 0.1, 0.25)));
        const k = clamp((t - PICK) / 0.55);
        const at = pp(ID.nw, t);
        ripple.setAttribute("cx", f1(at.x));
        ripple.setAttribute("cy", f1(at.y));
        ripple.setAttribute("r", f1(lerp(NODE * 0.55, NODE * 1.05, ease.out(k))));
        show(ripple, k > 0 && k < 1 ? 0.9 * (1 - k) : 0);
      }

      const gapMid = (Math.max(...vis.map((n) => n.cx + PDX[1] + n.w / 2)) + Math.min(...trC.nodes.map((n) => n.cx - n.w / 2))) / 2;
      function drawCopy(t) {
        // the arrow and its label sit between the two trees once the copy has landed, and leave before the cut
        const a = COPY[1] - 0.15;
        const o = fade(t, a, 0.2) * (1 - fade(t, GREY + 0.6, 0.3));
        const y = trP.row(1);
        place(arrow, { x: gapMid - 24, y: y - 24 + 12, s: pop(t, a, 0.4), o });
        copyPill.apply({ text: "copy", tone: "grey", look: "soft", x: gapMid, y: y - 38, s: pop(t, a, 0.4), o });
      }

      function drawScissors(t) {
        const fly = ease.out(ramp(t, SCIS_IN[0], SCIS_IN[1], lin));
        const leave = ease.in(ramp(t, CUT + 0.25, CUT + 0.75, lin));
        const x = lerp(AWAY.x, JAW.x, fly) + (AWAY.x - JAW.x) * leave;
        const y = lerp(AWAY.y, JAW.y, fly) + (AWAY.y - JAW.y) * leave;
        scissors.snip(Math.max(flash(t, SNIP[0], SNIP[1]), ramp(t, CUT - 0.15, CUT, ease.inOut)));
        place(scissors, {
          x: x - SCIS / 2,
          y: y - SCIS / 2,
          r: 180,
          s: pop(t, SCIS_IN[0], 0.35),
          o: fade(t, SCIS_IN[0], 0.15) * (1 - ramp(t, CUT + 0.45, CUT + 0.75, lin)),
        });
      }

      function drawDice(t) {
        const u = (t - DICE[0]) / 0.27; // one hop per 0.27 s, the face changes on each landing
        const hop = Math.abs(Math.sin(Math.PI * clamp(u - Math.floor(u))));
        const sc = pop(t, DICE[0], 0.3) * (1 - ramp(t, DICE[1], NEW_AT.nw + 0.1, lin));
        const n = [3, 5, 2, 6, 1, 4][Math.max(0, Math.floor(u)) % 6];
        dice.draw(hp.x, hp.y - 4 - 22 * hop, 1.4 * sc, (Math.floor(u) % 2 ? -1 : 1) * 24 * hop, n);
      }

      function drawPills(t) {
        const nw = trC.pos(ID.nw);
        newPill.apply({
          text: newText,
          tone: "orange",
          x: nw.x + NODE / 2 + 12 + pillW(newText) / 2,
          y: nw.y - 4,
          s: pop(t, NEW_PILL, 0.4),
          o: fade(t, NEW_PILL, 0.1),
        });
        const m = trC.pos(ID.mul);
        const xa = trC.pos(ID.xa);
        samePill.apply({
          text: sameText,
          tone: "grey",
          look: "soft",
          x: m.x,
          y: xa.y + NODE / 2 + 34,
          s: pop(t, GREY + 0.2, 0.4),
          o: fade(t, GREY + 0.2, 0.1),
        });
      }

      // ----- the tags and the formula cards (the parent's follow it when it slides) -----
      const color = (el, c) => el.style.color !== c && (el.style.color = c);
      function drawLabels(t) {
        const slide = pdx(t) - PDX[1]; // how far the parent is still to the right of its final place
        const tag = (el, a, x = 0) => place(el, { x, y: (1 - ease.out(fade(t, a, 0.3))) * 12, o: fade(t, a, 0.3) });
        tag(tagP, 0.2, slide);
        tag(tagC, COPY[0] + 0.1);
        const a = fade(t, PFORM_AT, 0.35);
        place(pCard, { x: slide, y: (1 - ease.out(a)) * 16, o: a });
        color(pToks[0], t >= GREY ? DIM : INK);
        color(pToks[1], INK);
        color(pToks[2], t >= PICK ? ORG : INK);
        const b = fade(t, FORM_AT[0], 0.35);
        place(cCard, { y: (1 - ease.out(b)) * 16, o: b });
        [DIM, INK, ORG, ORG, ORG].forEach((c, i) => color(c1[i], c));
        [INK, DIM, INK, ORG].forEach((c, i) => color(c2[i], c));
        const c = fade(t, FORM_AT[1], 0.3);
        place(line2, { y: (1 - ease.out(c)) * 10, o: c });
      }

      return (t) => {
        drawParent(t);
        drawChild(t);
        drawPointer(t);
        drawCopy(t);
        drawScissors(t);
        drawDice(t);
        drawPills(t);
        drawLabels(t);
      };
    },
  });
})();
