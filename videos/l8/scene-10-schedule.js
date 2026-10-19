/* Lecture 8 video, scene 10: construction graphs. Ants are not only for tours: if a solution can be drawn as a path through a
   graph, an ant can build it. Lesson 8.5's print shop has one press and five jobs; each job is a node, the ant starts on a
   Start node and the path ends when every job has been used (no way home). The path IS the schedule, and its quality is the
   lateness: finish time minus due time. This is the real run of the lesson's ant (L8.SCHED, rng 2: picks W L P T B).
   Layout note: the six nodes sit on a stretched hexagon (Start on the left, the jobs clockwise in the order the ant picks
   them), because with every pair of nodes joined no arrow may run through a third node; the build asserts a clear gap.
   Story (local seconds): 0.1-1.0 Start (grey, ringed orange: it is where the ant stands) and the five jobs, 0.5 the 'one press,
   five jobs' tag, 1.6-2.2 the ant on Start. Five steps start at 3.0 + 1.2 k ('same rule as before' tag): thin blue arrows (equal
   trail on every choice) go from the ant's node to every job still allowed, the chosen one turns orange and thick (its colour
   switches, nothing is blended) while the others fade, the ant hops there, the job turns red (a 'tabu' tag explains red) and its block (letter and minutes) grows into the chart (grey). 9.0-9.5 the formula late = ends - due (the visited
   nodes go plain, so red means 'late' only from here), 9.3-9.9 the 'ends' and 'due' lines under each block, 10.0-10.5 the red
   'late' tags, 11.2-11.75 the two stickers (average 54 min late, worst 70 min late). 12.0-13.7 hold. */
VID.scene({
  kicker: "CONSTRUCTION GRAPHS",
  title: ["Any problem drawn", "as a path"],
  dur: 13.7,
  // the captions' numbers come from the same asserted evaluation as the figure
  caps: ((S) => [
    [0.5, 2.9, "A print shop: five jobs, one press."],
    [3.1, 5.6, "The ant picks a job by the same rule."],
    [5.9, 8.9, "It picks one job at a time, never twice."],
    [9.3, 11.4, "Lateness: finish time minus due time."],
    [11.6, 13.5, `Average ${S.eval.avg} minutes late, worst ${S.eval.max}.`],
  ])(VID.l8.SCHED),
  build(stage, V) {
    const L8 = V.l8;
    const L5 = V.l5;
    const { ramp, flash, lerp, clamp, ease: E } = V;

    // ---- the data (computed and asserted in l8/common-2.js), asserted again here
    const { SCHED } = L8;
    const order = SCHED.order;
    const N = order.length;
    const chain = ["Start", ...order]; // the ant's nodes in order: Start, then the jobs it picks
    const rows = SCHED.eval.rows;
    L8.same(order, "WLPTB", "scene 10: the ant's schedule");
    L8.same(
      SCHED.steps.map((s) => s.J.join("")),
      ["BLPTW", "BLPT", "BPT", "BT", "B"],
      "scene 10: the jobs still allowed at each step",
    );
    L8.same(
      SCHED.steps.map((s) => (s.at === "S" ? "Start" : s.at)),
      chain.slice(0, N),
      "scene 10: where the ant stands at each step",
    );
    L8.same(SCHED.steps.map((s) => s.to).join(""), order, "scene 10: the picks");
    L8.same(
      rows.map((r) => r.end),
      [50, 80, 110, 140, 170],
      "scene 10: finish times",
    );
    L8.same(
      rows.map((r) => r.late),
      [20, 60, 60, 60, 70],
      "scene 10: lateness of each job",
    );
    rows.forEach((r) => L8.same(r.late, Math.max(0, r.end - r.due), `scene 10: lateness of ${r.j} is ends minus due`));
    L8.same(SCHED.eval.avg, 54, "scene 10: average lateness");
    L8.same(SCHED.eval.max, 70, "scene 10: maximum lateness");

    // ---- the graph: Start on the left, the jobs clockwise round it in the order the ant picks them
    const R = 34;
    const POS = {
      Start: { x: 110, y: 209, w: 130, label: "Start" },
      W: [375, 118],
      L: [718, 118],
      P: [880, 199],
      T: [640, 282],
      B: [276, 282],
    };
    const ctr = (id) => (Array.isArray(POS[id]) ? { x: POS[id][0], y: POS[id][1] } : POS[id]);
    // every pair of nodes gets an arrow at some step, so no arrow may pass through (or brush) a third node
    const distSeg = (p, a, b) => {
      const [dx, dy] = [b.x - a.x, b.y - a.y];
      const u = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy));
      return Math.hypot(p.x - (a.x + u * dx), p.y - (a.y + u * dy));
    };
    const ids = Object.keys(POS);
    ids.forEach((a, i) =>
      ids.slice(i + 1).forEach((b) =>
        ids
          .filter((c) => c !== a && c !== b)
          .forEach((c) => {
            if (distSeg(ctr(c), ctr(a), ctr(b)) - R < 14)
              throw new Error(`scene 10: the arrow ${a} to ${b} runs too close to ${c}`);
          }),
      ),
    );
    const net = L8.net(stage, { nodes: POS, edges: [], r: R, fs: 40, maxPaths: 10 });
    const svg = L5.svg(stage);
    const ant = svg.appendChild(L8.ant(0, 0, 70));

    // ---- tags, the chart and the two stickers
    const intro = L8.tag(stage, { x: 18, y: 14, text: "one press, five jobs", tone: "grey" });
    const same = L8.tag(stage, { x: 350, y: 14, text: "same rule as before", tone: "grey" });
    const visited = L8.tag(stage, { x: 812, y: 14, text: "tabu", tone: "red" });
    const chart = L8.gantt(stage, { x: 43, y: 338, h: 66, order });
    const avg = L8.stat(stage, { x: 20, y: 548, w: 432, h: 80, label: "average", tone: "red" });
    const worst = L8.stat(stage, { x: 484, y: 548, w: 432, h: 80, label: "worst", tone: "red" });

    // ---- the formula late = ends - due, top right (tags and signs pop one after another)
    const FY = 42; // tags are 61 px high, so their middle is at 12 + 30
    const fTags = [
      L8.tag(stage, { x: 529, y: FY - 30, text: "late", tone: "red", solid: true }),
      L8.tag(stage, { x: 675, y: FY - 30, text: "ends", tone: "grey" }),
      L8.tag(stage, { x: 831, y: FY - 30, text: "due", tone: "grey" }),
    ];
    const fMarks = [
      { g: svg.appendChild(L8.mark("equals", 0, 0, 36, "grey")), x: 649 },
      { g: svg.appendChild(L8.mark("minus", 0, 0, 36, "grey")), x: 805 },
    ];

    // ---- timeline (local seconds)
    const S0 = 3.0; // step k starts at S0 + SD k
    const SD = 1.2;
    const sOf = (k) => S0 + SD * k;
    const hop = (j) => ({ a: chain[j], b: chain[j + 1], t0: sOf(j) + 0.6, t1: sOf(j) + 1.1 });
    const visitedAt = (k) => sOf(k) + 1.0; // job k turns red as the ant reaches it
    const LAST_END = sOf(N - 1) + 1.3; // the last block is in
    const FORMULA = 9.0;

    // ---- where the ant is: on a node, or walking a road (blended over 0.2 s at both ends of a hop)
    function antAt(t) {
      const k = ramp(t, 1.6, 2.2, E.lin);
      const pop = { s: 0.5 + 0.5 * E.pop(k), o: clamp(k * 3) };
      const j = Array.from({ length: N }, (_, i) => i).find((i) => t < hop(i).t1);
      if (j === undefined) return { ...net.rest(chain[N]), ...pop };
      const h = hop(j);
      if (t < h.t0) return { ...net.rest(h.a), ...pop };
      const local = t - h.t0;
      const w = net.walk(h.a, h.b, E.inOut(local / (h.t1 - h.t0)));
      const m = E.inOut(Math.min(ramp(local, 0, 0.2, E.lin), ramp(h.t1 - h.t0 - local, 0, 0.2, E.lin)));
      const home = net.rest(local < (h.t1 - h.t0) / 2 ? h.a : h.b);
      return { x: lerp(home.x, w.x, m), y: lerp(home.y, w.y, m), r: w.r * m, ...pop };
    }

    return (t) => {
      // ---- arrows: thin grey options from the ant's node, the pick turns orange and thick, the others fade
      // every option is a thin blue arrow (the same trail on each at the start); the chosen one switches to thick orange and
      // stays as the path, the others fade away (so blue and orange are never blended)
      const options = SCHED.steps.flatMap((st, k) => {
        const s = sOf(k);
        const grow = ramp(t, s, s + 0.4, E.out);
        const fade = 1 - ramp(t, s + 0.4, s + 0.7, E.lin);
        const mix = ramp(t, s + 0.4, s + 0.7, E.lin);
        return st.J.map((j) => {
          const pick = j === st.to;
          return {
            a: chain[k],
            b: j,
            k: grow,
            tone: pick && mix > 0 ? "orange" : "blue",
            w: pick ? lerp(4, 10, mix) : 4,
            head: true,
            o: pick ? 1 : fade,
          };
        });
      });
      const live = (p) => p.k > 0.001 && p.o > 0.001;

      // ---- nodes: Start purple; a job is grey until the ant has been there, then red (a small pop as it turns)
      const nodes = {
        Start: { tone: "grey", ring: "orange", ringK: ramp(t, 0.5, 0.9, E.lin), k: L8.seq(t, 0.1, 0, 0.4, 0) },
      };
      order.split("").forEach((j, k) => {
        const red = t >= visitedAt(k) && t < FORMULA; // red = visited, until red starts to mean 'late'
        nodes[j] = {
          k: L8.seq(t, 0.2, 0.1, 0.4, k),
          tone: red ? "red" : "grey",
          s: 1 + 0.12 * flash(t, visitedAt(k), visitedAt(k) + 0.4),
        };
      });
      net.update({ roads: 0, paths: options.filter(live), nodes });
      V.place(ant, antAt(t));

      // ---- tags
      intro.set({ k: ramp(t, 0.5, 0.8, E.lin) });
      same.set({ k: ramp(t, S0 - 0.1, S0 + 0.3, E.lin), o: 1 - ramp(t, FORMULA - 0.2, FORMULA, E.lin) });
      visited.set({
        k: ramp(t, visitedAt(0) - 0.05, visitedAt(0) + 0.3, E.lin),
        o: 1 - ramp(t, FORMULA - 0.2, FORMULA, E.lin),
      });
      fTags.forEach((tag, i) => tag.set({ k: L8.seq(t, FORMULA, 0.14, 0.3, i * 2) }));
      fMarks.forEach(({ g, x }, i) => {
        const k = L8.seq(t, FORMULA, 0.14, 0.3, i * 2 + 1);
        V.place(g, { x, y: FY, s: 0.6 + 0.4 * E.pop(k), o: clamp(k * 4) });
      });

      // ---- the chart: one block grows in as the ant reaches each job; then ends / due lines; then the red late tags
      const n = SCHED.steps.reduce((a, _, k) => a + ramp(t, sOf(k) + 0.9, sOf(k) + 1.3, E.lin), 0);
      chart.update({
        n,
        dueK: ramp(t, LAST_END + 0.2, LAST_END + 0.8, E.lin),
        lateK: ramp(t, 10.0, 10.5, E.lin),
      });

      // ---- the two stickers
      avg.set({ text: `${SCHED.eval.avg} min late`, k: ramp(t, 11.2, 11.55, E.lin), bump: 0.3 * flash(t, 11.4, 11.8) });
      worst.set({
        text: `${SCHED.eval.max} min late`,
        k: ramp(t, 11.4, 11.75, E.lin),
        bump: 0.3 * flash(t, 11.6, 12.0),
      });
    };
  },
});
