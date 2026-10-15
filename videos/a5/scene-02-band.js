/* Phase 5 · scene 02-band (14 s): THE CONVEX HULL. Seven pins on a board; a rubber band is stretched loosely round them all (orange),
   then let go: it shrinks and catches on the outer pins one after another until it is tight (green). The pins it catches are the
   corners of the convex hull; the pins inside never touch it. A convex shape keeps every segment between two of its points inside
   it: first a counter-example (the band dented in at F, so the segment E-G pokes outside it: red cross, 'not convex'), then the real
   hull with three segments, A-D, G-D and B-F (the last joins the two INSIDE pins), and every one stays inside the band.
   The band is the true convex hull of the pins and a shrinking ellipse (A5.hullOf), so it stays taut and straight between the pins
   it touches and is tangent to the loop; a pin turns green at the moment it first becomes a corner of that shape.
   Story (local seconds): 0.2-1.3 pins, 1.3-2.4 the loose band, 3.6-5.2 snap (pins caught on the way), 5.0 band green, 5.3 'convex
   hull' label, 5.8 counters, 6.3-7.9 'inside' tags, 8.0 'convex?', 8.2-9.6 the dent and the segment that pokes out, 10.1 the hull
   comes back, 10.5-13.0 the segment test, 12.8 'convex'. */
(function () {
  const V = window.VID;
  const A5 = V.a5;
  const L5 = V.l5;
  const { ramp, flash, clamp, lerp, ease: E } = V;

  const P = A5.pos({ x: 186, y: 100, s: 1.55 });
  const HULL = A5.HULL;
  const INSIDE = A5.INSIDE;
  const CHORDS = [
    ["A", "D"],
    ["G", "D"],
    ["B", "F"],
  ];
  A5.same("scene 2 hull", HULL, ["A", "C", "D", "E", "G"]);
  A5.same("scene 2 inside pins", INSIDE, ["B", "F"]);
  A5.same("scene 2 dented path", A5.DENT.path, ["A", "C", "D", "E", "F", "G"]);

  // the convexity claim, checked for real: every sampled point of every chord is on the inner side of every hull edge
  const inside = (p) => HULL.every((n, i) => A5.turnValue(P[n], P[HULL[(i + 1) % HULL.length]], p) >= -1e-6);
  CHORDS.forEach(([a, b]) => {
    const ok = Array.from({ length: 21 }, (_, i) => i / 20).every((u) =>
      inside([lerp(P[a][0], P[b][0], u), lerp(P[a][1], P[b][1], u)]),
    );
    A5.same(`scene 2 chord ${a}${b} stays inside the hull`, ok, true);
  });
  // ... and the counter-example: E-G leaves the dented shape (its middle is on the wrong side of the edge E -> F)
  const mid = [(P.E[0] + P.G[0]) / 2, (P.E[1] + P.G[1]) / 2];
  A5.same("scene 2: E-G pokes out of the dented shape", A5.turnValue(P.E, P.F, mid) < 0, true);

  // ---------- the band: the hull of the pins and a shrinking ellipse ----------
  const CX = 457;
  const CY = 266;
  const RX = 385;
  const RY = 250;
  const N = 96;
  const bandAt = (s) => {
    const q = { ...P };
    for (let i = 0; i < N; i++) {
      const a = (2 * Math.PI * i) / N;
      q[`e${i}`] = [CX + RX * s * Math.cos(a), CY + RY * s * Math.sin(a)];
    }
    const names = A5.hullOf(q);
    return { pts: names.map((n) => q[n]), corners: names.filter((n) => P[n]) };
  };
  const LET_GO = 3.6;
  const TIGHT = 5.2;
  /* how big the ellipse is: loose (1), a slow sag while it hangs, then shrinking fast and easing in as it settles */
  const size = (t) => {
    if (t < LET_GO) return 1 - 0.025 * Math.sin(Math.PI * clamp((t - 2.4) / 1.2));
    const r = ramp(t, LET_GO, TIGHT, E.lin);
    return 1 - 0.95 * (0.55 * r + 0.45 * E.out(r));
  };
  /* when each pin first becomes a corner of the band: scanned once, in 10 ms steps */
  const CATCH = {};
  for (let t = LET_GO; t <= TIGHT + 1e-9 && Object.keys(CATCH).length < HULL.length; t += 0.01)
    bandAt(size(t)).corners.forEach((n) => (CATCH[n] ??= t));
  A5.same("scene 2: the band catches exactly the hull corners", Object.keys(CATCH).sort(), HULL.slice().sort());

  // segment timing: each grows in 0.4 s, 0.2 s later it turns green and its tick draws on (0.3 s)
  const TEST = CHORDS.map((c, i) => ({ c, a: 10.5 + 0.7 * i, b: 10.9 + 0.7 * i, g: 11.1 + 0.7 * i }));
  const DENT = { poly: [8.2, 8.7], chord: [8.7, 9.1], red: 9.1, cross: [9.2, 9.6], tag: 9.3, out: [10.0, 10.4] };
  // a tick sits beside its chord, on the clear side (offset: along the chord's normal, in px)
  const tickAt = ([a, b], off) => {
    const [pa, pb] = [P[a], P[b]];
    const len = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
    let n = [(pb[1] - pa[1]) / len, -(pb[0] - pa[0]) / len];
    if (n[1] > 0) n = [-n[0], -n[1]]; // the normal that points up the screen (G-D: to the right, away from pin F)
    return [(pa[0] + pb[0]) / 2 + n[0] * off, (pa[1] + pb[1]) / 2 + n[1] * off];
  };
  // the cross for the segment that pokes out sits just outside the dent, away from F
  const crossAt = (() => {
    const len = Math.hypot(P.G[0] - P.E[0], P.G[1] - P.E[1]);
    const n = [(P.G[1] - P.E[1]) / len, -(P.G[0] - P.E[0]) / len];
    const s = n[0] * (P.F[0] - mid[0]) + n[1] * (P.F[1] - mid[1]) > 0 ? -1 : 1; // away from F
    return [mid[0] + s * n[0] * 46, mid[1] + s * n[1] * 46];
  })();

  V.scene({
    kicker: "THE CONVEX HULL",
    title: ["Stretch a rubber band", "round the pins"],
    dur: 14,
    caps: [
      [1.3, 3.5, "Stretch a rubber band round every pin."],
      [3.7, 5.4, "Let go. It snaps onto the outer pins."],
      [5.5, 7.8, "The pins it touches are the hull corners."],
      [8.6, 10.3, "A dent lets a segment poke outside."],
      [10.5, 13.8, "A convex shape keeps every segment inside."],
    ],
    build(stage) {
      const pins = A5.plot(stage, { pos: P, r: 20, letters: false, polys: 3, segs: 4, tags: 6 });
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
      const cross = svg.appendChild(L5.cross(crossAt[0], crossAt[1], 52, "red"));

      // the hull's label sits on the left edge (A to G), just outside it
      const [ea, eb] = [P.A, P.G];
      const el = Math.hypot(eb[0] - ea[0], eb[1] - ea[1]);
      const nrm = [(eb[1] - ea[1]) / el, -(eb[0] - ea[0]) / el]; // unit normal, pointing up and to the left (outside)
      const onEdge = (f, off) => [lerp(ea[0], eb[0], f) + nrm[0] * off, lerp(ea[1], eb[1], f) + nrm[1] * off];

      return (t) => {
        // ---- the band: loose, then tight ----
        const grow = ramp(t, 1.3, 2.4, E.lin);
        const band = bandAt(Math.max(0.02, size(t)));
        const snapped = t >= 5.0;
        const outBand = ramp(t, DENT.poly[0], DENT.poly[1], E.lin) * (1 - ramp(t, DENT.out[0], DENT.out[1], E.lin));
        const polys = [
          {
            pts: band.pts,
            tone: snapped ? "green" : "orange",
            fill: lerp(0.3 * ramp(t, 2.0, 2.5), 0.5, ramp(t, LET_GO, 5.0)),
            w: lerp(0.8, 1, ramp(t, LET_GO, TIGHT)),
            k: grow,
            o: 1 - outBand,
          },
          { pts: A5.DENT.path, tone: "red", fill: 0.5, w: 1, o: outBand },
        ];

        // ---- the pins: green the moment the band catches them ----
        const points = {};
        A5.NAMES.forEach((n, i) => {
          const k = ramp(t, 0.2 + 0.12 * i, 0.6 + 0.12 * i, E.lin);
          const tg = CATCH[n] === undefined ? Infinity : CATCH[n] + 0.04;
          const green = t >= tg;
          points[n] = {
            tone: green ? "green" : "grey",
            solid: green,
            s: E.pop(k) * (green ? 1 + 0.2 * flash(t, tg, tg + 0.35) : 1),
            o: Math.min(1, 4 * k),
          };
        });

        // ---- labels on the picture ----
        const tags = [
          // the loose band is named once, under it
          {
            at: [CX, 546],
            text: "rubber band",
            tone: "orange",
            solid: true,
            k: ramp(t, 2.2, 2.6, E.lin),
            o: 1 - ramp(t, 3.4, 3.7, E.lin),
          },
          { at: onEdge(0.66, 22), anchor: "r", text: "convex hull", tone: "green", solid: true, k: ramp(t, 5.3, 5.7, E.lin), o: 1 - ramp(t, 7.9, 8.2, E.lin) }, // prettier-ignore
          { at: "F", dy: 72, text: "not convex", tone: "red", solid: true, k: ramp(t, DENT.tag, DENT.tag + 0.4, E.lin), o: 1 - ramp(t, DENT.out[0], DENT.out[1], E.lin) }, // prettier-ignore
        ];
        INSIDE.forEach((n, i) => {
          tags.push({
            at: n,
            dy: 52,
            text: "inside",
            tone: "grey",
            k: ramp(t, 6.3 + 0.2 * i, 6.7 + 0.2 * i, E.lin),
            o: 1 - ramp(t, 7.7, 8.0, E.lin),
          });
        });

        // ---- the counter-example, then the segment test ----
        const poke = {
          a: "E",
          b: "G",
          tone: t >= DENT.red ? "red" : "blue",
          k: ramp(t, DENT.chord[0], DENT.chord[1]),
          w: 1,
          o: 1 - ramp(t, DENT.out[0], DENT.out[1], E.lin),
        };
        const segs = [poke].concat(
          TEST.map((q, i) => {
            const next = TEST[i + 1];
            const done = t >= q.g;
            return {
              a: q.c[0],
              b: q.c[1],
              tone: done ? "green" : "blue",
              k: ramp(t, q.a, q.b),
              w: 1,
              o: next ? 1 - 0.2 * ramp(t, next.a, next.a + 0.3, E.lin) : 1,
            };
          }),
        );

        pins.update({ points, polys, segs, tags });
        ticks.forEach((tk, i) => L5.drawOn(tk, ramp(t, TEST[i].g, TEST[i].g + 0.3, E.lin)));
        L5.drawOn(cross, ramp(t, DENT.cross[0], DENT.cross[1], E.lin));
        V.place(cross, { o: 1 - ramp(t, DENT.out[0], DENT.out[1], E.lin) });

        corners.set({
          text: String(HULL.length),
          tone: "green",
          bump: flash(t, 5.8, 6.2),
          k: ramp(t, 5.8, 6.2, E.lin),
        });
        inner.set({ text: String(INSIDE.length), tone: "grey", bump: flash(t, 5.9, 6.3), k: ramp(t, 5.9, 6.3, E.lin) });
        // 'convex?' is asked when the dent is shown; the three green ticks answer it
        const yes = t >= 12.8;
        convex.set({
          text: yes ? "convex" : "convex?",
          tone: yes ? "green" : "grey",
          solid: yes,
          k: ramp(t, 8.0, 8.3, E.lin),
          s: 1 + 0.15 * flash(t, 12.8, 13.2),
        });
      };
    },
  });
})();
