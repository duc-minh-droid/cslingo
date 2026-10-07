/* Lecture 3 · Local search, scene 09-local-search.
   Two stacked landscape panels (the shared "multi" curve). Top: Monte Carlo (26 tries, a worse neighbour is accepted 1 time in 10,
   with a die). Bottom: Tabu (15 steps, best neighbour that is not on the crumb list). Both start on the left hill where
   hillclimbing is stuck, both keep a best-so-far diamond and both end on the global best (the orange star).
   Everything is looked up by time from the real runs (L3.mc, L3.tabu), computed once at build time. */
(function () {
  const V = window.VID;
  const L3 = V.l3;
  const L5 = V.l5;
  const { ramp, ease: E, clamp } = V;
  const f1 = (n) => (+n).toFixed(1);

  // ---------- the real runs, checked against the lecture ----------
  const F = L3.fvals("multi");
  const START = 7;
  const MC = L3.mc(F, { start: START, r: 3, p: 0.1, seed: 435858, tries: 26 });
  const TB = L3.tabu(F, { start: START, r: 3, tenure: 5, steps: 15 });
  const want = (a, b, what) => {
    if (JSON.stringify(a) !== JSON.stringify(b))
      throw new Error(`scene 09: ${what}: got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`);
  };
  want(MC.slice(0, 10).map((e) => e.m), [10, 8, 5, 9, 4, 6, 9, 5, 10, 4], "Monte Carlo proposals 1-10");
  want(MC.slice(0, 10).map((e) => e.acc), Array(10).fill(false), "tries 1-10 rejected");
  want(
    MC.slice(10).map((e) => `${e.m}${e.acc ? (e.down ? "d" : "u") : "r"}`),
    ["10d", "13r", "13d", "11r", "16u", "13r", "19u", "17u", "19d", "16r", "22d", "23r", "25u", "23r", "27u", "29u"],
    "Monte Carlo tries 11-26",
  );
  want(MC[MC.length - 1].c, 29, "Monte Carlo ends on the star");
  want(
    MC.filter((e, k) => e.best !== (k ? MC[k - 1].best : START)).map((e) => `${e.k}:${e.best}`),
    ["15:16", "17:19", "18:17", "26:29"],
    "Monte Carlo best-so-far moves",
  );
  want([START, ...TB.map((s) => s.pick)], [7, 8, 6, 9, 10, 13, 16, 18, 17, 19, 20, 21, 22, 25, 28, 29], "Tabu path");
  want(TB[0].cands.map((c) => c.i), [8, 6, 9, 5, 10, 4], "Tabu step 1 candidates");
  want(TB[1].cands.map((c) => `${c.i}${c.tabu ? "t" : ""}`), ["7t", "6", "9", "5", "10", "11"], "Tabu step 2 candidates");
  want(
    TB.filter((s, k) => s.best !== (k ? TB[k - 1].best : START)).map((s) => `${s.k}:${s.best}`),
    ["6:16", "7:18", "14:28", "15:29"],
    "Tabu best-so-far moves",
  );
  const PATH = [START, ...TB.map((s) => s.pick)];
  TB.forEach((s) => {
    // the crumb of path position j falls out of the list at step j + 5
    if (s.k >= 5) want(s.dropped, PATH[s.k - 5], `tabu step ${s.k} drops its oldest crumb`);
  });

  // ---------- timing ----------
  const MC_T0 = 1.6;
  const MC_DT = 0.22;
  const mcT = (k) => MC_T0 + MC_DT * (k - 1); // try k starts
  const TB_STEP = [
    { a: 8.5, b: 8.9 },
    { a: 9.7, b: 10.1 },
  ];
  for (let k = 3; k <= 15; k++) {
    const t0 = 10.1 + 0.22 * (k - 3);
    TB_STEP.push({ a: t0 + 0.02, b: t0 + 0.22 });
  }

  // hop windows {a, b, from, to}: the hiker, and the diamond which hops once the hiker has landed
  const hikerWins = (list, timeOf) =>
    list.flatMap((e, k) => (e.to !== e.from ? [{ ...timeOf(k), from: e.from, to: e.to }] : []));
  const mcHiker = hikerWins(
    MC.map((e) => ({ from: e.from, to: e.acc ? e.m : e.from })),
    (k) => ({ a: mcT(k + 1) + 0.02, b: mcT(k + 1) + 0.22 }),
  );
  const tbHiker = hikerWins(
    TB.map((s) => ({ from: s.from, to: s.pick })),
    (k) => TB_STEP[k],
  );
  const bestWins = (list, startI, hikerOf) => {
    const out = [];
    let prev = startI;
    list.forEach((e, k) => {
      if (e.best !== prev) {
        const b0 = hikerOf(k).b;
        out.push({ a: b0, b: b0 + 0.3, from: prev, to: e.best });
        prev = e.best;
      }
    });
    return out;
  };
  const mcBest = bestWins(MC, START, (k) => ({ b: mcT(k + 1) + 0.22 }));
  const tbBest = bestWins(TB, START, (k) => TB_STEP[k]);

  // where is a hopper at time t? (index, extra lift)
  const at = (wins, start, t, height) => {
    let i = start;
    for (const w of wins) {
      if (t >= w.b) i = w.to;
      else if (t >= w.a) {
        const h = L3.hop(w.from, w.to, (t - w.a) / (w.b - w.a), height);
        return { i: h.i, dy: h.dy };
      }
    }
    return { i, dy: 0 };
  };
  const leaveT = (wins) => wins[0].a;

  // ---------- small drawing helpers ----------
  const tagBox = (el, w, padL) => {
    Object.assign(el.style, { height: "52px", minWidth: `${w}px`, boxSizing: "border-box", paddingLeft: `${padL}px` });
    return el;
  };
  const fadeIn = (t, a, d = 0.3) => ramp(t, a, a + d, E.lin);
  const pops = (t, a, d = 0.4) => E.pop(ramp(t, a, a + d, E.lin));

  V.scene({
    kicker: "LOCAL SEARCH",
    title: ["Escape by sometimes", "stepping downhill"],
    dur: 14,
    caps: [
      [0.4, 1.7, "Hillclimbing is stuck on this hill."],
      [1.8, 5.4, "Monte Carlo sometimes accepts a worse step."],
      [5.6, 7.5, "It keeps the best so far."],
      [8, 12, "Tabu always moves on, avoiding its crumbs."],
      [12.1, 13.5, "Both escape the small hill."],
    ],
    build(stage) {
      const PAD = { l: 24, r: 24, t: 112, b: 24 };
      const top = L3.land(stage, { x: 0, y: 0, w: 936, h: 290, kind: "multi", frame: true, pad: PAD });
      const bot = L3.land(stage, { x: 0, y: 345, w: 936, h: 290, kind: "multi", frame: true, pad: PAD });
      const rowY = (P) => P.box.y + 20;

      // ----- tags and their icons -----
      const mcTag = tagBox(top.tag("Monte Carlo", { at: "tl", tone: "purple" }), 244, 68);
      const pTag = top.tag("worse step: 1 in 10", { at: { x: 24 + 244 + 14, y: rowY(top) }, anchor: "l", tone: "grey" });
      tagBox(pTag, 0, 20);
      const tbTag = tagBox(bot.tag("Tabu", { at: "tl", tone: "grey" }), 170, 96);
      const legend = tagBox(top.tag("best so far", { at: "tr", tone: "orange" }), 250, 56);
      const tryTag = top.tag("try 0", { at: { x: 936 - 24, y: top.box.y + 150 }, anchor: "r", tone: "grey" });
      // icons sit in an SVG above the tags (the tags are HTML and would cover anything in P.over)
      const iconLayer = (P) => {
        const svg = V.s("svg", { width: 936, height: 640, style: { position: "absolute", left: "0px", top: "0px", overflow: "visible" } });
        P.html.append(svg);
        return svg;
      };
      const topIcons = iconLayer(top);
      const botIcons = iconLayer(bot);
      const miniDie = L5.dice(24 + 14 + 32, rowY(top) + 26, 34, { face: 5, tone: "purple" });
      topIcons.append(miniDie);
      const crumbIcons = V.s("g", {});
      [0, 1, 2].forEach((j) => {
        crumbIcons.append(
          V.s("circle", {
            cx: f1(24 + 22 + j * 20),
            cy: f1(rowY(bot) + 26),
            r: "6",
            style: { fill: "var(--node-off-ic)", stroke: "var(--node-off-lip)", strokeWidth: "2.5" },
          }),
        );
      });
      botIcons.append(crumbIcons);
      const legendDia = L3.diamond(936 - 24 - 250 + 30, rowY(top) + 26, 26);
      topIcons.append(legendDia);

      // the die (Monte Carlo only): one group per face, only one is shown
      const DIE_X = 936 - 24 - 56;
      const DIE_Y = top.box.y + 96 + 10;
      const dieG = V.s("g", {});
      const faces = [1, 2, 3, 4, 5, 6].map((n) => V.s("g", {}, L5.dice(0, 0, 56, { face: n, tone: "purple" })));
      dieG.append(...faces);
      top.over.append(dieG);

      // ----- markers -----
      const mk = (P) => {
        const m = {
          star: P.marker("star", { size: 44 }),
          crumbs: PATH.map(() => P.marker("crumb", { size: 16 })),
          cands: [0, 1, 2, 3, 4, 5].map(() => P.marker("ghost", { tone: "grey", size: 22 })),
          prop: P.marker("ghost", { size: 30 }),
          stuck: P.marker("badge", {}),
          quick: P.marker("badge", {}),
          down: P.marker("badge", {}),
          xs: [0, 1].map(() => P.marker("badge", {})),
          dia: P.marker("diamond", {}),
          hiker: P.marker("token", { size: 30 }),
        };
        return m;
      };
      const M = mk(top);
      const B = mk(bot);

      // state shared by both panels: curve, panel pop, star, hiker with the stuck badge
      const common = (P, m, t, hik, dia, leave) => {
        const pk = fadeIn(t, 0.3, 0.5);
        P.update({ curve: ramp(t, 0.4, 1.2, E.inOut), fill: ramp(t, 0.7, 1.3, E.lin), o: pk });
        const sk = pops(t, 1.0, 0.4);
        m.star.set({ i: P.best, s: sk, o: sk > 0 ? 1 : 0 });
        const hk = pops(t, 0.9, 0.4);
        m.hiker.set({ i: hik.i, dy: hik.dy, s: hk * (1 + 0.18 * V.flash(t, 7.4, 7.9) * (P === top)), o: hk > 0 ? 1 : 0 });
        const dk = pops(t, 1.0, 0.4);
        m.dia.set({ i: dia.i, dy: dia.dy, s: dk, o: dk > 0 ? 1 : 0 });
        const stk = pops(t, 1.2, 0.4) * (1 - ramp(t, leave, leave + 0.25, E.lin));
        m.stuck.set({ i: START, dy: -28, icon: "cross", k: stk, o: stk > 0.001 ? stk : 0 });
      };

      return (t) => {
        // ===== Monte Carlo =====
        const qi = L3.stepAt(t, MC_T0, MC_DT, MC.length);
        const hk = at(mcHiker, START, t, 30);
        const dm = at(mcBest, START, t, 26);
        common(top, M, t, hk, dm, leaveT(mcHiker));
        const e = qi.n ? MC[qi.i] : null;
        const t0 = e ? mcT(e.k) : 0;
        const lt = e ? t - t0 : 9;
        const live = !!e && t < mcT(MC.length) + 0.5;
        // proposal ring: red with a cross when rejected, purple while it is being taken
        const pr = live ? ramp(lt, 0, 0.08, E.lin) * (1 - ramp(lt, 0.18, 0.28, E.lin)) : 0;
        M.prop.set({ i: e ? e.m : 0, tone: e && !e.acc ? "red" : "purple", s: 0.8 + 0.2 * pr, o: pr });
        // short outcome badge: cross for a rejected step, tick for an uphill one
        const qk = live && e && !e.down ? pops(lt, 0.04, 0.2) * (1 - ramp(lt, 0.2, 0.3, E.lin)) : 0;
        M.quick.set({ i: e ? e.m : 0, dy: e && e.acc ? -12 : 26, icon: e && e.acc ? "tick" : "cross", k: qk, s: 0.7, o: qk > 0.001 ? 1 : 0 });
        // a lucky downhill step lingers a little longer
        const dwn = MC.find((x) => x.down && t >= mcT(x.k) && t < mcT(x.k) + 0.8);
        const dk = dwn ? pops(t - mcT(dwn.k), 0.1, 0.3) * (1 - ramp(t - mcT(dwn.k), 0.6, 0.8, E.lin)) : 0;
        M.down.set({ i: dwn ? dwn.m : 0, dy: -12, icon: "down", k: dk, s: 0.85, o: dk > 0.001 ? 1 : 0 });
        M.xs.forEach((m) => m.set({ k: 0, o: 0 }));
        M.crumbs.forEach((m) => m.set({ o: 0 }));
        M.cands.forEach((m) => m.set({ o: 0 }));
        // die, counter
        const rolling = !!e && e.worse && lt < 0.12;
        const shown = e && e.worse ? (rolling ? 1 + (Math.floor(lt * 60) % 6) : L3.dieFace(e)) : 0;
        const lastWorse = [...MC.slice(0, qi.n)].reverse().find((x) => x.worse);
        const face = shown || (lastWorse ? L3.dieFace(lastWorse) : 1);
        const dk0 = fadeIn(t, 1.3, 0.3);
        faces.forEach((g, n) => V.show(g, +(n + 1 === face)));
        const shake = rolling ? Math.sin(lt * 120) * 14 : 0;
        V.place(dieG, { x: DIE_X, y: DIE_Y, s: 0.8 + 0.2 * pops(t, 1.3, 0.4), r: shake, o: Math.min(dk0, e && !e.worse ? 0.45 : 1) });
        dieG.style.transform = `translate(${DIE_X}px, ${DIE_Y}px) rotate(${f1(shake)}deg)`;
        dieG.style.transformOrigin = "0 0";
        dieG.style.transformBox = "view-box";
        const tn = ramp(t, 1.4, 1.7, E.lin);
        tryTag.set({ text: `try ${qi.n}`, o: tn * (t < 1.4 ? 0 : 1) });
        // legend and mini die appear with their captions
        const lg = pops(t, 5.6, 0.4);
        legend.set({ s: 0.85 + 0.15 * lg, o: lg > 0 ? Math.min(1, lg * 3) : 0 });
        V.show(legendDia, lg > 0 ? Math.min(1, lg * 3) : 0);
        mcTag.set({ o: fadeIn(t, 0.7, 0.4) });
        pTag.set({ o: fadeIn(t, 0.9, 0.4) });
        V.show(miniDie, fadeIn(t, 0.7, 0.4));

        // ===== Tabu =====
        const tk = at(tbHiker, START, t, 30);
        const td = at(tbBest, START, t, 26);
        common(bot, B, t, tk, td, leaveT(tbHiker));
        tbTag.set({ o: fadeIn(t, 0.7, 0.4) });
        V.show(crumbIcons, fadeIn(t, 0.7, 0.4));
        // candidate rings for the first two (slow) steps
        B.cands.forEach((m) => m.set({ o: 0 }));
        B.prop.set({ o: 0 });
        B.quick.set({ k: 0, o: 0 });
        B.xs.forEach((m) => m.set({ k: 0, o: 0 }));
        [0, 1].forEach((si) => {
          const s0 = si ? 8.9 : 7.8;
          const hopA = TB_STEP[si].a;
          const ringsOn = t >= s0 && t < hopA + 0.05;
          if (!ringsOn) return;
          const gone = 1 - ramp(t, hopA - 0.05, hopA + 0.05, E.lin);
          const chosen = TB[si].cands.findIndex((c) => !c.tabu);
          TB[si].cands.forEach((c, j) => {
            const kk = pops(t, s0 + 0.06 * j, 0.3);
            const lit = t >= s0 + (si ? 0.95 : 0.9);
            const isTabu = c.tabu && t >= s0 + 0.55;
            B.cands[j].set({
              i: c.i,
              tone: j === chosen && lit ? "orange" : isTabu ? "red" : "grey",
              ring: j === chosen && lit ? "orange" : null,
              ringK: ramp(t, s0 + 0.9, s0 + 1.1, E.lin),
              s: (0.8 + 0.2 * kk) * (j === chosen && lit ? 1.15 : 1),
              o: Math.min(1, kk * 3) * gone,
            });
            if (c.tabu) {
              const xk = pops(t, s0 + 0.55, 0.3) * gone;
              B.xs[0].set({ i: c.i, dy: 49, icon: "cross", k: xk, s: 0.55, o: xk > 0.001 ? 1 : 0 });
            }
          });
        });
        // the down arrow after a downhill step (also on the quick steps)
        const dstep = TB.find((s, k) => s.down && t >= TB_STEP[k].b - 0.05 && t < TB_STEP[k].b + 0.55);
        const dsi = dstep ? dstep.k - 1 : 0;
        const dtk = dstep ? pops(t - TB_STEP[dsi].b, 0.05, 0.25) * (1 - ramp(t - TB_STEP[dsi].b, 0.35, 0.55, E.lin)) : 0;
        B.down.set({ i: dstep ? dstep.pick : 0, dy: -12, icon: "down", k: dtk, s: 0.85, o: dtk > 0.001 ? 1 : 0 });
        // crumbs: path position j is on the floor from the moment the hiker leaves it until it drops out of the list
        B.crumbs.forEach((m, j) => {
          if (j >= TB.length) return m.set({ o: 0 });
          const drop = TB_STEP[j].a;
          const out = j + 5 <= TB.length ? TB_STEP[j + 4].b : 1e9;
          const kk = ramp(t, drop, drop + 0.2, E.out) * (1 - ramp(t, out, out + 0.15, E.lin));
          m.set({ i: PATH[j], dy: -(1 - ramp(t, drop, drop + 0.2, E.out)) * 26, o: kk > 0.001 ? kk : 0 });
        });
      };
    },
  });
})();
