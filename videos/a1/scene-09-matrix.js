/* Algorithms Phase 1 (algo-1), scene 09 · The matrix: the whole PageRank procedure is one table. Rows are the TARGET page,
   columns the SOURCE page (H[to][from]), so a column is where one page sends its rank. Three steps light three chips:
   1 links (H: the link weights fly from the web into their cells), 2 repair (A: the dead end T pours 0.2 into every page),
   3 teleport (G = 0.85 A + 0.03: a purple wave fills every empty cell with the floor). All numbers come from A1.matrices.
   Local seconds: 0.2-1.3 web, matrix and chips appear; 1.4-4.3 links (P, Q, R, S); 4.4-5.2 column sums, T's 0;
   5.4-7.7 repair; 8.2-10.7 teleport wave; 11.2-12.7 the closing tag. */
(function () {
  const V = window.VID;
  const A1 = V.a1;
  const { ramp, flash, lerp, ease: E } = V;

  // ---- the algorithm: all three matrices of the five-page web
  const WEB = A1.WEBS.web5;
  const M = A1.matrices(WEB, A1.D);
  const { names: NAMES, H, A, G } = M;
  const IDX = Object.fromEntries(NAMES.map((k, i) => [k, i]));
  const colSum = (X, j) => X.reduce((a, row) => a + row[j], 0);
  const eq = (a, b, what) => A1.must(A1.near(a, b, 1e-9), `scene 9: ${what} is ${a}, expected ${b}`);
  [0, 1, 2, 3].forEach((j) => eq(colSum(H, j), 1, `H column ${NAMES[j]} sum`));
  eq(colSum(H, 4), 0, "H column T sum");
  NAMES.forEach((_, j) => [A, G].forEach((X) => eq(colSum(X, j), 1, `A or G column ${NAMES[j]} sum`)));
  eq(M.floor, 0.03, "teleport floor");
  eq(H[1][0] + H[2][0], 1, "column P of H");
  eq(G[1][0], 0.455, "G[Q][P]");
  eq(G[2][1], 0.88, "G[R][Q]");
  eq(A[0][4], 0.2, "A[P][T]");
  A1.must(WEB.dead.join() === "T", "scene 9: T is the only dead end");
  const SRC = [0, 1, 2, 3]; // pages that have links, in column order
  const LINKS = SRC.map((j) => NAMES.map((to, i) => ({ to, i, w: H[i][j] })).filter((l) => l.w > 0)); // the weights that fly into column j

  // ---- timeline (local seconds)
  const T = {
    link: [1.4, 2.2, 2.9, 3.6], // the source page whose column is being filled
    sums: 4.4, // the column sums (0.1 apart)
    zero: 4.95, // T's sum is 0
    repair: 5.4, // chip 2
    pour: 5.5, // T's dashed pour edges draw on
    send: 5.9, // the 0.2 packets leave T (0.15 apart, 0.6 s on the way)
    fixed: 7.4, // T's sum becomes 1
    tele: 8.2, // chip 3
    wave: 8.5, // the teleport wave reaches column P ...
    waveDt: 0.4, // ... and a new column every 0.4 s
    done: 11.2, // the chips make way for the closing tag
  };
  const LIFE = 0.62; // how long one edge weight lives before it lands in its cell
  const cellT = (j, rank) => T.link[j] + 0.5 + 0.06 * rank; // a link cell pops as its weight lands
  const sendT = (i) => T.send + 0.15 * i;
  const fixT = (i) => sendT(i) + 0.65; // T's cells pop as the 0.2 packets arrive
  const waveT = (i, j) => T.wave + T.waveDt * j + 0.05 * i;

  // ---- layout (stage px)
  const WEB_BOX = { x: 20, y: 90, w: 330, h: 300, r: 30 };
  const MAT = { x: 364, y: 70, cellW: 100, cellH: 62, headW: 60, headH: 60 };
  const CHIP_Y = 556;
  const CHIPS = [
    { text: "1 links", tone: "blue", w: 150, x: 439, on: [T.link[0], T.repair] },
    { text: "2 repair", tone: "purple", w: 170, x: 623, on: [T.repair, T.tele] },
    { text: "3 teleport", tone: "purple", w: 190, x: 826, on: [T.tele, T.done] },
  ];
  // the web is the shared five-page web, with T and S nudged apart so T's two-word tag fits under it
  const WEB9 = { ...WEB, pos: { ...WEB.pos, S: [290, 320], T: [110, 285] } };
  const POUR = NAMES.slice(0, 4).map((to) => ["T", to]); // T pours to every page (its own cell is the matrix's 0.2)

  /* the strongest of several outlines for one column */
  const best = (list) => list.reduce((a, b) => (b.k > a.k ? b : a), { k: 0 });

  V.scene({
    kicker: "THE MATRIX",
    title: ["Links become", "a matrix"],
    dur: 13,
    caps: [
      [0.4, 4.4, "Each column is where one page sends its rank."],
      [4.6, 7.8, "T has no links, so it pours 0.2 into every page."],
      [8.2, 11.9, "Damping adds a teleport floor of 0.03 to every cell."],
    ],
    build(stage) {
      const g = A1.web(stage, { ...WEB_BOX, web: WEB9, extra: POUR, tags: { T: "below" } });
      const m = A1.matrix(stage, { ...MAT, names: NAMES });

      // weights in flight: from the middle of a link into its cell
      const fly = V.s("svg", { width: 936, height: 640, viewBox: "0 0 936 640" });
      Object.assign(fly.style, { position: "absolute", left: "0px", top: "0px", overflow: "visible" });
      stage.append(fly);
      const pills = [A1.svgPill(fly), A1.svgPill(fly)];

      const chips = CHIPS.map((c) => A1.tag(stage, { text: c.text, tone: c.tone, w: c.w, fs: 28, h: 52 }));
      const finish = A1.tag(stage, {
        text: "no empty cell, no trap",
        tone: "green",
        solid: true,
        icon: A1.icon("tick", 30, "green", { flow: true, on: true }),
      });
      // the teleport recipe under the web: every cell = cell x 0.85 + 0.03
      const every = A1.tag(stage, { text: "every cell", tone: "grey", ghost: true });
      const times = A1.tag(stage, {
        text: "0.85",
        tone: "purple",
        solid: true,
        w: 126,
        icon: A1.icon("cross", 28, "purple", { flow: true, on: true, w: 7 }),
      });
      const plus = A1.tag(stage, {
        text: String(A1.fmt(M.floor)),
        tone: "purple",
        solid: true,
        w: 126,
        icon: A1.icon("plus", 28, "purple", { flow: true, on: true, w: 7 }),
      });
      const dice = A1.icon("dice", 44, "purple");
      stage.append(dice);

      return (t) => {
        // ================= the web =================
        const node = {};
        NAMES.forEach((k, j) => {
          const a = ramp(t, 0.3 + 0.08 * j, 0.7 + 0.08 * j, E.lin);
          const s = { s: 0.6 + 0.4 * E.pop(a), o: Math.min(1, a * 4), tone: "grey" };
          if (j < 4) {
            const s0 = T.link[j];
            const halo = ramp(t, s0, s0 + 0.25) * (1 - ramp(t, s0 + 0.65, s0 + 0.95));
            Object.assign(s, {
              tone: t >= s0 ? "blue" : "grey",
              look: t >= s0 && t < s0 + 0.8 ? "solid" : "soft",
              halo,
              pulse: 0.5 * flash(t, s0, s0 + 0.5),
            });
            // a 0.2 packet landing on this page
            const land = fixT(j) - 0.05;
            s.pulse += 0.5 * flash(t, land, land + 0.4);
            const w = T.wave + T.waveDt * j;
            s.pulse += 0.6 * flash(t, w, w + 0.5); // the teleport wave passes this page's column
          } else {
            const red = t < T.repair;
            Object.assign(s, {
              tone: red ? "red" : "purple",
              ring: red ? "red" : "purple",
              rk: ramp(t, 1.0, 1.4),
              halo: 0.8 * flash(t, T.zero, T.zero + 0.6),
              pulse:
                0.5 * flash(t, T.zero, T.zero + 0.5) +
                0.5 * flash(t, T.pour, T.pour + 0.5) +
                0.5 * flash(t, fixT(4), fixT(4) + 0.4) +
                0.6 * flash(t, T.wave + T.waveDt * 4, T.wave + T.waveDt * 4 + 0.5),
              tag: t < T.repair + 0.15 ? "dead end" : "pours to all",
              tagTone: red ? "red" : "purple",
              tagK:
                t < T.repair
                  ? ramp(t, 1.1, 1.5, E.lin)
                  : t < T.repair + 0.15
                    ? 1 - ramp(t, T.repair, T.repair + 0.15, E.lin)
                    : ramp(t, T.repair + 0.15, T.repair + 0.55, E.lin),
            });
          }
          node[k] = s;
        });
        const edge = {};
        const grow = ramp(t, 0.7, 1.3, E.inOut);
        WEB.edges.forEach(([a, b]) => {
          const s0 = T.link[IDX[a]];
          edge[a + b] = { k: grow, tone: t >= s0 ? "blue" : "grey", w: 1 + 0.5 * flash(t, s0 + 0.05, s0 + 0.55) };
        });
        const pourK = ramp(t, T.pour, T.pour + 0.5, E.inOut);
        POUR.forEach(([a, b]) => (edge[a + b] = { k: pourK, o: pourK > 0 ? 1 : 0, tone: "purple", dash: true }));
        const packets = [];
        POUR.forEach(([, b], i) => {
          const [s0, s1] = [sendT(i), fixT(i) - 0.05];
          if (t >= s0 && t < s1)
            packets.push({ from: "T", to: b, f: ramp(t, s0, s1, E.inOut), tone: "purple", text: A1.fmt(A[i][4]), s: 0.7 + 0.3 * ramp(t, s0, s0 + 0.2, E.lin) - 0.3 * ramp(t, s1 - 0.2, s1, E.lin), o: ramp(t, s0, s0 + 0.12, E.lin) * (1 - ramp(t, s1 - 0.2, s1, E.lin)) });
        }); // prettier-ignore
        g.update({ node, edge, packets });

        // ================= the matrix =================
        const col = {};
        const colHead = {};
        NAMES.forEach((k, j) => {
          const o = [];
          if (j < 4) {
            const s0 = T.link[j];
            o.push({ tone: "blue", k: ramp(t, s0, s0 + 0.3) * (1 - ramp(t, s0 + 0.75, s0 + 1.0)) });
            if (t >= s0) colHead[k] = "blue";
          } else {
            o.push({ tone: "red", k: flash(t, T.zero, T.zero + 0.8) });
            o.push({ tone: "purple", k: ramp(t, 6.3, 6.6) * (1 - ramp(t, 7.5, 7.8)) });
            if (t >= T.zero) colHead[k] = t >= T.repair ? "purple" : "red";
          }
          const w = T.wave + T.waveDt * j;
          o.push({ tone: "purple", k: flash(t, w - 0.05, w + 0.6) });
          const b = best(o);
          if (b.k > 0) col[k] = b;
        });

        const sums = {};
        SRC.forEach((j) => {
          const k = ramp(t, T.sums + 0.1 * j, T.sums + 0.1 * j + 0.3, E.lin);
          if (k > 0) sums[NAMES[j]] = { text: A1.fmt(colSum(H, j)), tone: "green", mark: "tick", k };
        });
        if (t >= T.zero && t < T.fixed)
          sums.T = {
            text: A1.fmt(colSum(H, 4)),
            tone: "red",
            mark: "cross",
            k: ramp(t, T.zero, T.zero + 0.3, E.lin) * (1 - ramp(t, T.fixed - 0.1, T.fixed, E.lin)),
          };
        else if (t >= T.fixed)
          sums.T = {
            text: A1.fmt(colSum(A, 4)),
            tone: "green",
            mark: "tick",
            k: ramp(t, T.fixed, T.fixed + 0.3, E.lin),
          };
        // prettier-ignore

        const cell = (to, from) => {
          const [i, j] = [IDX[to], IDX[from]];
          const link = H[i][j] > 0;
          const w = waveT(i, j);
          if (t >= w) {
            // the wave: solid purple at the front, then each cell keeps the colour of where its rank came from
            const hot = t < w + 0.35;
            const kept = link || j === 4;
            const tone = hot || !(link && j < 4) ? "purple" : "blue";
            return { text: A1.fmt(G[i][j]), tone, look: hot ? "solid" : "soft", k: kept ? 1 : ramp(t, w, w + 0.3, E.lin) };
          }
          if (j === 4) {
            const k = ramp(t, fixT(i), fixT(i) + 0.3, E.lin);
            return k > 0 ? { text: A1.fmt(A[i][4]), tone: "purple", look: "solid", k } : undefined;
          }
          if (!link) return undefined;
          const rank = H.slice(0, i).filter((row) => row[j] > 0).length;
          const k = ramp(t, cellT(j, rank), cellT(j, rank) + 0.3, E.lin);
          return k > 0 ? { text: A1.fmt(H[i][j]), tone: "blue", look: "solid", k } : undefined;
        }; // prettier-ignore
        m.update({ cell, colHead, col, sums, labels: ramp(t, 0.7, 1.1, E.lin), o: ramp(t, 0.5, 0.9, E.lin) });

        // ---- a weight flies from its link into its cell
        const jAct = T.link.findIndex((s0) => t >= s0 && t < s0 + LIFE);
        pills.forEach((p, n) => {
          const lk = jAct >= 0 ? LINKS[jAct][n] : undefined;
          if (!lk) return p.set({ o: 0 });
          const [from, s0] = [NAMES[SRC[jAct]], T.link[jAct]];
          const [a, b] = [g.edgePt(from, lk.to, 0.5), m.cellAt(lk.to, from)];
          const f = ramp(t, s0 + 0.22, s0 + 0.52, E.inOut);
          const k = ramp(t, s0 + 0.0 + 0.04 * n, s0 + 0.22 + 0.04 * n, E.lin);
          p.set({
            x: lerp(a.x, b.x, f),
            y: lerp(a.y, b.y, f) - 34 * Math.sin(Math.PI * f),
            text: A1.fmt(lk.w),
            tone: "blue",
            look: "solid",
            s: (0.7 + 0.3 * E.pop(k)) * (1 + 0.12 * Math.sin(Math.PI * f)),
            o: Math.min(1, k * 4) * (1 - ramp(t, s0 + 0.5, s0 + LIFE, E.lin)),
          });
        });

        // ================= the three chips, then the closing tag =================
        CHIPS.forEach((c, n) => {
          const a = ramp(t, 0.9 + 0.1 * n, 1.2 + 0.1 * n, E.lin);
          const lit = t >= c.on[0];
          chips[n].set({
            x: c.x,
            y: CHIP_Y,
            center: true,
            tone: lit ? c.tone : "grey",
            solid: lit && t < c.on[1],
            s: (0.8 + 0.2 * E.pop(a)) * (1 + 0.1 * flash(t, c.on[0], c.on[0] + 0.4)),
            o: Math.min(1, a * 4) * (1 - ramp(t, T.done, T.done + 0.3, E.lin)),
          });
        });
        const fk = ramp(t, T.done + 0.3, T.done + 0.75, E.lin);
        finish.set({ x: 644, y: CHIP_Y, center: true, s: 0.8 + 0.2 * E.pop(fk), o: Math.min(1, fk * 4) });

        // ---- the recipe under the web while the teleport step runs
        const rk = (d) => ramp(t, T.tele + d, T.tele + d + 0.35, E.lin);
        const [ra, rb, rc] = [rk(0.0), rk(0.15), rk(0.3)];
        every.set({ x: 168, y: 462, center: true, s: 0.8 + 0.2 * E.pop(ra), o: Math.min(1, ra * 4) });
        times.set({ x: 80, y: 520, center: true, s: 0.8 + 0.2 * E.pop(rb), o: Math.min(1, rb * 4) });
        plus.set({ x: 222, y: 520, center: true, s: 0.8 + 0.2 * E.pop(rc), o: Math.min(1, rc * 4) });
        const dk = rk(0.45);
        V.place(dice, {
          x: 290,
          y: 498,
          s: 0.7 + 0.3 * E.pop(dk),
          r: 360 * (1 - E.out(dk)) * 0.5,
          o: Math.min(1, dk * 4),
        });
      };
    },
  });
})();
