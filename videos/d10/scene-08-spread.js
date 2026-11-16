/* Lecture 10 (ds-10) · scene 8 (DDM): the error rate p and its spread s on a number line.
   Story (local seconds):
     0.3-1.6 the error strip draws records 1..100 (every 10th one wrong), the grey count tag counts up to '100 records ·
             10 errors'.
     1.8-2.6 the number line (0 .. 0.3) and the blue p mark 'p = 0.1' pop.
     3.0-3.8 the blue band p ± s opens (s = √(p (1 − p) ÷ n) = 0.03 at 100 records), the 's = 0.03' tag pops.
     4.0-4.4 the blue p + s dot and its tag 'p + s = 0.13' pop.
     4.4-6.2 the strip grows to 400 records (in steps of 10 records, so p stays exactly 0.1); the band, the dot and both tags
             follow s(n) live and read 's = 0.015', 'p + s = 0.115' at the end.
     7.6-8.2 the p + s dot and its tag get a blue ring / bump: the value DDM watches. Hold to 10.
   Numbers from D10.SPREAD (p, xs, rows for 100 and 400 records); s(n) and the error count come from the same xs. */
(function () {
  const V = window.VID;
  const D10 = V.d10;
  const D4 = V.d4;
  const { ramp, flash, lerp, ease: E } = V;
  const T = D4.tone;
  const fm = D10.fm;
  const f1 = (n) => n.toFixed(1);

  const S = D10.SPREAD;
  const [R1, R2] = S.rows;
  const errs = (n) => S.xs.slice(0, n).reduce((a, b) => a + b, 0);
  const sOf = (n) => Math.sqrt((S.p * (1 - S.p)) / n);
  D10.same(
    "s8: 100 -> 400 records (×4), s halves, errors 10 and 40",
    [R2.n / R1.n, +(R2.s / R1.s).toFixed(9), errs(R1.n), errs(R2.n), R1.e, R2.e],
    [4, 0.5, 10, 40, 10, 40],
  );
  D10.close("s8: s(n) matches the rows", [sOf(R1.n), sOf(R2.n)], [R1.s, R2.s], 1e-12);
  const recTxt = (n) => `${n} records · ${errs(n)} errors`;
  const q = (S.p * (1 - S.p)).toFixed(2); // 0.09
  D10.same("s8: p (1 − p)", [fm(1 - S.p), q], ["0.9", "0.09"]);

  const AX = { x0: 120, x1: 840, y: 410, v1: 0.3 };
  const vx = (v) => AX.x0 + ((AX.x1 - AX.x0) * v) / AX.v1;
  const GROW = [4.4, 6.2];

  V.scene({
    kicker: "DDM",
    title: ["The error rate", "and its spread"],
    dur: 10,
    caps: [
      [0.4, 1.8, `DDM reads the errors: ${R1.n} records, ${R1.e} of them wrong.`],
      [2, 3.4, `Error rate p = ${R1.e} ÷ ${R1.n} = ${fm(S.p)}.`],
      [3.6, 5.2, `Spread s = √(${fm(S.p)} × ${fm(1 - S.p)} ÷ ${R1.n}) = ${fm(R1.s, 3)}.`],
      [6.2, 7.4, `${R2.n / R1.n === 4 ? "Four" : R2.n / R1.n} times the records: s halves to ${fm(R2.s, 3)}.`],
      [7.6, 9.8, "DDM watches p + s: the error rate plus its spread."],
    ],
    build(stage) {
      const B = T("blue");
      const G = T("grey");
      const svg = D4.svg(stage);
      const strip = D10.strip(svg, { x0: 40, x1: 896, r0: 0, r1: R2.n, y: 60, h: 50 });
      const count = D4.tag(stage, { x: 468, y: 160, text: recTxt(0), tone: "grey", fs: 30 });

      // the number line
      const axis = svg.appendChild(V.s("g", {}));
      axis.appendChild(
        V.s("line", {
          x1: AX.x0,
          x2: AX.x1,
          y1: AX.y,
          y2: AX.y,
          stroke: G.c,
          "stroke-width": 5,
          "stroke-linecap": "round",
        }),
      );
      const tickLabs = [0, 0.1, 0.2, 0.3].map((v) => {
        axis.appendChild(
          V.s("line", {
            x1: f1(vx(v)),
            x2: f1(vx(v)),
            y1: AX.y - 10,
            y2: AX.y + 10,
            stroke: G.c,
            "stroke-width": 4,
            "stroke-linecap": "round",
          }),
        );
        return D4.label(stage, { x: vx(v), y: 462, text: fm(v), tone: "grey", fs: 28 });
      });

      // the band p ± s (drawn under the p mark)
      const band = svg.appendChild(
        V.s("rect", { y: 376, height: 46, rx: 10, fill: B.dim, stroke: B.c, "stroke-width": 3 }),
      );
      const pLine = svg.appendChild(
        V.s("line", {
          x1: f1(vx(S.p)),
          x2: f1(vx(S.p)),
          y1: 360,
          y2: 430,
          stroke: B.c,
          "stroke-width": 6,
          "stroke-linecap": "round",
        }),
      );
      const pLab = D4.label(stage, { x: vx(S.p), y: 330, text: `p = ${fm(S.p)}`, tone: "blue", fs: 30 });
      const ring = svg.appendChild(V.s("circle", { cy: 399, r: 24, fill: "none", stroke: B.c, "stroke-width": 5 }));
      const dot = svg.appendChild(V.s("circle", { cy: 399, r: 12, fill: B.c, stroke: B.lip, "stroke-width": 3 }));
      const sTag = D4.tag(stage, { x: 760, y: 300, text: "", tone: "blue", fs: 30 });
      const psTag = D4.tag(stage, { text: "", tone: "blue", fs: 30 });

      return (t) => {
        // records shown: 0 -> 100 freely, then 100 -> 400 in whole tens (so p = e ÷ n stays exactly 0.1)
        const n1 = Math.floor(lerp(0, R1.n, ramp(t, 0.3, 1.6, E.lin)));
        const g = ramp(t, GROW[0], GROW[1], E.inOut);
        const n = t < GROW[0] ? n1 : 10 * Math.floor(lerp(R1.n, R2.n, g) / 10);
        strip.set({ xs: S.xs, to: n });
        count.set({ text: recTxt(n), k: ramp(t, 0.3, 0.7, E.out) });

        const ka = ramp(t, 1.8, 2.3, E.out);
        V.show(axis, ka);
        tickLabs.forEach((l) => l.set({ k: ka }));
        const kp = ramp(t, 2.0, 2.6, E.out);
        V.show(pLine, kp);
        pLab.set({ k: kp });

        const s = sOf(Math.max(n, 1));
        const kb = ramp(t, 3.0, 3.8, E.out);
        const half = (vx(s) - vx(0)) * kb;
        band.setAttribute("x", f1(vx(S.p) - half));
        band.setAttribute("width", f1(2 * half));
        V.show(band, kb > 0 ? 1 : 0);
        sTag.set({ text: `s = ${fm(s, 3)}`, k: ramp(t, 3.3, 3.8, E.out) });

        const kd = ramp(t, 4.0, 4.4, E.out);
        const dx = vx(S.p + s);
        const bump = flash(t, 7.6, 8.2);
        dot.setAttribute("cx", f1(dx));
        V.place(dot, { s: (0.5 + 0.5 * E.pop(kd)) * (1 + 0.25 * bump), o: kd });
        ring.setAttribute("cx", f1(dx));
        const kr = ramp(t, 7.6, 8.0, E.out);
        V.show(ring, kr);
        psTag.set({ text: `p + s = ${fm(S.p + s, 3)}`, x: dx, y: 520, k: kd, s: 1 + 0.15 * bump, solid: t >= 7.8 });
      };
    },
  });
})();
