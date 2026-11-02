/* Lecture 12 video, scene 6: fresh dice each step. The same zoomed map, particle and step as scene 4 (L12.FOCUS: particle 1 of
   the demo swarm on step 9, with the same own best p and swarm best g). z₁ and z₂ are drawn fresh for every particle, dimension
   and step, so rolling them again lands the same particle somewhere else: 20 other rolls (L12.CLOUD, the first 20 that the
   app's walls and limits leave alone, so every landing is exactly the head-to-tail sum) leave 20 hollow ghosts round the real
   landing. That spread keeps the swarm searching instead of settling too soon.
   Story (local seconds): 0.2-0.8 the map with the faint swarm, the particle, p and g; 0.8-1.8 the real step (blue dashed arrow,
   the real landing, dice on face 4, the real z tags); 2.8-5.2 three slow rolls (dice shakes, z tags change, the arrow re-aims,
   a ghost pops); 5.2-8.3 seventeen fast rolls; 8.5-8.9 the arrow fades; 8.8-9.4 the two closing cards; hold to 11. */
VID.scene({
  kicker: "THE DICE",
  title: ["Fresh dice each step:", "no two steps the same"],
  dur: 11,
  caps: [
    [0.9, 2.6, "z₁ and z₂ are fresh random numbers every step."],
    [2.8, 5, "Roll again and the same particle lands elsewhere."],
    [5.2, 8.6, "Each hollow dot is one possible landing spot."],
    [8.8, 10.7, "This spread stops the swarm settling too soon."],
  ],
  build(stage, V) {
    const L12 = V.l12;
    const L5 = V.l5;
    const { ramp, flash, ease: E } = V;

    // ---- the data (asserted in l12/common.js, the figures this scene shows asserted again here)
    const R = L12.RUN;
    const FO = L12.FOCUS;
    const C = L12.CLOUD;
    L12.same([FO.i, FO.step], [1, 9], "scene 6: particle 1 on step 9, as scene 4");
    L12.close(R.frames[8].x[FO.i], FO.x0, 1e-9, "scene 6: the particle stands at x0 in frame 8");
    L12.same(C.pts.length, 20, "scene 6: twenty other rolls");
    const zText = (z) => [
      `z₁ = ${L12.fmt(z[0][0])}, ${L12.fmt(z[1][0])}`,
      `z₂ = ${L12.fmt(z[0][1])}, ${L12.fmt(z[1][1])}`,
    ];
    L12.same(zText(FO.z), ["z₁ = 0.45, 0.57", "z₂ = 0.94, 0.12"], "scene 6: the real dice (dimension 1, dimension 2)");
    // every ghost is exactly x0 + v0 + the two pulls with its own dice (no limit, no wall), as the storyboard promises
    C.pts.forEach((q, k) => {
      const sum = [0, 1].map(
        (j) => FO.x0[j] + FO.v0[j] + 2 * q.z[j][0] * (FO.p[j] - FO.x0[j]) + 2 * q.z[j][1] * (FO.g[j] - FO.x0[j]),
      );
      L12.close(q.x, sum, 1e-9, `scene 6: roll ${k + 1} lands on the head-to-tail sum`);
    });
    const VIEW = [0.5, 2, 8.5, 10];
    const inView = (m) =>
      m[0] > VIEW[0] + 0.15 && m[0] < VIEW[2] - 0.15 && m[1] > VIEW[1] + 0.15 && m[1] < VIEW[3] - 0.15;
    L12.same(
      C.pts.concat([{ x: FO.x }]).every((q) => inView(q.x)),
      true,
      "scene 6: every landing is inside the window",
    );

    // ---- timeline (local seconds)
    const T = { map: [0.2, 0.8], real: [0.8, 1.8], fade: [8.5, 8.9], cards: [8.8, 9.4] };
    // each roll: when it starts, how long the dice shakes, how long the arrow takes to re-aim
    const ROLLS = C.pts.map((q, k) =>
      k < 3 ? { t0: 2.8 + 0.8 * k, shake: 0.5, aim: 0.25 } : { t0: 5.2 + 0.18 * (k - 3), shake: 0.08, aim: 0.06 },
    );
    L12.same(ROLLS[19].t0 + 0.18 < 8.3, true, "scene 6: the last fast roll ends by 8.3 s");
    const settle = (k) => ROLLS[k].t0 + ROLLS[k].shake; // the dice stops: z tags change, the arrow starts re-aiming
    const lastRoll = (t) => {
      let k = -1;
      ROLLS.forEach((_, i) => {
        if (t >= settle(i)) k = i;
      });
      return k;
    };

    // ---- the map (scene 4's window) and the panel
    const map = L12.field(stage, { x: 12, y: 12, size: 616, view: VIEW, dots: 16, rings: 2, ghosts: 22, vecs: 2 });
    const others = R.frames[8].x.filter((_, i) => i !== FO.i);
    const pSvg = L5.svg(stage);
    const DICE = { x: 786, y: 80, size: 90 };
    const faces = [1, 2, 3, 4, 5, 6].map((f) =>
      pSvg.appendChild(L5.dice(DICE.x, DICE.y, DICE.size, { face: f, tone: "grey" })),
    );
    const z1Tag = L12.tag(stage, { x: 648, y: 150, text: zText(FO.z)[0], tone: "purple" });
    const z2Tag = L12.tag(stage, { x: 648, y: 222, text: zText(FO.z)[1], tone: "orange" });
    const card = (y, text, tone) => {
      const c = L12.card(stage, { x: 648, y, w: 276, h: 100, fs: 28, text, tone, plain: true });
      c.el.style.whiteSpace = "pre-line";
      c.el.style.lineHeight = "1.2";
      return c;
    };
    // the same p and g letters as scene 4
    const [ppx, ppy] = map.pt(FO.p);
    const [gpx, gpy] = map.pt(FO.g);
    const pLab = L12.label(stage, { x: ppx - 70, y: ppy - 22, w: 40, text: "p", tone: "purple", fs: 36 });
    const gLab = L12.label(stage, { x: gpx + 26, y: gpy - 62, w: 40, text: "g", tone: "orange", fs: 36 });
    const rollsCard = card(320, `same particle,\n${C.pts.length} rolls`, "grey");
    const spreadCard = card(436, "spread =\nmore searching", "green");

    return (t) => {
      const mk = ramp(t, T.map[0], T.map[1], E.lin);
      const fadeArrow = 1 - ramp(t, T.fade[0], T.fade[1], E.lin);
      const k = lastRoll(t); // -1 = still the real dice

      // the arrow: the real step first, then re-aimed at each roll's landing, then fading out
      const vec =
        k < 0
          ? { b: FO.x, k: ramp(t, T.real[0], T.real[1], E.inOut) }
          : { b: C.pts[k].x, k: ramp(t, settle(k), settle(k) + ROLLS[k].aim, E.out) };
      const vecs = [{ a: FO.x0, b: vec.b, k: vec.k, tone: "blue", w: 7, head: 22, dash: true, o: fadeArrow }];

      // the landings: the real one (solid blue) and a hollow ghost for every roll so far
      const ghosts = C.pts.map((q, i) => ({
        x: q.x,
        r: 9,
        o: 0.9,
        k: i <= k ? ramp(t, settle(i) + ROLLS[i].aim, settle(i) + ROLLS[i].aim + 0.25, E.lin) : 0,
      }));
      const realK = ramp(t, T.real[1] - 0.15, T.real[1] + 0.15, E.lin);
      const dots = others.map((x) => ({ x, o: 0.3 }));
      if (realK > 0) dots.push({ x: FO.x, r: 11, s: 0.6 + 0.4 * E.pop(realK) });
      dots.push({ x: FO.x0, r: 15, focus: true, s: 0.6 + 0.4 * E.pop(ramp(t, 0.4, 0.8, E.lin)) });

      map.update({
        k: mk,
        dots: mk > 0 ? dots : [],
        rings: [{ x: FO.p, r: 22, k: ramp(t, 0.4, 0.8, E.lin) }],
        star: { x: FO.g, size: 48, k: ramp(t, 0.5, 0.9, E.lin) },
        ghosts,
        vecs,
      });

      // the dice: face 4 for the real step; each roll shakes through faces, then settles on its own face
      const dk = ramp(t, T.real[0], T.real[0] + 0.4, E.lin);
      const shaking = ROLLS.findIndex((r) => t >= r.t0 && t < r.t0 + r.shake);
      let face = 4;
      if (shaking >= 0) face = 1 + ((shaking * 7 + Math.floor(t * 12)) % 6);
      else if (k >= 0) face = 1 + (k % 6);
      const wob = shaking >= 0 ? Math.sin(((t - ROLLS[shaking].t0) / ROLLS[shaking].shake) * Math.PI * 3) : 0;
      faces.forEach((g, i) =>
        V.place(g, { o: i + 1 === face ? Math.min(1, dk * 3) : 0, s: 0.6 + 0.4 * E.pop(dk), r: 16 * wob }),
      );

      // the z tags follow the dice that is showing
      const zt = zText(k < 0 ? FO.z : C.pts[k].z);
      const bump = k >= 0 && k < 3 ? flash(t, settle(k), settle(k) + 0.3) : 0;
      const tk = ramp(t, T.real[0] + 0.1, T.real[0] + 0.5, E.lin);
      z1Tag.set({ text: zt[0], k: tk, s: 1 + 0.06 * bump });
      z2Tag.set({ text: zt[1], k: tk, s: 1 + 0.06 * bump });

      pLab.set({ k: ramp(t, 0.4, 0.8, E.lin), bold: true });
      gLab.set({ k: ramp(t, 0.5, 0.9, E.lin), bold: true });
      rollsCard.set({ k: ramp(t, T.cards[0], T.cards[0] + 0.4, E.lin) });
      spreadCard.set({ k: ramp(t, T.cards[0] + 0.2, T.cards[1], E.lin) });
    };
  },
});
