/* Lecture 12 · scene-03-drift: the position update x = x + v (lesson 12.2). Part A: the lesson's numbers on a faint grid,
   (3, 5) + (2, -1) = (5, 4), done one dimension at a time (each coordinate pair pulses in turn and its component is drawn on
   the map). Part B: the lesson's no-pull swarm (L12.DRIFT, c1 = c2 = 0): every dot flies in a straight line until a wall
   stops it, and nothing finds the food. Numbers from L12.POS and L12.DRIFT (asserted below). Local seconds: 0.2 map,
   0.8 dot, 1.6 velocity, 3.2 move, 4.4 / 5.0 the two dimensions, 5.6 part A leaves, 6.0 the swarm, 6.6-11.6 five steps,
   11.8 verdict. */
(function () {
  const V = window.VID;
  const L12 = V.l12;
  const L5 = V.l5;
  const { ramp, lerp, ease: E } = V;

  const { x: X, v: VEL, nx: NX } = L12.POS;
  L12.same(
    [0, 1].map((j) => X[j] + VEL[j]),
    NX,
    "scene 3: (3, 5) + (2, -1) = (5, 4)",
  );
  const D = L12.DRIFT;
  L12.same([D.n, D.its, D.P.c1, D.P.c2], [8, 5, 0, 0], "scene 3: the no-pull swarm");
  const num = (n) => (n < 0 ? `−${-n}` : String(n));

  // ---------- timeline (local seconds) ----------
  const T = {
    map: [0.2, 0.8],
    dot: [0.8, 1.2],
    vel: [1.6, 2.6],
    move: [3.2, 4.2],
    dims: [
      [4.4, 4.9],
      [5.0, 5.5],
    ],
    outA: [5.6, 6.1],
    swarm: [6.0, 6.5],
    play: [6.6, 11.6],
    end: [11.8, 12.4],
  };

  // the panel: three labelled pairs of number tiles, one tile per dimension
  const PX = 648;
  const ROWS = [
    { y: 12, label: "position", vals: X, tone: "blue", solid: false },
    { y: 222, label: "velocity", vals: VEL, tone: "grey", solid: false },
    { y: 432, label: "new position", vals: NX, tone: "blue", solid: true },
  ];
  const TILE = { w: 112, h: 80, gap: 20, dy: 46 };
  const tileX = (j) => PX + 14 + j * (TILE.w + TILE.gap);

  V.scene({
    kicker: "THE MOVE",
    title: ["New position =", "position + velocity"],
    dur: 13,
    caps: [
      [1, 3, "To move, a particle adds its velocity to its position."],
      [3.2, 5.6, "(3, 5) plus (2, −1) lands on (5, 4)."],
      [6.2, 9, "With no pulls, every dot just flies straight on."],
      [9.2, 12.6, "Nothing steers them towards the scent."],
    ],
    build(stage) {
      const map = L12.field(stage, { x: 12, y: 12, size: 616, vecs: 8, tails: 8, rings: 2 });
      const lay = L5.svg(stage);
      const midX = tileX(0) + (2 * TILE.w + TILE.gap) / 2;
      const marks = [
        lay.appendChild(L12.mark("plus", midX, 180, 40, "grey")),
        lay.appendChild(L12.mark("equals", midX, 390, 40, "grey")),
      ];
      const labels = ROWS.map((r) => L12.label(stage, { x: PX + 14, y: r.y, w: 262, text: r.label, align: "left" }));
      const tiles = ROWS.map((r) =>
        r.vals.map((v, j) =>
          L12.chip(stage, { x: tileX(j), y: r.y + TILE.dy, w: TILE.w, h: TILE.h, text: num(v), tone: r.tone, fs: 40 }),
        ),
      );
      // part B panel
      const noPull = L12.tag(stage, { x: PX, y: 12, text: "c₁ = c₂ = 0", tone: "grey" });
      const noPullLab = L12.label(stage, { x: PX + 4, y: 84, w: 272, text: "no pulls", align: "left" });
      const verdict = L12.tag(stage, { x: PX, y: 170, text: "no food found", tone: "red", solid: true });

      // a drift arrow ends at the map's edge (the wall would stop the dot there anyway)
      const inBox = (a, v) => {
        let f = 1;
        for (let j = 0; j < 2; j++) {
          if (a[j] + v[j] > L12.BOX) f = Math.min(f, (L12.BOX - a[j]) / v[j]);
          if (a[j] + v[j] < 0) f = Math.min(f, -a[j] / v[j]);
        }
        return [a[0] + v[0] * f, a[1] + v[1] * f];
      };

      return (t) => {
        // ---- part A ----
        const outA = 1 - ramp(t, T.outA[0], T.outA[1], E.lin);
        const mv = ramp(t, T.move[0], T.move[1], E.inOut);
        const dotK = ramp(t, T.dot[0], T.dot[1]);
        const velK = ramp(t, T.vel[0], T.vel[1], E.inOut);
        const pulse = T.dims.map(([a, b]) => V.flash(t, a, b));
        const here = [lerp(X[0], NX[0], mv), lerp(X[1], NX[1], mv)];
        const vecsA = [];
        const ringsA = [];
        const dotsA = [];
        if (outA > 0) {
          vecsA.push({ a: X, b: NX, tone: "grey", w: 7, head: 20, k: velK, o: outA });
          // one dimension at a time: the x step, then the y step
          vecsA.push({
            a: X,
            b: [NX[0], X[1]],
            tone: "blue",
            w: 4,
            head: 14,
            dash: true,
            k: ramp(t, 4.4, 4.8),
            o: outA,
          });
          vecsA.push({
            a: [NX[0], X[1]],
            b: NX,
            tone: "blue",
            w: 4,
            head: 14,
            dash: true,
            k: ramp(t, 5.0, 5.4),
            o: outA,
          });
          if (mv > 0)
            ringsA.push({ x: X, tone: "blue", r: 16, dash: true, k: ramp(t, T.move[0], T.move[0] + 0.4), o: outA });
          dotsA.push({ x: here, tone: "blue", r: 15, s: E.pop(dotK), focus: true, o: outA });
        }
        // ---- part B ----
        const s = 5 * ramp(t, T.play[0], T.play[1], E.lin);
        const P = L12.at(D, s).x;
        const Vn = D.frames[Math.min(D.its, Math.floor(s))].v;
        const partB = t >= T.swarm[0];
        map.update({
          k: ramp(t, T.map[0], T.map[1]),
          heat: 0.35 + 0.65 * ramp(t, T.outA[0], T.outA[1] + 0.4, E.inOut),
          grid: outA,
          dots: partB
            ? P.map((x, i) => ({ x, tone: "blue", r: 13, s: E.pop(L12.seq(t, T.swarm[0], 0.04, 0.3, i)) }))
            : dotsA,
          tails: partB && s > 0 ? P.map((_, i) => ({ pts: L12.trail(D, i, s, 5), tone: "blue", o: 0.45, w: 5 })) : [],
          vecs: partB
            ? P.map((x, i) => {
                const v = Vn[i];
                if (Math.hypot(v[0], v[1]) < 1e-9) return { a: x, b: x, k: 0 };
                return {
                  a: x,
                  b: inBox(x, v),
                  tone: "grey",
                  w: 5,
                  head: 14,
                  k: L12.seq(t, T.swarm[0] + 0.1, 0.04, 0.4, i),
                };
              })
            : vecsA,
          rings: partB ? [{ x: L12.FOOD, tone: "grey", r: 34, dash: true, k: ramp(t, T.end[0], T.end[1]) }] : ringsA,
        });

        // panel, part A
        const rowK = [
          ramp(t, T.dot[0], T.dot[1] + 0.2),
          ramp(t, T.vel[0], T.vel[0] + 0.5),
          ramp(t, T.move[0] + 0.4, T.move[1]),
        ];
        labels.forEach((l, r) => l.set({ k: rowK[r], o: outA }));
        tiles.forEach((row, r) =>
          row.forEach((c, j) => c.set({ k: rowK[r], o: outA, solid: ROWS[r].solid, ring: "blue", ringK: pulse[j] })),
        );
        marks[0].style.opacity = String(ramp(t, T.vel[0], T.vel[0] + 0.5) * outA);
        marks[1].style.opacity = String(rowK[2] * outA);
        // panel, part B
        noPull.set({ k: ramp(t, T.swarm[0], T.swarm[1]) });
        noPullLab.set({ k: ramp(t, T.swarm[0] + 0.2, T.swarm[1] + 0.2) });
        verdict.set({ k: ramp(t, T.end[0], T.end[1]) });
      };
    },
  });
})();
