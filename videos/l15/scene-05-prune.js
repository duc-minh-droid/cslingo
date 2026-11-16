/* Lecture 15 video, scene 05-prune: lesson 15.2's twelve archive members a..l (L15.P12) pruned to a cap of six by crowding
   distance (L15.PRUNE): the ends a and l get infinity; remove the smallest distance, recompute, repeat. Removed in order
   j 0.13, f 0.17, c 0.19, k 0.34, g 0.46, b 0.50; kept a d e h i l.
   Layout (stage px): L15.plot x 12, y 12, 600 x 616; right panel x 636..924: stats 'archive' (y 12) and 'cap' (y 104), the
   label 'removed' (y 210) and six grey chips (2 rows of 3, 88 x 70, from y 256) that fill in the removal order.
   Story (local seconds): 0.3 plot, 0.6 twelve green members; 1.4 the stats (12 and 6); 3.2 a and l ringed with orange '∞'
   tags (until 5.8); removals at 5.8 / 7.4 / 9.2 / 10.1 / 11.0 / 11.9: ring and orange value tag, +0.4 red cross, +0.6 count drops and
   the chip fills, +0.6..1.0 the member fades; 12.6 the green line through the six kept; hold to 15. */
VID.scene({
  kicker: "PRUNING",
  title: ["Too many? Drop", "the most crowded"],
  dur: 15,
  caps: [
    [0.5, 3.0, "Twelve archive members, but the cap is six."],
    [3.2, 5.6, "The two ends, a and l, get infinite crowding distance: always kept."],
    [5.8, 9.0, "Remove the most crowded, j at 0.13, then recompute: f goes next."],
    [9.2, 12.4, "Then c, k, g and b, one at a time."],
    [12.6, 14.8, "Six spread-out members are left, ends included."],
  ],
  build(stage, V) {
    const L13 = V.l13;
    const L15 = V.l15;
    const { ramp } = V;
    const S = L15.P12;
    const OUT = L15.PRUNE.out;
    const VAL = OUT.map(([, d]) => d.toFixed(2));
    L15.same(VAL, ["0.13", "0.17", "0.19", "0.34", "0.46", "0.50"], "scene 5: crowding at removal");
    const T = [5.8, 7.4, 9.2, 10.1, 11.0, 11.9];
    const when = {};
    OUT.forEach(([i], n) => (when[i] = n));
    const ENDS = ["a", "l"].map((k) => S.ids.indexOf(k));
    const pl = L15.plot(stage, { dots: 12, lines: 1 });
    const size = L13.stat(stage, { x: 636, y: 12, w: 288, h: 80, label: "archive", tone: "green" });
    const cap = L13.stat(stage, { x: 636, y: 104, w: 288, h: 80, label: "cap", tone: "orange" });
    const head = L13.label(stage, { x: 636, y: 210, w: 288, text: "removed", bold: true });
    const chips = OUT.map(([i], n) =>
      L13.chip(stage, { x: 646 + (n % 3) * 96, y: 256 + Math.floor(n / 3) * 86, w: 80, h: 70, text: S.ids[i], fs: 36 }),
    );
    const inf = ENDS.map(() => L13.tag(stage, { text: "∞", tone: "orange", solid: true, fs: 32 }));
    const val = L13.tag(stage, { text: "", tone: "orange", solid: true });
    const kept = L15.PRUNE.keep.map((i) => S.P[i]).sort((a, b) => a[0] - b[0]);
    // label offsets so the clumps stay readable (b c d left, i j k below)
    const LD = { b: [-22, 10], c: [-22, 12], d: [-22, 14], i: [-6, 48], j: [-2, 48], k: [6, 48] };

    return (t) => {
      const n = T.filter((x) => t >= x).length - 1; // current removal
      pl.update({
        k: ramp(t, 0.1, 0.4),
        dots: S.ids.map((id, i) => {
          const r = when[i];
          const t0 = r == null ? 99 : T[r];
          return {
            at: S.P[i],
            tone: t >= t0 + 0.4 ? "red" : "green",
            r: 12,
            k: L13.seq(t, 0.6, 0.06, 0.4, i),
            o: 1 - ramp(t, t0 + 0.6, t0 + 1.0),
            cross: ramp(t, t0 + 0.4, t0 + 0.7),
            ring: (t >= t0 && t < t0 + 1.0) || (ENDS.includes(i) && t >= 3.2 && t < 5.6),
            lab: id,
            ldx: (LD[id] || [20])[0],
            ldy: (LD[id] || [0, -14])[1],
          };
        }),
        lines: [{ pts: kept, tone: "green", k: ramp(t, 12.6, 13.6), w: 5 }],
      });
      const gone = T.filter((x) => t >= x + 0.6).length;
      size.set({ k: ramp(t, 1.4, 1.8), text: String(12 - gone), bump: V.flash(t, 12.6, 13.2) });
      cap.set({ k: ramp(t, 1.6, 2.0), text: "6" });
      head.set({ k: ramp(t, 5.6, 6.0) });
      chips.forEach((c, j) =>
        c.set({
          k: ramp(t, 5.6, 6.0),
          text: t >= T[j] + 0.6 ? S.ids[OUT[j][0]] : "",
          tone: t >= T[j] + 0.6 ? "red" : "grey",
          ghost: t < T[j] + 0.6,
        }),
      );
      ENDS.forEach((i, j) => {
        const [x, y] = pl.pt(S.P[i]);
        inf[j].set({ k: ramp(t, 3.4, 3.8) * (1 - ramp(t, 5.4, 5.8)), x: x + (j ? -70 : 26), y: y + (j ? -78 : -20) });
      });
      if (n >= 0 && t < T[n] + 1.0) {
        const [x, y] = pl.pt(S.P[OUT[n][0]]);
        val.set({ k: ramp(t, T[n], T[n] + 0.3), text: VAL[n], x: x + 24, y: y - 74 });
      } else val.set({ k: 0 });
    };
  },
});
