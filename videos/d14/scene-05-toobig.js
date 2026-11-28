/* Lecture 14 (ds-14) · scene 5 (WHY IT MATTERS): real data is sparse, and storing every zero of a big matrix is impossible
   (lesson 14.3). Data from D14.BIG. Colours: grey the members, links, sensor and plain labels, blue the one non-zero reading,
   red the full n × n store, green the non-zeros-only store.
   Story (local seconds): 0.5 six grey member circles A to F, 0.9-2.9 five links draw one by one, "5 links of 15 possible";
   3.4 a fault sensor and its strip of ten readings, one blue 1 among the 0s, "almost always 0"; 5.8 both slide up and away, a
   red square "every cell: n × n numbers" grows, with "n ≈ 1,000,000" and "a million million cells, 64-bit each"; 8.0 a grey
   arrow to a small green box "non-zeros only: about n entries". Hold to 11. */
(function () {
  const V = window.VID;
  const D14 = V.d14;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const B = D14.BIG;
  const P = [
    [60, 40],
    [150, 25],
    [250, 45],
    [300, 110],
    [190, 120],
    [80, 115],
  ].map(([x, y]) => ({ x: 20 + x * 1.4, y: 34 + y * 1.7 }));
  const READ = [0, 0, 0, 0, 0, 0, 1, 0, 0, 0];
  const big = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  D14.same("too big: n", big(B.n), "1,000,000");

  V.scene({
    kicker: "WHY IT MATTERS",
    title: ["Real data is full of gaps,", "and too big to write out"],
    dur: 11,
    caps: [
      [0.4, 3.2, `A social graph: ${B.links.length} links out of ${B.possible} possible.`],
      [3.4, 5.6, "Fault sensors report 0 almost all the time."],
      [5.8, 7.8, "n ≈ a million: a million million cells. Too big to store."],
      [8.0, 10.7, "Keep only the non-zeros instead."],
    ],
    build(stage) {
      const A = V.h("div", {
        style: { position: "absolute", left: "0px", top: "0px", width: "936px", height: "640px" },
      });
      stage.append(A);
      const svgA = D4.svg(A);
      const wires = B.links.map(([a, b]) => D4.wire(svgA, { pts: [P[a], P[b]], tone: "grey", w: 6 }));
      const nodes = P.map((p, i) =>
        D4.disc(A, { x: p.x, y: p.y, size: 66, text: String.fromCharCode(65 + i), tone: "grey", fs: 30 }),
      );
      const linksLab = D4.label(A, {
        x: 240,
        y: 330,
        text: `${B.links.length} links of ${B.possible} possible`,
        fs: 30,
      });
      // the fault sensor: a box with a dial
      const G = D14.tone("grey");
      const sensor = V.s(
        "g",
        {},
        V.s("rect", { x: 650, y: 40, width: 100, height: 76, rx: 14, fill: G.dim, stroke: G.lip, "stroke-width": 4 }),
        V.s("circle", { cx: 700, cy: 80, r: 24, fill: "var(--panel)", stroke: G.lip, "stroke-width": 4 }),
        V.s("line", { x1: 700, y1: 80, x2: 684, y2: 66, stroke: G.lip, "stroke-width": 5, "stroke-linecap": "round" }),
      );
      svgA.append(sensor);
      const sensorLab = D4.label(A, { x: 700, y: 150, text: "fault sensor", fs: 28 });
      const strip = D4.chips(A, {
        x: 493,
        y: 190,
        n: READ.length,
        w: 36,
        h: 50,
        gap: 6,
        fs: 28,
        texts: READ.map(String),
      });
      const alwaysLab = D4.label(A, { x: 700, y: 282, text: "almost always 0", fs: 30 });

      const square = D4.card(stage, {
        x: 70,
        y: 120,
        w: 320,
        h: 320,
        tone: "red",
        plain: false,
        fs: 32,
        text: "every cell: n × n numbers",
      });
      square.el.style.padding = "24px";
      const nTag = D4.tag(stage, { x: 230, y: 488, text: `n ≈ ${big(B.n)}`, tone: "red", solid: true, fs: 30 });
      const cellsLab = D4.label(stage, {
        x: 468,
        y: 566,
        text: "a million million cells, 64-bit each",
        tone: "red",
        fs: 30,
      });
      const svgB = D4.svg(stage);
      const arrow = L5.arrow(410, 280, 580, 280, "grey", 1, { w: 7, head: 22 });
      svgB.append(arrow);
      const small = D4.card(stage, {
        x: 600,
        y: 210,
        w: 310,
        h: 140,
        tone: "green",
        plain: false,
        fs: 30,
        text: "non-zeros only: about n entries",
      });
      small.el.style.padding = "16px";

      return (t) => {
        const out = ramp(t, 5.8, 6.3, E.inOut);
        V.place(A, { y: -50 * out, o: 1 - out });
        nodes.forEach((n, i) => n.set({ k: D14.seq(t, 0.5, 0.06, 0.35, i), solid: false }));
        wires.forEach((w, i) => w.set({ k: ramp(t, 0.9 + 0.4 * i, 1.25 + 0.4 * i, E.inOut) }));
        linksLab.set({ k: ramp(t, 2.9, 3.2, E.lin) });
        V.show(sensor, ramp(t, 3.4, 3.7, E.lin));
        sensorLab.set({ k: ramp(t, 3.5, 3.8, E.lin) });
        strip.all((i) => {
          const k = D14.seq(t, 3.6, 0.12, 0.25, i);
          return { ...D14.cellSt(READ[i]), o: k, s: 0.8 + 0.2 * E.pop(k) };
        });
        alwaysLab.set({ k: ramp(t, 4.9, 5.2, E.lin) });
        const ks = ramp(t, 6.0, 6.9, E.out);
        square.set({ k: ramp(t, 6.0, 6.2, E.lin), s: 0.25 + 0.75 * ks });
        nTag.set({ k: ramp(t, 6.6, 7.0, E.lin) });
        cellsLab.set({ k: ramp(t, 7.0, 7.3, E.lin), s: 1 + 0.06 * flash(t, 7.2, 7.6) });
        L5.drawOn(arrow, ramp(t, 8.0, 8.5));
        small.set({ k: ramp(t, 8.4, 8.8, E.lin) });
      };
    },
  });
})();
