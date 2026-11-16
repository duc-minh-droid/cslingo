/* Lecture 13 video, scene 07-crowding: lesson 13.2's crowding distance on its worked front P..T (L13.W, both minimised).
   The two ends (P and T) get infinity. Each inner point gets the box that reaches out to its two neighbours on the front;
   its crowding distance is the box's width plus height, each as a share of the front's range (Q: 2/8 + 4/8 = 0.75,
   R: 1.00, S: 1.25). Bigger is better: it keeps the front spread out.
   Layout (stage px): plot x 12, y 12, 600 x 616 (0..10 both); right panel x 636..924: the label 'crowding distance' (y 20)
   and five stats P..T (288 x 70, y 70 + 84 i), grey '?' until computed, then orange.
   Story (local seconds): 0.3 plot, green dots and line; 1.8 label and grey stats; 3.0 P and T ringed, 3.4 their '∞';
   5.4 Q's box grows (P..R), 6.4 '0.75'; 8.6 R's box (Q..S), 9.2 '1.00'; 9.6 S's box (R..T), 10.2 '1.25'; 11.2 S ringed,
   its stat pulses, the tag 'most room'; hold to 14. */
VID.scene({
  kicker: "CROWDING DISTANCE",
  title: ["Prefer points with", "room around them"],
  dur: 14,
  caps: [
    [0.5, 2.8, "Inside one front, which points should we keep?"],
    [3.0, 5.2, "The two ends get infinity: they are always kept."],
    [5.4, 8.4, "For Q, draw a box out to its neighbours P and R: 0.75."],
    [8.6, 11.0, "R and S get bigger boxes: 1.00 and 1.25."],
    [11.2, 13.8, "Prefer the biggest box: it keeps the front spread out."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const { ramp, flash } = V;
    const W = L13.W;
    L13.same(W.ids, ["P", "Q", "R", "S", "T"], "scene 7: the front P..T");
    L13.same(W.d.map(L13.fmtD), ["∞", "0.75", "1.00", "1.25", "∞"], "scene 7: crowding distances");
    const span = [W.at.T[0] - W.at.P[0], W.at.P[1] - W.at.T[1]];
    L13.same(
      (W.at.R[0] - W.at.P[0]) / span[0] + (W.at.P[1] - W.at.R[1]) / span[1],
      W.dist("Q"),
      "scene 7: Q's box, width plus height as shares of the range",
    );

    const pl = L13.plot(stage, {
      x: 12,
      y: 12,
      w: 600,
      h: 616,
      xr: [0, 10],
      yr: [0, 10],
      xt: [0, 2, 4, 6, 8, 10],
      yt: [0, 2, 4, 6, 8, 10],
      xl: "f₁ (minimise)",
      yl: "f₂ (minimise)",
      dots: 5,
      lines: 1,
      boxes: 3,
    });
    const head = L13.label(stage, { x: 636, y: 16, w: 288, text: "crowding distance", bold: true });
    const stats = W.ids.map((k, i) =>
      L13.stat(stage, { x: 636, y: 70 + 84 * i, w: 288, h: 70, label: k, tone: "grey" }),
    );
    const room = L13.tag(stage, { x: 0, y: 0, text: "most room", tone: "orange", solid: true });
    const INNER = { Q: ["P", "R", 5.4, 6.4], R: ["Q", "S", 8.6, 9.2], S: ["R", "T", 9.6, 10.2] };
    const ENDS = 3.0;
    const RING = { P: [ENDS, 5.4], T: [ENDS, 5.4], Q: [5.4, 8.6], R: [8.6, 9.6], S: [9.6, 99] };

    return (t) => {
      const shown = (k) => (INNER[k] ? t >= INNER[k][3] : t >= ENDS + 0.4);
      const dots = W.ids.map((k, i) => {
        const [r0, r1] = RING[k];
        return { at: W.P[i], tone: "green", k: L13.seq(t, 0.3, 0.08, 0.4, i), lab: k, ring: t >= r0 && t < r1 };
      });
      const boxes = Object.entries(INNER).map(([k, [a, b, t0]], i) => {
        const next = i < 2 ? Object.values(INNER)[i + 1][2] : 99;
        return {
          a: W.at[a],
          b: W.at[b],
          tone: "orange",
          k: ramp(t, t0, t0 + 0.8),
          o: 1 - 0.75 * ramp(t, next, next + 0.3),
        };
      });
      pl.update({
        k: ramp(t, 0.1, 0.4),
        dots,
        boxes,
        lines: [{ pts: W.P, tone: "green", k: ramp(t, 0.6, 1.4) }],
      });
      head.set({ k: ramp(t, 1.8, 2.2) });
      W.ids.forEach((k, i) => {
        const on = shown(k);
        const t1 = INNER[k] ? INNER[k][3] : ENDS + 0.4;
        stats[i].set({
          k: ramp(t, 1.9 + 0.08 * i, 2.3 + 0.08 * i),
          text: on ? L13.fmtD(W.d[i]) : "?",
          tone: on ? "orange" : "grey",
          bump: flash(t, t1, t1 + 0.5) + (k === "S" ? flash(t, 11.2, 11.8) : 0),
        });
      });
      const [sx, sy] = pl.pt(W.at.S);
      room.set({ k: ramp(t, 11.3, 11.7), x: sx - 70, y: sy + 36 });
    };
  },
});
