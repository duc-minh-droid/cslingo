/* Phase 4 · scene 03-many-trees: the five towns have 21 spanning trees. A flip-book shows each tree (with its weights, so the
   total can be checked) and drops one dot per tree onto a cost line (totals 11 to 22), while the first row of a ladder counts
   the trees up to 21; the cheapest is the minimum spanning tree. Then the count explodes (452 trees, then 20^18). The first
   five trees stay on screen for 0.5 s each, the other sixteen flip quickly. */
(function () {
  const V = window.VID;
  const A4 = V.a4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  // ---------- data (all from the real enumeration in common.js) ----------
  const ORDER = A4.FLIP.map((i) => A4.TREES[i]); // the 21 trees in flip-book order
  const MST = A4.MST;
  A4.same(
    "flip: first, last",
    [ORDER[0].name, ORDER.at(-1).keys.slice().sort(), ORDER.at(-1).total],
    ["AB BC BD DE", MST.keys, MST.total],
  );
  const SLOW = 5; // the first trees stay long enough to read their cables and total
  const LAST = ORDER.length - 1;
  const start = (j) => (j < SLOW ? 1.0 + 0.5 * j : j < LAST ? 3.5 + 0.12 * (j - SLOW) : 5.3); // flip-book: slow, then quick
  const REVEAL = 5.6; // the cheapest tree is picked out
  const DROP = 0.25;
  const X0 = 466; // cost line: x(v) = 466 + (v - 11) * 36
  const xOf = (v) => X0 + (v - 11) * 36;
  const AXIS_Y = 222;
  // a dot sits on the stack of the dots with the same total that were dropped before it
  const seen = {};
  const DOTS = ORDER.map((tr) => {
    const row = (seen[tr.total] = (seen[tr.total] || 0) + 1) - 1;
    return { x: xOf(tr.total), y: AXIS_Y - 19 - 34 * row, row };
  });
  A4.same("stack heights", Math.max(...DOTS.map((d) => d.row)) + 1, 3);
  A4.same("rightmost tick", xOf(22) < 890, true);
  const COUNTS = A4.COUNTS;
  A4.same("the 20 towns are every pair", COUNTS[2].cables, (COUNTS[2].towns * (COUNTS[2].towns - 1)) / 2);
  A4.same(
    "the first rung is the example network",
    [COUNTS[0].towns, COUNTS[0].cables, COUNTS[0].n],
    [5, 7, ORDER.length],
  );
  const ROW_Y = [414, 480, 546];
  const ROW_AT = [1.0, 7.5, 8.3];
  // each rung says how many cables it has, so the three are not mistaken for one growing network
  const ROW_LAB = [
    `5 towns · ${COUNTS[0].cables} cables`,
    `8 towns · ${COUNTS[1].cables} cables`,
    "20 towns · every pair",
  ];
  const ROW_TONE = ["blue", "blue", "red"];
  const BAR_X = 356;
  const barW = (text) => Math.min(924 - BAR_X, 110 + 26 * text.replace(/,/g, "").length);

  V.scene({
    kicker: "THE GOAL",
    title: ["Many spanning trees,", "one is cheapest"],
    dur: 11.5,
    caps: [
      [0.4, 2.9, "The same five towns have 21 different spanning trees."],
      [3.0, 5.5, "Each tree has a total cost, from 11 to 22."],
      [5.7, 7.3, "The cheapest is the minimum spanning tree."],
      [7.5, 11.0, "Bigger networks have far too many trees to try them all."],
    ],
    build(stage) {
      // the network, big enough to read each cable's weight, and the running total of the tree on show
      const g = A4.net(stage, { x: 14, y: 8, s: 0.68 });
      const tot = A4.total(stage, { x: 14, y: 322, w: 260, h: 72, label: "total", tone: "blue" });

      // plot card: axis, ticks, labels
      const card = V.h("div", {
        class: "v-card plain c-grey",
        style: { left: "436px", top: "8px", width: "488px", height: "302px" },
      });
      stage.append(card);
      const svgAxis = L5.svg(stage);
      const axis = (x1, y1, x2, y2) =>
        V.s("line", {
          x1,
          y1,
          x2,
          y2,
          "stroke-width": 4,
          "stroke-linecap": "round",
          style: { stroke: "var(--line-2)" },
        });
      svgAxis.append(axis(452, AXIS_Y, 900, AXIS_Y));
      for (let v = 11; v <= 22; v++) svgAxis.append(axis(xOf(v), AXIS_Y, xOf(v), AXIS_Y + 10));
      const text = (str, x, y, centred) =>
        stage.appendChild(
          V.h("div", {
            class: "v-text dim",
            text: str,
            style: { left: `${x}px`, top: `${y}px`, ...(centred ? { transform: "translateX(-50%)" } : {}) },
          }),
        );
      const noteR = V.h("div", {
        class: "v-text dim",
        text: "one dot = one tree",
        style: { right: "30px", top: "22px" },
      });
      stage.append(noteR);
      const plotBits = [
        noteR,
        ...[11, 14, 17, 20, 22].map((v) => text(String(v), xOf(v), AXIS_Y + 14, true)),
        text("total cost", 680, 266, true),
      ];
      // one dot per tree
      const dots = DOTS.map(() => A4.token(stage, { tone: "blue", size: 30 }));
      // 'cheapest' tag and arrow to the 11 dot
      const cheap = A4.tag(stage, { x: 452, y: 54, text: "cheapest", tone: "green", solid: true });
      const svgTop = L5.svg(stage);
      const arrow = svgTop.appendChild(L5.arrow(X0, 112, X0, 176, "green", 1, { w: 7, head: 22 }));
      // ladder: how many spanning trees? The first rung counts up while the flip-book runs
      const head = A4.tag(stage, { x: 300, y: 335, text: "how many spanning trees?" });
      const rows = COUNTS.map((c, r) => ({
        label: stage.appendChild(
          V.h("div", { class: "v-text dim", text: ROW_LAB[r], style: { left: "14px", top: `${ROW_Y[r] + 7}px` } }),
        ),
        bar: A4.bar(stage, { x: BAR_X, y: ROW_Y[r], w: barW(c.text), h: 54, fs: 30, tone: ROW_TONE[r], text: c.text }),
      }));

      return (t) => {
        // ----- the flip-book: which tree is on show -----
        let cur = -1;
        ORDER.forEach((_, j) => {
          if (t >= start(j)) cur = j;
        });
        const green = ramp(t, REVEAL, REVEAL + 0.4);
        const isMst = t >= REVEAL;
        const tree = cur >= 0 ? ORDER[cur] : null;

        // ----- the small network: only the cables of the tree on show carry a weight -----
        const netK = ramp(t, 0.5, 1.0); // the cables fade in once the towns have popped
        const edgeSt = {};
        if (tree)
          tree.keys.forEach((k) => {
            edgeSt[k] = isMst
              ? { tone: "green", w: 1.4, halo: green, o: netK, solid: true }
              : { tone: "blue", w: 1.3, o: netK, solid: true };
          });
        const dimK = isMst ? 1 - 0.5 * ramp(t, REVEAL, REVEAL + 0.4) : 0.5;
        const towns = {};
        A4.TOWNS.forEach((c, i) => {
          const k = ramp(t, 0.2 + 0.08 * i, 0.7 + 0.08 * i);
          const base = { s: 0.6 + 0.4 * E.pop(k), o: Math.min(1, k * 4) };
          if (isMst) {
            const a = REVEAL + 0.06 * i;
            towns[c] = { ...base, tone: "green", solid: t >= a, s: base.s * (1 + 0.15 * flash(t, a, a + 0.3)) };
          } else towns[c] = base;
        });
        g.update({ edges: edgeSt, towns, base: { edge: { o: dimK * netK, pill: 0 } } });

        // ----- the total -----
        tot.set({
          text: tree ? String(tree.total) : "0",
          tone: isMst ? "green" : "blue",
          solid: isMst,
          k: ramp(t, 0.5, 0.9),
          bump: isMst
            ? flash(t, REVEAL, REVEAL + 0.5)
            : cur >= 0 && cur < SLOW
              ? 0.6 * flash(t, start(cur), start(cur) + 0.3)
              : 0,
        });

        // ----- the plot card -----
        const pk = ramp(t, 0.3, 0.9);
        V.place(card, { s: 0.9 + 0.1 * pk, o: pk });
        V.show(svgAxis, pk);
        plotBits.forEach((e) => V.show(e, pk));
        dots.forEach((dot, j) => {
          const k = ramp(t, start(j), start(j) + DROP);
          const mst = j === LAST;
          const pop = mst ? ramp(t, REVEAL, REVEAL + 0.6, E.lin) : 0;
          dot.set({
            x: DOTS[j].x,
            y: DOTS[j].y - 50 * (1 - k),
            s: mst ? 1 + 0.3 * E.pop(pop) : 1,
            o: Math.min(1, k * 4) * (mst ? 1 : 1 - 0.45 * green),
            tone: mst && t >= REVEAL ? "green" : "blue",
          });
        });
        cheap.set({ k: ramp(t, REVEAL + 0.2, REVEAL + 0.6) });
        L5.drawOn(arrow, ramp(t, REVEAL + 0.3, REVEAL + 0.7, E.lin));

        // ----- the ladder -----
        head.set({ k: ramp(t, 0.6, 1.0) });
        rows.forEach((r, i) => {
          const a = ROW_AT[i];
          const lk = ramp(t, a, a + 0.3);
          V.place(r.label, { y: (1 - lk) * 8, o: lk });
          const bk = i < 2 ? ramp(t, a, a + 0.4) : ramp(t, 8.3, 8.9);
          const str = COUNTS[i].text;
          const shake = i === 2 ? ramp(t, 9.6, 10.1, E.lin) : 0;
          const dx = shake > 0 && shake < 1 ? 6 * Math.sin(shake * Math.PI * 6) * (1 - shake) : 0;
          // the first rung counts the trees as the flip-book shows them
          const shown = i === 0 ? String(Math.max(cur + 1, 0)) : i === 2 ? V.type(str, ramp(t, 8.4, 9.4, E.lin)) : str;
          r.bar.set({ k: bk, text: shown });
          r.bar.el.style.transform = `translateX(${dx.toFixed(2)}px)`;
        });
      };
    },
  });
})();
