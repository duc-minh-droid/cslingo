/* Lecture 1 (ds-1), scene 09: scale up (one bigger machine) or scale out (many ordinary machines). We need 8 times the
   power of one machine: up costs 34,297 against 8,800, and when one machine dies the big one leaves 0% and the grid 88%.
   Then the need grows to 40 times: no single machine that big exists (the biggest is 32x), but the grid just grows: the
   eight machines shrink into the first row of a 40-machine grid and the cost follows the machine count (44,000). All
   numbers come from D1.SCALE and D1.costOut (asserted in common.js and below). update(t) is pure. */
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
  D1.same("the first row of the big grid holds the eight machines", COLS, S.need);
  D1.same("the grid adds the other rows", S.big - S.need, COLS * (ROWS - 1));
  D1.same("scale up cannot reach 40x", [S.big > S.max, S.up40], [true, Infinity]);
  D1.same("scale up costs more than scale out at 8x", S.up8 > S.out8, true);
  D1.same(
    "scale out cost at 8 and 40 machines",
    [Math.round(D1.costOut(S.need)), Math.round(D1.costOut(S.big))],
    [8800, 44000],
  );
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
  const STAGE_C = 468; // the middle of the 936 px stage
  const BIG = { x: 140, y: 196, w: 190, h: 220 };
  const SM = { w: 92, h: 104, gap: 12, y: 196 };
  SM.x = COL_R.c - (SMALL.cols * SM.w + (SMALL.cols - 1) * SM.gap) / 2;
  const DEAD = 2; // the small machine that dies
  const ICON = { size: 40, dx: 52, dy: 46, y: 214 };
  const iconAt = (i) => ({
    x: COL_R.c - ((COLS - 1) * ICON.dx) / 2 + (i % COLS) * ICON.dx,
    y: ICON.y + Math.floor(i / COLS) * ICON.dy,
  });
  const smallMid = (i) => ({
    x: SM.x + (i % SMALL.cols) * (SM.w + SM.gap) + SM.w / 2,
    y: SM.y + Math.floor(i / SMALL.cols) * (SM.h + SM.gap) + SM.h / 2,
  });
  const STAT = { w: 396, h: 80, y: 440, xL: COL_L.c - 198, xR: COL_R.c - 198 };
  const BAR_Y = 528;
  const RES_Y = 562;

  // ---------- timeline (local seconds) ----------
  const T = {
    banner: 0.15,
    cols: 0.35,
    machines: 0.45,
    stats: 1.4,
    count: [1.6, 2.9],
    bumpL: 3.0,
    bumpR: 3.25,
    bolt: 5.45,
    die: 5.75,
    result: 5.9,
    clear: [7.9, 8.15],
    switch: 8.15,
    revive: 8.2,
    morph: 8.25,
    none: 8.45,
    stop: 8.5,
    icons: 8.95,
    add: 10.0,
    end: [10.0, 10.5],
  };

  const smooth = (x) => x * x * (3 - 2 * x);

  V.scene({
    kicker: "SCALABILITY",
    title: ["Scale up or", "scale out?"],
    dur: 11,
    caps: [
      [0.8, 3.05, "Need 8 times the power of one machine."],
      [3.15, 5.45, "Scale up costs more: £34,297 vs £8,800."],
      [6.1, 8.0, "One dies: 0% left, or 88% left."],
      [8.55, 10.8, "At 40 times, no single machine exists."],
    ],
    build(stage) {
      // a tag centred on a column whatever its text: a flex row of the column's width holds it
      const pill = (c, y, text, tone, solid, w = 430) => {
        const row = V.h("div", {
          style: {
            position: "absolute",
            left: `${c - w / 2}px`,
            top: `${y}px`,
            width: `${w}px`,
            display: "flex",
            justifyContent: "center",
          },
        });
        stage.append(row);
        const tag = D1.tag(row, { text, tone, solid, h: 58 });
        Object.assign(tag.el.style, { position: "relative", left: "0px", top: "0px" });
        return tag;
      };
      const NEED8 = `need ${S.need}x the power`;
      const NEED40 = `need ${S.big}x the power`;

      // headings
      const banner = pill(STAGE_C, 16, NEED8, "blue", true, 700);
      const upTag = pill(COL_L.c, 84, "scale up", "grey", true);
      const outTag = pill(COL_R.c, 84, "scale out", "grey", true);
      const upSub = D1.label(stage, { x: COL_L.x, y: 148, w: 430, text: "one bigger machine" });
      const outSub = D1.label(stage, { x: COL_R.x, y: 148, w: 430, text: "many ordinary machines" });

      // machines
      const big = D1.server(stage, { x: BIG.x, y: BIG.y, w: BIG.w, h: BIG.h, fs: 44 });
      const ghost = D1.server(stage, { x: BIG.x, y: BIG.y, w: BIG.w, h: BIG.h, fs: 44 });
      const ghostText = D1.label(stage, {
        x: BIG.x,
        y: BIG.y + BIG.h / 2 - 28,
        w: BIG.w,
        text: `${S.big}x`,
        fs: 52,
        bold: true,
      });
      const small = Array.from({ length: S.need }, (_, i) =>
        D1.server(stage, {
          x: SM.x + (i % SMALL.cols) * (SM.w + SM.gap),
          y: SM.y + Math.floor(i / SMALL.cols) * (SM.h + SM.gap),
          w: SM.w,
          h: SM.h,
          fs: 21, // the big line is 1.35 x this: 28 px, clear of the load meter
        }),
      );
      const layer = L5.svg(stage);
      const icons = Array.from({ length: S.big }, (_, i) => {
        const p = iconAt(i);
        return layer.appendChild(D1.icon.server(p.x, p.y, ICON.size, "green"));
      });
      const deadMid = smallMid(DEAD);
      const boltBig = layer.appendChild(D1.icon.bolt(COL_L.c, BIG.y + BIG.h / 2, 110, "orange"));
      const boltSmall = layer.appendChild(D1.icon.bolt(deadMid.x, deadMid.y, 64, "orange"));

      // costs
      const costL = D1.stat(stage, { x: STAT.xL, y: STAT.y, w: STAT.w, h: STAT.h, label: "cost", tone: "orange" });
      const costR = D1.stat(stage, { x: STAT.xR, y: STAT.y, w: STAT.w, h: STAT.h, label: "cost", tone: "green" });
      const barL = D1.bar(stage, { x: STAT.xL, y: BAR_Y, w: STAT.w, h: 24, tone: "orange" });
      const barR = D1.bar(stage, { x: STAT.xR, y: BAR_Y, w: STAT.w, h: 24, tone: "green" });

      // results
      const left8 = `capacity left ${S.leftUp}%`;
      const right8 = `capacity left ${S.leftOut}%`;
      const resL = pill(COL_L.c, RES_Y, left8, "red", true);
      const resR = pill(COL_R.c, RES_Y, right8, "green", true);
      const NONE = `none above ${S.max}x`;
      const endL = pill(COL_L.c, RES_Y, NONE, "orange", true);
      const endR = pill(COL_R.c, RES_Y, "just add more", "green", true);

      return (t) => {
        // ----- headings -----
        const is40 = t >= T.switch;
        const bt = is40 ? NEED40 : NEED8;
        banner.set({
          text: bt,
          k: ramp(t, T.banner, T.banner + 0.45, E.lin),
          s: 1 + 0.1 * flash(t, T.switch, T.switch + 0.4),
        });
        const kc = ramp(t, T.cols, T.cols + 0.5, E.lin);
        upTag.set({ k: kc });
        outTag.set({ k: kc });
        upSub.set({ k: ramp(t, T.cols + 0.15, T.cols + 0.6) });
        outSub.set({ k: ramp(t, T.cols + 0.15, T.cols + 0.6) });

        // ----- the big machine: dies, then turns into the empty 40x outline -----
        const km = ramp(t, T.machines, T.machines + 0.5, E.lin);
        const shake = Math.sin((t - T.die) * 60) * 7 * (1 - ramp(t, T.die, T.die + 0.4, E.lin)) * +(t >= T.die);
        const gone = ramp(t, T.switch, T.switch + 0.3, E.lin);
        big.set({
          state: t >= T.die ? "down" : "ok",
          text: `${S.need}x`,
          k: km,
          shake,
          s: 1 - 0.08 * gone,
          o: 1 - gone,
        });
        const kg = ramp(t, T.switch + 0.2, T.switch + 0.6, E.lin);
        ghost.set({ state: "ghost", k: kg });
        ghostText.set({ k: ramp(t, T.switch + 0.3, T.switch + 0.65), tone: "grey" });
        const bk = ramp(t, T.bolt, T.bolt + 0.4, E.pop);
        const bo = (1 - ramp(t, T.die + 0.3, T.die + 0.6, E.lin)) * Math.min(1, bk * 3);
        V.place(boltBig, { s: 0.6 + 0.4 * bk, o: bo });
        V.place(boltSmall, { s: 0.6 + 0.4 * bk, o: bo });

        // ----- the eight machines shrink into the first row of the grid; 32 more icons pop in -----
        const morph = small.map((_, i) => D1.seq(t, T.morph, 0.05, 0.5, i));
        small.forEach((m, i) => {
          const f = E.inOut(morph[i]);
          const from = smallMid(i);
          const to = iconAt(i);
          m.set({
            state: i === DEAD && t >= T.die && t < T.revive ? "down" : "ok",
            text: morph[i] > 0 ? "" : "1x",
            k: D1.seq(t, T.machines + 0.05, 0.05, 0.4, i),
            x: (to.x - from.x) * f,
            y: (to.y - from.y) * f,
            s: lerp(1, ICON.size / SM.h, f),
            o: 1 - ramp(morph[i], 0.75, 1, E.lin),
            shake: i === DEAD ? shake : 0,
          });
        });
        const fresh = icons.map((_, i) => (i < S.need ? 1 : D1.seq(t, T.icons, 0.03, 0.3, i - S.need)));
        icons.forEach((g, i) => {
          if (i < S.need) V.place(g, { o: ramp(morph[i], 0.75, 1, E.lin) });
          else V.place(g, { s: 0.5 + 0.5 * E.pop(fresh[i]), o: Math.min(1, fresh[i] * 4) });
        });
        const machines = S.need + fresh.slice(S.need).reduce((a, b) => a + b, 0); // how many machines are drawn

        // ----- costs -----
        const kc2 = ramp(t, T.count[0], T.count[1], smooth);
        const ks = ramp(t, T.stats, T.stats + 0.5, E.lin);
        const ksR = ramp(t, T.stats + 0.15, T.stats + 0.65, E.lin);
        const upText = t >= T.none ? "none" : money(S.up8, kc2);
        costL.set({ text: upText, k: ks, bump: flash(t, T.bumpL, T.bumpL + 0.5) + flash(t, T.none, T.none + 0.4) });
        const outCost = t >= T.icons ? D1.costOut(machines) : S.out8 * kc2;
        costR.set({
          text: D1.money(Math.round(outCost)),
          k: ksR,
          bump: flash(t, T.bumpR, T.bumpR + 0.5) + flash(t, T.end[0], T.end[1]),
        });
        const upBar = (S.up8 * kc2) / BAR_MAX;
        barL.set({ v: upBar * (1 - ramp(t, T.none, T.none + 0.5, E.lin)), k: ks });
        barR.set({ v: outCost / BAR_MAX, k: ksR });

        // ----- results -----
        const fade = 1 - ramp(t, T.clear[0], T.clear[1], E.lin);
        resL.set({ k: ramp(t, T.result, T.result + 0.4, E.lin), o: fade });
        resR.set({ k: ramp(t, T.result + 0.15, T.result + 0.55, E.lin), o: fade });
        endL.set({ k: ramp(t, T.stop, T.stop + 0.4, E.lin) });
        endR.set({ k: ramp(t, T.add, T.add + 0.4, E.lin) });
      };
    },
  });
})();
