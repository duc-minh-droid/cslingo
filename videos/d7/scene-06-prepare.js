/* Lecture 7 (ds-7) · scene 6 (PHASE 1, PREPARE AND PROMISE): to propose, a proposer first sends PREPARE n (its proposal number) to
   the acceptors; an acceptor that has not seen a bigger number answers PROMISE and then ignores anything numbered lower. Once a
   majority has promised, phase 1 is done (lesson 7.2). One proposer (number 1) and five acceptors, E has crashed: A, B, C and D
   promise, which is a quorum at the third. Every count comes from D7.R1 (asserted on load). Colours: blue = the proposer,
   purple = the PREPARE message and the rule, green = a PROMISE and a promised acceptor, red = E, crashed.
   Story (local seconds): 0.3 the rig pops; 1.0 E crashes; 2.4 PREPARE 1 flies to all five; 3.4 its key pops at the right; 4.4 PROMISE packets fly back from A, B,
   C and D, the acceptor cards turn green; 6.0 the third promise turns the counter green (a quorum); 9.0 the PROMISE key gets its meaning. Hold to the end. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D7 = V.d7;
  const { ramp, flash, ease: E } = V;
  const R = D7.R1;
  const NAMES = D7.ACCS;
  const UP = NAMES.map((k) => k !== R.down);

  D7.same(
    "prepare scene: number 1, E down, four promises, a quorum at three",
    [R.n, R.down, R.promises, R.learned],
    [1, "E", ["A", "B", "C", "D"], 3],
  );
  const T = {
    pop: 0.3,
    crash: 1.0,
    send: 2.4,
    sendStep: 0.25,
    sendDur: 0.8,
    back: 4.4,
    backStep: 0.42,
    backDur: 0.8,
    key1: 3.4,
    key2: 4.6,
    rule: 9.0,
  };
  // a packet fades in as it leaves a card and out as it arrives, so it never sits on top of the text
  const edge = (f) => (f <= 0 || f >= 1 ? 0 : Math.min(1, f * 6, (1 - f) * 6));
  const arrive = (k) => T.back + T.backStep * R.promises.indexOf(NAMES[k]) + T.backDur;
  const quorumAt = R.promises.map((_, j) => T.back + T.backStep * j + T.backDur)[R.learned - 1];

  V.scene({
    kicker: "PHASE 1",
    title: ["Prepare,", "then promise"],
    dur: 13,
    caps: [
      [0.5, 2.5, "Phase 1. Acceptor E is down."],
      [2.7, 4.7, `PREPARE ${R.n} goes to all.`],
      [4.9, 7.0, "Acceptors answer PROMISE."],
      [7.2, 9.6, `${R.learned} promises make a quorum.`],
      [9.8, 12.5, "A promise: ignore older numbers."],
    ],
    build(stage) {
      const rig = D7.rig(stage, { proposers: 1, learners: false });
      const svg = D4.svg(stage);
      const e = NAMES.indexOf(R.down);
      const bolt = svg.appendChild(D4.bolt(rig.pos.acc(e).x + 100, rig.pos.acc(e).y, 64, "red"));
      const num = D4.tag(stage, { x: rig.pos.prop(0).x, y: 430, text: `proposal number ${R.n}`, tone: "blue" });
      const count = D4.tag(stage, { x: rig.pos.prop(0).x, y: 500, text: "promises: 0", tone: "grey" });
      const key1 = {
        tag: D4.tag(stage, { x: 782, y: 150, text: `PREPARE ${R.n}`, tone: "purple", solid: true }),
        lines: ["may I propose", `number ${R.n}?`].map((l, j) =>
          D4.label(stage, { x: 782, y: 206 + 36 * j, text: l, tone: "grey", fs: 30 }),
        ),
      };
      const key2 = {
        tag: D4.tag(stage, { x: 782, y: 340, text: "PROMISE", tone: "green", solid: true }),
        lines: ["ok, I will ignore", "lower numbers"].map((l, j) =>
          D4.label(stage, { x: 782, y: 396 + 36 * j, text: l, tone: "grey", fs: 30 }),
        ),
      };
      const prep = NAMES.map((_, k) => D4.packet(stage, { text: `PREPARE ${R.n}`, tone: "purple" }));
      const prom = NAMES.map((_, k) => D4.packet(stage, { text: "PROMISE", tone: "green" }));

      return (t) => {
        const pk = ramp(t, T.pop, T.pop + 0.5, E.lin);
        rig.prop[0].set({ text: "Proposer", tone: "blue", plain: false, k: pk });
        num.set({ k: ramp(t, T.pop + 0.3, T.pop + 0.7, E.lin) });
        NAMES.forEach((name, k) => {
          const kk = ramp(t, T.pop + 0.08 * k, T.pop + 0.08 * k + 0.5, E.lin);
          const promised = !UP[k] ? false : t >= arrive(k) - 0.3;
          const dead = !UP[k] && t >= T.crash;
          rig.acc[k].set({
            text: dead ? `${name}: crashed` : promised ? `${name}: promised ${R.n}` : name,
            tone: dead ? "red" : promised ? "green" : "grey",
            plain: false,
            k: kk,
          });
          rig.wire[0][k].set({ k: kk, o: dead ? 0.4 : 1 });
          const sf = ramp(t, T.send + T.sendStep * k, T.send + T.sendStep * k + T.sendDur, E.lin);
          const p = rig.wire[0][k].at(sf);
          prep[k].set({ x: p.x, y: p.y, k: edge(sf) });
          prom[k].set({ k: 0 });
          if (UP[k]) {
            const j = R.promises.indexOf(name);
            const bf = ramp(t, T.back + T.backStep * j, T.back + T.backStep * j + T.backDur, E.lin);
            const q = rig.wire[0][k].at(1 - bf);
            prom[k].set({ x: q.x, y: q.y, k: edge(bf) });
          }
        });
        V.place(bolt, {
          s: 0.5 + 0.5 * E.pop(ramp(t, T.crash, T.crash + 0.3, E.lin)),
          o: ramp(t, T.crash, T.crash + 0.3, E.lin),
        });
        const got = R.promises.filter((_, j) => t >= T.back + T.backStep * j + T.backDur).length;
        const quorum = got >= R.learned;
        count.set({
          k: ramp(t, T.send, T.send + 0.4, E.lin),
          text: quorum ? `quorum: ${got}` : `promises: ${got}`,
          tone: quorum ? "green" : "grey",
          solid: quorum,
          s: quorum ? 1 + 0.12 * flash(t, quorumAt, quorumAt + 0.3) : 1,
        });
        key1.tag.set({ k: ramp(t, T.key1, T.key1 + 0.4, E.lin) });
        key1.lines.forEach((l) => l.set({ k: ramp(t, T.key1 + 0.3, T.key1 + 0.7, E.lin) }));
        key2.tag.set({ k: ramp(t, T.key2, T.key2 + 0.4, E.lin) });
        key2.lines.forEach((l) => l.set({ k: ramp(t, T.rule, T.rule + 0.4, E.lin) }));
      };
    },
  });
})();
