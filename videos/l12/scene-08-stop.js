/* Lecture 12 video, scene 08-stop: lesson 12.4's four stopping rules, shown firing on the lesson's own run (stopFig,
   L12.STOP: seed 24, 10 particles, c1 = c2 = 1, w = 0.6). w < 1 is the lessons' marked EXTRA ('momentum kept'), said on screen
   by a grey tag; with the plain formula (w = 1) the radius rule never fires (asserted in l12/common.js).
   Layout: the scent map (x 12, y 12, 616) with the ten dots (drawn above the star, so the swarm on the food still shows as a
   dot), faint tails, the orange star at g and a green 'odour' tag riding just left of the star (the swarm's best odour). Two
   grey tags on the map's lower edge, inside the map element under the dots: the w extra (left) and the step counter (right). Panel (x 648..924): the 'spread' stat
   (the swarm radius as a share of the starting one, one decimal under 10% and never rounded up, so step 19 reads 4.x%), then
   four rule tiles in the order they fire here: Good enough (odour 95+), Radius ~ 0 (spread < 5%), No new best (for 8 steps),
   Step limit (50 steps). When a rule fires its tile turns solid red and a third line 'at step N' appears.
   Story (local seconds): 0.2-0.8 map, dots, star, stat and tiles pop; 0.55-1.0 the w tag; the run plays 0 -> 50 with two
   holds so each claim sits on screen while its caption is read: steps 0-7 at 0.18 s a step (1.2-2.46, 'Good enough' fires at
   2.46, odour 97), hold to 3.6, steps 7-19 (3.6-4.62, 'Radius ~ 0' fires at 4.62), hold to 5.6, steps 19-46 (5.6-9.48, 'No new
   best' fires), steps 46-50 (9.48-10.2, 'Step limit' fires). 11.9-12.5 a dashed orange ring round the first tile to fire (any
   one rule, here the first, would have ended the run); hold to 14 with the swarm on the food as one dot. */
VID.scene({
  kicker: "WHEN TO STOP",
  title: ["Four rules decide", "when the search ends"],
  dur: 14,
  caps: [
    [0.8, 2.4, "Here each particle keeps 60% of its old velocity."],
    [2.6, 4.5, "Step 7: odour 97, a good enough answer."],
    [4.8, 8.6, "Step 19: the swarm has shrunk to almost a point."],
    [10.3, 11.9, "Then 8 steps with no new best, then the step limit."],
    [12.1, 13.8, "Any one of the four rules can end the run."],
  ],
  build(stage, V) {
    const L12 = V.l12;
    const { ramp, flash, clamp, lerp, ease: E } = V;

    // ---- the data (run and asserted in l12/common.js), asserted again here
    const R = L12.STOP;
    const F = R.frames;
    const IDS = ["good", "rad", "stale", "max"];
    L12.same([R.P.w, R.P.c1, R.P.c2, R.its, F[0].x.length], [0.6, 1, 1, 50, 10], "scene 8: the stopFig run's settings");
    // integer steps compared as one string: robust to any float or ordering noise
    L12.same(
      IDS.map((id) => `${id} ${Math.round(R.fired[id])}`).join(", "),
      "good 7, rad 19, stale 46, max 50",
      "scene 8: the step each rule first fires",
    );
    L12.same([F[0].best, F[6].best, F[7].best], [49, 94, 97], "scene 8: best odour at steps 0, 6 and 7");
    L12.same(F[19].rad < 0.05 && F[18].rad >= 0.05, true, "scene 8: spread first under 5% at step 19");
    L12.same([F[38].stale, F[46].stale], [0, 8], "scene 8: last new best at step 38, flat for 8 steps at 46");
    L12.close(F[50].x.flat(), F[50].x.map(() => L12.FOOD).flat(), 0.01, "scene 8: all ten end on the food");
    L12.same(
      IDS.every((id) => L12.RULES.some((r) => r.id === id)),
      true,
      "scene 8: the four rules of the app",
    );
    const W = Math.round(100 * R.P.w);
    L12.same(W, 60, "scene 8: w = 0.6 keeps 60%");
    const pct = (r) => (r < 0.1 ? `${(Math.floor(r * 1000) / 10).toFixed(1)}%` : `${Math.round(100 * r)}%`);
    L12.same(
      [pct(F[0].rad), parseFloat(pct(F[19].rad)) < 5],
      ["100%", true],
      "scene 8: spread reads 100% at the start, under 5% at 19",
    );

    // ---- timing: the play head s (0..50) against local time, with holds after the first two rules fire
    const KEYS = [
      [1.2, 0],
      [2.46, 7],
      [3.6, 7],
      [4.62, 19],
      [5.6, 19],
      [9.48, 46],
      [10.2, 50],
    ];
    const head = (t) => {
      if (t <= KEYS[0][0]) return 0;
      for (let i = 1; i < KEYS.length; i++)
        if (t <= KEYS[i][0]) return lerp(KEYS[i - 1][1], KEYS[i][1], ramp(t, KEYS[i - 1][0], KEYS[i][0], E.lin));
      return R.its;
    };
    const fireAt = (step) => KEYS.find(([, s]) => s === Math.round(step))[0];
    const RING = [11.9, 12.5];

    // ---- the map, with our own dot layer above the star
    const map = L12.field(stage, { x: 12, y: 12, size: 616, dots: 0, tails: 10, rings: 0, ghosts: 0, vecs: 0 });
    const dotSvg = V.s("svg", {
      width: 616,
      height: 616,
      style: { position: "absolute", left: "0", top: "0", overflow: "visible" },
    });
    map.el.append(dotSvg);
    const blue = L12.tone("blue");
    const dots = F[0].x.map(() =>
      dotSvg.appendChild(V.s("circle", { r: 13, "stroke-width": 3, style: { fill: blue.c, stroke: blue.lip } })),
    );
    // the two grey tags live inside the map element, under the dot layer, so no dot ever hides behind them
    const MO = 12; // the map's offset in the stage
    const wTag = L12.tag(map.el, {
      x: 28 - MO,
      y: 556 - MO,
      text: `extra: w = ${L12.fmt(R.P.w)} keeps ${W}% of v`,
      tone: "grey",
    });
    const stepTag = L12.tag(map.el, { x: 0, y: 556 - MO, text: "step 0", tone: "grey" });
    map.el.append(dotSvg);
    const odTag = L12.tag(stage, { x: 0, y: 0, text: "odour 49", tone: "green" });

    // ---- the panel: spread, then the four rule tiles
    const PX = 648;
    const PW = 276;
    const stRad = L12.stat(stage, { x: PX, y: 12, w: PW, h: 72, label: "spread", tone: "blue" });
    const RULE_TEXT = {
      good: ["Good enough", "odour 95+"],
      rad: ["Radius ~ 0", "spread < 5%"],
      stale: ["No new best", "for 8 steps"],
      max: ["Step limit", "50 steps"],
    };
    const TILE = { y0: 96, h: 120, gap: 12 };
    const tiles = IDS.map((id, i) => {
      const y = TILE.y0 + i * (TILE.h + TILE.gap);
      const el = V.h("div", {
        class: "v-card plain c-grey",
        style: {
          ...L12.abs(PX, y, PW, TILE.h),
          padding: "12px 0 0 20px",
          borderRadius: "22px",
          fontSize: "28px",
          lineHeight: "32px",
        },
      });
      const lines = [...RULE_TEXT[id], `at step ${R.fired[id]}`].map((text, j) =>
        el.appendChild(V.h("div", { text, style: { whiteSpace: "nowrap", fontWeight: j === 0 ? "900" : "800" } })),
      );
      stage.append(el);
      return { id, el, last: lines[2], at: fireAt(R.fired[id]), y };
    });
    L12.close(
      tiles.map((q) => q.at),
      [2.46, 4.62, 9.48, 10.2],
      1e-6,
      "scene 8: the tiles fire at these times",
    );
    tiles.forEach((q) =>
      L12.same(Math.round(head(q.at)), Math.round(R.fired[q.id]), `scene 8: the run is at step ${R.fired[q.id]}`),
    );
    // the dashed orange ring round the first tile to fire
    const ring = V.h("div", {
      style: {
        ...L12.abs(PX - 8, tiles[0].y - 8, PW + 16, TILE.h + 20),
        boxSizing: "border-box",
        border: `5px dashed ${L12.tone("orange").c}`,
        borderRadius: "30px",
      },
    });
    stage.append(ring);

    return (t) => {
      const kIn = ramp(t, 0.2, 0.8);
      const s = head(t);
      const A = L12.at(R, s);
      const fr = F[A.k];

      // the map: tails and star (field), dots (our layer above the star)
      map.update({
        k: kIn,
        tails: s > 0 ? A.x.map((_, i) => ({ pts: L12.trail(R, i, s, 1.5), tone: "blue", o: 0.3, w: 5 })) : [],
        star: { x: fr.g, k: ramp(t, 0.5, 1.0), size: 44 },
      });
      dots.forEach((d, i) => {
        const [px, py] = map.ps(A.x[i]);
        d.setAttribute("cx", L12.f1(px));
        d.setAttribute("cy", L12.f1(py));
      });
      // the swarm's best odour rides just left of the star
      const [gx, gy] = map.pt(fr.g);
      const txt = `odour ${fr.best}`;
      const tw = L12.tagW(txt);
      odTag.set({
        text: txt,
        tone: "green",
        solid: fr.best >= 95,
        k: ramp(t, 0.6, 1.1),
        x: clamp(gx - 34 - tw, 24, 628 - 12 - tw),
        y: clamp(gy - 22, 24, 500),
        s: 1 + 0.12 * flash(t, tiles[0].at, tiles[0].at + 0.5),
      });
      wTag.set({ k: ramp(t, 0.55, 1.0) });
      const st = `step ${A.k}`;
      stepTag.set({ text: st, k: 1, x: 628 - MO - 16 - L12.tagW(st) });

      // the panel
      stRad.set({ text: pct(fr.rad), k: kIn, bump: flash(t, tiles[1].at, tiles[1].at + 0.5) });
      tiles.forEach((q, i) => {
        const k = L12.seq(t, 0.3, 0.08, 0.4, i);
        const on = t >= q.at;
        L12.setClass(q.el, on ? "v-card c-red" : "v-card plain c-grey");
        Object.assign(q.el.style, {
          background: on ? "var(--c)" : "",
          borderColor: on ? "var(--c-lip)" : "",
          boxShadow: on ? "0 6px 0 var(--c-lip)" : "",
          color: on ? "var(--c-on)" : "",
        });
        V.place(q.el, { s: (0.9 + 0.1 * E.pop(k)) * (1 + 0.06 * flash(t, q.at, q.at + 0.4)), o: Math.min(1, k * 4) });
        const lk = on ? ramp(t, q.at, q.at + 0.4) : 0;
        V.place(q.last, { x: (1 - E.out(lk)) * 16, o: lk });
      });
      const rk = ramp(t, RING[0], RING[1]);
      V.place(ring, { s: 0.94 + 0.06 * E.pop(rk) + 0.03 * flash(t, RING[1], RING[1] + 0.6), o: rk });
    };
  },
});
