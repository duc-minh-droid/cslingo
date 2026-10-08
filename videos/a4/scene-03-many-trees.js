/* Phase 4 · scene 03-many-trees: the five towns have 21 spanning trees. A flip-book shows each tree and drops one dot per tree onto a
   cost line (totals 11 to 22); the cheapest is the minimum spanning tree. Then the count explodes (21, 452, 262,144,... trees). */
(function () {
  const V = window.VID;
  const A4 = V.a4;
  const L5 = V.l5;
  const { ramp, flash, clamp, ease: E } = V;

  // ---------- data (all from the real enumeration in common.js) ----------
  const ORDER = A4.FLIP.map((i) => A4.TREES[i]); // the 21 trees in flip-book order
  const MST = A4.MST;
  A4.same("flip: first, last", [ORDER[0].name, ORDER.at(-1).keys.slice().sort(), ORDER.at(-1).total], [
    "AB BC BD DE",
    MST.keys,
    MST.total,
  ]);
  const start = (j) => (j < 3 ? 1.0 + 0.5 * j : 2.5 + 0.15 * (j - 3)); // flip-book: slow for three, then quick
  const DROP = 0.25;
  const X0 = 404; // cost line: x(v) = 404 + (v - 11) * 44
  const xOf = (v) => X0 + (v - 11) * 44;
  const AXIS_Y = 226;
  // a dot sits on the stack of the dots with the same total that were dropped before it
  const seen = {};
  const DOTS = ORDER.map((tr) => {
    const row = (seen[tr.total] = (seen[tr.total] || 0) + 1) - 1;
    return { x: xOf(tr.total), y: 207 - 34 * row, row };
  });
  A4.same("stack heights", Math.max(...DOTS.map((d) => d.row)) + 1, 3);
  A4.same("rightmost tick", xOf(22) < 906, true);
  const COUNTS = A4.COUNTS;
  const ROW_Y = [380, 450, 520];
  const ROW_AT = [6.7, 7.5, 8.3];
  const ROW_LAB = ["5 towns", "8 towns", "20 towns"];
  const ROW_TONE = ["blue", "blue", "red"];
  const barW = (text) => Math.min(744, 110 + 26 * text.replace(/,/g, "").length);

  V.scene({
    kicker: "THE GOAL",
    title: ["Many spanning trees,", "one is cheapest"],
    dur: 11,
    caps: [
      [0.4, 2.9, "The same five towns have 21 different spanning trees."],
      [3.0, 5.3, "Each one has its own total cost."],
      [5.4, 6.9, "The cheapest is the minimum spanning tree."],
      [7.0, 10.6, "Bigger networks have far too many trees to try them all."],
    ],
    build(stage) {
      // small network (no pills) and the running total of the tree on show
      const g = A4.net(stage, { x: 14, y: 24, s: 0.52, pills: false });
      const tot = A4.total(stage, { x: 40, y: 270, w: 260, h: 80, label: "total", tone: "blue" });

      // plot card: axis, ticks, labels
      const card = V.h("div", {
        class: "v-card plain c-grey",
        style: { left: "372px", top: "14px", width: "552px", height: "300px" },
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
      svgAxis.append(axis(390, AXIS_Y, 906, AXIS_Y));
      for (let v = 11; v <= 22; v++) svgAxis.append(axis(xOf(v), AXIS_Y, xOf(v), AXIS_Y + 10));
      const text = (str, x, y, centred) =>
        stage.appendChild(
          V.h("div", {
            class: "v-text dim",
            text: str,
            style: { left: `${x}px`, top: `${y}px`, ...(centred ? { transform: "translateX(-50%)" } : {}) },
          }),
        );
      const plotBits = [
        text("one dot = one tree", 392, 26),
        ...[11, 14, 17, 20, 22].map((v) => text(String(v), xOf(v), 238, true)),
        text("total cost", 646, 272, true),
      ];
      // one dot per tree
      const dots = DOTS.map(() => A4.token(stage, { tone: "blue", size: 30 }));
      // 'cheapest' tag and arrow to the 11 dot
      const cheap = A4.tag(stage, { x: 380, y: 70, text: "cheapest", tone: "green", solid: true });
      const svgTop = L5.svg(stage);
      const arrow = svgTop.appendChild(L5.arrow(X0, 122, X0, 186, "green", 1, { w: 7, head: 22 }));
      // ladder: how many spanning trees?
      const head = A4.tag(stage, { x: 372, y: 324, text: "how many spanning trees?" });
      const rows = COUNTS.map((c, r) => ({
        label: stage.appendChild(
          V.h("div", { class: "v-text dim", text: ROW_LAB[r], style: { left: "0px", top: `${ROW_Y[r] + 8}px` } }),
        ),
        bar: A4.bar(stage, { x: 180, y: ROW_Y[r], w: barW(c.text), h: 56, fs: 34, tone: ROW_TONE[r], text: c.text }),
      }));
      const note = text("every pair of towns linked", 180, 584);

      return (t) => {
        // ----- the flip-book: which tree is on show -----
        let cur = -1;
        ORDER.forEach((_, j) => {
          if (t >= start(j)) cur = j;
        });
        const green = ramp(t, 5.4, 5.8);
        const isMst = t >= 5.4;
        const tree = cur >= 0 ? ORDER[cur] : null;

        // ----- the small network -----
        const netK = ramp(t, 0.2, 0.9);
        const edgeSt = {};
        if (tree)
          tree.keys.forEach((k) => {
            edgeSt[k] = isMst
              ? { tone: "green", w: 1.4, halo: green, o: netK }
              : { tone: "blue", w: 1.3, o: netK };
          });
        const dimK = isMst ? 1 - 0.5 * ramp(t, 5.4, 5.8) : 0.5;
        const towns = {};
        A4.TOWNS.forEach((c, i) => {
          const k = ramp(t, 0.2 + 0.08 * i, 0.7 + 0.08 * i);
          const base = { s: 0.6 + 0.4 * E.pop(k), o: Math.min(1, k * 4) };
          if (isMst) {
            const a = 5.4 + 0.06 * i;
            towns[c] = { ...base, tone: "green", solid: t >= a, s: base.s * (1 + 0.15 * flash(t, a, a + 0.3)) };
          } else towns[c] = base;
        });
        g.update({ edges: edgeSt, towns, base: { edge: { o: dimK * netK } } });

        // ----- the total -----
        tot.set({
          text: tree ? String(tree.total) : "0",
          tone: isMst ? "green" : "blue",
          solid: isMst,
          k: ramp(t, 0.5, 0.9),
          bump: isMst ? flash(t, 5.4, 5.9) : cur >= 0 && cur < 3 ? 0.6 * flash(t, start(cur), start(cur) + 0.3) : 0,
        });

        // ----- the plot card -----
        const pk = ramp(t, 0.3, 0.9);
        V.place(card, { s: 0.9 + 0.1 * pk, o: pk });
        V.show(svgAxis, pk);
        plotBits.forEach((e) => V.show(e, pk));
        dots.forEach((dot, j) => {
          const k = ramp(t, start(j), start(j) + DROP);
          const mst = j === ORDER.length - 1;
          const pop = mst ? ramp(t, 5.4, 6.0, E.lin) : 0;
          dot.set({
            x: DOTS[j].x,
            y: DOTS[j].y - 50 * (1 - k),
            s: mst ? 1 + 0.3 * E.pop(pop) : 1,
            o: Math.min(1, k * 4) * (mst ? 1 : 1 - 0.45 * green),
            tone: mst && t >= 5.4 ? "green" : "blue",
          });
        });
        cheap.set({ k: ramp(t, 5.6, 6.0) });
        L5.drawOn(arrow, ramp(t, 5.7, 6.1, E.lin));

        // ----- the ladder -----
        head.set({ k: ramp(t, 6.6, 7.0) });
        rows.forEach((r, i) => {
          const a = ROW_AT[i];
          const lk = ramp(t, a, a + 0.3);
          V.place(r.label, { y: (1 - lk) * 8, o: lk });
          const bk = i < 2 ? ramp(t, a, a + 0.4) : ramp(t, 8.3, 8.9);
          const str = COUNTS[i].text;
          const shake = i === 2 ? ramp(t, 9.5, 10.0, E.lin) : 0;
          const dx = shake > 0 && shake < 1 ? 6 * Math.sin(shake * Math.PI * 6) * (1 - shake) : 0;
          r.bar.set({ k: bk, text: i === 2 ? V.type(str, ramp(t, 8.4, 9.4, E.lin)) : str });
          r.bar.el.style.transform = `translateX(${dx.toFixed(2)}px)`;
        });
        V.place(note, { y: (1 - ramp(t, 8.3, 8.7)) * 8, o: ramp(t, 8.3, 8.7) * clamp(1) });
      };
    },
  });
})();
