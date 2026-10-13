/* Phase 4 · scene 02-problem (11 s): link every town with as little cable as possible. The answer is a spanning tree: every town
   reachable, no loops, one cable fewer than there are towns. Tree T (AB BC BD DE) is laid cable by cable on the example network
   (blue: a tree we look at, not the cheapest), checked (a green ring on every town and the green badge, 'one fewer' links the towns
   counter to the cables counter), then a fifth cable (AC) closes a loop (red) and goes again. Every cable and number comes from A4
   (common.js). Story (local seconds): 0.2-2.5 towns and cables, 3.0-5.8 T is laid, 6.1-7.0 checked, 8.5-11.1 the fifth cable. */
(function () {
  const V = window.VID;
  const A4 = V.a4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  const T = A4.EXCHANGE.T; // the tree of this scene (also the starting tree of scene 4)
  const SPARE = A4.EXCHANGE.e; // the fifth cable: AC
  const CHECK = 6.1; // the tree is checked: a green ring on every town, the green badge, 'one fewer'
  const SPARE0 = 8.5; // the fifth cable grows from A (0.5 s)
  const LOOP0 = 9.0; // the loop alarm
  const LOOP1 = 10.3; // the fifth cable goes again
  // lay T cable by cable: each grows from the end that is already linked
  const reached = new Set(["A"]);
  const LAY = T.map((k, j) => {
    const from = reached.has(k[0]) ? k[0] : k[1];
    const to = from === k[0] ? k[1] : k[0];
    const arrive = [...(j ? [to] : [from, to])];
    arrive.forEach((c) => reached.add(c));
    return { k, from, arrive, a: 3.0 + 0.8 * j, b: 3.4 + 0.8 * j };
  });
  A4.same("scene 2 tree", [T, A4.sumOf(T), T.length], [["AB", "BC", "BD", "DE"], 12, A4.TOWNS.length - 1]);
  A4.same("scene 2 spanning", A4.groupsOf(T).length, 1);
  A4.same(
    "scene 2 loop",
    [A4.pathIn(T, "A", "C"), A4.EXCHANGE.cycle],
    [
      ["A", "B", "C"],
      ["AB", "BC", "AC"],
    ],
  );
  A4.same(
    "scene 2 arrivals",
    LAY.map((l) => [l.from, ...l.arrive]),
    [
      ["A", "A", "B"],
      ["B", "C"],
      ["B", "D"],
      ["D", "E"],
    ],
  );

  V.scene({
    kicker: "THE PROBLEM",
    title: ["Connect every town", "with no spare cable"],
    dur: 12,
    caps: [
      [0.4, 2.8, "Link every town. Each cable has a cost."],
      [3.0, 5.9, "Add cables until every town is linked."],
      [6.1, 8.4, "Five towns, four cables: always one fewer."],
      [8.7, 11.9, "A fifth cable makes a loop. A tree has no loops."],
    ],
    build(stage) {
      // the grey cables live on their own layer under the towns, so a cable that turns blue or red grows over its grey self
      const under = A4.net(stage, { x: 24, y: 20, s: 1, pills: false, hidden: true });
      const g = A4.net(stage, { x: 24, y: 20, s: 1 });
      // right column: towns 5 on top, cables 4 below, an arrow and 'one fewer' between them
      const towns = A4.total(stage, { x: 650, y: 30, w: 270, label: "towns", tone: "grey" });
      const cables = A4.total(stage, { x: 650, y: 200, w: 270, label: "cables", tone: "blue" });
      const fewer = A4.tag(stage, { x: 722, y: 139, text: "one fewer", tone: "green" });
      const badge = L5.badge(stage, { x: 24, y: 490, w: 340, h: 68, valid: "spanning tree", invalid: "a loop" });
      const svg = L5.svg(stage);
      const cross = svg.appendChild(L5.cross(165, 243, 72, "red", { w: 9 })); // the middle of the loop A-B-C
      const down = svg.appendChild(L5.arrow(686, 128, 686, 190, "green", 1, { w: 6, head: 20 }));
      const arriveAt = {};
      LAY.forEach((l) => l.arrive.forEach((c) => (arriveAt[c] = l.b)));

      return (t) => {
        const dim = 1 - 0.45 * ramp(t, CHECK, CHECK + 0.5); // cables that are not in play fade back once the tree is checked
        const edges = {};
        const greys = {};
        // 1. the seven cables draw on in grey (the lines on the lower layer, their weight pills on the main graph)
        A4.EDGE_KEYS.forEach((key, i) => {
          const k = ramp(t, 1.0 + 0.12 * i, 1.4 + 0.12 * i);
          const o = T.includes(key) ? 1 : dim; // a cable of the tree is covered by its colour anyway; the others dim
          greys[key] = { tone: "grey", k, o };
          edges[key] = { tone: "grey", k, o: 0, pillO: o };
        });
        // 2. tree T laid one cable at a time (blue); a loop turns the cables of the loop red
        LAY.forEach((l, j) => {
          if (t < l.a) return;
          const k = ramp(t, l.a, l.b);
          const alarm = t >= LOOP0 && t < LOOP1 && (l.k === "AB" || l.k === "BC");
          const tone = alarm ? "red" : "blue";
          const v = CHECK + 0.08 * j;
          edges[l.k] = {
            tone,
            solid: k >= 0.5,
            pill: 1,
            pillTone: k >= 0.5 ? tone : "grey",
            w: 1.3,
            k,
            from: l.from,
            halo: alarm ? ramp(t, LOOP0, LOOP0 + 0.3) : flash(t, v, v + 0.4),
          };
        });
        // 3. the fifth cable lights up red from A and closes a loop, then shrinks back to being an unused (grey) cable
        const kSpare = t < LOOP1 ? ramp(t, SPARE0, SPARE0 + 0.5) : 1 - ramp(t, LOOP1, LOOP1 + 0.6);
        if (t >= SPARE0 && kSpare > 0.04) {
          edges[SPARE] = {
            tone: "red",
            k: kSpare,
            from: "A",
            w: 1.3,
            solid: t >= SPARE0 + 0.5,
            pill: t < LOOP1 ? 1 : undefined,
            pillTone: kSpare >= 0.5 ? "red" : "grey",
            halo: t < LOOP1 ? ramp(t, LOOP0, LOOP0 + 0.3) : 0,
          };
        } else if (t >= SPARE0) edges[SPARE] = { tone: "grey", o: 0, pillO: dim * ramp(t, LOOP1 + 0.6, LOOP1 + 1.0) };
        // towns: pop in, blue when the tree reaches them, a green ring when the tree is checked
        const townState = {};
        A4.TOWNS.forEach((c, i) => {
          const k = ramp(t, 0.2 + 0.1 * i, 0.7 + 0.1 * i, E.lin);
          const v = CHECK + 0.06 * i;
          const lay = t >= arriveAt[c] ? { solid: true, up: 0.1, at: arriveAt[c] } : { solid: false, up: 0, at: 0 };
          const bump = flash(t, lay.at, lay.at + 0.3) + flash(t, v, v + 0.3);
          const ring = ramp(t, v, v + 0.3) * (1 - ramp(t, 7.4, 7.8, E.lin));
          townState[c] = {
            tone: lay.solid ? "blue" : "grey",
            solid: lay.solid,
            s: E.pop(k) * (1 + 0.12 * bump),
            o: Math.min(1, 4 * k),
            ...(ring > 0.003 ? { ring: "green", ringK: ring } : {}),
          };
        });
        under.update({ edges: greys, base: { town: { o: 0 } } });
        g.update({ edges, towns: townState });

        // counters
        const laid = LAY.filter((l) => t >= l.b).length;
        const lastLaid = LAY.reduce((m, l) => (t >= l.b ? l.b : m), 0);
        const loop = t >= LOOP0 && t < LOOP1 + 0.3;
        const back = t >= LOOP1 + 0.3;
        const mark = loop ? LOOP0 : back ? LOOP1 + 0.3 : lastLaid;
        cables.set({
          text: String(loop ? laid + 1 : laid),
          tone: loop ? "red" : t >= CHECK + 0.3 ? "green" : "blue",
          bump: flash(t, mark, mark + 0.4) * (mark > 0 ? 1 : 0),
          k: ramp(t, 2.9, 3.3),
        });
        towns.set({ text: String(A4.TOWNS.length), k: ramp(t, 2.7, 3.1) });
        const fk = ramp(t, CHECK + 0.4, CHECK + 0.9);
        fewer.set({ k: fk });
        L5.drawOn(down, ramp(t, CHECK + 0.3, CHECK + 0.7));
        V.show(down, fk > 0 ? 1 : 0);

        // verdict badge and the loop's cross
        if (t < CHECK + 0.2)
          badge("valid", 0); // hidden, but in its start state (the badge keeps its colour between calls)
        else if (t < LOOP0) badge("valid", ramp(t, CHECK + 0.2, CHECK + 0.8));
        else if (t < LOOP1 + 0.4) badge("invalid", ramp(t, LOOP0, LOOP0 + 0.5));
        else badge("valid", ramp(t, LOOP1 + 0.4, LOOP1 + 0.9));
        L5.drawOn(cross, ramp(t, LOOP0, LOOP0 + 0.4));
        V.show(cross, 1 - ramp(t, LOOP1, LOOP1 + 0.4));
      };
    },
  });
})();
