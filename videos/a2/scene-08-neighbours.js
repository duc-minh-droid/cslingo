/* Algorithms phase 2 (algo-2), scene 08: routing without a map (distance vectors, lesson 2.10).
   Router A cannot see the network. Its neighbours B, C and D each report how far THEY are from the destination F; A adds the
   cost of its own road to that neighbour and keeps the smallest total. The neighbour behind the minimum is the next hop.
   Every number (road costs, reports, sums, the winner and its cost) comes from A2.BF, asserted below; only the times are typed. */
(function () {
  const V = window.VID;
  const A2 = V.a2;
  const L5 = V.l5;
  const { pop, fade, lin, io, bump } = A2;

  // ---------- data (all from A2.BF, asserted here) ----------
  const BF = A2.BF;
  const NB = BF.order;
  A2.need(
    NB.join() === "B,C,D" && BF.router === "A" && BF.dest === "F",
    "scene 8: router A, neighbours B C D, destination F",
  );
  A2.need(
    NB.every((n) => BF.totals[n] === BF.links[n] + BF.says[n]),
    "scene 8: total = road cost + report",
  );
  A2.need(BF.totals.B === 8 && BF.totals.C === 9 && BF.totals.D === 7, "scene 8: totals 8, 9 and 7");
  A2.need(BF.best === "D" && BF.cost === 7 && NB.every((n) => BF.totals[n] >= BF.cost), "scene 8: D wins with 7");
  const SUM = A2.obj(NB, (n) => `${BF.links[n]} + ${BF.says[n]} = ${BF.totals[n]}`);

  // ---------- layout (stage px) ----------
  const NODES = { A: [110, 330], B: [400, 130], C: [400, 330], D: [400, 530], F: [820, 330] };
  const ORDER = ["A", "B", "C", "D", "F"];
  const EDGES = [
    ...NB.map((n) => [BF.router, n, BF.links[n]]),
    ...NB.map((n) => [n, BF.dest, null]), // the roads beyond the neighbours: drawn only when they report
  ];

  // ---------- timeline (local seconds) ----------
  const T = {
    node0: 0.2, // node i pops at node0 + 0.12 i
    link0: 0.9, // link i draws 0.5 s from link0 + 0.12 i, its cost pops 0.1 s later
    nomap: 1.0, // the crossed-out map beside A
    rep: { B: 1.8, C: 2.4, D: 3.0 }, // a neighbour reports: its road to F draws from F (0.5 s) and the report pops
    add: { B: 4.2, C: 5.0, D: 5.8 }, // A adds: the report flies to the link (0.5 s) and becomes the sum
    min: 7.0, // the minimum: the losers fade, the winner turns orange
    win: [7.8, 8.4], // the winning link turns green and thick
    table: 8.8,
    row: [8.9, 9.3],
    tick: 9.3,
  };
  const FLY = 0.5;
  const DRAW = 0.5;
  const F0 = 0.16; // the report starts just outside its neighbour (fraction of the link)
  const speak = (n) => T.rep[n];
  const sumAt = (n) => T.add[n] + FLY;

  V.scene({
    kicker: "NO MAP",
    title: ["Routing without a map:", "ask your neighbours"],
    dur: 12,
    caps: [
      [0.4, 4.0, "A has no map. Each neighbour says how far F is."],
      [4.2, 7.0, "A adds its own road cost to each answer."],
      [7.4, 11.4, "It keeps the smallest total, and the next hop: D."],
    ],
    build(stage) {
      const G = A2.graph(stage, { nodes: NODES, edges: EDGES });
      const tokens = A2.obj(NB, (n) =>
        A2.token(stage, { size: 46, tone: "blue", text: String(BF.says[n]), round: true }),
      );
      const win = A2.tag(stage, {
        ...G.pillPt(`${BF.router}-${BF.best}`),
        text: SUM[BF.best],
        tone: "orange",
        solid: true,
      });
      const dest = A2.tag(stage, { x: NODES.F[0], y: NODES.F[1] + 98, text: "destination", tone: "orange" });
      const table = A2.table(stage, {
        x: 12,
        y: 494,
        cols: [72, 96, 92],
        head: ["to", "cost", "via"],
        rows: [[BF.dest, String(BF.cost), BF.best]],
        rowH: 48,
      });
      const svg = L5.svg(stage);
      const noMap = A2.mapIcon(72, 222, 76, "grey");
      const noMapCross = L5.cross(72, 222, 60, "red", { w: 9 });
      const tick = L5.tick(352, 590, 48, "green", { w: 9 });
      svg.append(noMap, noMapCross, tick);

      /* a node: grey until it pops; a neighbour is soft blue from the moment it has spoken, then the winner is orange (ring) and
         the others go back to grey and fade; F is the orange destination, A the blue start */
      function nodeState(n, t) {
        const a = T.node0 + 0.12 * ORDER.indexOf(n);
        const base = { s: 0.8 + 0.2 * pop(t, a), o: fade(t, a) };
        if (n === BF.router) return { ...base, look: "solid", tone: "blue" };
        if (n === BF.dest) return { ...base, look: "solid", tone: "orange" };
        if (t >= T.min) {
          if (n === BF.best) {
            const k = lin(t, T.min, T.min + 0.3);
            return { ...base, look: "soft", tone: "orange", ring: "orange", ringK: k, pulse: bump(t, T.min, 0.4) };
          }
          return { ...base, look: "grey", o: base.o * (1 - 0.6 * io(t, T.min, T.min + 0.4)) };
        }
        if (t >= speak(n)) return { ...base, look: "soft", tone: "blue", pulse: bump(t, speak(n), 0.4) };
        return { ...base, look: "grey" };
      }

      /* a link A-n: it draws on grey with its cost; when the report arrives the cost becomes the sum (blue); at the minimum the
         losers fade and the winner's sum is taken over by the orange tag; the winner turns green and thick, drawn from A */
      function linkState(n, i, t) {
        const a = T.link0 + 0.12 * i;
        const st = { tone: null, k: lin(t, a, a + DRAW), pk: lin(t, a + 0.1, a + 0.55), from: BF.router };
        if (t >= sumAt(n)) Object.assign(st, { text: SUM[n], pill: "blue", ps: 1 + 0.1 * bump(t, sumAt(n), 0.3) });
        if (t >= T.min) {
          if (n === BF.best) {
            st.po = 0;
            if (t >= T.win[0]) Object.assign(st, { tone: "green", w: 14, k: io(t, T.win[0], T.win[1]) });
          } else Object.assign(st, { pill: "grey", po: 1 - 0.6 * io(t, T.min, T.min + 0.4) });
        }
        return st;
      }

      /* a dashed road beyond a neighbour: drawn blue from F back to the neighbour, its pill carries the report */
      function reportState(n, t) {
        const a = T.rep[n];
        const fadeOut = n === BF.best || t < T.min ? 0 : 0.55 * io(t, T.min, T.min + 0.4);
        return {
          tone: "blue",
          dash: true,
          base: false,
          from: BF.dest,
          k: io(t, a, a + DRAW),
          text: String(BF.says[n]),
          pill: "blue",
          pk: lin(t, a + 0.25, a + 0.7),
          o: 1 - fadeOut,
        };
      }

      return (t) => {
        const nodes = A2.obj(G.nodeNames, (n) => nodeState(n, t));
        const edges = {};
        NB.forEach((n, i) => {
          edges[`${BF.router}-${n}`] = linkState(n, i, t);
          edges[`${n}-${BF.dest}`] = reportState(n, t);
        });
        G.update({ nodes, edges });

        // ---- a report flies from its neighbour to the middle of its link, where the cost turns into the sum ----
        NB.forEach((n) => {
          const f = io(t, T.add[n], sumAt(n));
          const p = G.edgePt(`${BF.router}-${n}`, F0 + (0.5 - F0) * f, n);
          const gone = lin(t, sumAt(n) - 0.04, sumAt(n) + 0.08);
          tokens[n].set({
            ...p,
            s: (0.7 + 0.3 * pop(t, T.add[n], 0.35)) * (1 - 0.35 * gone),
            o: fade(t, T.add[n], 0.1) * (1 - gone),
          });
        });

        // ---- the minimum: the winner's sum becomes a solid orange tag ----
        win.set({
          s: (0.85 + 0.15 * pop(t, T.min, 0.4)) * (1 + 0.08 * bump(t, T.min + 0.4, 0.4)),
          o: fade(t, T.min, 0.08),
        });
        dest.set({ s: 0.8 + 0.2 * pop(t, 0.8), o: fade(t, 0.8, 0.2) });

        // ---- A has no map ----
        const nm = fade(t, T.nomap, 0.25);
        V.place(noMap, { s: 0.8 + 0.2 * pop(t, T.nomap), o: nm });
        const ck = lin(t, T.nomap + 0.35, T.nomap + 0.7);
        L5.drawOn(noMapCross, ck);
        V.place(noMapCross, { s: 0.7 + 0.3 * pop(t, T.nomap + 0.35, 0.4), o: ck > 0 ? 1 : 0 });

        // ---- A's table row, and the tick ----
        table.update({
          k: pop(t, T.table),
          rows: [{ k: lin(t, T.row[0], T.row[1]) }],
          cells: [[null, null, { tone: "orange" }]],
        });
        const tk = lin(t, T.tick, T.tick + 0.4);
        L5.drawOn(tick, tk);
        V.place(tick, { s: 0.7 + 0.3 * pop(t, T.tick, 0.4), o: tk > 0 ? 1 : 0 });
      };
    },
  });
})();
