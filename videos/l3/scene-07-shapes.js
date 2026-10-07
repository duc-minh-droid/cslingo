/* Lecture 3 · Landscapes, scene 07-shapes: four landscape shapes, one hillclimber dropped on each. Only the one-peak shape
   lets it reach the best. Story (local seconds): 0.3-1.3 four panels pop in and draw, 1.4 stars, 1.8 climbers, 2.0-6.5 they walk
   (one position per 0.3 s), 6.8-7.6 outcome badges, 8.0-9.4 the three failures dim while the green panel pulses. */
(function () {
  const V = window.VID;
  const L3 = V.l3;
  const L5 = V.l5;
  const { ramp, clamp, ease: E } = V;

  // one entry per panel: shape, start, seed, how many positions of the log we walk, the path the spec expects, tag, outcome
  const SHAPES = [
    {
      kind: "uni",
      start: 3,
      seed: 2,
      keep: 99,
      want: [3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 19, 20, 21],
      tag: "Unimodal: one peak",
      win: true,
      x: 0,
      y: 0,
    },
    {
      kind: "multi",
      start: 13,
      seed: 6,
      keep: 99,
      want: [13, 14, 15, 16, 17, 18],
      tag: "Multimodal: many peaks",
      win: false,
      x: 486,
      y: 0,
    },
    {
      kind: "plateau",
      start: 9,
      seed: 3,
      keep: 15,
      want: [9, 10, 9, 10, 9, 7, 6, 7, 9, 7, 5, 7, 8, 9, 11],
      tag: "Plateau: flat area",
      win: false,
      x: 0,
      y: 350,
    },
    {
      kind: "deceptive",
      start: 20,
      seed: 1,
      keep: 99,
      want: [20, 18, 17, 16, 15, 14, 12, 11, 10, 9, 7, 6, 5, 3, 2, 0],
      tag: "Deceptive: wrong way",
      win: false,
      x: 486,
      y: 350,
    },
  ];
  const BEST = { uni: 21, multi: 29, plateau: 31, deceptive: 39 };
  const [W, H] = [450, 290];
  const [STEP, HOP, WALK0] = [0.3, 0.25, 2.0];

  // real algorithm, once, at build time
  SHAPES.forEach((s) => {
    const f = L3.fvals(s.kind);
    s.path = L3.hc(f, { start: s.start, seed: s.seed, tries: 26, r: 2 }).path.slice(0, s.keep);
    if (s.path.join() !== s.want.join())
      throw new Error(`shapes scene: ${s.kind} path ${s.path} differs from the lecture`);
    if (L3.bestOf(f) !== BEST[s.kind]) throw new Error(`shapes scene: ${s.kind} best moved`);
    const end = s.path[s.path.length - 1];
    if ((end === BEST[s.kind]) !== s.win) throw new Error(`shapes scene: ${s.kind} outcome differs from the spec`);
  });

  V.scene({
    kicker: "LANDSCAPES",
    title: ["Four shapes of landscape", "only one is easy"],
    dur: 10,
    caps: [
      [0.4, 2.2, "Four landscape shapes. One climber on each."],
      [2.4, 6.4, "Hillclimbing only ever walks uphill."],
      [6.6, 9.4, "Only the one-peak shape always works."],
    ],
    build(stage) {
      const panels = SHAPES.map((s) => {
        const P = L3.land(stage, { x: s.x, y: s.y, w: W, h: H, kind: s.kind, frame: true, pad: { t: 112 } });
        P.tag(s.tag, { at: "tl", tone: "grey" });
        const star = P.marker("star", { size: 34 });
        const token = P.marker("token", { size: 22 });
        // outcome badge: a 44 px circle in the bottom-right corner (own SVG so it sits in the corner, not on the curve)
        const tn = L5.tone(s.win ? "green" : "red");
        const bx = s.x + W - 38;
        const by = s.y + H - 38;
        const lip = V.s("circle", { cx: bx, cy: by + 3, r: 22, style: { fill: tn.lip } });
        const disc = V.s("circle", {
          cx: bx,
          cy: by,
          r: 22,
          "stroke-width": "3",
          style: { fill: tn.c, stroke: tn.lip },
        });
        const icon = s.win
          ? L5.tick(bx, by, 28, "green", { on: true, w: 5 })
          : L5.cross(bx, by, 26, "red", { on: true, w: 5 });
        const badge = V.s("g", {}, lip, disc, icon);
        V.show(badge, 0);
        P.over.append(badge);
        // the card edge takes the outcome colour (rect 0 = lip, rect 1 = body)
        const [edgeLip, edgeBody] = [P.g.children[0], P.g.children[1]];
        return { P, s, star, token, badge, icon, tn, edgeLip, edgeBody, bx, by };
      });

      return (t) => {
        const dimK = ramp(t, 8.0, 9.4, E.inOut);
        panels.forEach((p, j) => {
          const { P, s } = p;
          const pop = ramp(t, 0.3 + 0.2 * j, 0.8 + 0.2 * j);
          const draw = ramp(t, 0.35 + 0.2 * j, 1.3, E.inOut);
          const pulse = s.win ? Math.sin(Math.PI * dimK) * 0.03 : 0;
          const o = (s.win ? 1 : 1 - 0.55 * dimK) * Math.min(1, pop * 4);
          P.update({ curve: draw, fill: draw, o, s: (0.92 + 0.08 * E.pop(pop)) * (1 + pulse) });

          // outcome tint on the card edge, then the badge
          const bk = ramp(t, 6.8 + 0.2 * j, 7.6 + 0.2 * j, E.lin);
          p.edgeLip.style.fill = bk > 0 ? p.tn.lip : "var(--line-2)";
          p.edgeBody.style.stroke = bk > 0 ? p.tn.c : "var(--line-2)";
          V.place(p.badge, { s: bk > 0 ? 0.3 + 0.7 * E.pop(bk) : 1, o: Math.min(1, bk * 5) });
          p.badge.style.transformBox = "fill-box";
          p.badge.style.transformOrigin = "center";
          L5.drawOn(p.icon, ramp(bk, 0.3, 1, E.lin));

          // star
          const sk = ramp(t, 1.4, 1.8);
          p.star.set({ i: BEST[s.kind], dy: -24, s: E.pop(sk), o: Math.min(1, sk * 4) });

          // climber: one hop per STEP from WALK0 along the real path
          const steps = s.path.length - 1;
          const st = L3.stepAt(t, WALK0, STEP, steps);
          let i = s.start;
          let dy = 0;
          if (st.n > 0) {
            const a = s.path[st.i];
            const b = s.path[st.i + 1];
            const k = clamp((t - WALK0 - st.i * STEP) / HOP);
            const h = L3.hop(a, b, k, 30);
            [i, dy] = [h.i, h.dy];
          }
          const tk = ramp(t, 1.8, 2.1);
          const finished = st.done >= steps;
          const ringK = ramp(t, 6.8 + 0.2 * j, 7.4 + 0.2 * j);
          p.token.set({
            i,
            dy,
            s: E.pop(tk),
            o: Math.min(1, tk * 4),
            ring: finished && ringK > 0 ? (s.win ? "green" : "red") : null,
            ringK,
          });
        });
      };
    },
  });
})();
