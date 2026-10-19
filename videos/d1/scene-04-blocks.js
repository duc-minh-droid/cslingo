/* Lecture 1 (ds-1), scene 04: the four building blocks, one panel each, played one after another (lesson 1.2).
   2 x 2 grid of sticker panels. Story (local seconds):
   0.3-1.3 panels and headers pop.  DATABASE 1.0-3.8: a blue packet flies into the database, the tag "tomorrow" pops, the packet
   comes out the other side with a green tick (the data is still there).  CACHE 4.0-6.75: request 1 goes app -> cache (red
   cross: a miss) -> database (red "100 ms"), a purple copy flies back and stays in the cache; request 2 stops at the cache
   (green tick, green "2 ms").  INDEX 7.65-9.6: the "no index" bar sweeps to 1,000,000 checks, "with an index" is a sliver of
   20 checks.  BATCH JOB 10.2-12.6: the day's packets pile up under the sun, slide to the moon and gear at 02:00 and are
   crunched, a green report is ready at 08:00.  Every figure comes from D1.CACHE / D1.INDEX / D1.BATCH (asserted in common.js). */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;

  const { CACHE, INDEX, BATCH } = D1;
  const MS = (n) => `${n} ms`;
  const CHECKS = (n) => `${D1.fmt(n)} checks`;
  // the "with an index" bar is a true sliver (20 of a million); the bar helper needs v > 0.0005 to show one
  const SLIVER = Math.max(INDEX.checks / INDEX.scan, 0.001);
  D1.same(
    "blocks text",
    [MS(CACHE.dbMs), MS(CACHE.cacheMs), CHECKS(INDEX.checks), BATCH.night, BATCH.ready],
    ["100 ms", "2 ms", "20 checks", "02:00", "08:00"],
  );

  // ---------- layout (stage px) ----------
  const PANELS = [
    { x: 14, y: 10, name: "database" },
    { x: 472, y: 10, name: "cache" },
    { x: 14, y: 330, name: "index" },
    { x: 472, y: 330, name: "batch job" },
  ];
  const DB = { x: 215, y: 185, size: 110 }; // the big database of panel 1
  const LANE = 160; // y of the cache row
  const APP = { x: 486, w: 84, h: 72 };
  const CC = { x: 632, y: LANE - 55, w: 120, h: 110 }; // the cache card
  const CDB = { x: 868, size: 70 }; // the small database of panel 2
  const VERDICT = { x: CC.x + CC.w / 2, y: 62 }; // tick or cross above the cache
  const STOPS = [552, 697, 842]; // batch job stops (x)
  const ROW = 450; // y of the batch icons
  // the pile: 6 packets, bottom row first, as (x offset, y)
  const PILE = [
    [-24, 554],
    [0, 554],
    [24, 554],
    [-12, 531],
    [12, 531],
    [0, 508],
  ];

  // ---------- timeline ----------
  const T = {
    pop: 0.3,
    // database
    dbIcon: 0.9,
    packet: 1.0,
    fly: [1.55, 2.25],
    tomorrow: 2.6,
    out: [3.0, 3.5],
    tick1: [3.5, 3.8],
    // cache
    cacheIn: 4.0,
    req1: 4.4,
    legA: [4.45, 4.85],
    miss: [4.85, 5.1],
    legB: [5.05, 5.55],
    slow: 5.55,
    copy: [5.7, 6.1],
    crossOut: [6.1, 6.2],
    req2: [6.15, 6.5],
    hit: [6.5, 6.75],
    fast: 6.6,
    // index
    idxIn: 7.65,
    sweep: [8.05, 9.15],
    sliver: 9.3,
    // batch job
    batIn: 10.2,
    pile: 10.25,
    arrow1: [10.85, 11.05],
    night: 10.9,
    slide: [10.95, 11.3],
    spin: [11.15, 12.0],
    eat: 11.4,
    arrow2: [11.9, 12.1],
    day: 12.1,
    tick2: [12.35, 12.6],
  };
  const popK = (t, a, d = 0.3) => ramp(t, a, a + d, E.lin);
  // pop a piece of the picture in: scale with a spring, fade fast
  const appear = (k) => ({ s: 0.7 + 0.3 * E.pop(k), o: Math.min(1, k * 4) });

  V.scene({
    kicker: "BUILDING BLOCKS",
    title: ["Four building blocks", "behind every data app"],
    dur: 13,
    caps: [
      [1.5, 3.9, "A database keeps data safe for tomorrow."],
      [4.4, 7.2, "A cache keeps answers close: 2 ms, not 100."],
      [7.8, 10.2, "An index: 20 checks, not a million."],
      [10.5, 12.8, "A batch job crunches it overnight."],
    ],
    build(stage) {
      // ---- panels and headers ----
      const panels = PANELS.map((p) => D1.card(stage, { x: p.x, y: p.y, w: 450, h: 290, tone: "grey", plain: true }));
      const heads = PANELS.map((p) => D1.tag(stage, { x: p.x + 14, y: p.y + 12, text: p.name, tone: "grey" }));

      // ---- back layer: icons and guide arrows ----
      const back = L5.svg(stage);
      const add = (g) => back.appendChild(g);
      const dbIcon = add(D1.icon.db(DB.x, DB.y, DB.size, "grey"));
      const cdbIcon = add(D1.icon.db(CDB.x, LANE, CDB.size, "grey"));
      const guideA = add(L5.arrow(APP.x + APP.w + 10, LANE, CC.x - 8, LANE, "grey", 1, { w: 6, head: 18 }));
      const guideB = add(L5.arrow(CC.x + CC.w + 8, LANE, CDB.x - 40, LANE, "grey", 1, { w: 6, head: 18 }));
      const sun = add(D1.icon.sun(STOPS[0], ROW, 76, "orange"));
      const moon = add(D1.icon.moon(STOPS[1] - 24, ROW - 8, 62, "grey"));
      const gear = add(D1.icon.gear(STOPS[1] + 26, ROW + 12, 52, "purple"));
      const doc = add(D1.icon.doc(STOPS[2], ROW, 76, "green"));
      const arrow1 = add(L5.arrow(STOPS[0] + 46, ROW, STOPS[1] - 66, ROW, "grey", 1, { w: 6, head: 18 }));
      const arrow2 = add(L5.arrow(STOPS[1] + 62, ROW, STOPS[2] - 50, ROW, "grey", 1, { w: 6, head: 18 }));

      // ---- middle layer: packets, chips, tags, bars ----
      const pk = D1.token(stage, { tone: "blue", size: 34, square: true });
      const pkOut = D1.token(stage, { tone: "blue", size: 34, square: true });
      const tomorrow = D1.tag(stage, { x: 262, y: 86, text: "tomorrow" });
      const req1 = D1.token(stage, { tone: "blue", size: 30 });
      const req2 = D1.token(stage, { tone: "blue", size: 30 });
      const cc = D1.card(stage, { x: CC.x, y: CC.y, w: CC.w, h: CC.h, text: "cache", tone: "purple", plain: false });
      Object.assign(cc.el.style, { alignItems: "flex-start", paddingTop: "12px" });
      const app = D1.chip(stage, {
        x: APP.x,
        y: LANE - APP.h / 2,
        w: APP.w,
        h: APP.h,
        text: "app",
        tone: "grey",
        fs: 32,
      });
      const copy = D1.token(stage, { tone: "purple", size: 32, square: true });
      const slow = D1.tag(stage, { x: CDB.x - 59 - 18, y: 232, text: MS(CACHE.dbMs), tone: "red", solid: true });
      const fast = D1.tag(stage, { x: VERDICT.x - 46, y: 232, text: MS(CACHE.cacheMs), tone: "green", solid: true });

      const idxNote = D1.label(stage, { x: 190, y: 354, w: 260, text: "1,000,000 records", fs: 28 });
      const lab1 = D1.label(stage, { x: 34, y: 404, w: 400, text: "no index", align: "left" });
      const bar1 = D1.bar(stage, { x: 34, y: 442, w: 400, h: 48, tone: "red" });
      const lab2 = D1.label(stage, { x: 34, y: 502, w: 400, text: "with an index", align: "left", tone: "purple" });
      const bar2 = D1.bar(stage, { x: 34, y: 540, w: 400, h: 48, tone: "green" });

      const lblAll = D1.label(stage, { x: STOPS[0] - 70, y: 572, w: 140, text: "all day" });
      const lblNight = D1.label(stage, { x: STOPS[1] - 70, y: 572, w: 140, text: BATCH.night });
      const lblDay = D1.label(stage, {
        x: STOPS[2] - 70,
        y: 572,
        w: 140,
        text: BATCH.ready,
        tone: "green",
        bold: true,
      });
      const pile = PILE.map(() => D1.token(stage, { tone: "blue", size: 20, square: true }));

      // ---- front layer: tick and cross ----
      const front = L5.svg(stage);
      const tick1 = front.appendChild(L5.tick(415, DB.y, 50, "green", { w: 10 }));
      const miss = front.appendChild(L5.cross(VERDICT.x, VERDICT.y, 56, "red", { w: 11 }));
      const hit = front.appendChild(L5.tick(VERDICT.x, VERDICT.y, 56, "green", { w: 11 }));
      const tick2 = front.appendChild(L5.tick(STOPS[2], 524, 46, "green", { w: 9 }));

      // the three guide arrows of the cache row and the batch row draw on with their panel
      return (t) => {
        // ---- panels ----
        PANELS.forEach((_, i) => {
          panels[i].set({ k: D1.seq(t, T.pop, 0.15, 0.4, i) });
          heads[i].set({ k: D1.seq(t, T.pop + 0.15, 0.15, 0.35, i) });
        });

        // ---- 1. database ----
        const kDb = popK(t, T.dbIcon);
        const flyK = ramp(t, T.fly[0], T.fly[1], E.inOut);
        const gulp = 1 + 0.1 * flash(t, T.fly[1] - 0.1, T.fly[1] + 0.25);
        V.place(dbIcon, { ...appear(kDb), s: appear(kDb).s * gulp });
        const inK = ramp(flyK, 0.7, 1, E.lin); // the packet shrinks into the database at the end of its flight
        const pkK = popK(t, T.packet, 0.25);
        pk.set({
          x: 60 + (DB.x - 60) * flyK,
          y: DB.y,
          s: appear(pkK).s * (1 - 0.85 * inK),
          o: appear(pkK).o * (1 - inK),
        });
        tomorrow.set({ k: popK(t, T.tomorrow, 0.3) });
        const outK = ramp(t, T.out[0], T.out[1], E.out);
        pkOut.set({
          x: DB.x + (350 - DB.x) * outK,
          y: DB.y,
          s: 0.3 + 0.7 * E.pop(outK),
          o: ramp(t, T.out[0], T.out[0] + 0.1, E.lin),
        });
        L5.drawOn(tick1, ramp(t, T.tick1[0], T.tick1[1], E.out));

        // ---- 2. cache ----
        const kIn = popK(t, T.cacheIn, 0.3);
        cc.set({
          k: kIn,
          x: 4 * Math.sin(Math.PI * 4 * clamp((t - T.miss[0]) / (T.miss[1] - T.miss[0]))) * (t < T.miss[1] ? 1 : 0),
        });
        app.set({ k: popK(t, T.cacheIn - 0.1, 0.3) });
        V.place(cdbIcon, {
          ...appear(popK(t, T.cacheIn + 0.1, 0.3)),
          s: appear(popK(t, T.cacheIn + 0.1, 0.3)).s * (1 + 0.1 * flash(t, T.legB[1] - 0.1, T.legB[1] + 0.25)),
        });
        L5.drawOn(guideA, ramp(t, T.cacheIn + 0.2, T.cacheIn + 0.4, E.lin));
        L5.drawOn(guideB, ramp(t, T.cacheIn + 0.2, T.cacheIn + 0.4, E.lin));
        // request 1: app -> cache edge, a pause for the miss, then behind the cache into the database
        const a = ramp(t, T.legA[0], T.legA[1], E.inOut);
        const b = ramp(t, T.legB[0], T.legB[1], E.inOut);
        const r1 = popK(t, T.req1, 0.2);
        const x1 = b > 0 ? 620 + (CDB.x - 620) * b : 586 + (620 - 586) * a;
        const sink = ramp(b, 0.8, 1, E.lin);
        req1.set({ x: x1, y: LANE, s: appear(r1).s * (1 - 0.85 * sink), o: appear(r1).o * (1 - sink) });
        L5.drawOn(miss, ramp(t, T.miss[0], T.miss[1], E.out));
        V.place(miss, { o: 1 - ramp(t, T.crossOut[0], T.crossOut[1], E.lin) });
        slow.set({ k: popK(t, T.slow, 0.3) });
        // the purple copy flies back from the database and stays inside the cache
        const cp = ramp(t, T.copy[0], T.copy[1], E.inOut);
        const cpOn = ramp(t, T.copy[0], T.copy[0] + 0.1, E.lin);
        copy.set({
          x: CDB.x + (VERDICT.x - CDB.x) * cp,
          y: LANE + (LANE + 28 - LANE) * cp,
          s: (0.4 + 0.6 * cpOn) * (1 + 0.15 * flash(t, T.hit[0], T.hit[0] + 0.25)),
          o: cpOn,
        });
        // request 2: stops at the cache, a hit
        const c2 = ramp(t, T.req2[0], T.req2[1], E.inOut);
        const r2 = popK(t, T.req2[0], 0.15);
        const gone = ramp(t, T.hit[0], T.hit[0] + 0.12, E.lin);
        req2.set({
          x: 586 + (620 - 586) * c2,
          y: LANE,
          s: appear(r2).s * (1 - 0.6 * gone),
          o: appear(r2).o * (1 - gone),
        });
        L5.drawOn(hit, ramp(t, T.hit[0], T.hit[1], E.out));
        fast.set({ k: popK(t, T.fast, 0.3) });

        // ---- 3. index ----
        idxNote.set({ k: popK(t, T.idxIn, 0.3) });
        lab1.set({ k: popK(t, T.idxIn + 0.05, 0.3) });
        lab2.set({ k: popK(t, T.idxIn + 0.15, 0.3) });
        const sw = ramp(t, T.sweep[0], T.sweep[1], E.inOut);
        bar1.set({ v: sw, k: popK(t, T.idxIn + 0.05, 0.3), text: CHECKS(Math.round(sw * INDEX.scan)) });
        const k2 = popK(t, T.sliver, 0.25);
        bar2.set({
          v: t >= T.sliver ? SLIVER : 0,
          k: popK(t, T.idxIn + 0.15, 0.3),
          text: k2 > 0 ? CHECKS(INDEX.checks) : "",
        });

        // ---- 4. batch job ----
        const kSun = popK(t, T.batIn, 0.3);
        V.place(sun, appear(kSun));
        lblAll.set({ k: kSun });
        const kNight = popK(t, T.night, 0.3);
        V.place(moon, appear(kNight));
        V.place(gear, { ...appear(kNight), r: 100 * (clamp(t, T.spin[0], T.spin[1]) - T.spin[0]) });
        lblNight.set({ k: kNight });
        L5.drawOn(arrow1, ramp(t, T.arrow1[0], T.arrow1[1], E.lin));
        L5.drawOn(arrow2, ramp(t, T.arrow2[0], T.arrow2[1], E.lin));
        const slide = ramp(t, T.slide[0], T.slide[1], E.inOut);
        PILE.forEach(([dx, y], i) => {
          const k = ramp(t, T.pile + 0.08 * i, T.pile + 0.08 * i + 0.2, E.out);
          const e = ramp(t, T.eat + 0.07 * i, T.eat + 0.07 * i + 0.22, E.in);
          pile[i].set({
            x: STOPS[0] + dx + (STOPS[1] - STOPS[0]) * slide,
            y: y - 30 * (1 - k) - 50 * e,
            s: (0.7 + 0.3 * E.pop(k)) * (1 - e),
            o: Math.min(1, k * 4) * (1 - e),
          });
        });
        const kDay = popK(t, T.day, 0.3);
        V.place(doc, appear(kDay));
        lblDay.set({ k: kDay });
        L5.drawOn(tick2, ramp(t, T.tick2[0], T.tick2[1], E.out));
      };
    },
  });
})();
