/* Lecture 1 (ds-1), scene 04: the four building blocks, one panel each, played one after another (lesson 1.2).
   2 x 2 grid of sticker panels (database, cache, index, batch job). Story (local seconds):
   0.3-1.3 panels and headers pop.
   DATABASE 0.9-3.5: a blue packet lights the "today" tag as it flies into the database and stays inside (a small blue square),
     the tag "tomorrow" lights and a copy of the packet comes out the other side with a green tick: the data is still there.
   CACHE 3.2-7.0 (the longest beat, each step held for about a second): request 1 goes app -> cache (red cross, "miss": not
     here) -> database (red "100 ms"); a purple copy flies back and stays in the cache; request 2 stops at the cache (green
     tick, "hit", green "2 ms"); a small label says what "ms" is. The captions start when the numbers they quote are on screen.
   INDEX 7.95-9.8: a race: "no index" sweeps up to 1,000,000 checks while "with an index" is done after about 20.
   BATCH JOB 11.1-13.7: the day's packets pile up under the sun, slide to the moon and gear (02:00) and are crunched, a green
     report is ready at 08:00.
   Every figure comes from D1.CACHE / D1.INDEX / D1.BATCH (asserted in common.js). */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;

  const { CACHE, INDEX, BATCH } = D1;
  const MS = (n) => `${n} ms`;
  const CHECKS = (n) => `${D1.fmt(n)} checks`;
  D1.same(
    "blocks text",
    [MS(CACHE.dbMs), MS(CACHE.cacheMs), CHECKS(INDEX.checks), BATCH.night, BATCH.ready],
    ["100 ms", "2 ms", "20 checks", "02:00", "08:00"],
  );

  // ---------- layout (stage px; four panels of 450 x 290) ----------
  const PANELS = [
    { x: 14, y: 10, name: "database" },
    { x: 472, y: 10, name: "cache" },
    { x: 14, y: 330, name: "index" },
    { x: 472, y: 330, name: "batch job" },
  ];
  // 1. database: today's packet in on the left, tomorrow's copy out on the right
  const DB = { x: 226, y: 216, size: 132 };
  const IN_X = 90;
  const OUT_X = 360;
  // 2. cache: app -> cache -> database along one lane
  const LANE = 138;
  const APP = { x: 486, w: 88, h: 76 };
  const CC = { x: 640, y: LANE - 50, w: 150, h: 100 }; // the cache card
  const CCX = CC.x + CC.w / 2;
  const CDB = { x: 872, size: 64 }; // the small database
  const REQ = [598, 630]; // a request walks from the app's edge to the cache's edge
  const VERDICT = { sym: [CCX - 40, 52], tag: [CCX - 6, 23] }; // tick or cross, and its word, above the cache
  // 3. index: two bars
  const BAR = { x: 34, w: 400, h: 44 };
  // 4. batch job: sun -> (moon + gear) -> report, with a pile of packets under the sun
  const ROW = 452;
  const SUN = { x: 536, size: 72 };
  const MOON = { x: 672, y: 446, size: 64 };
  const GEAR = { x: 736, y: 466, size: 56 };
  const DOC = { x: 860, size: 80 };
  const PILE = [
    [-24, 552],
    [0, 552],
    [24, 552],
    [-12, 529],
    [12, 529],
    [0, 506],
  ]; // 6 packets: x offset from the sun, y; bottom row first

  // ---------- timeline ----------
  const T = {
    pop: 0.3,
    // database
    dbIcon: 0.9,
    packet: 1.0,
    fly: [1.4, 2.0],
    stored: 2.0,
    tomorrow: 2.3,
    out: [2.6, 3.05],
    tick1: [3.05, 3.35],
    // cache
    cacheIn: 3.2,
    req1: 3.6,
    legA: [3.65, 4.0],
    miss: [4.0, 4.25],
    missTag: 4.1,
    legB: [5.0, 5.45],
    slow: 5.45,
    copy: [5.7, 6.05],
    crossOut: [6.05, 6.15],
    req2: [6.35, 6.65],
    hit: [6.65, 6.9],
    hitTag: 6.7,
    fast: 6.75,
    // index
    idxIn: 7.95,
    race: 8.35,
    sweep: [8.35, 9.5],
    count: [8.5, 8.9],
    // batch job
    batIn: 11.1,
    pile: 11.15,
    arrow1: [11.8, 12.0],
    night: 11.85,
    slide: [11.95, 12.35],
    spin: [12.1, 13.0],
    eat: 12.25,
    arrow2: [12.8, 13.0],
    day: 13.0,
    tick2: [13.25, 13.5],
  };
  const popK = (t, a, d = 0.3) => ramp(t, a, a + d, E.lin);
  // pop a piece of the picture in: scale with a spring, fade fast
  const appear = (k) => ({ s: 0.7 + 0.3 * E.pop(k), o: Math.min(1, k * 4) });

  // a grey icon is pale on a white panel: give its outline the darker grey token so it reads
  const firm = (g) => {
    g.querySelectorAll("*").forEach((e) => {
      if (e.style.stroke) e.style.stroke = "var(--node-off-ic)";
    });
    return g;
  };

  V.scene({
    kicker: "BUILDING BLOCKS",
    title: ["Four building blocks", "behind most data apps"],
    dur: 14.2,
    caps: [
      [1.8, 3.9, "A database stores data for tomorrow."],
      [3.9, 5.6, "A cache keeps answers close."],
      [6.75, 8.65, `A hit takes ${MS(CACHE.cacheMs)}, a miss ${MS(CACHE.dbMs)}.`],
      [9.0, 11.05, `An index: ${CHECKS(INDEX.checks)}, not a million.`],
      [12.0, 14.0, "A batch job crunches it overnight."],
    ],
    build(stage) {
      // a tag centred on cx with a fixed width, so the text can be centred under or over a picture
      const tagC = (cx, y, text, w, o = {}) => {
        const t = D1.tag(stage, { x: cx - w / 2, y, text, ...o });
        t.el.style.width = `${w}px`;
        return t;
      };

      // ---- panels and headers ----
      const panels = PANELS.map((p) => D1.card(stage, { x: p.x, y: p.y, w: 450, h: 290, tone: "grey", plain: true }));
      const heads = PANELS.map((p) => D1.tag(stage, { x: p.x + 14, y: p.y + 12, text: p.name, tone: "grey" }));

      // ---- back layer: icons and guide arrows ----
      const back = L5.svg(stage);
      const add = (g) => back.appendChild(g);
      const guide = (x1, y1, x2, y2) => add(L5.arrow(x1, y1, x2, y2, "grey", 1, { w: 6, head: 18 }));
      const dbIcon = add(firm(D1.icon.db(DB.x, DB.y, DB.size, "grey")));
      const guideIn = guide(IN_X + 28, DB.y, DB.x - 56, DB.y);
      const guideOut = guide(DB.x + 56, DB.y, OUT_X - 28, DB.y);
      const cdbIcon = add(firm(D1.icon.db(CDB.x, LANE, CDB.size, "grey")));
      const guideA = guide(APP.x + APP.w + 10, LANE, CC.x - 8, LANE);
      const guideB = guide(CC.x + CC.w + 10, LANE, CDB.x - 40, LANE);
      const sun = add(D1.icon.sun(SUN.x, ROW, SUN.size, "orange"));
      const moon = add(firm(D1.icon.moon(MOON.x, MOON.y, MOON.size, "grey")));
      const gear = add(D1.icon.gear(GEAR.x, GEAR.y, GEAR.size, "purple"));
      const doc = add(D1.icon.doc(DOC.x, ROW, DOC.size, "green"));
      const arrow1 = guide(SUN.x + 48, ROW, MOON.x - 40, ROW);
      const arrow2 = guide(GEAR.x + 34, ROW, DOC.x - 46, ROW);

      // ---- middle layer: packets, chips, tags, bars ----
      const pk = D1.token(stage, { tone: "blue", size: 34, square: true });
      const stored = D1.token(stage, { tone: "blue", size: 26, square: true });
      const pkOut = D1.token(stage, { tone: "blue", size: 34, square: true });
      const today = tagC(IN_X, 88, "today", 124);
      const tomorrow = tagC(OUT_X, 88, "tomorrow", 184);
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
      const missTag = D1.tag(stage, { x: VERDICT.tag[0], y: VERDICT.tag[1], text: "miss", tone: "red" });
      const hitTag = D1.tag(stage, { x: VERDICT.tag[0], y: VERDICT.tag[1], text: "hit", tone: "green" });
      const slow = tagC(800, 200, MS(CACHE.dbMs), 146, { tone: "red", solid: true });
      const fast = tagC(640, 200, MS(CACHE.cacheMs), 112, { tone: "green", solid: true });
      // what "ms" is, said once (the lesson's first number with a unit)
      const msNote = D1.label(stage, { x: 486, y: 262, w: 420, text: "1 ms = 1/1000 of a second" });

      const idxNote = D1.label(stage, {
        x: 164,
        y: 354,
        w: 276,
        text: `${D1.fmt(INDEX.records)} records`,
        align: "right",
      });
      const lab1 = D1.label(stage, { x: BAR.x, y: 412, w: 400, text: "no index: check each record", align: "left" });
      const bar1 = D1.bar(stage, { x: BAR.x, y: 450, w: BAR.w, h: BAR.h, tone: "red" });
      const lab2 = D1.label(stage, {
        x: BAR.x,
        y: 508,
        w: 400,
        text: "with an index: jump to it",
        align: "left",
        tone: "purple",
      });
      const bar2 = D1.bar(stage, { x: BAR.x, y: 546, w: BAR.w, h: BAR.h, tone: "green" });
      // the "with an index" bar can only be a sliver (20 of a million): the bar helper draws its smallest pill, which we
      // pop and count up ourselves (children: rail, fill, text)
      const [, fill2, txt2] = bar2.el.children;

      const lblAll = D1.label(stage, { x: SUN.x - 60, y: 578, w: 120, text: "all day" });
      const lblNight = D1.label(stage, { x: 704 - 60, y: 578, w: 120, text: BATCH.night });
      const lblDay = D1.label(stage, { x: DOC.x - 60, y: 578, w: 120, text: BATCH.ready, tone: "green", bold: true });
      const pile = PILE.map(() => D1.token(stage, { tone: "blue", size: 20, square: true }));

      // ---- front layer: tick and cross ----
      const front = L5.svg(stage);
      const tick1 = front.appendChild(L5.tick(OUT_X + 54, DB.y, 44, "green", { w: 9 }));
      const miss = front.appendChild(L5.cross(...VERDICT.sym, 44, "red", { w: 9 }));
      const hit = front.appendChild(L5.tick(...VERDICT.sym, 44, "green", { w: 9 }));
      const tick2 = front.appendChild(L5.tick(DOC.x, 530, 46, "green", { w: 9 }));

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
        L5.drawOn(guideIn, ramp(t, T.dbIcon + 0.05, T.dbIcon + 0.25, E.lin));
        L5.drawOn(guideOut, ramp(t, T.dbIcon + 0.05, T.dbIcon + 0.25, E.lin));
        const inK = ramp(flyK, 0.7, 1, E.lin); // the packet shrinks into the database at the end of its flight
        const pkK = popK(t, T.packet, 0.25);
        pk.set({
          x: IN_X + (DB.x - IN_X) * flyK,
          y: DB.y,
          s: appear(pkK).s * (1 - 0.85 * inK),
          o: appear(pkK).o * (1 - inK),
        });
        // the tags light up in turn: "today" while the packet goes in, "tomorrow" while the copy comes out
        const inToday = t < T.stored + 0.2;
        const inTomorrow = t >= T.out[0] && t < T.tick1[1] + 0.5;
        today.set({ k: popK(t, T.packet, 0.3), tone: inToday ? "blue" : "grey", solid: inToday });
        const stK = popK(t, T.stored, 0.3);
        stored.set({ x: DB.x, y: DB.y + 4, ...appear(stK) });
        tomorrow.set({ k: popK(t, T.tomorrow, 0.3), tone: inTomorrow ? "green" : "grey", solid: inTomorrow });
        const outK = ramp(t, T.out[0], T.out[1], E.out);
        pkOut.set({
          x: DB.x + (OUT_X - DB.x) * outK,
          y: DB.y,
          s: 0.3 + 0.7 * E.pop(outK),
          o: ramp(t, T.out[0], T.out[0] + 0.1, E.lin),
        });
        L5.drawOn(tick1, ramp(t, T.tick1[0], T.tick1[1], E.out));

        // ---- 2. cache ----
        const kIn = popK(t, T.cacheIn, 0.3);
        const shake = 4 * Math.sin(Math.PI * 4 * clamp((t - T.miss[0]) / (T.miss[1] - T.miss[0])));
        cc.set({
          k: kIn,
          x: t < T.miss[1] ? shake : 0,
          s: 1 + 0.06 * flash(t, T.hit[0], T.hit[0] + 0.25),
        });
        app.set({ k: popK(t, T.cacheIn - 0.1, 0.3) });
        const kCdb = popK(t, T.cacheIn + 0.1, 0.3);
        V.place(cdbIcon, {
          ...appear(kCdb),
          s: appear(kCdb).s * (1 + 0.1 * flash(t, T.legB[1] - 0.1, T.legB[1] + 0.25)),
        });
        L5.drawOn(guideA, ramp(t, T.cacheIn + 0.2, T.cacheIn + 0.4, E.lin));
        L5.drawOn(guideB, ramp(t, T.cacheIn + 0.2, T.cacheIn + 0.4, E.lin));
        // request 1: app -> cache edge, a pause for the miss, then behind the cache into the database
        const a = ramp(t, T.legA[0], T.legA[1], E.inOut);
        const b = ramp(t, T.legB[0], T.legB[1], E.inOut);
        const r1 = popK(t, T.req1, 0.2);
        const x1 = b > 0 ? REQ[1] + (CDB.x - REQ[1]) * b : REQ[0] + (REQ[1] - REQ[0]) * a;
        const sink = ramp(b, 0.8, 1, E.lin);
        req1.set({ x: x1, y: LANE, s: appear(r1).s * (1 - 0.85 * sink), o: appear(r1).o * (1 - sink) });
        const verdictOut = 1 - ramp(t, T.crossOut[0], T.crossOut[1], E.lin);
        L5.drawOn(miss, ramp(t, T.miss[0], T.miss[1], E.out));
        V.place(miss, { o: verdictOut });
        missTag.set({ k: popK(t, T.missTag, 0.3), o: verdictOut });
        slow.set({ k: popK(t, T.slow, 0.3) });
        // the purple copy flies back from the database and stays inside the cache
        const cp = ramp(t, T.copy[0], T.copy[1], E.inOut);
        const cpOn = ramp(t, T.copy[0], T.copy[0] + 0.1, E.lin);
        copy.set({
          x: CDB.x + (CCX - CDB.x) * cp,
          y: LANE + 28 * cp,
          s: (0.4 + 0.6 * cpOn) * (1 + 0.15 * flash(t, T.hit[0], T.hit[0] + 0.25)),
          o: cpOn,
        });
        // request 2: stops at the cache, a hit
        const c2 = ramp(t, T.req2[0], T.req2[1], E.inOut);
        const r2 = popK(t, T.req2[0], 0.15);
        const gone = ramp(t, T.hit[0], T.hit[0] + 0.12, E.lin);
        req2.set({
          x: REQ[0] + (REQ[1] - REQ[0]) * c2,
          y: LANE,
          s: appear(r2).s * (1 - 0.6 * gone),
          o: appear(r2).o * (1 - gone),
        });
        L5.drawOn(hit, ramp(t, T.hit[0], T.hit[1], E.out));
        hitTag.set({ k: popK(t, T.hitTag, 0.3) });
        fast.set({ k: popK(t, T.fast, 0.3) });
        msNote.set({ k: popK(t, T.slow + 0.2, 0.3) });

        // ---- 3. index: a race, the sweep against 20 checks ----
        const kIdx = popK(t, T.idxIn, 0.3);
        idxNote.set({ k: kIdx });
        lab1.set({ k: popK(t, T.idxIn + 0.05, 0.3) });
        lab2.set({ k: popK(t, T.idxIn + 0.15, 0.3) });
        const sw = ramp(t, T.sweep[0], T.sweep[1], E.inOut);
        bar1.set({
          v: sw,
          k: popK(t, T.idxIn + 0.05, 0.3),
          text: sw < 1 ? CHECKS(Math.round(sw * INDEX.scan)) : `up to ${CHECKS(INDEX.scan)}`, // the worst case
        });
        const k2 = popK(t, T.race, 0.25);
        const n2 = Math.round(INDEX.checks * ramp(t, T.count[0], T.count[1], E.lin));
        bar2.set({
          v: t >= T.race ? Math.max(INDEX.checks / INDEX.scan, 0.001) : 0,
          k: popK(t, T.idxIn + 0.15, 0.3),
          text: n2 < INDEX.checks ? CHECKS(n2) : `about ${CHECKS(INDEX.checks)}`, // log2 of a million is about 20
        });
        V.place(fill2, appear(k2));
        V.place(txt2, { o: ramp(t, T.race + 0.1, T.race + 0.3, E.lin) });

        // ---- 4. batch job ----
        const kSun = popK(t, T.batIn, 0.3);
        V.place(sun, appear(kSun));
        lblAll.set({ k: kSun });
        const kNight = popK(t, T.night, 0.3);
        V.place(moon, appear(kNight));
        V.place(gear, { ...appear(kNight), r: 360 * ramp(t, T.spin[0], T.spin[1], E.inOut) });
        lblNight.set({ k: kNight });
        L5.drawOn(arrow1, ramp(t, T.arrow1[0], T.arrow1[1], E.lin));
        L5.drawOn(arrow2, ramp(t, T.arrow2[0], T.arrow2[1], E.lin));
        const slide = ramp(t, T.slide[0], T.slide[1], E.inOut);
        PILE.forEach(([dx, y], i) => {
          const k = ramp(t, T.pile + 0.07 * i, T.pile + 0.07 * i + 0.2, E.out);
          const e = ramp(t, T.eat + 0.07 * i, T.eat + 0.07 * i + 0.22, E.in);
          const x = SUN.x + dx + (GEAR.x - SUN.x) * slide;
          pile[i].set({
            x: x + (GEAR.x - x) * e,
            y: y - 30 * (1 - k) + (GEAR.y - y) * e,
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
