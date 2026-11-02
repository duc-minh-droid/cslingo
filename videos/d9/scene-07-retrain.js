/* Lecture 9 (ds-9) · scene 7 (RETRAINING): the simple fix for drift is to retrain regularly on ALL the data, but the data keeps
   growing, so every retrain reads more and full batch training needs it all to fit in memory. Training on recent data only (a
   window, incremental learning) reads the same every time (lesson 9.2 steps 2-3). One purple tile per week of data in a row
   inside a grey memory frame that holds 64 GB (32 weeks); weeks arrive, the tags count what this retrain reads and what all
   retrains so far have read; week 33 does not fit (red); then a green 4-week window keeps the cost at 8 GB. Every number comes
   from D9.GROW (asserted on load). Colours: purple = weeks of data and GB, grey = memory and totals, red = does not fit, green =
   the recent-data window.
   Story (local seconds): 0.3 frame, chip, labels; 1.0-2.8 weeks 1..10 (one every 0.2 s), hold week 10; 4.6-6.0 weeks 11..33;
   6.0 week 33 turns red, "does not fit in memory"; 7.6-8.2 the window: old weeks fade, the last 4 weeks stay, the 32-week frame
   fades (the chip and its label stay), 8 GB, and a green "fits in memory" tag with a tick replaces the red warning. */
(function () {
  const V = window.VID;
  const D9 = V.d9;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const G = D9.GROW;
  const fm = D9.fm;
  const N = G.over; // 33 weeks on screen
  const FITS = G.mem / G.perWeek; // 32 weeks fit in memory
  let sum = 0;
  const TOTAL = [0, ...Array.from({ length: N }, (_, k) => (sum += G.read(k + 1)))]; // all retrains up to week k

  D9.same(
    "retrain scene: 2 GB a week, 64 GB of memory hold 32 weeks, week 10 reads 20 (110 in all), week 33 reads 66, 4 weeks read 8",
    [G.perWeek, FITS, G.read(10), TOTAL[10], N, G.read(N), G.win, G.winGB],
    [2, 32, 20, 110, 33, 66, 4, 8],
  );

  const T = { pop: 0.3, w1: 1.0, step1: 0.2, fast: 4.6, step2: 0.06, over: 6.0, win: 7.6, winEnd: 8.2 };
  const weekAt = (k) => (k <= 10 ? T.w1 + T.step1 * (k - 1) : T.fast + T.step2 * (k - 10));
  D9.same("retrain scene: week 33 arrives before it turns red", weekAt(N) < T.over, true);

  // geometry: tile i (0-based) at x 28 + 26 i; the memory frame holds the first 32; week 33 sits outside, pushed right
  const ROW = { x: 28, y: 220, w: 22, h: 64, gap: 4 };
  const OUT_DX = 16;
  const FRAME = { x: 18, y: 196, w: ROW.x + FITS * (ROW.w + ROW.gap) - ROW.gap + 10 - 18, h: 112 };
  const tileL = (i) => ROW.x + i * (ROW.w + ROW.gap) + (i === N - 1 ? OUT_DX : 0);

  V.scene({
    kicker: "RETRAINING",
    title: ["Retraining on everything", "gets heavy"],
    dur: 10,
    caps: [
      [1, 2.8, `Each week adds ${fm(G.perWeek)} GB of new data.`],
      [3, 4.6, `Retrain on all of it: week 10 reads ${fm(G.read(10))} GB.`],
      [4.8, 6.1, "The pile keeps growing every week."],
      [6.3, 7.8, `Week ${N} needs ${fm(G.overGB)} GB: more than the ${fm(G.mem)} GB of memory.`],
      [8.2, 9.8, `Recent data only: the last ${G.win} weeks, ${fm(G.winGB)} GB each time.`],
    ],
    build(stage) {
      const frame = D4.card(stage, { ...FRAME, tone: "grey", plain: true });
      const svg = D4.svg(stage);
      const chip = svg.appendChild(D9.memchip(60, 150, 64));
      const memL = D4.label(stage, { x: 100, y: 150, text: `memory: ${fm(G.mem)} GB`, anchor: "l", fs: 30 });
      const row = D4.chips(stage, { ...ROW, n: N, fs: 0, radius: 8, lip: 4, tone: "purple" });
      const top = D4.svg(stage);
      const x1 = tileL(N - G.win);
      const x2 = tileL(N - 1) - OUT_DX + ROW.w; // the window starts once week 33 has slid back into line
      const brace = top.appendChild(D9.brace(x1, x2, 200, "green", { up: true }));
      const cross = top.appendChild(L5.cross(tileL(N - 1) + ROW.w / 2, ROW.y - 30, 40, "red"));
      const week = D4.tag(stage, { x: 468, y: 50, text: "", tone: "grey", fs: 32 });
      const reads = D4.tag(stage, { x: 468, y: 400, text: "", tone: "purple", fs: 32 });
      const total = D4.tag(stage, { x: 468, y: 480, text: "", tone: "grey", fs: 28 });
      const noFit = D4.tag(stage, { x: 468, y: 560, text: "does not fit in memory", tone: "red", solid: true });
      const fits = D4.tag(stage, { x: 490, y: 480, text: "fits in memory", tone: "green", solid: true });
      const tick = top.appendChild(L5.tick(490 - D4.tagW("fits in memory") / 2 - 34, 480, 40, "green"));
      const winTag = D4.tag(stage, {
        x: 760,
        y: 130,
        text: `last ${G.win} weeks: ${fm(G.winGB)} GB`,
        tone: "green",
        solid: true,
      });

      return (t) => {
        const pk = ramp(t, T.pop, T.pop + 0.5, E.lin);
        const wk = ramp(t, T.win, T.winEnd, E.lin); // the window takes over: the last 4 weeks fit in memory
        frame.set({ k: pk, o: 1 - wk }); // the frame is laid out for 32 whole weeks; the window does not need it
        V.place(chip, { s: 0.7 + 0.3 * E.pop(pk), o: Math.min(1, pk * 3) });
        memL.set({ k: pk });
        let k = 0; // weeks arrived so far
        while (k < N && t >= weekAt(k + 1)) k++;
        const over = t >= T.over;
        const win = wk >= 0.5;
        row.all((i) => {
          const a = ramp(t, weekAt(i + 1), weekAt(i + 1) + 0.25, E.lin);
          const dx = i === N - 1 ? OUT_DX * (1 - E.inOut(wk)) : 0;
          if (a <= 0) return { ghost: true, x: dx, o: pk };
          const red = i === N - 1 && over && wk < 0.5;
          const old = i < N - G.win;
          return {
            solid: true,
            tone: red ? "red" : "purple",
            x: dx,
            s: (0.6 + 0.4 * E.pop(a)) * (1 + (i === N - 1 ? 0.15 * flash(t, T.over, T.over + 0.4) : 0)),
            o: old ? 1 - 0.7 * wk : 1,
          };
        });
        const gone = 1 - ramp(t, T.win, T.win + 0.3, E.lin); // the red warning and the running total leave first
        const ck = ramp(t, T.over, T.over + 0.35, E.lin);
        V.place(cross, { s: 0.6 + 0.4 * E.pop(ck), o: Math.min(1, ck * 3) * gone });
        V.place(brace, { o: ramp(wk, 0.5, 1, E.lin) });

        const shown = Math.max(1, k);
        week.set({ text: `week ${shown}`, k: pk });
        const gb = win ? G.winGB : G.read(shown);
        const isRed = over && !win;
        const bump = flash(t, 3.0, 3.35) + flash(t, T.winEnd - 0.3, T.winEnd + 0.05);
        reads.set({
          text: `this retrain reads ${fm(gb)} GB`,
          tone: isRed ? "red" : "purple",
          solid: isRed,
          k: ramp(t, T.w1, T.w1 + 0.3, E.lin),
          s: 1 + 0.1 * bump,
        });
        total.set({
          text: `all retrains so far: ${fm(TOTAL[shown])} GB`,
          k: ramp(t, T.w1, T.w1 + 0.3, E.lin),
          o: gone,
        });
        noFit.set({ k: ramp(t, T.over + 0.2, T.over + 0.5, E.lin), o: gone });
        winTag.set({ k: ramp(t, T.winEnd - 0.2, T.winEnd + 0.2, E.lin) });
        const fk = ramp(t, T.winEnd, T.winEnd + 0.4, E.lin);
        fits.set({ k: fk });
        V.place(tick, { s: 0.6 + 0.4 * E.pop(fk), o: Math.min(1, fk * 3) });
      };
    },
  });
})();
