/* Phase 4 · Minimum Spanning Trees (algo-4), scene 11-recap: three rows, each a small looping pictogram and one bold line.
   Story (local seconds): 0.1 title and Byte, rows slide in at 0.8 / 1.9 / 3.0 (the pictogram starts 0.4 s later), 5.4 the call to action.
   Row 1 (period 4, purple): a purple blob grows round town A (the cut); the two cables that cross it turn orange, the lighter
          one (AC, from A4.CUTS[0]) turns solid green and a green tick pops: the cheapest cable across a cut is safe.
   Row 2 (period 5, green): two small networks. Left, Prim grows one green tree from A (AC, BC, BD, DE, from A4.PRIM). Right,
          Kruskal pops DE, BC, AC, BD (from A4.KRUSKAL) as separate pieces that merge. Both end on the same tree: an equals sign.
   Row 3 (period 5, blue): the seven towns of lesson 4.9: the green tree draws (A4.TSP.mst), an orange doubled outline walks
          round it (A4.TSP.walk), then the blue shortcut tour ABCDEFG closes (A4.TSP.pre) and a green tick pops.
   Every row fades out at the end of its lap and starts again, so the pictograms keep moving until the end. No numbers on screen. */
(function () {
  const V = window.VID;
  const A4 = V.a4;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  const f1 = (n) => n.toFixed(1);
  const box = (x, y, w, h) => ({
    position: "absolute",
    left: `${f1(x)}px`,
    top: `${f1(y)}px`,
    width: `${f1(w)}px`,
    height: `${f1(h)}px`,
  });
  const cyc = (t, t0, period) => (t < t0 ? -1 : (t - t0) % period); // time inside the current lap, -1 before the first
  // opacity of a whole pictogram: in at the start of a lap, out at its end
  const life = (q, end) => (q < 0 ? 0 : ramp(q, 0, 0.3, E.lin) * (1 - ramp(q, end, end + 0.4, E.lin)));

  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.9, 3.0];
  const PIC = { x: 16, y: 10, w: 340, h: 140, zoom: 1.1 }; // pictograms are drawn at 340 x 140 and shown 10% larger
  const START = APPEAR.map((a) => a + 0.4);

  // a round green sticker with a tick (drawn on, then popped)
  function tickBadge(parent, x, y) {
    const green = L5.tone("green");
    const svg = L5.svg(parent, PIC.w, PIC.h);
    const lip = V.s("circle", { cx: x, cy: y + 5, r: 24, style: { fill: green.edge } });
    const disc = V.s("circle", { cx: x, cy: y, r: 24, "stroke-width": 3, style: { fill: green.dim, stroke: green.edge } });
    const tick = L5.tick(x, y, 44, "green", { ink: true, w: 7 });
    const g = svg.appendChild(V.s("g", {}, lip, disc, tick));
    return (k, o = 1) => {
      L5.drawOn(tick, ramp(k, 0.2, 1, E.lin));
      V.place(g, { s: 0.7 + 0.3 * E.pop(k), o: Math.min(1, k * 4) * o });
    };
  }

  // ---------- row 1: the cheapest cable across a cut is safe ----------
  function cutRow(pic) {
    const cut = A4.CUTS[0];
    A4.same(
      "recap row 1: the cut round A",
      [cut.X, cut.crossing.map((c) => c.key), cut.safe.key],
      [["A"], ["AC", "AB"], "AC"],
    );
    const [SAFE, OTHER] = [cut.safe.key, cut.crossing.find((c) => c.key !== cut.safe.key).key];
    const g = A4.graph(pic, {
      nodes: A4.netPos({ x: 80, y: 6, s: 0.3 }),
      r: 12,
      ew: 6,
      letters: false,
      pills: false,
      blobs: 1,
    });
    const badge = tickBadge(pic, 300, 70);
    const T = { blob: [0.3, 0.8], orange: [0.9, 1.3], pick: [1.6, 2.1], end: 3.3 };

    return (t) => {
      const q = cyc(t, START[0], 4);
      const lifeK = life(q, T.end);
      const cables = ramp(q, 0.1, 0.4, E.lin); // the grey network fades in with the towns
      const blob = ramp(q, T.blob[0], T.blob[1]);
      const picked = q >= T.pick[0];
      const orange = q >= T.orange[0] && !picked;
      const hot = ramp(q, T.orange[0], T.orange[1], E.lin);
      const bump = flash(q, T.orange[0], T.orange[1]);
      const edges = {
        [OTHER]: orange
          ? { tone: "orange", halo: hot, w: 1.2 + 0.3 * bump }
          : { tone: "grey", o: cables * (1 - 0.65 * ramp(q, T.pick[0], T.pick[0] + 0.3, E.lin)) },
        [SAFE]: picked
          ? { tone: "green", w: 1.35 + 0.35 * flash(q, T.pick[0], T.pick[1]) }
          : orange
            ? { tone: "orange", halo: hot, w: 1.2 + 0.3 * bump }
            : { tone: "grey", o: cables },
      };
      const towns = {};
      A4.TOWNS.forEach((c, i) => {
        const pk = ramp(q, 0.05 * i, 0.05 * i + 0.4, E.lin);
        towns[c] = {
          tone: c === "A" && blob > 0.4 ? "purple" : "grey",
          s: E.pop(pk) * (c === "A" ? 1 + 0.15 * flash(q, T.blob[0], T.blob[1]) : 1),
          o: Math.min(1, pk * 4),
        };
      });
      g.update({
        edges,
        towns,
        base: { edge: { o: cables } },
        blobs: [{ set: cut.X, tone: "purple", k: blob, pad: lerp(14, 26, E.out(blob)) }],
        o: lifeK,
      });
      badge(q < 0 ? 0 : ramp(q, T.pick[0], T.pick[1], E.lin), lifeK);
    };
  }

  // ---------- row 2: Prim grows one tree, Kruskal merges pieces, same tree ----------
  function mstRow(pic) {
    const prim = A4.PRIM.steps;
    const kr = A4.KRUSKAL.events.filter((e) => e.accept);
    A4.same(
      "recap row 2: Prim order",
      prim.map((s) => s.pick.key),
      ["AC", "BC", "BD", "DE"],
    );
    A4.same(
      "recap row 2: Kruskal order",
      kr.map((e) => e.key),
      ["DE", "BC", "AC", "BD"],
    );
    A4.same("recap row 2: the same tree", kr.map((e) => e.key).sort(), prim.map((s) => s.pick.key).sort());
    A4.same("recap row 2: total", [A4.PRIM.total, A4.KRUSKAL.total], [11, 11]);

    // three stacked drawings of one network: grey cables, the tree's cables, and the towns on top
    const side = (x) => {
      const o = { nodes: A4.netPos({ x, y: 20, s: 0.25 }), r: 10, ew: 5, letters: false, pills: false };
      return {
        grey: A4.graph(pic, { ...o, townBase: { o: 0 } }),
        tree: A4.graph(pic, { ...o, hidden: true, townBase: { o: 0 } }),
        towns: A4.graph(pic, { ...o, hidden: true }),
      };
    };
    const [L, R] = [side(4), side(190)];
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const eq = svg.appendChild(A4.equals(172, 70, 30, "green"));

    const P0 = 0.3; // Prim: cable i starts here + 0.7 i and grows for 0.45 s
    const [PP, PD] = [0.7, 0.45];
    const KT = [0.45, 1.15, 1.85, 2.55]; // Kruskal: cable i pops here (0.4 s)
    const [EQ, END] = [3.2, 4.4];
    const primEnd = (i) => P0 + PP * i + PD;
    const joined = {}; // when each town turns green on each side
    const kJoined = {};
    A4.TOWNS.forEach((c) => {
      joined[c] = c === "A" ? 0.15 : primEnd(prim.findIndex((s) => s.town === c));
      kJoined[c] = KT[kr.findIndex((e) => e.key.includes(c))];
    });

    return (t) => {
      const q = cyc(t, START[1], 5);
      const lifeK = life(q, END);
      const cables = ramp(q, 0.1, 0.4, E.lin);
      const pk = (i) => ramp(q, 0.05 * i, 0.05 * i + 0.4, E.lin);

      // left: Prim
      const pEdges = {};
      prim.forEach((s, i) => {
        const a = P0 + PP * i;
        pEdges[s.pick.key] = { tone: "green", from: s.pick.a, k: ramp(q, a, a + PD, E.lin), w: 1.15 };
      });
      const pTowns = {};
      A4.TOWNS.forEach((c, i) => {
        const on = q >= joined[c];
        pTowns[c] = {
          tone: on ? "green" : "grey",
          solid: on,
          s: E.pop(pk(i)) * (1 + 0.2 * flash(q, joined[c], joined[c] + 0.3)),
          o: Math.min(1, pk(i) * 4),
        };
      });
      L.grey.update({ base: { edge: { o: cables } }, o: lifeK });
      L.tree.update({ edges: pEdges, o: lifeK });
      L.towns.update({ towns: pTowns, o: lifeK });

      // right: Kruskal, four separate cables that merge into one tree
      const kEdges = {};
      kr.forEach((e, i) => {
        const k = ramp(q, KT[i], KT[i] + 0.2, E.lin);
        kEdges[e.key] = { tone: "green", o: k, w: 1.15 + 0.5 * flash(q, KT[i], KT[i] + 0.4) };
      });
      const kTowns = {};
      A4.TOWNS.forEach((c, i) => {
        const on = q >= kJoined[c];
        // a merge (AC joins A to the BC piece, BD joins everything) makes the whole new piece bump
        const merged = kr.reduce((sum, e, j) => {
          const piece = e.after.find((grp) => grp.includes(e.a));
          return sum + (piece.length > 2 && piece.includes(c) ? flash(q, KT[j], KT[j] + 0.4) : 0);
        }, 0);
        kTowns[c] = {
          tone: on ? "green" : "grey",
          solid: on,
          s: E.pop(pk(i)) * (1 + 0.2 * flash(q, kJoined[c], kJoined[c] + 0.3) + 0.2 * merged),
          o: Math.min(1, pk(i) * 4),
        };
      });
      R.grey.update({ base: { edge: { o: cables } }, o: lifeK });
      R.tree.update({ edges: kEdges, o: lifeK });
      R.towns.update({ towns: kTowns, o: lifeK });

      const k = q < 0 ? 0 : ramp(q, EQ, EQ + 0.4, E.pop);
      V.place(eq, { s: 0.6 + 0.4 * k, o: Math.min(1, k * 4) * lifeK });
    };
  }

  // ---------- row 3: tree, doubled walk, shortcut tour ----------
  function tourRow(pic) {
    const TS = A4.TSP;
    A4.same(
      "recap row 3: the tree",
      TS.mst.map((c) => c.key),
      ["AB", "AC", "CD", "DE", "DF", "FG"],
    );
    A4.same("recap row 3: the walk", TS.walk, "ABACDEDFGFDCA");
    A4.same("recap row 3: the tour", TS.pre, "ABCDEFG");
    A4.close("recap row 3: the walk is twice the tree", TS.walkLen, 2 * TS.W, 1e-9);
    A4.close("recap row 3: the tour is no longer than the walk", Math.min(TS.tourLen, TS.walkLen), TS.tourLen, 1e-9);
    const WALK = [...TS.walk];
    const map = A4.tspMap(pic, { x: 33, y: -14, s: 0.56, r: 9 });
    const P = (c) => {
      const p = map.pt(c);
      return [p.x, p.y];
    };

    // walk lanes and tour legs sit between the cables and the towns
    const lay = V.s("g");
    map.el.insertBefore(lay, map.el.children[2] || null);
    const lanes = WALK.slice(0, -1).map((c, i) => A4.offsetLine(P(c), P(WALK[i + 1]), 5.5));
    const laneEls = lanes.map(() =>
      lay.appendChild(V.s("line", { "stroke-width": 3.2, "stroke-linecap": "round", style: { stroke: "var(--amber)" } })),
    );
    const BOW = 56; // the way home (G to A) would run through D, so it bows underneath
    const legEls = TS.legs.map((l) => {
      const [p, q] = [P(l.from), P(l.to)];
      const mid = A4.lerpPt(p, q, 0.5);
      const d =
        l.skipped.length > 1
          ? `M${f1(p[0])} ${f1(p[1])}Q${f1(mid[0])} ${f1(mid[1] + BOW)} ${f1(q[0])} ${f1(q[1])}`
          : `M${f1(p[0])} ${f1(p[1])}L${f1(q[0])} ${f1(q[1])}`;
      return lay.appendChild(
        V.s("path", {
          d,
          pathLength: 1,
          fill: "none",
          "stroke-width": 6.5,
          "stroke-linecap": "round",
          style: { stroke: "var(--blue)" },
        }),
      );
    });
    const badge = tickBadge(pic, 312, 104);

    const T = { tree: 0.2, step: 0.12, draw: 0.2, walk: 1.1, tour: 2.4, tourStep: 0.15, tourDraw: 0.3, tick: 3.8, end: 4.4 };
    const LEG = 1.1 / (WALK.length - 1); // the walk takes 1.1 s in all
    const green = { A: T.tree };
    TS.mst.forEach((c, i) => (green[c.to] = T.tree + T.step * i + T.draw));
    const blue = { A: T.tour };
    TS.legs.forEach((l, i) => (blue[l.to] = blue[l.to] ?? T.tour + T.tourStep * i + T.tourDraw));

    return (t) => {
      const q = cyc(t, START[2], 5);
      const lifeK = life(q, T.end);
      const spare = 1 - 0.65 * ramp(q, 3.0, 3.5, E.lin); // the tree cables the tour does not use dim
      const edges = {};
      TS.mst.forEach((c, i) => {
        const a = T.tree + T.step * i;
        edges[c.key] = {
          tone: "green",
          from: c.from,
          k: ramp(q, a, a + T.draw, E.lin),
          w: 1,
          o: c.key === "AC" || c.key === "DF" ? spare : 1,
        };
      });
      const towns = {};
      TS.towns.forEach((c, i) => {
        const pk = ramp(q, 0.05 * i, 0.05 * i + 0.4, E.lin);
        const isBlue = q >= blue[c];
        const isGreen = q >= green[c];
        towns[c] = {
          tone: isBlue ? "blue" : isGreen ? "green" : "grey",
          solid: isBlue || isGreen,
          s: E.pop(pk) * (1 + 0.2 * (flash(q, green[c], green[c] + 0.3) + flash(q, blue[c], blue[c] + 0.3))),
          o: Math.min(1, pk * 4),
        };
      });
      map.update({ edges, towns, o: lifeK });

      const lanesO = 0.9 * (1 - ramp(q, T.tour, T.tour + 0.6, E.lin));
      lanes.forEach((l, i) => {
        const f = ramp(q, T.walk + LEG * i, T.walk + LEG * (i + 1), E.lin);
        const to = A4.lerpPt(l[0], l[1], f);
        laneEls[i].setAttribute("x1", f1(l[0][0]));
        laneEls[i].setAttribute("y1", f1(l[0][1]));
        laneEls[i].setAttribute("x2", f1(to[0]));
        laneEls[i].setAttribute("y2", f1(to[1]));
        V.show(laneEls[i], f < 0.003 ? 0 : lanesO * lifeK);
      });
      TS.legs.forEach((l, i) => {
        const k = ramp(q, T.tour + T.tourStep * i, T.tour + T.tourStep * i + T.tourDraw, E.lin);
        legEls[i].style.strokeDasharray = `${k.toFixed(3)} 2`;
        V.show(legEls[i], k < 0.003 ? 0 : lifeK);
      });
      badge(q < 0 ? 0 : ramp(q, T.tick, T.tick + 0.4, E.lin), lifeK);
    };
  }

  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const head = V.h("div", {
        class: "v-title-line",
        text: "Remember",
        style: { position: "absolute", left: "72px", top: "108px", fontSize: "76px" },
      });
      const kicker = V.h("div", { class: "v-kicker", text: "RECAP" });
      const mascot = V.mascot("byte", { size: 168, mood: "love" });
      mascot.style.left = "840px";
      mascot.style.top = "38px";
      stage.append(kicker, head, mascot);

      const rows = [
        ["purple", "Cheapest across a cut\nis always safe", cutRow],
        ["green", "Prim grows one tree,\nKruskal merges pieces", mstRow],
        ["blue", "A tour at most twice\nthe best possible", tourRow],
      ].map(([tone, text, make], i) => {
        const card = V.h("div", { class: `v-card plain c-${tone}`, style: box(CARD.x, CARD.tops[i], CARD.w, CARD.h) });
        const pic = V.h("div", {
          style: { ...box(PIC.x, PIC.y, PIC.w, PIC.h), transform: `scale(${PIC.zoom})`, transformOrigin: "0 0" },
        });
        const label = V.h("div", {
          class: "v-text big",
          text,
          style: {
            left: "440px",
            top: "0",
            height: "174px",
            display: "flex",
            alignItems: "center",
            whiteSpace: "pre",
            fontSize: "36px",
            lineHeight: "1.2",
          },
        });
        card.append(pic, label);
        stage.append(card);
        return { card, label, update: make(pic) };
      });

      const cta = V.h("div", {
        class: "v-tag solid c-blue",
        text: "Next: Workshop 4.W",
        style: {
          position: "relative",
          display: "flex",
          alignItems: "center",
          fontSize: "34px",
          padding: "8px 34px 10px",
        },
      });
      const ctaBar = V.h("div", {
        style: { ...box(0, 864, 1080, 80), display: "flex", justifyContent: "center", alignItems: "center" },
      });
      ctaBar.append(cta);
      stage.append(ctaBar);

      return (t) => {
        V.place(kicker, { y: (1 - ramp(t, 0.05, 0.45)) * 10, o: ramp(t, 0.05, 0.45) });
        V.place(head, { y: (1 - ramp(t, 0.1, 0.6)) * 20, o: ramp(t, 0.1, 0.6) });
        const m = ramp(t, 0.2, 0.9, E.pop);
        V.place(mascot, {
          y: (1 - m) * 30 + 6 * Math.sin((2 * Math.PI * t) / 2.6),
          r: 3 * Math.sin((2 * Math.PI * t) / 3.2 + 1),
          s: 0.7 + 0.3 * m,
          o: ramp(t, 0.2, 0.5),
        });
        rows.forEach((r, i) => {
          const k = ramp(t, APPEAR[i], APPEAR[i] + 0.5);
          V.place(r.card, { y: (1 - k) * 36, o: k });
          const kl = ramp(t, APPEAR[i] + 0.15, APPEAR[i] + 0.65);
          V.place(r.label, { x: (1 - kl) * 24, o: kl });
          r.update(t);
        });
        const c = ramp(t, 5.4, 6.0, E.pop);
        V.place(cta, { s: 0.8 + 0.2 * c, o: ramp(t, 5.4, 5.7) });
      };
    },
  });
})();
