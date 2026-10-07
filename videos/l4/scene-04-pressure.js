/* Lecture 4 · scene 04, selection pressure: three takeover heat maps (selection only) filled row by row at the same time.
   Story (local seconds): 0.5-1.2 frames and tags pop in, 1.3 row 0, rows 1-7 at 1.9 + (row - 1) * 0.62, 7.0 / 7.3 / 7.6 verdicts. */
(function () {
  const V = window.VID;
  const L4 = V.l4;
  const { ramp, clamp, ease: E } = V;

  const [P, G] = [12, 8];
  const PANELS = [
    { method: "random", label: "random", x: 12, verdict: "too little", tone: "red" },
    { method: "tournament", label: "tournament", x: 336, verdict: "modest", tone: "green" },
    { method: "best", label: "always best", x: 660, verdict: "too much", tone: "red" },
  ];
  const ROWS = Object.fromEntries(PANELS.map((p) => [p.method, L4.takeoverRows(p.method, 4, P, G)]));
  const COUNTS = Object.fromEntries(PANELS.map((p) => [p.method, ROWS[p.method].map((r) => L4.countOf(r, P))]));
  const want = {
    random: [1, 2, 4, 3, 2, 3, 2, 3],
    tournament: [1, 1, 2, 3, 5, 7, 10, 11],
    best: [1, 12, 12, 12, 12, 12, 12, 12],
  };
  for (const k of Object.keys(want)) {
    if (COUNTS[k].join() !== want[k].join())
      throw new Error(`pressure scene: ${k} counts ${COUNTS[k]} differ from the lecture`);
  }

  const rowAt = (g) => (g === 0 ? 1.3 : 1.9 + (g - 1) * 0.62);
  const shownAt = (t) => {
    let s = 0;
    for (let g = 0; g < G; g++) if (t > rowAt(g)) s = g + clamp((t - rowAt(g)) / 0.4);
    return s;
  };
  const pop = (k, dy = 10) => ({ s: 0.8 + 0.2 * E.pop(k), y: (1 - E.out(k)) * dy, o: clamp(k * 3) });

  V.scene({
    kicker: "SELECTION PRESSURE",
    title: ["Too little: no progress", "Too much: stuck early"],
    dur: 11,
    caps: [
      [1.0, 3.4, "Each row is a generation. Orange is the best."],
      [3.6, 6.8, "Only selection acts: no mutation, no crossover."],
      [7.2, 10.5, "Too little: no progress. Too much: stuck early."],
    ],
    build(stage) {
      const parts = PANELS.map((p) => ({
        p,
        hm: L4.heat(stage, { x: p.x, y: 70, cols: P, rows: G, cw: 22, ch: 44, gap: 2 }),
        name: L4.tag(stage, { x: p.x + 132, y: 12, text: p.label, tone: "grey", anchor: "c" }),
        count: L4.tag(stage, { x: p.x + 132, y: 444, text: "1 / 12", tone: "orange", anchor: "c" }),
        verdict: L4.tag(stage, { x: p.x + 132, y: 520, text: p.verdict, tone: p.tone, solid: true, anchor: "c" }),
      }));
      return (t) => {
        const shown = shownAt(t);
        const g = clamp(Math.floor(shown + 0.5) - 1, 0, G - 1);
        parts.forEach(({ p, hm, name, count, verdict }, i) => {
          const k = ramp(t, 0.5 + i * 0.08, 1.0 + i * 0.08, E.lin);
          V.place(hm.el, pop(k, 14));
          hm.update({ vals: ROWS[p.method], best: P, shown: t < 1.3 ? 0 : shown, o: clamp(k * 3) });
          name.set(pop(k, 8));
          const kc = ramp(t, 1.3, 1.7, E.lin);
          count.set({ ...pop(kc, 8), text: `${COUNTS[p.method][g]} / ${P}` });
          const kv = ramp(t, 7.0 + i * 0.3, 7.4 + i * 0.3, E.lin);
          verdict.set({ ...pop(kv, 10), s: 0.7 + 0.3 * E.pop(kv) });
        });
      };
    },
  });
})();
