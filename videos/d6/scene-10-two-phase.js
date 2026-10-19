/* Lecture 6 · scene 10 (two-phase commit), following "spec" of videos/_plan/ds-6.json (scene 10).
   Story (local seconds): 0.3-0.9 coordinator, three databases ('?') and the links appear; 0.5 "Phase 1: vote" tag;
   0.6-1.9 three purple 'prepare' packets go down (staggered); 1.8 / 2.25 / 2.7 Orders and Stock vote yes (green, padlock, "locked"),
   Payments votes no (red, cross), each reply packet climbs back and the coordinator tallies "1 yes", "2 yes", "2 yes, 1 no";
   4.8 the rule tag "any no: abort" pops; 5.0 phase 2 starts; 5.2-6.6 three orange 'abort' packets go down and the coordinator turns
   orange 'abort'; 6.3-6.7 each box becomes orange 'aborted', the padlocks open and fade ("unlocked");
   9.3-10.9 the happy path builds: three green 'yes' discs, an arrow, the green 'commit' tag. Hold from 11.0. */
(function () {
  const V = window.VID;
  const D6 = V.d6;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;
  const { TPC, DB } = D6;

  // ---------- data: every word and count comes from the real two-phase rule (asserted) ----------
  const VOTES = TPC.votes; // yes, yes, no
  const YES3 = DB.map(() => "yes");
  D6.same(D6.run2pc(YES3, "2pc").decision, "commit", "all-yes run decision");
  D6.same(TPC.abort.decision, "abort", "abort run decision");
  D6.same(
    VOTES.some((v) => v === "no"),
    true,
    "the shown run has a no vote",
  );
  D6.same(TPC.abort.locks, [true, true, false], "locks held");
  D6.same([VOTES.filter((v) => v === "yes").length, VOTES.filter((v) => v === "no").length], [2, 1], "vote tally");

  // ---------- geometry (stage px) ----------
  const COORD = { x: 358, y: 10, w: 220, h: 140 };
  const BOXES = DB.map((_, i) => ({ x: 12 + i * 346, y: 330, w: 220, h: 170 }));
  const FROM = { x: 468, y: 150 }; // coordinator bottom-middle
  const TO = BOXES.map((b) => ({ x: b.x + b.w / 2, y: b.y })); // database top-middles
  const F0 = 0.18; // packets travel between these fractions of a link so they clear the stickers
  const F1 = 0.82;

  // ---------- timeline ----------
  const T = {
    pop: [0.3, 0.9],
    prep: { t0: 0.6, step: 0.25, dur: 0.8 },
    vote: [1.8, 2.25, 2.7], // each database votes
    back: 0.6, // flight time of a vote
    abortPk: { t0: 5.2, step: 0.2, dur: 1.0 },
    abort: [6.3, 6.5, 6.7], // each box becomes 'aborted'
    ruleTag: 4.8,
    phase2: 5.0,
    row: 9.3,
  };
  const arrive = (i) => T.vote[i] + T.back; // the vote reaches the coordinator

  // a packet's opacity / scale over one flight u 0..1: fades in and out at the ends
  const flight = (u) => {
    const o = Math.min(ramp(u, 0, 0.12, E.lin), ramp(1 - u, 0, 0.12, E.lin));
    return { o, s: 0.6 + 0.4 * o };
  };

  V.scene({
    kicker: "TWO-PHASE COMMIT",
    title: ["Ask first,", "then decide once"],
    dur: 13.5,
    caps: [
      [0.5, 2.2, "First, ask every database."],
      [2.8, 4.6, "Each votes, and holds its locks."],
      [5.0, 6.8, "Any no means abort for all."],
      [7.3, 9.3, "All three abort and unlock."],
      [9.8, 12.0, "If all vote yes, all commit."],
    ],
    build(stage) {
      // links first, so every sticker sits on top of them
      const links = DB.map((_, i) => D6.link(stage, { a: FROM, b: TO[i], w: 6 }));
      const coord = D6.box(stage, { ...COORD, name: "Coordinator", tone: "purple", vfs: 44 });
      const dbs = DB.map((name, i) => D6.box(stage, { ...BOXES[i], name, tone: "grey", icon: "db", vfs: 52 }));
      const lockG = [0, 1].map((i) => dbs[i].el.querySelector("[data-shackle]").parentNode);

      const ph1 = D6.tag(stage, { x: 12, y: 40, text: "Phase 1: vote", tone: "purple" });
      const ph2 = D6.tag(stage, {
        x: 924 - D6.tagW("Phase 2: decide"),
        y: 40,
        text: "Phase 2: decide",
        tone: "purple",
      });
      const rule = D6.tag(stage, { x: 12, y: 560, text: `any no: ${TPC.abort.decision}`, tone: "orange", solid: true });

      const prep = DB.map(() => D6.packet(stage, { tone: "purple", text: "prepare" }));
      const vote = DB.map((_, i) => D6.packet(stage, { tone: VOTES[i] === "yes" ? "green" : "red", text: VOTES[i] }));
      const stop = DB.map(() => D6.packet(stage, { tone: "orange", text: TPC.abort.decision }));

      const yesRow = YES3.map((v, i) => D6.disc(stage, { x: 380 + i * 70, y: 590, size: 64, text: v, tone: "green" }));
      const svg = L5.svg(stage);
      const arrow = svg.appendChild(L5.arrow(560, 590, 650, 590, "green", 1, { w: 7 }));
      const commit = D6.tag(stage, { x: 668, y: 560, text: TPC.commit.decision, tone: "green", solid: true });

      return (t) => {
        const kIn = ramp(t, T.pop[0], T.pop[1], E.lin);

        // ----- links and phase tags -----
        links.forEach((lk) => lk.update({ k: ramp(t, T.pop[0], T.pop[1], E.lin), tone: "grey" }));
        const inPhase2 = t >= T.phase2;
        ph1.set({ k: ramp(t, 0.5, 0.8, E.lin), tone: inPhase2 ? "grey" : "purple", solid: !inPhase2 });
        ph2.set({ k: ramp(t, T.phase2, T.phase2 + 0.3, E.lin), tone: "purple", solid: true });
        rule.set({ k: ramp(t, T.ruleTag, T.ruleTag + 0.4, E.lin) });

        // ----- the coordinator: tallies the votes, then decides -----
        const got = [0, 1, 2].filter((i) => t >= arrive(i));
        const yesN = got.filter((i) => VOTES[i] === "yes").length;
        const noN = got.length - yesN;
        const tally = [yesN ? `${yesN} yes` : "", noN ? `${noN} no` : ""].filter(Boolean).join(", ");
        const decided = t >= T.abortPk.t0;
        coord.set({
          value: decided ? TPC.abort.decision : "prepare?",
          sub: tally,
          tone: decided ? "orange" : "purple",
          k: kIn,
          s: 1 + 0.06 * flash(t, T.abortPk.t0, T.abortPk.t0 + 0.4),
        });

        // ----- the three databases -----
        dbs.forEach((b, i) => {
          const [tv, ta] = [T.vote[i], T.abort[i]];
          const yes = VOTES[i] === "yes";
          const held = TPC.abort.locks[i];
          const st = { k: kIn, vfs: 52 };
          if (t < tv) Object.assign(st, { value: "?", tone: "grey" });
          else if (t < ta) {
            Object.assign(st, {
              value: VOTES[i],
              tone: yes ? "green" : "red",
              sub: held ? "locked" : "",
              mark: held ? "lock" : "cross",
              markK: ramp(t, tv + 0.35, tv + 0.7, E.lin),
              s: 1 + 0.06 * flash(t, tv, tv + 0.35),
            });
          } else {
            Object.assign(st, {
              value: TPC.abort.out[i],
              tone: "orange",
              vfs: 44,
              sub: held ? "unlocked" : "no lock",
              mark: held ? "lock" : "cross",
              markK: held ? 1 - ramp(t, ta + 0.3, ta + 0.6, E.lin) : 1,
              s: 1 + 0.06 * flash(t, ta, ta + 0.35),
            });
          }
          b.set(st);
          if (held) D6.lockOpen(lockG[i], ramp(t, ta, ta + 0.3));
        });

        // ----- packets -----
        DB.forEach((_, i) => {
          const lk = links[i];
          const p = T.prep;
          const u = clamp((t - (p.t0 + i * p.step)) / p.dur);
          const f = flight(u);
          const pt = lk.at(F0 + (F1 - F0) * E.inOut(u));
          prep[i].set({ x: pt.x, y: pt.y, o: u > 0 && u < 1 ? f.o : 0, s: f.s });

          const uv = clamp((t - T.vote[i]) / T.back);
          const fv = flight(uv);
          const pv = lk.at(F1 - (F1 - F0) * E.inOut(uv));
          vote[i].set({ x: pv.x, y: pv.y, o: uv > 0 && uv < 1 ? fv.o : 0, s: fv.s });

          const a = T.abortPk;
          const ua = clamp((t - (a.t0 + i * a.step)) / a.dur);
          const fa = flight(ua);
          const pa = lk.at(F0 + (F1 - F0) * E.inOut(ua));
          stop[i].set({ x: pa.x, y: pa.y, o: ua > 0 && ua < 1 ? fa.o : 0, s: fa.s });
        });

        // ----- the happy path rule -----
        yesRow.forEach((d, i) => d.set({ k: ramp(t, T.row + i * 0.25, T.row + i * 0.25 + 0.35, E.lin) }));
        const kA = ramp(t, T.row + 0.75, T.row + 1.2, E.lin);
        L5.drawOn(arrow, kA);
        V.show(arrow, kA > 0 ? 1 : 0);
        commit.set({ k: ramp(t, T.row + 1.2, T.row + 1.6, E.lin) });
      };
    },
  });
})();
