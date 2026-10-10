/* Phase 5 · scene 02-band (12 s): THE CONVEX HULL. Seven pins on a board; a rubber band is stretched loosely round them all (orange),
   then let go: it snaps tight onto the outer pins (green). The pins it touches are the corners of the convex hull; the pins inside
   never touch it. A convex shape keeps every segment between two of its points inside it: three segments are tried, A-D, G-D and
   B-F (the last joins the two INSIDE pins), and every one stays inside the band. The pins are the lesson's own A..G (unlettered
   here, they stay small so the loose band fits); the hull, the inside pins and the "segment stays inside" test all come from A5.
   Story (local seconds): 0.2-1.3 pins, 1.3-2.2 the loose band, 3.6-4.6 snap, 4.6-5.4 corners turn green, 5.5 'convex hull' label,
   5.8 counters, 6.4-8.4 'inside' tags, 8.6 'convex?', 8.7-11.3 the segment test, 11.1 'convex'. */
(function () {
  const V = window.VID;
  const A5 = V.a5;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;
  const snap = (x) => 1 - (1 - x) * (1 - x); // a band pulled tight: fast at first, no overshoot (it cannot pass the pins)

  const P = A5.pos({ x: 186, y: 100, s: 1.55 });
  const HULL = A5.HULL;
  const INSIDE = A5.INSIDE;
  const CHORDS = [
    ["A", "D"],
    ["G", "D"],
    ["B", "F"],
  ];
  const AMOUNT = 40; // how far outside the pins the loose band hangs
  A5.same("scene 2 hull", HULL, ["A", "C", "D", "E", "G"]);
  A5.same("scene 2 inside pins", INSIDE, ["B", "F"]);

  // the convexity claim, checked for real: every sampled point of every chord is on the inner side of every hull edge
  const inside = (p) => HULL.every((n, i) => A5.turnValue(P[n], P[HULL[(i + 1) % HULL.length]], p) >= -1e-6);
  CHORDS.forEach(([a, b]) => {
    const ok = Array.from({ length: 21 }, (_, i) => i / 20).every((u) =>
      inside([lerp(P[a][0], P[b][0], u), lerp(P[a][1], P[b][1], u)]),
    );
    A5.same(`scene 2 chord ${a}${b} stays inside the hull`, ok, true);
  });

  // chord timing: each grows in 0.4 s, 0.2 s later it turns green and its tick draws on (0.3 s)
  const TEST = CHORDS.map((c, i) => ({ c, a: 8.7 + 0.8 * i, b: 9.1 + 0.8 * i, g: 9.3 + 0.8 * i }));
  // a tick sits beside its chord, on the clear side (offset: along the chord's normal, in px)
  const tickAt = ([a, b], off) => {
    const [pa, pb] = [P[a], P[b]];
    const len = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
    let n = [(pb[1] - pa[1]) / len, -(pb[0] - pa[0]) / len];
    if (n[1] > 0) n = [-n[0], -n[1]]; // the normal that points up the screen (G-D: to the right, away from pin F)
    return [(pa[0] + pb[0]) / 2 + n[0] * off, (pa[1] + pb[1]) / 2 + n[1] * off];
  };

  V.scene({
    kicker: "THE CONVEX HULL",
    title: ["Stretch a rubber band", "round the pins"],
    dur: 12,
    caps: [
      [1.3, 3.5, "Stretch a rubber band round every pin."],
      [3.7, 6, "Let go. It snaps onto the outer pins."],
      [6.2, 8.4, "The pins it touches are the hull corners."],
      [8.6, 11.6, "A convex shape keeps every segment inside."],
    ],
    build(stage) {
      const pins = A5.plot(stage, { pos: P, r: 20, letters: false, polys: 2, segs: 4, tags: 4 });
      // the bottom row is laid out for its final three items (x 91..845), so it is centred once 'convex' arrives
      const corners = A5.counter(stage, { x: 91, y: 506, w: 270, label: "corners", tone: "green" });
      const inner = A5.counter(stage, { x: 377, y: 506, w: 250, label: "inside", tone: "grey" });
      const convex = A5.tag(stage, { x: 661, y: 514, text: "convex?", tone: "grey", fs: 34 });
      convex.el.style.minWidth = "184px";
      const svg = L5.svg(stage);
      const ticks = TEST.map((q, i) => {
        const [x, y] = tickAt(q.c, i === 1 ? 40 : 42);
        return svg.appendChild(L5.tick(x, y, 44, "green"));
      });

      // the two labels sit on the left edge (A to G): the loose band's label rides in with it, the hull's label rests near G
      const [ea, eb] = [P.A, P.G];
      const el = Math.hypot(eb[0] - ea[0], eb[1] - ea[1]);
      const nrm = [(eb[1] - ea[1]) / el, -(eb[0] - ea[0]) / el]; // unit normal, pointing up and to the left (outside)
      const onEdge = (f, off) => [lerp(ea[0], eb[0], f) + nrm[0] * off, lerp(ea[1], eb[1], f) + nrm[1] * off];

      return (t) => {
        // ---- the band: loose, then tight ----
        const grow = ramp(t, 1.3, 2.2, E.lin);
        const hang = Math.sin(Math.PI * clamp((t - 2.2) / 1.4)); // a slow, tiny sag while it hangs
        const spread = t < 3.6 ? 1 - 0.07 * hang : 1 - ramp(t, 3.6, 4.6, snap);
        const snapped = t >= 4.5;
        const band = {
          pts: HULL,
          tone: snapped ? "green" : "orange",
          fill: lerp(0.3 * ramp(t, 1.7, 2.3), 0.5, ramp(t, 3.6, 5.0)),
          w: lerp(0.8, 1, ramp(t, 3.6, 4.6)),
          spread,
          k: grow,
        };

        // ---- the pins ----
        const points = {};
        A5.NAMES.forEach((n, i) => {
          const k = ramp(t, 0.2 + 0.12 * i, 0.6 + 0.12 * i, E.lin);
          const j = HULL.indexOf(n);
          const tg = 4.6 + 0.15 * j; // a corner turns solid green when the band reaches it
          const green = j >= 0 && t >= tg;
          points[n] = {
            tone: green ? "green" : "grey",
            solid: green,
            s: E.pop(k) * (green ? 1 + 0.2 * flash(t, tg, tg + 0.35) : 1),
            o: Math.min(1, 4 * k),
          };
        });

        // ---- labels on the picture ----
        // one label rides on the left edge: it names the loose band, follows it in as it snaps, then gives way to 'convex hull'
        const side = (off) => ({ at: onEdge(0.66, off + 22), anchor: "r", solid: true });
        const tags = [
          {
            ...side(AMOUNT * spread),
            text: "rubber band",
            tone: snapped ? "green" : "orange",
            k: ramp(t, 2.2, 2.6, E.lin),
            o: 1 - ramp(t, 5.2, 5.5, E.lin),
          },
          { ...side(0), text: "convex hull", tone: "green", k: ramp(t, 5.5, 5.9, E.lin) },
        ];
        INSIDE.forEach((n, i) => {
          tags.push({
            at: n,
            dy: 52,
            text: "inside",
            tone: "grey",
            k: ramp(t, 6.4 + 0.2 * i, 6.8 + 0.2 * i, E.lin),
            o: 1 - ramp(t, 8.2, 8.5, E.lin),
          });
        });

        // ---- the segment test ----
        const segs = TEST.map((q, i) => {
          const next = TEST[i + 1];
          const done = t >= q.g;
          return {
            a: q.c[0],
            b: q.c[1],
            tone: done ? "green" : "blue",
            k: ramp(t, q.a, q.b),
            w: 1,
            o: next ? 1 - 0.45 * ramp(t, next.a, next.a + 0.3, E.lin) : 1,
          };
        });

        pins.update({ points, polys: [band], segs, tags });
        ticks.forEach((tk, i) => L5.drawOn(tk, ramp(t, TEST[i].g, TEST[i].g + 0.3, E.lin)));

        corners.set({
          text: String(HULL.length),
          tone: "green",
          bump: flash(t, 5.8, 6.2),
          k: ramp(t, 5.8, 6.2, E.lin),
        });
        inner.set({ text: String(INSIDE.length), tone: "grey", bump: flash(t, 5.9, 6.3), k: ramp(t, 5.9, 6.3, E.lin) });
        // 'convex?' is asked when the caption names it; the three green ticks answer it
        const yes = t >= 11.1;
        convex.set({
          text: yes ? "convex" : "convex?",
          tone: yes ? "green" : "grey",
          solid: yes,
          k: ramp(t, 8.6, 8.9, E.lin),
          s: 1 + 0.15 * flash(t, 11.1, 11.5),
        });
      };
    },
  });
})();
