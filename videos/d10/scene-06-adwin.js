/* Lecture 10 (ds-10) · scene 6 (ADWIN): ADWIN keeps a window of the most recent records whose size it chooses itself: the
   window grows while nothing changes and is cut from the tail (the oldest records) when its parts disagree. Lesson 10.2
   steps 2-3 (growFig: world(5), drift at record 250). Every window size and every cut comes from D10.GROW (the run is made
   once on load); the scene indexes it by the playhead record n. Colours: blue = the window bracket and the window-size line,
   red = errors, the cut and the records it drops, purple = the drift, green = 'grows again', grey = right answers, axes.
   Story (local seconds): 0.3 the plot; 0.8-4.6 records 0 -> 250, the window grows with them; 4.6-6.4 the drift, errors bunch
   up (250 -> 295); 6.6 the first cut drops the 40 oldest; 7.6-8.6 more cuts down to 125 at record 334; 9.4-11.2 the window
   grows again to record 450. Hold to 12. */
(function () {
  const V = window.VID;
  const D10 = V.d10;
  const D9 = V.d9;
  const D4 = V.d4;
  const { ramp, flash, lerp, ease: E } = V;
  const G = D10.GROW;
  const C0 = G.first;
  // the playhead: [t0, t1, record at t0, record at t1] (E.lin inside each piece)
  const SEGS = [
    [0.8, 4.6, 0, G.at],
    [4.6, 6.4, G.at, C0.n - 1],
    [6.6, 7.6, C0.n, C0.n],
    [7.6, 8.6, C0.n, G.low.n],
    [9.4, 11.2, G.low.n, G.n],
  ];
  const nOf = (t) => {
    let n = 0;
    SEGS.forEach(([t0, t1, n0, n1]) => {
      if (t >= t0) n = t >= t1 ? n1 : lerp(n0, n1, (t - t0) / (t1 - t0));
    });
    return Math.floor(n + 1e-9);
  };
  const tOf = (n) => {
    const s = SEGS.find((q) => q[3] >= n);
    return n <= s[2] ? s[0] : s[0] + ((n - s[2]) / (s[3] - s[2])) * (s[1] - s[0]);
  };
  const tail = (n) => (n > 0 ? n - G.win[n - 1] : 0); // first record still in the window after record n
  const FALL = (c) => (c === C0 ? 0.8 : 0.5); // how long the dropped records take to fall
  const CUTS = G.cuts.map((c) => ({ ...c, t: tOf(c.n), a: tail(c.n - 1), b: tail(c.n) }));
  D10.same(
    "adwin scene: drift at 250, first cut at 296 (40 dropped, window 256), lowest 125 at 334, only 1-record trims later",
    [
      G.at,
      C0.n,
      C0.drop,
      C0.win,
      G.low.n,
      G.low.win,
      CUTS[0].b - CUTS[0].a,
      CUTS.filter((c) => c.n > G.low.n && c.drop > 1).length,
    ],
    [250, 296, 40, 256, 334, 125, 40, 0],
  );

  V.scene({
    kicker: "ADWIN",
    title: ["A window that grows,", "then is cut"],
    dur: 12,
    caps: [
      [0.4, 2.4, "ADWIN keeps a window of the most recent records."],
      [2.6, 4.4, "Nothing changes, so the window keeps growing."],
      [4.8, 6.4, `A drift at record ${G.at}: errors bunch up.`],
      [6.6, 8.2, `Record ${C0.n}: its parts disagree. Cut the ${C0.drop} oldest.`],
      [8.7, 9.8, `It keeps cutting: ${G.low.win} records left at record ${G.low.n}.`],
      [10, 11.8, "Calm again, so the window grows again."],
    ],
    build(stage) {
      const p = D9.plot(stage, {
        x: 12,
        y: 12,
        w: 912,
        h: 616,
        xr: [0, G.n],
        yr: [0, 320],
        xticks: [0, G.at, G.n],
        yticks: [0, 100, 200, 300],
        xlab: "record",
        ylab: "window size",
        pad: { t: 126 },
        marks: 2,
        dots: 4,
        texts: 2,
      });
      const strip = D10.strip(p.svg, { x0: p.lx(0), x1: p.lx(G.n), r1: G.n, y: 66, h: 40, groups: 10 });
      const bracket = D10.span(p.svg);
      const winTag = D4.tag(stage, { x: 300, y: 220, text: "window: 0", tone: "blue", fs: 30 });
      const cutTag = D4.tag(stage, { x: 770, y: 226, text: `cut ${C0.drop} oldest`, tone: "red", solid: true });
      const growTag = D4.tag(stage, { x: 760, y: 300, text: "grows again", tone: "green", solid: true });
      const pts = G.win.map((v, i) => [i + 1, v]);

      return (t) => {
        const kp = ramp(t, 0.3, 0.8, E.lin);
        const n = nOf(t);
        // cuts whose dropped records are still falling, newest first
        const active = CUTS.filter((c) => c.n <= n && t < c.t + FALL(c)).reverse();
        const groups = active.map((c) => {
          const k = E.inOut(ramp(t, c.t, c.t + FALL(c), E.lin));
          return { a: c.a, b: c.b, err: "red", ok: "red", dy: 14 * k, o: 1 - 0.75 * k };
        });
        groups.push({ a: 0, b: tail(n), err: "red", ok: "grey", o: 0.25, dy: 14 }); // already dropped
        strip.set({ xs: G.xs, to: n, o: kp, groups });
        const slide = active.reduce((s, c) => s + c.drop * (1 - E.inOut(ramp(t, c.t, c.t + FALL(c), E.lin))), 0);
        bracket.set({ x1: strip.x(tail(n) - slide), x2: strip.x(n), y: 50, h: 14, tone: "blue", w: 6, o: kp });

        const kd = ramp(t, 4.6, 5.0, E.out);
        const k1 = ramp(t, 6.6, 6.9, E.out);
        const kl = ramp(t, 8.6, 8.9, E.out);
        const dots = [];
        if (k1 > 0) dots.push({ at: [C0.n, C0.win], tone: "red", r: 12, s: E.pop(k1) });
        if (kl > 0) dots.push({ at: [G.low.n, G.low.win], tone: "blue", r: 11, hollow: true, s: E.pop(kl) });
        p.update({
          k: kp,
          axes: kp,
          curves: [{ pts: pts.slice(0, n), tone: "blue", w: 6 }],
          marks: [{ x: G.at, tone: "purple", w: 5, k: kd }],
          texts:
            kd > 0
              ? [{ at: [G.at + 4, 300], text: "drift", tone: "purple", anchor: "start", o: Math.min(1, kd * 2) }]
              : [],
          dots,
        });
        const cutNow = flash(t, 6.6, 7.2);
        winTag.set({
          text: `window: ${n > 0 ? G.win[n - 1] : 0}`,
          tone: t >= 6.6 && t < 7.2 ? "red" : "blue",
          k: ramp(t, 0.8, 1.2, E.lin),
          s: 1 + 0.12 * cutNow,
        });
        cutTag.set({ k: ramp(t, 6.75, 7.1, E.lin) });
        growTag.set({ k: ramp(t, 10.6, 11.0, E.lin), s: 1 + 0.06 * flash(t, 10.9, 11.3) });
      };
    },
  });
})();
