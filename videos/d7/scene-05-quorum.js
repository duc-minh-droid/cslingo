/* Lecture 7 (ds-7) · scene 5 (QUORUM): a quorum is a majority of the acceptors: with five that is three, so two may crash. Any two
   majorities share at least one acceptor, which is what keeps Paxos from choosing two different values (lesson 7.1). Five
   acceptors A to E. First A, B and C answer (a majority of 3 of 5) while D and E crash and the three still agree. Then the picture
   resets and two majorities are outlined, {A, B, C} and {C, D, E}: acceptor C is in both. Every count comes from D7.QUORUM
   (asserted on load). Colours: green = a majority that agrees, red = crashed, purple = the second majority drawn for comparison.
   Story (local seconds): 0.3 five chips pop; 1.0 A, B, C turn green ("quorum: 3 of 5"); 3.0 D and E crash, "2 may crash";
   5.2 everything resets; 5.8 majority {A, B, C} and 6.6 majority {C, D, E} are outlined; 7.6 C turns green ("C is in both");
   8.2 "any two majorities overlap". Hold to the end. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D7 = V.d7;
  const { ramp, flash, ease: E } = V;
  const Q = D7.QUORUM;
  const NAMES = D7.ACCS;
  const IDX = Q.groups.map((g) => g.map((k) => NAMES.indexOf(k)));

  D7.same(
    "quorum scene: five acceptors, three make a quorum, two may crash, the groups are {A,B,C} and {C,D,E} sharing C",
    [Q.n, Q.need, Q.maxDown, IDX, Q.shared],
    [
      5,
      3,
      2,
      [
        [0, 1, 2],
        [2, 3, 4],
      ],
      ["C"],
    ],
  );
  const T = { pop: 0.3, yes: 1.0, yesStep: 0.3, crash: 3.0, reset: 5.2, g1: 5.8, g2: 6.6, shared: 7.6, rule: 8.2 };
  const X0 = 128;
  const Y = 220;
  const H = 84;

  V.scene({
    kicker: "QUORUM",
    title: ["A majority is", "enough"],
    dur: 11.5,
    caps: [
      [0.5, 3.1, `A majority of ${Q.n} is ${Q.need}: a quorum.`],
      [3.2, 5.2, `So ${Q.maxDown} may crash.`],
      [5.6, 8.0, "Two majorities always overlap."],
      [8.2, 10.9, "They share at least one acceptor."],
    ],
    build(stage) {
      const row = D4.chips(stage, { x: X0, y: Y, n: 5, w: 120, h: H, gap: 20, texts: NAMES, fs: 40, tone: "grey" });
      const ringOf = (idx, pad, tone) => {
        const hp = 14; // sideways padding stays inside the 20 px gap between chips
        const a = row.mid(idx[0]).x - 60 - hp;
        const b = row.mid(idx[idx.length - 1]).x + 60 + hp;
        return V.s("rect", {
          x: a,
          y: Y - pad,
          width: b - a,
          height: H + 2 * pad,
          rx: 26,
          fill: "none",
          stroke: D4.tone(tone).c,
          "stroke-width": 7,
        });
      };
      const svg = D4.svg(stage);
      const rings = [svg.appendChild(ringOf(IDX[0], 12, "green")), svg.appendChild(ringOf(IDX[1], 28, "purple"))];
      const bolts = [3, 4].map((i) => svg.appendChild(D4.bolt(row.mid(i).x, row.mid(i).y, 70, "red")));
      const maj = D4.tag(stage, { x: 468, y: 380, text: `quorum: ${Q.need} of ${Q.n}`, tone: "green", solid: true });
      const down = D4.tag(stage, { x: 468, y: 456, text: `${Q.maxDown} may crash`, tone: "red", solid: true });
      const both = D4.tag(stage, { x: row.mid(2).x, y: 376, text: "C is in both", tone: "green", solid: true });
      const rule = D4.tag(stage, { x: 468, y: 520, text: "any two majorities overlap", tone: "purple" });

      return (t) => {
        const phaseA = t < T.reset;
        const cur = (k) => ramp(t, T.pop + 0.1 * k, T.pop + 0.1 * k + 0.5, E.lin);
        row.all((i) => {
          const base = { o: cur(i), s: 0.7 + 0.3 * E.pop(cur(i)) };
          if (phaseA) {
            const yesAt = T.yes + T.yesStep * i;
            if (i < 3)
              return {
                ...base,
                tone: t >= yesAt ? "green" : "grey",
                solid: t >= yesAt,
                s: base.s + 0.12 * flash(t, yesAt, yesAt + 0.3),
              };
            return { ...base, tone: t >= T.crash ? "red" : "grey", solid: t >= T.crash };
          }
          const mark = i === 2 && t >= T.shared;
          return {
            ...base,
            tone: mark ? "green" : "grey",
            solid: mark,
            s: base.s + (mark ? 0.12 * flash(t, T.shared, T.shared + 0.3) : 0),
          };
        });
        maj.set({ k: ramp(t, T.yes + 0.6, T.yes + 1.0, E.lin) * (1 - ramp(t, T.reset - 0.3, T.reset, E.lin)) });
        down.set({ k: ramp(t, T.crash + 0.5, T.crash + 0.9, E.lin) * (1 - ramp(t, T.reset - 0.3, T.reset, E.lin)) });
        bolts.forEach((b, i) => {
          const f = ramp(t, T.crash + 0.15 * i, T.crash + 0.4 + 0.15 * i, E.lin);
          V.place(b, { s: 0.5 + 0.5 * E.pop(f), o: f * (1 - ramp(t, T.crash + 1.1, T.crash + 1.4, E.lin)) });
        });
        rings.forEach((r, i) => {
          const at = i === 0 ? T.g1 : T.g2;
          const k = ramp(t, at, at + 0.5, E.lin);
          V.show(r, k);
          V.place(r, { s: 0.94 + 0.06 * E.pop(k), o: k });
        });
        both.set({ k: ramp(t, T.shared + 0.3, T.shared + 0.7, E.lin) });
        rule.set({ k: ramp(t, T.rule, T.rule + 0.4, E.lin) });
      };
    },
  });
})();
