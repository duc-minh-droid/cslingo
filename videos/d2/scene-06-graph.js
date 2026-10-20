/* Lecture 2 · scene 6 (GRAPH MODEL): when the links are the data (lesson 2.3 "Graph models": the lesson's own seven vertices and
   eight edges). Things are vertices, relationships are edges with a label; a vertex stores the edges that arrive ("in") and the
   edges that leave ("out"), so a route is found by walking edges, one hop per edge. Every count and key comes from D2.GRAPH
   (asserted when the page loads): Ben stores 1 edge in and 2 out, and Ana to Dee is 3 hops along Ana-Ben-Cy-Dee.
   Story (local seconds): 0.3-1.0 the five people pop first (people link to people), 1.0 the tag "vertex", 1.15-1.6 the four friendships
   draw on, 1.9 the tag "edge", the city and the company pop (1.9, 2.1) and their four edges draw on (2.3-2.7), 3.8 / 4.2 / 4.6 one label
   each (FRIEND, LIVES_IN, WORKS_AT: one of each kind), 5.6 they go; INSPECT BEN 5.5 his orange ring, 5.9 the edge that arrives draws on
   in purple (towards Ben) and the tag "in: Ana" (6.2), 6.5 the two edges that leave draw on in blue (away from Ben) and the tag
   "out: Cy, Leeds" (6.8): the lists he stores, built from D2.GRAPH.ben; 9.1 the highlights and the two definition tags fade (they stay
   while the captions use the words); WALK 9.4 Ana turns green (the start), 9.5 the tag "route: Ana to Dee" and a dashed orange ring
   on Dee (where to), 9.7 the "hops" counter, 9.9-12.4 a blue token walks the three edges, 0.85 s each: it paints every edge green as
   it goes, the vertex it reaches turns solid green and the counter goes 1, 2, 3. Then the picture holds.
   Two graphs are stacked: the lower one is the plain graph (vertices, grey edges, labels); the upper one draws only the
   coloured highlights (inspect and route) on top of it, so an edge can grow in colour from its tail and fade away again. */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;

  // ---------- the data (asserted against the storyboard and the lesson) ----------
  const G = D2.GRAPH;
  const BEN = G.ben;
  const WALK = D2.pathKeys(G.path); // the edges the route crosses, in order
  const LABELLED = [
    ["Ana>Ben", "FRIEND", -1, 0.5],
    ["Ana>Leeds", "LIVES_IN", 1, 0.6],
    ["Cy>Acme", "WORKS_AT", 1, 0.5],
  ]; // one edge of each kind: [key, label, which side of the arrow the label sits on, how far along it]
  const labelOf = (key) => G.edges.find((e) => e.key === key).label;
  D2.same(
    "graph scene: seven vertices, five people, a city and a company",
    [G.nodes.length, G.nodes.filter((n) => n.kind === "person").length, G.nodes.map((n) => n.kind).slice(5)],
    [7, 5, ["city", "company"]],
  );
  D2.same("graph scene: eight edges", G.edges.length, 8);
  D2.same(
    "graph scene: the labels shown are the edges' own, one of each kind",
    LABELLED.map(([k, l]) => labelOf(k) === l),
    [true, true, true],
  );
  D2.same("graph scene: three kinds of label", [...new Set(G.edges.map((e) => e.label))].length, 3);
  D2.same(
    "graph scene: Ben stores two edges out and one in",
    [BEN.out.map((e) => e.key), BEN.in.map((e) => e.key)],
    [["Ben>Cy", "Ben>Leeds"], ["Ana>Ben"]],
  );
  D2.same(
    "graph scene: Ana to Dee is a chain of three hops",
    [G.path, G.hops, WALK],
    [["Ana", "Ben", "Cy", "Dee"], 3, ["Ana>Ben", "Ben>Cy", "Cy>Dee"]],
  );
  D2.same(
    "graph scene: the route is walked along the arrows, tail to head",
    WALK.map((k, i) => k.split(">")[0] === G.path[i] && k.split(">")[1] === G.path[i + 1]),
    [true, true, true],
  );
  D2.same("graph scene: one hop per edge of the route", [WALK.length, G.hops], [3, 3]);
  const START = G.path[0];
  const GOAL = G.path[G.path.length - 1];
  const HOPS = G.hops;

  // ---------- layout (stage px; the lesson's layout from D2.LAYOUT, the graph fills the whole stage) ----------
  const NODES = Object.fromEntries(
    G.nodes.map((n) => [n.id, { x: D2.LAYOUT[n.id][0], y: D2.LAYOUT[n.id][1], kind: n.kind }]),
  );
  const STAT = { x: 24, y: 536, w: 230, h: 72 }; // the lip and the pulse keep clear of the 12 px stage margin
  const tagWidth = (text) => Math.round(40 + 14.4 * text.length); // a 28 px tag as it is really drawn (D2.tagW is a little small)

  // ---------- timeline ----------
  const T = {
    node: 0.3, // the five people pop first, 0.14 s apart (people link to people), then the city and the company
    nodeStep: 0.14,
    nodeMore: [1.9, 2.1], // Leeds, Acme
    tagV: 1.0, // "vertex"
    edge: 1.15, // the four friendships draw on first, 0.15 s apart ...
    edgeStep: 0.15,
    edgeMore: 2.3, // ... then the four edges to the city and the company, 0.13 s apart
    edgeMoreStep: 0.13,
    tagE: 1.9, // "edge"
    tagsOff: 9.1, // both definitions stay while the captions use the words
    label: [3.8, 4.2, 4.6],
    labelsOff: 5.6,
    ben: 5.5, // inspect Ben
    inEdge: 5.9,
    inTag: 6.2,
    outEdge: 6.5,
    outTag: 6.8,
    calm: 9.1, // the highlights fade
    start: 9.4, // Ana is the start
    route: 9.5, // the route tag and the ring round Dee
    stat: 9.7,
    walk: 9.9, // the token leaves Ana
    hop: 0.85, // seconds per edge
  };

  /* The walker rides one edge per hop. f runs from F0 (inside the vertex it leaves, hidden) to F1 (inside the vertex it reaches,
     hidden) along the arrow; 0 is the tail of the arrow and 1 its head, so the token shows only between the two. */
  const [F0, F1] = [-0.14, 1.14];
  const smooth = (x) => x * x * (3 - 2 * x);
  const fOf = (u) => F0 + (F1 - F0) * smooth(clamp(u)); // u = 0..1 through the hop
  const U1 = (() => {
    // the moment inside a hop at which the token reaches the head of the arrow (f = 1), found by bisection
    let [lo, hi] = [0, 1];
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (fOf(mid) < 1) lo = mid;
      else hi = mid;
    }
    return lo;
  })();
  const arrive = (h) => T.walk + (h + U1) * T.hop; // hop h (0-based) reaches its vertex
  const PEOPLE = G.nodes.filter((n) => n.kind === "person").length; // the people are the first five vertices
  const nodeAt = (i) => (i < PEOPLE ? T.node + T.nodeStep * i : T.nodeMore[i - PEOPLE]);
  const edgeAt = (i) => (i < 4 ? T.edge + T.edgeStep * i : T.edgeMore + T.edgeMoreStep * (i - 4)); // friendships first
  D2.same(
    "graph scene: the first four edges are the friendships",
    G.edges.slice(0, 4).map((e) => e.label),
    ["FRIEND", "FRIEND", "FRIEND", "FRIEND"],
  );
  const showAt = (f) => ramp(f, F0, 0, E.lin) * (1 - ramp(f, 1, F1, E.lin)); // 0 while the token is inside a vertex

  function build(stage) {
    const g = D2.graph(stage, { nodes: NODES, edges: G.edges });
    const hi = D2.graph(stage, { nodes: NODES, edges: G.edges }); // the highlights, on top of the plain graph
    const lead = L5.svg(stage); // the two little pointers of the definition tags

    // the tags sit next to what they name; each position is worked out from the graph's own geometry (top-left, stage px)
    const dee = g.pt("Dee");
    const em = g.edgeMid("Cy>Dee");
    const ben = g.pt("Ben");
    const TEXT = {
      vertex: "vertex",
      edge: "edge",
      in: `in: ${BEN.in.map((e) => e.from).join(", ")}`, // what Ben stores: the vertices its edges come from ...
      out: `out: ${BEN.out.map((e) => e.to).join(", ")}`, // ... and the vertices they go to
      route: `route: ${START} to ${GOAL}`,
    };
    const AT = {
      vertex: { x: dee.x - tagWidth(TEXT.vertex) / 2, y: dee.y + g.size("Dee").h / 2 + 62 }, // under Dee
      edge: { x: em.x + 56, y: em.y - 29 }, // right of the Cy>Dee arrow
      in: { x: 186, y: 14 }, // above the arrow that arrives at Ben
      out: { x: ben.x + 88, y: 14 }, // above the arrow that leaves Ben for Cy
      route: { x: 924 - 12 - 8 - tagWidth(TEXT.route), y: 14 }, // top right, clear of Cy
    };
    const mk = (key, tone, solid) => D2.tag(stage, { ...AT[key], text: TEXT[key], tone, solid });
    const tagVertex = mk("vertex", "grey", false);
    const tagEdge = mk("edge", "grey", false);
    const tagIn = mk("in", "purple", true);
    const tagOut = mk("out", "blue", true);
    const tagRoute = mk("route", "blue", true);
    const stat = D2.stat(stage, { ...STAT, label: "hops", tone: "green" });
    const trail = [16, 32, 48].map((back, j) => ({ back, tok: D2.token(stage, { tone: "blue", size: 22 - 4 * j }) }));
    const tok = D2.token(stage, { tone: "blue", size: 30 });
    // the pointers: "vertex" up to Dee, "edge" left to the Cy>Dee arrow
    const ptr = { stroke: "grey", o: 1, opt: { w: 5, head: 16 } };
    const ptrV = lead.appendChild(
      L5.arrow(dee.x, AT.vertex.y - 2, dee.x, dee.y + g.size("Dee").h / 2 + 14, ptr.stroke, ptr.o, ptr.opt),
    );
    const ptrE = lead.appendChild(L5.arrow(AT.edge.x - 2, em.y, em.x + 8, em.y, ptr.stroke, ptr.o, ptr.opt));

    // the token on hop h at fraction f of its arrow (f outside 0..1 continues the straight line into the vertex)
    const at = (h, f) => {
      const [a, b] = [g.edgePt(WALK[h], 0), g.edgePt(WALK[h], 1)];
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    };
    const arrowLen = WALK.map((_, h) => Math.hypot(at(h, 1).x - at(h, 0).x, at(h, 1).y - at(h, 0).y));

    return (t) => {
      const k = (a, d = 0.4) => ramp(t, a, a + d, E.lin);
      const calm = k(T.calm, 0.25); // the inspect highlights fade away
      const hopsDone = WALK.filter((_, h) => t >= arrive(h)).length;
      const fHop = (h) => fOf((t - T.walk) / T.hop - h); // where the token is on hop h (below 0 before it, above 1 after)

      // ---- the plain graph: vertices ----
      const nodes = {};
      G.nodes.forEach((n, i) => {
        const st = { k: ramp(t, nodeAt(i), nodeAt(i) + 0.4, E.lin) };
        const wi = G.path.indexOf(n.id); // position on the route, -1 when it is not on it
        if (n.id === "Ben" && t >= T.ben && t < T.calm + 0.3)
          Object.assign(st, { ring: "orange", ringK: k(T.ben, 0.3) * (1 - calm) });
        if (wi >= 0 && t >= T.start) {
          const when = wi === 0 ? T.start : arrive(wi - 1);
          if (t >= when) Object.assign(st, { tone: "green", solid: true, s: 1 + 0.12 * flash(t, when, when + 0.35) });
          else if (n.id === GOAL) Object.assign(st, { ring: "orange", ringDash: true, ringK: k(T.route, 0.3) });
        }
        nodes[n.id] = st;
      });

      // ---- the plain graph: grey edges that draw on, and the three labels ----
      const edges = {};
      G.edges.forEach((e, i) => {
        const st = { k: E.out(ramp(t, edgeAt(i), edgeAt(i) + 0.35, E.lin)), tone: "grey" };
        const lab = LABELLED.findIndex(([key]) => key === e.key);
        if (lab >= 0)
          Object.assign(st, {
            label: k(T.label[lab], 0.3) * (1 - k(T.labelsOff, 0.2)),
            labelSide: LABELLED[lab][2],
            labelAt: LABELLED[lab][3],
          });
        edges[e.key] = st;
      });
      g.update({ nodes, edges });

      // ---- the highlights: Ben's edges in and out, then the route painted green behind the walker ----
      const lit = {};
      if (t < T.start) {
        BEN.in.forEach((e) => (lit[e.key] = { tone: "purple", k: E.out(k(T.inEdge, 0.45)), w: 1.4 }));
        BEN.out.forEach((e) => (lit[e.key] = { tone: "blue", k: E.out(k(T.outEdge, 0.5)), w: 1.4 }));
      } else
        WALK.forEach((key, h) => {
          lit[key] = { tone: "green", k: clamp(fHop(h)), w: 1.4 + 0.4 * flash(t, arrive(h), arrive(h) + 0.35) };
        });
      hi.update({ base: { node: { k: 0 }, edge: { k: 0, label: 0 } }, edges: lit, o: t < T.start ? 1 - calm : 1 });

      // ---- the definition tags ("vertex", "edge") and their pointers ----
      const defs = 1 - k(T.tagsOff, 0.3);
      tagVertex.set({ k: k(T.tagV, 0.35), o: defs });
      tagEdge.set({ k: k(T.tagE, 0.35), o: defs });
      L5.drawOn(ptrV, k(T.tagV + 0.15, 0.3));
      L5.drawOn(ptrE, k(T.tagE + 0.15, 0.3));
      V.show(ptrV, defs);
      V.show(ptrE, defs);

      // ---- Ben's tags ----
      tagIn.set({ k: k(T.inTag, 0.35), o: 1 - calm });
      tagOut.set({ k: k(T.outTag, 0.35), o: 1 - calm });

      // ---- the route ----
      tagRoute.set({ k: k(T.route, 0.35) });
      stat.set({
        text: String(hopsDone),
        tone: hopsDone ? "green" : "grey",
        k: k(T.stat, 0.35),
        bump: 0.5 * WALK.reduce((s, _, h) => s + flash(t, arrive(h), arrive(h) + 0.3), 0), // a small pulse keeps clear of the margin
      });

      // ---- the walker: out of the tail vertex, along the arrow, into the head vertex (hidden inside the vertices) ----
      const h = clamp(Math.floor((t - T.walk) / T.hop), 0, HOPS - 1);
      const f = fHop(h);
      const live = t >= T.walk && t < T.walk + HOPS * T.hop;
      const o = live ? showAt(f) : 0;
      tok.set({ ...at(h, f), s: 0.45 + 0.55 * o, o });
      trail.forEach(({ back, tok: gt }, j) => {
        const ff = f - back / arrowLen[h];
        const oo = live ? showAt(ff) : 0;
        gt.set({ ...at(h, ff), s: 0.45 + 0.55 * oo, o: (0.55 - 0.15 * j) * oo });
      });
    };
  }

  V.scene({
    kicker: "GRAPH MODEL: MANY-TO-MANY",
    title: ["When the links", "are the data"],
    dur: 14.0,
    caps: [
      [1.3, 3.6, "A graph stores things and their links."],
      [3.9, 5.7, "Each kind of link has a label."],
      [6.9, 9.1, "A vertex lists its links in and out."],
      [9.5, 12.0, "To find a route, walk the edges."],
      [12.3, 13.6, "Three hops."],
    ],
    build,
  });
})();
