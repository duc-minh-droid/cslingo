/* Lecture 15 (ds-15) · scene 3 (COUNTING SUMS): one sum on decimal numbers is a floating-point operation; FLOPS counts them
   per second; the giga, tera, peta, exa ladder (each rung 1000 × the last, D15.LAD); where devices sit (D15.DEV, log scale).
   Story (local seconds): 0.3 three blue operation chips; 3.2 the chips flash one after another, faster and faster, and the
   green counter counts every flash; 5.8 the four rungs climb (one every 0.5 s) with × 1000 tags; 8.9 the ladder fades and five
   blue bars grow on a log scale (one every 0.4 s), the H100 bar is longest and gets a green ring. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D15 = V.d15;
  const { ramp, flash, clamp, ease: E } = V;
  const T = D15.tone;
  const LAD = D15.LAD;
  const DEV = D15.DEV;
  const SUP = { 9: "⁹", 12: "¹²", 15: "¹⁵", 18: "¹⁸" };
  const TFL = (v) => v / 1000;
  D15.same("server CPU caption", [TFL(DEV[2].lo), TFL(DEV[2].hi), TFL(DEV[4].lo)], [1, 2, 1000]);

  // flashes of the three operations from 3.3 to 5.5, each gap 0.8 × the one before (counted, never typed)
  const FL = [];
  for (let t = 3.3, gap = 0.36; t < 5.5; t += gap, gap = Math.max(0.1, gap * 0.8)) FL.push(t);

  V.scene({
    kicker: "COUNTING SUMS",
    title: ["Speed is counted", "in sums per second"],
    dur: 13,
    caps: [
      [0.4, 3.0, "One sum on decimal numbers is a floating-point operation."],
      [3.2, 5.6, "FLOPS: how many of them a machine does per second."],
      [5.8, 8.6, `Giga, tera, peta, exa: each rung is ${D15.step[0]} times the last.`],
      [
        8.9,
        12.7,
        `A server CPU: ${TFL(DEV[2].lo)} to ${TFL(DEV[2].hi)} TFLOPS. A data-centre GPU: over ${TFL(DEV[4].lo)}.`,
      ],
    ],
    build(stage) {
      const ops = ["3.14 × 2.72", "0.5 + 1.25", "9.81 ÷ 2.0"].map((s, i) =>
        D15.box(stage, {
          x: 12 + i * 312,
          y: 90,
          w: 288,
          h: 160,
          title: s,
          sub: "one operation",
          tone: "blue",
          fs: 38,
        }),
      );
      const count = D4.disc(stage, { x: 468, y: 370, size: 110, text: "0", tone: "green", fs: 46 });
      const cLab = D4.label(stage, { x: 468, y: 480, text: "operations per second = FLOPS", tone: "green", fs: 34 });

      const RX = (i) => 12 + i * 218;
      const RY = (i) => 500 - i * 140;
      const rungs = LAD.map((r, i) =>
        D15.box(stage, {
          x: RX(i),
          y: RY(i),
          w: 260,
          h: 100,
          title: r.name,
          sub: `${r.short} = 10${SUP[r.exp]}`,
          tone: "blue",
          fs: 28,
        }),
      );
      const times = LAD.slice(1).map((_, i) =>
        D4.tag(stage, { x: RX(i + 1) - 84, y: RY(i + 1) + 50, text: `× ${D15.step[i]}`, tone: "grey" }),
      );

      // device bars on a log scale (GFLOPS): 10 G at the axis start, 1 P (10^6 G) at x 700
      const X = (v) => 300 + ((Math.log10(v) - 1) / 5) * 400;
      const rowY = (i) => 30 + i * 100;
      const svg = D4.svg(stage);
      const axis = V.s("g", {});
      axis.append(V.s("line", { x1: 300, y1: 528, x2: 760, y2: 528, stroke: T("grey").c, "stroke-width": 4 }));
      [
        [10, "10 G"],
        [1000, "1 T"],
        [1000000, "1 P"],
      ].forEach(([v, s]) =>
        axis.append(
          V.s("line", { x1: X(v), y1: 520, x2: X(v), y2: 538, stroke: T("grey").c, "stroke-width": 4 }),
          V.s("text", {
            x: X(v),
            y: 572,
            "text-anchor": "middle",
            text: s,
            style: { font: "800 28px var(--sans)", fill: "var(--text-dim)" },
          }),
        ),
      );
      axis.append(
        V.s("text", {
          x: 924,
          y: 572,
          "text-anchor": "end",
          text: "log scale",
          style: { font: "800 28px var(--sans)", fill: "var(--text-dim)" },
        }),
      );
      svg.append(axis);
      const names = DEV.map((d, i) => D4.label(stage, { x: 286, y: rowY(i) + 28, text: d.name, anchor: "r", fs: 28 }));
      const bars = DEV.map((d, i) =>
        D15.box(stage, { x: 300, y: rowY(i), w: X(d.hi) - 300, h: 56, title: "", tone: "blue", solid: true, r: 14 }),
      );
      bars.forEach((b) => (b.el.style.transformOrigin = "0 50%"));
      const vals = DEV.map((d, i) =>
        D4.label(stage, { x: X(d.hi) + 16, y: rowY(i) + 28, text: d.text, anchor: "l", fs: 28 }),
      );

      return (t) => {
        // operations and the counter
        const outA = 1 - ramp(t, 5.6, 5.9, E.lin);
        const n = FL.filter((f) => t >= f).length;
        ops.forEach((o, i) => {
          const fl = FL.reduce((s, f, j) => s + (j % 3 === i ? flash(t, f, f + 0.22) : 0), 0);
          o.set({ k: D15.seq(t, 0.3, 0.25, 0.4, i), o: outA, solid: fl > 0.3, s: 1 + 0.08 * fl });
        });
        count.set({
          k: ramp(t, 3.2, 3.5) * outA,
          text: String(n),
          s: 1 + 0.06 * (n ? flash(t, FL[n - 1], FL[n - 1] + 0.2) : 0),
        });
        cLab.set({ k: ramp(t, 3.4, 3.8), o: outA });

        // the ladder
        const outB = 1 - ramp(t, 8.6, 8.9, E.lin);
        rungs.forEach((r, i) => r.set({ k: ramp(t, 5.9 + 0.5 * i, 6.3 + 0.5 * i), o: outB }));
        times.forEach((g, i) => g.set({ k: ramp(t, 6.3 + 0.5 * i, 6.6 + 0.5 * i), o: outB }));

        // device bars
        const kC = ramp(t, 8.9, 9.3, E.lin);
        V.show(axis, kC);
        DEV.forEach((d, i) => {
          const kb = clamp(ramp(t, 9.2 + 0.4 * i, 9.7 + 0.4 * i, E.out));
          names[i].set({ k: ramp(t, 9.0 + 0.4 * i, 9.3 + 0.4 * i) });
          bars[i].set({ k: kb > 0 ? 1 : 0, ring: i === 4 && t >= 11.6 ? "green" : "" });
          bars[i].el.style.transform += ` scaleX(${kb.toFixed(3)})`;
          vals[i].set({ k: ramp(t, 9.6 + 0.4 * i, 9.9 + 0.4 * i) });
        });
      };
    },
  });
})();
