/* Lecture 1 · What is NIC?, scene 05-population.
   The lecture's multimodal landscape. ONE keep-if-better climber (seed 23) tries small steps and keeps the ones that are not
   worse, but it gets stuck on the first hill. Then a POPULATION of 20 climbers (seed 16) spreads out; the dots wander between
   the hills, and by generation 16 they all stand on the star hill. Finally two waffles show the 200-run test (42 vs 167 green).
   Every position, verdict and count comes from L1.climber / L1.popRun / L1.test200 (checked below); nothing is typed in. */
(function () {
  const V = window.VID;
  const L1 = V.l1;
  const L5 = V.l5;
  const { ramp, ease, place, flash, clamp } = V;
  const lin = ease.lin;
  const pop = (t, a, d = 0.4) => ease.pop(ramp(t, a, a + d, lin));
  const fade = (t, a, d = 0.2) => ramp(t, a, a + d, lin);

  // ---------- data, checked against the real algorithms ----------
  const CL = L1.climber(23, 16);
  const PR = L1.popRun(16, 20, 16);
  const T1 = L1.test200(1, 1);
  const T20 = L1.test200(20, 1);
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  if (
    CL[0].start !== 22 ||
    CL[16].x !== 30 ||
    PR[0].pop.length !== 20 ||
    L1.nearStar(PR[16].pop) !== 20 ||
    sum(T1) !== 42 ||
    sum(T20) !== 167
  )
    throw new Error("scene 05: climber, population or 200-run test changed, check common.js");
  const NEAR = PR.map((g) => L1.nearStar(g.pop));

  // ---------- timeline (local seconds) ----------
  const CURVE = [0.3, 1.3];
  const STAR_AT = 1.0;
  const DOT1 = 1.3;
  const G1 = 1.8; // climber generation g starts at G1 + 0.2 g
  const GSTEP = 0.2;
  const STUCK = 4.3;
  const SWITCH = 5.0; // the climber leaves, the 20 arrive
  const P0 = 5.8; // population generation step 0 starts here
  const PSTEP = 0.27;
  const PEND = P0 + 16 * PSTEP;
  const WAF1 = 10.3;
  const WAF2 = 11.1;
  const LAB = 11.9;

  V.scene({
    kicker: "INGREDIENT 1",
    title: ["One climber gets stuck.", "Many climbers don't."],
    dur: 13,
    caps: [
      [0.4, 1.8, "A landscape: height is how good."],
      [1.9, 4.2, "One climber keeps steps only if better."],
      [4.3, 5.4, "Stuck on the first hill."],
      [5.8, 10, "Twenty climbers spread out and compete."],
      [10.3, 12.5, "200 runs: more climbers find the top."],
    ],
    build(stage) {
      const ls = L1.landscape(stage, { x: 0, w: 936, base: 280, peak: 50, star: 44 });
      const top = L1.chip(stage, "1 climber", "blue", { x: 0, y: 0 });
      const stuck = L1.chip(stage, "stuck", "red", { solid: true, width: 124 });
      const gen = L1.chip(stage, "generation 0", "grey", { x: 0, y: 340, width: 250 });
      const hill = L1.chip(stage, "", "orange", { x: 280, y: 340, width: 400 });
      const wafL = L1.waffle(stage, { flags: T1, x: 30, y: 350 });
      const wafR = L1.waffle(stage, { flags: T20, x: 500, y: 350 });
      const labL = L1.chip(stage, `1 climber: ${sum(T1)} of 200`, "red", { x: 30, y: 538, width: wafL.width });
      const labR = L1.chip(stage, `20 climbers: ${sum(T20)} of 200`, "green", {
        x: 500,
        y: 538,
        width: wafR.width,
        solid: true,
      });
      const bar = L1.ingredientBar(stage, { y: 588 });
      gen.style.left = "343px";
      hill.style.left = "283px";
      hill.style.top = "398px";
      gen.style.top = "340px";

      // the one climber: a dot, 16 candidate rings and their crosses
      const one = ls.dot({ tone: "blue" });
      const rings = CL.slice(1).map(() => ls.dot({ tone: "blue", r: 12, hollow: true }));
      const xs = CL.slice(1).map((c) => {
        const [x, y] = ls.px(c.cand);
        const g = L5.cross(0, 0, 40, "red", { w: 6 });
        ls.over.append(g);
        return { g, x, y: y - 26 };
      });
      // the population: two pools of 20 dots, generation k lives in pool k % 2
      const pools = [0, 1].map(() => PR[0].pop.map((_, k) => ls.dot({ tone: "blue", r: 13, id: k })));
      const slot = (k) => ({ dx: ((k % 5) - 2) * 6, lift: (k % 2) * 7 });
      const drawGen = (pool, pops, o, extra) =>
        pool.forEach((d, k) => d.set({ i: pops[k], o: o(k), ...slot(k), ...extra(k) }));
      const hidePool = (pool) => pool.forEach((d) => d.set({ o: 0 }));

      /** the climber's position (index) and the generation in flight at time t */
      const climberAt = (t) => {
        const g = clamp(Math.floor((t - G1) / GSTEP), 0, 16); // 0 = before any step
        let i = CL[0].start;
        for (let k = 1; k <= g; k++) {
          const u = clamp((t - (G1 + GSTEP * k) - 0.3 * GSTEP) / (0.6 * GSTEP));
          const prev = CL[k - 1].x ?? CL[0].start;
          i = prev + (CL[k].x - prev) * ease.inOut(u);
        }
        return { g: t < G1 + GSTEP ? 0 : g, i };
      };

      return (t) => {
        // landscape and star
        ls.set({ k: ramp(t, CURVE[0], CURVE[1], ease.inOut), star: ramp(t, STAR_AT, STAR_AT + 0.6, lin), starPulse: flash(t, STUCK, STUCK + 0.6) });

        // top tag
        const two = t >= SWITCH;
        const tagTxt = two ? "20 climbers" : "1 climber";
        if (top.textContent !== tagTxt) top.textContent = tagTxt;
        top.className = `v-tag c-blue${two ? "" : ""}`;
        place(top, { o: fade(t, DOT1, 0.3) * (1 - fade(t, WAF1 - 0.4, 0.3)), s: two ? 1 + 0.12 * flash(t, SWITCH + 0.3, SWITCH + 0.7) : pop(t, DOT1, 0.4) });

        // ---- the one climber
        const { g, i } = climberAt(t);
        const jig = (k) => 3 * Math.sin(((t - G1 - GSTEP * k) / 0.15) * Math.PI * 2) * (1 - ramp(t, G1 + GSTEP * k, G1 + GSTEP * k + 0.3, lin));
        let jx = 0;
        for (let k = 1; k <= 16; k++) {
          const t0 = G1 + GSTEP * k;
          const c = CL[k];
          const r = rings[k - 1];
          const xg = xs[k - 1];
          const live = t >= t0 && t < t0 + 0.6;
          if (!live) {
            r.set({ o: 0 });
            V.show(xg.g, 0);
            continue;
          }
          const u = (t - t0) / GSTEP; // 0..1 in the step
          const appear = pop(u, 0, 0.3);
          if (c.ok) {
            r.set({ i: c.cand, tone: "blue", hollow: true, o: appear * (1 - ramp(u, 1.0, 1.9, lin)), s: appear * (1 + 0.1 * flash(u, 0.3, 0.9)) });
            V.show(xg.g, 0);
          } else {
            const o = (u < 0.3 ? 1 : 1 - ramp(u, 0.9, 2.4, lin)) * clamp(appear * 3);
            r.set({ i: c.cand, tone: u < 0.3 ? "blue" : "red", hollow: true, o, s: appear });
            V.show(xg.g, ramp(u, 0.3, 0.45, lin) * (1 - ramp(u, 0.9, 2.4, lin)));
            place(xg.g, { x: xg.x, y: xg.y, s: 1 });
            jx += jig(k);
          }
        }
        const oneO = pop(t, DOT1, 0.4) * (1 - fade(t, SWITCH, 0.5));
        one.set({ i, o: oneO > 0.001 ? 1 : 0, s: Math.min(1, oneO), dx: jx, tone: "blue" });
        if (oneO > 0.001 && oneO < 1) one.set({ i, o: oneO, s: Math.max(0.01, oneO), dx: jx });
        // stuck tag above the dot
        const [hx, hy] = ls.px(CL[16].x);
        stuck.style.left = `${(hx - 62).toFixed(1)}px`;
        stuck.style.top = `${(hy - 96).toFixed(1)}px`;
        place(stuck, { o: fade(t, STUCK, 0.15) * (1 - fade(t, SWITCH, 0.3)), s: pop(t, STUCK, 0.4), y: 0 });

        // generation counter chip
        const popG = clamp(Math.floor((t - P0) / PSTEP), 0, 15);
        const popGen = t < P0 ? 0 : t >= PEND ? 16 : popG + 1;
        const genTxt = t < SWITCH ? `generation ${g}` : `generation ${popGen}`;
        if (gen.textContent !== genTxt) gen.textContent = genTxt;
        const chipsO = fade(t, G1 + GSTEP, 0.3) * (1 - fade(t, WAF1 - 0.4, 0.3));
        place(gen, { o: chipsO * (t < G1 + GSTEP ? 0 : 1) });

        // ---- the population
        const startO = (k) => pop(t, SWITCH + 0.02 * k, 0.35);
        const step = clamp((t - P0) / PSTEP, 0, 16);
        const gi = Math.min(15, Math.floor(step));
        const u = step >= 16 ? 1 : step - gi;
        const finished = t >= PEND;
        if (t < SWITCH) {
          hidePool(pools[0]);
          hidePool(pools[1]);
        } else if (t < P0) {
          drawGen(pools[0], PR[0].pop, (k) => (startO(k) > 0.001 ? 1 : 0), (k) => ({ s: Math.max(0.01, startO(k)) }));
          hidePool(pools[1]);
        } else {
          const oldPool = pools[gi % 2];
          const newPool = pools[(gi + 1) % 2];
          const oldIdx = PR[gi].pop;
          const newIdx = PR[gi + 1].pop;
          const sp = L1.sprout(oldIdx, newIdx, PR[gi + 1].info.map((c) => c.p1), u);
          sp.kids.forEach((kd, k) => newPool[k].set({ i: kd.i, o: 1, ...slot(k) }));
          sp.olds.forEach((od, k) => oldPool[k].set({ i: od.i, o: od.o > 0.001 ? 1 : 0, s: Math.max(0.01, od.o) * 1, ...slot(k) }));
          if (finished) hidePool(pools[1]);
        }
        // how many dots stand on the star hill
        const nNow = t < P0 ? NEAR[0] : NEAR[finished ? 16 : gi + (u > 0.8 ? 1 : 0)];
        const hTxt = `${nNow} of 20 on the star hill`;
        if (hill.textContent !== hTxt) hill.textContent = hTxt;
        const hillO = fade(t, P0 - 0.2, 0.3) * (1 - fade(t, WAF1 - 0.4, 0.3));
        place(hill, { o: hillO });
        // the generation chip is only ever on the right of the hill chip
        place(gen, { o: chipsO * (t < G1 + GSTEP ? 0 : 1) });

        // ---- ingredient bar
        bar(["active", "off", "off"], pop(t, SWITCH + 0.1, 0.5));

        // ---- the 200-run waffles
        wafL(ramp(t, WAF1, WAF1 + 0.8, lin));
        wafR(ramp(t, WAF2 - 0.2, WAF2 + 0.6, lin));
        place(labL, { o: fade(t, LAB, 0.15), s: pop(t, LAB, 0.4) });
        place(labR, { o: fade(t, LAB + 0.15, 0.15), s: pop(t, LAB + 0.15, 0.4) });
      };
    },
  });
})();
