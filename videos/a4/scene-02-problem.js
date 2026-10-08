/* Phase 4 · scene 02-problem (11 s): link every town with as little cable as possible. The answer is a spanning tree: every town
   reachable, no loops, one cable fewer than there are towns. Tree T (AB BC BD DE) is laid cable by cable on the example network,
   checked (green), then a fifth cable (AC) closes a loop (red) and goes again. Every cable and number comes from A4 (common.js). */
(function () {
  const V = window.VID;
  const A4 = V.a4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  const T = A4.EXCHANGE.T; // the tree of this scene (also the starting tree of scene 4)
  const SPARE = A4.EXCHANGE.e; // the fifth cable: AC
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
    dur: 11,
    caps: [
      [0.4, 2.8, "Every cable has a cost. Every town must be linked."],
      [3.0, 6.3, "Four cables link all five towns: a spanning tree."],
      [6.5, 10.5, "A fifth cable makes a loop. A tree has no loops."],
    ],
    build(stage) {
      // the grey cables live on their own layer under the towns, so a cable that turns blue, green or red grows over its grey self
      const under = A4.net(stage, { x: 24, y: 20, s: 1, pills: false, hidden: true });
      const g = A4.net(stage, { x: 24, y: 20, s: 1 });
      const cables = A4.total(stage, { x: 650, y: 30, w: 270, label: "cables", tone: "blue" });
      const towns = A4.total(stage, { x: 650, y: 130, w: 270, label: "towns", tone: "grey" });
      const fewer = A4.tag(stage, { x: 700, y: 232, text: "one fewer", tone: "green" });
      const badge = L5.badge(stage, { x: 24, y: 490, w: 340, h: 68, valid: "spanning tree", invalid: "a loop" });
      const svg = L5.svg(stage);
      const cross = svg.appendChild(L5.cross(165, 243, 72, "red", { w: 9 })); // the middle of the loop A-B-C
      const arriveAt = {};
      LAY.forEach((l) => l.arrive.forEach((c) => (arriveAt[c] = l.b)));

      return (t) => {
        const dim = 1 - 0.45 * ramp(t, 6.1, 6.6); // cables that are not in play fade back once the tree is checked
        const edges = {};
        const greys = {};
        // 1. the seven cables draw on in grey (the lines on the lower layer, their weight pills on the main graph)
        A4.EDGE_KEYS.forEach((key, i) => {
          const k = ramp(t, 1.0 + 0.12 * i, 1.4 + 0.12 * i);
          const o = T.includes(key) ? 1 : dim; // a cable of the tree is covered by its colour anyway; the others dim
          greys[key] = { tone: "grey", k, o };
          edges[key] = { tone: "grey", k, o: 0, pillO: o };
        });
        // 2. tree T laid one cable at a time (blue), then checked (green)
        LAY.forEach((l, j) => {
          if (t < l.a) return;
          const k = ramp(t, l.a, l.b);
          const v = 6.1 + 0.08 * j;
          const alarm = t >= 7.7 && t < 9.0 && (l.k === "AB" || l.k === "BC");
          const green = t >= v && !alarm;
          const tone = alarm ? "red" : green ? "green" : "blue";
          edges[l.k] = {
            tone,
            solid: k >= 0.5,
            pill: 1,
            pillTone: k >= 0.5 ? tone : "grey",
            w: 1.3,
            k,
            from: l.from,
            halo: alarm ? ramp(t, 7.7, 8.0) : tone === "green" ? flash(t, v, v + 0.4) : 0,
          };
        });
        // 3. the fifth cable lights up red from A and closes a loop, then shrinks back to being an unused (grey) cable
        const kSpare = t < 9.0 ? ramp(t, 7.2, 7.7) : 1 - ramp(t, 9.0, 9.6);
        if (t >= 7.2 && kSpare > 0.04) {
          edges[SPARE] = {
            tone: "red",
            k: kSpare,
            from: "A",
            w: 1.3,
            solid: t >= 7.7,
            pill: t < 9.0 ? 1 : undefined,
            pillTone: kSpare >= 0.5 ? "red" : "grey",
            halo: t < 9.0 ? ramp(t, 7.7, 8.0) : 0,
          };
        } else if (t >= 7.2) edges[SPARE] = { tone: "grey", o: 0, pillO: dim * ramp(t, 9.6, 10.0) };
        // towns: pop in, blue when the tree reaches them, green once it is checked
        const townState = {};
        A4.TOWNS.forEach((c, i) => {
          const k = ramp(t, 0.2 + 0.1 * i, 0.7 + 0.1 * i, E.lin);
          const v = 6.1 + 0.06 * i;
          const st = t >= v ? { tone: "green", solid: true, bump: flash(t, v, v + 0.3), up: 0.15 } : null;
          const lay =
            !st && t >= arriveAt[c]
              ? { tone: "blue", solid: true, bump: flash(t, arriveAt[c], arriveAt[c] + 0.3), up: 0.1 }
              : null;
          const s = st || lay || { tone: "grey", bump: 0, up: 0 };
          townState[c] = { tone: s.tone, solid: !!s.solid, s: E.pop(k) * (1 + s.up * s.bump), o: Math.min(1, 4 * k) };
        });
        under.update({ edges: greys, base: { town: { o: 0 } } });
        g.update({ edges, towns: townState });

        // counters
        const laid = LAY.filter((l) => t >= l.b).length;
        const lastLaid = LAY.reduce((m, l) => (t >= l.b ? l.b : m), 0);
        const loop = t >= 7.8 && t < 9.3;
        const back = t >= 9.3;
        const mark = loop ? 7.8 : back ? 9.3 : lastLaid;
        cables.set({
          text: String(loop ? laid + 1 : laid),
          tone: loop ? "red" : t >= 6.4 ? "green" : "blue",
          bump: flash(t, mark, mark + 0.4) * (mark > 0 ? 1 : 0),
          k: ramp(t, 2.9, 3.3),
        });
        towns.set({ text: String(A4.TOWNS.length), k: ramp(t, 2.7, 3.1) });
        fewer.set({ k: ramp(t, 9.6, 10.2) });

        // verdict badge and the loop's cross
        if (t < 6.3) badge("none", 0);
        else if (t < 7.8) badge("valid", ramp(t, 6.3, 6.9));
        else if (t < 9.4) badge("invalid", ramp(t, 7.8, 8.3));
        else badge("valid", ramp(t, 9.4, 9.9));
        L5.drawOn(cross, ramp(t, 7.8, 8.2));
        V.show(cross, 1 - ramp(t, 9.0, 9.4));
      };
    },
  });
})();
