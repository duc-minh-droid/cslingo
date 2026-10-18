/* Lecture 8 video, scene 3: one ant builds a whole tour. The ant keeps a tabu list (the towns it has visited), may only go to a
   town that is still allowed (not on the list), and goes home when nothing is allowed any more; the tour length is the sum of
   its hops. This is the real run of lesson 8.1 (L8.ONE: the ant starts on T, tour T P Q R S then home, 74 km).
   Story (local seconds): 0.2-1.2 roads, towns and the lesson's trails appear, 0.8-1.2 the ant pops on T (T turns red), 1.0-1.5
   the 'tabu list' row (T), 1.3-1.8 the 'allowed' row (P Q R S, the towns turn green). Four steps start at 2.3 + 1.6 k: the
   towns still allowed ring green and dotted green roads show the options, the ant's pick gets an orange ring, the ant hops
   there (orange arrow, distance tag, running total), its chip flies into the next tabu slot and the town turns red; from step
   2 a red 'closed' sign sits on the road to a visited town. 8.8-9.6 the allowed row reads 'none left' and the ant goes home,
   9.2-9.5 the total reads 74 km. 11.5-12.2 the tour is over: the red towns turn plain again, the orange tour is undrawn and the
   tabu list empties (the ants forget; scene 2 showed the trails remember). */
VID.scene({
  kicker: "ONE ANT",
  title: ["One ant builds", "a whole tour"],
  dur: 14.2,
  caps: [
    [1.4, 3.7, "Its start town goes on the tabu list."],
    [3.9, 6.0, "It picks a town that is still allowed."],
    [6.2, 8.4, "A visited town is never picked again."],
    [9.4, 11.4, `Back home: tour length ${VID.l8.ONE.len} km.`],
    [11.7, 13.9, "Next tour: the tabu list starts empty."],
  ],
  build(stage, V) {
    const L8 = V.l8;
    const L5 = V.l5;
    const { ramp, flash, clamp, lerp, ease: E } = V;

    // ---- the data: the lesson's ant (computed and asserted in l8/common.js), asserted again here
    const F = L8.FIVE;
    const ONE = L8.ONE;
    const tour = ONE.tour;
    const N = tour.length;
    const running = ONE.legs.map((_, j) => ONE.legs.slice(0, j + 1).reduce((a, b) => a + b, 0));
    L8.same(tour, "TPQRS", "scene 3: the tour");
    L8.same(ONE.legs, [14, 13, 14, 14, 19], "scene 3: the hops");
    L8.same(running, [14, 27, 41, 55, 74], "scene 3: running totals");
    L8.same(ONE.len, 74, "scene 3: tour length");
    L8.same(
      ONE.steps.map((s) => s.J.join("")),
      ["PQRS", "QRS", "RS", "S"],
      "scene 3: allowed towns at each step",
    );
    L8.same(ONE.steps.map((s) => s.to).join(""), "PQRS", "scene 3: the picks");
    L8.same(ONE.steps[3].tabu.join(""), "TPQR", "scene 3: the tabu list before the last pick");

    // ---- timeline (local seconds)
    const S0 = 2.3; // step k starts at S0 + SD k
    const SD = 1.6;
    const sOf = (k) => S0 + SD * k;
    const CLOSE = [8.8, 9.6]; // the way home
    const CLEAR = [11.5, 12.2]; // the tour is over: the tabu list empties
    const hops = Array.from({ length: N }, (_, j) => {
      const s = sOf(j);
      return j < N - 1
        ? { a: tour[j], b: tour[j + 1], t0: s + 0.8, t1: s + 1.4 }
        : { a: tour[j], b: tour[0], t0: CLOSE[0], t1: CLOSE[1] };
    });
    // when each town turns red (visited): T as the ant lands on it, then each pick as the ant arrives
    const visitedAt = { T: 1.0 };
    ONE.steps.forEach((s, k) => (visitedAt[s.to] = sOf(k) + 1.4));
    const others = F.ids.filter((id) => id !== "T"); // P Q R S: the allowed row's slots
    const greenAt = Object.fromEntries(others.map((id, i) => [id, 1.5 + 0.1 * i]));

    // ---- the map: the lesson's trails under the grey roads, distance tags on the roads the ant takes
    const pos = L8.fit(Object.fromEntries(F.ids.map((id) => [id, F.xy[id]])), { x: 100, y: 50, w: 700, h: 350 }, 46);
    const net = L8.net(stage, { nodes: pos, edges: F.edges, r: 32, fs: 38, labels: true, maxPaths: 10 });
    const svg = L5.svg(stage);

    // ---- the two lists under the map: slots (dashed) that fill and empty, chips that fly between them
    const SLOT = (i) => 200 + 80 * i;
    const [Y_TABU, Y_ALLOW] = [416, 510];
    const tabuTag = L8.tag(stage, { x: 12, y: 425, text: "tabu list", tone: "red" });
    const allowTag = L8.tag(stage, { x: 12, y: 519, text: "allowed", tone: "green" });
    const box = (i, y) => L8.chip(stage, { x: SLOT(i), y, w: 68, h: 68, text: "", tone: "grey", fs: 38 });
    const tabuSlots = Array.from({ length: N }, (_, i) => box(i, Y_TABU));
    const allowSlots = others.map((_, i) => box(i, Y_ALLOW));
    const tabuT = L8.chip(stage, { x: SLOT(0), y: Y_TABU, w: 68, h: 68, text: "T", tone: "red", fs: 38 });
    const chips = others.map((id, i) =>
      L8.chip(stage, { x: SLOT(i), y: Y_ALLOW, w: 68, h: 68, text: id, tone: "green", fs: 38 }),
    );
    const total = L8.stat(stage, { x: 550, y: 504, w: 350, h: 80, label: "tour length", tone: "orange" });

    // ---- 'closed' signs on the roads to visited towns (from step 2: the ant is at Q, then R). Each sits where its road is
    // furthest from every other road and town, so it can never be mistaken for a sign on a crossing road.
    const distSeg = (p, a, b) => {
      const [dx, dy] = [b.x - a.x, b.y - a.y];
      const u = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy));
      return Math.hypot(p.x - (a.x + u * dx), p.y - (a.y + u * dy));
    };
    function signSpot(a, b) {
      const [A, B] = [net.pt(a), net.pt(b)];
      const others = F.edges.filter(([c, d]) => !(c + d === a + b || c + d === b + a));
      const tags = tour.split("").map((c, j) => [c, tour[(j + 1) % N]]); // the distance tags sit mid-road on the tour's roads
      const gap = (p) =>
        Math.min(
          ...others.map(([c, d]) => distSeg(p, net.pt(c), net.pt(d))),
          ...F.ids.map((id) => Math.hypot(p.x - net.pt(id).x, p.y - net.pt(id).y) - net.r),
          ...tags.map(([c, d]) => {
            // distance to the tag's rectangle (66 x 44 around the middle of the road)
            const m = { x: (net.pt(c).x + net.pt(d).x) / 2, y: (net.pt(c).y + net.pt(d).y) / 2 };
            return Math.hypot(Math.max(Math.abs(p.x - m.x) - 33, 0), Math.max(Math.abs(p.y - m.y) - 22, 0));
          }),
        );
      let best = { gap: -1 };
      for (let f = 0.2; f <= 0.8; f += 0.01) {
        const p = { x: lerp(A.x, B.x, f), y: lerp(A.y, B.y, f) };
        if (gap(p) > best.gap) best = { ...p, gap: gap(p) };
      }
      if (best.gap < 20) throw new Error(`scene 3: no clear spot for the closed sign on ${a}-${b}`);
      return best;
    }
    const blocked = (k) => ONE.steps[k].tabu.slice(0, -2);
    const signs = [2, 3].flatMap((k) =>
      blocked(k).map((b) => {
        const p = signSpot(ONE.steps[k].at, b);
        const red = L8.tone("red");
        const g = svg.appendChild(
          V.s(
            "g",
            {},
            V.s("circle", {
              cx: p.x.toFixed(1),
              cy: p.y.toFixed(1),
              r: 22,
              "stroke-width": 5,
              style: { fill: "var(--panel)", stroke: red.c },
            }),
            L5.cross(p.x, p.y, 36, "red", { ink: true, w: 6 }),
          ),
        );
        return { g, k, a: ONE.steps[k].at, b };
      }),
    );
    const ant = svg.appendChild(L8.ant(0, 0, 76));

    // ---- where the ant is: on a town, or walking a road (blended over 0.2 s at both ends of a hop)
    function antAt(t) {
      const k = ramp(t, 0.8, 1.2, E.lin);
      const pop = { s: 0.5 + 0.5 * E.pop(k), o: clamp(k * 3) };
      const j = hops.findIndex((h) => t < h.t1);
      const cur = j < 0 ? hops[N - 1] : hops[j];
      if (j < 0 || t < cur.t0) return { ...net.rest(j < 0 ? tour[0] : cur.a), ...pop };
      const local = t - cur.t0;
      const w = net.walk(cur.a, cur.b, E.inOut(local / (cur.t1 - cur.t0)));
      const m = E.inOut(Math.min(ramp(local, 0, 0.2, E.lin), ramp(cur.t1 - cur.t0 - local, 0, 0.2, E.lin)));
      const home = net.rest(local < (cur.t1 - cur.t0) / 2 ? cur.a : cur.b);
      return { x: lerp(home.x, w.x, m), y: lerp(home.y, w.y, m), r: w.r * m, ...pop };
    }

    // ---- one town's look at time t: red once visited, green while it is allowed, a ring for the choice being made
    function town(id, t) {
      const st = { k: L8.seq(t, 0.2, 0.08, 0.4, F.ids.indexOf(id)) };
      if (t >= visitedAt[id] && t < CLEAR[0] + 0.1) st.tone = "red";
      else if (t >= greenAt[id]) st.tone = "green";
      const k = Math.floor((t - S0) / SD);
      if (k < 0 || k > 3 || !ONE.steps[k].J.includes(id)) return st;
      const s = sOf(k);
      const rise = ramp(t, s, s + 0.4);
      if (ONE.steps[k].to !== id) return { ...st, ring: "green", ringK: rise * (1 - ramp(t, s + 1.15, s + 1.55)) };
      if (t < s + 0.5) return { ...st, ring: "green", ringK: rise };
      return { ...st, ring: "orange", ringK: ramp(t, s + 0.5, s + 0.8) * (1 - ramp(t, s + 1.4, s + 1.6)) };
    }

    // a closed sign (and its dotted red road) shows while the ant stands at step k's town
    const signK = (t, k) =>
      ramp(t, sOf(k) - 0.1, sOf(k) + 0.2, E.out) * (1 - ramp(t, sOf(k) + 1.3, sOf(k) + 1.6, E.lin));

    return (t) => {
      // ---- map: dotted green options from the ant's town, orange arrows for the hops taken
      const options = ONE.steps.flatMap((st, k) => {
        const s = sOf(k);
        const o = ramp(t, s, s + 0.4, E.lin) * (1 - ramp(t, s + 1.0, s + 1.4, E.lin));
        return st.J.map((b) => ({ a: st.at, b, k: 1, tone: "green", w: 8, dash: true, o }));
      });
      const closed = signs.map(({ a, b, k }) => ({ a, b, k: 1, tone: "red", w: 8, dash: true, o: signK(t, k) }));
      const undraw = 1 - ramp(t, CLEAR[0], CLEAR[1], E.inOut); // the tour is undrawn, never faded over the trails
      const arrows = hops.map((h) => ({
        a: h.a,
        b: h.b,
        k: ramp(t, h.t0, h.t1, E.inOut) * undraw,
        tone: "orange",
        w: 9,
        head: true,
      }));
      const labels = Object.fromEntries(
        hops.map((h, j) => [
          L8.ek(h.a, h.b),
          {
            text: String(ONE.legs[j]),
            tone: "orange",
            solid: true,
            k: (j < N - 1 ? ramp(t, sOf(j) + 1.3, sOf(j) + 1.6, E.lin) : ramp(t, 9.3, 9.6, E.lin)) * undraw,
          },
        ]),
      );
      net.update({
        roads: ramp(t, 0.2, 0.9, E.lin),
        tau: (a, b) => F.tau[F.key(a, b)],
        tauW: [2, 4],
        tauK: ramp(t, 0.6, 1.2, E.lin),
        paths: [...options, ...closed].filter((p) => p.o > 0.001).concat(arrows),
        labels,
        nodes: Object.fromEntries(F.ids.map((id) => [id, town(id, t)])),
      });
      V.place(ant, antAt(t));

      // ---- closed signs
      signs.forEach(({ g, k }) => {
        const s = sOf(k);
        V.place(g, { s: 0.6 + 0.4 * E.pop(ramp(t, s - 0.1, s + 0.4, E.lin)), o: signK(t, k) });
      });

      // ---- the two lists
      const kT = ramp(t, 1.0, 1.5, E.lin);
      const kA = ramp(t, 1.3, 1.8, E.lin);
      tabuTag.set({ k: kT });
      tabuSlots.forEach((c, i) => c.set({ ghost: true, k: ramp(t, 1.0 + 0.05 * i, 1.4 + 0.05 * i, E.lin) }));
      const clr = ramp(t, CLEAR[0], CLEAR[1], E.inOut);
      tabuT.set({ k: kT, s: 1 - 0.4 * clr, o: 1 - clr });
      const none = t >= CLOSE[0] + 0.05;
      allowTag.set({
        text: none ? "none left" : "allowed",
        tone: none ? "grey" : "green",
        k: kA,
        s: 1 + 0.1 * flash(t, CLOSE[0], CLOSE[0] + 0.4),
        o: 1 - clr,
      });
      allowSlots.forEach((c, i) =>
        c.set({ ghost: true, k: ramp(t, 1.3 + 0.05 * i, 1.7 + 0.05 * i, E.lin), o: 1 - clr }),
      );
      chips.forEach((c, i) => {
        const id = others[i];
        const k = ONE.steps.findIndex((st) => st.to === id);
        const s = sOf(k);
        const f = ramp(t, s + 1.2, s + 1.7, E.inOut);
        c.set({
          k: ramp(t, 1.3 + 0.1 * i, 1.7 + 0.1 * i, E.lin),
          x: f * 80 * (k + 1 - i),
          y: f * (Y_TABU - Y_ALLOW),
          tone: f >= 0.5 ? "red" : "green",
          s: (1 + 0.12 * flash(t, s + 1.55, s + 1.9)) * (1 - 0.4 * clr),
          o: 1 - clr,
        });
      });

      // ---- the running total counts up as each road is drawn
      let shown = 0;
      hops.forEach((h, j) => {
        const [c0, c1] = j < N - 1 ? [sOf(j) + 1.3, sOf(j) + 1.6] : [9.2, 9.5];
        shown = lerp(shown, running[j], ramp(t, c0, c1, E.lin));
      });
      const bumpAt = hops.map((h, j) => (j < N - 1 ? sOf(j) + 1.45 : 9.5));
      total.set({
        text: `${Math.round(shown)} km`,
        k: ramp(t, 2.0, 2.4, E.lin),
        bump: Math.max(...bumpAt.map((b) => flash(t, b, b + 0.4))),
        solid: t >= 9.9,
      });
    };
  },
});
