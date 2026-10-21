/* Lecture 7 (ds-7) · scene 8 (TWO PROPOSERS): two proposers can collide. The bigger number wins: an acceptor that has promised
   2 ignores a later ACCEPT numbered 1, so the proposer with the older number cannot get a majority and must retry with a higher
   number (lesson 7.2). P1 (number 1, value 7) prepares A, B, C; then P2 (number 2, value 9) prepares B, C, D, E. P1's ACCEPT
   reaches A (accepts 7) but B and C ignore it; P2's ACCEPT is accepted by B to E, a majority, so 9 is chosen; P1 retries with
   number 3. Every set comes from D7.DUEL (asserted on load). Colours: blue = a proposer and a value, purple = a PREPARE number,
   green = promised, accepted, chosen, red = ignored, orange = the retry.
   Story (local seconds): 0.3 the rig pops; 1.0 P1's number 1 flies to A, B, C; 3.0 P2's number 2 flies to B, C, D, E; 5.4 P1's
   value 7 flies to A, B, C: A accepts, B and C ignore it (crosses), "no quorum" under P1; 7.4 P2's value 9 flies to B to E, all four
   accept, "chosen: 9"; 10.2 P1 turns orange: "retry: number 3". Hold to the end. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D7 = V.d7;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const D = D7.DUEL;
  const NAMES = D7.ACCS;
  const idx = (list) => list.map((k) => NAMES.indexOf(k));
  const first = idx(D.promisedFirst); // P1's PREPARE 1 targets (they promise 1)
  const second = idx(D.promised2); // P2's PREPARE 2 targets
  const acc1 = idx(D.accepted1); // accept P1's value
  const ign1 = idx(D.ignored); // ignore it (they promised 2)
  const acc2 = idx(D.accepted2);

  D7.same(
    "duel scene: P1 number 1 value 7, P2 number 2 value 9, who promised, accepted and ignored, the winner and the retry",
    [D.p1, D.p2, first, second, acc1, ign1, acc2, D.won, D.retry.n],
    [{ n: 1, v: 7 }, { n: 2, v: 9 }, [0, 1, 2], [1, 2, 3, 4], [0], [1, 2], [1, 2, 3, 4], 2, 3],
  );
  const T = { pop: 0.3, p1prep: 1.0, p2prep: 3.0, p1acc: 5.4, p2acc: 7.4, step: 0.2, dur: 0.8, retry: 10.2 };
  const edge = (f) => (f <= 0 || f >= 1 ? 0 : Math.min(1, f * 6, (1 - f) * 6));
  const arr = (t0, list, k) => t0 + T.step * list.indexOf(k) + T.dur; // when the message to acceptor k arrives
  // the third acceptance makes it chosen
  const chosenAt = [...acc2].map((k) => arr(T.p2acc, acc2, k)).sort((a, b) => a - b)[D7.QUORUM.need - 1];

  V.scene({
    kicker: "TWO PROPOSERS",
    title: ["The bigger number", "wins"],
    dur: 14,
    caps: [
      [0.5, 2.7, "Two proposers can collide."],
      [2.9, 4.9, `P1 asks A, B, C to promise ${D.p1.n}.`],
      [5.1, 7.1, `P2 asks B to E to promise ${D.p2.n}.`],
      [7.3, 9.5, "B and C ignore the older number."],
      [9.7, 11.7, `P2 has a majority: ${D.p2.v} is chosen.`],
      [11.9, 13.8, `P1 must retry with ${D.retry.n}.`],
    ],
    build(stage) {
      const rig = D7.rig(stage, { proposers: 2, learners: false });
      const svg = D4.svg(stage);
      const disc = (text, tone) => D4.disc(stage, { x: 0, y: 0, size: 56, text, tone });
      const crosses = [1, 2].map((k) =>
        svg.appendChild(L5.cross(rig.pos.acc(k).x + 106, rig.pos.acc(k).y, 30, "red", { w: 8 })),
      );
      const noQ = D4.tag(stage, { x: rig.pos.prop(0).x, y: 250, text: "no quorum", tone: "red", solid: true });
      const retryTag = D4.tag(stage, { x: rig.pos.prop(0).x, y: 250, text: "retry", tone: "orange", solid: true });
      const chosen = D4.tag(stage, {
        x: rig.pos.prop(1).x,
        y: 590,
        text: `chosen: ${D.p2.v}`,
        tone: "green",
        solid: true,
      });
      const keyD = [
        D4.disc(stage, { x: 700, y: 150, size: 56, text: "1", tone: "purple" }),
        D4.disc(stage, { x: 700, y: 300, size: 56, text: String(D.p1.v), tone: "blue" }),
      ];
      const keyL = [
        ["PREPARE", "a number"].map((l, j) =>
          D4.label(stage, { x: 820, y: 134 + 36 * j, text: l, tone: "grey", fs: 30 }),
        ),
        ["ACCEPT", "a value"].map((l, j) =>
          D4.label(stage, { x: 820, y: 284 + 36 * j, text: l, tone: "grey", fs: 30 }),
        ),
      ];
      // the flying messages: [proposer, acceptor, start time, disc]
      const msgs = [
        ...first.map((k) => ({ p: 0, k, t0: T.p1prep + T.step * first.indexOf(k), d: disc(String(D.p1.n), "purple") })),
        ...second.map((k) => ({
          p: 1,
          k,
          t0: T.p2prep + T.step * second.indexOf(k),
          d: disc(String(D.p2.n), "purple"),
        })),
        ...first.map((k) => ({ p: 0, k, t0: T.p1acc + T.step * first.indexOf(k), d: disc(String(D.p1.v), "blue") })),
        ...second.map((k) => ({ p: 1, k, t0: T.p2acc + T.step * second.indexOf(k), d: disc(String(D.p2.v), "blue") })),
      ];

      return (t) => {
        const pk = ramp(t, T.pop, T.pop + 0.5, E.lin);
        const retried = t >= T.retry;
        rig.prop[0].set({
          text: retried ? `P1: number ${D.retry.n}` : `P1: number ${D.p1.n}`,
          tone: retried ? "orange" : "blue",
          plain: false,
          k: pk,
          s: retried ? 1 + 0.08 * flash(t, T.retry, T.retry + 0.3) : 1,
        });
        rig.prop[1].set({ text: `P2: number ${D.p2.n}`, tone: "blue", plain: false, k: pk });
        NAMES.forEach((name, k) => {
          const kk = ramp(t, T.pop + 0.08 * k, T.pop + 0.08 * k + 0.5, E.lin);
          const a2 = acc2.includes(k) ? arr(T.p2acc, acc2, k) : Infinity;
          const a1 = acc1.includes(k) ? arr(T.p1acc, first, k) : Infinity;
          const pr2 = second.includes(k) ? arr(T.p2prep, second, k) : Infinity;
          const pr1 = first.includes(k) ? arr(T.p1prep, first, k) : Infinity;
          let text = name;
          if (t >= a2) text = `${name}: accepted ${D.p2.v}`;
          else if (t >= a1) text = `${name}: accepted ${D.p1.v}`;
          else if (t >= pr2) text = `${name}: promised ${D.p2.n}`;
          else if (t >= pr1) text = `${name}: promised ${D.p1.n}`;
          const lit = text !== name;
          const at = Math.min(a2, a1, pr2, pr1);
          rig.acc[k].set({
            text,
            tone: lit ? "green" : "grey",
            plain: false,
            k: kk,
            s: lit && t < at + 0.4 ? 1 + 0.06 * flash(t, at, at + 0.3) : 1,
          });
          rig.wire[0][k].set({ k: kk });
          rig.wire[1][k].set({ k: kk });
        });
        msgs.forEach((m) => {
          const f = ramp(t, m.t0, m.t0 + T.dur, E.lin);
          const p = rig.wire[m.p][m.k].at(f);
          m.d.set({ x: p.x, y: p.y, k: edge(f) });
        });
        ign1.forEach((k, i) => {
          const at = arr(T.p1acc, first, k);
          const c = ramp(t, at, at + 0.25, E.lin);
          V.place(crosses[i], { s: 0.5 + 0.5 * E.pop(c), o: c * (1 - ramp(t, T.p2acc, T.p2acc + 0.4, E.lin)) });
        });
        const noQAt = Math.max(...first.map((k) => arr(T.p1acc, first, k)));
        noQ.set({ k: ramp(t, noQAt + 0.1, noQAt + 0.5, E.lin) * (1 - ramp(t, T.retry - 0.3, T.retry, E.lin)) });
        retryTag.set({ k: ramp(t, T.retry + 0.3, T.retry + 0.7, E.lin) });
        chosen.set({ k: ramp(t, chosenAt, chosenAt + 0.4, E.lin), s: 1 + 0.12 * flash(t, chosenAt, chosenAt + 0.3) });
        keyD.forEach((d, i) => d.set({ k: ramp(t, 0.8 + 0.2 * i, 1.2 + 0.2 * i, E.lin) }));
        keyL.forEach((ls, i) => ls.forEach((l) => l.set({ k: ramp(t, 1.0 + 0.2 * i, 1.4 + 0.2 * i, E.lin) })));
      };
    },
  });
})();
