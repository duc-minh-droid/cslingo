/* Lecture 8 video, scene 6: two dials. The transition rule is trail^alpha x closeness^beta: alpha says how much the ants
   trust the trail, beta how much they trust closeness. Alpha 0 ignores the trail (the nearest village wins: greedy); beta 0
   ignores distance (only the trail counts: the strongest trail wins, even from far away). Lesson 8.2's courier choosing among
   five villages. Every share comes from L8.DIAL (the lesson's rule, run and asserted in l8/common.js) and is re-derived here.
   Story (local seconds): 0.2-0.7 the alpha and beta dials, 0.5-1.3 five rows (village and distance, closeness 1/d, trail, empty
   bar), 0.9 the rule 'score = trail^alpha x closeness^beta' (alpha and beta are small discs in the dials' colours, raised like
   exponents), 1.4-2.2 the bars grow to the balanced shares (alpha = beta = 1: scene 4's rule); 2.8-3.65 ROLES: the 'trail' part
   of the rule, the alpha dial and every trail chip pulse in blue, 3.7-4.55 the 'closeness' part, the beta dial and every
   closeness chip pulse in purple; 5.0-6.3 GREEDY: alpha slides to 0 and beta to 3, the trail chips grey out (ignored), the bars
   morph and the nearest village (Kell) is favoured, orange; the setting tag changes only when the knobs land (6.2); 8.6-9.9
   TRAIL: alpha slides to 3 and beta to 0, the closeness chips grey out, the strongest trail (Sowe) is favoured (9.8). 10-12.9
   hold. */
VID.scene({
  kicker: "TWO DIALS",
  title: ["Two dials set what", "the ants trust"],
  dur: 12.9,
  caps: [
    [0.5, 2.6, "Same rule as before, with two dials."],
    [2.7, 5.0, "Alpha trusts the trail; beta, closeness."],
    [6.2, 8.5, "Alpha 0, beta 3: the nearest is favoured."],
    [9.8, 12.6, "Alpha 3, beta 0: the strongest trail is favoured."],
  ],
  build(stage, V) {
    const L8 = V.l8;
    const L5 = V.l5;
    const { ramp, flash, clamp, lerp, ease: E } = V;

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
      tags: 0.9, // the rule
      chance: 1.3,
      bars: 1.4, // bars grow to the balanced shares
      mode: 1.4,
      aPulse: 2.8, // the trail part of the rule, alpha dial and trail chips
      bPulse: 3.7, // the closeness part, beta dial and closeness chips
      g: [5.0, 6.2], // knobs slide to the greedy setting
      t: [8.6, 9.8], // knobs slide to the trail setting
      lab: [6.4, 10.0], // the favourites' labels
    };
    const MORPH = 0.1; // the bars follow the knobs by this much
    const NOTICE = 0.5; // a setting this close to 0 counts as 'off' for its chips

    // ---- layout: the two dials, their tags, the setting tag and the 'chance' header, five rows
    const wrap = (x) => {
      const w = V.h("div", { style: L8.abs(x, 16, 400, 60) });
      stage.append(w);
      return w;
    };
    const [wa, wb] = [wrap(24), wrap(500)];
    const da = L8.dial(wa, { x: 0, y: 0, w: 400, label: "α", min: 0, max: 3, tone: "blue" });
    const db = L8.dial(wb, { x: 0, y: 0, w: 400, label: "β", min: 0, max: 3, tone: "purple" });
    // the rule these dials belong to: score = trail^alpha x closeness^beta (the exponents are small discs, raised)
    const FY = 90;
    const signs = L5.svg(stage);
    const ruleScore = L8.tag(stage, { x: 160, y: FY, text: "score", tone: "grey" });
    const ruleEq = signs.appendChild(L8.mark("equals", 300, FY + 30, 32, "grey"));
    const tagTrail = L8.tag(stage, { x: 327, y: FY, text: "trail", tone: "blue" });
    const expA = L8.disc(stage, { x: 474, y: FY + 12, size: 52, text: "α", tone: "blue" });
    const ruleTimes = signs.appendChild(L8.mark("times", 530, FY + 30, 32, "purple"));
    const tagClose = L8.tag(stage, { x: 556, y: FY, text: "closeness", tone: "purple" });
    const expB = L8.disc(stage, { x: 760, y: FY + 12, size: 52, text: "β", tone: "purple" });
    const mode = L8.tag(stage, { x: 20, y: 166, text: "α = β = 1", tone: "grey" });
    const head = L8.tag(stage, { x: 780, y: 166, text: "chance", tone: "orange" });

    const Y = (i) => 280 + 78 * i;
    const BAR = { x: 490, w: 434 };
    const names = C.map((c, i) => L8.tag(stage, { x: 18, y: Y(i) - 30, text: `${c.name} · ${c.d} km`, tone: "grey" }));
    // closeness is 1 over the distance (purple, as in scene 4); the distance itself stays grey in the name tag
    const closes = C.map((c, i) =>
      L8.chip(stage, { x: 244, y: Y(i) - 26, w: 100, h: 52, text: `1/${c.d}`, tone: "purple", fs: 30, radius: 18 }),
    );
    const trails = C.map((c, i) =>
      L8.chip(stage, { x: 356, y: Y(i) - 26, w: 126, h: 52, text: `trail ${c.tau}`, tone: "blue", fs: 28, radius: 18 }),
    );
    // a bar is a share of 1, so its track ends at 100 %; a favourite's share is written inside the end of its bar
    const bars = C.map((_, i) => L8.bar(stage, { x: BAR.x, y: Y(i) - 26, w: BAR.w, h: 52, tone: "grey", full: BAR.w }));

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
      const rk = (d) => ramp(t, T.tags + d, T.tags + d + 0.4, E.lin);
      const pop = (g, k) => V.place(g, { s: 0.6 + 0.4 * E.pop(k), o: clamp(k * 4) });
      ruleScore.set({ k: rk(0) });
      pop(ruleEq, rk(0.1));
      tagTrail.set({ k: rk(0.2), s: 1 + 0.08 * aPulse });
      expA.set({ k: rk(0.3), s: 1 + 0.15 * aPulse });
      pop(ruleTimes, rk(0.4));
      tagClose.set({ k: rk(0.5), s: 1 + 0.08 * bPulse });
      expB.set({ k: rk(0.6), s: 1 + 0.15 * bPulse });

      // ---- the setting tag names both dials, and changes only when its knobs have landed
      const landed = t >= T.t[1] ? 2 : t >= T.g[1] ? 1 : 0;
      const MODES = [
        ["α = β = 1", "grey"],
        ["α = 0, β = 3: trails ignored", "blue"],
        ["α = 3, β = 0: closeness ignored", "purple"],
      ];
      mode.set({
        text: MODES[landed][0],
        tone: MODES[landed][1],
        k: ramp(t, T.mode, T.mode + 0.4, E.lin),
        s: 1 + 0.03 * Math.max(flash(t, T.g[1], T.g[1] + 0.4), flash(t, T.t[1], T.t[1] + 0.4)),
      });
      head.set({ k: ramp(t, T.chance, T.chance + 0.4, E.lin) });

      // ---- the bars: grow to the balanced shares, then morph with the knobs; the winner turns orange
      const m1 = ramp(t, T.g[0] + MORPH, T.g[1] + MORPH, E.inOut);
      const m2 = ramp(t, T.t[0] + MORPH, T.t[1] + MORPH, E.inOut);
      const p = C.map((_, i) => lerp(lerp(DL.balanced.p[i], DL.greedy.p[i], m1), DL.trail.p[i], m2));
      const lead = argmax(p);
      const crowned = m2 > 0 ? lead === FAV.greedy || lead === FAV.trail : m1 > 0 && lead === FAV.greedy;

      // ---- the chips: grey and dashed while their dial is (almost) 0, ringed on the winner
      const trailOff = alpha < NOTICE;
      const closeOff = beta < NOTICE;
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
        closes[i].set({
          k,
          tone: closeOff ? "grey" : "purple",
          ghost: closeOff,
          s: 1 + 0.12 * pb,
          ring: "purple",
          ringK: Math.max(pb, i === FAV.greedy ? greedyWin : 0),
        });
        const grow = ramp(t, T.bars + 0.05 * i, T.bars + 0.55 + 0.05 * i, E.out);
        // the favourite's share is written inside the end of its bar once the knobs have settled
        const said =
          i === FAV.greedy && t >= T.lab[0] && t < T.t[0] - 0.1
            ? L8.pct(DL.greedy.p[i])
            : i === FAV.trail && t >= T.lab[1]
              ? L8.pct(DL.trail.p[i])
              : null;
        bars[i].set({
          k,
          v: p[i] * grow,
          tone: crowned && i === lead ? "orange" : "grey",
          text: said == null ? "" : `${said}%`,
          textIn: true,
        });
      });
    };
  },
});
