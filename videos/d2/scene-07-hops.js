/* Lecture 2 · scene 7 (FOLLOWING LINKS): friends of friends, joins or edges? (lesson 2.3 "Graph models" + workshop 2.W "Ask the data":
   five people in a chain of friendships). In the workshop a hop means "go to this person's friends", and friends of friends of Ana are
   found with TWO hops: Cy. To reach them tables need one JOIN per hop, documents one FETCH per hop in your code, while a graph repeats
   the same move: follow an edge. Go on to a third hop (Dee, "three steps away") and a fourth (Eli) and the tables and the documents
   need one more block each time, the graph does not. Every count comes from D2.walk (asserted when the page loads): two hops from Ana
   reach Cy with 2 joins and 2 fetches, three reach Dee with 3 and 3, four reach Eli with 4 and 4.
   Layout: the chain of five people on top (the same pills as scene 6), under it three pipelines, one per model: a row label, a
   "start Ana" block, one block per step the query needs (a small pictogram over its word: two joined tables, braces, a hop from one
   dot to the next), and at the row end the person it reaches. Rows 1 and 2 grow one block per hop (join, fetch); row 3 keeps ONE
   "follow" block that lights up again on every hop, and a hop counter.
   Story (local seconds): 0.25-1.15 the five people pop and the four friendships draw on; 1.5-2.5 the three row labels, the "start Ana"
   blocks and the rails; 2.45 Ana turns blue (the start); HOPS leave at 2.9, 4.6, 7.6 and 10.0, a blue token hops along the friendship
   (0.6 s), the person it reaches turns blue, and in the same beat a join, a fetch and the counter appear; the follow block lights up.
   HOP 2 reaches Cy, who turns green with the green tag "friends of friends" (5.35) and the three rows end in a green "Cy"; HOP 3
   (7.6) reaches Dee (the tag goes, the answers say Dee); 8.7 a dashed red "+" waits at the end of rows 1 and 2 (the query must
   change) and Eli gets a dashed orange ring; HOP 4 leaves at 10.0: the "+" slots fill with join 4 and fetch 4, the counter goes 3 to
   4 and no block is added to the graph row, Eli turns green and the answers say Eli; 11.2 three tags: one more join, one more
   fetch (red, a cost), same move (green). Then the picture holds. */
(function () {
  const V = window.VID;
  const D2 = V.d2;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;

  // ---------- the data (asserted against the storyboard and the workshop) ----------
  const C = D2.CHAIN;
  const START = C.people[0];
  const [W2, W3, W4] = [2, 3, 4].map((n) => D2.walk(START, n));
  const STEPS = W4.steps; // one step per hop: who it starts from, who it reaches, along which friendship
  D2.same("hops scene: five people in a chain of four friendships", [C.people.length, C.friends.length], [5, 4]);
  D2.same(
    "hops scene: two hops from Ana reach Cy (friends of friends) with 2 joins and 2 fetches",
    [W2.result, W2.joins, W2.fetches],
    [["Cy"], 2, 2],
  );
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
  D2.same("hops scene: the first hops of the long walk are the short walks", STEPS.slice(0, 3), W3.steps);
  D2.same(
    "hops scene: the walk meets the people in the order of the chain",
    STEPS.map((s) => s.reached[0]),
    C.people.slice(1),
  );
  const HOPS = STEPS.length; // 4
  const FOF = W2.hops; // 2: friends of friends are two hops away
  const ANSWERS = { [FOF]: W2.result[0], 3: W3.result[0], [HOPS]: W4.result[0] }; // who the query ends at after hop 2, 3, 4: Cy, Dee, Eli
  const ANSWER = (h) => ANSWERS[h] ?? null; // nobody has been "found" after hop 1

  // ---------- layout (stage px; everything keeps the 12 px margin) ----------
  const CHAIN_Y = 46;
  const CHAIN_X = [90, 280, 470, 660, 850]; // the pill centres (pills are 110-126 px wide, so the chain spans 27-913)
  const FOF_TAG = { y: 92, h: 50 }; // under the person two hops away
  const ROW = { y: [156, 314, 472], h: 90 }; // each row has room under it for its tag
  const LABEL = { x: 12, w: 178 };
  const BLOCK = { x0: 202, w: 100, pitch: 118 };
  const blockX = (j) => BLOCK.x0 + j * BLOCK.pitch; // j = 0 is the "start" block, j = 1.. the steps
  const CHIP = { x: 796, w: 116 }; // the person the row reaches
  const tagW = (text) => Math.round(40 + 14.4 * text.length); // width of a 28 px tag as it is really drawn
  const TAG_H = 50;
  const TAG_Y = ROW.y.map((y) => y + ROW.h + 10); // 4 px under the block's lip
  const midY = (r) => ROW.y[r] + ROW.h / 2;
  const inside = (what, a, b) => D2.same(`hops scene: ${what} keeps the 12 px margin`, a >= 12 && b <= 924, true);
  inside("the chain", CHAIN_X[0] - 63 - 9, CHAIN_X[4] + 63 + 9);
  inside("the pipelines", LABEL.x, CHIP.x + CHIP.w);
  D2.same("hops scene: the fourth block still ends before the result", blockX(HOPS) + BLOCK.w < CHIP.x, true);
  D2.same("hops scene: the bottom tag keeps the 12 px margin", TAG_Y[2] + TAG_H + 6 <= 640 - 12, true);
  D2.same("hops scene: the friends-of-friends tag clears the first row", FOF_TAG.y + FOF_TAG.h + 6 < ROW.y[0], true);

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
  const FOF_TEXT = "friends of friends";
  inside("the friends-of-friends tag", CHAIN_X[FOF] - tagW(FOF_TEXT) / 2, CHAIN_X[FOF] + tagW(FOF_TEXT) / 2);

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
    leave: [2.9, 4.6, 7.6, 10.0], // hop 1..4 leaves its person (hop 2 is "friends of friends", hop 4 comes after the question)
    travel: 0.6, // seconds from person to person
    ghost: 8.7, // the dashed "+" slots
    tags: 11.2,
  };
  const leave = (h) => T.leave[h - 1]; // hop h = 1..4
  const arrive = (h) => leave(h) + T.travel;
  T.chips = arrive(FOF) + 0.15; // the answer of the two-hop query: Cy, in the three rows and in the green tag
  T.pulse = T.ghost + 0.35;
  D2.same(
    "hops scene: the answers wait for the second arrival, the ghosts for the third and the fourth hop for the question",
    [
      arrive(FOF) < T.chips,
      T.chips < leave(3),
      arrive(3) < T.ghost,
      T.ghost < leave(HOPS),
      arrive(HOPS) < T.tags,
      T.tags + 0.3 + 0.4 < 14.6,
    ],
    [true, true, true, true, true, true],
  );
  const smooth = (x) => x * x * (3 - 2 * x);
  const PULSE = { to: leave(HOPS) + 0.4, period: 0.6 }; // two calm pulses (from T.pulse) while the question hangs

  /** the "+" of an empty slot, as SVG (centre cx, cy) */
  const plusSign = (cx, cy, r) =>
    V.s("path", {
      d: `M ${cx - r} ${cy} L ${cx + r} ${cy} M ${cx} ${cy - r} L ${cx} ${cy + r}`,
      fill: "none",
      "stroke-width": "9",
      "stroke-linecap": "round",
      style: { stroke: D2.tone("red").c },
    });

  /** the pictogram over a block's word (SVG group around the block's top half, centre cx, cy): what the step does */
  function pictogram(word, cx, cy) {
    const tone = D2.tone(ROWS.find((r) => r.word === word).tone);
    const rect = (x) =>
      V.s("rect", {
        x: x - 11,
        y: cy - 13,
        width: 22,
        height: 26,
        rx: 6,
        "stroke-width": 4,
        style: { fill: tone.dim, stroke: tone.c },
      });
    const dot = (x) => V.s("circle", { cx: x, cy, r: 8, style: { fill: tone.c } });
    if (word === "fetch") return D2.icon.braces(cx, cy, 36, "orange");
    if (word === "join")
      // two small tables with a link between them: the key joins them
      return V.s(
        "g",
        {},
        V.s("line", { x1: cx - 14, y1: cy, x2: cx + 14, y2: cy, "stroke-width": 7, style: { stroke: tone.c } }),
        rect(cx - 19),
        rect(cx + 19),
      );
    // follow: from one vertex to the next
    return V.s(
      "g",
      {},
      dot(cx - 22),
      V.s("path", {
        d: `M ${cx - 10} ${cy} L ${cx + 8} ${cy} M ${cx + 1} ${cy - 8} L ${cx + 9} ${cy} L ${cx + 1} ${cy + 8}`,
        fill: "none",
        "stroke-width": 5,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        style: { stroke: tone.c },
      }),
      dot(cx + 23),
    );
  }

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
        D2.card(stage, {
          x: blockX(j + 1),
          y,
          w: BLOCK.w,
          h: ROW.h,
          text: `\n${r.word}`, // the first line stays empty: the pictogram sits there
          tone: r.tone,
          plain: false,
        }),
      );
      const ghost = i < 2 ? D2.card(stage, { x: blockX(HOPS), y, w: BLOCK.w, h: ROW.h, text: "", tone: "red" }) : null;
      const chip = D2.card(stage, {
        x: CHIP.x,
        y,
        w: CHIP.w,
        h: ROW.h,
        text: ANSWER(FOF),
        tone: "green",
        plain: false,
      });
      const rail = rails.appendChild(
        L5.arrow(LABEL.x + LABEL.w + 8, midY(i), CHIP.x - 6, midY(i), "grey", 1, { w: 5, head: 16 }),
      );
      rail.querySelectorAll("path").forEach((q) => {
        q.style.stroke = "var(--line-2)"; // as pale as the friendships above
        if (q.hasAttribute("data-head")) q.style.fill = "var(--line-2)";
      });
      return { label, start, steps, ghost, chip, rail };
    });
    const stat = D2.stat(stage, { x: blockX(2), y: ROW.y[2] + 7, w: 170, h: ROW.h - 14, label: "hops", tone: "green" });
    const top = L5.svg(stage); // the pictograms and the "+" signs, over the cards
    const pics = rows.map((row, i) =>
      row.steps.map((_, j) => top.appendChild(pictogram(ROWS[i].word, blockX(j + 1) + BLOCK.w / 2, ROW.y[i] + 29))),
    );
    const plus = [0, 1].map((i) => top.appendChild(plusSign(blockX(HOPS) + BLOCK.w / 2, midY(i), 18)));
    const tags = ROWS.map((r, i) =>
      D2.tag(stage, { x: TAG_X[i], y: TAG_Y[i], text: r.tag, tone: r.tagTone, solid: true, h: TAG_H }),
    );
    const tagFof = D2.tag(stage, {
      x: CHAIN_X[FOF] - tagW(FOF_TEXT) / 2,
      y: FOF_TAG.y,
      text: FOF_TEXT,
      tone: "green",
      solid: true,
      h: FOF_TAG.h,
    });
    const tok = D2.token(stage, { tone: "blue", size: 30 });

    return (t) => {
      const lin = (a, d = 0.35) => ramp(t, a, a + d, E.lin);
      const done = Array.from({ length: HOPS }, (_, h) => t >= arrive(h + 1)); // hop h + 1 has arrived
      const hopsDone = done.filter(Boolean).length;
      const answer = ANSWER(hopsDone); // who the query ends at right now (null until the second hop has arrived)
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
        if (id === ANSWERS[HOPS] && !done[HOPS - 1])
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

      // the green tag under the person two hops away: it names that answer, and goes when the third hop leaves
      tagFof.set({ k: lin(T.chips, 0.4), o: 1 - ramp(t, leave(3) - 0.1, leave(3) + 0.15, E.lin) });

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
        // 62 % of the rail draws with the start blocks; the rest and the arrow head come just before the first answer
        L5.drawOn(row.rail, clamp(0.62 * lin(T.start + i * T.rowStep, 0.6) + 0.38 * lin(arrive(FOF) - 0.05, 0.4)));
        row.steps.forEach((blk, j) => {
          const a = arrive(i < 2 ? j + 1 : 1) + 0.05; // the graph row has just the one "follow" block, shown at the first hop
          // the follow block fires again on every hop: solid blue and a little bigger for a moment
          const fire =
            i === 2 ? STEPS.reduce((s, _, h) => s + flash(t, arrive(h + 1) + 0.05, arrive(h + 1) + 0.5), 0) : 0;
          const k = lin(a);
          blk.set({ k, s: 1 + 0.12 * fire, solid: fire > 0.35 });
          V.place(pics[i][j], {
            s: (0.7 + 0.3 * E.pop(k)) * (1 + 0.12 * fire),
            o: fire > 0.35 ? 0 : Math.min(1, k * 4), // the pictogram is blue like the lit block: it hides while the block is solid
          });
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
        // the answer changes with every hop from the second on: Cy, then Dee, then Eli (a small pulse at each change)
        const flashAt = [FOF, 3, HOPS].reduce((s, h) => s + flash(t, arrive(h) + 0.05, arrive(h) + 0.4), 0);
        row.chip.set({
          text: answer ?? ANSWER(FOF),
          solid: true,
          k: lin(T.chips + i * 0.1),
          s: 1 + 0.15 * flashAt,
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
    dur: 14.6,
    caps: [
      [1.0, 2.9, "Five people, linked in a chain."],
      [3.6, 5.4, "A join, a fetch, or a follow."],
      [5.5, 7.5, "Two hops: friends of friends."],
      [8.8, 10.4, "Now add a fourth hop."],
      [11.3, 14.0, "Queries grow, the graph walk does not."],
    ],
    build,
  });
})();
