/* Lecture 13 video, scene 08-nsga: lesson 13.3's NSGA-II generation on the workshop's 12 candidates (L13.SURV, both
   minimised), N = 6. Six parents (blue: A D E H I L) breed six children (purple: B C F G J K); the 12 are merged and
   non-dominated sorting gives ranks (scene 6's rank colours: 0 green A B C, 1 blue D E F G, 2 purple H J, 3 orange I K, 4 grey L).
   Rank 0 fits whole (3 places); rank 1 has 4 for the last 3 places, so crowding decides: D ∞, G ∞, F 1.33 beat E 1.00.
   The six survivors A B C D F G (two old parents, four children) become the next parents: the best are never lost (elitism).
   Layout (stage px): plot x 12, y 12, 600 x 616 (0..10 both); right panel x 636..924: label 'next N = 6' (y 16), six slots
   (2 x 3 chips 128 x 72 at y 64, 152, 240), status tags at y 350 and 420.
   Story (local seconds): 0.6 parents + '6 parents'; 2.4 children + '6 children'; 4.6 all turn grey, tags swap to
   '12 together'; 6.6 rank colours and lines; 8.6 rank 0 fills slots A B C; 10.6 crowding labels on rank 1, 11.6 E crossed,
   12.0 D G F fill slots; 13.2 the other six crossed, 13.3 'elitism' tag, 14.0 they fade out, survivors turn blue; hold to 17. */
VID.scene({
  kicker: "NSGA-II",
  title: ["Merge, sort,", "keep the best"],
  dur: 17,
  caps: [
    [0.5, 2.2, "NSGA-II starts with N = 6 parents."],
    [2.4, 4.4, "They breed six children."],
    [4.6, 6.4, "Parents and children are merged: 12 in all."],
    [6.6, 8.4, "Non-dominated sorting splits the 12 into ranks."],
    [8.6, 10.4, "Rank 0 fits whole: A, B and C are kept."],
    [10.6, 13.0, "Rank 1 has four for three places: crowding drops E."],
    [13.2, 16.8, "The best always survive to the next generation: elitism."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const { ramp } = V;
    const S = L13.SURV;
    const TONES = ["green", "blue", "purple", "orange", "grey"];
    const R0 = S.inRank(0);
    const R1 = S.inRank(1);
    L13.same([R0.join(""), R1.join(""), L13.N], ["ABC", "DEFG", 6], "scene 8: ranks 0 and 1, N");
    const R1KEEP = R1.filter((k) => k !== "E").sort((a, b) => S.dist(b) - S.dist(a));
    L13.same(R1KEEP, ["D", "G", "F"], "scene 8: crowding keeps D, G, F");
    L13.same([...R0, ...R1KEEP].sort(), L13.KEEP.slice().sort(), "scene 8: the six survivors");
    const KEEP = [...R0, ...R1KEEP];
    const RANKS = [0, 1, 2, 3, 4].map((r) => S.inRank(r).sort((a, b) => S.at[a][0] - S.at[b][0]));

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
      dots: 12,
      lines: 5,
    });
    const RX = 636;
    const head = L13.label(stage, { x: RX, y: 12, w: 288, text: "next N = 6", bold: true });
    const slots = KEEP.map((k, i) =>
      L13.chip(stage, { x: RX + 8 + (i % 2) * 144, y: 64 + Math.floor(i / 2) * 88, w: 128, h: 72, text: "", fs: 38 }),
    );
    const tPar = L13.tag(stage, { x: RX, y: 350, text: "6 parents", tone: "blue", solid: true });
    const tKid = L13.tag(stage, { x: RX, y: 420, text: "6 children", tone: "purple", solid: true });
    const tAll = L13.tag(stage, { x: RX, y: 350, text: "12 together", tone: "grey", solid: true });
    const tEl = L13.tag(stage, { x: RX, y: 350, text: "elitism", tone: "green", solid: true, fs: 34 });
    const LDX = { E: [-18, -16] };
    const fill = (k) => (R0.includes(k) ? 8.8 + 0.25 * R0.indexOf(k) : 12.0 + 0.25 * R1KEEP.indexOf(k));

    return (t) => {
      const grey = ramp(t, 4.8, 5.0);
      const ranked = t >= 6.6;
      const gone = ramp(t, 14.0, 14.6);
      const dots = S.ids.map((k, i) => {
        const parent = L13.PARENTS.includes(k);
        const keep = KEEP.includes(k);
        const r = S.r[i];
        let tone = parent ? "blue" : "purple";
        if (grey > 0.5) tone = "grey";
        if (ranked) tone = TONES[r];
        const showD = r === 1 && t >= 10.6 && t < 14.0;
        const [ldx, ldy] = LDX[k] || [18, -16];
        const out = !keep && (k === "E" ? t >= 11.6 : t >= 13.2);
        const outT = k === "E" ? 11.6 : 13.2 + 0.06 * i;
        if (keep && t >= 14.0) tone = "blue";
        return {
          at: S.P[i],
          tone: out && ramp(t, outT, outT + 0.3) > 0.5 ? "red" : tone,
          k: parent
            ? L13.seq(t, 0.6, 0.08, 0.4, L13.PARENTS.indexOf(k))
            : L13.seq(t, 2.4, 0.08, 0.4, L13.KIDS.indexOf(k)),
          lab: showD ? `${k} ${L13.fmtD(S.d[i])}` : k,
          ldx,
          ldy,
          cross: out ? ramp(t, outT, outT + 0.3) * (1 - gone) : 0,
          o: keep ? 1 : 1 - gone,
          ring: keep && t >= fill(k) && t < 14.0,
        };
      });
      const lines = RANKS.map((ids, r) => ({
        pts: ids.map((k) => S.at[k]),
        tone: TONES[r],
        k: ramp(t, 6.8 + 0.2 * r, 7.6 + 0.2 * r),
        o: ranked ? 1 - gone : 0,
        w: 5,
      }));
      pl.update({ k: ramp(t, 0.1, 0.4), dots, lines });
      head.set({ k: ramp(t, 0.8, 1.2) });
      slots.forEach((c, i) => {
        const k = KEEP[i];
        const on = t >= fill(k);
        c.set({
          k: ramp(t, 0.9 + 0.05 * i, 1.3 + 0.05 * i),
          text: on ? k : "",
          tone: t >= 14.0 ? "blue" : on ? "green" : "grey",
          solid: on,
          ghost: !on,
          bump: 0,
        });
      });
      const sw = ramp(t, 4.6, 5.0);
      tPar.set({ k: ramp(t, 1.0, 1.4) * (1 - sw) });
      tKid.set({ k: ramp(t, 2.8, 3.2) * (1 - sw) });
      tAll.set({ k: ramp(t, 5.0, 5.4) * (1 - ramp(t, 6.6, 6.9)) });
      tEl.set({ k: ramp(t, 13.3, 13.7) });
    };
  },
});
