/* Lecture 7 (ds-7) · scene 7 (PHASE 2, ACCEPT AND ACCEPTED): once a majority has promised, the proposer sends ACCEPT(n, v) with its
   number and its value; an acceptor that has not promised something bigger accepts it and tells the learners (ACCEPTED). When a
   majority has accepted, the value is chosen and the learners are told (lesson 7.2). It carries on from the last scene: number 1,
   value 7, E crashed, A to D promised. Every count comes from D7.R1 (asserted on load). Colours: blue = the proposer and its
   value, purple = the ACCEPT message, green = promised, accepted, ACCEPTED and chosen, red = E, crashed.
   Story (local seconds): 0.3 the rig pops in the state phase 1 ended in; 1.8 ACCEPT 1, 7 flies to all five and A to D turn to
   "accepted 7"; 4.2 ACCEPTED ticks (the counter names them) fly from A to D to the learners; 5.9 the third one makes the value chosen and the learners
   read "told: 7". Hold to the end. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D7 = V.d7;
  const { ramp, flash, clamp, ease: E } = V;
  const R = D7.R1;
  const NAMES = D7.ACCS;
  const UP = NAMES.map((k) => k !== R.down);

  D7.same(
    "accept scene: number 1, value 7, E down, four accepted, learners told at the third",
    [R.n, R.v, R.down, R.accepted, R.learned],
    [1, 7, "E", ["A", "B", "C", "D"], 3],
  );
  const T = { pop: 0.3, send: 1.8, sendStep: 0.25, sendDur: 0.8, back: 4.2, backStep: 0.42, backDur: 0.9 };
  const edge = (f) => (f <= 0 || f >= 1 ? 0 : Math.min(1, f * 6, (1 - f) * 6));
  const acceptedAt = (k) => T.send + T.sendStep * k + T.sendDur;
  const toldAt = (j) => T.back + T.backStep * j + T.backDur;
  const chosenAt = toldAt(R.learned - 1);

  V.scene({
    kicker: "PHASE 2",
    title: ["Accept, then", "tell the learners"],
    dur: 13,
    caps: [
      [0.5, 2.6, "Phase 2: ask them to accept."],
      [2.8, 5.0, "ACCEPT carries number and value."],
      [5.2, 7.5, "Acceptors tell the learners."],
      [7.7, 10.5, "A majority accepted: it is chosen."],
      [10.7, 12.7, `The learners are told: ${R.v}.`],
    ],
    build(stage) {
      const rig = D7.rig(stage, { proposers: 1, learners: true });
      const outs = NAMES.map((_, k) =>
        D4.wire(rig.svg, {
          pts: [
            [rig.edge.accOut(k).x, rig.edge.accOut(k).y],
            [rig.edge.learnIn.x, rig.edge.learnIn.y],
          ],
          tone: "grey",
          w: 4,
        }),
      );
      const svg = D4.svg(stage);
      const e = NAMES.indexOf(R.down);
      const bolt = svg.appendChild(D4.bolt(rig.pos.acc(e).x + 100, rig.pos.acc(e).y, 64, "red"));
      const num = D4.tag(stage, { x: rig.pos.prop(0).x, y: 430, text: `number ${R.n}, value ${R.v}`, tone: "blue" });
      const count = D4.tag(stage, { x: rig.pos.learn.x, y: 430, text: "ACCEPTED: 0", tone: "grey" });
      const send = NAMES.map(() => D4.packet(stage, { text: `ACCEPT ${R.n}, ${R.v}`, tone: "purple" }));
      const back = NAMES.map(() => D4.packet(stage, { text: "✓", tone: "green" }));

      return (t) => {
        const pk = ramp(t, T.pop, T.pop + 0.5, E.lin);
        rig.prop[0].set({ text: "Proposer", tone: "blue", plain: false, k: pk });
        const told = R.accepted.filter((_, j) => t >= toldAt(j)).length;
        const chosen = told >= R.learned;
        rig.learn.set({
          text: chosen ? `told: ${R.v}` : "Learners",
          tone: chosen ? "green" : "grey",
          plain: false,
          k: ramp(t, T.pop + 0.3, T.pop + 0.8, E.lin),
          s: chosen ? 1 + 0.08 * flash(t, chosenAt, chosenAt + 0.3) : 1,
        });
        num.set({ k: ramp(t, T.pop + 0.4, T.pop + 0.8, E.lin) });
        NAMES.forEach((name, k) => {
          const kk = ramp(t, T.pop + 0.08 * k, T.pop + 0.08 * k + 0.5, E.lin);
          const dead = !UP[k];
          const accepted = UP[k] && t >= acceptedAt(k) - 0.3;
          rig.acc[k].set({
            text: dead ? `${name}: crashed` : accepted ? `${name}: accepted ${R.v}` : `${name}: promised ${R.n}`,
            tone: dead ? "red" : "green",
            plain: false,
            k: kk,
            s: accepted ? 1 + 0.06 * flash(t, acceptedAt(k) - 0.3, acceptedAt(k)) : 1,
          });
          rig.wire[0][k].set({ k: kk, o: dead ? 0.4 : 1 });
          outs[k].set({ k: ramp(t, T.pop + 0.3, T.pop + 0.8, E.lin), o: dead ? 0.4 : 1 });
          const sf = ramp(t, T.send + T.sendStep * k, T.send + T.sendStep * k + T.sendDur, E.lin);
          const p = rig.wire[0][k].at(sf);
          send[k].set({ x: p.x, y: p.y, k: edge(sf) });
          back[k].set({ k: 0 });
          if (UP[k]) {
            const j = R.accepted.indexOf(name);
            const bf = ramp(t, T.back + T.backStep * j, T.back + T.backStep * j + T.backDur, E.lin);
            const q = outs[k].at(bf);
            back[k].set({ x: q.x, y: q.y, k: edge(bf) });
          }
        });
        V.place(bolt, {
          s: 0.5 + 0.5 * E.pop(clamp(ramp(t, T.pop + 0.3, T.pop + 0.6, E.lin))),
          o: ramp(t, T.pop + 0.3, T.pop + 0.6, E.lin),
        });
        count.set({
          k: ramp(t, T.back, T.back + 0.4, E.lin),
          text: chosen ? `chosen: ${R.v}` : `ACCEPTED: ${told}`,
          tone: chosen ? "green" : "grey",
          solid: chosen,
          s: chosen ? 1 + 0.12 * flash(t, chosenAt, chosenAt + 0.3) : 1,
        });
      };
    },
  });
})();
