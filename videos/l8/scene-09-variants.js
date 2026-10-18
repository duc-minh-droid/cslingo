/* Lecture 8 video, scene 9: variants. The variants change WHO adds trail after a round: every ant (Ant System), only the
   best 3 (Elitist rank), only the best 1 (Max-Min). Fewer depositors pile the trail onto the best round (focus) but make it
   likelier that a run gets stuck on a poor round. The six ants' tour lengths are the lesson's (L8.WHO); the two bar charts
   are 40 real simulated runs per rule, 20 rounds each (L8.VAR, run and asserted in l8/common-2.js, asserted again here).
   Story (local seconds): 0.3-1.6 the header, six ants and three rows of grey tour-length chips (the same six in every row);
   3.2 the key (green = adds trail, dashed = adds no trail); 3.4 / 4.3 / 5.1 WHO DEPOSITS: each row's rule tag pops and its
   chips turn green (a depositor) or dashed (does not add), the shortest tours first; 6.6-7.0 the chips fade; 6.9 the header
   becomes '40 runs, 20 rounds each'; 7.0 SHARE: the blue legend and the three blue bars (53, 90, 97 %); 9.6 STUCK: the red
   legend and the three red bars (3, 5, 17 of 40). 10.7-12.5 hold. */
VID.scene({
  kicker: "VARIANTS",
  title: ["Who gets to", "add trail?"],
  dur: 12.5,
  caps: [
    [0.5, 3.0, "Six ants finish. Which of them add trail?"],
    [3.4, 6.6, "Ant System: all. Elitist rank: best 3. Max-Min: best 1."],
    [7.0, 9.5, "Fewer depositors pile trail on the best round."],
    [9.9, 12.3, "But more runs get stuck on a poor round."],
  ],
  build(stage, V) {
    const L8 = V.l8;
    const L5 = V.l5;
    const { ramp, flash, ease: E } = V;

    // ---- the data (computed and asserted in l8/common-2.js), asserted again here
    const { lens, rules } = L8.WHO;
    const VAR = L8.VAR;
    L8.same(lens, [48, 52, 55, 60, 71, 80], "scene 9: the six ants' tour lengths");
    L8.same(
      lens,
      [...lens].sort((a, b) => a - b),
      "scene 9: tours are listed shortest first, so the first n chips are the best n",
    );
    L8.same(
      rules.map((r) => r.n),
      [lens.length, 3, 1],
      "scene 9: depositors per rule (all six, best 3, best 1)",
    );
    L8.same(
      VAR.map((v) => v.id),
      rules.map((r) => r.id),
      "scene 9: one result per rule",
    );
    L8.same(
      VAR.map((v) => L8.pct(v.share)),
      [53, 90, 97],
      "scene 9: trail on the best round, %",
    );
    L8.same(
      VAR.map((v) => v.stuck),
      [3, 5, 17],
      "scene 9: runs stuck on a poor round, of 40",
    );
    // the typed words on screen (40 runs, 20 rounds, over 116 km) are re-derived by running the colonies again (about 50 ms)
    const RUNS = 40;
    const ROUNDS = 20;
    const POOR = 116;
    const again = rules.map(({ id }) =>
      Array.from({ length: RUNS }, (_, s) =>
        L8.colony(s + 1, { ants: 10, alpha: 1, beta: 1, rho: 0.5, Q: 100, mode: id }, ROUNDS),
      ),
    );
    L8.same(
      again.map((runs) => runs.filter((S) => S.best.len > POOR).length),
      [3, 5, 17],
      `scene 9: runs whose best round is over ${POOR} km`,
    );
    L8.same(
      again.map((runs) => L8.pct(runs.reduce((a, S) => a + S.hist[ROUNDS - 1].share, 0) / RUNS)),
      [53, 90, 97],
      "scene 9: mean trail on the best round after the last round, %",
    );
    L8.same(L8.TEN.opt < POOR && POOR - L8.TEN.opt < 2, true, "scene 9: 116 km sits just above the shortest round");
    const NAMES = ["Ant System · all", "Elitist rank · best 3", "Max-Min · best 1"];
    const HEAD1 = "tour length, km · shortest is best";
    const HEAD2 = `${RUNS} runs, ${ROUNDS} rounds each`;

    // ---- timeline (local seconds)
    const T = {
      head: 0.3,
      ants: 0.35, // six ants, 0.06 s apart
      chips: 0.5, // 18 chips, 0.04 s apart, row by row
      key: 3.2,
      rows: [3.4, 4.3, 5.1], // each rule tag pops, then its chips turn green or dashed
      switchAfter: 0.2, // chips switch this long after the tag, 0.06 s apart
      clear: [6.6, 7.0], // chips, ants and key fade out
      head2: 6.9,
      blueLegend: 7.0,
      blue: 7.1, // three bars, 0.25 s apart
      redLegend: 9.6,
      red: 9.7,
    };
    const GROW = 0.6; // a bar grows for this long

    // ---- layout: three rows centred on Y(i); rule tags left, chips and bars right
    const Y = (i) => 168 + 134 * i;
    const CX = (k) => 350 + 94 * k; // left edge of chip k
    const head = L8.tag(stage, { x: 350, y: 12, text: HEAD1, tone: "grey" });
    const svg = L5.svg(stage);
    const ants = lens.map(() => svg.appendChild(L8.ant(0, 0, 42)));
    const tags = NAMES.map((name, i) => L8.tag(stage, { x: 12, y: Y(i) - 30, text: name, tone: "grey" }));
    const chips = rules.map((_, i) =>
      lens.map((len, k) =>
        L8.chip(stage, { x: CX(k), y: Y(i) - 38, w: 84, h: 76, text: String(len), tone: "grey", fs: 38 }),
      ),
    );
    const keyOn = L8.chip(stage, {
      x: 12,
      y: 528,
      w: 200,
      h: 58,
      text: "adds trail",
      tone: "green",
      fs: 28,
      radius: 18,
    });
    const keyOff = L8.chip(stage, {
      x: 232,
      y: 528,
      w: 250,
      h: 58,
      text: "adds no trail",
      tone: "grey",
      fs: 28,
      radius: 18,
    });
    const blueBars = rules.map((_, i) =>
      L8.bar(stage, { x: 350, y: Y(i) - 52, w: 560, h: 44, tone: "blue", full: 440 }),
    );
    const redBars = rules.map((_, i) => L8.bar(stage, { x: 350, y: Y(i) + 6, w: 560, h: 44, tone: "red", full: 440 }));
    const legBlue = L8.tag(stage, { x: 12, y: 528, text: "trail on the best round", tone: "blue", solid: true });
    const legRed = L8.tag(stage, {
      x: 392,
      y: 528,
      text: `stuck on a poor round: over ${POOR} km`,
      tone: "red",
      solid: true,
    });

    return (t) => {
      const out = 1 - ramp(t, T.clear[0], T.clear[1], E.lin); // beat 1 pieces fade away together

      // ---- the header: tour lengths, then (after the chips are gone) the size of the experiment
      const second = t >= T.head2;
      head.set({
        text: second ? HEAD2 : HEAD1,
        k: second ? ramp(t, T.head2, T.head2 + 0.4, E.lin) : ramp(t, T.head, T.head + 0.4, E.lin),
        o: second ? 1 : out,
      });

      // ---- the six ants, each over its tour length
      ants.forEach((a, k) => {
        const kk = L8.seq(t, T.ants, 0.06, 0.4, k);
        V.place(a, { x: CX(k) + 42, y: 102, r: 90, s: 0.5 + 0.5 * E.pop(kk), o: Math.min(1, kk * 4) * out });
      });

      // ---- WHO DEPOSITS: the rule tag pops, then each chip turns green (adds trail) or dashed (does not)
      keyOn.set({ k: ramp(t, T.key, T.key + 0.4, E.lin), o: out, solid: true });
      keyOff.set({ k: ramp(t, T.key, T.key + 0.4, E.lin), o: out, ghost: true });
      rules.forEach((r, i) => {
        tags[i].set({ k: ramp(t, T.rows[i], T.rows[i] + 0.4, E.lin) });
        lens.forEach((_, k) => {
          const dep = k < r.n;
          const sw = T.rows[i] + T.switchAfter + 0.06 * k;
          const on = t >= sw;
          const pulse = flash(t, sw, sw + 0.35);
          chips[i][k].set({
            k: L8.seq(t, T.chips, 0.04, 0.4, i * lens.length + k),
            o: out,
            tone: on && dep ? "green" : "grey",
            solid: on && dep,
            ghost: on && !dep,
            s: 1 + (dep ? 0.1 : -0.1) * pulse,
          });
        });
      });

      // ---- SHARE (blue) and STUCK (red): the bars grow and their numbers count up
      legBlue.set({ k: ramp(t, T.blueLegend, T.blueLegend + 0.4, E.lin) });
      legRed.set({ k: ramp(t, T.redLegend, T.redLegend + 0.4, E.lin) });
      VAR.forEach((v, i) => {
        const bt = T.blue + 0.25 * i;
        const bg = ramp(t, bt, bt + GROW, E.out);
        blueBars[i].set({
          k: ramp(t, bt, bt + 0.25, E.lin),
          v: v.share * bg,
          text: bg > 0.02 ? `${Math.round(L8.pct(v.share) * bg)}%` : "",
        });
        const rt = T.red + 0.25 * i;
        const rg = ramp(t, rt, rt + GROW, E.out);
        redBars[i].set({
          k: ramp(t, rt, rt + 0.25, E.lin),
          v: (v.stuck / RUNS) * rg,
          text: rg > 0.02 ? `${Math.round(v.stuck * rg)} of ${RUNS}` : "",
        });
      });
    };
  },
});
