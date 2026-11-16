/* Lecture 15 video, scene 08-many: lesson 15.3's many-objective trouble. Around one point (blue), with two objectives (both
   minimised) a quarter of the space is better on both (green, it dominates the point), a quarter worse on both (red), and
   the other half is neither (grey): mutually non-dominating. Only 2 / 2^M of the space is comparable (L15.SHARE): 1/2,
   1/4, 1/8, 1/32 for 2, 3, 4 and 6 objectives, so with many objectives almost everything is non-dominated.
   Layout (stage px): left square 430 x 430 at (24, 60) split into four quadrants with 28 px labels; right: the label
   'share you can compare' (x 488..924, y 40) and four bar rows (y 120 + 100 i): '2 goals' etc. (x 488, 130 wide), a grey
   track 190 wide at x 620 with a green part share x 190, and the fraction (x 828); a solid orange tag at the bottom.
   Story (local seconds): 0.3 square and point, 0.9 green quadrant, 1.7 red quadrant; 3.4 the two grey quadrants; 6.0 bar
   rows every 0.8 s (green parts grow 0.5 s); 9.6 the orange tag 'almost everything is non-dominated'; hold to 14. */
VID.scene({
  kicker: "MANY OBJECTIVES",
  title: ["When almost", "nothing dominates"],
  dur: 14,
  caps: [
    [0.5, 3.2, "Around a point, a quarter of space is better on both goals, a quarter worse."],
    [3.4, 5.8, "The other half is neither: those points cannot be compared."],
    [6.0, 9.4, "Each extra goal halves the share you can compare: 1/32 with six."],
    [9.6, 13.7, "So almost every pair is non-dominated, and dominance stops ranking."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L15 = V.l15;
    const { ramp } = V;
    const M = [2, 3, 4, 6];
    const FR = M.map((m) => `1/${Math.round(1 / L15.SHARE(m))}`);
    L15.same(FR, ["1/2", "1/4", "1/8", "1/32"], "scene 8: comparable shares");
    const SQ = { x: 24, y: 60, s: 430 };
    const h = SQ.s / 2;
    const svg = V.l5.svg(stage, 936, 640);
    const quad = (qx, qy, tone) => {
      const r = svg.appendChild(
        V.s("rect", { x: SQ.x + qx * h, y: SQ.y + qy * h, width: h, height: h, "stroke-width": 4 }),
      );
      r.style.fill = L13.tone(tone).dim;
      r.style.stroke = L13.tone(tone).c;
      return r;
    };
    // minimised: down-left of the point is better on both
    const Q = [quad(0, 1, "green"), quad(1, 0, "red"), quad(0, 0, "grey"), quad(1, 1, "grey")];
    const dot = svg.appendChild(V.s("circle", { cx: SQ.x + h, cy: SQ.y + h, r: 18, "stroke-width": 4 }));
    dot.style.fill = L13.tone("blue").c;
    dot.style.stroke = L13.tone("blue").lip;
    const qText = [
      ["better\non both", 0, 1, "green"],
      ["worse\non both", 1, 0, "red"],
      ["neither", 0, 0, "grey"],
      ["neither", 1, 1, "grey"],
    ].map(([text, qx, qy, tone]) =>
      L15.card(stage, {
        x: SQ.x + qx * h + 30,
        y: SQ.y + qy * h + (qy ? 110 : 20),
        w: h - 60,
        h: 86,
        text,
        tone,
        fs: 28,
      }),
    );
    const head = L13.label(stage, { x: 488, y: 40, w: 436, text: "share you can compare", bold: true });
    const BAR = { x: 620, w: 190, h: 44 };
    const rows = M.map((m, i) => {
      const y = 120 + 100 * i;
      const lab = L13.label(stage, { x: 488, y: y + 2, w: 130, text: `${m} goals`, align: "left" });
      const track = svg.appendChild(
        V.s("rect", { x: BAR.x, y, width: BAR.w, height: BAR.h, rx: 10, "stroke-width": 3 }),
      );
      track.style.fill = L13.tone("grey").dim;
      track.style.stroke = L13.tone("grey").c;
      const fill = svg.appendChild(V.s("rect", { x: BAR.x, y, height: BAR.h, rx: 10 }));
      fill.style.fill = L13.tone("green").c;
      const val = L13.label(stage, { x: 828, y: y + 2, w: 96, text: FR[i], tone: "green", align: "left" });
      return { lab, track, fill, val, share: L15.SHARE(m) };
    });
    const note = L13.tag(stage, { text: "almost everything is non-dominated", tone: "orange", solid: true, fs: 30 });
    const T = [0.9, 1.7, 3.4, 3.4];

    return (t) => {
      const k0 = ramp(t, 0.3, 0.6);
      Q.forEach((r, i) => r.setAttribute("opacity", (k0 * ramp(t, T[i], T[i] + 0.4)).toFixed(3)));
      dot.setAttribute("opacity", k0.toFixed(3));
      qText.forEach((c, i) => c.set({ k: ramp(t, T[i] + 0.2, T[i] + 0.6) }));
      head.set({ k: ramp(t, 5.8, 6.2) });
      rows.forEach((r, i) => {
        const t0 = 6.0 + 0.8 * i;
        const k = ramp(t, t0, t0 + 0.3);
        r.lab.set({ k });
        r.val.set({ k: ramp(t, t0 + 0.4, t0 + 0.7) });
        r.track.setAttribute("opacity", k.toFixed(3));
        r.fill.setAttribute("width", (BAR.w * r.share * ramp(t, t0 + 0.1, t0 + 0.6, V.ease.out)).toFixed(1));
        r.fill.setAttribute("opacity", k.toFixed(3));
      });
      note.set({ k: ramp(t, 9.6, 10.0), x: 250, y: 560 });
    };
  },
});
