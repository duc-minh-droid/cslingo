/* Lecture 6 · scene 09 (commit-fails): one purchase touches three databases that must all commit or all not. A coordinator
   that just sends "commit" to each and moves on gets one commit, one conflict and one lost message. The outcome comes from
   D6.TPC.naive (run2pc(["yes", "no", "crash"], "naive")) and is asserted below. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  // ---------- the real outcome, asserted ----------
  const NAIVE = D6.TPC.naive;
  const SHOW = { committed: "committed", rejected: "conflict", "never got it": "no message" };
  const RES = NAIVE.out.map((o) => {
    if (!SHOW[o]) throw new Error(`scene 9: unexpected outcome "${o}"`);
    return { value: SHOW[o], ok: o === "committed", lost: o === "never got it" };
  });
  const DONE = RES.filter((r) => r.ok).length;
  D6.same([DONE, RES.length, NAIVE.same], [1, 3, false], "scene 9: one of three committed, not all or nothing");
  D6.same(
    RES.map((r) => r.lost),
    [false, false, true],
    "scene 9: only Payments never hears",
  );

  // ---------- layout (stage pixels) ----------
  const COORD = { x: 358, y: 120, w: 220, h: 130 };
  const FROM = { x: 468, y: COORD.y + COORD.h };
  const DBX = [12, 358, 704];
  const DBY = 380;
  const TAG = `${DONE} of ${RES.length} committed`;

  // the captions' beats: Stock conflicts (5.0), Payments never hears (5.8)
  const PULSE = [-1, 5.0, 5.8];
  // timeline (local seconds)
  const T = {
    cards: 0.1,
    ring: 0.5,
    nodes: 0.5,
    links: 0.7,
    send: 2.6,
    arrive: 3.4,
    lostStop: 3.0,
    lostDie: 3.4,
    tag: 7.0,
  };

  V.scene({
    kicker: "CONSENSUS",
    title: ["Many nodes must", "agree on one answer"],
    dur: 10,
    caps: [
      [0.5, 2.4, "Several databases must agree."],
      [2.8, 4.6, "It just sends commit to all."],
      [5.0, 6.9, "One conflicts, one never hears."],
      [7.4, 9.4, "Now the databases disagree."],
    ],
    build(stage) {
      // two kinds of consensus: the second is the one this scene is about
      const leader = D6.card(stage, { x: 18, y: 8, w: 280, h: 80, text: "leader election", tone: "grey" });
      const atomic = D6.card(stage, { x: 316, y: 8, w: 280, h: 80, text: "atomic commit", tone: "purple" });
      const ring = D6.bracket(stage, { x: 310, y: 2, w: 292, h: 92, tone: "purple", radius: 26 });
      const kinds = D6.label(stage, { x: 612, y: 29, w: 312, text: "kinds of consensus", align: "left" });

      // links first, so the boxes sit on top of them
      const links = DBX.map((x) => D6.link(stage, { a: FROM, b: { x: x + 110, y: DBY }, w: 6 }));
      const coord = D6.box(stage, { ...COORD, name: "Coordinator", tone: "purple", vfs: 40 });
      const dbs = D6.DB.map((name, i) =>
        D6.box(stage, { x: DBX[i], y: DBY, w: 220, h: 160, name, icon: "db", vfs: 34 }),
      );
      const pk = DBX.map(() => D6.packet(stage, { tone: "purple", text: "commit" }));
      const svg = L5.svg(stage);
      const lostAt = links[2].at(0.5);
      const cross = L5.cross(lostAt.x, lostAt.y, 46, "red", { w: 8 });
      svg.append(cross);
      const tag = D6.tag(stage, { x: Math.round(468 - D6.tagW(TAG) / 2), y: 566, text: TAG, tone: "red", solid: true });

      return (t) => {
        // 1. what consensus is: two cards, the atomic-commit one is picked out
        leader.set({ k: ramp(t, T.cards, T.cards + 0.5) });
        atomic.set({ k: ramp(t, T.cards + 0.1, T.cards + 0.6) });
        ring.set({ k: ramp(t, T.ring, T.ring + 0.4) });
        kinds.set({ k: ramp(t, T.cards + 0.2, T.cards + 0.7) });

        // 2. the coordinator and the three databases, all still undecided
        coord.set({ value: "commit", k: ramp(t, T.nodes, T.nodes + 0.5) });
        links.forEach((lk, i) => lk.update({ k: ramp(t, T.links + i * 0.1, T.links + 0.6 + i * 0.1) }));

        // 3. three "commit" packets leave together; Payments' one dies halfway
        const p = ramp(t, T.send, T.arrive, E.lin);
        const dieK = ramp(t, T.lostDie, T.lostDie + 0.4);
        pk.forEach((q, i) => {
          const lost = RES[i].lost;
          const f = lost ? Math.min(p, 0.5) : p;
          const pos = links[i].at(f, 34);
          const gone = lost ? 1 - ramp(t, T.lostDie, T.lostDie + 0.2) : 1 - ramp(t, T.arrive, T.arrive + 0.2);
          q.set({ x: pos.x, y: pos.y, o: t < T.send ? 0 : gone });
        });
        const crossBump = flash(t, PULSE[2], PULSE[2] + 0.7);
        V.place(cross, { s: (0.3 + 0.7 * E.pop(dieK)) * (1 + 0.3 * crossBump), o: Math.min(1, dieK * 4) });

        // 4. the databases answer one by one (a stand-in decision per database, from the run)
        const answers = [T.arrive, T.arrive + 0.2, T.arrive + 0.8];
        dbs.forEach((b, i) => {
          const r = RES[i];
          const shown = t >= answers[i];
          const k = ramp(t, T.nodes + 0.15 + i * 0.1, T.nodes + 0.65 + i * 0.1);
          const bump = PULSE[i] < 0 ? 0 : flash(t, PULSE[i], PULSE[i] + 0.7);
          const nudge = { x: i === 2 ? -5.5 * bump : 0, s: 1 + 0.05 * bump }; // Payments keeps its right edge inside the margin
          if (!shown) b.set({ value: "?", sub: "undecided", tone: "orange", k });
          else
            b.set({
              value: r.value,
              sub: "",
              tone: r.ok ? "green" : "red",
              mark: r.ok ? "tick" : r.lost ? null : "cross",
              markK: ramp(t, answers[i] + 0.1, answers[i] + 0.5),
              k,
              ...nudge,
            });
        });

        // 5. the verdict: the databases disagree
        tag.set({ k: ramp(t, T.tag, T.tag + 0.4) });
      };
    },
  });
})();
