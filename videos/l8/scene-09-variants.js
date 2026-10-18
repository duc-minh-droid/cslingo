/* Lecture 8 video, scene 9: variants. The variants change WHO adds trail after an iteration: every ant (Ant System), only the
   best 3 (Elitist rank), only the best 1 (Max-Min style: the lesson's name for 'best ant only'; the real Max-Min Ant System
   also keeps every trail between a minimum and a maximum, which this simple version does not). Fewer depositors pile the
   trail onto the best tour (focus) but make it likelier that a run ends on a poor tour. The six ants' tour lengths are the
   lesson's (L8.WHO); the two bar charts are 40 real simulated runs per rule, 20 iterations each (L8.VAR, run and asserted in
   l8/common-2.js, asserted again here).
   Story (local seconds): 0.3-1.6 the header, six ants and three labelled rows of grey tour-length chips (the same six in every
   row; each row's rule tag pops with its chips, so no row is ever unlabelled); 2.9 the key (green = adds trail, dashed =
   adds no trail); WHO DEPOSITS, one row and one caption each: 3.2 / 5.0 / 6.8 the row's chips turn green (a depositor) or
   dashed (does not add), the shortest tours first; 8.6-9.0 the chips fade; 8.9 the header becomes '40 runs, 20 iterations each'
   next to the yardstick 'shortest tour: 114.5 km'; 9.0 SHARE: the blue legend and the three blue bars (53, 90, 97 %);
   11.5 STUCK: the red legend and the three red bars (3, 5, 17 of 40). 12.9-14 hold. */
VID.scene({
  kicker: "VARIANTS",
  title: ["Who gets to", "add trail?"],
  dur: 14,
  caps: [
    [0.6, 2.8, "Six ants finish. Which of them add trail?"],
    [3.3, 5.0, "Ant System: all ants add trail."],
    [5.1, 6.8, "Elitist rank: only the best 3."],
    [6.9, 8.6, "Max-Min style: only the best 1."],
    [9.0, 11.4, "Fewer depositors pile trail on the best tour."],
    [11.6, 13.7, "But more runs end on a poor tour."],
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
      "scene 9: trail on the best tour, %",
    );
    L8.same(
      VAR.map((v) => v.stuck),
      [3, 5, 17],
      "scene 9: runs ending on a poor tour, of 40",
    );
    // the typed words on screen (40 runs, 20 iterations, over 116 km, shortest 114.5 km) are re-derived by running the colonies again
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
      `scene 9: runs whose best tour is over ${POOR} km`,
    );
    L8.same(
      again.map((runs) => L8.pct(runs.reduce((a, S) => a + S.hist[ROUNDS - 1].share, 0) / RUNS)),
      [53, 90, 97],
      "scene 9: mean trail on the best tour after the last iteration, %",
    );
    L8.same(L8.TEN.opt < POOR && POOR - L8.TEN.opt < 2, true, "scene 9: 116 km sits just above the shortest tour");
    const OPT = L8.TEN.opt.toFixed(1);
    L8.same(OPT, "114.5", "scene 9: the shortest possible tour (km)");
    const NAMES = ["Ant System · all", "Elitist rank · best 3", "Max-Min style · best 1"];
    const HEAD1 = "tour lengths, km · shortest is best";
    const HEAD2 = `${RUNS} runs, ${ROUNDS} iterations each`;

    // ---- timeline (local seconds)
    const T = {
      head: 0.3,
      ants: 0.35, // six ants, 0.06 s apart
      rows: [0.4, 0.75, 1.1], // each row's rule tag pops, then its six chips (0.04 s apart)
      key: 2.9,
      who: [3.2, 5.0, 6.8], // each row's chips turn green or dashed, 0.06 s apart, one caption per row
      clear: [8.6, 9.0], // chips, ants and key fade out
      head2: 8.9,
      blueLegend: 9.0,
      blue: 9.1, // three bars, 0.25 s apart
      redLegend: 11.5,
      red: 11.6,
    };
    const GROW = 0.6; // a bar grows for this long

    // ---- layout: three rows centred on Y(i); rule tags left, chips and bars right
    const Y = (i) => 168 + 134 * i;
    const CX = (k) => 380 + 88 * k; // left edge of chip k
    const head = L8.tag(stage, { x: 380, y: 14, text: HEAD1, tone: "grey" });
    const head2 = L8.tag(stage, { x: 18, y: 14, text: HEAD2, tone: "grey" });
    const yard = L8.tag(stage, { x: 452, y: 14, text: `shortest tour: ${OPT} km`, tone: "grey" });
    const svg = L5.svg(stage);
    const ants = lens.map(() => svg.appendChild(L8.ant(0, 0, 42)));
    const tags = NAMES.map((name, i) => L8.tag(stage, { x: 18, y: Y(i) - 30, text: name, tone: "grey" }));
    const chips = rules.map((_, i) =>
      lens.map((len, k) =>
        L8.chip(stage, { x: CX(k), y: Y(i) - 38, w: 80, h: 76, text: String(len), tone: "grey", fs: 38 }),
      ),
    );
    const keyOn = L8.chip(stage, {
      x: 18,
      y: 528,
      w: 200,
      h: 58,
      text: "adds trail",
      tone: "green",
      fs: 28,
      radius: 18,
    });
    const keyOff = L8.chip(stage, {
      x: 238,
      y: 528,
      w: 250,
      h: 58,
      text: "adds no trail",
      tone: "grey",
      fs: 28,
      radius: 18,
    });
    // a bar is a share of 1, so its track ends at 100 %; a number that fits is written inside the end of its bar
    const BAR = { x: 380, w: 544 };
    const blueBars = rules.map((_, i) =>
      L8.bar(stage, { x: BAR.x, y: Y(i) - 52, w: BAR.w, h: 44, tone: "blue", full: BAR.w }),
    );
    const redBars = rules.map((_, i) =>
      L8.bar(stage, { x: BAR.x, y: Y(i) + 6, w: BAR.w, h: 44, tone: "red", full: BAR.w }),
    );
    const legBlue = L8.tag(stage, { x: 18, y: 528, text: "trail on the best tour", tone: "blue", solid: true });
    const legRed = L8.tag(stage, { x: 386, y: 528, text: `runs ending over ${POOR} km`, tone: "red", solid: true });

    return (t) => {
      const out = 1 - ramp(t, T.clear[0], T.clear[1], E.lin); // beat 1 pieces fade away together

      // ---- the headers: tour lengths, then (after the chips are gone) the size of the experiment and its yardstick
      head.set({ k: ramp(t, T.head, T.head + 0.4, E.lin), o: out });
      head2.set({ k: ramp(t, T.head2, T.head2 + 0.4, E.lin) });
      yard.set({ k: ramp(t, T.head2 + 0.15, T.head2 + 0.55, E.lin) });

      // ---- the six ants, each over its tour length
      ants.forEach((a, k) => {
        const kk = L8.seq(t, T.ants, 0.06, 0.4, k);
        V.place(a, { x: CX(k) + 40, y: 102, r: 90, s: 0.5 + 0.5 * E.pop(kk), o: Math.min(1, kk * 4) * out });
      });

      // ---- WHO DEPOSITS: the rule tag popped with its row; each chip turns green (adds trail) or dashed (does not)
      keyOn.set({ k: ramp(t, T.key, T.key + 0.4, E.lin), o: out, solid: true });
      keyOff.set({ k: ramp(t, T.key, T.key + 0.4, E.lin), o: out, ghost: true });
      rules.forEach((r, i) => {
        tags[i].set({ k: ramp(t, T.rows[i], T.rows[i] + 0.4, E.lin) });
        lens.forEach((_, k) => {
          const dep = k < r.n;
          const sw = T.who[i] + 0.06 * k;
          const on = t >= sw;
          const pulse = flash(t, sw, sw + 0.35);
          chips[i][k].set({
            k: L8.seq(t, T.rows[i] + 0.1, 0.04, 0.4, k),
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
          textIn: true,
        });
        const rt = T.red + 0.25 * i;
        const rg = ramp(t, rt, rt + GROW, E.out);
        redBars[i].set({
          k: ramp(t, rt, rt + 0.25, E.lin),
          v: (v.stuck / RUNS) * rg,
          text: rg > 0.02 ? `${Math.round(v.stuck * rg)} of ${RUNS}` : "",
          textIn: true,
        });
      });
    };
  },
});
