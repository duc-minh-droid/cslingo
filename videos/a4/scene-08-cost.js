/* Phase 4 · scene 08-cost: which is faster, Prim or Kruskal? It depends on the network. Two columns, each a picture of a
   network (8 towns on a ring: a road map with 10 cables on the left, every pair linked = 28 cables on the right) and two bars
   of step counts: Prim (array version, about V x V steps, it counts TOWNS) and Kruskal (sort the cables, about E log V steps, it
   counts CABLES). The bars grow while a counter runs up to the number; while a bar grows the thing it counts lights up in the
   picture (towns hop for Prim, cables thicken for Kruskal). The shorter bar turns green with a tick and a verdict tag
   ("about 50 times less" / "about 5 times less"), the longer one turns grey. Last, "same tree either way".
   Numbers: A4.COST (asserted below), never typed into the picture. Bars are drawn against the larger count of their column.
   Story (local seconds): 0.2 titles, 0.3-1.3 pictures draw in, 1.2 size lines, 1.8 left labels, 2.3 left Prim bar (towns light
   up), 3.2 left Kruskal bar (cables light up), 4.3 left verdict, 5.6 right labels, 5.8 right Prim bar, 6.4 right Kruskal bar,
   7.7 right verdict, 9.0 "same tree either way". */
(function () {
  const V = window.VID;
  const A4 = V.a4;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;

  // ---------- the numbers (asserted against the storyboard) ----------
  const { sparse, dense } = A4.COST;
  A4.same(
    "scene 8 sparse",
    [sparse.V, sparse.E, sparse.prim, sparse.kruskal, sparse.primText, sparse.kruskalText],
    [1024, 2048, 1046529, 20480, "1.0 M", "20 k"],
  );
  A4.same(
    "scene 8 dense",
    [dense.V, dense.E, dense.prim, dense.kruskal, dense.primText, dense.kruskalText],
    [1000, 499500, 998001, 4977909, "998 k", "5.0 M"],
  );
  A4.same("scene 8 Prim steps", [A4.primSteps(1024), A4.primSteps(1000)], [1046529, 998001]);
  A4.same("scene 8 Kruskal steps", [A4.kruskalSteps(2048, 1024), Math.round(A4.kruskalSteps(499500, 1000))], [20480, 4977909]);
  A4.close("scene 8 sparse ratio", sparse.ratio, 51.1, 0.1);
  A4.close("scene 8 dense ratio", dense.ratio, 4.99, 0.02);

  // ---------- the two pictures: eight towns on a ring ----------
  const LETTERS = "ABCDEFGH".split("");
  const RING = LETTERS.map((t, i) => [t, LETTERS[(i + 1) % 8]]); // AB BC CD DE EF FG GH, then H back to A
  const inRing = (a, b) => RING.some(([p, q]) => A4.key(p, q) === A4.key(a, b));
  const ALL = LETTERS.flatMap((a, i) => LETTERS.slice(i + 1).map((b) => [a, b])).filter(([a, b]) => !inRing(a, b));
  const SPARSE_EDGES = RING.concat([
    ["A", "E"],
    ["B", "G"],
  ]);
  const DENSE_EDGES = RING.concat(ALL);
  A4.same("scene 8 picture cables", [SPARSE_EDGES.length, DENSE_EDGES.length], [10, 28]);
  A4.same("scene 8 every pair", DENSE_EDGES.length, (8 * 7) / 2);
  const BAR_W = 340;

  // two columns: the picture, its cost numbers, its timeline (everything in local seconds)
  const COLS = [
    {
      x0: 12,
      name: "Road map: few cables",
      cost: sparse,
      edges: SPARSE_EDGES,
      step: 0.03,
      labels: 1.8,
      prim: [2.3, 3.4],
      kruskal: [3.2, 4.0],
      verdict: [4.3, 5.2],
      win: "kruskal",
      said: "about 50 times less",
    },
    {
      x0: 480,
      name: "Every pair linked",
      cost: dense,
      edges: DENSE_EDGES,
      step: 0.012,
      labels: 5.6,
      prim: [5.8, 6.6],
      kruskal: [6.4, 7.4],
      verdict: [7.7, 8.6],
      win: "prim",
      said: "about 5 times less",
    },
  ];
  const T_FINAL = [9.0, 9.6];

  V.scene({
    kicker: "THE COST",
    title: ["Which is faster?", "It depends on the network"],
    dur: 11,
    caps: [
      [0.4, 3.6, "Prim's work counts towns. Kruskal's work counts cables."],
      [4.0, 6.4, "Few cables: Kruskal does far less."],
      [7.4, 10.5, "Nearly every pair linked: Prim wins. Same tree either way."],
    ],
    build(stage) {
      const svg = L5.svg(stage);
      const cols = COLS.map((c, ci) => {
        const cx = c.x0 + 220;
        const nodes = Object.fromEntries(
          LETTERS.map((t, i) => {
            const a = ((-90 + 45 * i) * Math.PI) / 180;
            return [t, [cx + 72 * Math.cos(a), 135 + 72 * Math.sin(a)]];
          }),
        );
        const g = A4.graph(stage, {
          nodes,
          edges: c.edges.map(([a, b]) => [a, b, 1]),
          r: 12,
          ew: 4,
          letters: false,
          pills: false,
          edgeBase: { tone: "blue" },
          townBase: { tone: "blue" },
        });
        const title = A4.tag(stage, { x: c.x0, y: 0, text: c.name });
        const text = (txt, y, cls = "v-text dim") =>
          stage.appendChild(V.h("div", { class: cls, text: txt, style: { left: `${c.x0}px`, top: `${y}px`, fontSize: "28px" } }));
        const size = text(`${A4.commas(c.cost.V)} towns · ${A4.commas(c.cost.E)} cables`, 226);
        const labels = [text("Prim · V²", 290), text("Kruskal · E log V", 384)];
        const top = Math.max(c.cost.prim, c.cost.kruskal);
        const mk = (y, v) => ({ bar: A4.bar(stage, { x: c.x0, y, w: BAR_W, h: 44 }), max: v / top, value: v });
        const bars = { prim: mk(324, c.cost.prim), kruskal: mk(418, c.cost.kruskal) };
        const said = A4.tag(stage, { x: c.x0 + 52, y: 490, text: c.said, tone: "green", solid: true });
        const tick = L5.tick(c.x0 + 22, 516, 36, "green", { ink: true, w: 6 });
        svg.append(tick);
        return { c, ci, g, title, size, labels, bars, said, tick };
      });
      const final = A4.tag(stage, { x: 278, y: 560, text: "same tree either way", tone: "green", solid: true, fs: 32 });
      const fade = (e, k) => V.place(e, { y: (1 - k) * 8, o: k });

      function drawCol(t, col) {
        const { c, g, title, size, labels, bars, said, tick } = col;
        title.set({ k: ramp(t, 0.2 + col.ci * 0.25, 0.65 + col.ci * 0.25, E.lin) });
        fade(size, ramp(t, 1.2 + col.ci * 0.2, 1.7 + col.ci * 0.2, E.lin));
        labels.forEach((l) => fade(l, ramp(t, c.labels, c.labels + 0.5, E.lin)));

        // the picture: towns pop, cables draw on; Prim's bar lights the towns, Kruskal's bar lights the cables
        const edges = {};
        c.edges.forEach(([a, b], j) => {
          const a0 = 0.5 + j * c.step;
          const pulse = flash(t, c.kruskal[0] + j * 0.01, c.kruskal[0] + j * 0.01 + 0.5);
          edges[A4.key(a, b)] = { k: ramp(t, a0, a0 + 0.3), w: 1 + 0.9 * pulse, halo: 0.8 * pulse };
        });
        const towns = {};
        LETTERS.forEach((l, i) => {
          const a0 = 0.3 + i * 0.03;
          const hop = flash(t, c.prim[0] + i * 0.05, c.prim[0] + i * 0.05 + 0.45);
          towns[l] = { s: (0.4 + 0.6 * E.pop(ramp(t, a0, a0 + 0.35, E.lin))) * (1 + 0.5 * hop), o: ramp(t, a0, a0 + 0.1, E.lin) };
        });
        g.update({ edges, towns });

        // the bars: grow, count up, then the verdict (winner green, loser grey)
        const verdict = t >= c.verdict[0];
        ["prim", "kruskal"].forEach((who) => {
          const { bar, max, value } = bars[who];
          const [a, b] = c[who];
          const p = ramp(t, a, b, E.inOut);
          const tone = !verdict ? "blue" : who === c.win ? "green" : "grey";
          bar.set({ k: p * max, tone, text: A4.big(value * p), textOut: true });
        });
        const vk = ramp(t, c.verdict[0] + 0.2, c.verdict[0] + 0.8, E.lin);
        said.set({ k: vk });
        L5.drawOn(tick, ramp(t, c.verdict[0] + 0.4, c.verdict[1], E.inOut));
        V.show(tick, vk > 0 ? 1 : 0);
      }

      return (t) => {
        cols.forEach((col) => drawCol(t, col));
        final.set({ k: ramp(t, T_FINAL[0], T_FINAL[1], E.lin) });
        void lerp;
      };
    },
  });
})();
