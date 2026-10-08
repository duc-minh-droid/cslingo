/* Phase 4 · scene 04-cut: the cut property, shown on the example network.
   Split the towns into {A} and the rest (a purple cut). The cables that cross it turn orange and are listed as tiles; the cheapest
   (AC 3) turns green: it is safe. Then the proof by swapping, on a real tree T = AB BC BD DE (cost 12) that uses the dearer
   crossing cable AB: add AC, a loop A-B-C appears (cost 15), drop AB, and the tree costs 11.
   Two graphs share the stage so a cable can grow in colour over its own grey line: `base` (under everything: the cut blobs and the
   grey cables) and `top` (the coloured cables, all five towns and their pills). Every number comes from A4.CUTS / A4.EXCHANGE and is
   asserted when the scene is built. update(t) is a pure function of t. */
(function () {
  const V = window.VID;
  const A4 = V.a4;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  const lin = E.lin;

  // ---------- the facts (asserted against the algorithm logs) ----------
  const CUT = A4.CUTS[0];
  const EX = A4.EXCHANGE;
  A4.same("cut X", CUT.X, ["A"]);
  A4.same(
    "cut {A} crossing",
    CUT.crossing.map((c) => `${c.key} ${c.w}`),
    ["AC 3", "AB 4"],
  );
  A4.same("cut {A} safe", CUT.safe.key, "AC");
  A4.same("swap proof", [EX.e, EX.f, EX.cycle, EX.T, EX.total, EX.T2, EX.total2], [
    "AC",
    "AB",
    ["AB", "BC", "AC"],
    ["AB", "BC", "BD", "DE"],
    12,
    ["BC", "BD", "DE", "AC"],
    11,
  ]);
  A4.same("cost of T + AC", A4.sumOf(EX.T) + A4.wOf(EX.e), 15);
  A4.same("cost after the swap", A4.sumOf(EX.T) + A4.wOf(EX.e) - A4.wOf(EX.f), EX.total2);
  const KEYS = A4.EDGE_KEYS;
  const REST = A4.TOWNS.filter((x) => !CUT.X.includes(x));
  const RUN = EX.T.reduce((r, k) => r.concat(r[r.length - 1] + A4.wOf(k)), [0]); // 0, 4, 6, 11, 12
  const LOOP = EX.cycle;

  // ---------- timings (local seconds) ----------
  const GROW = 0.35; // a cable grows over this long
  const TREE = { AB: 5.6, BC: 5.9, BD: 6.2, DE: 6.5 }; // when each cable of T starts to grow
  A4.same("T is drawn in its own order", Object.keys(TREE), EX.T);
  const FROM = { AB: "A", BC: "B", BD: "B", DE: "D" };
  const DONE = Object.fromEntries(EX.T.map((k) => [k, TREE[k] + GROW]));
  const REACH = { A: TREE.AB, B: DONE.AB, C: DONE.BC, D: DONE.BD, E: DONE.DE }; // when a town joins T
  const AC_ADD = 7.4; // AC grows into T
  const AC_DONE = AC_ADD + 0.5;
  const ALARM = 8.3;
  const SWAP = 9.8;
  const GREEN = { AC: 9.9, BC: 10.0, BD: 10.1, DE: 10.2 }; // the swap turns T2 green, one cable after another
  const TOWN_GREEN = { A: 9.9, C: 9.9, B: 10.0, D: 10.1, E: 10.2 };
  const W = 1.3; // width of cables that belong to a tree

  function build(stage) {
    const base = A4.net(stage, { x: 24, y: 20, s: 1 });
    const top = A4.net(stage, { x: 24, y: 20, s: 1, hidden: true });
    const xTag = A4.tag(stage, { x: 20, y: 142, text: "X", tone: "purple", solid: true });
    const crossTag = A4.tag(stage, { x: 650, y: 104, text: "across the cut", tone: "orange" });
    const tiles = A4.tiles(stage, {
      x: 650,
      y: 176,
      items: CUT.crossing.map((c) => `${c.key} ${c.w}`),
      w: 270,
      h: 56,
      gap: 12,
      dir: "col",
      tone: "orange",
    });
    const tot = A4.total(stage, { x: 650, y: 40, w: 270, h: 80, label: "tree cost", tone: "blue" });
    const cheaper = A4.tag(stage, { x: 650, y: 136, text: "one cheaper", tone: "green" });
    const ov = L5.svg(stage);
    const loopX = L5.cross(172, 250, 64, "red", { w: 9 });
    const mid = top.mid(EX.f);
    const swapX = L5.cross(mid.x, mid.y, 46, "red", { w: 8 });
    const tick = L5.tick(780, 250, 70, "green");
    ov.append(loopX, swapX, tick);

    return (t) => {
      const dim = ramp(t, 1.8, 2.2, lin);
      const baseO = lerp(1, 0.4, dim); // cables that are out of the story for now
      const G = {}; // coloured cables, drawn over the grey ones
      const U = {}; // the grey network underneath
      KEYS.forEach((key, i) => {
        U[key] = { tone: "grey", k: ramp(t, 0.3 + 0.06 * i, 0.7 + 0.06 * i), o: baseO };
      });
      const hide = (key) => (U[key] = { tone: "grey", o: 0 });
      // a cable that grows in colour over its grey line: the grey fades out as the coloured pill pops in
      const grow = (key, a, tone, from, d = GROW) => {
        const k = ramp(t, a, a + d, E.inOut);
        const pill = ramp(t, a + 0.1, a + 0.4, lin);
        G[key] = { tone, solid: true, w: W, k, from, pill };
        if (k >= 0.999) hide(key);
        else U[key] = { tone: "grey", o: baseO, pillO: baseO * (1 - pill) };
      };

      // ----- the cut: the two cables that cross it are orange, the cheapest one turns green -----
      const pulse = Math.max(flash(t, 1.8, 2.4), flash(t, 2.8, 3.4));
      const lit = ramp(t, 3.6, 4.1, lin); // AC wins, AB steps back
      const leave = ramp(t, 5.0, 5.6, lin); // the cut fades out
      if (t >= 1.8 && t < 5.0) {
        G.AB = { tone: "orange", solid: true, w: 1.2, halo: pulse, o: lerp(1, 0.5, lit) };
        G.AC =
          t < 3.6
            ? { tone: "orange", solid: true, w: 1.2, halo: pulse }
            : { tone: "green", solid: true, w: W, halo: lit };
        hide("AB");
        hide("AC");
      }
      // AB leaves the story, AC stays on as a dashed ghost
      if (t >= 5.0 && t < TREE.AB) {
        G.AB = { tone: "orange", solid: true, w: 1.2, o: 0.5 * (1 - leave) };
        U.AB = { tone: "grey", o: baseO * leave };
      }
      if (t >= 5.0 && t < AC_ADD) {
        G.AC = { tone: "green", dash: true, o: 0.8, pillO: 0.8 };
        hide("AC");
      }

      // ----- the example tree T, cable by cable, then the extra cable AC -----
      EX.T.forEach((key) => {
        if (t >= TREE[key]) grow(key, TREE[key], "blue", FROM[key]);
      });
      if (t >= AC_ADD) grow("AC", AC_ADD, "green", "A", AC_DONE - AC_ADD);
      // ----- the loop alarm -----
      const alarm = ramp(t, ALARM, ALARM + 0.3, lin);
      if (t >= ALARM) {
        LOOP.forEach((key) => {
          G[key] = { tone: "red", solid: true, w: W, halo: alarm };
          hide(key);
        });
      }
      // ----- the swap: AB goes, the rest of the tree T2 turns green -----
      if (t >= SWAP) {
        G.AB = { tone: "red", dash: true, o: 1 - ramp(t, SWAP, SWAP + 0.4, lin), pillO: 1 - ramp(t, SWAP, SWAP + 0.2, lin) };
        hide("AB");
      }
      EX.T2.forEach((key) => {
        if (t >= GREEN[key]) {
          G[key] = { tone: "green", solid: true, w: W, halo: 0.8 * flash(t, GREEN[key], GREEN[key] + 0.5) };
          hide(key);
        }
      });

      // ----- towns -----
      const towns = {};
      A4.TOWNS.forEach((town, i) => {
        const pk = ramp(t, 0.2 + 0.08 * i, 0.6 + 0.08 * i, lin);
        const st = { tone: "grey", s: E.pop(pk), o: Math.min(1, pk * 4) };
        if (town === "A" && t >= 1.3 && t < 5.0) {
          st.tone = "purple";
          st.s *= 1 + 0.12 * flash(t, 1.3, 1.8);
        }
        if (t >= REACH[town]) {
          st.tone = "blue";
          st.solid = true;
          st.s *= 1 + 0.16 * flash(t, REACH[town], REACH[town] + 0.3);
        }
        if (t >= TOWN_GREEN[town]) {
          st.tone = "green";
          st.s = E.pop(pk) * (1 + 0.16 * flash(t, TOWN_GREEN[town], TOWN_GREEN[town] + 0.3));
        }
        towns[town] = st;
      });

      const blobK = ramp(t, 1.3, 2.0) * (1 - leave);
      base.update({
        edges: U,
        blobs: [
          { set: CUT.X, tone: "purple", k: blobK },
          { set: REST, tone: "grey", k: ramp(t, 1.6, 2.3) * (1 - leave), fill: false },
        ],
      });
      top.update({ edges: G, towns });

      // ----- the right-hand column -----
      const xk = Math.min(ramp(t, 1.4, 1.9, lin), 1 - ramp(t, 5.0, 5.4, lin));
      xTag.set({ k: xk });
      const gone = 1 - ramp(t, 5.0, 5.4, lin);
      crossTag.set({ k: Math.min(ramp(t, 2.2, 2.6, lin), gone) });
      tiles.all((i) => {
        const k = ramp(t, 2.2 + 0.15 * i, 2.6 + 0.15 * i, lin);
        const win = i === 0 ? lit : 0;
        const lose = i === 1 ? lit : 0;
        return {
          tone: win > 0.5 ? "green" : "orange",
          solid: win > 0.5,
          s: (0.8 + 0.2 * E.pop(k)) * (1 + 0.06 * (i === 0 ? flash(t, 3.6, 4.1) : 0)),
          o: Math.min(1, k * 4) * lerp(1, 0.5, lose) * gone,
        };
      });

      // the running tree cost: 4, 6, 11, 12 as T is built, 15 with the extra cable, 11 after the swap
      const done = EX.T.filter((k) => t >= DONE[k]).length;
      const bump = Math.max(...EX.T.map((k) => flash(t, DONE[k], DONE[k] + 0.25)), flash(t, AC_DONE, AC_DONE + 0.3));
      let text = String(RUN[done]);
      let state = { tone: "blue", bump, k: ramp(t, DONE.AB, DONE.AB + 0.25, lin) };
      if (t >= AC_DONE) text = String(RUN[4] + A4.wOf(EX.e));
      if (t >= ALARM) state = { tone: "red", bump: Math.max(flash(t, ALARM, ALARM + 0.4), 0) };
      if (t >= SWAP + 0.2) {
        const n = ramp(t, SWAP + 0.2, SWAP + 0.8, lin);
        text = String(Math.round(lerp(RUN[4] + A4.wOf(EX.e), EX.total2, n)));
        state = { tone: "green", solid: true, bump: flash(t, SWAP + 0.8, SWAP + 1.2) };
      }
      tot.set({ ...state, text });
      cheaper.set({ k: ramp(t, 10.6, 11.0, lin) });

      // ----- pictograms -----
      L5.drawOn(loopX, ramp(t, ALARM, ALARM + 0.4, lin));
      V.place(loopX, { o: 1 - ramp(t, SWAP, SWAP + 0.2, lin) });
      const sk = ramp(t, SWAP, SWAP + 0.2, lin);
      L5.drawOn(swapX, sk);
      V.place(swapX, { o: Math.min(1, sk * 3) * (1 - ramp(t, SWAP + 0.35, SWAP + 0.6, lin)) });
      const tk = ramp(t, 10.9, 11.3, lin);
      L5.drawOn(tick, tk);
      V.place(tick, { s: 0.8 + 0.2 * E.pop(clamp(tk * 1.5)), o: tk <= 0 ? 0 : 1 });
    };
  }

  V.scene({
    kicker: "THE CUT PROPERTY",
    title: ["The cheapest bridge", "across a cut is safe"],
    dur: 14,
    caps: [
      [0.4, 3.0, "Split the towns into two groups: a cut."],
      [3.2, 5.4, "A tree must cross it. AC is the cheapest."],
      [5.6, 8.0, "Suppose a tree uses the dearer cable AB."],
      [8.2, 10.6, "Add AC: a loop. Drop AB and the tree is cheaper."],
      [10.8, 13.5, "The cheapest cable across a cut is always safe."],
    ],
    build,
  });
})();
