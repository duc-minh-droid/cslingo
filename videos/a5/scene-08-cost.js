/* Phase 5 · scene 08-cost (17.6 s): WHICH IS CHEAPER DEPENDS ON THE HULL. Cost = how many steps (one step = looking at one point).
   Both methods are drawn as towers of slabs, and every slab is one pass over all n = 1,024 points (1,024 steps):
   - gift wrapping makes one sweep per hull corner, so its tower has h slabs (n x h steps): 4 corners, 4 slabs, 4,096 steps;
   - the scan sorts first, and sorting halves the list again and again: 1,024 > 512 > ... > 1 takes 10 halvings (log2 1,024 = 10),
     each a pass over every point, so its tower has 10 slabs (n x log2 n = 10,240 steps); the stack pass after the sort is one more
     cheap pass that the sort dwarfs ("about").
   Fewer slabs wins. With a small hull (a blob, 4 corners) wrapping has 4 slabs against 10: wrapping wins. With a ring (every
   point a corner, h = 1,024) the wrap tower climbs past the scan's 10 slabs (they tie at h = 10, marked by a level line), off the
   top of the picture (a break mark): 1,048,576 steps against 10,240, about 100 times more: the scan wins. Lesson 5.6's own numbers.
   Every number comes from A5.COST (asserted below); the clouds are a picture of the SHAPE (fewer dots than 1,024), the tags carry
   the numbers; a tower is drawn with at most 14 slabs, the count above it says the rest.
   Story (local seconds): 0.2-1.1 the blob's dots, 1.1-1.7 its 4 corners turn green, 2.1 'n x h', 2.4-4.2 the 4 wrap slabs,
   5.9-7.6 the halving chain, 7.8 'log2 1,024 = 10', 8.1 'n x log2 n', 8.3-10.35 the 10 scan slabs, 10.7 verdict (wrap wins),
   11.6-12.0 the chain leaves, 12.2-13.0 the ring replaces the blob, 13.1-14.84 the wrap tower climbs, 14.0 the tie, 15.2 verdict
   (scan wins), 15.8 'about 100 x more', 15.8-18 hold. */
(function () {
  const V = window.VID;
  const A5 = V.a5;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const lin = E.lin;
  const com = A5.commas;

  // ---------- the numbers (all from the real cost formulas) ----------
  const C = A5.COST;
  const [SMALL, BIG] = C.cases;
  A5.same(
    "scene 8: cost",
    [C.n, C.scan, C.tie, C.cases.map((c) => [c.h, c.wrap, c.scan, c.winner])],
    [1024, 10240, 10, [[4, 4096, 10240, "wrap"], [1024, 1048576, 10240, "scan"]]], // prettier-ignore
  );
  const N = C.n;
  const LOG = A5.log2n(N);
  A5.same("scene 8: log2 n", LOG, 10);
  A5.same("scene 8: blob corners", A5.cloudHull(A5.BLOB).length, SMALL.h);
  A5.same("scene 8: ring corners", A5.cloudHull(A5.RING).length, 48);
  const RATIO = Math.round(BIG.wrap / BIG.scan / 100) * 100; // 102.4 -> "about 100 times"
  A5.same("scene 8: how many times dearer", RATIO, 100);
  // the halving chain: 1,024, 512, ..., 1, and the number of halvings is log2 n
  const CHAIN = Array.from({ length: LOG + 1 }, (_, i) => N / 2 ** i);
  A5.same("scene 8: the chain ends at 1 after log2 n halvings", [CHAIN[CHAIN.length - 1], CHAIN.length - 1], [1, LOG]);
  A5.same(
    "scene 8: slabs: h for wrapping, log2 n for the scan, steps = n per slab",
    [SMALL.wrap / N, C.scan / N],
    [SMALL.h, LOG],
  );
  A5.same("scene 8: wrap against scan with the ring", BIG.wrap / N, BIG.h);

  // ---------- layout (stage px) ----------
  const FLOOR = 500; // the towers stand on this line
  const PITCH = 30; // one slab: 22 px of face, a 4 px lip and a 4 px gap
  const SLAB_H = 22;
  const W = 190; // tower width
  const WX = 290; // wrap tower
  const SX = 690; // scan tower
  const BOX = 200; // the dot clouds live in a 200 px box
  const CLOUD = { x: 36, y: 270 };
  const GAP_X = (WX + W + SX) / 2; // the middle of the gap between the towers
  const MAX_SLABS = 14; // a taller tower is cut off by a break mark
  const topOf = (q) => FLOOR - q * PITCH + 4; // the top of the highest of q slabs

  /* The blob picture, spread out: the first four dots are the hull corners and stay put; the other dots keep inside the hull
     (clear of its edges) and are pushed apart until none touch, so the picture reads as a cloud and not a clump. */
  function spread(cloud) {
    const P = cloud.map((p) => p.slice());
    const cor = P.slice(0, 4);
    const edge = (i) => [cor[i], cor[(i + 1) % 4]];
    const GAP = 0.085; // unit-box distance between two dots
    const MARGIN = 0.045; // clearance from the hull's edges
    for (let it = 0; it < 120; it++) {
      for (let i = 4; i < P.length; i++) {
        for (let j = 0; j < P.length; j++) {
          if (j === i) continue;
          const d = Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]) || 1e-6;
          if (d >= GAP) continue;
          const push = (GAP - d) * (j < 4 ? 0.5 : 0.25); // a corner never moves: the dot moves for both
          P[i][0] += ((P[i][0] - P[j][0]) / d) * push;
          P[i][1] += ((P[i][1] - P[j][1]) / d) * push;
        }
        for (let e = 0; e < 4; e++) {
          const [a, b] = edge(e);
          const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
          const dist = ((b[0] - a[0]) * (P[i][1] - a[1]) - (b[1] - a[1]) * (P[i][0] - a[0])) / len; // > 0 inside
          if (dist < MARGIN) {
            P[i][0] += (-(b[1] - a[1]) / len) * (MARGIN - dist);
            P[i][1] += ((b[0] - a[0]) / len) * (MARGIN - dist);
          }
        }
      }
    }
    return P;
  }
  const BLOB = spread(A5.BLOB);
  A5.same(
    "scene 8: spread blob corners",
    A5.cloudHull(BLOB).sort((a, b) => a - b),
    [0, 1, 2, 3],
  );
  const closest = Math.min(
    ...BLOB.flatMap((p, i) => BLOB.slice(i + 1).map((q) => Math.hypot(p[0] - q[0], p[1] - q[1]))),
  );
  A5.same("scene 8: no two blob dots touch", closest * BOX > 14, true);

  // ---------- timeline ----------
  const T = {
    blob: { dots: [0.2, 1.1], green: [1.1, 1.5], outline: [1.3, 1.9] },
    ring: { dots: [12.2, 13.0], green: [12.5, 13.0], outline: [12.6, 13.2] },
    verdict1: 10.7, // wrap wins
    reset: 12.2, // both towers go neutral again for the ring
    tie: 14.0, // the 10th wrap slab is done
    verdict2: 15.2, // scan wins
  };
  const WRAP_AT = [2.4, 2.85, 3.3, 3.75, ...Array.from({ length: MAX_SLABS - 4 }, (_, i) => 13.1 + 0.14 * i)]; // each wrap slab starts
  const SCAN_AT = Array.from({ length: LOG }, (_, i) => 8.3 + 0.2 * i); // each scan slab starts
  const FILL = (i) => (i < 4 ? 0.35 : 0.2); // a wrap slab fills in this long, sweeping from left to right
  A5.same("scene 8: the tenth wrap slab is done at the tie", Math.round((WRAP_AT[9] + FILL(9)) * 100) / 100, T.tie);
  const CHAIN_AT = (i) => 5.9 + 0.17 * i; // tile i of the chain pops
  const TILE_W = [100, 58];
  const CHAIN_X = [38, 38 + TILE_W[0] + 18];

  // ---------- a tower of slabs ----------
  function tower(parent, { x, n }) {
    const svg = V.s("svg", { width: 936, height: 640 });
    Object.assign(svg.style, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
    const floor = V.s("line", {
      x1: x - 8,
      x2: x + W + 8,
      y1: FLOOR + 6,
      y2: FLOOR + 6,
      "stroke-width": 6,
      "stroke-linecap": "round",
    });
    floor.style.stroke = "var(--line-2)";
    svg.append(floor);
    const slabs = Array.from({ length: n }, (_, i) => {
      const y = topOf(i + 1);
      const lip = V.s("rect", { x, y: y + 4, height: SLAB_H, rx: 8 });
      const face = V.s("rect", { x, y, height: SLAB_H, rx: 8, "stroke-width": 3 });
      lip.style.fill = "var(--c-lip)";
      Object.assign(face.style, { fill: "var(--c)", stroke: "var(--c-lip)" });
      const g = svg.appendChild(V.s("g", {}, lip, face));
      return { g, lip, face };
    });
    parent.append(svg);
    return {
      set(i, { k = 0, tone = "grey", o = 1, s = 1 }) {
        const sl = slabs[i];
        const cls = `c-${tone}`;
        if (sl.g.getAttribute("class") !== cls) sl.g.setAttribute("class", cls);
        const w = k < 0.003 ? 0 : Math.max(14, W * k);
        [sl.lip, sl.face].forEach((r) => r.setAttribute("width", w.toFixed(1)));
        V.place(sl.g, { s, o: k < 0.003 ? 0 : o });
      },
      floor: (o) => V.show(floor, o),
    };
  }

  // ---------- a dot cloud: blob (corners green) or ring (all corners) ----------
  function cloudPlot(stage, cloud, blob, tm) {
    const pos = Object.fromEntries(cloud.map((c, i) => [`p${i}`, [CLOUD.x + c[0] * BOX, CLOUD.y + c[1] * BOX]]));
    const pl = A5.plot(stage, { pos, r: 6, letters: false, segs: 0, arcs: 0, polys: 1, tags: 0 });
    const hull = A5.cloudHull(cloud); // indices, in hull order
    const isCorner = new Set(hull);
    // the dots pop in at a seeded random order (a blob) or one after another round the ring
    const rnd = A5.rng(blob ? 11 : 3);
    const key = cloud.map((_, i) => (blob ? rnd() : i));
    const rank = key.map((k) => key.filter((o) => o < k).length);
    const n = cloud.length;
    const dotT = (i) => lerp(tm.dots[0], tm.dots[1] - 0.3, rank[i] / (n - 1));
    const greenT = (i) =>
      blob ? tm.green[0] + 0.1 * hull.indexOf(i) : lerp(tm.green[0], tm.green[1], rank[i] / (n - 1));
    return (t, o = 1) => {
      const points = {};
      cloud.forEach((_, i) => {
        const k = ramp(t, dotT(i), dotT(i) + 0.3, lin);
        const on = (blob ? isCorner.has(i) : true) && t >= greenT(i);
        const pulse = on ? flash(t, greenT(i), greenT(i) + 0.4) : 0;
        const big = blob && on ? lerp(1, 1.9, ramp(t, greenT(i), greenT(i) + 0.3)) : 1;
        points[`p${i}`] = {
          tone: on ? "green" : "grey",
          solid: on,
          s: E.pop(k) * big * (1 + 0.3 * pulse),
          o: Math.min(1, k * 4),
        };
      });
      const k = ramp(t, tm.outline[0], tm.outline[1], lin);
      pl.update({ points, polys: [{ pts: hull.map((i) => `p${i}`), tone: "green", fill: 0.3, w: 0.6, k }], o });
    };
  }

  // a tag that stays put at a fixed width (centred on cx), so a changing text never moves it
  function fixed(stage, cx, w, o) {
    const tag = A5.tag(stage, { x: cx - w / 2, y: 0, ...o });
    Object.assign(tag.el.style, { width: `${w}px`, justifyContent: "center" });
    return tag;
  }

  V.scene({
    kicker: "WRAP OR SCAN?",
    title: ["Which costs less?", "It depends on the hull"],
    dur: 17.6,
    caps: [
      [1, 2.4, "1,024 points, and only 4 are corners."],
      [2.5, 4, "One sweep checks all 1,024 points."],
      [4.1, 5.6, "4 corners, 4 sweeps: 4,096 steps."],
      [6, 7.7, "A sort halves the list again and again."],
      [7.8, 9, "Ten halvings: log₂ 1,024 = 10."],
      [9.1, 10.6, "The sort makes 10 passes: about 10,240 steps."],
      [10.8, 12, "Few corners: wrapping wins."],
      [12.3, 13.6, "Now every point is a corner."],
      [13.8, 15.1, "At 10 corners they tie. More, and wrapping loses."],
      [15.4, 17.3, "Scan wins. Wrapping costs about 100 times more."],
    ],
    build(stage) {
      const blob = cloudPlot(stage, BLOB, true, T.blob);
      const ring = cloudPlot(stage, A5.RING, false, T.ring);
      const nTag = A5.tag(stage, { x: 12, y: 208, text: `n = ${com(N)}`, tone: "grey" });
      const hTag = A5.tag(stage, { x: 12, y: 516, text: `h = ${SMALL.h} corners`, tone: "green", solid: true });

      const wrapT = tower(stage, { x: WX, n: MAX_SLABS });
      const scanT = tower(stage, { x: SX, n: LOG });
      const wrapF = fixed(stage, WX + W / 2, 190, { text: "wrap: n × h", tone: "grey" });
      const scanF = fixed(stage, SX + W / 2, 270, { text: "scan: n × log₂ n", tone: "grey" });
      [wrapF, scanF].forEach((f) => (f.el.style.top = `${FLOOR + 24}px`));
      const wrapC = fixed(stage, WX + W / 2, 210, { text: "0 steps", tone: "grey" });
      const scanC = fixed(stage, SX + W / 2, 214, { text: "0 steps", tone: "grey" });

      // the break mark on the top slab of the wrap tower: the real tower is far taller than the picture
      const brk = V.h("div", { style: { position: "absolute", left: "0", top: "0", width: "0", height: "0" } });
      const slash = [0, 1].map((i) =>
        V.h("div", {
          style: {
            position: "absolute",
            left: `${WX + W - 62 + i * 22}px`,
            top: `${topOf(MAX_SLABS) - 4}px`,
            width: "10px",
            height: `${SLAB_H + 8}px`,
            background: "var(--bg)",
            transform: "skewX(-22deg)",
          },
        }),
      );
      brk.append(...slash);
      stage.append(brk);

      // the level line at the height of the scan tower: where the wrap tower ties with it
      const tieY = topOf(LOG) - 6;
      const tieSvg = V.s("svg", { width: 936, height: 640 });
      Object.assign(tieSvg.style, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
      const tieLine = V.s("line", {
        x1: WX - 10,
        x2: SX + W + 10,
        y1: tieY,
        y2: tieY,
        "stroke-width": 4,
        "stroke-dasharray": "14 10",
      });
      tieLine.style.stroke = "var(--amber)";
      tieSvg.append(tieLine);
      stage.append(tieSvg);
      const tieTag = fixed(stage, GAP_X, 190, { text: "h = 10: tie", tone: "orange", solid: true });
      const winTag = fixed(stage, GAP_X, 190, { text: "wrap wins", tone: "green", solid: true });
      const win2Tag = fixed(stage, GAP_X, 190, { text: "scan wins", tone: "green", solid: true });
      const moreTag = fixed(stage, GAP_X, 206, { text: `≈ ${RATIO} × more`, tone: "red" });

      // the halving chain across the top: 1,024, 512, ..., 1 with an arrow between the tiles
      const first = A5.tiles(stage, {
        x: CHAIN_X[0],
        y: 20,
        items: [com(CHAIN[0])],
        w: TILE_W[0],
        h: 52,
        gap: 18,
        fs: 28,
        tone: "blue",
      });
      const rest = A5.tiles(stage, {
        x: CHAIN_X[1],
        y: 20,
        items: CHAIN.slice(1).map(com),
        w: TILE_W[1],
        h: 52,
        gap: 18,
        fs: 28,
        tone: "blue",
      });
      const svg = L5.svg(stage);
      const arrows = CHAIN.slice(1).map((_, i) => {
        const cx = CHAIN_X[0] + TILE_W[0] + 9 + i * (TILE_W[1] + 18);
        const p = V.s("path", {
          d: `M${cx - 5} 37L${cx + 6} 46L${cx - 5} 55Z`,
          "stroke-width": 3,
          "stroke-linejoin": "round",
        });
        Object.assign(p.style, { fill: "var(--blue)", stroke: "var(--blue)" });
        return svg.appendChild(p);
      });
      const halves = fixed(stage, 468, 410, { text: "1 halving", tone: "blue" });
      halves.el.style.top = "92px";

      const setTower = (tw, i, st) => tw.set(i, st);
      const wrapTone = (t) => (t < T.verdict1 ? "grey" : t < T.reset ? "green" : t < T.verdict2 ? "grey" : "red");
      const scanTone = (t) => (t < T.verdict1 ? "grey" : t < T.reset ? "red" : t < T.verdict2 ? "grey" : "green");
      const solidOf = (t) => t >= T.verdict1 && (t < T.reset || t >= T.verdict2);

      return (t) => {
        // ---- the clouds
        blob(t, 1 - ramp(t, T.reset, T.reset + 0.3, lin));
        ring(t);
        nTag.set({ k: ramp(t, 0.5, 0.85, lin) });
        const isRing = t >= T.reset + 0.6;
        hTag.set({
          text: isRing ? `h = ${com(BIG.h)}` : `h = ${SMALL.h} corners`,
          tone: isRing ? "red" : "green",
          k: isRing ? ramp(t, T.reset + 0.6, T.reset + 1, lin) : ramp(t, 1.5, 1.85, lin),
        });

        // ---- the wrap tower: a slab per sweep, one per corner
        const wf = WRAP_AT.map((a, i) => ramp(t, a, a + FILL(i), lin));
        const wt = wrapTone(t);
        wf.forEach((k, i) => {
          const tied = i === 9 ? 1 + 0.12 * flash(t, T.tie, T.tie + 0.4) : 1;
          setTower(wrapT, i, { k, tone: wt, s: tied, o: 1 });
        });
        wrapT.floor(ramp(t, 2.1, 2.5, lin));
        const started = wf.filter((k) => k > 0.003).length;
        const done = wf.reduce((a, k) => a + k, 0);
        // after the tie the number races up to the real total; the tower only shows its first 16 slabs
        const racing = ramp(t, T.tie, T.tie + 1.1, E.in);
        const sweeps = t < T.tie ? done : lerp(LOG, BIG.h, racing);
        const wrapSteps = t < T.tie ? Math.round(done * N) : Math.round(sweeps) * N;
        if (t >= T.tie + 1.1) A5.same("scene 8: the wrap total", wrapSteps, BIG.wrap);
        wrapF.set({ k: ramp(t, 2.1, 2.45, lin) });
        wrapC.el.style.width = t < T.tie ? "210px" : "280px";
        wrapC.el.style.left = `${WX + W / 2 - (t < T.tie ? 105 : 140)}px`;
        wrapC.set({
          text: `${com(wrapSteps)} steps`,
          tone: wt,
          solid: solidOf(t),
          k: ramp(t, WRAP_AT[0], WRAP_AT[0] + 0.3, lin),
          y: topOf(Math.max(1, started)) - 62,
        });
        V.show(brk, ramp(t, WRAP_AT[MAX_SLABS - 1] + 0.1, WRAP_AT[MAX_SLABS - 1] + 0.3, lin));

        // ---- the halving chain, then the scan tower: a slab per halving
        const chainOut = 1 - ramp(t, 11.6, 12.0, lin);
        const tileK = (i) => ramp(t, CHAIN_AT(i), CHAIN_AT(i) + 0.3, lin);
        first.set(0, { s: E.pop(tileK(0)), o: Math.min(1, tileK(0) * 4) * chainOut });
        rest.all((i) => ({ s: E.pop(tileK(i + 1)), o: Math.min(1, tileK(i + 1) * 4) * chainOut }));
        arrows.forEach((a, i) => V.show(a, Math.min(1, tileK(i + 1) * 4) * chainOut));
        const halved = CHAIN.slice(1).filter((_, i) => t >= CHAIN_AT(i + 1)).length;
        const sum = t >= 7.8;
        halves.set({
          text: sum ? `log₂ ${com(N)} = ${LOG}` : `${halved} halving${halved === 1 ? "" : "s"}`,
          tone: "blue",
          solid: sum,
          k: ramp(t, CHAIN_AT(1), CHAIN_AT(1) + 0.3, lin),
          o: chainOut,
        });
        const sf = SCAN_AT.map((a) => ramp(t, a, a + 0.25, lin));
        const st = scanTone(t);
        sf.forEach((k, i) => setTower(scanT, i, { k, tone: st }));
        scanT.floor(ramp(t, 8.1, 8.4, lin));
        scanF.set({ k: ramp(t, 8.1, 8.45, lin) });
        const scanDone = sf.reduce((a, k) => a + k, 0);
        scanC.set({
          text: `${com(Math.round(scanDone * N))} steps`,
          tone: st,
          solid: solidOf(t),
          k: ramp(t, SCAN_AT[0], SCAN_AT[0] + 0.3, lin),
          y: topOf(Math.max(1, sf.filter((k) => k > 0.003).length)) - 62,
        });

        // ---- verdicts and the tie
        const tieK = ramp(t, T.tie, T.tie + 0.4, lin) * (1 - ramp(t, T.verdict2 - 0.3, T.verdict2, lin));
        V.show(tieSvg, tieK);
        tieTag.set({
          y: tieY - 25,
          k: ramp(t, T.tie, T.tie + 0.35, lin),
          o: 1 - ramp(t, T.verdict2 - 0.3, T.verdict2, lin),
        });
        winTag.set({
          y: 300,
          k: ramp(t, T.verdict1 + 0.3, T.verdict1 + 0.65, lin),
          o: 1 - ramp(t, T.reset, T.reset + 0.3, lin),
        });
        win2Tag.set({ y: 262, k: ramp(t, T.verdict2 + 0.3, T.verdict2 + 0.65, lin) });
        moreTag.set({ y: 330, k: ramp(t, T.verdict2 + 0.6, T.verdict2 + 0.95, lin) });
      };
    },
  });
})();
