/* Lecture 2 · scene 7 (FOLLOWING LINKS): friends of friends, joins or edges? (lesson 2.3 "Graph models" + workshop 2.W "Ask the data":
   five people in a chain of friendships). To reach the friends of friends of Ana, tables need one more JOIN per hop and documents one more
   FETCH in your code, while a graph repeats the same move: follow an edge. Every count comes from D2.walk (asserted when the page loads):
   three hops from Ana reach Dee with 3 joins and 3 fetches, four hops reach Eli with 4 and 4.
   Layout: the chain of five people on top (the same pills as scene 6), under it three pipelines, one per model: a row label, a "start Ana"
   block, one block per step the query needs, and at the row end the person it reaches. Rows 1 and 2 grow one block per hop (join, fetch);
   row 3 keeps ONE "follow" block and a hop counter.
   Story (local seconds): 0.25-1.15 the five people pop and the four friendships draw on; 1.5-2.5 the three row labels, the "start Ana"
   blocks and the rails; 2.45 Ana turns blue (the start); HOPS 1-3 leave at 2.8, 4.0, 5.2: a blue token hops along the friendship (0.6 s),
   the person it reaches turns blue, and in the same beat a join, a fetch and the counter "hops" appear; Dee, the third, turns green and the
   three rows end in a green "Dee" at 6.1; 6.9 a dashed red "+" waits at the end of rows 1 and 2 (the query must change) and Eli gets a
   dashed orange ring; HOP 4 leaves at 8.0: the "+" slots fill with join 4 and fetch 4, the counter goes 3 to 4 and no block is added to
   the graph row, Eli turns green and the result chips say Eli; 9.3 three tags: one more join, one more fetch (red, a cost), same move
   (green). Then the picture holds. */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;

  // ---------- the data (asserted against the storyboard and the workshop) ----------
  const C = D2.CHAIN;
  const START = C.people[0];
  const W3 = D2.walk(START, 3);
  const W4 = D2.walk(START, 4);
  const STEPS = W4.steps; // one step per hop: who it starts from, who it reaches, along which friendship
  D2.same("hops scene: five people in a chain of four friendships", [C.people.length, C.friends.length], [5, 4]);
  D2.same(
    "hops scene: three hops from Ana reach Dee with 3 joins and 3 fetches",
    [W3.result, W3.joins, W3.fetches],
    [["Dee"], 3, 3],
  );
  D2.same(
    "hops scene: four hops reach Eli with 4 joins and 4 fetches",
    [W4.result, W4.joins, W4.fetches],
    [["Eli"], 4, 4],
  );
  D2.same(
    "hops scene: each hop reaches exactly one new person",
    STEPS.map((s) => s.reached.length),
    [1, 1, 1, 1],
  );
  D2.same("hops scene: the first three hops of the long walk are the short walk", STEPS.slice(0, 3), W3.steps);
  D2.same(
    "hops scene: the walk meets the people in the order of the chain",
    STEPS.map((s) => s.reached[0]),
    C.people.slice(1),
  );
  const HOPS = STEPS.length; // 4
  const SHORT = W3.hops; // 3: the hops before the "fourth hop?" question
  const [ANSWER3, ANSWER4] = [W3.result[0], W4.result[0]]; // Dee, then Eli

  // ---------- layout (stage px; everything keeps the 12 px margin) ----------
  const CHAIN_Y = 54;
  const CHAIN_X = [90, 280, 470, 660, 850]; // the pill centres (pills are 110-126 px wide, so the chain spans 27-913)
  const ROW = { y: [124, 300, 476], h: 76 }; // each row has room under it for its tag
  const LABEL = { x: 12, w: 178 };
  const BLOCK = { x0: 202, w: 100, pitch: 118 };
  const blockX = (j) => BLOCK.x0 + j * BLOCK.pitch; // j = 0 is the "start" block, j = 1.. the steps
  const CHIP = { x: 796, w: 116 }; // the person the row reaches
  const tagW = (text) => Math.round(40 + 14.4 * text.length); // width of a 28 px tag as it is really drawn
  const TAG_H = 63; // and its height
  const TAG_Y = ROW.y.map((y) => y + ROW.h + 12); // 6 px under the block's lip
  const midY = (r) => ROW.y[r] + ROW.h / 2;
  const inside = (what, a, b) => D2.same(`hops scene: ${what} keeps the 12 px margin`, a >= 12 && b <= 924, true);
  inside("the chain", CHAIN_X[0] - 63 - 9, CHAIN_X[4] + 63 + 9);
  inside("the pipelines", LABEL.x, CHIP.x + CHIP.w);
  D2.same("hops scene: the fourth block still ends before the result", blockX(HOPS) + BLOCK.w < CHIP.x, true);
  D2.same("hops scene: the bottom tag keeps the 12 px margin", TAG_Y[2] + TAG_H <= 640 - 12, true);

  const ROWS = [
    { label: "Tables", word: "join", tone: "purple", tag: "one more join", tagTone: "red", n: W4.joins },
    { label: "Documents", word: "fetch", tone: "orange", tag: "one more fetch", tagTone: "red", n: W4.fetches },
    { label: "Graph", word: "follow", tone: "blue", tag: "same move", tagTone: "green", n: 1 },
  ];
  D2.same(
    "hops scene: the tables grow one join per hop, the documents one fetch",
    [ROWS[0].n, ROWS[1].n],
    [HOPS, HOPS],
  );
  const TAG_X = [blockX(HOPS) + BLOCK.w / 2, blockX(HOPS) + BLOCK.w / 2, blockX(1) + BLOCK.w / 2].map(
    (cx, r) => cx - tagW(ROWS[r].tag) / 2,
  );
  TAG_X.forEach((x, r) => inside(`tag ${r + 1}`, x, x + tagW(ROWS[r].tag)));

  // ---------- timeline ----------
  const T = {
    node: 0.25, // the people pop, 0.12 s apart
    nodeStep: 0.12,
    edge: 0.4, // the friendships draw on
    edgeStep: 0.12,
    label: 1.5, // row labels, then the start blocks and the rails
    rowStep: 0.14,
    start: 1.95,
    mark: 2.45, // the start person turns blue
    hop1: 2.8, // hop 1 leaves, hops 2 and 3 follow every 1.2 s
    hop: 1.2,
    hop4: 8.0, // the fourth hop, after the question
    travel: 0.6, // seconds from person to person
    chips: 6.1, // the answer of the three-hop query
    ghost: 6.9, // the dashed "+" slots
    pulse: 7.25,
    swap: 8.7, // the answers change to the fourth person
    tags: 9.3,
  };
  const leave = (h) => (h <= SHORT ? T.hop1 + (h - 1) * T.hop : T.hop4); // hop h = 1..4 leaves its person
  const arrive = (h) => leave(h) + T.travel;
  D2.same(
    "hops scene: the answers wait for the third arrival and the fourth hop for the question",
    [arrive(SHORT) < T.chips, T.chips < T.ghost, T.ghost < T.hop4, arrive(HOPS) < T.swap, T.swap < T.tags],
    [true, true, true, true, true],
  );
  const smooth = (x) => x * x * (3 - 2 * x);
  const PULSE = { to: T.hop4 + 0.4, period: 0.6 }; // two calm pulses (from T.pulse) while the question hangs

  /** the "+" of an empty slot, as SVG (centre cx, cy) */
  const plusSign = (cx, cy, r) =>
    V.s("path", {
      d: `M ${cx - r} ${cy} L ${cx + r} ${cy} M ${cx} ${cy - r} L ${cx} ${cy + r}`,
      fill: "none",
      "stroke-width": "9",
      "stroke-linecap": "round",
      style: { stroke: D2.tone("red").c },
    });

  function build(stage) {
    const rails = L5.svg(stage); // under the blocks: one arrow per row from the start block to the answer
    const nodes0 = Object.fromEntries(C.people.map((id, i) => [id, { x: CHAIN_X[i], y: CHAIN_Y, kind: "person" }]));
    const friends = C.friends.map(([a, b]) => [a, b, "FRIEND"]);
    const g = D2.graph(stage, { nodes: nodes0, edges: friends, directed: false });
    const hi = D2.graph(stage, { nodes: nodes0, edges: friends, directed: false }); // the walked friendships, in blue, on top
    D2.same(
      "hops scene: every hop walks one of the chain's friendships",
      STEPS.map((s) => g.keys.includes(s.edges[0])),
      [true, true, true, true],
    );

    // ---- the three pipelines ----
    const rows = ROWS.map((r, i) => {
      const y = ROW.y[i];
      const label = D2.card(stage, { x: LABEL.x, y, w: LABEL.w, h: ROW.h, text: r.label, tone: "grey", plain: false });
      const start = D2.card(stage, { x: blockX(0), y, w: BLOCK.w, h: ROW.h, text: `start\n${START}`, tone: "grey" });
      const steps = Array.from({ length: r.n }, (_, j) =>
        D2.card(stage, { x: blockX(j + 1), y, w: BLOCK.w, h: ROW.h, text: r.word, tone: r.tone, plain: false }),
      );
      const ghost = i < 2 ? D2.card(stage, { x: blockX(HOPS), y, w: BLOCK.w, h: ROW.h, text: "", tone: "red" }) : null;
      const chip = D2.card(stage, { x: CHIP.x, y, w: CHIP.w, h: ROW.h, text: ANSWER3, tone: "green", plain: false });
      const rail = rails.appendChild(
        L5.arrow(LABEL.x + LABEL.w + 8, midY(i), CHIP.x - 6, midY(i), "grey", 1, { w: 5, head: 16 }),
      );
      rail.querySelectorAll("path").forEach((q) => {
        q.style.stroke = "var(--line-2)"; // as pale as the friendships above
        if (q.hasAttribute("data-head")) q.style.fill = "var(--line-2)";
      });
      return { label, start, steps, ghost, chip, rail };
    });
    const stat = D2.stat(stage, { x: blockX(2), y: ROW.y[2], w: 170, h: ROW.h, label: "hops", tone: "green" });
    const top = L5.svg(stage); // the "+" signs
    const plus = [0, 1].map((i) => top.appendChild(plusSign(blockX(HOPS) + BLOCK.w / 2, midY(i), 18)));
    const tags = ROWS.map((r, i) =>
      D2.tag(stage, { x: TAG_X[i], y: TAG_Y[i], text: r.tag, tone: r.tagTone, solid: true }),
    );
    const tok = D2.token(stage, { tone: "blue", size: 30 });

    return (t) => {
      const lin = (a, d = 0.35) => ramp(t, a, a + d, E.lin);
      const done = Array.from({ length: HOPS }, (_, h) => t >= arrive(h + 1)); // hop h + 1 has arrived
      const hopsDone = done.filter(Boolean).length;
      const answer = t >= arrive(HOPS) ? ANSWER4 : t >= arrive(SHORT) ? ANSWER3 : null; // who the query ends at right now
      const up = (h) => smooth(clamp((t - leave(h + 1)) / T.travel)); // how far hop h + 1 has got along its friendship (0..1)

      // ---- the chain: people pop, friendships draw on; the walker colours both ----
      const nodes = {};
      C.people.forEach((id, i) => {
        const st = { k: D2.seq(t, T.node, T.nodeStep, 0.4, i) };
        const h = STEPS.findIndex((s) => s.reached[0] === id); // the hop that reaches this person, -1 for Ana
        if (id === START && t >= T.mark)
          Object.assign(st, { tone: "blue", solid: true, s: 1 + 0.12 * flash(t, T.mark, T.mark + 0.35) });
        if (h >= 0 && done[h])
          Object.assign(st, {
            tone: id === answer ? "green" : "blue",
            solid: true,
            s: 1 + 0.12 * flash(t, arrive(h + 1), arrive(h + 1) + 0.35),
          });
        if (id === ANSWER4 && !done[HOPS - 1])
          Object.assign(st, { ring: "orange", ringDash: true, ringK: lin(T.ghost, 0.3) });
        nodes[id] = st;
      });
      const edges = {};
      C.friends.forEach(
        (_, i) => (edges[g.keys[i]] = { tone: "grey", k: E.out(D2.seq(t, T.edge, T.edgeStep, 0.3, i)) }),
      );
      g.update({ nodes, edges });
      const lit = {};
      STEPS.forEach((s, h) => (lit[s.edges[0]] = { tone: "blue", k: up(h), w: 1.4 }));
      hi.update({ base: { node: { k: 0 }, edge: { k: 0, label: 0 } }, edges: lit });

      // ---- the walker: it hops along one friendship at a time, in a small arc ----
      const cur = STEPS.reduce((c, _, h) => (t >= leave(h + 1) ? h : c), -1);
      const u = cur >= 0 ? clamp((t - leave(cur + 1)) / T.travel) : 0;
      const show = u > 0 && u < 1 ? Math.min(ramp(u, 0, 0.15, E.lin), ramp(1 - u, 0, 0.15, E.lin)) : 0;
      const p = cur >= 0 ? g.edgePt(STEPS[cur].edges[0], smooth(u)) : { x: 0, y: 0 };
      tok.set({ x: p.x, y: p.y - 22 * Math.sin(Math.PI * smooth(u)), s: 0.6 + 0.4 * show, o: show });

      // ---- the pipelines ----
      const ghostOn =
        t >= T.pulse ? 0.5 - 0.5 * Math.cos((2 * Math.PI * (Math.min(t, PULSE.to) - T.pulse)) / PULSE.period) : 0;
      rows.forEach((row, i) => {
        const at = T.label + i * T.rowStep;
        row.label.set({ k: lin(at) });
        row.label.el.style.color = "var(--ink)"; // a tinted label with full-strength text
        row.start.set({ k: lin(T.start + i * T.rowStep) });
        // 62 % of the rail draws with the start blocks; the rest and the arrow head come just before the answer
        L5.drawOn(row.rail, clamp(0.62 * lin(T.start + i * T.rowStep, 0.6) + 0.38 * lin(arrive(SHORT) - 0.05, 0.4)));
        row.steps.forEach((blk, j) => {
          const a = arrive(i < 2 ? j + 1 : 1) + 0.05; // the graph row has just the one "follow" block, shown at the first hop
          const bump =
            i === 2 ? STEPS.reduce((s, _, h) => s + flash(t, arrive(h + 1) + 0.05, arrive(h + 1) + 0.4), 0) : 0;
          blk.set({ k: lin(a), s: 1 + 0.1 * bump });
        });
        if (row.ghost) {
          const k = lin(T.ghost + i * 0.1);
          const gone = 1 - ramp(t, arrive(HOPS), arrive(HOPS) + 0.15, E.lin);
          const s = 1 + 0.06 * ghostOn;
          row.ghost.set({ k, s, o: gone });
          Object.assign(row.ghost.el.style, {
            borderStyle: "dashed",
            borderWidth: "4px",
            borderColor: "var(--rose)",
            boxShadow: "none",
            background: "var(--panel)", // opaque, so the rail does not show through the empty slot
          });
          V.place(plus[i], { s: s * (0.8 + 0.2 * E.pop(k)), o: Math.min(1, k * 4) * gone });
        }
        const swapped = t >= T.swap + 0.05;
        row.chip.set({
          text: swapped ? ANSWER4 : ANSWER3,
          solid: true,
          k: lin(T.chips + i * 0.1),
          s: 1 + 0.15 * flash(t, T.swap - 0.1, T.swap + 0.25),
        });
        tags[i].set({ k: lin(T.tags + i * 0.15, 0.4) });
      });
      stat.set({
        text: String(hopsDone),
        k: lin(arrive(1) + 0.15),
        bump: 0.6 * STEPS.reduce((s, _, h) => s + flash(t, arrive(h + 1), arrive(h + 1) + 0.35), 0),
      });
    };
  }

  V.scene({
    kicker: "FOLLOWING LINKS",
    title: ["Friends of friends:", "joins or edges?"],
    dur: 12.5,
    caps: [
      [1.2, 3.1, "Five people, linked in a chain."],
      [3.6, 6.9, "Tables add a join per hop; the graph just walks."],
      [7.2, 9.0, "Want a fourth hop?"],
      [9.4, 12.2, "Queries grow, the graph walk does not."],
    ],
    build,
  });
})();
