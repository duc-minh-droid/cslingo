/* Lecture 1 (ds-1), scene 09: scale up (one bigger machine) or scale out (many ordinary machines). We need 8 times the
   power of one machine: up costs 34,297 against 8,800, and when one machine dies the big one leaves 0% and the grid 88%.
   Then the need grows to 40 times: no single machine that big exists, but the grid just grows (44,000). All numbers come from
   D1.SCALE (asserted in common.js); the grid sizes are asserted below. update(t) is pure. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;
  const S = D1.SCALE;

  // ---------- the data this scene shows (all from D1.SCALE, asserted) ----------
  const COLS = 8;
  const ROWS = 5;
  const SMALL = { cols: 4, rows: 2 };
  D1.same("machines in the scale-out grid at 8x", SMALL.cols * SMALL.rows, S.need);
  D1.same("machines in the scale-out grid at 40x", COLS * ROWS, S.big);
  D1.same("scale up cannot reach 40x", [S.big > S.max, S.up40], [true, Infinity]);
  D1.same("scale up costs more than scale out at 8x", S.up8 > S.out8, true);
  D1.same("capacity left after one machine dies (up, out)", [S.leftUp, S.leftOut], [0, 88]);
  const BAR_MAX = S.out40; // the longest cost: every bar is drawn against it
  D1.same(
    "the bars fit",
    [S.up8, S.out8].every((c) => c < BAR_MAX),
    true,
  );
  const money = (v, k) => D1.money(Math.round(v * k));

  // ---------- layout (stage px) ----------
  const COL_L = { x: 20, c: 235 }; // left column: x 20 to 450
  const COL_R = { x: 486, c: 701 }; // right column: x 486 to 916
  const BIG = { x: 140, y: 196, w: 190, h: 220 };
  const SM = { w: 92, h: 104, gap: 12, y: 196 };
  SM.x = COL_R.c - (SMALL.cols * SM.w + (SMALL.cols - 1) * SM.gap) / 2;
  const DEAD = 2; // the small machine that dies
  const ICON = { size: 40, dx: 52, dy: 46, y: 218 };
  const iconAt = (i) => ({
    x: COL_R.c - ((COLS - 1) * ICON.dx) / 2 + (i % COLS) * ICON.dx,
    y: ICON.y + Math.floor(i / COLS) * ICON.dy,
  });
  const STAT_Y = 432;
  const BAR_Y = 520;
  const RES_Y = 556;

  // ---------- timeline (local seconds) ----------
  const T = {
    banner: 0.2,
    cols: 0.6,
    machines: 0.8,
    stats: 1.7,
    count: [1.9, 3.1],
    bumpL: 3.3,
    bumpR: 3.55,
    bolt: 5.45,
    die: 5.9,
    result: 6.2,
    clear: [7.6, 7.9],
    big: 7.8,
    switch: 8.0,
    icons: 8.3,
    none: 8.7,
    grow: [8.8, 10.0],
    add: 9.6,
  };

  const smooth = (x) => x * x * (3 - 2 * x);

  V.scene({
    kicker: "SCALABILITY",
    title: ["Scale up or", "scale out?"],
    dur: 11,
    caps: [
      [0.5, 3.0, "Need 8 times the power of one machine."],
      [3.2, 5.4, "Scale up costs more: £34,297 vs £8,800."],
      [5.8, 7.6, "One dies: 0% left, or 88% left."],
      [8.0, 10.6, "At 40 times, no single machine exists."],
    ],
    build(stage) {
      const tagX = (c, text) => c - D1.tagW(text) / 2;
      const pill = (c, y, text, tone, solid) => D1.tag(stage, { x: tagX(c, text), y, text, tone, solid, h: 58 });
      const NEED8 = `need ${S.need}x the power`;
      const NEED40 = `need ${S.big}x the power`;

      // headings
      const banner = D1.tag(stage, { x: tagX(468, NEED8), y: 12, text: NEED8, tone: "blue", solid: true, h: 58 });
      const upTag = pill(COL_L.c, 84, "scale up", "grey", true);
      const outTag = pill(COL_R.c, 84, "scale out", "grey", true);
      const upSub = D1.label(stage, { x: COL_L.x, y: 148, w: 430, text: "one bigger machine" });
      const outSub = D1.label(stage, { x: COL_R.x, y: 148, w: 430, text: "many ordinary machines" });

      // machines
      const big = D1.server(stage, { x: BIG.x, y: BIG.y, w: BIG.w, h: BIG.h, fs: 44 });
      const bigGhost = D1.label(stage, {
        x: BIG.x,
        y: BIG.y + BIG.h / 2 - 20,
        w: BIG.w,
        text: `${S.big}x`,
        fs: 44,
        bold: true,
      });
      const small = Array.from({ length: S.need }, (_, i) =>
        D1.server(stage, {
          x: SM.x + (i % SMALL.cols) * (SM.w + SM.gap),
          y: SM.y + Math.floor(i / SMALL.cols) * (SM.h + SM.gap),
          w: SM.w,
          h: SM.h,
        }),
      );
      const layer = L5.svg(stage);
      const icons = Array.from({ length: S.big }, (_, i) => {
        const p = iconAt(i);
        return layer.appendChild(D1.icon.server(p.x, p.y, ICON.size, "green"));
      });
      const deadMid = small[DEAD].mid();
      const boltBig = layer.appendChild(D1.icon.bolt(COL_L.c, BIG.y + BIG.h / 2, 110, "orange"));
      const boltSmall = layer.appendChild(D1.icon.bolt(deadMid.x, deadMid.y, 64, "orange"));

      // costs
      const costL = D1.stat(stage, { x: 30, y: STAT_Y, w: 410, h: 80, label: "cost", tone: "orange" });
      const costR = D1.stat(stage, { x: 496, y: STAT_Y, w: 410, h: 80, label: "cost", tone: "green" });
      const barL = D1.bar(stage, { x: 30, y: BAR_Y, w: 410, h: 24, tone: "orange" });
      const barR = D1.bar(stage, { x: 496, y: BAR_Y, w: 410, h: 24, tone: "green" });

      // results
      const left8 = `capacity left ${S.leftUp}%`;
      const right8 = `capacity left ${S.leftOut}%`;
      const resL = pill(COL_L.c, RES_Y, left8, "red", true);
      const resR = pill(COL_R.c, RES_Y, right8, "green", true);
      const endL = pill(COL_L.c, RES_Y, "none this big", "orange", true);
      const endR = pill(COL_R.c, RES_Y, "just add more", "green", true);

      return (t) => {
        // ----- headings -----
        const is40 = t >= T.big;
        const bt = is40 ? NEED40 : NEED8;
        banner.set({
          text: bt,
          x: tagX(468, bt) - tagX(468, NEED8),
          k: ramp(t, T.banner, T.banner + 0.45, E.lin),
          s: 1 + 0.1 * flash(t, T.big, T.big + 0.4),
        });
        const kc = ramp(t, T.cols, T.cols + 0.5, E.lin);
        upTag.set({ k: kc });
        outTag.set({ k: kc });
        upSub.set({ k: ramp(t, T.cols + 0.15, T.cols + 0.6) });
        outSub.set({ k: ramp(t, T.cols + 0.15, T.cols + 0.6) });

        // ----- the big machine -----
        const km = ramp(t, T.machines, T.machines + 0.5, E.lin);
        const shake = Math.sin((t - T.die) * 60) * 7 * (1 - ramp(t, T.die, T.die + 0.4, E.lin)) * +(t >= T.die);
        const bigState = t >= T.switch ? "ghost" : t >= T.die ? "down" : "ok";
        big.set({ state: bigState, text: `${S.need}x`, k: km, shake });
        bigGhost.set({
          k: ramp(t, T.switch + 0.2, T.switch + 0.6),
          tone: "grey",
        });
        boltBig.style.transformBox = "fill-box";
        const bk = ramp(t, T.bolt, T.bolt + 0.4, E.pop);
        const bo = (1 - ramp(t, T.die + 0.3, T.die + 0.6, E.lin)) * Math.min(1, bk * 3);
        V.place(boltBig, { s: 0.6 + 0.4 * bk, o: bo });
        V.place(boltSmall, { s: 0.6 + 0.4 * bk, o: bo });

        // ----- the eight ordinary machines, then the forty icons -----
        small.forEach((m, i) => {
          const out = D1.seq(t, T.switch, 0.04, 0.4, i);
          m.set({
            state: i === DEAD && t >= T.die ? "down" : "ok",
            k: D1.seq(t, T.machines, 0.06, 0.4, i),
            s: 1 - 0.4 * out,
            o: 1 - out,
            shake: i === DEAD ? shake : 0,
          });
        });
        icons.forEach((g, i) => {
          const k = D1.seq(t, T.icons, 0.035, 0.3, i);
          V.place(g, { s: 0.5 + 0.5 * E.pop(k), o: Math.min(1, k * 4) });
        });

        // ----- costs -----
        const kc2 = ramp(t, T.count[0], T.count[1], smooth);
        const grow = ramp(t, T.grow[0], T.grow[1], smooth);
        const ks = ramp(t, T.stats, T.stats + 0.5, E.lin);
        const ksR = ramp(t, T.stats + 0.15, T.stats + 0.65, E.lin);
        const upText = t >= T.none ? "none" : money(S.up8, kc2);
        costL.set({ text: upText, k: ks, bump: flash(t, T.bumpL, T.bumpL + 0.5) + flash(t, T.none, T.none + 0.4) });
        const outCost = t >= T.grow[0] ? lerp(S.out8, S.out40, grow) : S.out8 * kc2;
        costR.set({
          text: D1.money(Math.round(outCost)),
          k: ksR,
          bump: flash(t, T.bumpR, T.bumpR + 0.5) + flash(t, T.grow[1], T.grow[1] + 0.4),
        });
        const upBar = (S.up8 * kc2) / BAR_MAX;
        barL.set({ v: upBar * (1 - ramp(t, T.none, T.none + 0.5, E.lin)), k: ks });
        barR.set({ v: outCost / BAR_MAX, k: ksR });

        // ----- results -----
        const fade = 1 - ramp(t, T.clear[0], T.clear[1], E.lin);
        resL.set({ k: ramp(t, T.result, T.result + 0.4, E.lin), o: fade });
        resR.set({ k: ramp(t, T.result + 0.15, T.result + 0.55, E.lin), o: fade });
        endL.set({ k: ramp(t, T.none, T.none + 0.4, E.lin) });
        endR.set({ k: ramp(t, T.add, T.add + 0.4, E.lin) });
      };
    },
  });
})();
