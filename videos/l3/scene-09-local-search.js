/* Lecture 3 · Local search, scene 09-local-search.
   Two stacked landscape panels (the shared "multi" curve). Top: Monte Carlo (26 tries, a worse neighbour is accepted 1 time in 10,
   with a die). Bottom: Tabu (15 steps, best neighbour that is not on the crumb list). Both start on the left hill where
   hillclimbing is stuck, both keep a best-so-far diamond and both end on the global best (the orange star).
   Everything is looked up by time from the real runs (L3.mc, L3.tabu), computed once at build time. */
(function () {
  const V = window.VID;
  const L3 = V.l3;
  const L5 = V.l5;
  const { ramp, ease: E } = V;
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
  want(
    MC.slice(0, 10).map((e) => e.m),
    [10, 8, 5, 9, 4, 6, 9, 5, 10, 4],
    "Monte Carlo proposals 1-10",
  );
  want(
    MC.slice(0, 10).map((e) => e.acc),
    Array(10).fill(false),
    "tries 1-10 rejected",
  );
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
  want(
    TB[0].cands.map((c) => c.i),
    [8, 6, 9, 5, 10, 4],
    "Tabu step 1 candidates",
  );
  want(
    TB[1].cands.map((c) => `${c.i}${c.tabu ? "t" : ""}`),
    ["7t", "6", "9", "5", "10", "11"],
    "Tabu step 2 candidates",
  );
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
  // Monte Carlo: tries 1-3 and the first lucky downhill step (try 11) are slow, the rest is a fast-forward.
  const MC_T0 = 1.6;
  const SLOW = new Set([1, 2, 3, 11]);
  const mcDur = (k) => (k === 11 ? 1.3 : SLOW.has(k) ? 0.8 : 0.2);
  const MC_S = [];
  MC.reduce((t0, e) => (MC_S.push(t0), t0 + mcDur(e.k)), MC_T0);
  const mcT = (k) => MC_S[k - 1];
  const MC_END = mcT(MC.length) + mcDur(MC.length);
  const mcHop = (k) => (SLOW.has(k) ? { a: 0.5, b: 0.9 } : { a: 0.02, b: 0.2 });
  const mcWin = (k) => ({ a: mcT(k) + mcHop(k).a, b: mcT(k) + mcHop(k).b });
  // which try is on, and how far in (seconds)
  const mcAt = (t) => {
    let n = 0;
    MC_S.forEach((s0, j) => (t >= s0 ? (n = j + 1) : 0));
    return n;
  };
  // Tabu: steps 1 and 2 are slow (candidates, crumbs), the rest is a fast-forward
  const TB_T0 = MC_END + 0.3;
  const TB_RING = [TB_T0 + 0.3, TB_T0 + 1.8];
  const TB_STEP = [
    { a: TB_T0 + 1.2, b: TB_T0 + 1.6 },
    { a: TB_T0 + 3.0, b: TB_T0 + 3.4 },
  ];
  const TB_FAST = TB_T0 + 3.7;
  for (let k = 3; k <= 15; k++) {
    const t0 = TB_FAST + 0.2 * (k - 3);
    TB_STEP.push({ a: t0 + 0.02, b: t0 + 0.2 });
  }
  const TB_END = TB_FAST + 0.2 * 13;

  // hop windows {a, b, from, to}: the hiker, and the diamond which hops once the hiker has landed
  const hikerWins = (list, timeOf) =>
    list.flatMap((e, k) => (e.to !== e.from ? [{ ...timeOf(k), from: e.from, to: e.to }] : []));
  const mcHiker = hikerWins(
    MC.map((e) => ({ from: e.from, to: e.acc ? e.m : e.from })),
    (k) => mcWin(k + 1),
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
  const mcBest = bestWins(MC, START, (k) => mcWin(k + 1));
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
    dur: 18,
    caps: [
      [0.4, 1.5, "Hillclimbing is stuck on this hill."],
      [1.7, 4.0, "A worse step is usually rejected."],
      [4.1, 5.3, "Fast-forward: all rejected."],
      [5.5, 6.8, "One lucky roll: it steps downhill!"],
      [7.0, 9.7, "Then it climbs on, keeping the best."],
      [TB_T0, TB_STEP[0].b + 0.1, "Tabu always moves to its best neighbour."],
      [TB_RING[1] - 0.1, TB_STEP[1].b, "But it cannot step back onto a crumb."],
      [TB_FAST - 0.2, TB_END - 0.1, "So it walks on, over the valley."],
      [TB_END + 0.2, 17.8, "Both can escape the small hill."],
    ],
    build(stage) {
      const PAD = { l: 24, r: 24, t: 112, b: 24 };
      const top = L3.land(stage, { x: 0, y: 0, w: 936, h: 290, kind: "multi", frame: true, pad: PAD });
      const bot = L3.land(stage, { x: 0, y: 345, w: 936, h: 290, kind: "multi", frame: true, pad: PAD });
      const rowY = (P) => P.box.y + 20;

      // ----- tags and their icons -----
      const mcTag = tagBox(top.tag("Monte Carlo", { at: "tl", tone: "purple" }), 244, 68);
      const pTag = top.tag("worse step: 1 in 10", {
        at: { x: 24 + 244 + 14, y: rowY(top) },
        anchor: "l",
        tone: "grey",
      });
      tagBox(pTag, 0, 20);
      const tbTag = tagBox(bot.tag("Tabu: no going back", { at: "tl", tone: "grey" }), 330, 96);
      const legend = tagBox(top.tag("best so far", { at: "tr", tone: "orange" }), 250, 56);
      const legend2 = tagBox(bot.tag("best so far", { at: "tr", tone: "orange" }), 250, 56);
      const tryTag = top.tag("try 0", { at: { x: 936 - 24, y: top.box.y + 150 }, anchor: "r", tone: "grey" });
      // icons sit in an SVG above the tags (the tags are HTML and would cover anything in P.over)
      const iconLayer = (P) => {
        const svg = V.s("svg", {
          width: 936,
          height: 640,
          style: { position: "absolute", left: "0px", top: "0px", overflow: "visible" },
        });
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
      const legendDia2 = L3.diamond(936 - 24 - 250 + 30, rowY(bot) + 26, 26);
      botIcons.append(legendDia2);

      // the roll: ten slots, only the first one lets a worse step through (p = 0.1); the rolled slot lights up
      const SLOT_X = 716;
      const SLOT_Y = top.box.y + 94;
      const strip = V.s("g", {});
      const slots = Array.from({ length: 10 }, (_, n) => {
        const r = V.s("rect", {
          x: SLOT_X + n * 20,
          y: SLOT_Y,
          width: 16,
          height: 28,
          rx: 4,
          style: {
            fill: "var(--panel)",
            stroke: n ? "var(--node-off-lip)" : "var(--teal-lip)",
            strokeWidth: n ? "2.5" : "3.5",
          },
        });
        strip.append(r);
        return r;
      });
      top.over.append(strip);

      // ----- markers -----
      const mk = (P, crumb) => ({
        star: P.marker("star", { size: 44 }),
        crumbs: PATH.map(() => P.marker("crumb", { size: crumb })),
        cands: [0, 1, 2, 3, 4, 5].map(() => P.marker("ghost", { tone: "grey", size: 22 })),
        prop: P.marker("ghost", { size: 30 }),
        stuck: P.marker("badge", {}),
        quick: P.marker("badge", {}),
        down: P.marker("badge", {}),
        xs: [0, 1].map(() => P.marker("badge", {})),
        dia: P.marker("diamond", { size: 20 }),
        hiker: P.marker("token", { size: 30 }),
      });
      const M = mk(top, 14);
      const B = mk(bot, 22);

      // state shared by both panels: curve, panel pop, star, hiker with the stuck badge. When a run ends the star
      // lifts over the hiker and the best-so-far diamond steps aside, so all three stay visible.
      const common = (P, m, t, hik, dia, leave, fin) => {
        const pk = fadeIn(t, 0.3, 0.5);
        P.update({ curve: ramp(t, 0.4, 1.2, E.inOut), fill: ramp(t, 0.7, 1.3, E.lin), o: pk });
        const sk = pops(t, 1.0, 0.4);
        m.star.set({ i: P.best, s: sk, o: sk > 0 ? 1 : 0 });
        const hk = pops(t, 0.9, 0.4);
        m.hiker.set({ i: hik.i, dx: -40 * ramp(t, fin, fin + 0.4, E.out), dy: hik.dy, s: hk, o: hk > 0 ? 1 : 0 });
        const dk = pops(t, 1.0, 0.4);
        m.dia.set({
          i: dia.i,
          dy: dia.dy,
          dx: 28 * ramp(t, fin + 0.3, fin + 0.6, E.out),
          s: dk,
          o: dk > 0 ? 1 : 0,
        });
        const stk = pops(t, 1.2, 0.4) * (1 - ramp(t, leave, leave + 0.25, E.lin));
        m.stuck.set({ i: START, dy: -28, icon: "cross", k: stk, o: stk > 0.001 ? stk : 0 });
      };

      return (t) => {
        // ===== Monte Carlo =====
        const n = mcAt(t);
        const hk = at(mcHiker, START, t, 30);
        const dm = at(mcBest, START, t, 26);
        common(top, M, t, hk, dm, MC_T0 - 0.1, MC_END);
        const e = n ? MC[n - 1] : null;
        const t0 = e ? mcT(e.k) : 0;
        const lt = e ? t - t0 : 9;
        const slow = !!e && SLOW.has(e.k);
        const dur = e ? mcDur(e.k) : 0;
        const live = !!e && t < MC_END + 0.3;
        // proposal ring: red with a cross when rejected, purple while it is being taken
        const ringEnd = slow ? (e.acc ? mcHop(e.k).a : dur - 0.1) : 0.28;
        const pr = live ? ramp(lt, 0, 0.08, E.lin) * (1 - ramp(lt, ringEnd - 0.1, ringEnd, E.lin)) : 0;
        M.prop.set({ i: e ? e.m : 0, tone: e && !e.acc ? "red" : "purple", s: 0.8 + 0.2 * pr, o: pr });
        // outcome badge: cross for a rejected step (held on the slow tries), tick for an uphill one
        let qk = 0;
        if (live && e && !e.down)
          qk = slow
            ? pops(lt, 0.3, 0.2) * (1 - ramp(lt, dur - 0.15, dur - 0.05, E.lin))
            : pops(lt, 0.04, 0.2) * (1 - ramp(lt, 0.2, 0.3, E.lin));
        M.quick.set({
          i: e ? e.m : 0,
          dy: e && e.acc ? -12 : 26,
          icon: e && e.acc ? "tick" : "cross",
          k: qk,
          s: 0.7,
          o: qk > 0.001 ? 1 : 0,
        });
        // a lucky downhill step: a clear orange arrow, held a little longer than the rest
        const dwn = MC.find((x) => x.down && t >= mcT(x.k) && t < mcT(x.k) + mcHop(x.k).b + 0.5);
        const dl = dwn ? t - mcT(dwn.k) : 0;
        const hb = dwn ? mcHop(dwn.k).b : 0;
        const dk = dwn ? pops(dl, hb - 0.1, 0.15) * (1 - ramp(dl, hb + 0.2, hb + 0.4, E.lin)) : 0;
        M.down.set({ i: dwn ? dwn.m : 0, dy: -12, icon: "down", k: dk, s: 0.85, o: dk > 0.001 ? 1 : 0 });
        M.xs.forEach((m) => m.set({ k: 0, o: 0 }));
        M.crumbs.forEach((m) => m.set({ o: 0 }));
        M.cands.forEach((m) => m.set({ o: 0 }));
        // the roll strip: lit slot only while a worse step is being judged; gone once the run is over
        const rolled = e && e.worse && lt >= (slow ? 0.2 : 0.02) ? Math.min(9, Math.floor(e.u * 10)) : -1;
        slots.forEach((r, j) => {
          const lit = j === rolled;
          r.style.fill = lit ? (j ? "var(--violet)" : "var(--teal)") : "var(--panel)";
          r.style.stroke = lit
            ? j
              ? "var(--violet-lip)"
              : "var(--teal-lip)"
            : j
              ? "var(--node-off-lip)"
              : "var(--teal-lip)";
        });
        strip.style.opacity = f1(fadeIn(t, 1.3, 0.3) * (1 - ramp(t, MC_END, MC_END + 0.3, E.lin)));
        tryTag.set({ text: `try ${n}`, o: ramp(t, 1.4, 1.7, E.lin) });
        // legends appear when their diamond first moves
        const lg = pops(t, mcBest[0].a - 0.4, 0.4);
        legend.set({ s: 0.85 + 0.15 * lg, o: lg > 0 ? Math.min(1, lg * 3) : 0 });
        V.show(legendDia, lg > 0 ? Math.min(1, lg * 3) : 0);
        mcTag.set({ o: fadeIn(t, 0.7, 0.4), s: 1 + 0.1 * V.flash(t, MC_T0, MC_T0 + 0.5) });
        pTag.set({ o: fadeIn(t, 0.9, 0.4) });
        V.show(miniDie, fadeIn(t, 0.7, 0.4));

        // ===== Tabu =====
        const tk = at(tbHiker, START, t, 30);
        const td = at(tbBest, START, t, 26);
        common(bot, B, t, tk, td, TB_RING[0] - 0.1, TB_END);
        tbTag.set({ o: fadeIn(t, 0.7, 0.4), s: 1 + 0.1 * V.flash(t, TB_T0, TB_T0 + 0.5) });
        V.show(crumbIcons, fadeIn(t, 0.7, 0.4));
        const lg2 = pops(t, TB_STEP[5].a - 0.3, 0.4);
        legend2.set({ s: 0.85 + 0.15 * lg2, o: lg2 > 0 ? Math.min(1, lg2 * 3) : 0 });
        V.show(legendDia2, lg2 > 0 ? Math.min(1, lg2 * 3) : 0);
        // candidate rings for the first two (slow) steps: orange for the pick, a red cross on the blocked crumb
        B.cands.forEach((m) => m.set({ o: 0 }));
        B.prop.set({ o: 0 });
        B.quick.set({ k: 0, o: 0 });
        B.xs.forEach((m) => m.set({ k: 0, o: 0 }));
        [0, 1].forEach((si) => {
          const s0 = TB_RING[si];
          const hopA = TB_STEP[si].a;
          const ringsOn = t >= s0 && t < hopA + 0.05;
          if (!ringsOn) return;
          const gone = 1 - ramp(t, hopA - 0.05, hopA + 0.05, E.lin);
          const chosen = TB[si].cands.findIndex((c) => !c.tabu);
          const litT = s0 + (si ? 0.9 : 0.5);
          const lit = t >= litT;
          TB[si].cands.forEach((c, j) => {
            const kk = pops(t, s0 + 0.06 * j, 0.3);
            const isTabu = c.tabu && t >= s0 + 0.4;
            const pick = j === chosen && lit;
            B.cands[j].set({
              i: c.i,
              tone: pick ? "orange" : "grey",
              ring: pick ? "orange" : null,
              ringK: ramp(t, litT, litT + 0.15, E.lin),
              s: (0.8 + 0.2 * kk) * (pick ? 1.15 : 1),
              o: c.tabu ? 0 : Math.min(1, kk * 3) * gone,
            });
            if (c.tabu) {
              const xk = pops(t, s0 + 0.4, 0.3) * gone;
              B.xs[0].set({ i: c.i, dy: 34, icon: "cross", k: xk, s: 0.6, o: isTabu && xk > 0.001 ? 1 : 0 });
            }
          });
        });
        // the down arrow after a downhill step (also on the quick steps)
        const dstep = TB.find((s, k) => s.down && t >= TB_STEP[k].b - 0.05 && t < TB_STEP[k].b + 0.55);
        const dsi = dstep ? dstep.k - 1 : 0;
        const dtk = dstep
          ? pops(t - TB_STEP[dsi].b, 0.05, 0.12) * (1 - ramp(t - TB_STEP[dsi].b, 0.35, 0.55, E.lin))
          : 0;
        B.down.set({ i: dstep ? dstep.pick : 0, dy: -12, icon: "down", k: dtk, s: 0.85, o: dtk > 0.001 ? 1 : 0 });
        // crumbs: path position j is on the floor from the moment the hiker leaves it until it drops out of the list
        B.crumbs.forEach((m, j) => {
          if (j >= TB.length) return m.set({ o: 0 });
          const drop = TB_STEP[j].a;
          const out = j + 5 <= TB.length ? TB_STEP[j + 4].b : 1e9;
          const kk = ramp(t, drop, drop + 0.2, E.out) * (1 - ramp(t, out, out + 0.15, E.lin));
          const blocked = j === 0 ? ramp(t, TB_RING[1] + 0.4, TB_RING[1] + 0.6, E.lin) * (t < TB_STEP[1].a ? 1 : 0) : 0;
          m.set({
            i: PATH[j],
            dy: -(1 - ramp(t, drop, drop + 0.2, E.out)) * 26,
            s: 1 + 0.3 * blocked,
            ring: blocked > 0 ? "red" : null,
            ringK: blocked,
            o: kk > 0.001 ? kk : 0,
          });
        });
      };
    },
  });
})();
