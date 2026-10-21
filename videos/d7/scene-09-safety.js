/* Lecture 7 (ds-7) · scene 9 (SAFETY): Paxos never changes a value that may already be chosen. If a promise reports a value that
   an acceptor already accepted, the proposer must send the value with the highest number instead of its own (lesson 7.2).
   P1 (number 1, value 7) crashed after A and B accepted 7. P2 (number 2) wants its own 9, prepares the quorum B, C, D; B reports
   the 7 it accepted, C and D report nothing; so P2 must send 7, and C and D accept it: 7 stays chosen. Every report comes from
   D7.SAFE (asserted on load). Colours: blue = a proposer and a value, purple = PREPARE, green = promised and accepted,
   orange = the abandoned 9, red = the crashed P1.
   Story (local seconds): 0.3 the rig pops (A and B already hold 7, P1 crashed); 2.0 P2's number 2 flies to B, C, D; 3.4 their
   replies fly back (B carries 7, C and D nothing); 5.0 "wants 9" is crossed out and "must send 7" pops; 6.6 the value 7 flies to
   B, C, D and C and D accept it; 8.0 "chosen: 7". Hold to the end. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D7 = V.d7;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const S = D7.SAFE;
  const NAMES = D7.ACCS;
  const idx = (list) => list.map((k) => NAMES.indexOf(k));
  const had = idx(S.onlyAB);
  const quorum = idx(S.p2.quorum);
  const rep = (k) => S.p2.reports[NAMES[k]];

  D7.same(
    "safety scene: A and B hold 7, P2 asks B C D, only B reports (1, 7), so P2 sends 7 instead of 9",
    [S.p1, had, quorum, quorum.map((k) => (rep(k) ? rep(k).v : null)), S.p2.own, S.p2.sends],
    [{ n: 1, v: 7 }, [0, 1], [1, 2, 3], [7, null, null], 9, 7],
  );
  const T = { pop: 0.3, prep: 2.0, back: 3.4, wants: 5.0, send: 6.6, step: 0.2, dur: 0.8 };
  const edge = (f) => (f <= 0 || f >= 1 ? 0 : Math.min(1, f * 6, (1 - f) * 6));
  const arr = (t0, k) => t0 + T.step * quorum.indexOf(k) + T.dur;
  // acceptors C and D accept 7; with A and B that is four of five, so the third acceptance after the start settles it
  const chosenAt = arr(T.send, quorum[1]);

  V.scene({
    kicker: "SAFETY",
    title: ["A chosen value", "is never changed"],
    dur: 13,
    caps: [
      [0.5, 3.0, `P1 crashed after A and B accepted ${S.p1.v}.`],
      [3.2, 5.4, `P2 asks B, C, D to promise ${S.p2.n}.`],
      [5.6, 7.9, `B reports the ${S.p1.v} it accepted.`],
      [8.1, 10.6, `So P2 must send ${S.p2.sends}, not its own ${S.p2.own}.`],
      [10.8, 12.7, `${S.p2.sends} stays chosen: it is safe.`],
    ],
    build(stage) {
      const rig = D7.rig(stage, { proposers: 1, learners: false });
      const svg = D4.svg(stage);
      const bolt = svg.appendChild(D4.bolt(rig.pos.prop(0).x + 100, 150, 56, "red"));
      const crash = D4.tag(stage, { x: rig.pos.prop(0).x - 20, y: 150, text: "P1 crashed", tone: "red", solid: true });
      const wants = D4.tag(stage, { x: rig.pos.prop(0).x, y: 424, text: `wants ${S.p2.own}`, tone: "blue" });
      const must = D4.tag(stage, {
        x: rig.pos.prop(0).x,
        y: 488,
        text: `must send ${S.p2.sends}`,
        tone: "blue",
        solid: true,
      });
      const chosen = D4.tag(stage, {
        x: rig.pos.prop(0).x,
        y: 552,
        text: `chosen: ${S.p2.sends}`,
        tone: "green",
        solid: true,
      });
      const top = D4.svg(stage); // above the tags, so the cross sits beside "wants 9"
      const strike = top.appendChild(L5.cross(rig.pos.prop(0).x + 94, 424, 30, "red", { w: 8 }));
      const disc = (text, tone) => D4.disc(stage, { x: 0, y: 0, size: 56, text, tone });
      const keyD = [
        D4.disc(stage, { x: 700, y: 150, size: 56, text: String(S.p1.v), tone: "blue" }),
        D4.disc(stage, { x: 700, y: 300, size: 56, text: "–", tone: "grey" }),
      ];
      const keyL = [
        ["I accepted", `${S.p1.v} already`].map((l, j) =>
          D4.label(stage, { x: 826, y: 134 + 36 * j, text: l, tone: "grey", fs: 30 }),
        ),
        ["nothing", "yet"].map((l, j) => D4.label(stage, { x: 826, y: 284 + 36 * j, text: l, tone: "grey", fs: 30 })),
      ];
      const prepare = quorum.map((k) => ({
        k,
        d: disc(String(S.p2.n), "purple"),
        t0: T.prep + T.step * quorum.indexOf(k),
      }));
      const reply = quorum.map((k) => ({
        k,
        d: disc(rep(k) ? String(rep(k).v) : "–", rep(k) ? "blue" : "grey"),
        t0: T.back + T.step * quorum.indexOf(k),
      }));
      const accept = quorum.map((k) => ({
        k,
        d: disc(String(S.p2.sends), "blue"),
        t0: T.send + T.step * quorum.indexOf(k),
      }));

      return (t) => {
        const pk = ramp(t, T.pop, T.pop + 0.5, E.lin);
        rig.prop[0].set({ text: `P2: number ${S.p2.n}`, tone: "blue", plain: false, k: pk });
        crash.set({ k: ramp(t, T.pop + 0.2, T.pop + 0.6, E.lin) });
        V.place(bolt, {
          s: 0.5 + 0.5 * E.pop(ramp(t, T.pop + 0.3, T.pop + 0.6, E.lin)),
          o: ramp(t, T.pop + 0.3, T.pop + 0.6, E.lin),
        });
        NAMES.forEach((name, k) => {
          const kk = ramp(t, T.pop + 0.08 * k, T.pop + 0.08 * k + 0.5, E.lin);
          const holds = had.includes(k);
          const inQ = quorum.includes(k);
          let text = holds ? `${name}: accepted ${S.p1.v}` : name;
          let at = 0;
          if (inQ && !holds && t >= arr(T.prep, k)) {
            text = `${name}: promised ${S.p2.n}`;
            at = arr(T.prep, k);
          }
          if (inQ && !holds && t >= arr(T.send, k)) {
            text = `${name}: accepted ${S.p2.sends}`;
            at = arr(T.send, k);
          }
          const lit = text !== name;
          rig.acc[k].set({
            text,
            tone: lit ? "green" : "grey",
            plain: false,
            k: kk,
            s: at && t < at + 0.4 ? 1 + 0.06 * flash(t, at, at + 0.3) : 1,
          });
          rig.wire[0][k].set({ k: kk, o: inQ ? 1 : 0.4 });
        });
        prepare.forEach((m) => {
          const f = ramp(t, m.t0, m.t0 + T.dur, E.lin);
          const p = rig.wire[0][m.k].at(f);
          m.d.set({ x: p.x, y: p.y, k: edge(f) });
        });
        reply.forEach((m) => {
          const f = ramp(t, m.t0, m.t0 + T.dur, E.lin);
          const p = rig.wire[0][m.k].at(1 - f);
          m.d.set({ x: p.x, y: p.y, k: edge(f) });
        });
        accept.forEach((m) => {
          const f = ramp(t, m.t0, m.t0 + T.dur, E.lin);
          const p = rig.wire[0][m.k].at(f);
          m.d.set({ x: p.x, y: p.y, k: edge(f) });
        });
        const w = ramp(t, T.pop + 0.6, T.pop + 1.0, E.lin);
        const x = ramp(t, T.wants, T.wants + 0.3, E.lin);
        wants.set({ k: w, tone: x > 0 ? "orange" : "blue" });
        V.place(strike, { s: 0.5 + 0.5 * E.pop(x), o: x });
        must.set({ k: ramp(t, T.wants + 0.4, T.wants + 0.8, E.lin) });
        chosen.set({ k: ramp(t, chosenAt, chosenAt + 0.4, E.lin), s: 1 + 0.12 * flash(t, chosenAt, chosenAt + 0.3) });
        keyD.forEach((d, i) => d.set({ k: ramp(t, T.back + 0.6 * i, T.back + 0.4 + 0.6 * i, E.lin) }));
        keyL.forEach((ls, i) =>
          ls.forEach((l) => l.set({ k: ramp(t, T.back + 0.3 + 0.6 * i, T.back + 0.7 + 0.6 * i, E.lin) })),
        );
      };
    },
  });
})();
