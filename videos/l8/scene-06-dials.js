/* Lecture 8 video, scene 6: two dials. The transition rule is trail^alpha x closeness^beta: alpha says how much the ants
   trust the trail, beta how much they trust closeness. Alpha 0 ignores the trail (the nearest village wins: greedy); beta 0
   ignores distance (only the trail counts: the strongest trail wins, even from far away). Lesson 8.2's courier choosing among
   five villages. Every share comes from L8.DIAL (the lesson's rule, run and asserted in l8/common.js) and is re-derived here.
   Story (local seconds): 0.2-0.7 the alpha and beta dials, 0.5-1.3 five rows (village, distance, trail, empty bar), 0.9 the
   'trail' and 'closeness' tags, 1.4-2.2 the bars grow to the balanced shares (alpha = beta = 1); 3.05-3.9 ROLES: the trail
   tag, the alpha dial and every trail chip pulse in blue, 4.0-4.9 the closeness tag, the beta dial and every distance chip
   pulse in purple; 5.8-7.1 GREEDY: alpha slides to 0 and beta to 3, the trail chips grey out (ignored), the bars morph and the
   nearest village (Kell) wins, orange; 8.9-10.2 TRAIL: alpha slides to 3 and beta to 0, the distance chips grey out, the
   strongest trail (Sowe) wins. 10.5-12 hold. */
VID.scene({
  kicker: "TWO DIALS",
  title: ["Two dials set what", "the ants trust"],
  dur: 12,
  caps: [
    [0.5, 2.7, "Two dials set what the ants trust."],
    [3.0, 5.4, "Alpha trusts the trail, beta trusts closeness."],
    [6.0, 8.5, "Alpha 0: trails ignored, the nearest wins."],
    [9.2, 11.8, "Beta 0: only trails count, the strongest wins."],
  ],
  build(stage, V) {
    const L8 = V.l8;
    const { ramp, flash, lerp, ease: E } = V;

    // ---- the data: lesson 8.2's courier (computed and asserted in l8/common.js), asserted and re-derived here
    const C = L8.COURIER;
    const DL = L8.DIAL;
    const argmax = (a) => a.indexOf(Math.max(...a));
    L8.same(
      C.map((c) => `${c.name} ${c.d} km trail ${c.tau}`),
      ["Kell 2 km trail 1", "Marl 4 km trail 2", "Pell 5 km trail 3", "Rudd 8 km trail 6", "Sowe 10 km trail 9"],
      "scene 6: the courier's villages",
    );
    const share = (a, b) => {
      const w = C.map((c) => Math.pow(c.tau, a) * Math.pow(c.d, -b));
      const s = w.reduce((x, y) => x + y, 0);
      return w.map((x) => x / s);
    };
    ["balanced", "greedy", "trail"].forEach((k) => {
      L8.same(
        share(DL[k].alpha, DL[k].beta).map((x) => x.toFixed(6)),
        DL[k].p.map((x) => x.toFixed(6)),
        `scene 6: shares for the ${k} setting`,
      );
    });
    L8.same(
      [DL.balanced, DL.greedy, DL.trail].map((s) => [s.alpha, s.beta]),
      [
        [1, 1],
        [0, 3],
        [3, 0],
      ],
      "scene 6: dial settings",
    );
    L8.same(
      DL.balanced.p.map(L8.pct),
      [15, 15, 18, 23, 28],
      "scene 6: balanced shares in % (never printed: they do not add to 100)",
    );
    const FAV = { greedy: argmax(DL.greedy.p), trail: argmax(DL.trail.p) };
    const nearest = C.map((c) => c.d).indexOf(Math.min(...C.map((c) => c.d)));
    const strongest = C.map((c) => c.tau).indexOf(Math.max(...C.map((c) => c.tau)));
    L8.same(FAV.greedy, nearest, "scene 6: alpha 0 favours the nearest village");
    L8.same(FAV.trail, strongest, "scene 6: beta 0 favours the strongest trail");
    L8.same(L8.pct(DL.greedy.p[FAV.greedy]), 82, "scene 6: the nearest village's share in %");
    L8.same(L8.pct(DL.trail.p[FAV.trail]), 74, "scene 6: the strongest trail's share in %");
    L8.same(C[FAV.greedy].name, "Kell", "scene 6: the greedy favourite");
    L8.same(C[FAV.trail].name, "Sowe", "scene 6: the trail favourite");
    const A = [DL.balanced.alpha, DL.greedy.alpha, DL.trail.alpha];
    const B = [DL.balanced.beta, DL.greedy.beta, DL.trail.beta];

    // ---- timeline (local seconds)
    const T = {
      dials: 0.2, // two dials, 0.1 s apart
      rows: 0.5, // five rows, 0.1 s apart
      tags: 0.9,
      chance: 1.3,
      bars: 1.4, // bars grow to the balanced shares
      mode: 1.4,
      aPulse: 3.05, // the trail tag, alpha dial and trail chips
      bPulse: 4.0, // the closeness tag, beta dial and distance chips
      g: [5.8, 7.0], // knobs slide to the greedy setting
      t: [8.9, 10.1], // knobs slide to the trail setting
      lab: [7.2, 10.3], // the winners' labels
    };
    const MORPH = 0.1; // the bars follow the knobs by this much
    const NOTICE = 0.5; // a setting this close to 0 counts as 'off' for its chips

    // ---- layout: the two dials, their tags, the setting tag and the 'chance' header, five rows
    const wrap = (x) => {
      const w = V.h("div", { style: L8.abs(x, 4, 400, 60) });
      stage.append(w);
      return w;
    };
    const [wa, wb] = [wrap(24), wrap(500)];
    const da = L8.dial(wa, { x: 0, y: 0, w: 400, label: "α", min: 0, max: 3, tone: "blue" });
    const db = L8.dial(wb, { x: 0, y: 0, w: 400, label: "β", min: 0, max: 3, tone: "purple" });
    const tagTrail = L8.tag(stage, { x: 94, y: 70, text: "trail", tone: "blue" });
    const tagClose = L8.tag(stage, { x: 570, y: 70, text: "closeness", tone: "purple" });
    const mode = L8.tag(stage, { x: 12, y: 146, text: "α = β = 1", tone: "grey" });
    const head = L8.tag(stage, { x: 424, y: 146, text: "chance", tone: "orange" });

    const Y = (i) => 262 + 80 * i;
    const BAR = { x: 410, full: 404 };
    const names = C.map((c, i) => L8.tag(stage, { x: 12, y: Y(i) - 28, text: c.name, tone: "grey" }));
    const dists = C.map((c, i) =>
      L8.chip(stage, { x: 138, y: Y(i) - 26, w: 112, h: 52, text: `${c.d} km`, tone: "purple", fs: 30, radius: 18 }),
    );
    const trails = C.map((c, i) =>
      L8.chip(stage, { x: 262, y: Y(i) - 26, w: 136, h: 52, text: `trail ${c.tau}`, tone: "blue", fs: 28, radius: 18 }),
    );
    const bars = C.map((_, i) =>
      L8.bar(stage, { x: BAR.x, y: Y(i) - 26, w: 514, h: 52, tone: "grey", full: BAR.full }),
    );
    // the winners' labels sit just after the end of their bars
    const label = (set, who) =>
      L8.tag(stage, {
        x: BAR.x + DL[set].p[who] * BAR.full + 14,
        y: Y(who) - 28,
        text: `${L8.pct(DL[set].p[who])}%`,
        tone: "orange",
        solid: true,
      });
    const labGreedy = label("greedy", FAV.greedy);
    const labTrail = label("trail", FAV.trail);

    return (t) => {
      // ---- the dials: balanced -> greedy -> trail
      const s1 = ramp(t, T.g[0], T.g[1], E.inOut);
      const s2 = ramp(t, T.t[0], T.t[1], E.inOut);
      const alpha = lerp(lerp(A[0], A[1], s1), A[2], s2);
      const beta = lerp(lerp(B[0], B[1], s1), B[2], s2);
      da.set({ v: alpha, k: L8.seq(t, T.dials, 0.1, 0.4, 0) });
      db.set({ v: beta, k: L8.seq(t, T.dials, 0.1, 0.4, 1) });
      const aPulse = flash(t, T.aPulse, T.aPulse + 0.85);
      const bPulse = flash(t, T.bPulse, T.bPulse + 0.85);
      V.place(wa, { s: 1 + 0.05 * aPulse });
      V.place(wb, { s: 1 + 0.05 * bPulse });
      tagTrail.set({ k: ramp(t, T.tags, T.tags + 0.4, E.lin), s: 1 + 0.15 * aPulse });
      tagClose.set({ k: ramp(t, T.tags, T.tags + 0.4, E.lin), s: 1 + 0.15 * bPulse });

      // ---- the setting tag names what each dial setting means
      const text =
        t >= T.t[0] + 0.05 ? "β = 0: closeness ignored" : t >= T.g[0] + 0.05 ? "α = 0: trails ignored" : "α = β = 1";
      const tone = t >= T.t[0] + 0.05 ? "purple" : t >= T.g[0] + 0.05 ? "blue" : "grey";
      mode.set({
        text,
        tone,
        k: ramp(t, T.mode, T.mode + 0.4, E.lin),
        s: 1 + 0.12 * Math.max(flash(t, T.g[0] + 0.05, T.g[0] + 0.45), flash(t, T.t[0] + 0.05, T.t[0] + 0.45)),
      });
      head.set({ k: ramp(t, T.chance, T.chance + 0.4, E.lin) });

      // ---- the bars: grow to the balanced shares, then morph with the knobs; the winner turns orange
      const m1 = ramp(t, T.g[0] + MORPH, T.g[1] + MORPH, E.inOut);
      const m2 = ramp(t, T.t[0] + MORPH, T.t[1] + MORPH, E.inOut);
      const p = C.map((_, i) => lerp(lerp(DL.balanced.p[i], DL.greedy.p[i], m1), DL.trail.p[i], m2));
      const top = argmax(p);
      const crowned = m2 > 0 ? top === FAV.greedy || top === FAV.trail : m1 > 0 && top === FAV.greedy;

      // ---- the chips: grey and dashed while their dial is (almost) 0, ringed on the winner
      const trailOff = alpha < NOTICE;
      const distOff = beta < NOTICE;
      const greedyWin = ramp(t, T.lab[0], T.lab[0] + 0.3) * (1 - ramp(t, T.t[0] - 0.2, T.t[0] + 0.05, E.lin));
      const trailWin = ramp(t, T.lab[1], T.lab[1] + 0.3);

      C.forEach((c, i) => {
        const k = L8.seq(t, T.rows, 0.1, 0.4, i);
        names[i].set({ k });
        const pa = flash(t, T.aPulse + 0.05 + 0.08 * i, T.aPulse + 0.55 + 0.08 * i);
        const pb = flash(t, T.bPulse + 0.05 + 0.08 * i, T.bPulse + 0.55 + 0.08 * i);
        trails[i].set({
          k,
          tone: trailOff ? "grey" : "blue",
          ghost: trailOff,
          s: 1 + 0.12 * pa,
          ring: "blue",
          ringK: Math.max(pa, i === FAV.trail ? trailWin : 0),
        });
        dists[i].set({
          k,
          tone: distOff ? "grey" : "purple",
          ghost: distOff,
          s: 1 + 0.12 * pb,
          ring: "purple",
          ringK: Math.max(pb, i === FAV.greedy ? greedyWin : 0),
        });
        const grow = ramp(t, T.bars + 0.05 * i, T.bars + 0.55 + 0.05 * i, E.out);
        bars[i].set({ k, v: p[i] * grow, tone: crowned && i === top ? "orange" : "grey" });
      });

      // ---- the winners' labels
      labGreedy.set({
        k: ramp(t, T.lab[0], T.lab[0] + 0.4, E.lin),
        o: 1 - ramp(t, T.t[0] - 0.2, T.t[0] + 0.05, E.lin),
      });
      labTrail.set({ k: ramp(t, T.lab[1], T.lab[1] + 0.4, E.lin) });
    };
  },
});
