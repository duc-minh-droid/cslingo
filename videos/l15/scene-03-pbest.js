/* Lecture 15 video, scene 03-pbest: lesson 15.1's two pbest rules on one particle's four moves from pbest (5, 5)
   (L15.MOVES, L15.PB). Keep oldest (purple): move only if the new position dominates pbest. Keep newest (orange): move
   unless pbest dominates the new position. Oldest: (5,5) (5,5) (5,5) (4.5,4); newest: (4,6) (4,6) (3.5,5.5) (4.5,4).
   Layout (stage px): L15.plot x 12, y 12, 600 x 616, axes 2..8; right panel x 636..924: purple rule card (y 12, h 136),
   orange rule card (y 160, h 136), then four move rows (y 320 + 76 i): the move's position, a purple and an orange mark
   (tick = that rule's pbest moves, grey minus = it stays).
   Story (local seconds): 0.3 plot, 0.6 both pbest markers on (5, 5) (purple big disc, orange small disc on top), 0.8 and 1.1
   the rule cards; moves at 3.2 / 6.6 / 9.2 / 12.0: the new position pops in blue with its row, 1.0 s later the marks pop
   and the markers glide (0.6 s) to their new places; earlier moves stay as small grey dots; hold to 15. */
VID.scene({
  kicker: "PERSONAL BEST",
  title: ["When should", "pbest move?"],
  dur: 15,
  caps: [
    [0.5, 3.0, "A particle's pbest starts at (5, 5). Lower time and energy are better."],
    [3.2, 6.4, "It moves to (4, 6), a trade-off. Keep oldest stays, keep newest moves."],
    [6.6, 9.0, "(6, 7) is worse on both goals, so neither rule moves."],
    [9.2, 11.8, "(3.5, 5.5) is another trade-off: only keep newest moves."],
    [12.0, 14.7, "(4.5, 4) dominates (5, 5), so now keep oldest moves too."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L15 = V.l15;
    const { ramp, lerp, ease: E } = V;
    const PB = L15.PB;
    L15.same(
      PB.map((s) => [s.mvOld ? 1 : 0, s.mvNew ? 1 : 0].join("")),
      ["01", "00", "01", "11"],
      "scene 3: which rule moves at each step",
    );
    const T = [3.2, 6.6, 9.2, 12.0];
    const ticks = [2, 3, 4, 5, 6, 7, 8];
    const pl = L15.plot(stage, { xr: [2, 8], yr: [2, 8], xt: ticks, yt: ticks, dots: 7 });
    const rules = [
      L15.card(stage, {
        x: 636,
        y: 12,
        w: 288,
        h: 136,
        text: "keep oldest:\nmove only if new\ndominates old",
        tone: "purple",
      }),
      L15.card(stage, {
        x: 636,
        y: 160,
        w: 288,
        h: 136,
        text: "keep newest:\nmove unless old\ndominates new",
        tone: "orange",
      }),
    ];
    const rows = PB.map((s, i) =>
      L13.label(stage, { x: 636, y: 330 + 76 * i, w: 170, text: L15.fmt(s.y), tone: "blue", align: "left", fs: 30 }),
    );
    const svg = V.l5.svg(stage, 936, 640);
    const marks = PB.map((s, i) => {
      const y = 352 + 76 * i;
      return [
        [s.mvOld, 830, "purple"],
        [s.mvNew, 892, "orange"],
      ].map(([mv, x, tone]) => svg.appendChild(mv ? V.l5.tick(x, y, 44, tone) : L13.mark("minus", x, y, 44, "grey")));
    });
    const START = [5, 5];
    const at = (t, key) => {
      let p = START;
      PB.forEach((s, i) => {
        p = [0, 1].map((m) => lerp(p[m], s[key][m], ramp(t, T[i] + 1.0, T[i] + 1.6, E.inOut)));
      });
      return p;
    };

    return (t) => {
      const now = T.filter((x) => t >= x).length - 1;
      const dots = PB.map((s, i) => ({
        at: s.y,
        tone: i === now ? "blue" : "grey",
        r: i === now ? 14 : 9,
        k: ramp(t, T[i], T[i] + 0.4),
        lab: i === now ? L15.fmt(s.y) : "",
        ldx: s.y[0] > 5 ? 20 : -20,
        ldy: s.y[1] < 5 ? 42 : -18,
      }));
      dots.push(
        { at: at(t, "old"), tone: "purple", r: 22, k: ramp(t, 0.6, 1.0) },
        { at: at(t, "neu"), tone: "orange", r: 12, k: ramp(t, 0.7, 1.1) },
      );
      pl.update({ k: ramp(t, 0.1, 0.4), dots });
      rules.forEach((c, i) => c.set({ k: ramp(t, 0.8 + 0.3 * i, 1.2 + 0.3 * i) }));
      rows.forEach((r, i) => r.set({ k: ramp(t, T[i], T[i] + 0.4), bold: i === now }));
      marks.forEach((m, i) => m.forEach((el) => V.place(el, { o: ramp(t, T[i] + 1.0, T[i] + 1.3) })));
    };
  },
});
