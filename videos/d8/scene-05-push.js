/* Lecture 8 (ds-8) · scene 5 (PRODUCERS AND CONSUMERS): a producer (the phone app) writes an event into a database once; a consumer
   that POLLS keeps asking "new?" and almost every answer is empty: every 5 s for an hour is 720 checks, and with 12 events at least
   708 come back empty (D8.POLL, D8.pollAt). Better: a messaging system PUSHES each event to the consumers, one event to many
   (lesson 8.1 'Producers and consumers', 'Polling or notification?'; lesson 8.2 'Messaging systems push').
   Story (local seconds): 0.3 producer, database, consumer; 1.0 the like flies into the database; 3.2 the consumer polls every
   0.35 s (crosses for empty answers, the like comes back at the 4th poll); 6.0 the counters and the hour bar run to 720 / 12 / 708;
   8.6 the database becomes the purple messaging system and three consumers appear; 9.3 one like is pushed to all three. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D8 = V.d8;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const P = D8.POLL;
  const end = D8.pollAt(1);
  D8.same(
    "push scene: 720 checks an hour, 12 events, 708 empty, three consumers",
    [P.every, P.checks, P.perHour, P.empty, end, P.consumers.length],
    [5, 720, 12, 708, { checks: 720, found: 12, empty: 708 }, 3],
  );

  const T = {
    pop: 0.3,
    like: [1.0, 1.8],
    poll0: 3.2,
    pollStep: 0.35,
    pollEnd: 8.2,
    trip: 0.3,
    found: 3, // the 4th poll brings the like back
    count: [6.1, 7.7],
    sys: 8.6,
    send: [9.3, 9.9],
    push: [9.9, 10.6],
    pushTag: 11.0,
    ticks: [11.0, 11.2, 11.4],
  };
  const polls = [];
  for (let t0 = T.poll0; t0 < T.pollEnd - 0.2; t0 += T.pollStep) polls.push(Math.round(t0 * 100) / 100);

  V.scene({
    kicker: "PRODUCERS AND CONSUMERS",
    title: ["Don't poll:", "push each event"],
    dur: 13,
    caps: [
      [0.5, 3, "A producer makes events; a consumer uses them."],
      [3.2, 5.8, "Polling: the consumer asks again and again."],
      [6, 8.4, `${P.checks} checks an hour find only ${P.perHour} events.`],
      [8.6, 10.8, "Better: a messaging system pushes each event."],
      [10.9, 12.7, "One event can go to many consumers."],
    ],
    build(stage) {
      const WY = 290; // the wire height (the cards' middle)
      const svg = D4.svg(stage);
      const wPD = D4.wire(svg, {
        pts: [
          [212, WY],
          [338, WY],
        ],
      });
      const wCD = D4.wire(svg, {
        pts: [
          [640, WY],
          [442, WY],
        ],
      });
      const wPS = D4.wire(svg, {
        pts: [
          [212, WY],
          [280, WY],
        ],
      });
      const CARD_Y = [WY - 200, WY - 48, WY + 104];
      const wSC = CARD_Y.map((y, i) =>
        D4.wire(svg, {
          pts: [
            [560, WY + 40 * (i - 1)],
            [660, y + 48],
          ],
        }),
      );
      const dbG = svg.appendChild(D8.db(390, WY - 5, 120, "grey"));
      const dbLabel = D4.label(stage, { x: 390, y: WY + 82, text: "database", tone: "grey", fs: 28 });

      const prod = D4.node(stage, {
        x: 12,
        y: WY - 75,
        w: 200,
        h: 150,
        name: "Phone app",
        icon: "phone",
        tone: "blue",
      });
      const prodTag = D4.tag(stage, { x: 112, y: WY + 105, text: "producer", tone: "blue" });
      const cons = D4.node(stage, {
        x: 640,
        y: WY - 75,
        w: 284,
        h: 150,
        name: "Consumer",
        icon: "server",
        tone: "grey",
      });
      const consTag = D4.tag(stage, { x: 782, y: WY + 105, text: "consumer", tone: "grey" });
      const sys = D4.node(stage, {
        x: 280,
        y: WY - 75,
        w: 280,
        h: 150,
        name: "Messaging system",
        icon: "server",
        tone: "purple",
      });
      const cards = CARD_Y.map((y, i) =>
        D4.card(stage, { x: 660, y, w: 264, h: 96, text: P.consumers[i], tone: "grey", plain: false }),
      );
      const everyTag = D4.tag(stage, { x: 553, y: WY + 60, text: `every ${P.every} s`, tone: "grey" });
      const consTags = D4.tag(stage, { x: 792, y: WY - 232, text: "consumers", tone: "grey" });
      const pushTag = D4.tag(stage, { x: 420, y: WY - 105, text: "push", tone: "purple", solid: true });

      // counters and the hour bar
      const cnt = [
        D4.tag(stage, { x: 200, y: 500, text: "", tone: "grey" }),
        D4.tag(stage, { x: 468, y: 500, text: "", tone: "green" }),
        D4.tag(stage, { x: 736, y: 500, text: "", tone: "red" }),
      ];
      const hourBar = D4.bar(stage, { x: 120, y: 568, w: 640, h: 34, tone: "grey" });
      const hourLabel = D4.label(stage, { x: 848, y: 585, text: "", tone: "grey", fs: 28 });

      // the stored like (a small blue disc on the database) and the flying packets
      const stored = D4.disc(stage, { x: 390, y: WY + 8, size: 34, text: "", tone: "blue" });
      const likeIn = D4.packet(stage, { text: D8.EVENT.action, tone: "blue" });
      const likeBack = D4.packet(stage, { text: D8.EVENT.action, tone: "blue" });
      const asks = polls.map(() => D4.packet(stage, { text: "new?", tone: "grey" }));
      const sysIn = D4.packet(stage, { text: D8.EVENT.action, tone: "blue" });
      const pushed = CARD_Y.map(() => D4.packet(stage, { text: D8.EVENT.action, tone: "blue" }));

      const top = D4.svg(stage);
      const crosses = polls.map(() => top.appendChild(L5.cross(612, WY - 48, 34, "red", { w: 8 })));
      const ticks = CARD_Y.map((y) => top.appendChild(L5.tick(898, y + 4, 40, "green", { w: 9 })));

      const sysAt = (t) => ramp(t, T.sys, T.sys + 0.6, E.lin); // database -> messaging system cross-fade
      return (t) => {
        const k = ramp(t, T.pop, T.pop + 0.5, E.lin);
        const sk = sysAt(t);
        const part1 = 1 - sk;
        wPD.set({ k, o: part1 });
        wCD.set({ k, o: part1 });
        wPS.set({ k: sk });
        wSC.forEach((w, i) => w.set({ k: D4.seq(t, T.sys + 0.2, 0.12, 0.4, i) }));
        V.place(dbG, { s: 0.8 + 0.2 * E.pop(k) - 0.15 * sk, o: Math.min(1, k * 4) * part1 });
        dbLabel.set({ k: k * part1 });

        prod.set({ k, bump: flash(t, T.send[0], T.send[0] + 0.3) });
        prodTag.set({ k });
        const gotLike = polls[T.found] + T.trip + 0.4; // the like reaches the consumer
        cons.set({
          k,
          o: part1,
          tone: t >= gotLike && t < gotLike + 0.8 ? "blue" : "grey",
          bump: flash(t, gotLike, gotLike + 0.3),
        });
        consTag.set({ k: k * part1 });
        sys.set({ k: sk, bump: flash(t, T.push[0], T.push[0] + 0.3) });
        cards.forEach((c, i) => {
          const arrived = t >= T.push[1];
          c.set({
            k: D4.seq(t, T.sys + 0.1, 0.12, 0.5, i),
            tone: arrived ? "green" : "grey", // delivered
            plain: false,
            s: 1 + 0.06 * flash(t, T.push[1], T.push[1] + 0.3),
          });
        });

        // 1. the like flies into the database and is stored there
        const f0 = ramp(t, T.like[0], T.like[1], E.inOut);
        const pIn = wPD.at(f0);
        likeIn.set({ x: pIn.x, y: pIn.y, k: D8.edge(f0) });
        const foundAt = polls[T.found] + T.trip; // the like leaves the database with the 4th answer
        stored.set({ k: t >= T.like[1] && t < foundAt ? 1 : 0, s: 1 + 0.2 * flash(t, T.like[1], T.like[1] + 0.3) });

        // 2. polling: "new?" rides consumer -> database; the answer is a cross (empty) or the like coming back
        polls.forEach((t0, i) => {
          const f = ramp(t, t0, t0 + T.trip, E.lin);
          const p = wCD.at(f);
          asks[i].set({ x: p.x, y: p.y, k: D8.edge(f) * part1 });
          const back = t0 + T.trip;
          const empty = i !== T.found;
          const ck = empty ? ramp(t, back + 0.25, back + 0.4, E.lin) * (1 - ramp(t, back + 0.6, back + 0.8, E.lin)) : 0;
          V.place(crosses[i], { s: 0.6 + 0.4 * E.pop(ck), o: ck });
        });
        const fb = ramp(t, foundAt, foundAt + 0.4, E.inOut);
        const pb = D4.at({ x: 442, y: WY }, { x: 640, y: WY }, fb, -60);
        likeBack.set({ x: pb.x, y: pb.y, k: D8.edge(fb, 4) });
        everyTag.set({ k: ramp(t, 3.3, 3.7, E.lin) * part1 });

        // 3. one hour of polling: the counters and the clock bar
        const cf = ramp(t, T.count[0], T.count[1], E.lin);
        const c = D8.pollAt(cf);
        const ck = ramp(t, 5.9, 6.3, E.lin) * part1;
        cnt[0].set({ k: ck, text: `checks: ${c.checks}` });
        cnt[1].set({ k: ck, text: `found: ${c.found}`, solid: cf >= 1 });
        cnt[2].set({
          k: ck,
          text: `empty: ${c.empty}`,
          solid: cf >= 1,
          s: 1 + 0.15 * flash(t, T.count[1], T.count[1] + 0.4),
        });
        hourBar.set({ k: cf, o: ck });
        hourLabel.set({ k: ck, text: `${Math.round(60 * cf)} min` });

        // 4. push: one like into the system, a copy along each wire to every consumer
        const fs = ramp(t, T.send[0], T.send[1], E.inOut);
        const ps = wPS.at(fs);
        sysIn.set({ x: ps.x, y: ps.y, k: D8.edge(fs) });
        const fp = ramp(t, T.push[0], T.push[1], E.inOut);
        pushed.forEach((pk, i) => {
          const p = wSC[i].at(fp);
          pk.set({ x: p.x, y: p.y, k: D8.edge(fp) });
        });
        consTags.set({ k: ramp(t, T.sys + 0.3, T.sys + 0.7, E.lin) });
        pushTag.set({ k: ramp(t, T.pushTag, T.pushTag + 0.4, E.lin) });
        ticks.forEach((g, i) => {
          const tk = ramp(t, T.ticks[i], T.ticks[i] + 0.3, E.lin);
          V.place(g, { s: 0.5 + 0.5 * E.pop(tk), o: tk });
        });
      };
    },
  });
})();
