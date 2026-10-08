/* Algorithms phase 2, scene 10-recap: three rows, each a small looping pictogram and one bold line (storyboard: "recap").
   Story (local seconds): 0.1 title and Byte, rows slide in at 0.8 / 1.9 / 3.0 (the pictogram starts 0.4 s later), 5.4 the call to action.
   Row 1 (period 4.2): the lesson's triangle A, B, C. A is settled; its roads draw blue and B waits at 4, C at 2 (A2.DIJ_RUN round 1).
          C is the smallest, so it turns orange, then green (settled); its road to B draws blue and B's 4 is struck out and
          becomes 3 with an orange flash (round 2: 2 + 1 = 3 beats 4). Numbers come from A2.DIJ_RUN.
   Row 2 (period 4.5): the 10 x 7 grid at cell 18 runs A* from S round the wall to G (n = 0 -> 20 over 3 s, A2.RUNS.astar) while a
          purple compass needle swings and settles on G; then the path lights up solid green and a green tick pops.
   Row 3 (period 3.0): three routers in a row: a blue packet slides out of each router and into the next (0.5 s a hop), the last one
          turns green; a purple message tag keeps sliding between the first two (gossip, period 1.5). */
(function () {
  const V = window.VID;
  const A2 = V.a2;
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
  const out = (q, a, b) => 1 - ramp(q, a, b, E.lin); // 1 -> 0 between a and b (the end of a lap)
  const rect = (x, y, w, h, r, extra) => V.s("rect", { x, y, width: w, height: h, rx: r, ...extra });

  const CARD = { x: 72, w: 936, h: 180, tops: [240, 444, 648] };
  const APPEAR = [0.8, 1.9, 3.0];
  const START = APPEAR.map((a) => a + 0.4);
  const PIC = { x: 16, y: 13, w: 340, h: 140, zoom: 1.1 }; // pictograms are drawn at 340 x 140 and shown 10% larger

  // ---------- row 1: settle the smallest, then relax ----------
  function dijkstraRow(pic) {
    const run = A2.DIJ_RUN;
    const [r0, r1] = [run.rounds[0], run.rounds[1]];
    const toB = r1.relax.find((x) => x.to === "B");
    A2.need(
      r0.node === "A" &&
        r0.relax.map((x) => `${x.to}${x.cand}`).join() === "B4,C2" &&
        r1.node === "C" &&
        toB.cand === 3 &&
        toB.old === 4 &&
        toB.better,
      "recap row 1: the first two rounds of Dijkstra are not what the storyboard says",
    );
    const [oldB, firstC, newB] = [String(toB.old), String(r0.relax[1].cand), String(toB.cand)];
    const G = A2.graph(pic, {
      nodes: { A: [40, 38], B: [222, 38], C: [131, 102] },
      edges: [["A", "B", null], ["A", "C", null], ["C", "B", null]], // prettier-ignore
      r: 24,
      fs: 28,
      badge: { B: "r", C: "r" },
    });
    const T = {
      roads: [0.45, 0.95],
      badges: 0.9,
      retract: [1.45, 1.8],
      pick: 1.7,
      settle: 2.2,
      relax: [2.45, 2.85],
      strike: [2.85, 3.05],
      drop: 3.05,
      calm: 3.5,
      end: 3.9,
    };
    return (t) => {
      const q = cyc(t, START[0], 4.2);
      if (q < 0) return G.update({ o: 0 });
      const pop = (a) => 0.8 + 0.2 * A2.pop(q, a);
      const picked = q >= T.pick && q < T.settle;
      const settled = q >= T.settle;
      const road = A2.lin(q, ...T.roads) - A2.lin(q, ...T.retract);
      const cBadge = settled
        ? { tone: "green", solid: false, s: 1 + 0.2 * A2.bump(q, T.settle) }
        : picked
          ? { tone: "orange", solid: true, s: 1 + 0.15 * A2.bump(q, T.pick) }
          : { tone: "purple", solid: false };
      const dropped = q >= T.drop;
      const bBadge = dropped
        ? {
            text: newB,
            tone: q < T.calm ? "orange" : "purple",
            solid: q < T.calm,
            s: 1 + 0.25 * A2.bump(q, T.drop, 0.45),
          }
        : { text: oldB, tone: "purple", solid: false, strike: A2.lin(q, ...T.strike) };
      G.update({
        o: A2.fade(q, 0, 0.3) * out(q, T.end, 4.2),
        nodes: {
          A: { look: "solid", tone: "green", s: pop(0.05) },
          B: { s: pop(0.15) * (1 + 0.1 * A2.bump(q, T.drop, 0.45)) },
          C: settled
            ? { look: "solid", tone: "green", s: pop(0.25), pulse: A2.bump(q, T.settle) }
            : picked
              ? { look: "soft", tone: "orange", ring: "orange", ringK: A2.lin(q, T.pick, T.pick + 0.3), s: pop(0.25) }
              : { s: pop(0.25) },
        },
        edges: {
          "A-B": { tone: "blue", from: "A", k: road, w: 10 },
          "A-C": { tone: "blue", from: "A", k: road, w: 10 },
          "C-B": { tone: "blue", from: "C", k: A2.lin(q, ...T.relax), w: 10 },
        },
        badges: {
          B: { ...bBadge, k: A2.lin(q, T.badges, T.badges + 0.35) },
          C: { text: firstC, ...cBadge, k: A2.lin(q, T.badges + 0.1, T.badges + 0.45) },
        },
      });
    };
  }

  // ---------- row 2: A* from S round the wall to G ----------
  function astarRow(pic) {
    const run = A2.RUNS.astar;
    A2.need(
      run.count === 20 && run.cost === 11 && run.path.length === 12,
      "recap row 2: A* should expand 20 cells and find a 12-cell route of cost 11",
    );
    const Gd = A2.grid(pic, { x: 6, y: 0, cols: 10, rows: 7, cell: 18, gap: 2, fs: 14 });
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const vio = L5.tone("purple");
    const grn = L5.tone("green");
    // the compass: a purple dial with a needle that swings and settles on G (the right)
    const [CX, CY] = [280, 46];
    const dial = svg.appendChild(
      V.s(
        "g",
        {},
        V.s("circle", { cx: CX, cy: CY + 5, r: 31, style: { fill: vio.edge } }),
        V.s("circle", { cx: CX, cy: CY, r: 31, "stroke-width": 3, style: { fill: vio.dim, stroke: vio.edge } }),
      ),
    );
    const needle = svg.appendChild(
      V.s(
        "g",
        {},
        V.s("path", {
          d: `M ${CX - 22} ${CY} L ${CX + 4} ${CY - 8} L ${CX + 4} ${CY + 8} Z`,
          style: { fill: "var(--line-2)" },
        }),
        V.s("path", { d: `M ${CX + 22} ${CY} L ${CX - 4} ${CY - 8} L ${CX - 4} ${CY + 8} Z`, style: { fill: vio.c } }),
        V.s("circle", { cx: CX, cy: CY, r: 5, style: { fill: vio.on } }),
      ),
    );
    // the tick sticker pops in when the route is found
    const [BX, BY] = [280, 108];
    const tickG = L5.tick(BX, BY, 38, "green", { ink: true, w: 7 });
    const badge = svg.appendChild(
      V.s(
        "g",
        {},
        V.s("circle", { cx: BX, cy: BY + 5, r: 24, style: { fill: grn.edge } }),
        V.s("circle", { cx: BX, cy: BY, r: 24, "stroke-width": 3, style: { fill: grn.dim, stroke: grn.edge } }),
        tickG,
      ),
    );
    const T = { run: [0.4, 3.4], path: [3.4, 3.95], tick: 3.85, end: 4.25 };
    return (t) => {
      const q = cyc(t, START[1], 4.5);
      const o = q < 0 ? 0 : A2.fade(q, 0, 0.3) * out(q, T.end, 4.5);
      const n = run.count * A2.lin(q, ...T.run);
      const paint = A2.gridPaint(run, n, { pathK: A2.lin(q, ...T.path) });
      Gd.update({
        o,
        cells: (cx, cy, key) => {
          const st = paint(cx, cy, key);
          return st.text ? { ...st, text: undefined } : st; // cells are too small for the S and G letters
        },
      });
      const swing = 38 * Math.sin(q * 9) * (1 - A2.lin(q, 0.5, 1.5));
      V.place(dial, { s: 0.8 + 0.2 * A2.pop(q, 0.15), o: o * A2.fade(q, 0.15) });
      V.place(needle, { r: swing, s: 0.8 + 0.2 * A2.pop(q, 0.15), o: o * A2.fade(q, 0.15) });
      const k = A2.lin(q, T.tick, T.tick + 0.5);
      V.place(badge, { s: 0.6 + 0.4 * E.pop(k) * (1 + 0.1 * A2.bump(q, T.tick + 0.3)), o: o * clamp(k * 4) });
      L5.drawOn(tickG, A2.lin(q, T.tick + 0.1, T.tick + 0.5));
    };
  }

  // ---------- row 3: a packet hops router to router, a message tag gossips between the first two ----------
  function routerRow(pic) {
    const [Y, XS] = [98, [44, 172, 300]];
    const P = 3.0; // one lap of the packet
    const GP = 1.5; // one back-and-forth of the message tag
    const T = { hop1: [0.5, 1.0], hop2: [1.3, 1.8], win: 1.8, end: 2.75 };
    const svg = L5.svg(pic, PIC.w, PIC.h);
    const roads = svg.appendChild(
      V.s("path", {
        d: `M ${XS[0]} ${Y} L ${XS[2]} ${Y}`,
        fill: "none",
        "stroke-width": 8,
        "stroke-linecap": "round",
        style: { stroke: "var(--line-2)" },
      }),
    );
    // the packet runs under the routers, so it slides out of one and into the next
    const blue = L5.tone("blue");
    const packet = svg.appendChild(
      V.s(
        "g",
        {},
        rect(-12, -9, 24, 24, 7, { "stroke-width": 2.5, style: { fill: blue.lip, stroke: blue.lip } }),
        rect(-12, -12, 24, 24, 7, { "stroke-width": 2.5, style: { fill: blue.c, stroke: blue.lip } }),
      ),
    );
    // routers: a sticker box with two aerials and three lights; the last one has a green copy on top
    const green = L5.tone("green");
    const router = (cx) => {
      const g = svg.appendChild(V.s("g", {}));
      [-16, 16].forEach((dx) =>
        g.append(
          V.s("path", {
            d: `M ${cx + dx} ${Y - 18} L ${cx + dx * 1.3} ${Y - 34}`,
            fill: "none",
            "stroke-width": 5,
            "stroke-linecap": "round",
            style: { stroke: "var(--text-faint)" },
          }),
        ),
      );
      const body = (lip, fill, stroke, ink) => {
        const lights = [-14, 0, 14].map((dx) =>
          V.s("circle", { cx: cx + dx, cy: Y + 8, r: 4.5, style: { fill: ink } }),
        );
        return V.s(
          "g",
          {},
          rect(cx - 30, Y - 20 + 5, 60, 40, 12, { style: { fill: lip } }),
          rect(cx - 30, Y - 20, 60, 40, 12, { "stroke-width": 3, style: { fill, stroke } }),
          ...lights,
        );
      };
      g.append(body("var(--line-2)", "var(--panel)", "var(--line-2)", "var(--text-faint)"));
      const on = g.appendChild(body(green.lip, green.c, green.lip, green.on));
      return { g, on };
    };
    const rs = XS.map(router);
    // the message tag: a purple sticker with two short lines in it
    const vio = L5.tone("purple");
    const tag = svg.appendChild(
      V.s(
        "g",
        {},
        rect(-32, -15, 64, 40, 12, { style: { fill: vio.edge } }),
        rect(-32, -20, 64, 40, 12, { "stroke-width": 3, style: { fill: vio.dim, stroke: vio.edge } }),
        rect(-19, -10, 38, 6, 3, { style: { fill: vio.c } }),
        rect(-19, 3, 24, 6, 3, { style: { fill: vio.c } }),
      ),
    );
    return (t) => {
      const q = cyc(t, START[2], P);
      const u = t < START[2] ? -1 : (t - START[2]) % GP;
      const born = A2.pop(t, START[2] - 0.1);
      V.show(roads, A2.fade(t, START[2] - 0.1));
      // packet: out of router 1, into router 2, out again, into router 3
      const x = XS[0] + (XS[1] - XS[0]) * A2.io(q, ...T.hop1) + (XS[2] - XS[1]) * A2.io(q, ...T.hop2);
      V.place(packet, {
        x,
        y: Y,
        s: 1 + 0.12 * flash(q, T.hop1[0], T.hop1[1]) + 0.12 * flash(q, T.hop2[0], T.hop2[1]),
        o: q < 0 ? 0 : A2.fade(q, 0.1, 0.2) * out(q, 1.95, 2.1),
      });
      // the message tag slides to router 2 and back (period 1.5), pausing at each end
      const tx = XS[0] + (XS[1] - XS[0]) * (A2.io(u, 0.1, 0.6) - A2.io(u, 0.75, 1.25));
      V.place(tag, { x: tx, y: 28, s: 0.8 + 0.2 * born, o: u < 0 ? 0 : A2.fade(t, START[2] + 0.1) });
      const hits = [
        flash(u, 0.5, 0.9) + flash(q, T.hop1[1] - 0.05, T.hop1[1] + 0.3), // router 2: the tag arrives, and the packet
        flash(q, T.win - 0.05, T.win + 0.35), // router 3: the packet arrives
      ];
      const bump = [flash(u, 1.15, 1.55) + flash(q, T.hop1[0] - 0.1, T.hop1[0] + 0.2), hits[0], hits[1]];
      rs.forEach((r, i) => {
        V.place(r.g, {
          s: (0.8 + 0.2 * (i === 0 ? born : A2.pop(t, START[2] + 0.05 * i - 0.1))) * (1 + 0.09 * bump[i]),
          o: A2.fade(t, START[2] - 0.1),
        });
      });
      V.show(rs[2].on, q < 0 ? 0 : A2.lin(q, T.win, T.win + 0.15) * out(q, T.end, P));
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
        ["green", "Dijkstra: settle the\nsmallest, then relax", dijkstraRow],
        ["blue", "A*: Dijkstra plus a\ncompass (g + h)", astarRow],
        ["purple", "Routers: a table from\nDijkstra, or gossip", routerRow],
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
        text: "Beat the Phase 2 boss quiz",
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
